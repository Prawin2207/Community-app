const catalyst = require('zcatalyst-sdk-node');

async function inspect() {
    const app = catalyst.initialize();
    const tables = ['Users', 'Residents', 'Owners', 'Flats'];
    
    for (const tableName of tables) {
        console.log(`\n--- TABLE: ${tableName} ---`);
        try {
            const rows = await app.zcql().executeZCQLQuery(`SELECT * FROM ${tableName} LIMIT 5`);
            console.log(JSON.stringify(rows, null, 2));
        } catch (err) {
            console.error(`Error querying ${tableName}:`, err.message);
        }
    }
}

inspect();
