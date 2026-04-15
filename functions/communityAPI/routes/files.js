'use strict';
const { Router } = require('express');
const router = Router();
const { uploadAndRecord } = require('../services/filesService');

/**
 * POST /files/upload
 * Multi-file upload to Catalyst FileStore (targeted folder)
 */
router.post('/upload', async (req, res) => {
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({ error: 'No files were uploaded.' });
        }

        const { module: moduleName = 'General', recordId = '' } = req.body;
        const uploadedFiles = await uploadAndRecord(req, req.files.files, moduleName, recordId);

        res.json({ success: true, files: uploadedFiles });
    } catch (err) {
        console.error('[POST /files/upload]', err);
        res.status(500).json({ error: 'Upload failed', details: err.message });
    }
});

const { find } = require('../db/catalystDb');
const TABLES = require('../db/tables');

/**
 * GET /files/:module/:recordId
 * Fetch all attachments for a specific record
 */
router.get('/:module/:recordId', async (req, res) => {
    try {
        const { module: moduleName, recordId } = req.params;
        const data = await find(req, TABLES.FILES, {
            conditions: `module = '${moduleName}' AND recordId = '${recordId}'`,
            sortBy: 'createdAt',
            order: 'DESC'
        });
        res.json({ success: true, files: data });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch files', details: err.message });
    }
});

/**
 * GET /files/:id
 * Retrieve specific file metadata
 */
router.get('/:id', async (req, res) => {
    try {
        const row = await req.catalyst.datastore().table(TABLES.FILES).getRow(req.params.id);
        res.json({ data: row });
    } catch (err) {
        res.status(404).json({ error: 'File not found' });
    }
});

/**
 * GET /files/download/:id
 * Legacy support — Redirect to preview URL format or stream
 */
router.get('/download/:id', async (req, res) => {
    res.redirect(`https://www.zohoapis.com/catalyst/v1/filestore/files/${req.params.id}`);
});

module.exports = router;
