const catalyst = require('zcatalyst-sdk-node');
const fs = require('fs');
const path = require('path');
const TABLES = require('./functions/communityAPI/db/tables');

// ── Context ──────────────────────────────────────────────────────────────────
const MOCK_DATA_PATH = path.join(__dirname, 'vue/src/data/mockData.js');

async function migrate() {
    console.log('🚀 Starting Demo Data Migration...');
    const app = catalyst.initialize();
    
    // 1. Resolve Community Context
    let communityId = null;
    try {
        const communities = await app.zcql().executeZCQLQuery('SELECT ROWID FROM Communities LIMIT 1');
        if (communities.length > 0) {
            communityId = communities[0].Communities.ROWID;
            console.log(`📍 Using Community ID: ${communityId}`);
        } else {
            console.error('❌ No communities found. Please create a community first.');
            process.exit(1);
        }
    } catch (err) {
        console.error('❌ Failed to fetch community:', err.message);
        process.exit(1);
    }

    // 2. Extract Mock Data
    const mockContent = fs.readFileSync(MOCK_DATA_PATH, 'utf8').replace(/export /g, '');
    const sandbox = {};
    require('vm').runInNewContext(mockContent, sandbox);
    
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

    const auditReport = {};

    for (const item of migrationMap) {
        if (!item.mockArr || !item.mockArr.length) continue;
        console.log(`\n📦 Migrating ${item.name} (${item.mockArr.length} records)...`);
        
        const table = app.datastore().table(item.table);
        const missingFields = new Set();
        
        // Try to get schema via a limit 1 fetch (simulated introspection)
        let knownColumns = [];
        try {
            const sample = await app.zcql().executeZCQLQuery(`SELECT * FROM ${item.table} LIMIT 1`);
            if (sample.length > 0) knownColumns = Object.keys(sample[0][item.table]);
        } catch (e) {
            console.warn(`⚠️  Could not introspect ${item.table}, proceeding with best-effort insertion.`);
        }

        for (const record of item.mockArr) {
            const insertData = { communityId };
            const extra = {};

            // ── Mapping Logic ──────────────────────────────────────────────
            Object.entries(record).forEach(([key, val]) => {
                // Skip ID as Catalyst generates it
                if (key.toLowerCase() === 'id' || key === 'ROWID') return;

                // Value Transformations
                let finalKey = key;
                let finalVal = val;
                
                if (item.name === 'Flats') {
                    if (key === 'sqft') finalKey = 'area';
                    if (key === 'status') finalKey = 'occupancyStatus';
                    if (key === 'floor' || key === 'sqft' || key === 'maintenanceRate') finalVal = val?.toString();
                }

                if (item.name === 'Invoices') {
                    if (key === 'amount') finalVal = parseFloat(val);
                }
                
                if (item.name === 'Residents') {
                    if (key === 'dues') finalVal = parseFloat(val);
                }

                // Field Categorization
                const isNative = knownColumns.length === 0 || knownColumns.includes(finalKey);
                if (isNative) {
                    insertData[finalKey] = finalVal;
                } else {
                    extra[finalKey] = finalVal;
                    missingFields.add(finalKey);
                }
            });

            // Handle description/metadata column if available
            if (Object.keys(extra).length > 0) {
                // We use 'description' as a catch-all JSON field in this architecture
                const existingDesc = insertData.description ? JSON.parse(insertData.description) : {};
                insertData.description = JSON.stringify({ ...existingDesc, ...extra });
            }

            try {
                await table.insertRow(insertData);
            } catch (err) {
                console.error(`  ❌ Failed to insert record (${record.name || record.title || 'ID:' + record.id}):`, err.message);
            }
        }
        
        if (missingFields.size > 0) {
            auditReport[item.name] = Array.from(missingFields);
            console.log(`  📝 Audit: ${missingFields.size} fields moved to metadata/description.`);
        }
    }

    fs.writeFileSync('migration_audit.json', JSON.stringify(auditReport, null, 2));
    console.log('\n🏁 Migration Complete! Audit report saved to migration_audit.json');
}

migrate();
