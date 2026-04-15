'use strict';

const { Router } = require('express');
const router = Router();

const TABLE = 'MaintenanceNotifications';

/** GET /maintenance-notifications — list all */
router.get('/', async (req, res) => {
    try {
        const { flatId, month } = req.query;
        let query = `SELECT * FROM ${TABLE}`;
        const conditions = [];
        if (flatId) conditions.push(`flatId = ${flatId}`);
        if (month) conditions.push(`month = '${month}'`);
        if (conditions.length) query += ` WHERE ${conditions.join(' AND ')}`;
        query += ` ORDER BY CREATEDTIME DESC`;

        const rows = await req.catalyst.zcql().executeZCQLQuery(query);
        const data = rows.map(r => r[TABLE] || r);
        res.json({ data });
    } catch (err) {
        console.error('[GET /maintenance-notifications]', err);
        res.status(500).json({ error: 'Failed to fetch notifications', details: err.message });
    }
});

/** POST /maintenance-notifications — send maintenance notification */
router.post('/', async (req, res) => {
    try {
        const { flatId, sentTo, amount, dueDate, month, notes, sentByAdmin } = req.body;
        if (!sentTo || !amount || !dueDate || !month) {
            return res.status(400).json({ error: 'sentTo, amount, dueDate, month are required' });
        }
        const insertData = {
            sentTo: String(sentTo), // "owner", "tenant", "both"
            amount: parseFloat(amount),
            dueDate: String(dueDate),
            month: String(month),
            status: 'sent',
        };
        // flatId is optional (null means "all flats")
        if (flatId !== undefined && flatId !== null && flatId !== '') {
            insertData.flatId = flatId.toString();
        }
        if (notes) insertData.notes = notes;
        if (sentByAdmin) insertData.sentByAdmin = sentByAdmin;

        const table = req.catalyst.datastore().table(TABLE);
        const row = await table.insertRow(insertData);
        res.status(201).json({ data: row });
    } catch (err) {
        console.error('[POST /maintenance-notifications]', err);
        res.status(500).json({ error: 'Failed to send maintenance notification', details: err.message });
    }
});

/** POST /maintenance-notifications/rent-remind — owner sends rent reminder */
router.post('/rent-remind', async (req, res) => {
    try {
        const { flatId, ownerId, tenantId, tenantName, ownerName, rentAmount, dueDate, month, message } = req.body;
        if (!flatId || !rentAmount || !month) {
            return res.status(400).json({ error: 'flatId, rentAmount, month are required' });
        }
        const insertData = {
            flatId: flatId.toString(),
            sentTo: 'tenant',
            amount: parseFloat(rentAmount),
            dueDate: String(dueDate || ''),
            month: String(month),
            status: 'sent',
            notes: message || `Rent reminder for ${month}`,
        };
        if (ownerId) insertData.sentByAdmin = ownerName || 'Owner';

        const table = req.catalyst.datastore().table('RentReminders');
        const row = await table.insertRow(insertData);
        res.status(201).json({ data: row });
    } catch (err) {
        console.error('[POST /maintenance-notifications/rent-remind]', err);
        res.status(500).json({ error: 'Failed to send rent reminder', details: err.message });
    }
});

module.exports = router;
