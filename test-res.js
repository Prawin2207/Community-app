const axios = require('axios');

axios.post('https://prawinresidency-60061477709.development.catalystserverless.in/server/communityAPI/?table=Residents', {
    name: "Prawin Test",
    apartment: "B-201",
    phone: "+91 88888 88888",
    email: "prawin@test.com"
}).then(res => {
    console.log("SUCCESS:", res.data);
}).catch(err => {
    console.error("ERROR STR:", err.response ? JSON.stringify(err.response.data, null, 2) : err.message);
});
