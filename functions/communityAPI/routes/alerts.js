'use strict';
const { Router } = require('express');
const router = Router();
const { scopedQuery, insert, update, getRow, auditLog } = require('../db/catalystDb');
const { communityOwnershipCheck, ROLES } = require('../middleware/community');
const TABLES = require('../db/tables');

const ADMIN_ROLES = [ROLES.SUPER_ADMIN, ROLES.COMMUNITY_ADMIN];

/**
 * GET /alerts
 * All roles within the community can view emergency alerts.
 */
router.get('/', async (req, res) => {
    try {
        const { status } = req.query;
        const conditions = status ? `status = '${status}'` : '';
        const data = await scopedQuery(req, TABLES.ALERTS, conditions, '*', 'createdAt DESC', 100);
        res.json({ data });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch alerts', details: err.message });
    }
});

/**
 * POST /alerts — Any community member can raise an emergency alert
 * Body: { type, message, flatId? }
 */
router.post('/', async (req, res) => {
    try {
        const { type = 'emergency', message, flatId = '' } = req.body;
        if (!message) return res.status(400).json({ error: 'message is required' });

        const data = await insert(req, TABLES.ALERTS, {
            raisedBy:   req.userRecord.ROWID.toString(),
            flatId:     flatId ? flatId.toString() : (req.userRecord.flatId?.toString() || ''),
            type,
            message,
            status:     'active',
            resolvedAt: '',
            resolvedBy: '',
        });

        auditLog(req, { action: 'RAISE_ALERT', entityType: 'Alert', entityId: data.ROWID });
        res.status(201).json({ data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * PATCH /alerts/:id/resolve — Admin or Security can resolve
 */
router.patch('/:id/resolve', async (req, res) => {
    try {
        const isAdminOrSecurity = [...ADMIN_ROLES, ROLES.SECURITY].includes(req.role);
        if (!isAdminOrSecurity) {
            return res.status(403).json({ error: 'Only admins or security can resolve alerts.' });
        }

        const row = await getRow(req, TABLES.ALERTS, req.params.id);
        if (!communityOwnershipCheck(req, res, row, 'Alert')) return;

        const { resolution = '' } = req.body;
        const updated = await update(req, TABLES.ALERTS, {
            ROWID:      req.params.id,
            status:     'resolved',
            resolvedAt: new Date().toISOString(),
            resolvedBy: req.userRecord.ROWID.toString(),
            resolution,
        });

        auditLog(req, { action: 'RESOLVE_ALERT', entityType: 'Alert', entityId: req.params.id });
        res.json({ data: updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/** PATCH /alerts/:id — General update (admin only) */
router.patch('/:id', async (req, res) => {
    try {
        if (!ADMIN_ROLES.includes(req.role)) {
            return res.status(403).json({ error: 'Only admins can update alerts.' });
        }
        const row = await getRow(req, TABLES.ALERTS, req.params.id);
        if (!communityOwnershipCheck(req, res, row, 'Alert')) return;

        const { type, message, status } = req.body;
        const updateData = { ROWID: req.params.id };
        if (type    !== undefined) updateData.type    = type;
        if (message !== undefined) updateData.message = message;
        if (status  !== undefined) updateData.status  = status;

        const updated = await update(req, TABLES.ALERTS, updateData);
        res.json({ data: updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
