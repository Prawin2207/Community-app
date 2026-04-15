const axios = require('axios');

const BASE_URL = 'https://prawinresidency-60061477709.development.catalystserverless.in/server/communityAPI';

const testData = {
  Residents: { url: '/residents', payload: { name: 'Test Resident', apartment: 'A-101', phone: '1234567890', email: 'test@resident.com' } },
  Owners: { url: '/owners', payload: { name: 'Test Owner', apartment: 'A-101', ownershipType: 'Sole' } },
  AppSettings: { url: '/?table=AppSettings', payload: { facilityBookingEnabled: 'true' } },
  Complaints: { url: '/complaints', payload: { title: 'Test Leak', description: 'Pipe leaking', category: 'Plumbing', priority: 'High', status: 'pending', reportedBy: 1, apartment: 'A-101' } },
  Visitors: { url: '/visitors', payload: { name: 'Test Courier', purpose: 'Delivery', hostApartment: 'A-101', inTime: new Date().toISOString(), status: 'Inside', phone: '999999999' } },
  Invoices: { url: '/invoices', payload: { residentId: 1, resident: 'Test Resident', apartment: 'A-101', amount: 1500, dueDate: '2026-04-01', status: 'pending' } },
  Notices: { url: '/notices', payload: { title: 'Test Notice', content: 'Water shutoff tomorrow.', category: 'Maintenance' } },
  Alerts: { url: '/alerts', payload: { type: 'Emergency', location: 'Main Gate', description: 'Test Emergency', status: 'active', reportedBy: 1 } },
  Feed: { url: '/feed', payload: { author: 'Test Resident', apartment: 'A-101', content: 'Hello Community!', category: 'Announcement', likes: 0, comments: 0 } },
  Proposals: { url: '/proposals', payload: { title: 'Test Proposal', description: 'Install new cameras', author: 'Test Admin', status: 'voting_open', votesFor: 0, votesAgainst: 0 } },
  Facilities: { url: '/facilities', payload: { name: 'Clubhouse', type: 'Recreation', status: 'available', capacity: 50, description: 'No loud music' } },
  Staff: { url: '/staff', payload: { name: 'Test Guard', role: 'Security', dept: 'Security', shift: 'Morning', phone: '111111111' } },
  Tasks: { url: '/tasks', payload: { title: 'Fix Gate', facility: 'Main Gate', category: 'Maintenance', priority: 'High', status: 'pending' } },
  Deliveries: { url: '/deliveries', payload: { supplier: 'Amazon', resident: 'A-101', apartment: 'A-101', type: 'Package', status: 'Awaiting Pickup' } }
};


async function seedDatabase() {
  const fs = require('fs');
  const results = { success: [], failed: [] };
  
  for (const [table, info] of Object.entries(testData)) {
    try {
      const res = await axios.post(`${BASE_URL}${info.url}`, info.payload);
      results.success.push(table);
    } catch (err) {
      results.failed.push({ table, error: err.response?.data?.message || err.response?.data?.error || err.message, status: err.response?.status });
    }
  }
  
  fs.writeFileSync('seed_summary.json', JSON.stringify(results, null, 2));
  console.log('✅ Wrote results to seed_summary.json');
}

seedDatabase();
