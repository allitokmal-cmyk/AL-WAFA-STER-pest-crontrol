const fs = require('fs');
const files = [
  'src/components/MasterForm.tsx',
  'src/components/CompletedRegistry.tsx',
  'src/components/CustomServiceModule.tsx',
  'src/components/Technicians.tsx',
  'src/components/Dashboard.tsx',
  'src/components/EngineeringReport.tsx',
  'src/components/ChemicalInventory.tsx',
  'src/components/ClientDirectory.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // 1. Remove window.prompt instances and use default directly.
  const promptRegex1 = /const\s+customFileName\s*=\s*window\.prompt\([\s\S]*?,\s*defaultName\s*\);[\s\n]*if\s*\(!customFileName\)\s*return;/g;
  if(content.match(promptRegex1)) {
     content = content.replace(promptRegex1, 'const customFileName = defaultName;');
     changed = true;
  }
  
  const promptRegex2 = /let\s+customFileName\s*=\s*window\.prompt\([\s\S]*?,\s*defaultName\s*\);[\s\n]*if\s*\(!customFileName\)\s*return;/g;
  if(content.match(promptRegex2)) {
     content = content.replace(promptRegex2, 'let customFileName = defaultName;');
     changed = true;
  }
  
  const promptRegex3 = /customFileName\s*=\s*window\.prompt\([\s\S]*?,\s*defaultName\s*\);[\s\n]*if\s*\(!customFileName\)\s*return;/g;
  if(content.match(promptRegex3)) {
     content = content.replace(promptRegex3, 'customFileName = defaultName;');
     changed = true;
  }

  const promptRegex4 = /const\s+customFileName\s*=\s*window\.prompt\([\s\S]*?,\s*(`[^`]+`)\s*\);[\s\n]*if\s*\(!customFileName\)\s*return;/g;
  if(content.match(promptRegex4)) {
     content = content.replace(promptRegex4, 'const customFileName = $1;');
     changed = true;
  }

  // 2. Change setTimeout for html2pdf
  // To preserve user gesture, we change `setTimeout(async () => {` to `await new Promise(r => setTimeout(r, 10)); (async () => {`
  // and `}, 1000);` to `})();`
  // Wait, let's just do a specific string replace:
  
  const timeoutRegex1 = /setTimeout\(async\s*\(\)\s*=>\s*\{([\s\S]*?)(await html2pdf[\s\S]*?\}|setIsGeneratingPDF\(false\);)\s*\},[^)]*\);/g;

  let loopCount = 0;
  while(content.includes('setTimeout(async () => {') && loopCount < 10) {
      loopCount++;
      // We know there's a structure:
      // setTimeout(async () => {
      //   try { ... } catch (err) { ... } finally { ... }
      // }, 1000);
      
      content = content.replace(/setTimeout\(async\s*\(\)\s*=>\s*\{([\s\S]*?)\},\s*(1000|1500|500|800)\);/, (match, body_group, timeout_val) => {
         return `await new Promise(r => setTimeout(r, 10));\n      await (async () => {${body_group}})();`;
      });
      changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed', file);
  }
}
