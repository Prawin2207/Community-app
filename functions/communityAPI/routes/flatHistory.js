'use strict';

const { Router } = require('express');
const router = Router();

const TABLE = 'FlatHistory';

/** GET /flat-history — list history, filter by flatId */
router.get('/', async (req, res) => {
    try {
        const { flatId } = req.query;
        let query = `SELECT * FROM ${TABLE}`;
        if (flatId) query += ` WHERE flatId = ${flatId}`;
        query += ` ORDER BY CREATEDTIME DESC`;

        const rows = await req.catalyst.zcql().executeZCQLQuery(query);
        const data = rows.map(r => r[TABLE] || r);
        res.json({ data });
    } catch (err) {
        console.error('[GET /flat-history]', err);
        res.status(500).json({ error: 'Failed to fetch flat history', details: err.message });
    }
});

/** POST /flat-history — log an event */
router.post('/', async (req, res) => {
    try {
        const { flatId, entityType, entityId, entityName, eventType, eventDate, notes } = req.body;
        if (!flatId || !entityType || !eventType) {
            return res.status(400).json({ error: 'flatId, entityType, eventType are required' });
        }
        const insertData = {
            flatId: flatId.toString(),
            entityType: String(entityType),
            eventType: String(eventType),
            eventDate: eventDate || new Date().toISOString().split('T')[0],
        };
        if (entityId) insertData.entityId = entityId.toString();
        if (entityName) insertData.entityName = entityName;
        if (notes) insertData.notes = notes;

        const table = req.catalyst.datastore().table(TABLE);
        const row = await table.insertRow(insertData);
        res.status(201).json({ data: row });
    } catch (err) {
        console.error('[POST /flat-history]', err);
        res.status(500).json({ error: 'Failed to log flat history', details: err.message });
    }
});

module.exports = router;
