'use strict';

const { Router } = require('express');
const router = Router();

const TABLE = 'Assets';

router.get('/', async (req, res) => {
    try {
        let query = `SELECT * FROM ${TABLE}`;
        const rows = await req.catalyst.zcql().executeZCQLQuery(query);
        const data = rows.map(r => r[TABLE] || r);
        res.json({ data });
    } catch (err) {
        console.error('[GET /assets]', err);
        res.status(500).json({ error: 'Failed' });
    }
});

router.post('/', async (req, res) => {
    try {
        const table = req.catalyst.datastore().table(TABLE);
        const row = await table.insertRow(req.body);
        res.json({ data: row });
    } catch (err) {
        console.error('[POST /assets]', err);
        res.status(500).json({ error: 'Failed' });
    }
});

router.patch('/:id', async (req, res) => {
    try {
        const table = req.catalyst.datastore().table(TABLE);
        const updateData = { ROWID: req.params.id, ...req.body };
        const row = await table.updateRow(updateData);
        res.json({ data: row });
    } catch (err) {
        console.error('[PATCH /assets/:id]', err);
        res.status(500).json({ error: 'Failed' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const table = req.catalyst.datastore().table(TABLE);
        await table.deleteRow(req.params.id);
        res.json({ success: true });
    } catch (err) {
        console.error('[DELETE /assets/:id]', err);
        res.status(500).json({ error: 'Failed' });
    }
});

module.exports = router;
