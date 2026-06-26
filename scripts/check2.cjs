const fs = require('fs');
let code = fs.readFileSync('src/components/ChemicalInventory.tsx', 'utf8');

const sIdx = code.indexOf('<style dangerouslySetInnerHTML={{ __html: \`');
if (sIdx > -1) {
  // find the closest `          }\` }} />` or something that is broken
  const brokenClose = '          }\\` }} />';
  const correctClose = '          }\\` }} />'; // wait, let's just make sure it parses by finding the closing
}

console.log("WAIT, the template string starts at 2628 and it ends at 2683. If it ends properly there, why does it error at 2827??");
