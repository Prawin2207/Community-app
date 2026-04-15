'use strict';

/**
 * Centralized Express error handler.
 * Must be registered LAST: app.use(errorHandler)
 *
 * Usage in routes:
 *   next(new Error('something bad'))           → 500
 *   const e = new Error('not found'); e.status = 404; next(e)
 */
const errorHandler = (err, req, res, _next) => {
    const status  = err.status || err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    // Log full error server-side for debugging
    console.error(`[ErrorHandler] ${req.method} ${req.path} → ${status}: ${message}`, {
        body:  req.body,
        query: req.query,
        user:  req.userRecord?.ROWID || 'unauthenticated',
        community: req.communityId || 'unknown',
        stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
    });

    res.status(status).json({
        error:   message,
        status,
        path:    req.path,
        method:  req.method,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    });
};

/**
 * Wrap an async route handler so you never need to write try/catch.
 * Usage: router.get('/path', asyncHandler(async (req, res) => { ... }))
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { errorHandler, asyncHandler };
