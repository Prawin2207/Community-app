const http = require('http');

const BASE_URL = 'http://localhost:3000/server/communityAPI';

async function testApi(path, method) {
    return new Promise((resolve, reject) => {
        const url = new URL(`${BASE_URL}${path}`);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(data) });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data });
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.end();
    });
}

async function run() {
    console.log("--- Fetching Diagnostics ---");
    try {
        const res = await testApi('/diagnostics', 'GET');
        console.log("Status:", res.status);
        if (res.status === 200) {
            const tableNames = res.data.tables.map(t => t.name);
            console.log("Available Tables:", tableNames.join(', '));
            
            const feedTable = res.data.tables.find(t => t.name.toLowerCase().includes('feed'));
            if (feedTable) {
                console.log("\nFeed Table Columns:", JSON.stringify(feedTable.columns, null, 2));
            } else {
                console.log("\nNo Feed table found!");
            }
        } else {
            console.log("Diagnostics Response:", JSON.stringify(res.data, null, 2));
        }
    } catch (e) {
        console.error("Error:", e.message);
    }
}

run();
