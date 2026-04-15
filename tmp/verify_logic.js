const payrollRoute = require('../functions/communityAPI/routes/payroll');
const invoicesRoute = require('../functions/communityAPI/routes/invoices');

// Mock Express Response
const mockRes = () => {
    const res = {};
    res.status = (code) => { res.statusCode = code; return res; };
    res.json = (data) => { res.body = data; return res; };
    return res;
};

// Mock Catalyst SDK
const mockCatalyst = (tableName, expectedData) => ({
    datastore: () => ({
        table: (name) => ({
            insertRow: async (data) => {
                console.log(`[MOCK] Inserting into ${name}:`, JSON.stringify(data, null, 2));
                return { ...data, ROWID: 'MOCK_ROW_ID' };
            }
        })
    }),
    zcql: () => ({
        executeZCQLQuery: async (query) => {
            console.log(`[MOCK] Executing ZCQL:`, query);
            return [];
        }
    })
});

async function runVerification() {
    console.log("--- Verifying Payroll Logic ---");
    const payrollReq = {
        body: {
            staffId: "123",
            amount: "50000",
            month: "January 2024",
            payrolldate: "2024-01-25",
            status: "Pending"
        },
        catalyst: mockCatalyst('Payroll')
    };
    const resP = mockRes();
    // Simulate a POST request
    const postHandler = payrollRoute.stack.find(s => s.route && s.route.methods.post).route.stack[0].handle;
    await postHandler(payrollReq, resP);
    console.log("Payroll Result:", JSON.stringify(resP.body, null, 2));

    console.log("\n--- Verifying Invoice Logic ---");
    const invoiceReq = {
        body: {
            residentId: "456",
            resident: "John Doe",
            apartment: "A-101",
            amount: "2500.75",
            dueDate: "2024-02-15",
            status: "pending"
        },
        catalyst: mockCatalyst('Invoices')
    };
    const resI = mockRes();
    const invPostHandler = invoicesRoute.stack.find(s => s.route && s.route.methods.post).route.stack[0].handle;
    await invPostHandler(invoiceReq, resI);
    console.log("Invoice Result:", JSON.stringify(resI.body, null, 2));
}

runVerification().catch(console.error);
