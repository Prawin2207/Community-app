'use strict';

/**
 * verifyToken — validates the Catalyst Bearer token.
 *
 * Catalyst's SDK reads the token from:
 *   Authorization: Bearer <token>   ← we validate this
 *   catalyst-session-id cookie       ← SDK reads automatically
 *
 * On success: sets req.user = Catalyst user object
 * On failure: returns 401
 */
const verifyToken = async (req, res, next) => {
    try {
        const auth = req.headers.authorization;
        if (!auth || !auth.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'Missing or invalid Authorization header. Expected: Bearer <token>',
                code:  'MISSING_TOKEN',
            });
        }

        const userManagement = req.catalyst.userManagement();
        // getCurrentUser() validates the token from the request context
        const user = await userManagement.getCurrentUser();
        req.user = user;
        next();
    } catch (err) {
        console.error('[verifyToken] Auth Error:', err.message || err);
        console.error('[verifyToken] Full Error:', JSON.stringify(err, null, 2));
        
        return res.status(401).json({
            error: 'Unauthorized — invalid or expired token. Please log in again.',
            code:  'INVALID_TOKEN',
            details: err.message
        });
    }
};

module.exports = { verifyToken };
