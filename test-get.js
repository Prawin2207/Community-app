const axios = require('axios');

axios.get('https://prawinresidency-60061477709.development.catalystserverless.in/server/communityAPI/?table=Residents')
    .then(res => {
        console.log("SUCCESS:", JSON.stringify(res.data, null, 2));
    }).catch(err => {
        console.error("ERROR STR:", err.response ? err.response.data : err.message);
    });
