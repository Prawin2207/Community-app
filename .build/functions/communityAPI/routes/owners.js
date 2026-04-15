'use strict';

const { Router } = require('express');
const router = Router();
const { scopedQuery, insert, update, getRow, remove, auditLog } = require('../db/catalystDb');
const TABLES = require('../db/tables');
const { communityOwnershipCheck } = require('../middleware/community');

const TABLE = TABLES.OWNERS;

/** GET /owners — list all */
router.get('/', async (req, res) => {
    try {
        const data = await scopedQuery(req, TABLE);
        res.json({ data });
    } catch (err) {
        console.error('[GET /owners]', err);
        res.status(500).json({ error: 'Failed to fetch owners', details: err.message });
    }
});

/** GET /owners/:id */
router.get('/:id', async (req, res) => {
    try {
        const row = await getRow(req, TABLE, req.params.id);
        if (!communityOwnershipCheck(req, res, row, 'Owner')) return;
        res.json({ data: row });
    } catch (err) {
        console.error('[GET /owners/:id]', err);
        res.status(500).json({ error: 'Failed to fetch owner', details: err.message });
    }
});

/** POST /owners — create */
router.post('/', async (req, res) => {
    try {
        const insertData = { ...req.body };
        if (Array.isArray(insertData.documents)) {
            insertData.description = JSON.stringify(insertData.documents);
            delete insertData.documents;
        }

        const row = await insert(req, TABLE, insertData);
        
        auditLog(req, {
            action: 'CREATE',
            entityType: 'Owner',
            entityId: row.ROWID,
            newValues: insertData
        });

        res.status(201).json({ data: row });
    } catch (err) {
        console.error('[POST /owners]', err);
        res.status(500).json({ error: 'Failed to create owner', details: err.message });
    }
});

/** PATCH /owners/:id — update */
router.patch('/:id', async (req, res) => {
    try {
        const existing = await getRow(req, TABLE, req.params.id);
        if (!communityOwnershipCheck(req, res, existing, 'Owner')) return;

        const updateData = { ROWID: req.params.id, ...req.body };
        
        if (Array.isArray(updateData.documents)) {
            updateData.description = JSON.stringify(updateData.documents);
            delete updateData.documents;
        }

        const row = await update(req, TABLE, updateData);

        auditLog(req, {
            action: 'UPDATE',
            entityType: 'Owner',
            entityId: req.params.id,
            oldValues: existing,
            newValues: updateData
        });

        res.json({ data: row });
    } catch (err) {
        console.error('[PATCH /owners/:id]', err);
        res.status(500).json({ error: 'Failed to update owner', details: err.message });
    }
});

/** DELETE /owners/:id */
router.delete('/:id', async (req, res) => {
    try {
        const existing = await getRow(req, TABLE, req.params.id);
        if (!communityOwnershipCheck(req, res, existing, 'Owner')) return;

        await remove(req, TABLE, req.params.id);

        auditLog(req, {
            action: 'DELETE',
            entityType: 'Owner',
            entityId: req.params.id,
            oldValues: existing
        });

        res.json({ message: 'Owner deleted' });
    } catch (err) {
        console.error('[DELETE /owners/:id]', err);
        res.status(500).json({ error: 'Failed to delete owner', details: err.message });
    }
});

module.exports = router;
