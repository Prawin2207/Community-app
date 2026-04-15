// Since mockData.js is an ES module, we might need a dynamic import or just treat it as text and parse it.
// Actually, I can use a small node script that uses 'require' if I convert it, but let's try to just grep/regex it if possible or use a more robust way.
const fs = require('fs');
const content = fs.readFileSync('c:/Users/Prawin/Desktop/AI TASK/ADDA/vue/src/data/mockData.js', 'utf8');

// A very hacky way to get the exported objects if we can't run the ESM file directly.
// We'll strip the 'export' keyword and run it in a new context.
const cleanedContent = content.replace(/export /g, '');
const sandbox = {};
require('vm').runInNewContext(cleanedContent, sandbox);

fs.writeFileSync('tmp/extracted_mock_data.json', JSON.stringify(sandbox, null, 2));
console.log('Extracted mock data to tmp/extracted_mock_data.json');
