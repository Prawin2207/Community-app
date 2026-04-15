const catalyst = require('zcatalyst-sdk-node');
const express = require('express');
const app = express();

app.use((req, res, next) => {
    req.catalyst = catalyst.initialize(req);
    next();
});

app.get('/list-folders', async (req, res) => {
    try {
        const filestore = req.catalyst.filestore();
        const folders = await filestore.getAllFolders();
        res.json(folders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = app;
