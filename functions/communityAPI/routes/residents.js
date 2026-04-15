'use strict';

const { Router } = require('express');
const router = Router();
const { find, insert, update, getRow, softRemove, validateRelation, auditLog } = require('../db/catalystDb');
const TABLES = require('../db/tables');
const { communityOwnershipCheck, requireAdmin } = require('../middleware/community');

const TABLE = TABLES.RESIDENTS;

/**
 * GET /residents — list all (SaaS-ready with pagination & filters)
 */
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 20, sortBy = 'createdAt', order = 'DESC', type, status } = req.query;
        
        let conditions = '';
        if (type) conditions += `type = '${type}'`;
        if (status) conditions += conditions ? ` AND status = '${status}'` : `status = '${status}'`;

        const data = await find(req, TABLE, {
            conditions,
            page: parseInt(page),
            limit: parseInt(limit),
            sortBy,
            order
        });

        res.json({ data });
    } catch (err) {
        console.error('[GET /residents]', err);
        res.status(500).json({ error: 'Failed to fetch residents', details: err.message });
    }
});

/**
 * GET /residents/:id — detail with isolation
 */
router.get('/:id', async (req, res) => {
    try {
        const row = await getRow(req, TABLE, req.params.id);
        if (!row) return res.status(404).json({ error: 'Resident not found or deleted.' });
        res.json({ data: row });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /residents — CREATE with relational validation
 */
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, flatId, userId, type, status, joinDate } = req.body;
        
        if (!name || !flatId) {
            return res.status(400).json({ error: 'Name and flatId are required' });
        }

        // 1. Validate Relations (FK Checks)
        const isFlatValid = await validateRelation(req, TABLES.FLATS, flatId);
        if (!isFlatValid) return res.status(400).json({ error: 'Invalid or inaccessible flatId provided.' });

        if (userId) {
            const isUserValid = await validateRelation(req, TABLES.USERS, userId);
            if (!isUserValid) return res.status(400).json({ error: 'Invalid or inaccessible userId provided.' });
        }

        const insertData = { 
            name, 
            email: email || '', 
            phone: phone || '', 
            flatId: flatId.toString(),
            userId: userId ? userId.toString() : '',
            type: type || 'Resident',
            status: status || 'active',
            joinDate: joinDate || new Date().toISOString()
        };

        const row = await insert(req, TABLE, insertData);
        
        auditLog(req, {
            action: 'CREATE',
            entityType: 'Resident',
            entityId: row.ROWID,
            newValues: insertData
        });

        res.status(201).json({ data: row });
    } catch (err) {
        console.error('[POST /residents]', err);
        res.status(500).json({ error: 'Failed to create resident', details: err.message });
    }
});

/**
 * PATCH /residents/:id — UPDATE with soft-delete awareness
 */
router.patch('/:id', async (req, res) => {
    try {
        const existing = await getRow(req, TABLE, req.params.id);
        if (!existing) return res.status(404).json({ error: 'Resident not found or access denied.' });

        const updateData = { ROWID: req.params.id };
        const fields = ['name', 'email', 'phone', 'flatId', 'userId', 'type', 'status', 'joinDate'];
        
        for (const f of fields) {
            if (req.body[f] !== undefined) {
                // If updating a relation, validate it
                if (f === 'flatId' && !(await validateRelation(req, TABLES.FLATS, req.body[f]))) {
                    return res.status(400).json({ error: 'Invalid flatId.' });
                }
                if (f === 'userId' && req.body[f] && !(await validateRelation(req, TABLES.USERS, req.body[f]))) {
                    return res.status(400).json({ error: 'Invalid userId.' });
                }
                updateData[f] = req.body[f].toString();
            }
        }

        const row = await update(req, TABLE, updateData);

        auditLog(req, {
            action: 'UPDATE',
            entityType: 'Resident',
            entityId: req.params.id,
            oldValues: existing,
            newValues: updateData
        });

        res.json({ data: row });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * DELETE /residents/:id — SOFT DELETE
 */
router.delete('/:id', requireAdmin, async (req, res) => {
    try {
        const existing = await getRow(req, TABLE, req.params.id);
        if (!existing) return res.status(404).json({ error: 'Resident not found.' });

        await softRemove(req, TABLE, req.params.id);

        auditLog(req, {
            action: 'DELETE',
            entityType: 'Resident',
            entityId: req.params.id,
            oldValues: existing
        });

        res.json({ message: 'Resident soft deleted successfully.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
