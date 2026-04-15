'use strict';

const { query } = require('../db/catalystDb');

/**
 * ROLE DEFINITIONS
 * Single source of truth for all valid roles.
 * Keep in sync with vue/src/data/mockData.js ROLES constant.
 */
const ROLES = {
    SUPER_ADMIN:      'super_admin',
    COMMUNITY_ADMIN:  'community_admin',
    OWNER:            'owner',
    TENANT:           'tenant',
    FAMILY_MEMBER:    'family_member',
    SECURITY:         'security',
    TECHNICIAN:       'technician',
    ACCOUNTANT:       'accountant',
    HR_MANAGER:       'hr_manager',
    COMMITTEE_MEMBER: 'committee_member',
    DELIVERY_AGENT:   'delivery_agent',
};

const ADMIN_ROLES = [ROLES.SUPER_ADMIN, ROLES.COMMUNITY_ADMIN];
const RESIDENT_ROLES = [ROLES.OWNER, ROLES.TENANT, ROLES.FAMILY_MEMBER];
const STAFF_ROLES = [ROLES.SECURITY, ROLES.TECHNICIAN, ROLES.ACCOUNTANT, ROLES.HR_MANAGER, ROLES.DELIVERY_AGENT];

/**
 * extractCommunity — resolves req.userRecord, req.communityId, req.role
 *
 * Must run AFTER verifyToken (which sets req.user).
 * Looks up the Users table by catalystUserId to fetch the local user record
 * including their role and communityId.
 *
 * Usage:  router.get('/path', verifyToken, extractCommunity, handler)
 */
const extractCommunity = async (req, res, next) => {
    try {
        const catalystUserId = req.user?.user_id || req.user?.userId;
        if (!catalystUserId) {
            return res.status(401).json({ error: 'Authenticated user identity is missing.' });
        }

        // Super admin bypass: use X-Community-ID header when acting on behalf of any community
        const headerCommunityId = req.headers['x-community-id'];

        const rows = await query(
            req,
            `SELECT * FROM Users WHERE catalystUserId = '${catalystUserId}' LIMIT 1`
        );

        if (!rows.length) {
            return res.status(403).json({
                error: 'This Catalyst account is not linked to any community. Please complete onboarding.',
                code:  'NO_COMMUNITY_PROFILE',
            });
        }

        const userRecord = rows[0];
        req.userRecord   = userRecord;
        req.role         = userRecord.role || ROLES.TENANT;
        req.communityId  = userRecord.communityId;

        // Super admin can scope to a different community via header
        if (req.role === ROLES.SUPER_ADMIN && headerCommunityId) {
            req.communityId = headerCommunityId;
        }

        if (!req.communityId) {
            return res.status(403).json({
                error: 'User is not associated with a community.',
                code:  'MISSING_COMMUNITY_ID',
            });
        }

        next();
    } catch (err) {
        console.error('[extractCommunity]', err.message);
        return res.status(500).json({ error: 'Failed to resolve community context.', details: err.message });
    }
};

/**
 * requireRole(...allowedRoles)
 * Returns a middleware that allows only the specified roles through.
 *
 * Usage:
 *   router.delete('/notices/:id', verifyToken, extractCommunity,
 *     requireRole('super_admin', 'community_admin'), handler)
 */
const requireRole = (...allowedRoles) => (req, res, next) => {
    if (!req.role) {
        return res.status(403).json({ error: 'Role not resolved. Call extractCommunity before requireRole.' });
    }
    if (!allowedRoles.includes(req.role)) {
        return res.status(403).json({
            error:    `Access denied. This action requires: ${allowedRoles.join(' or ')}.`,
            yourRole: req.role,
            code:     'INSUFFICIENT_ROLE',
        });
    }
    next();
};

/**
 * Shorthand guards — compose these directly in routes.
 */
const requireAdmin        = requireRole(...ADMIN_ROLES);
const requireOwnerOrAdmin = requireRole(...ADMIN_ROLES, ROLES.OWNER);
const requireResident     = requireRole(...RESIDENT_ROLES, ...ADMIN_ROLES);
const requireSuperAdmin   = requireRole(ROLES.SUPER_ADMIN);
const requireAccounting   = requireRole(...ADMIN_ROLES, ROLES.ACCOUNTANT);
const requireSecurity     = requireRole(...ADMIN_ROLES, ROLES.SECURITY);

/**
 * communityOwnershipCheck — verify a resource belongs to the current community.
 * Call this after fetching a row from DB to prevent horizontal privilege escalation.
 *
 * Usage:
 *   const flat = await getRow(req, TABLES.FLATS, req.params.id);
 *   communityOwnershipCheck(req, res, flat, 'Flat');
 */
const communityOwnershipCheck = (req, res, record, entityName = 'Resource') => {
    if (!record) {
        res.status(404).json({ error: `${entityName} not found.` });
        return false;
    }
    const recordCommunityId = String(record.communityId || '');
    const reqCommunityId    = String(req.communityId || '');
    if (recordCommunityId !== reqCommunityId) {
        res.status(403).json({
            error: `${entityName} does not belong to your community.`,
            code:  'CROSS_COMMUNITY_ACCESS',
        });
        return false;
    }
    return true;
};

module.exports = {
    ROLES,
    ADMIN_ROLES,
    RESIDENT_ROLES,
    STAFF_ROLES,
    extractCommunity,
    requireRole,
    requireAdmin,
    requireOwnerOrAdmin,
    requireResident,
    requireSuperAdmin,
    requireAccounting,
    requireSecurity,
    communityOwnershipCheck,
};
