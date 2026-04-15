'use strict';

const { Router } = require('express');
const router = Router();
const { find, insert, update, getRow, softRemove, validateRelation, auditLog } = require('../db/catalystDb');
const TABLES = require('../db/tables');
const { requireSecurity, ROLES } = require('../middleware/community');

const TABLE = TABLES.GATE_PASSES;

/**
 * GET /gate-passes — list all (SaaS isolation)
 */
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 20, status, sortBy = 'createdAt', order = 'DESC' } = req.query;
        let conditions = '';

        if ([ROLES.OWNER, ROLES.TENANT, ROLES.FAMILY_MEMBER].includes(req.role)) {
            if (!req.userRecord.flatId) return res.json({ data: [] });
            conditions = `flatId = ${req.userRecord.flatId}`;
        }

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
        res.status(500).json({ error: 'Failed to fetch gate passes', details: err.message });
    }
});

/**
 * GET /gate-passes/:id
 */
router.get('/:id', async (req, res) => {
    try {
        const row = await getRow(req, TABLE, req.params.id);
        if (!row) return res.status(404).json({ error: 'Gate pass not found.' });
        res.json({ data: row });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /gate-passes — Relational creation
 */
router.post('/', async (req, res) => {
    try {
        const { visitorName, flatId, type, validUntil } = req.body;
        if (!visitorName || !flatId) {
            return res.status(400).json({ error: 'visitorName and flatId are required' });
        }

        // Validate Flat
        if (!(await validateRelation(req, TABLES.FLATS, flatId))) {
            return res.status(400).json({ error: 'Invalid or inaccessible flatId.' });
        }

        const data = await insert(req, TABLE, {
            visitorName,
            flatId:      flatId.toString(),
            type:        type || 'One-time',
            status:      'active',
            passCode:    Math.floor(100000 + Math.random() * 900000).toString(),
            validUntil:  validUntil ? new Date(validUntil).toISOString() : '',
            issuedAt:    new Date().toISOString()
        });

        auditLog(req, { action: 'ISSUE_GATE_PASS', entityType: 'GatePass', entityId: data.ROWID });
        res.status(201).json({ data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * PATCH /gate-passes/:id — Standard update
 */
router.patch('/:id', async (req, res) => {
    try {
        const row = await getRow(req, TABLE, req.params.id);
        if (!row) return res.status(404).json({ error: 'Gate pass not found.' });

        const { status, validUntil } = req.body;
        const updateData = { ROWID: req.params.id };

        if (status) updateData.status = status;
        if (validUntil) updateData.validUntil = new Date(validUntil).toISOString();

        const updated = await update(req, TABLE, updateData);
        res.json({ data: updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * DELETE /gate-passes/:id — SOFT DELETE
 */
router.delete('/:id', async (req, res) => {
    try {
        const row = await getRow(req, TABLE, req.params.id);
        if (!row) return res.status(404).json({ error: 'Gate pass not found.' });

        await softRemove(req, TABLE, req.params.id);
        res.json({ success: true, message: 'Gate pass soft-deleted.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
