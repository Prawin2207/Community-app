'use strict';

const { Router } = require('express');
const router = Router();

const TABLE = 'CommunityFeed';

/** GET /feed — list all posts */
router.get('/', async (req, res) => {
    try {
        const rows = await req.catalyst.zcql().executeZCQLQuery(`SELECT * FROM ${TABLE} ORDER BY CREATEDTIME DESC`);
        const data = rows.map(r => r[TABLE] || r);
        res.json({ data });
    } catch (err) {
        console.error('[GET /feed]', err);
        res.status(500).json({ error: 'Failed to fetch feed', details: err.message });
    }
});

/** POST /feed — share a new post */
router.post('/', async (req, res) => {
    try {
        const { author, residentId, apartment, content, category } = req.body;
        if (!content || !author) {
            return res.status(400).json({ error: 'author and content are required' });
        }
        const insertData = { 
            author, 
            content,
            apartment: apartment || '',
            category: category || 'Announcement',
            likes: 0,
            comments: 0
        };
        if (residentId) insertData.residentId = residentId.toString();

        const table = req.catalyst.datastore().table(TABLE);
        const row = await table.insertRow(insertData);
        res.status(201).json({ data: row });
    } catch (err) {
        console.error('[POST /feed]', err);
        res.status(500).json({ 
            error: 'Failed to post to feed', 
            details: err.message, 
            catalystCode: err.code,
            hint: `Check if table "${TABLE}" exists in Catalyst Datastore`
        });
    }
});

/** PATCH /feed/:id — like or update post */
router.patch('/:id', async (req, res) => {
    try {
        const { likes, comments } = req.body;
        const updateData = { ROWID: req.params.id };
        if (likes !== undefined) updateData.likes = Number(likes);
        if (comments !== undefined) updateData.comments = Number(comments);

        const table = req.catalyst.datastore().table(TABLE);
        const row = await table.updateRow(updateData);
        res.json({ data: row });
    } catch (err) {
        console.error('[PATCH /feed/:id]', err);
        res.status(500).json({ error: 'Failed to update post', details: err.message });
    }
});

module.exports = router;
