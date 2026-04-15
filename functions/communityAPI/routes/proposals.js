'use strict';

const { Router } = require('express');
const router = Router();

const TABLE = 'Proposals';

/** GET /proposals — list all proposals */
router.get('/', async (req, res) => {
    try {
        const rows = await req.catalyst.zcql().executeZCQLQuery(`SELECT * FROM ${TABLE} ORDER BY CREATEDTIME DESC`);
        const data = rows.map(r => r[TABLE] || r);
        res.json({ data });
    } catch (err) {
        console.error('[GET /proposals]', err);
        res.status(500).json({ error: 'Failed to fetch proposals', details: err.message });
    }
});

/** POST /proposals — create a new proposal */
router.post('/', async (req, res) => {
    try {
        const { title, description, author, status } = req.body;
        if (!title || !description) {
            return res.status(400).json({ error: 'title and description are required' });
        }
        const insertData = { 
            title, 
            description,
            status: status || 'voting_open',
            votesFor: 0,
            votesAgainst: 0
        };

        const table = req.catalyst.datastore().table(TABLE);
        const row = await table.insertRow(insertData);
        res.status(201).json({ data: row });
    } catch (err) {
        console.error('[POST /proposals]', err);
        res.status(500).json({ error: 'Failed to create proposal', details: err.message });
    }
});

/** PATCH /proposals/:id — vote or update status */
router.patch('/:id', async (req, res) => {
    try {
        const { votesFor, votesAgainst, status } = req.body;
        const updateData = { ROWID: req.params.id };
        if (votesFor !== undefined) updateData.votesFor = Number(votesFor);
        if (votesAgainst !== undefined) updateData.votesAgainst = Number(votesAgainst);
        if (status) updateData.status = status;

        const table = req.catalyst.datastore().table(TABLE);
        const row = await table.updateRow(updateData);
        res.json({ data: row });
    } catch (err) {
        console.error('[PATCH /proposals/:id]', err);
        res.status(500).json({ error: 'Failed to update proposal', details: err.message });
    }
});

module.exports = router;
