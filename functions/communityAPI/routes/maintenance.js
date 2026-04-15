'use strict';

const { Router } = require('express');
const router = Router();

const TABLE = 'MaintenanceTasks';

/** GET /maintenance — list maintenance tasks */
router.get('/', async (req, res) => {
    try {
        const rows = await req.catalyst.zcql().executeZCQLQuery(`SELECT * FROM ${TABLE} ORDER BY CREATEDTIME DESC`);
        const data = rows.map(r => r[TABLE] || r);
        res.json({ data });
    } catch (err) {
        console.error('[GET /maintenance]', err);
        res.status(500).json({ error: 'Failed to fetch maintenance tasks', details: err.message });
    }
});

/** POST /maintenance — create new task */
router.post('/', async (req, res) => {
    try {
        const { title, description, category, priority, status, residentId } = req.body;
        if (!title || !category) {
            return res.status(400).json({ error: 'title and category are required' });
        }
        const insertData = { 
            title, 
            description: description || '',
            category,
            priority: priority || 'medium',
            status: status || 'pending'
        };
        if (residentId) insertData.residentId = residentId.toString();

        const table = req.catalyst.datastore().table(TABLE);
        const row = await table.insertRow(insertData);
        res.status(201).json({ data: row });
    } catch (err) {
        console.error('[POST /maintenance]', err);
        res.status(500).json({ error: 'Failed to create task', details: err.message });
    }
});

/** PATCH /maintenance/:id — update state */
router.patch('/:id', async (req, res) => {
    try {
        const { status, title, description, priority } = req.body;
        const updateData = { ROWID: req.params.id };
        if (status) updateData.status = status;
        if (title) updateData.title = title;
        if (description) updateData.description = description;
        if (priority) updateData.priority = priority;

        const table = req.catalyst.datastore().table(TABLE);
        const row = await table.updateRow(updateData);
        res.json({ data: row });
    } catch (err) {
        console.error('[PATCH /maintenance/:id]', err);
        res.status(500).json({ error: 'Failed to update task', details: err.message });
    }
});

module.exports = router;
