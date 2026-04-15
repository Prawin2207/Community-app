const fs = require('fs');
const axios = require('axios');
const baseUrl = 'https://prawinresidency-60061477709.development.catalystserverless.in/server/communityAPI';

async function testPost() {
  try {
    const res = await axios.post(`${baseUrl}/?table=Residents`, {
      name: 'Test Resident',
      apartment: 'A-101',
      phone: '1234567890',
      email: 'test@resident.com',
      status: 'active'
    });
    fs.writeFileSync('test_post_result.json', JSON.stringify({ success: true, data: res.data }, null, 2));
  } catch (err) {
    fs.writeFileSync('test_post_result.json', JSON.stringify({
      success: false,
      status: err.response?.status,
      data: err.response?.data,
      message: err.message
    }, null, 2));
  }
}

testPost();
