'use strict';

const { Router } = require('express');
const router = Router();
const { find, insert, update, getRow, softRemove, query, auditLog } = require('../db/catalystDb');
const { requireAdmin, ROLES } = require('../middleware/community');
const TABLES = require('../db/tables');

const TABLE = TABLES.FLATS;

/**
 * GET /flats — list all (SaaS-ready)
 */
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 50, sortBy = 'flatNumber', order = 'ASC', block, status } = req.query;
        let conditions = '';

        if ([ROLES.OWNER, ROLES.TENANT, ROLES.FAMILY_MEMBER].includes(req.role)) {
            if (!req.userRecord.flatId) return res.json({ data: [] });
            conditions = `ROWID = ${req.userRecord.flatId}`;
        }

        if (block)  conditions += conditions ? ` AND block = '${block}'` : `block = '${block}'`;
        if (status) conditions += conditions ? ` AND occupancyStatus = '${status}'` : `occupancyStatus = '${status}'`;

        const data = await find(req, TABLE, {
            conditions,
            page: parseInt(page),
            limit: parseInt(limit),
            sortBy,
            order
        });

        res.json({ data });
    } catch (err) {
        console.error('[GET /flats]', err);
        res.status(500).json({ error: 'Failed to fetch flats', details: err.message });
    }
});

/**
 * GET /flats/:id
 */
router.get('/:id', async (req, res) => {
    try {
        const row = await getRow(req, TABLE, req.params.id);
        if (!row) return res.status(404).json({ error: 'Flat not found or deleted.' });
        res.json({ data: row });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /flats — CREATE with unique constraint check
 */
router.post('/', requireAdmin, async (req, res) => {
    try {
        const { flatNumber, block, floor, bhk, area, maintenanceRate, parkingSlot, occupancyStatus } = req.body;
        if (!flatNumber || !block) {
            return res.status(400).json({ error: 'flatNumber and block are required' });
        }

        // 1. Manual Unique Constraint Check: (communityId + block + flatNumber)
        const existing = await query(req, 
            `SELECT ROWID FROM ${TABLE} WHERE communityId = '${req.communityId}' AND block = '${block}' AND flatNumber = '${flatNumber}' AND isDeleted = false LIMIT 1`
        );
        if (existing.length) {
            return res.status(409).json({ error: `Flat ${flatNumber} already exists in block ${block}.` });
        }

        const insertData = {
            flatNumber,
            block,
            floor: floor?.toString() || '0',
            bhk: bhk || '2BHK',
            area: area?.toString() || '0',
            maintenanceRate: maintenanceRate?.toString() || '0',
            parkingSlot: parkingSlot || '',
            occupancyStatus: occupancyStatus || 'vacant'
        };

        const data = await insert(req, TABLE, insertData);
        auditLog(req, { action: 'CREATE', entityType: 'Flat', entityId: data.ROWID, newValues: insertData });
        res.status(201).json({ data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * PATCH /flats/:id — UPDATE
 */
router.patch('/:id', requireAdmin, async (req, res) => {
    try {
        const row = await getRow(req, TABLE, req.params.id);
        if (!row) return res.status(404).json({ error: 'Flat not found.' });

        const { flatNumber, block, floor, bhk, area, maintenanceRate, parkingSlot, occupancyStatus } = req.body;
        const updateData = { ROWID: req.params.id };

        if (flatNumber)     updateData.flatNumber = flatNumber;
        if (block)          updateData.block = block;
        if (floor)          updateData.floor = floor.toString();
        if (bhk)            updateData.bhk = bhk;
        if (area)           updateData.area = area.toString();
        if (maintenanceRate) updateData.maintenanceRate = maintenanceRate.toString();
        if (parkingSlot)    updateData.parkingSlot = parkingSlot;
        if (occupancyStatus) updateData.occupancyStatus = occupancyStatus;

        const updated = await update(req, TABLE, updateData);
        auditLog(req, { action: 'UPDATE', entityType: 'Flat', entityId: req.params.id, newValues: updateData });
        res.json({ data: updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * DELETE /flats/:id — SOFT DELETE
 */
router.delete('/:id', requireAdmin, async (req, res) => {
    try {
        const row = await getRow(req, TABLE, req.params.id);
        if (!row) return res.status(404).json({ error: 'Flat not found.' });

        await softRemove(req, TABLE, req.params.id);
        auditLog(req, { action: 'DELETE', entityType: 'Flat', entityId: req.params.id });
        res.json({ success: true, message: 'Flat soft-deleted.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
