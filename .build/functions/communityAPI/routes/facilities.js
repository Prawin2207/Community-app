'use strict';

const { Router } = require('express');
const router = Router();
const { find, insert, update, getRow, softRemove, auditLog } = require('../db/catalystDb');
const TABLES = require('../db/tables');
const { requireAdmin } = require('../middleware/community');

const TABLE = TABLES.FACILITIES;

/**
 * GET /facilities — list all (SaaS isolation)
 */
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 50, status, sortBy = 'name', order = 'ASC' } = req.query;
        let conditions = '';
        if (status) conditions = `status = '${status}'`;

        const data = await find(req, TABLE, {
            conditions,
            page: parseInt(page),
            limit: parseInt(limit),
            sortBy,
            order
        });

        res.json({ data });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch facilities', details: err.message });
    }
});

/**
 * GET /facilities/:id
 */
router.get('/:id', async (req, res) => {
    try {
        const row = await getRow(req, TABLE, req.params.id);
        if (!row) return res.status(404).json({ error: 'Facility not found.' });
        res.json({ data: row });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /facilities — CREATE
 */
router.post('/', requireAdmin, async (req, res) => {
    try {
        const { name, type, description, capacity, status } = req.body;
        if (!name || !type) return res.status(400).json({ error: 'name and type are required' });

        const data = await insert(req, TABLE, {
            name,
            type,
            description: description || '',
            capacity: Number(capacity || 0),
            status: status || 'available'
        });

        auditLog(req, { action: 'CREATE_FACILITY', entityType: 'Facility', entityId: data.ROWID });
        res.status(201).json({ data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * PATCH /facilities/:id
 */
router.patch('/:id', requireAdmin, async (req, res) => {
    try {
        const row = await getRow(req, TABLE, req.params.id);
        if (!row) return res.status(404).json({ error: 'Facility not found.' });

        const { status, name, description, capacity } = req.body;
        const updateData = { ROWID: req.params.id };
        if (status) updateData.status = status;
        if (name) updateData.name = name;
        if (description) updateData.description = description;
        if (capacity !== undefined) updateData.capacity = Number(capacity);

        const updated = await update(req, TABLE, updateData);
        res.json({ data: updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * DELETE /facilities/:id — SOFT DELETE
 */
router.delete('/:id', requireAdmin, async (req, res) => {
    try {
        const row = await getRow(req, TABLE, req.params.id);
        if (!row) return res.status(404).json({ error: 'Facility not found.' });

        await softRemove(req, TABLE, req.params.id);
        res.json({ success: true, message: 'Facility soft-deleted.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
