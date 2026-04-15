const axios = require('axios');

const baseUrl = 'https://prawinresidency-60061477709.development.catalystserverless.in/server/communityAPI';

async function testBackend() {
  console.log('Testing GET request without table...');
  try {
    const res1 = await axios.get(`${baseUrl}/`);
    console.log('Response:', res1.status, res1.data);
  } catch (err) {
    console.error('Error 1:', err.response ? err.response.status : err.message, err.response ? err.response.data : '');
  }

  console.log('\nTesting GET request WITH table=Residents...');
  try {
    const res2 = await axios.get(`${baseUrl}/?table=Residents`);
    console.log('Response:', res2.status, res2.data);
  } catch (err) {
    console.error('Error 2:', err.response ? err.response.status : err.message, err.response ? err.response.data : '');
  }
}

testBackend();
