'use strict';

/**
 * filesService.js
 * Specialized service for multi-tenant file management in Zoho Catalyst.
 * Targets Folder ID: 27219000000078976
 */

const TABLES = require('../db/tables');
const { insert } = require('../db/catalystDb');

const FOLDER_ID = '27219000000078976';

/**
 * Upload files to Filestore and save metadata to the Files table.
 * 
 * @param {object} req - Express request
 * @param {array} files - Array of files from express-fileupload
 * @param {string} moduleName - Target module (e.g. 'Complaints')
 * @param {string} recordId - Target row ID
 */
async function uploadAndRecord(req, files, moduleName, recordId = '') {
    const filestore = req.catalyst.filestore();
    const folder = filestore.folder(FOLDER_ID);
    
    const results = [];
    const filesArray = Array.isArray(files) ? files : [files];

    for (const file of filesArray) {
        // 1. Upload to Filestore
        const safeName = `${req.communityId}_${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
        const uploadResponse = await folder.uploadFile({
            code: file.data,
            name: safeName
        });

        const fileId = uploadResponse.id || uploadResponse.file_ID;

        // 2. Save metadata to Files Table
        const fileRecord = await insert(req, TABLES.FILES || 'Files', {
            fileId,
            fileName: file.name,
            fileType: file.mimetype,
            fileSize: file.size,
            module: moduleName,
            recordId: recordId?.toString() || '',
            uploadedAt: new Date().toISOString()
        });

        results.push({
            id: fileRecord.ROWID,
            fileId,
            fileName: file.name,
            url: `https://www.zohoapis.com/catalyst/v1/filestore/files/${fileId}`,
            uploadedAt: fileRecord.uploadedAt
        });
    }

    return results;
}

module.exports = { uploadAndRecord };
