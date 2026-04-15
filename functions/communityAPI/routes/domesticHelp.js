'use strict';

const { Router } = require('express');
const router = Router();
const { find, insert, update, getRow, softRemove, validateRelation, auditLog } = require('../db/catalystDb');
const { requireSecurity, ROLES } = require('../middleware/community');
const TABLES = require('../db/tables');

const TABLE = TABLES.DOMESTIC_HELP;

/**
 * GET /domestic-help — list all in community
 */
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 20, status, category, sortBy = 'name', order = 'ASC' } = req.query;
        let conditions = '';

        if ([ROLES.OWNER, ROLES.TENANT, ROLES.FAMILY_MEMBER].includes(req.role)) {
            if (!req.userRecord.flatId) return res.json({ data: [] });
            conditions = `flatId = ${req.userRecord.flatId}`;
        }

        if (status)   conditions += conditions ? ` AND status = '${status}'` : `status = '${status}'`;
        if (category) conditions += conditions ? ` AND category = '${category}'` : `category = '${category}'`;

        const data = await find(req, TABLE, {
            conditions,
            page: parseInt(page),
            limit: parseInt(limit),
            sortBy,
            order
        });

        res.json({ data });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch domestic help', details: err.message });
    }
});

/**
 * GET /domestic-help/:id
 */
router.get('/:id', async (req, res) => {
    try {
        const row = await getRow(req, TABLE, req.params.id);
        if (!row) return res.status(404).json({ error: 'Record not found.' });
        res.json({ data: row });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /domestic-help — CREATE with flat validation
 */
router.post('/', async (req, res) => {
    try {
        const { name, phone, category, flatId, documentId } = req.body;
        if (!name || !flatId) return res.status(400).json({ error: 'name and flatId are required' });

        // Validate Flat
        if (!(await validateRelation(req, TABLES.FLATS, flatId))) {
            return res.status(400).json({ error: 'Invalid or inaccessible flatId.' });
        }

        const insertData = {
            name,
            phone:     phone || '',
            category:  category || 'Staff',
            flatId:    flatId.toString(),
            status:    'active',
            documentId: documentId || ''
        };

        const data = await insert(req, TABLE, insertData);
        auditLog(req, { action: 'REGISTER_HELP', entityType: 'DomesticHelp', entityId: data.ROWID });
        res.status(201).json({ data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * PATCH /domestic-help/:id
 */
router.patch('/:id', async (req, res) => {
    try {
        const row = await getRow(req, TABLE, req.params.id);
        if (!row) return res.status(404).json({ error: 'Record not found.' });

        const { name, phone, category, flatId, status } = req.body;
        const updateData = { ROWID: req.params.id };

        if (name) updateData.name = name;
        if (phone) updateData.phone = phone;
        if (category) updateData.category = category;
        if (status) updateData.status = status;
        
        if (flatId !== undefined) {
             if (flatId && !(await validateRelation(req, TABLES.FLATS, flatId))) {
                 return res.status(400).json({ error: 'Invalid flatId.' });
             }
             updateData.flatId = flatId ? flatId.toString() : '';
        }

        const updated = await update(req, TABLE, updateData);
        res.json({ data: updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * DELETE /domestic-help/:id — SOFT DELETE
 */
router.delete('/:id', async (req, res) => {
    try {
        const table = req.catalyst.datastore().table(TABLE);
        await table.deleteRow(req.params.id);
        res.json({ success: true });
    } catch (err) {
        console.error('[DELETE /domestic-help/:id]', err);
        res.status(500).json({ error: 'Failed' });
    }
});

module.exports = router;
