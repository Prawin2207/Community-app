'use strict';
const { Router } = require('express');
const router = Router();
const { query, insert, update, remove, getRow } = require('../db/catalystDb');
const { requireSuperAdmin, ROLES } = require('../middleware/community');
const TABLES = require('../db/tables');

/**
 * Community management routes — Super Admin only.
 * These routes do NOT use extractCommunity (super admin acts globally).
 * verifyToken is applied in index.js before this router.
 *
 * GET    /communities           — list all communities
 * GET    /communities/:id       — get one community
 * POST   /communities           — create new community (onboarding)
 * PATCH  /communities/:id       — update community details
 * DELETE /communities/:id       — deactivate community
 */

// All routes in this file require super_admin role.
// Since extractCommunity isn't run, we check role from Catalyst user metadata.
// For simplicity we trust the Users record.
const superAdminOnly = async (req, res, next) => {
    try {
        const userManagement = req.catalyst.userManagement();
        const catalystUser   = await userManagement.getCurrentUser();
        const catalystUserId = catalystUser?.user_id;

        const rows = await query(req, `SELECT * FROM ${TABLES.USERS} WHERE catalystUserId = '${catalystUserId}' LIMIT 1`);

        if (!rows.length) return res.status(403).json({ error: 'User not found in system.' });
        const userRecord = rows[0];

        if (userRecord.role !== ROLES.SUPER_ADMIN) {
            return res.status(403).json({ error: 'Super Admin access required.', code: 'INSUFFICIENT_ROLE' });
        }

        req.user       = catalystUser;
        req.userRecord = userRecord;
        req.role       = userRecord.role;
        next();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/** GET /communities */
router.get('/', superAdminOnly, async (req, res) => {
    try {
        const rows = await query(req, `SELECT * FROM ${TABLES.COMMUNITIES} ORDER BY createdAt DESC`);
        res.json({ data: rows });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch communities', details: err.message });
    }
});

/** GET /communities/:id */
router.get('/:id', superAdminOnly, async (req, res) => {
    try {
        const row = await getRow(req, TABLES.COMMUNITIES, req.params.id);
        if (!row) return res.status(404).json({ error: 'Community not found' });
        res.json({ data: row });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /communities
 * Creates a new community and its first admin user record.
 * Body: { name, address, city, state, pincode, adminFirstName, adminLastName, adminEmail, adminPassword, totalBlocks, totalFlats }
 */
router.post('/', superAdminOnly, async (req, res) => {
    try {
        const {
            name, address, city = '', state = '', country = 'India', pincode = '',
            adminFirstName, adminLastName, adminEmail, adminPassword,
            totalBlocks = 1, totalFlats = 0, plan = 'standard', timezone = 'Asia/Kolkata',
        } = req.body;

        if (!name || !address || !adminFirstName || !adminLastName || !adminEmail || !adminPassword) {
            return res.status(400).json({
                error: 'name, address, adminFirstName, adminLastName, adminEmail, adminPassword are required',
            });
        }

        // 1. Create the community row first (we need its ROWID for the admin user)
        const now = new Date().toISOString();
        const community = await req.catalyst.datastore().table(TABLES.COMMUNITIES).insertRow({
            name,
            address,
            city,
            state,
            country,
            pincode,
            totalBlocks: totalBlocks.toString(),
            totalFlats:  totalFlats.toString(),
            plan,
            timezone,
            status:    'active',
            createdAt: now,
            updatedAt: now,
        });

        const communityId = community.ROWID || community[TABLES.COMMUNITIES]?.ROWID;

        // 2. Create Catalyst user for the community admin
        let catalystUserId = '';
        try {
            const userManagement = req.catalyst.userManagement();
            const newUser = await userManagement.signUp({
                first_name: adminFirstName,
                last_name:  adminLastName,
                email_id:   adminEmail,
                password:   adminPassword,
            });
            catalystUserId = newUser.user_id || newUser.user_details?.user_id || '';
        } catch (signupErr) {
            if (!signupErr.message?.includes('already exists')) throw signupErr;
            // If already exists, proceed — admin will be linked by email
            console.warn('[POST /communities] Admin user already exists in Catalyst:', adminEmail);
        }

        // 3. Create admin User record in our Users table
        const adminUser = await req.catalyst.datastore().table(TABLES.USERS).insertRow({
            communityId:    communityId.toString(),
            catalystUserId: catalystUserId.toString(),
            firstName:      adminFirstName,
            lastName:       adminLastName,
            email:          adminEmail,
            role:           ROLES.COMMUNITY_ADMIN,
            isVerified:     'false',
            status:         'pending',
            createdAt:      now,
            updatedAt:      now,
        });

        const adminUserId = adminUser.ROWID || adminUser[TABLES.USERS]?.ROWID;

        // 4. Update community with adminUserId
        await req.catalyst.datastore().table(TABLES.COMMUNITIES).updateRow({
            ROWID:       communityId.toString(),
            adminUserId: adminUserId.toString(),
            updatedAt:   now,
        });

        res.status(201).json({
            message:     'Community created successfully. Admin must verify email before logging in.',
            community:   { id: communityId, name },
            adminUser:   { id: adminUserId, email: adminEmail, role: ROLES.COMMUNITY_ADMIN },
        });
    } catch (err) {
        console.error('[POST /communities]', err);
        res.status(500).json({ error: 'Failed to create community', details: err.message });
    }
});

/** PATCH /communities/:id — update community settings */
router.patch('/:id', superAdminOnly, async (req, res) => {
    try {
        const { name, address, city, state, pincode, plan, status, timezone, logoUrl } = req.body;
        const updateData = { ROWID: req.params.id, updatedAt: new Date().toISOString() };

        if (name      !== undefined) updateData.name      = name;
        if (address   !== undefined) updateData.address   = address;
        if (city      !== undefined) updateData.city      = city;
        if (state     !== undefined) updateData.state     = state;
        if (pincode   !== undefined) updateData.pincode   = pincode;
        if (plan      !== undefined) updateData.plan      = plan;
        if (status    !== undefined) updateData.status    = status;
        if (timezone  !== undefined) updateData.timezone  = timezone;
        if (logoUrl   !== undefined) updateData.logoUrl   = logoUrl;

        const row = await req.catalyst.datastore().table(TABLES.COMMUNITIES).updateRow(updateData);
        res.json({ data: row });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/** DELETE /communities/:id — deactivate (soft delete) */
router.delete('/:id', superAdminOnly, async (req, res) => {
    try {
        await req.catalyst.datastore().table(TABLES.COMMUNITIES).updateRow({
            ROWID:     req.params.id,
            status:    'suspended',
            updatedAt: new Date().toISOString(),
        });
        res.json({ success: true, message: 'Community suspended.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
