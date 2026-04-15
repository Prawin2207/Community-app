const fs = require('fs');

const data = Buffer.from("{\n  \"name\": \"communityhub-pro-client\",\n  \"version\": \"1.0.0\",\n  \"homepage\": \"index.html\"\n}", "utf8");

fs.writeFileSync('./vue/public/client-package.json', data);
fs.writeFileSync('./client/client-package.json', data);

console.log('Fixed files to pure UTF-8');
