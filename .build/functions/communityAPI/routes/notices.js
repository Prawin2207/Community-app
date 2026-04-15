'use strict';
const { Router } = require('express');
const router = Router();
const { scopedQuery, insert, update, remove, getRow, auditLog } = require('../db/catalystDb');
const { requireAdmin, communityOwnershipCheck, ROLES } = require('../middleware/community');
const TABLES = require('../db/tables');

/**
 * GET /notices
 * All roles can read notices.
 * Filtering by audience: admins see all, residents see 'all' + their block
 */
router.get('/', async (req, res) => {
    try {
        const { blockId } = req.query;
        let conditions = '';
        if (category) conditions = `category = '${category}'`;

        const data = await find(req, TABLE, {
            conditions,
            page: parseInt(page),
            limit: parseInt(limit),
            sortBy,
            order
        });

        res.json({ data });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch notices', details: err.message });
    }
});

/**
 * GET /notices/:id
 */
router.get('/:id', async (req, res) => {
    try {
        const row = await getRow(req, TABLE, req.params.id);
        if (!row) return res.status(404).json({ error: 'Notice not found.' });
        res.json({ data: row });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /notices — Create notice (Admin only)
 */
router.post('/', requireAdmin, async (req, res) => {
    try {
        const { title, content, category, expiresAt, priority = 'normal' } = req.body;
        if (!title || !content) return res.status(400).json({ error: 'title and content are required' });

        const data = await insert(req, TABLE, {
            title,
            content,
            category: category || 'General',
            expiresAt: expiresAt ? new Date(expiresAt).toISOString() : '',
            priority
        });

        auditLog(req, { action: 'CREATE_NOTICE', entityType: 'Notice', entityId: data.ROWID });
        res.status(201).json({ data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * PATCH /notices/:id
 */
router.patch('/:id', requireAdmin, async (req, res) => {
    try {
        const row = await getRow(req, TABLE, req.params.id);
        if (!row) return res.status(404).json({ error: 'Notice not found.' });

        const { title, content, category, expiresAt, priority } = req.body;
        const updateData = { ROWID: req.params.id };

        if (title) updateData.title = title;
        if (content) updateData.content = content;
        if (category) updateData.category = category;
        if (expiresAt) updateData.expiresAt = new Date(expiresAt).toISOString();
        if (priority) updateData.priority = priority;

        const updated = await update(req, TABLE, updateData);
        res.json({ data: updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * DELETE /notices/:id — SOFT DELETE
 */
router.delete('/:id', requireAdmin, async (req, res) => {
    try {
        const row = await getRow(req, TABLE, req.params.id);
        if (!row) return res.status(404).json({ error: 'Notice not found.' });

        await softRemove(req, TABLE, req.params.id);
        res.json({ success: true, message: 'Notice soft-deleted.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
