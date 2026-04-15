const catalyst = require('zcatalyst-sdk-node');
const TABLES = require('c:/Users/Prawin/Desktop/AI TASK/ADDA/functions/communityAPI/db/tables');

async function getFullSchema() {
    // catalyst.initialize() reads from catalyst.json in the current working directory
    const app = catalyst.initialize();
    const results = {};
    
    for (const [key, tableName] of Object.entries(TABLES)) {
        try {
            // Note: executeZCQLQuery is usually better for metadata
            const rows = await app.zcql().executeZCQLQuery(`SELECT * FROM ${tableName} LIMIT 1`);
            if (rows.length > 0) {
                results[tableName] = Object.keys(rows[0][tableName]);
            } else {
                results[tableName] = "EMPTY (Cannot determine columns)";
            }
        } catch (err) {
            results[tableName] = `ERROR: ${err.message}`;
        }
    }
    
    console.log(JSON.stringify(results, null, 2));
}

getFullSchema();
