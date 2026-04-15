'use strict';

const { Router } = require('express');
const router = Router();
const { find, insert, update, getRow, softRemove, validateRelation, auditLog } = require('../db/catalystDb');
const TABLES = require('../db/tables');
const { requireAdmin } = require('../middleware/community');

const TABLE = TABLES.USERS || 'Users';

/**
 * GET /users — list all users in community
 */
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 50, role, sortBy = 'name', order = 'ASC' } = req.query;
        let conditions = '';
        if (role) conditions = `role = '${role}'`;

        const data = await find(req, TABLE, {
            conditions,
            page: parseInt(page),
            limit: parseInt(limit),
            sortBy,
            order
        });

        res.json({ data });
    } catch (err) {
        console.error('[GET /users]', err);
        res.status(500).json({ error: 'Failed to fetch users', details: err.message });
    }
});

/**
 * GET /users/:id — fetch user by ROWID with isolation
 */
router.get('/:id', async (req, res) => {
    try {
        const row = await getRow(req, TABLE, req.params.id);
        if (!row) return res.status(404).json({ error: 'User not found or access denied.' });
        res.json({ data: row });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch user', details: err.message });
    }
});

/**
 * POST /users — CREATE user record
 */
router.post('/', requireAdmin, async (req, res) => {
    try {
        const { catalystUserId, name, email, role = 'tenant', flatId = '' } = req.body;
        if (!name || !email) {
            return res.status(400).json({ error: 'name and email are required' });
        }

        // Validate Flat if provided
        if (flatId && !(await validateRelation(req, TABLES.FLATS, flatId))) {
            return res.status(400).json({ error: 'Invalid or inaccessible flatId.' });
        }

        const insertData = { 
            name, 
            email, 
            role, 
            flatId: flatId ? flatId.toString() : '',
            catalystUserId: catalystUserId ? catalystUserId.toString() : ''
        };

        const row = await insert(req, TABLE, insertData);
        auditLog(req, { action: 'CREATE_USER', entityType: 'User', entityId: row.ROWID, newValues: insertData });
        res.status(201).json({ data: row });
    } catch (err) {
        console.error('[POST /users]', err);
        res.status(500).json({ error: 'Failed to create user', details: err.message });
    }
});

/**
 * PATCH /users/:id — UPDATE
 */
router.patch('/:id', async (req, res) => {
    try {
        const existing = await getRow(req, TABLE, req.params.id);
        if (!existing) return res.status(404).json({ error: 'User not found.' });

        const { name, email, role, flatId } = req.body;
        const updateData = { ROWID: req.params.id };

        if (name)   updateData.name = name;
        if (email)  updateData.email = email;
        if (role)   updateData.role = role;
        
        if (flatId !== undefined) {
             if (flatId && !(await validateRelation(req, TABLES.FLATS, flatId))) {
                 return res.status(400).json({ error: 'Invalid flatId.' });
             }
             updateData.flatId = flatId ? flatId.toString() : '';
        }

        const row = await update(req, TABLE, updateData);
        auditLog(req, { action: 'UPDATE_USER', entityType: 'User', entityId: req.params.id, newValues: updateData });
        res.json({ data: row });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update user', details: err.message });
    }
});

/**
 * DELETE /users/:id — SOFT DELETE
 */
router.delete('/:id', requireAdmin, async (req, res) => {
    try {
        const existing = await getRow(req, TABLE, req.params.id);
        if (!existing) return res.status(404).json({ error: 'User not found.' });

        await softRemove(req, TABLE, req.params.id);
        auditLog(req, { action: 'DELETE_USER', entityType: 'User', entityId: req.params.id });
        res.json({ success: true, message: 'User soft-deleted.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
