const fs = require('fs');
const lines = fs.readFileSync('src/components/ChemicalInventory.tsx', 'utf8').split('\n');

const brokenIdx = lines.findIndex(l => l.includes('          }'));
console.log(lines.slice(2670, 2690).join('\n'));
