'use strict';

const { Router } = require('express');
const router = Router();
const { find, insert, update, getRow, softRemove, auditLog } = require('../db/catalystDb');
const TABLES = require('../db/tables');
const { requireAdmin } = require('../middleware/community');

const TABLE = TABLES.STAFF;

/**
 * GET /staff — list all in community
 */
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 50, role, status, sortBy = 'name', order = 'ASC' } = req.query;
        let conditions = '';

        if (role)   conditions = `role = '${role}'`;
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
        res.status(500).json({ error: 'Failed to fetch staff', details: err.message });
    }
});

/**
 * GET /staff/:id
 */
router.get('/:id', async (req, res) => {
    try {
        const row = await getRow(req, TABLE, req.params.id);
        if (!row) return res.status(404).json({ error: 'Staff not found.' });
        res.json({ data: row });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /staff — CREATE
 */
router.post('/', requireAdmin, async (req, res) => {
    try {
        const { name, email, phone, role, status, joinDate, shift } = req.body;
        if (!name || !role) return res.status(400).json({ error: 'name and role are required' });

        const insertData = {
            name,
            email: email || '',
            phone: phone || '',
            role,
            status: status || 'active',
            joinDate: joinDate ? new Date(joinDate).toISOString() : new Date().toISOString(),
            shift: shift || 'General'
        };

});

/** PATCH /staff/:id — update staff details */
router.patch('/:id', async (req, res) => {
    try {
        const { name, role, dept, shift, status, phone, performance } = req.body;
        const updateData = { ROWID: req.params.id };
        if (name) updateData.name = name;
        if (role) updateData.role = role;
        if (shift) updateData.shift = shift;
        if (status) updateData.status = status;
        if (phone) updateData.phone = phone;
        if (performance !== undefined) updateData.performance = Number(performance);

        const table = req.catalyst.datastore().table(TABLE);
        const row = await table.updateRow(updateData);
        res.json({ data: row });
    } catch (err) {
        console.error('[PATCH /staff/:id]', err);
        res.status(500).json({ error: 'Failed to update staff', details: err.message });
    }
});

/** DELETE /staff/:id — remove staff member */
router.delete('/:id', async (req, res) => {
    try {
        const table = req.catalyst.datastore().table(TABLE);
        await table.deleteRow(req.params.id);
        res.json({ success: true });
    } catch (err) {
        console.error('[DELETE /staff/:id]', err);
        res.status(500).json({ error: 'Failed to delete staff', details: err.message });
    }
});

module.exports = router;
