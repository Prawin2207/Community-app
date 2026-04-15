'use strict';
const { Router } = require('express');
const router = Router();
const { insert, query, scopedQuery } = require('../db/catalystDb');
const TABLES = require('../db/tables');

/**
 * POST /auth/signup
 * Public route — first step of onboarding a new user.
 * Body: { firstName, lastName, email, password, communityId, role?, phone? }
 *
 * IMPORTANT: communityId is now REQUIRED. A user must belong to a community.
 * The Super Admin's communityId is '0' by convention.
 */
router.post('/signup', async (req, res) => {
    try {
        const {
            firstName, lastName, email, password,
            communityId, role = 'tenant', phone = '',
        } = req.body;

        if (!firstName || !lastName || !email || !password || !communityId) {
            return res.status(400).json({
                error: 'firstName, lastName, email, password and communityId are required',
            });
        }
        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }

        const userManagement = req.catalyst.userManagement();

        // 1. Create Catalyst user account
        const newCatalystUser = await userManagement.signUp({
            first_name: firstName,
            last_name:  lastName,
            email_id:   email,
            password,
        });

        const catalystUserId = newCatalystUser.user_id || newCatalystUser.user_details?.user_id;

        // 2. Insert a row in our Users table for RBAC + community context
        const now = new Date().toISOString();
        await req.catalyst.datastore().table(TABLES.USERS).insertRow({
            catalystUserId: catalystUserId?.toString() || '',
            communityId:    communityId.toString(),
            firstName,
            lastName,
            email,
            phone,
            role,
            isVerified:     'false',
            status:         'pending',
            createdAt:      now,
            updatedAt:      now,
        });

        return res.status(201).json({
            message: 'Account created. Please verify your email before logging in.',
            user:    { email, role, communityId },
        });
    } catch (err) {
        console.error('[POST /auth/signup]', err);
        if (err.message?.includes('already exists') || err.status === 409) {
            return res.status(409).json({ error: 'An account with this email already exists.' });
        }
        return res.status(400).json({ error: err.message || 'Signup failed. Please try again.' });
    }
});

/**
 * POST /auth/login
 * Body: { email, password }
 * Returns: token + user profile (including communityId, role, flatId)
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const userManagement = req.catalyst.userManagement();
        const signInResult = await userManagement.signIn({ email_id: email, password });

        const userDetails    = signInResult.user_details || {};
        const catalystUserId = userDetails.user_id || signInResult.user_id;
        const token          = signInResult.token || signInResult.access_token || '';

        // Fetch our Users record to get role, communityId, flatId
        const rows = await query(
            req,
            `SELECT * FROM ${TABLES.USERS} WHERE catalystUserId = '${catalystUserId}' LIMIT 1`
        );

        let userRecord = rows[0] || null;

        // Update lastLoginAt (fire-and-forget)
        if (userRecord?.ROWID) {
            req.catalyst.datastore().table(TABLES.USERS).updateRow({
                ROWID:       userRecord.ROWID,
                lastLoginAt: new Date().toISOString(),
                updatedAt:   new Date().toISOString(),
                isVerified:  'true',
                status:      'active',
            }).catch(e => console.warn('[login lastLoginAt update]', e.message));
        }

        return res.json({
            token,
            user: {
                userId:      catalystUserId,
                name:        `${userDetails.first_name || ''} ${userDetails.last_name || ''}`.trim() || email,
                email:       userDetails.email_id || email,
                role:        userRecord?.role || 'tenant',
                communityId: userRecord?.communityId || null,
                flatId:      userRecord?.flatId || null,
                profilePhoto: userRecord?.profilePhoto || null,
            },
        });
    } catch (err) {
        console.error('[POST /auth/login]', err);
        return res.status(401).json({ error: err.message || 'Authentication failed. Check your email and password.' });
    }
});

/**
 * POST /auth/logout
 */
router.post('/logout', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (token) {
            try {
                await req.catalyst.userManagement().signOut(token);
            } catch (e) {
                console.warn('[POST /auth/logout] signOut error (ignored):', e.message);
            }
        }
        return res.json({ message: 'Logged out successfully' });
    } catch (_err) {
        return res.json({ message: 'Logged out' });
    }
});

/**
 * GET /auth/me
 * Returns current user profile from our Users table (not just Catalyst identity).
 */
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'No token provided', code: 'MISSING_TOKEN' });

        const userManagement = req.catalyst.userManagement();
        const catalystUser   = await userManagement.getCurrentUser();
        const catalystUserId = catalystUser?.user_id;

        const rows = await query(
            req,
            `SELECT * FROM ${TABLES.USERS} WHERE catalystUserId = '${catalystUserId}' LIMIT 1`
        );

        if (!rows.length) {
            return res.status(404).json({
                error: 'User profile not found in community system.',
                code:  'NO_COMMUNITY_PROFILE',
            });
        }

        return res.json({ user: rows[0] });
    } catch (err) {
        console.error('[GET /auth/me]', err.message);
        return res.status(401).json({ error: 'Invalid or expired token', code: 'INVALID_TOKEN' });
    }
});

module.exports = router;
