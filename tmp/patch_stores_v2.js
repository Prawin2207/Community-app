const fs = require('fs');
const path = require('path');

const storesDir = path.join('c:\\\\Users\\\\Prawin\\\\Desktop\\\\AI TASK\\\\ADDA', 'vue', 'src', 'stores');
const storeFiles = fs.readdirSync(storesDir).filter(f => f.endsWith('Store.js') && !['settingsStore.js', 'themeStore.js', 'authStore.js', 'mockDataStore.js', 'realtimeStore.js'].includes(f));

let patchedCount = 0;

for (const file of storeFiles) {
    const filePath = path.join(storesDir, file);
    let code = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;

    // We detect what kind of store we are dealing with. Options API or Setup API.
    const isOptionsStr = /defineStore\(['"][^'"]+['"],\s*{[\s\S]+state:/;
    const isSetupStr = /defineStore\(['"][^'"]+['"],\s*\(\)\s*=>\s*\{/;

    let mockVar = null;
    let importMatch = code.match(/import\s+\{([^}]+)\}\s+from\s+['"]\.\.\/data\/mockData(\.js)?['"]/);
    if (importMatch) {
        mockVar = importMatch[1].split(',')[0].trim();
    } else {
        const manualMatch = code.match(/mock[A-Z]\w+/);
        if (manualMatch) {
            mockVar = manualMatch[0];
            code = "import { " + mockVar + " } from '../data/mockData'\n" + code;
            hasChanges = true;
        } else {
            console.log(`Skipping ${file} completely - no mock variable identifiable`);
            continue;
        }
    }

    const storeIdMatch = code.match(/defineStore\(['"]([^'"]+)['"]/);
    if (!storeIdMatch) continue;
    const storeId = storeIdMatch[1];
    const lsKey = `ch_mock_${storeId}`;

    if (isSetupStr.test(code)) {
        if (!code.includes('watch')) {
            code = code.replace(/import \{([^}]+)\} from 'vue'/, (match, group1) => {
                return `import {${group1}, watch } from 'vue'`;
            });
            hasChanges = true;
        }

        if (!code.includes(`ch_mock_${storeId}`)) {
            const watchInjection = `\n    // LocalStorage Fallback Sync\n    watch(items, (newVal) => {\n        localStorage.setItem('${lsKey}', JSON.stringify(newVal));\n    }, { deep: true });\n`;
            code = code.replace(/(const items = ref\(\[\]\)[^\n]*\n)/, `$1${watchInjection}`);
            hasChanges = true;
        }

        const successRegex = new RegExp(`items\\.value = serverItems\\.length > 0 \\? \\s*serverItems : ${mockVar}`);
        if (successRegex.test(code)) {
            code = code.replace(successRegex, `items.value = serverItems.length > 0 ? serverItems : (JSON.parse(localStorage.getItem('${lsKey}')) || ${mockVar})`);
            hasChanges = true;
        }
        
        const successRegex2 = new RegExp(`items\\.value = Array\\.isArray\\(rawData\\) \\? rawData\\.map\\(b => b\\.Bookings \\|\\| b\\) : \\[\\]`);
        if (successRegex2.test(code)) {
            code = code.replace(successRegex2, `items.value = (Array.isArray(rawData) && rawData.length > 0) ? rawData.map(b => b.Bookings || b) : (JSON.parse(localStorage.getItem('${lsKey}')) || ${mockVar})`);
            hasChanges = true;
        }

        const fetchAllRegex = /(async function fetchAll[\s\S]*?catch \([^)]+\) {)([\s\S]*?)(} finally {)/;
        code = code.replace(fetchAllRegex, (match, prefix, body, suffix) => {
            if (!body.includes('items.value =')) {
                return prefix + body + `\n            items.value = JSON.parse(localStorage.getItem('${lsKey}')) || ${mockVar};\n        ` + suffix;
            }
            return match;
        });

    } else if (isOptionsStr.test(code)) {
        if (!code.includes(`ch_mock_${storeId}`)) {
            const optSuccess = new RegExp(`this\\.items = serverItems\\.length > 0 \\? serverItems : ${mockVar}`);
            if (optSuccess.test(code)) {
                code = code.replace(optSuccess, `this.items = serverItems.length > 0 ? serverItems : (JSON.parse(localStorage.getItem('${lsKey}')) || ${mockVar})`);
                hasChanges = true;
            }
        }
    }

    if (hasChanges) {
        fs.writeFileSync(filePath, code, 'utf8');
        patchedCount++;
        console.log(`Patched ${file} (${storeId})`);
    } else {
        console.log(`No changes needed for ${file}`);
    }
}
console.log(`Done. Patched ${patchedCount} files.`);
