const http = require('http');

const BASE_URL = 'http://localhost:3000/server/communityAPI';

async function testApi(path, method, body = null) {
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
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function runTests() {
    console.log("--- Testing Invoice API ---");
    try {
        const createRes = await testApi('/invoices', 'POST', {
            residentId: "1234567890123456789",
            resident: "Test Resident",
            apartment: "T-999",
            amount: 1500.50,
            dueDate: "2024-12-31",
            status: "pending",
            type: "Maintenance"
        });
        console.log("Create Invoice Status:", createRes.status);
        console.log("Create Invoice Response:", JSON.stringify(createRes.data, null, 2));

        const listRes = await testApi('/invoices', 'GET');
        console.log("List Invoices Status:", listRes.status);
    } catch (e) { console.error("Invoice Test Error:", e.message); }

    console.log("\n--- Testing Payroll API ---");
    try {
        const createRes = await testApi('/payroll', 'POST', {
            staffId: "9876543210987654321",
            amount: 25000.00,
            month: "December 2024",
            payrolldate: "2024-12-01",
            status: "Pending"
        });
        console.log("Create Payroll Status:", createRes.status);
        console.log("Create Payroll Response:", JSON.stringify(createRes.data, null, 2));

        const listRes = await testApi('/payroll', 'GET');
        console.log("List Payroll Status:", listRes.status);
    } catch (e) { console.error("Payroll Test Error:", e.message); }
}

runTests();
