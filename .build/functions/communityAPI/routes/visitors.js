'use strict';

const { Router } = require('express');
const router = Router();
const { find, insert, update, getRow, softRemove, validateRelation, auditLog } = require('../db/catalystDb');
const { requireSecurity, communityOwnershipCheck, ROLES, ADMIN_ROLES } = require('../middleware/community');
const TABLES = require('../db/tables');

const TABLE = TABLES.VISITORS;

/**
 * GET /visitors — SaaS-ready listing
 */
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 20, status, sortBy = 'createdAt', order = 'DESC' } = req.query;
        let conditions = '';

        if ([ROLES.OWNER, ROLES.TENANT, ROLES.FAMILY_MEMBER].includes(req.role)) {
            if (!req.userRecord.flatId) return res.json({ data: [] });
            conditions = `hostFlatId = ${req.userRecord.flatId}`;
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
        res.status(500).json({ error: 'Failed to fetch visitors', details: err.message });
    }
});

/**
 * GET /visitors/:id
 */
router.get('/:id', async (req, res) => {
    try {
        const row = await getRow(req, TABLE, req.params.id);
        if (!row) return res.status(404).json({ error: 'Visitor not found or access denied.' });
        res.json({ data: row });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /visitors — Relational creation
 */
router.post('/', async (req, res) => {
    try {
        const { visitorName, phone, purpose, hostFlatId, expectedAt, type = 'pre-approved' } = req.body;
        if (!visitorName || !hostFlatId) {
            return res.status(400).json({ error: 'visitorName and hostFlatId are required' });
        }

        // Validate Host Flat
        const isFlatValid = await validateRelation(req, TABLES.FLATS, hostFlatId);
        if (!isFlatValid) return res.status(400).json({ error: 'Invalid or inaccessible hostFlatId.' });

        // Resident self-service validation
        if ([ROLES.OWNER, ROLES.TENANT, ROLES.FAMILY_MEMBER].includes(req.role)) {
            if (String(req.userRecord.flatId) !== String(hostFlatId)) {
                return res.status(403).json({ error: 'You can only pre-approve visitors for your own flat.' });
            }
        }

        const status = req.role === ROLES.SECURITY ? 'checked-in' : 'pending';

        const data = await insert(req, TABLE, {
            visitorName,
            phone:       phone || '',
            purpose:     purpose || '',
            hostFlatId:  hostFlatId.toString(),
            hostUserId:  req.userRecord.ROWID.toString(),
            expectedAt:  expectedAt ? new Date(expectedAt).toISOString() : '',
            checkInAt:   req.role === ROLES.SECURITY ? new Date().toISOString() : '',
            checkOutAt:  '',
            type,
            status,
            approvedBy:  '',
        });

        res.status(201).json({ data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * PATCH /visitors/:id/approve — Integrated security approval
 */
router.patch('/:id/approve', requireSecurity, async (req, res) => {
    try {
        const row = await getRow(req, TABLE, req.params.id);
        if (!row) return res.status(404).json({ error: 'Visitor not found.' });

        const updated = await update(req, TABLE, {
            ROWID:      req.params.id,
            status:     'approved',
            checkInAt:  new Date().toISOString(),
            approvedBy: req.userRecord.ROWID.toString(),
        });

        auditLog(req, { action: 'APPROVE_VISITOR', entityType: 'Visitor', entityId: req.params.id });
        res.json({ data: updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * PATCH /visitors/:id/checkout
 */
router.patch('/:id/checkout', requireSecurity, async (req, res) => {
    try {
        const row = await getRow(req, TABLE, req.params.id);
        if (!row) return res.status(404).json({ error: 'Visitor not found.' });

        const updated = await update(req, TABLE, {
            ROWID:      req.params.id,
            status:     'checked-out',
            checkOutAt: new Date().toISOString(),
        });

        res.json({ data: updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * PATCH /visitors/:id — General Update
 */
router.patch('/:id', async (req, res) => {
    try {
        const row = await getRow(req, TABLE, req.params.id);
        if (!row) return res.status(404).json({ error: 'Visitor not found.' });

        const { visitorName, phone, expectedAt, status } = req.body;
        const updateData = { ROWID: req.params.id };

        if (visitorName !== undefined) updateData.visitorName = visitorName;
        if (phone       !== undefined) updateData.phone       = phone;
        if (expectedAt  !== undefined) updateData.expectedAt  = new Date(expectedAt).toISOString();
        if (status      !== undefined && ADMIN_ROLES.includes(req.role)) updateData.status = status;

        const updated = await update(req, TABLE, updateData);
        res.json({ data: updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * DELETE /visitors/:id — SOFT DELETE
 */
router.delete('/:id', async (req, res) => {
    try {
        const row = await getRow(req, TABLE, req.params.id);
        if (!row) return res.status(404).json({ error: 'Visitor not found.' });

        await softRemove(req, TABLE, req.params.id);
        res.json({ success: true, message: 'Visitor record soft-deleted.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
