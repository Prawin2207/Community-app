'use strict';
const express = require('express');
const cors    = require('cors');
const catalyst = require('zcatalyst-sdk-node');

const { verifyToken }    = require('./middleware/auth');
const { extractCommunity } = require('./middleware/community');
const { errorHandler }   = require('./middleware/errorHandler');
const fileUpload     = require('express-fileupload');

// ─── Route Modules ────────────────────────────────────────────────────────────
const authRoute                    = require('./routes/auth');
const communitiesRoute             = require('./routes/communities');
const usersRoute                   = require('./routes/users');
const flatsRoute                   = require('./routes/flats');
const flatOwnersRoute              = require('./routes/flatOwners');
const tenantsRoute                 = require('./routes/tenants');
const flatHistoryRoute             = require('./routes/flatHistory');
const noticesRoute                 = require('./routes/notices');
const complaintsRoute              = require('./routes/complaints');
const visitorsRoute                = require('./routes/visitors');
const gatePassesRoute              = require('./routes/gatePasses');
const deliveriesRoute              = require('./routes/deliveries');
const invoicesRoute                = require('./routes/invoices');
const maintenanceRoute             = require('./routes/maintenance');
const maintenanceNotificationsRoute = require('./routes/maintenanceNotifications');
const paymentsRoute                = require('./routes/payroll');      // billing payments
const bookingsRoute                = require('./routes/bookings');
const facilitiesRoute              = require('./routes/facilities');
const staffRoute                   = require('./routes/staff');
const tasksRoute                   = require('./routes/tasks');
const inventoryRoute               = require('./routes/inventory');
const domesticHelpRoute            = require('./routes/domesticHelp');
const alertsRoute                  = require('./routes/alerts');
const feedRoute                    = require('./routes/feed');
const proposalsRoute               = require('./routes/proposals');
const minutesRoute                 = require('./routes/minutes');
const rulesRoute                   = require('./routes/rules');
const assetsRoute                  = require('./routes/assets');
const notificationsRoute           = require('./routes/notifications');
// const adminDashboardRoute          = require('./routes/adminDashboard');
const owners                       = require('./routes/owners');
const residents                    = require('./routes/residents');
const filesRoute                    = require('./routes/files');

// ─── App Bootstrap ────────────────────────────────────────────────────────────
const app = express();

// Security: restrict CORS in production — update VITE_CORS_ORIGIN env var
const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : ['*'];

app.use(cors({
    origin: allowedOrigins.includes('*') ? '*' : (origin, cb) => {
        if (!origin || allowedOrigins.includes(origin)) cb(null, true);
        else cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));

// ─── Global Catalyst Initialization ──────────────────────────────────────────
// catalyst.initialize(req) must run before any route so req.catalyst is available.
app.use((req, _res, next) => {
    req.catalyst = catalyst.initialize(req);
    next();
});

// ─── Health Check (no auth required) ─────────────────────────────────────────
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'CommunityHub Pro API', version: '2.0.0' });
});

// ─── Public Routes (no auth) ──────────────────────────────────────────────────
app.use('/auth', authRoute);

/**
 * TEMP: Migration Route
 * Bootstraps the database with mock data from mockData.js
 */
