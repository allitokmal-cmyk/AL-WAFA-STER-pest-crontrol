const fs = require('fs');
let code = fs.readFileSync('src/components/ChemicalInventory.tsx', 'utf8');

code = code.replace('<style>{\`', '<style dangerouslySetInnerHTML={{ __html: \`');
code = code.replace('}\`}</style>', '\` }} />');

fs.writeFileSync('src/components/ChemicalInventory.tsx', code);
