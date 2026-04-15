'use strict';
const { Router } = require('express');
const router = Router();
const { scopedQuery, insert, update, getRow, auditLog } = require('../db/catalystDb');
const { requireAdmin, requireOwnerOrAdmin, communityOwnershipCheck, ROLES } = require('../middleware/community');
const TABLES = require('../db/tables');

/**
 * GET /tenants  (now represents Tenancies)
 * - Admin/Accountant: all tenancies in community
 * - Owner: only their flat's tenancies
 * - Tenant: only their own active tenancy
 */
router.get('/', async (req, res) => {
    try {
        let conditions = '';

        if (req.role === ROLES.OWNER) {
            conditions = `ownerId = ${req.userRecord.ROWID}`;
        } else if (req.role === ROLES.TENANT) {
            conditions = `tenantUserId = ${req.userRecord.ROWID}`;
        } else if (req.role === ROLES.FAMILY_MEMBER) {
            if (!req.userRecord.flatId) return res.json({ data: [] });
            conditions = `flatId = ${req.userRecord.flatId}`;
        }
        // Admin/Accountant: no extra condition

        const data = await scopedQuery(req, TABLES.TENANCIES, conditions, '*', 'createdAt DESC');
        res.json({ data });
    } catch (err) {
        console.error('[GET /tenants]', err);
        res.status(500).json({ error: 'Failed to fetch tenancies', details: err.message });
    }
});

/** GET /tenants/:id */
router.get('/:id', async (req, res) => {
    try {
        const row = await getRow(req, TABLES.TENANCIES, req.params.id);
        if (!communityOwnershipCheck(req, res, row, 'Tenancy')) return;

        // Role check: tenant can only see their own, owner their own flat, admins all
        if (req.role === ROLES.TENANT && String(row.tenantUserId) !== String(req.userRecord.ROWID)) {
            return res.status(403).json({ error: 'Access denied.' });
        }
        if (req.role === ROLES.OWNER && String(row.ownerId) !== String(req.userRecord.ROWID)) {
            return res.status(403).json({ error: 'Access denied.' });
        }

        res.json({ data: row });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /tenants — Owner or Admin creates a tenancy
 * Body: { flatId, tenantUserId, rentAmount, leaseStart, leaseEnd, depositAmount? }
 */
router.post('/', requireOwnerOrAdmin, async (req, res) => {
    try {
        const { flatId, tenantUserId, rentAmount, leaseStart, leaseEnd, depositAmount = 0, leaseDocumentUrl = '' } = req.body;
        if (!flatId || !tenantUserId || !rentAmount || !leaseStart) {
            return res.status(400).json({ error: 'flatId, tenantUserId, rentAmount, leaseStart are required' });
        }

        // Verify the flat belongs to this community
        const flat = await getRow(req, TABLES.FLATS, flatId);
        if (!communityOwnershipCheck(req, res, flat, 'Flat')) return;

        // If caller is an owner, verify they own this flat
        if (req.role === ROLES.OWNER) {
            const ownership = await scopedQuery(req, TABLES.FLAT_OWNERS,
                `flatId = ${flatId} AND userId = ${req.userRecord.ROWID} AND status = 'active'`, 'ROWID');
            if (!ownership.length) {
                return res.status(403).json({ error: 'You do not own this flat.' });
            }
        }

        const data = await insert(req, TABLES.TENANCIES, {
            flatId:          flatId.toString(),
            tenantUserId:    tenantUserId.toString(),
            ownerId:         req.userRecord.ROWID.toString(),
            rentAmount:      parseFloat(rentAmount).toString(),
            depositAmount:   parseFloat(depositAmount).toString(),
            leaseStart:      String(leaseStart),
            leaseEnd:        leaseEnd ? String(leaseEnd) : '',
            leaseDocumentUrl,
            status:          'active',
        });

        // Update flat occupancy status
        await update(req, TABLES.FLATS, { ROWID: flatId.toString(), occupancyStatus: 'rented' });

        // Update tenant user's flatId
        await req.catalyst.datastore().table(TABLES.USERS).updateRow({
            ROWID:     tenantUserId.toString(),
            flatId:    flatId.toString(),
            updatedAt: new Date().toISOString(),
        });

        auditLog(req, { action: 'CREATE_TENANCY', entityType: 'Tenancy', entityId: data.ROWID, newValues: req.body });
        res.status(201).json({ data });
    } catch (err) {
        console.error('[POST /tenants]', err);
        res.status(500).json({ error: 'Failed to create tenancy', details: err.message });
    }
});

/**
 * PATCH /tenants/:id — Update tenancy (move-out, rent change, etc.)
 */
router.patch('/:id', requireOwnerOrAdmin, async (req, res) => {
    try {
        const row = await getRow(req, TABLES.TENANCIES, req.params.id);
        if (!communityOwnershipCheck(req, res, row, 'Tenancy')) return;

        // Owner can only update their own tenancy
        if (req.role === ROLES.OWNER && String(row.ownerId) !== String(req.userRecord.ROWID)) {
            return res.status(403).json({ error: 'Access denied.' });
        }

        const { rentAmount, leaseEnd, status, leaseDocumentUrl, depositAmount } = req.body;
        const updateData = { ROWID: req.params.id };
        if (rentAmount       !== undefined) updateData.rentAmount       = parseFloat(rentAmount).toString();
        if (leaseEnd         !== undefined) updateData.leaseEnd         = String(leaseEnd);
        if (status           !== undefined) updateData.status           = status;
        if (leaseDocumentUrl !== undefined) updateData.leaseDocumentUrl = leaseDocumentUrl;
        if (depositAmount    !== undefined) updateData.depositAmount    = parseFloat(depositAmount).toString();

        const updated = await update(req, TABLES.TENANCIES, updateData);

        // If tenant moved out, free up the flat
        if (status === 'terminated' || status === 'expired') {
            await update(req, TABLES.FLATS, { ROWID: row.flatId.toString(), occupancyStatus: 'vacant' });
            // Clear tenant's flatId
            await req.catalyst.datastore().table(TABLES.USERS).updateRow({
                ROWID:     row.tenantUserId.toString(),
                flatId:    '',
                updatedAt: new Date().toISOString(),
            });
        }

        auditLog(req, { action: 'UPDATE_TENANCY', entityType: 'Tenancy', entityId: req.params.id, oldValues: row, newValues: req.body });
        res.json({ data: updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
