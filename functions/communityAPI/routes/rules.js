'use strict';

const { Router } = require('express');
const router = Router();

const TABLE = 'Rules';

/** GET /rules — list all community rules */
router.get('/', async (req, res) => {
    try {
        const rows = await req.catalyst.zcql().executeZCQLQuery(`SELECT * FROM ${TABLE} ORDER BY num ASC`);
        const data = rows.map(r => r[TABLE] || r);
        res.json({ data });
    } catch (err) {
        console.error('[GET /rules]', err);
        res.status(500).json({ error: 'Failed to fetch rules', details: err.message });
    }
});

/** POST /rules — add a new rule section */
router.post('/', async (req, res) => {
    try {
        const { title, items, num } = req.body;
        if (!title || !items) {
            return res.status(400).json({ error: 'title and items are required' });
        }
        const insertData = { 
            title, 
            items, // Expecting semicolon separated string
            num: num || '0'
        };

        const table = req.catalyst.datastore().table(TABLE);
        const row = await table.insertRow(insertData);
        res.status(201).json({ data: row });
    } catch (err) {
        console.error('[POST /rules]', err);
        res.status(500).json({ error: 'Failed to create rule', details: err.message });
    }
});

/** PATCH /rules/:id — update rule section */
router.patch('/:id', async (req, res) => {
    try {
        const { title, items, num } = req.body;
        const updateData = { ROWID: req.params.id };
        if (title) updateData.title = title;
        if (items) updateData.items = items;
        if (num) updateData.num = num;

        const table = req.catalyst.datastore().table(TABLE);
        const row = await table.updateRow(updateData);
        res.json({ data: row });
    } catch (err) {
        console.error('[PATCH /rules/:id]', err);
        res.status(500).json({ error: 'Failed to update rule', details: err.message });
    }
});

/** DELETE /rules/:id — remove rule section */
router.delete('/:id', async (req, res) => {
    try {
        const table = req.catalyst.datastore().table(TABLE);
        await table.deleteRow(req.params.id);
        res.json({ success: true });
    } catch (err) {
        console.error('[DELETE /rules/:id]', err);
        res.status(500).json({ error: 'Failed to delete rule', details: err.message });
    }
});

module.exports = router;
