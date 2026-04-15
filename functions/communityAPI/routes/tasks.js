'use strict';

const { Router } = require('express');
const router = Router();

const TABLE = 'WorkOrders';

/** GET /tasks — list all maintenance tasks */
router.get('/', async (req, res) => {
    try {
        const rows = await req.catalyst.zcql().executeZCQLQuery(`SELECT * FROM ${TABLE} ORDER BY CREATEDTIME DESC`);
        const data = rows.map(r => r[TABLE] || r);
        res.json({ data });
    } catch (err) {
        console.error('[GET /tasks]', err);
        res.status(500).json({ error: 'Failed to fetch tasks', details: err.message });
    }
});

/** POST /tasks — create a new maintenance task */
router.post('/', async (req, res) => {
    try {
        const { title, description, facility, WorkOrderspriority, assignedTo } = req.body;
        if (!title || !facility) {
            return res.status(400).json({ error: 'title and facility are required' });
        }
        const insertData = { 
            title, 
            description: description || '',
            facility,
            WorkOrderspriority: WorkOrderspriority || 'medium',
            status: 'pending'
        };
        if (assignedTo) insertData.assignedTo = assignedTo.toString();

        const table = req.catalyst.datastore().table(TABLE);
        const row = await table.insertRow(insertData);
        res.status(201).json({ data: row });
    } catch (err) {
        console.error('[POST /tasks]', err);
        res.status(500).json({ error: 'Failed to create task', details: err.message });
    }
});

/** PATCH /tasks/:id — update task status or details */
router.patch('/:id', async (req, res) => {
    try {
        const { status, title, description, priority, assignedTo } = req.body;
        const updateData = { ROWID: req.params.id };
        if (status) updateData.status = status;
        if (title) updateData.title = title;
        if (description) updateData.description = description;
        if (priority) updateData.priority = priority;
        if (assignedTo) updateData.assignedTo = assignedTo.toString();

        const table = req.catalyst.datastore().table(TABLE);
        const row = await table.updateRow(updateData);
        
        // Auto-resolve complaint if linked
        if (status === 'completed' && row.description) {
            const match = row.description.match(/\[COMPLAINT_ID:(\d+)\]/);
            if (match) {
                try {
                    await req.catalyst.datastore().table('Complaints').updateRow({
                        ROWID: match[1],
                        status: 'resolved'
                    });
                } catch(e) { console.error('Failed to auto-resolve complaint', e); }
            }
        }

        res.json({ data: row });
    } catch (err) {
        console.error('[PATCH /tasks/:id]', err);
        res.status(500).json({ error: 'Failed to update task', details: err.message });
    }
});

module.exports = router;
