const fs = require('fs');
const lines = fs.readFileSync('src/components/ChemicalInventory.tsx', 'utf8').split('\n');
console.log(JSON.stringify(lines[2627]));

// let's just forcefully replace the line!
lines[2627] = '            <style dangerouslySetInnerHTML={{ __html: `';
const endLineIdx = lines.findIndex((l, i) => i > 2627 && l.includes('}</style>'));
if (endLineIdx > -1) {
    lines[endLineIdx] = lines[endLineIdx].replace('`}</style>', '` }} />');
}
fs.writeFileSync('src/components/ChemicalInventory.tsx', lines.join('\n'));
