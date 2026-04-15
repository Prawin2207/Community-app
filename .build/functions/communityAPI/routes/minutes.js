'use strict';

const { Router } = require('express');
const router = Router();

const TABLE = 'MeetingMinutes';

/** GET /minutes — list all minutes */
router.get('/', async (req, res) => {
    try {
        const rows = await req.catalyst.zcql().executeZCQLQuery(`SELECT * FROM ${TABLE} ORDER BY meetingdate DESC`);
        const data = rows.map(r => r[TABLE] || r);
        res.json({ data });
    } catch (err) {
        console.error('[GET /minutes]', err);
        res.status(500).json({ error: 'Failed to fetch minutes', details: err.message });
    }
});

/** POST /minutes — create new meeting minute record */
router.post('/', async (req, res) => {
    try {
        const { title, meetingdate, attendees, summary, tags } = req.body;
        if (!title || !meetingdate || !summary) {
            return res.status(400).json({ error: 'title, meetingdate, and summary are required' });
        }
        const insertData = { 
            title, 
            meetingdate, 
            summary,
            attendees: Number(attendees || 0),
            tags: tags || ''
        };

        const table = req.catalyst.datastore().table(TABLE);
        const row = await table.insertRow(insertData);
        res.status(201).json({ data: row });
    } catch (err) {
        console.error('[POST /minutes]', err);
        res.status(500).json({ error: 'Failed to create minute', details: err.message });
    }
});

/** DELETE /minutes/:id — remove meeting minute */
router.delete('/:id', async (req, res) => {
    try {
        const table = req.catalyst.datastore().table(TABLE);
        await table.deleteRow(req.params.id);
        res.json({ success: true });
    } catch (err) {
        console.error('[DELETE /minutes/:id]', err);
        res.status(500).json({ error: 'Failed to delete minute', details: err.message });
    }
});

module.exports = router;
