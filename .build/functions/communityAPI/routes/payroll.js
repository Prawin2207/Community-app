'use strict';

const { Router } = require('express');
const router = Router();

const TABLE = 'Payroll';

/** GET /payroll — list all payroll records */
router.get('/', async (req, res) => {
    try {
        let rows;
        try {
            rows = await req.catalyst.zcql().executeZCQLQuery(`SELECT * FROM ${TABLE} ORDER BY CREATEDTIME DESC`);
        } catch (qErr) {
            rows = await req.catalyst.zcql().executeZCQLQuery(`SELECT * FROM ${TABLE}`);
        }
        const data = rows.map(r => r[TABLE] || r);
        res.json({ data });
    } catch (err) {
        console.error('[GET /payroll]', err);
        res.status(500).json({ error: 'Failed to fetch payroll', details: err.message, catalystCode: err.code });
    }
});

/** POST /payroll — generate a payroll record */
router.post('/', async (req, res) => {
    try {
        const { staffId, amount, month, payrolldate, status } = req.body;
        if (!staffId || !amount || !month) {
            return res.status(400).json({ error: 'staffId, amount, and month are required' });
        }
        const insertData = { 
            staffId: staffId.toString(),
            amount: parseFloat(amount),
            payrollmonth: month,
            payrolldate: payrolldate || new Date().toISOString(),
            status: status || 'Pending'
        };

        const table = req.catalyst.datastore().table(TABLE);
        try {
            const row = await table.insertRow(insertData);
            return res.status(201).json({ data: row });
        } catch (insertErr) {
            throw insertErr;
        }
    } catch (err) {
        console.error('[POST /payroll]', err);
        res.status(500).json({ error: 'Failed to create payroll record', details: err.message, catalystCode: err.code });
    }
});

/** PATCH /payroll/:id — update status (Paid/Pending) */
router.patch('/:id', async (req, res) => {
    try {
        const { status } = req.body;
        const updateData = { ROWID: req.params.id };
        if (status) updateData.status = status;

        const table = req.catalyst.datastore().table(TABLE);
        const row = await table.updateRow(updateData);
        res.json({ data: row });
    } catch (err) {
        console.error('[PATCH /payroll/:id]', err);
        res.status(500).json({ error: 'Failed to update payroll', details: err.message });
    }
});

module.exports = router;
