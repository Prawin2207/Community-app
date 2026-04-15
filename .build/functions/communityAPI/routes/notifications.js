'use strict';
const { Router } = require('express');
const router = Router();
const { scopedQuery, insert, update, remove, getRow } = require('../db/catalystDb');
const { requireRole, ROLES } = require('../middleware/community');
const TABLES = require('../db/tables');

/**
 * GET /notifications
 * Returns all notifications for the current user.
 * Unread-first, then by date descending.
 */
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 50, unreadOnly = 'false' } = req.query;
        let conditions = `userId = ${req.userRecord.ROWID}`;
        if (unreadOnly === 'true') conditions += ` AND isRead = 'false'`;

        const data = await find(req, TABLES.NOTIFICATIONS, {
            conditions,
            page: parseInt(page),
            limit: parseInt(limit),
            sortBy: 'isRead ASC, createdAt',
            order: 'DESC'
        });
        res.json({ data });
    } catch (err) {
        console.error('[GET /notifications]', err);
        res.status(500).json({ error: 'Failed to fetch notifications', details: err.message });
    }
});

/**
 * GET /notifications/unread-count
 * Quick badge count endpoint.
 */
router.get('/unread-count', async (req, res) => {
    try {
            TABLES.NOTIFICATIONS,
            `userId = ${req.userRecord.ROWID} AND isRead = 'false'`,
            'ROWID'
        );
        res.json({ count: rows.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * PATCH /notifications/:id/read
 * Mark a single notification as read.
 */
router.patch('/:id/read', async (req, res) => {
    try {
        const row = await getRow(req, TABLES.NOTIFICATIONS, req.params.id);
        if (!row) return res.status(404).json({ error: 'Notification not found' });

        // Users can only mark their own notifications read
        if (String(row.userId) !== String(req.userRecord.ROWID)) {
            return res.status(403).json({ error: 'Cannot mark another user\'s notification as read' });
        }

        const updated = await update(req, TABLES.NOTIFICATIONS, {
            ROWID:  req.params.id,
            isRead: 'true',
        });
        res.json({ data: updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * PATCH /notifications/mark-all-read
 * Mark all of the current user's notifications as read.
 * Uses a workaround: fetch all unread IDs and update them one by one
 * (Catalyst doesn't support bulk UPDATE with WHERE).
 */
router.patch('/mark-all-read', async (req, res) => {
    try {
        const unread = await scopedQuery(
            req,
            TABLES.NOTIFICATIONS,
            `userId = ${req.userRecord.ROWID} AND isRead = 'false'`,
            'ROWID'
        );

        await Promise.all(unread.map(n =>
            update(req, TABLES.NOTIFICATIONS, { ROWID: n.ROWID, isRead: 'true' })
        ));

        res.json({ updated: unread.length, message: 'All notifications marked as read' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /notifications
 * Create a notification (admin/system use only).
 * For community-wide broadcasts, set userId = 'all' — the frontend fan-out handles it.
 */
router.post('/', requireRole(ROLES.SUPER_ADMIN, ROLES.COMMUNITY_ADMIN), async (req, res) => {
    try {
        const { userId, title, body, type = 'general', referenceId = '', referenceType = '' } = req.body;
        if (!userId || !title || !body) {
            return res.status(400).json({ error: 'userId, title, and body are required' });
        }

        const data = await insert(req, TABLES.NOTIFICATIONS, {
            communityId:   req.communityId.toString(),
            userId:        userId.toString(),
            title,
            body,
            type,
            referenceId:   referenceId.toString(),
            referenceType,
            isRead:        'false',
            deliveredAt:   new Date().toISOString(),
        });

        res.status(201).json({ data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * DELETE /notifications/:id
 * Soft-delete: admins or the notification owner can delete.
 */
router.delete('/:id', async (req, res) => {
    try {
        const row = await getRow(req, TABLES.NOTIFICATIONS, req.params.id);
        if (!row) return res.status(404).json({ error: 'Notification not found' });

        const isOwner = String(row.userId) === String(req.userRecord.ROWID);
        const isAdmin = [ROLES.SUPER_ADMIN, ROLES.COMMUNITY_ADMIN].includes(req.role);

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ error: 'Cannot delete another user\'s notification' });
        }

        await remove(req, TABLES.NOTIFICATIONS, req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
