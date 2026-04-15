'use strict';

const { Router } = require('express');
const router = Router();
const { find, insert, update, getRow, softRemove, auditLog } = require('../db/catalystDb');
const TABLES = require('../db/tables');
const { requireAdmin } = require('../middleware/community');

const TABLE = TABLES.INVENTORY;

/**
 * GET /inventory — list all in community
 */
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 50, category, sortBy = 'itemName', order = 'ASC' } = req.query;
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
        res.status(500).json({ error: 'Failed to fetch inventory', details: err.message });
    }
});

        if (status) updateData.status = status;

        const table = req.catalyst.datastore().table(TABLE);
        const row = await table.updateRow(updateData);
        res.json({ data: row });
    } catch (err) {
        console.error('[PATCH /inventory/:id]', err);
        res.status(500).json({ error: 'Failed to update inventory', details: err.message });
    }
});

module.exports = router;
