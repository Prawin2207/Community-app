'use strict';

const { Router } = require('express');
const router = Router();
const { find, insert, update, getRow, softRemove, validateRelation, auditLog } = require('../db/catalystDb');
const TABLES = require('../db/tables');
const { ROLES } = require('../middleware/community');

const TABLE = TABLES.FACILITY_BOOKINGS;

/**
 * GET /bookings — list all (SaaS isolation)
 */
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 20, status, sortBy = 'startTime', order = 'DESC' } = req.query;
        let conditions = '';

        if ([ROLES.OWNER, ROLES.TENANT, ROLES.FAMILY_MEMBER].includes(req.role)) {
            conditions = `bookedBy = ${req.userRecord.ROWID}`;
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
        res.status(500).json({ error: 'Failed to fetch bookings', details: err.message });
    }
});

/**
 * GET /bookings/:id
 */
router.get('/:id', async (req, res) => {
    try {
        const row = await getRow(req, TABLE, req.params.id);
        if (!row) return res.status(404).json({ error: 'Booking not found.' });
        res.json({ data: row });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /bookings — CREATE with relational validation
 */
router.post('/', async (req, res) => {
    try {
        const { facilityId, startTime, endTime, purpose, guestsCount } = req.body;
        if (!facilityId || !startTime || !endTime) {
            return res.status(400).json({ error: 'facilityId, startTime and endTime are required' });
        }

        // 1. Validate Facility
        if (!(await validateRelation(req, TABLES.FACILITIES, facilityId))) {
            return res.status(400).json({ error: 'Invalid or inaccessible facilityId.' });
        }

        // 2. Insert Booking
        const insertData = {
            facilityId: facilityId.toString(),
            bookedBy:   req.userRecord.ROWID.toString(),
            flatId:     req.userRecord.flatId?.toString() || '',
            startTime:  new Date(startTime).toISOString(),
            endTime:    new Date(endTime).toISOString(),
            purpose:    purpose || '',
            guestsCount: Number(guestsCount || 0),
            status:     'confirmed'
        };

        const data = await insert(req, TABLE, insertData);
        auditLog(req, { action: 'BOOK_FACILITY', entityType: 'Booking', entityId: data.ROWID });
        res.status(201).json({ data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * PATCH /bookings/:id — Cancel or update status
 */
router.patch('/:id', async (req, res) => {
    try {
        const row = await getRow(req, TABLE, req.params.id);
        if (!row) return res.status(404).json({ error: 'Booking not found.' });

        const { status } = req.body;
        const updateData = { ROWID: req.params.id };
        if (status) updateData.status = status;

        const updated = await update(req, TABLE, updateData);
        res.json({ data: updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * DELETE /bookings/:id — SOFT DELETE
 */
router.delete('/:id', async (req, res) => {
    try {
        const row = await getRow(req, TABLE, req.params.id);
        if (!row) return res.status(404).json({ error: 'Booking not found.' });

        await softRemove(req, TABLE, req.params.id);
        res.json({ success: true, message: 'Booking soft-deleted.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
