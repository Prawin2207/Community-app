'use strict';

/**
 * catalystDb.js — Centralized data access layer for Zoho Catalyst DataStore.
 *
 * All queries go through this module so that:
 * 1. communityId scoping is enforced consistently
 * 2. Response normalization (flatten Catalyst's nested { TableName: {...} } response)
 *    is done in one place
 * 3. Error context is always consistent
 */

/**
 * Execute a raw ZCQL query string.
 * Returns a flat array of row objects.
 */
const query = async (req, zcql) => {
    const rows = await req.catalyst.zcql().executeZCQLQuery(zcql);
    return rows.map(row => {
        // Catalyst wraps each row: { TableName: { col: val, ... } }
        const key = Object.keys(row)[0];
        return (key && typeof row[key] === 'object') ? row[key] : row;
    });
};

/**
 * Query a table scoped to the current community.
 * Automatically adds `WHERE communityId = <req.communityId>` AND `isDeleted = false`.
 *
 * @param {object}  req        - Express request
 * @param {string}  tableName  - Catalyst table name
 * @param {object}  options    - { conditions, fields, orderBy, sortBy, order, page, limit }
 */
const find = async (req, tableName, options = {}) => {
    if (!req.communityId) throw new Error('communityId not set — unauthorized access blocked');

    let { 
        conditions = '', 
        fields = '*', 
        sortBy = 'createdAt', 
        order = 'DESC', 
        page = 1, 
        limit = 20 
    } = options;

    let sql = `SELECT ${fields} FROM ${tableName} WHERE communityId = '${req.communityId}' AND isDeleted = false`;
    if (conditions) sql += ` AND (${conditions})`;
    
    // Sorting
    sql += ` ORDER BY ${sortBy} ${order.toUpperCase()}`;

    // Pagination (Catalyst ZCQL uses OFFSET and LIMIT)
    if (limit > 0) {
        const offset = (page - 1) * limit;
        sql += ` LIMIT ${offset}, ${limit}`;
    }

    return query(req, sql);
};

/**
 * Validate that a record exists in a table, belongs to the community, and is not deleted.
 */
const validateRelation = async (req, tableName, rowId) => {
    if (!rowId) return false;
    const sql = `SELECT ROWID FROM ${tableName} WHERE ROWID = '${rowId}' AND communityId = '${req.communityId}' AND isDeleted = false LIMIT 1`;
    const rows = await query(req, sql);
    return rows.length > 0;
};

/**
 * Insert a row into a table.
 * Enforces boolean isDeleted and all audit fields.
 */
const insert = async (req, tableName, data) => {
    const now = new Date().toISOString();
    const enriched = {
        communityId: req.communityId?.toString(),
        createdAt: now,
        updatedAt: now,
        createdBy: req.userRecord?.ROWID?.toString(),
        isDeleted: false,
        ...data,
    };
    return req.catalyst.datastore().table(tableName).insertRow(enriched);
};

/**
 * Update a row.
 * Ensures updatedAt is set and updatedBy is tracked.
 */
const update = async (req, tableName, data) => {
    const enriched = {
        updatedAt: new Date().toISOString(),
        updatedBy: req.userRecord?.ROWID?.toString(),
        ...data,
    };
    return req.catalyst.datastore().table(tableName).updateRow(enriched);
};

/**
 * Soft delete a row.
 */
const softRemove = async (req, tableName, rowId) => {
    return update(req, tableName, {
        ROWID: rowId.toString(),
        isDeleted: true,
        deletedAt: new Date().toISOString()
    });
};

/**
 * Direct delete (Rarely used, kept for completeness).
 */
const remove = async (req, tableName, rowId) => {
    await req.catalyst.datastore().table(tableName).deleteRow(rowId.toString());
};

/**
 * Get a single row by ROWID with isolation checks.
 */
const getRow = async (req, tableName, rowId) => {
    const row = await req.catalyst.datastore().table(tableName).getRow(rowId.toString());
    if (!row) return null;
    const key = Object.keys(row)[0];
    const data = (key && typeof row[key] === 'object') ? row[key] : row;

    // Strict multi-tenant and soft-delete verification
    if (String(data.communityId) !== String(req.communityId) || data.isDeleted === true) {
        return null;
    }
    return data;
};

/**
 * Write an audit log entry (multi-tenant aware).
 */
const auditLog = (req, { action, entityType, entityId, oldValues = null, newValues = null }) => {
    const entry = {
        communityId:  req.communityId?.toString() || '',
        userId:       req.userRecord?.ROWID?.toString() || '',
        action,
        entityType,
        entityId:     entityId?.toString() || '',
        oldValues:    oldValues ? JSON.stringify(oldValues) : '',
        newValues:    newValues ? JSON.stringify(newValues) : '',
        createdAt:    new Date().toISOString(),
        isDeleted:    false
    };
    req.catalyst.datastore().table('AuditLogs').insertRow(entry).catch(e => {
        console.warn('[auditLog] Failed to write audit entry:', e.message);
    });
};

module.exports = { 
    query, 
    find, 
    insert, 
    update, 
    softRemove, 
    remove, 
    getRow, 
    validateRelation, 
    auditLog 
};
