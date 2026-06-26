const fs = require('fs');
let code = fs.readFileSync('src/components/ChemicalInventory.tsx', 'utf8');

const sIdx = code.indexOf('<style>{\`');
if (sIdx > -1) {
  code = code.substring(0, sIdx) + '<style dangerouslySetInnerHTML={{ __html: \`' + code.substring(sIdx + 9);
}
const eIdx = code.indexOf('}\`}</style>');
if (eIdx > -1) {
  code = code.substring(0, eIdx) + '}\` }} />' + code.substring(eIdx + 11);
}

fs.writeFileSync('src/components/ChemicalInventory.tsx', code);
console.log('Fixed style tags');
