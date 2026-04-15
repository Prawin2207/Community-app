'use strict';

const { Router } = require('express');
const router = Router();

const TABLE = 'FlatOwners';

/** GET /flat-owners — list all, optionally filter by flatId */
router.get('/', async (req, res) => {
    try {
        const { flatId } = req.query;
        let query = `SELECT * FROM ${TABLE}`;
        if (flatId) query += ` WHERE flatId = ${flatId}`;
        const rows = await req.catalyst.zcql().executeZCQLQuery(query);
        const data = rows.map(r => r[TABLE] || r);
        res.json({ data });
    } catch (err) {
        console.error('[GET /flat-owners]', err);
        res.status(500).json({ error: 'Failed to fetch flat owners', details: err.message });
    }
});

/** GET /flat-owners/:id */
router.get('/:id', async (req, res) => {
    try {
        const table = req.catalyst.datastore().table(TABLE);
        const row = await table.getRow(req.params.id);
        if (!row) return res.status(404).json({ error: 'Owner not found' });
        res.json({ data: row[TABLE] || row });
    } catch (err) {
        console.error('[GET /flat-owners/:id]', err);
        res.status(500).json({ error: 'Failed to fetch owner', details: err.message });
    }
});

/** POST /flat-owners — register owner for a flat */
router.post('/', async (req, res) => {
    try {
        const { flatId, name, email, phone, panNumber, address, status } = req.body;
        if (!flatId || !name) {
            return res.status(400).json({ error: 'flatId and name are required' });
        }
        const insertData = {
            flatId: flatId.toString(),
            name: String(name),
            status: status || 'active',
        };
        if (email) insertData.email = email;
        if (phone) insertData.phone = phone;
        if (panNumber) insertData.panNumber = panNumber;
        if (address) insertData.address = address;

        const table = req.catalyst.datastore().table(TABLE);
        const row = await table.insertRow(insertData);
        res.status(201).json({ data: row });
    } catch (err) {
        console.error('[POST /flat-owners]', err);
        res.status(500).json({ error: 'Failed to create owner', details: err.message });
    }
});

/** PATCH /flat-owners/:id */
router.patch('/:id', async (req, res) => {
    try {
        const { name, email, phone, panNumber, address, status } = req.body;
        const updateData = { ROWID: req.params.id };
        if (name !== undefined) updateData.name = name;
        if (email !== undefined) updateData.email = email;
        if (phone !== undefined) updateData.phone = phone;
        if (panNumber !== undefined) updateData.panNumber = panNumber;
        if (address !== undefined) updateData.address = address;
        if (status !== undefined) updateData.status = status;

        const table = req.catalyst.datastore().table(TABLE);
        const row = await table.updateRow(updateData);
        res.json({ data: row });
    } catch (err) {
        console.error('[PATCH /flat-owners/:id]', err);
        res.status(500).json({ error: 'Failed to update owner', details: err.message });
    }
});

/** DELETE /flat-owners/:id */
router.delete('/:id', async (req, res) => {
    try {
        const table = req.catalyst.datastore().table(TABLE);
        await table.deleteRow(req.params.id);
        res.json({ message: 'Owner removed' });
    } catch (err) {
        console.error('[DELETE /flat-owners/:id]', err);
        res.status(500).json({ error: 'Failed to delete owner', details: err.message });
    }
});

module.exports = router;