app.get('/migration/seed-demo', async (req, res) => {
    try {
        const fs = require('fs');
        const path = require('path');
        const sandbox = {};
        const TABLES = require('./db/tables');

        const mockPath = 'c:/Users/Prawin/Desktop/AI TASK/ADDA/vue/src/data/mockData.js';
        if (!fs.existsSync(mockPath)) {
            return res.status(404).json({ error: 'mockData.js not found' });
        }

        const mockContent = fs.readFileSync(mockPath, 'utf8').replace(/export /g, '');
        require('vm').runInNewContext(mockContent, sandbox);

        // 1. Fetch Metadata
        const allTables = await req.catalyst.datastore().getAllTables();
        const schemaMap = {};
        allTables.forEach(t => {
            const name = t.table_name || t.tableName;
            schemaMap[name] = (t.column_details || []).map(c => c.column_name);
        });

        // 2. Resolve Community
        let communities = await req.catalyst.zcql().executeZCQLQuery('SELECT ROWID FROM Communities LIMIT 1');
        let communityId;
        if (!communities.length) {
            const newComm = await req.catalyst.datastore().table(TABLES.COMMUNITIES).insertRow({
                name: 'CommunityHub Pro Demo',
                address: '123 Demo Street',
                city: 'Demo City',
                status: 'active',
                createdAt: new Date().toISOString()
            });
            communityId = newComm.ROWID || newComm[TABLES.COMMUNITIES]?.ROWID;
        } else {
            communityId = communities[0].Communities.ROWID;
        }

        const migrationMap = [
            { mockArr: sandbox.mockResidents,        table: TABLES.RESIDENTS,    name: 'Residents' },
            { mockArr: sandbox.mockOwners,           table: TABLES.OWNERS,       name: 'Owners' },
            { mockArr: sandbox.mockFlats,            table: TABLES.FLATS,        name: 'Flats' },
            { mockArr: sandbox.mockStaff,            table: TABLES.STAFF,        name: 'Staff' },
            { mockArr: sandbox.mockInvoices,         table: TABLES.MAINTENANCE_INVOICES, name: 'Invoices' },
            { mockArr: sandbox.mockComplaints,       table: TABLES.COMPLAINTS,    name: 'Complaints' },
            { mockArr: sandbox.mockVisitors,         table: TABLES.VISITORS,      name: 'Visitors' },
            { mockArr: sandbox.mockNotices,          table: TABLES.NOTICES,       name: 'Notices' },
            { mockArr: sandbox.mockMaintenanceTasks, table: TABLES.MAINTENANCE,     name: 'Maintenance Tasks' },
            { mockArr: sandbox.mockCommunityFeed,    table: TABLES.FEED,          name: 'Feed' },
            { mockArr: sandbox.mockRules,            table: TABLES.RULES,         name: 'Rules' },
            { mockArr: sandbox.mockAlerts,           table: TABLES.ALERTS,        name: 'Alerts' },
            { mockArr: sandbox.mockDomesticHelp,     table: TABLES.DOMESTIC_HELP, name: 'Domestic Help' },
            { mockArr: sandbox.mockProposals,        table: TABLES.POLLS,         name: 'Proposals' },
            { mockArr: sandbox.mockMinutes,          table: TABLES.MINUTES,       name: 'Minutes' },
            { mockArr: sandbox.mockInventory,        table: TABLES.INVENTORY,     name: 'Inventory' },
            { mockArr: sandbox.mockTenants,          table: TABLES.TENANCIES,     name: 'Tenants' },
            { mockArr: sandbox.mockGatePasses,       table: TABLES.GATE_PASSES,   name: 'Gate Passes' },
            { mockArr: sandbox.mockDeliveries,       table: TABLES.DELIVERIES,    name: 'Deliveries' },
            { mockArr: sandbox.mockFacilities,       table: TABLES.FACILITIES,    name: 'Facilities' },
            { mockArr: sandbox.mockAssets,           table: TABLES.ASSETS,        name: 'Assets' },
        ];

        const results = {};
        const missingFields = {};
        const errors = [];

        // Helper for chunked parallel processing
        const chunk = (arr, size) => Array.from({ length: Math.ceil(arr.length / size) }, (v, i) => arr.slice(i * size, i * size + size));

        for (const item of migrationMap) {
            if (!item.mockArr) continue;
            const tableCols = schemaMap[item.table] || [];
            if (!tableCols.length) { errors.push(`Table ${item.table} schema not found.`); continue; }

            const tableMissingSet = new Set();
            let successCount = 0;

            const chunks = chunk(item.mockArr, 5); // Process 5 records at a time
            for (const batch of chunks) {
                const promises = batch.map(record => {
                    const rowData = {};
                    if (tableCols.includes('communityId')) rowData.communityId = communityId;
                    const extra = {};
                    Object.entries(record).forEach(([key, val]) => {
                        if (key === 'id' || key === 'ROWID') return;
                        let tKey = key;
                        if (item.table === TABLES.FLATS && key === 'sqft') tKey = 'area';
                        if (item.table === TABLES.FLATS && key === 'status') tKey = 'occupancyStatus';

                        if (tableCols.includes(tKey)) rowData[tKey] = val;
                        else { extra[tKey] = val; tableMissingSet.add(tKey); }
                    });
                    if (Object.keys(extra).length > 0 && tableCols.includes('description')) rowData.description = JSON.stringify(extra);
                    
                    return req.catalyst.datastore().table(item.table).insertRow(rowData);
                });

                const batchResults = await Promise.allSettled(promises);
                batchResults.forEach(r => {
                    if (r.status === 'fulfilled') successCount++;
                    else errors.push(`${item.name} error: ${r.reason.message}`);
                });
            }

            results[item.name] = `${successCount}/${item.mockArr.length}`;
            if (tableMissingSet.size > 0) missingFields[item.name] = Array.from(tableMissingSet);
        }

        res.json({ message: 'Migration completed', results, missingFields, errors: errors.slice(0, 20) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── Super Admin: Community Management (auth only, no community context) ──────
app.use('/communities', verifyToken, communitiesRoute);

// ─── Diagnostics (restricted to super_admin via route internal guard) ─────────
app.get('/diagnostics', verifyToken, async (req, res) => {
    try {
        const datastore = req.catalyst.datastore();
        const tables = await datastore.getAllTables();
        const results = await Promise.all(tables.map(async (t) => {
            const name = t.table_name || t.tableName || t.table_ID || (t.getTableName ? t.getTableName() : 'UNKNOWN');
            return { name, raw: t };
        }));
        res.json({ count: tables.length, tables: results });
    } catch (err) {
        res.status(500).json({ error: 'Diagnostics failed', details: err.message });
    }
});

// ─── Protected Routes (require auth + community context) ──────────────────────
// All routes below automatically have req.user, req.userRecord, req.communityId, req.role
const secured = express.Router();
secured.use(verifyToken, extractCommunity);

secured.use('/users',                    usersRoute);
secured.use('/flats',                    flatsRoute);
secured.use('/flat-owners',              flatOwnersRoute);
secured.use('/tenants',                  tenantsRoute);
secured.use('/flat-history',             flatHistoryRoute);
secured.use('/notices',                  noticesRoute);
secured.use('/complaints',               complaintsRoute);
secured.use('/visitors',                 visitorsRoute);
secured.use('/gate-passes',              gatePassesRoute);
secured.use('/deliveries',               deliveriesRoute);
secured.use('/invoices',                 invoicesRoute);
secured.use('/maintenance',              maintenanceRoute);
secured.use('/maintenance-notifications', maintenanceNotificationsRoute);
secured.use('/payments',                 paymentsRoute);
secured.use('/bookings',                 bookingsRoute);
secured.use('/facilities',               facilitiesRoute);
secured.use('/staff',                    staffRoute);
secured.use('/tasks',                    tasksRoute);
secured.use('/inventory',                inventoryRoute);
secured.use('/domestic-help',            domesticHelpRoute);
secured.use('/alerts',                   alertsRoute);
secured.use('/feed',                     feedRoute);
secured.use('/proposals',                proposalsRoute);
secured.use('/minutes',                  minutesRoute);
secured.use('/rules',                    rulesRoute);
secured.use('/assets',                   assetsRoute);
secured.use('/notifications',            notificationsRoute);
// secured.use('/admin-dashboard',          adminDashboardRoute);
secured.use('/owners',                   owners);
secured.use('/residents',                residents);
secured.use('/files',                    filesRoute);

app.use(secured);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found', code: 'NOT_FOUND' });
});

// ─── Centralized Error Handler ────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
