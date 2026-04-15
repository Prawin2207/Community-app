'use strict';

const { Router } = require('express');
const router = Router();
const { find, insert, update, getRow, softRemove, validateRelation, auditLog } = require('../db/catalystDb');
const { requireAdmin, ROLES, ADMIN_ROLES } = require('../middleware/community');
const TABLES = require('../db/tables');

const TABLE = TABLES.COMPLAINTS;

/**
 * GET /complaints — list all (SaaS-ready)
 */
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 20, status, categoryId, priority, sortBy = 'createdAt', order = 'DESC' } = req.query;
        let conditions = '';

        if ([ROLES.OWNER, ROLES.TENANT, ROLES.FAMILY_MEMBER].includes(req.role)) {
            conditions = `raisedBy = ${req.userRecord.ROWID}`;
        }

        if (status)     conditions += conditions ? ` AND status = '${status}'`    : `status = '${status}'`;
        if (categoryId) conditions += conditions ? ` AND categoryId = '${categoryId}'` : `categoryId = '${categoryId}'`;
        if (priority)   conditions += conditions ? ` AND priority = '${priority}'` : `priority = '${priority}'`;

        const data = await find(req, TABLE, {
            conditions,
            page: parseInt(page),
            limit: parseInt(limit),
            sortBy,
            order
        });

        res.json({ data });
    } catch (err) {
        console.error('[GET /complaints]', err);
        res.status(500).json({ error: 'Failed to fetch complaints', details: err.message });
    }
});

/**
 * GET /complaints/:id — detail with isolation
 */
router.get('/:id', async (req, res) => {
    try {
        const row = await getRow(req, TABLE, req.params.id);
        if (!row) return res.status(404).json({ error: 'Complaint not found.' });

        // Logic check: Resident only see their own
        if ([ROLES.OWNER, ROLES.TENANT, ROLES.FAMILY_MEMBER].includes(req.role)) {
            if (String(row.raisedBy) !== String(req.userRecord.ROWID)) {
                return res.status(403).json({ error: 'Access denied.' });
            }
        }
        res.json({ data: row });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /complaints — Create with SLA calculation
 */
router.post('/', async (req, res) => {
    try {
        if (req.role === ROLES.DELIVERY_AGENT) return res.status(403).json({ error: 'Denied.' });

        const { title, description, categoryId, priority = 'medium', flatId = '' } = req.body;
        if (!title || !description) return res.status(400).json({ error: 'title and description are required' });

        // Validate Flat if provided
        if (flatId && !(await validateRelation(req, TABLES.FLATS, flatId))) {
            return res.status(400).json({ error: 'Invalid flatId.' });
        }

        // SLA durations
        const slaDurations = { urgent: 24, high: 48, medium: 72, low: 168 };
        const slaHours = slaDurations[priority] || 72;
        const slaDueAt = new Date(Date.now() + slaHours * 3600000).toISOString();

        const data = await insert(req, TABLE, {
            raisedBy:   req.userRecord.ROWID.toString(),
            flatId:     flatId ? flatId.toString() : (req.userRecord.flatId?.toString() || ''),
            title,
            description,
            categoryId: categoryId ? categoryId.toString() : '',
            priority,
            status:     'open',
            slaDueAt,
            assignedTo: '',
            resolvedAt: '',
        });

        auditLog(req, { action: 'CREATE_COMPLAINT', entityType: 'Complaint', entityId: data.ROWID });
        res.status(201).json({ data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * PATCH /complaints/:id
 */
router.patch('/:id', async (req, res) => {
    try {
        const row = await getRow(req, TABLE, req.params.id);
        if (!row) return res.status(404).json({ error: 'Complaint not found.' });

        const { status, assignedTo, priority, title, description, resolvedAt } = req.body;
        const updateData = { ROWID: req.params.id };

        if (ADMIN_ROLES.includes(req.role)) {
            if (status     !== undefined) updateData.status     = status;
            if (assignedTo !== undefined) updateData.assignedTo = assignedTo.toString();
            if (priority   !== undefined) updateData.priority   = priority;
            if (title      !== undefined) updateData.title      = title;
            if (resolvedAt !== undefined) updateData.resolvedAt = new Date(resolvedAt).toISOString();
        } else if (req.role === ROLES.TECHNICIAN) {
            if (status     !== undefined) updateData.status     = status;
            if (resolvedAt !== undefined) updateData.resolvedAt = new Date().toISOString();
        } else {
            // Resident edit check
            if (String(row.raisedBy) !== String(req.userRecord.ROWID)) {
                return res.status(403).json({ error: 'Denied.' });
            }
            if (description !== undefined) updateData.description = description;
        }

        const updated = await update(req, TABLE, updateData);
        auditLog(req, { action: 'UPDATE_COMPLAINT', entityType: 'Complaint', entityId: req.params.id, newValues: req.body });
        res.json({ data: updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * DELETE /complaints/:id — SOFT DELETE
 */
router.delete('/:id', async (req, res) => {
    try {
        const row = await getRow(req, TABLE, req.params.id);
        if (!row) return res.status(404).json({ error: 'Complaint not found.' });

        const isAdmin  = ADMIN_ROLES.includes(req.role);
        const isRaiser = String(row.raisedBy) === String(req.userRecord.ROWID) && row.status === 'open';

        if (!isAdmin && !isRaiser) {
            return res.status(403).json({ error: 'You can only delete open complaints you raised.' });
        }

        await softRemove(req, TABLE, req.params.id);
        res.json({ success: true, message: 'Complaint soft-deleted.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
