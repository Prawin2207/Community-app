'use strict';

const { Router } = require('express');
const router = Router();

const TABLE = 'Deliveries';

/** GET /deliveries — list active and history */
router.get('/', async (req, res) => {
    try {
        const rows = await req.catalyst.zcql().executeZCQLQuery(`SELECT * FROM ${TABLE} ORDER BY CREATEDTIME DESC`);
        const data = rows.map(r => r[TABLE] || r);
        res.json({ data });
    } catch (err) {
        console.error('[GET /deliveries]', err);
        res.status(500).json({ error: 'Failed to fetch deliveries', details: err.message });
    }
});

/** POST /deliveries — log a new delivery */
router.post('/', async (req, res) => {
    try {
        const { Deliveriessupplier, supplier, resident, apartment, type } = req.body;
        const actualSupplier = Deliveriessupplier || supplier;
        
        if (!actualSupplier || !resident || !apartment) {
            return res.status(400).json({ error: 'Supplier, resident, and apartment are required' });
        }
        
        const insertData = { 
            Deliveriessupplier: actualSupplier, 
            resident, 
            apartment, 
            type: type || 'Standard',
            status: 'awaiting_pickup'
        };

        const table = req.catalyst.datastore().table(TABLE);
        
        try {
            const row = await table.insertRow(insertData);
            return res.status(201).json({ data: row });
        } catch (insertErr) {
            // Fallback for column naming mismatch
            console.warn('[POST /deliveries] Insert failed, trying fallback schema...');
            const fallbackData = { ...insertData };
            delete fallbackData.Deliveriessupplier;
            fallbackData.supplier = actualSupplier;
            
            try {
                const row = await table.insertRow(fallbackData);
                return res.status(201).json({ data: row });
            } catch (secondErr) {
                throw insertErr; // Throw original error if fallback also fails
            }
        }
    } catch (err) {
        console.error('[POST /deliveries]', err);
        res.status(500).json({ 
            error: 'Failed to log delivery', 
            details: err.message,
            catalystCode: err.code,
            hint: 'Check if column is "Deliveriessupplier" or "supplier"' 
        });
    }
});

/** PATCH /deliveries/:id — update delivery status */
router.patch('/:id', async (req, res) => {
    try {
        const { status } = req.body;
        const updateData = { ROWID: req.params.id };
        if (status) updateData.status = status;

        const table = req.catalyst.datastore().table(TABLE);
        const row = await table.updateRow(updateData);
        res.json({ data: row });
    } catch (err) {
        console.error('[PATCH /deliveries/:id]', err);
        res.status(500).json({ error: 'Failed to update delivery', details: err.message });
    }
});

module.exports = router;
