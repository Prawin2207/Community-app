const fs = require('fs');
const path = require('path');

const storesDir = path.join('c:\\\\Users\\\\Prawin\\\\Desktop\\\\AI TASK\\\\ADDA', 'vue', 'src', 'stores');

if (!fs.existsSync(storesDir)) {
    console.error('Stores directory not found at', storesDir);
    process.exit(1);
}

const storeFiles = fs.readdirSync(storesDir).filter(f => f.endsWith('Store.js') && f !== 'settingsStore.js' && f !== 'themeStore.js' && f !== 'authStore.js' && f !== 'mockDataStore.js' && f !== 'realtimeStore.js');

let patchedCount = 0;

for (const file of storeFiles) {
    const filePath = path.join(storesDir, file);
    let code = fs.readFileSync(filePath, 'utf8');

    // 1. Add "watch" to Vue imports if not present
    if (!code.includes('watch')) {
        code = code.replace(/import \{([^}]+)\} from 'vue'/, (match, group1) => {
            return `import {${group1}, watch } from 'vue'`;
        });
    }

    // 2. Identify mock data variable
    const mockVarMatch = code.match(/import\s+\{([^}]+)\}\s+from\s+['"]\.\.\/data\/mockData\.js['"]/);
    if (!mockVarMatch) {
         console.log(`Skipping ${file} - no mockData import`);
         continue; // skip if no mock data
    }
    const mockVars = mockVarMatch[1].split(',').map(s => s.trim());
    const mainMockVar = mockVars[0]; // e.g. mockOwners

    // 3. Identify store ID name
    const storeIdMatch = code.match(/defineStore\(['"]([^'"]+)['"]/);
    if (!storeIdMatch) continue;
    const storeId = storeIdMatch[1]; // e.g. owners

    // 4. Inject Watcher
    if (!code.includes('localStorage.setItem(`ch_mock_')) {
        const watchInjection = `

    // LocalStorage Fallback Sync
    watch(items, (newVal) => {
        localStorage.setItem(\`ch_mock_${storeId}\`, JSON.stringify(newVal));
    }, { deep: true });
`;
        code = code.replace(/(const items = ref\(\[\]\)[^\n]*\n)/, `$1${watchInjection}`);
    }

    // 5. Update fetchAll success fallback
    const successRegex = new RegExp(`items\\.value = serverItems\\.length > 0 \\? \\s*serverItems : ${mainMockVar}`);
    if (successRegex.test(code)) {
        code = code.replace(successRegex, `items.value = serverItems.length > 0 ? serverItems : (JSON.parse(localStorage.getItem(\`ch_mock_${storeId}\`)) || ${mainMockVar})`);
    }

    // 6. Update fetchAll catch block robustly
    const fetchAllRegex = /(async function fetchAll[\s\S]*?catch \([^)]+\) {)([\s\S]*?)(} finally {)/;
    code = code.replace(fetchAllRegex, (match, prefix, body, suffix) => {
        if (!body.includes('items.value =')) {
            const mockFallbackLines = `\n            items.value = JSON.parse(localStorage.getItem(\`ch_mock_${storeId}\`)) || ${mainMockVar};\n        `;
            return prefix + body + mockFallbackLines + suffix;
        }
        return match;
    });

    fs.writeFileSync(filePath, code, 'utf8');
    patchedCount++;
    console.log(`Patched ${file} (${storeId})`);
}

console.log(`Total patched: ${patchedCount} stores.`);
