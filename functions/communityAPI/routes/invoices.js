'use strict';
const { Router } = require('express');
const router = Router();
const { scopedQuery, insert, update, getRow, auditLog } = require('../db/catalystDb');
const { requireAccounting, requireAdmin, communityOwnershipCheck, ROLES } = require('../middleware/community');
const TABLES = require('../db/tables');

const ADMIN_ROLES = [ROLES.SUPER_ADMIN, ROLES.COMMUNITY_ADMIN, ROLES.ACCOUNTANT];

/**
 * GET /invoices
 * - Admin/Accountant: all invoices in community
 * - Owner: invoices for their flat(s)
 * - Tenant: invoices assigned to their tenancy
 * - Others: denied
 */
router.get('/', async (req, res) => {
    try {
        let conditions = '';

        if (req.role === ROLES.OWNER) {
            conditions = `ownerId = ${req.userRecord.ROWID}`;
        } else if (req.role === ROLES.TENANT) {
            if (!req.userRecord.flatId) return res.json({ data: [] });
            conditions = `flatId = ${req.userRecord.flatId}`;
        } else if (!ADMIN_ROLES.includes(req.role)) {
            return res.status(403).json({ error: 'Access denied. You cannot view invoices.' });
        }

        const { month, year, status } = req.query;
        if (month)  conditions += conditions ? ` AND month = '${month}'`  : `month = '${month}'`;
        if (year)   conditions += conditions ? ` AND year = '${year}'`    : `year = '${year}'`;
        if (status) conditions += conditions ? ` AND status = '${status}'` : `status = '${status}'`;

        const data = await scopedQuery(req, TABLES.MAINTENANCE_INVOICES, conditions, '*', 'createdAt DESC');
        res.json({ data });
    } catch (err) {
        console.error('[GET /invoices]', err);
        res.status(500).json({ error: 'Failed to fetch invoices', details: err.message });
    }
});

/** GET /invoices/:id */
router.get('/:id', async (req, res) => {
    try {
        const row = await getRow(req, TABLES.MAINTENANCE_INVOICES, req.params.id);
        if (!communityOwnershipCheck(req, res, row, 'Invoice')) return;

        if (req.role === ROLES.OWNER && String(row.ownerId) !== String(req.userRecord.ROWID)) {
            return res.status(403).json({ error: 'Access denied.' });
        }
        if (req.role === ROLES.TENANT && String(row.flatId) !== String(req.userRecord.flatId)) {
            return res.status(403).json({ error: 'Access denied.' });
        }
        const row = await getRow(req, TABLE, req.params.id);
        if (!row) return res.status(404).json({ error: 'Invoice not found.' });
        res.json({ data: row });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /invoices — CREATE with relational validation
 */
router.post('/', requireAccounting, async (req, res) => {
    try {
        const { flatId, residentId, amount, dueDate, description, invoiceTypeId } = req.body;
        
        if (!flatId || !amount || !dueDate) {
            return res.status(400).json({ error: 'flatId, amount, and dueDate are required.' });
        }

        // Validate Flat
        if (!(await validateRelation(req, TABLES.FLATS, flatId))) {
            return res.status(400).json({ error: 'Invalid flatId.' });
        }

        // Validate Resident if provided
        if (residentId && !(await validateRelation(req, TABLES.RESIDENTS, residentId))) {
            return res.status(400).json({ error: 'Invalid residentId.' });
        }

        const data = await insert(req, TABLE, {
            flatId:      flatId.toString(),
            residentId:  residentId ? residentId.toString() : '',
            invoiceTypeId: invoiceTypeId ? invoiceTypeId.toString() : '',
            amount:      parseFloat(amount),
            penalty:     0,
            dueDate:     new Date(dueDate).toISOString(),
            description: description || '',
            status:      'unpaid',
            paidAt:      '',
            paymentRef:  ''
        });

        auditLog(req, { action: 'GENERATE_INVOICE', entityType: 'Invoice', entityId: data.ROWID });
        res.status(201).json({ data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * PATCH /invoices/:id — Update/Pay
 */
router.patch('/:id', async (req, res) => {
    try {
        const row = await getRow(req, TABLE, req.params.id);
        if (!row) return res.status(404).json({ error: 'Invoice not found.' });

        const { status, paidAt, paymentRef, amount } = req.body;
        const updateData = { ROWID: req.params.id };

        if (status)     updateData.status = status;
        if (paidAt)     updateData.paidAt = new Date(paidAt).toISOString();
        if (paymentRef) updateData.paymentRef = paymentRef;
        if (amount)     updateData.amount = parseFloat(amount);

        const updated = await update(req, TABLE, updateData);
        res.json({ data: updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * DELETE /invoices/:id — SOFT DELETE
 */
router.delete('/:id', requireAccounting, async (req, res) => {
    try {
        const row = await getRow(req, TABLE, req.params.id);
        if (!row) return res.status(404).json({ error: 'Invoice not found.' });

        await softRemove(req, TABLE, req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
