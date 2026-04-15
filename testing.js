const axios = require('./vue/node_modules/axios');
axios.post('https://prawinresidency-60061477709.development.catalystserverless.in/server/communityAPI/?table=Residents', {
  name: "Test User",
  apartment: "B-202",
  phone: "1234567890",
  email: "test@example.com"
})
.then(res => console.log('SUCCESS:', res.data))
.catch(err => console.error('ERROR:', err.response ? err.response.data : err.message));
