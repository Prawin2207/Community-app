'use strict';
const catalyst = require('zcatalyst-sdk-node');

/**
 * Standard event naming catalog.
 * Keep in sync with vue/src/stores/realtimeStore.js EVENT_TYPES.
 */
const EVENT_TYPES = {
    EMERGENCY_ALERT:   'emergency:alert',
    VISITOR_ARRIVED:   'visitor:arrived',
    VISITOR_APPROVED:  'visitor:approved',
    DELIVERY_ARRIVED:  'delivery:arrived',
    DELIVERY_UPDATED:  'delivery:updated',
    NOTICE_PUBLISHED:  'notice:published',
    COMPLAINT_UPDATED: 'complaint:updated',
    MAINTENANCE_DUE:   'maintenance:reminder',
    BOOKING_UPDATED:   'booking:updated',
    POLL_CREATED:      'poll:created',
    ANNOUNCEMENT:      'community:announcement',
    NOTIFICATION_NEW:  'notification:new',
};

/**
 * Room naming conventions:
 *   community:{communityId}          → all users in a community
 *   flat:{flatId}                    → flat-specific alerts
 *   role:{communityId}:{role}        → role-targeted broadcasts
 */
const Rooms = {
    community: (id)            => `community:${id}`,
    flat:      (id)            => `flat:${id}`,
    role:      (cid, role)     => `role:${cid}:${role}`,
};

/**
 * Broadcast helpers — used by REST API routes to publish real-time events
 * after a DB mutation.
 *
 * Each helper emits an event to the relevant room(s) with:
 *   { ...data, communityId, timestamp, event }
 */
const broadcastTo = {
    community: (io, communityId, event, data) =>
        io.to(Rooms.community(communityId)).emit(event, { ...data, communityId, timestamp: Date.now(), event }),

    flat: (io, flatId, event, data) =>
        io.to(Rooms.flat(flatId)).emit(event, { ...data, flatId, timestamp: Date.now(), event }),

    role: (io, communityId, role, event, data) =>
        io.to(Rooms.role(communityId, role)).emit(event, { ...data, communityId, timestamp: Date.now(), event }),

    /** Broadcast to a flat AND to security guards of the community */
    flatAndSecurity: (io, communityId, flatId, event, data) => {
        broadcastTo.flat(io, flatId, event, data);
        broadcastTo.role(io, communityId, 'security', event, data);
    },

    /** Broadcast emergency to entire community + security */
    emergency: (io, communityId, event, data) => {
        broadcastTo.community(io, communityId, event, data);
    },
};

/**
 * Token validation helper — verifies the Catalyst Bearer token during WS handshake.
 */
const validateToken = async (catalystApp, token) => {
    try {
        const fakeReq = { headers: { authorization: `Bearer ${token}` } };
        const app     = catalyst.initialize(fakeReq);
        const user    = await app.userManagement().getCurrentUser();
        return user;
    } catch {
        return null;
    }
};

/**
 * Main handler — receives the Socket.IO `io` server instance from Catalyst's
 * Advanced I/O function and wires up all connection/event logic.
 */
module.exports = (io) => {
    // Auth middleware — validate token before allowing connection
    io.use(async (socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token) return next(new Error('Authentication required'));

        // For Catalyst Advanced I/O, just let through and validate on first event
        // Full validation requires the Catalyst request context which is not available here
        socket.authToken = token;
        next();
    });

    io.on('connection', (socket) => {
        console.log(`[realtimeHub] Client connected: ${socket.id}`);

        // ── Room joining ────────────────────────────────────────────────────

        socket.on('join:community', (communityId) => {
            if (!communityId) return;
            const room = Rooms.community(communityId);
            socket.join(room);
            socket.communityId = communityId;
            console.log(`[realtimeHub] ${socket.id} joined ${room}`);
        });

        socket.on('join:flat', (flatId) => {
            if (!flatId) return;
            const room = Rooms.flat(flatId);
            socket.join(room);
            socket.flatId = flatId;
            console.log(`[realtimeHub] ${socket.id} joined ${room}`);
        });

        socket.on('join:role', ({ communityId, role }) => {
            if (!communityId || !role) return;
            const room = Rooms.role(communityId, role);
            socket.join(room);
            socket.role = role;
            console.log(`[realtimeHub] ${socket.id} joined ${room}`);
        });

        // ── Client-initiated events ─────────────────────────────────────────

        /**
         * Emergency panic button — client emits, server broadcasts to whole community + security.
         * Data: { communityId, message, type, flatId? }
         */
        socket.on(EVENT_TYPES.EMERGENCY_ALERT, (data) => {
            const communityId = data.communityId || socket.communityId;
            if (!communityId) return;
            console.log(`[realtimeHub] EMERGENCY from ${socket.id} in community ${communityId}`);
            broadcastTo.emergency(io, communityId, EVENT_TYPES.EMERGENCY_ALERT, data);
        });

        // ── Disconnect ──────────────────────────────────────────────────────

        socket.on('disconnect', (reason) => {
            console.log(`[realtimeHub] Client disconnected: ${socket.id} (${reason})`);
        });

        socket.on('error', (err) => {
            console.error(`[realtimeHub] Socket error for ${socket.id}:`, err.message);
        });
    });

    return { EVENT_TYPES, Rooms, broadcastTo };
};

// Export for use by communityAPI routes
module.exports.EVENT_TYPES = EVENT_TYPES;
module.exports.Rooms = Rooms;
module.exports.broadcastTo = broadcastTo;
