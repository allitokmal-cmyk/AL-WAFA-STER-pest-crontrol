const fs = require('fs');
const files = [
  'src/components/CompletedRegistry.tsx',
  'src/components/Dashboard.tsx',
  'src/components/Technicians.tsx',
  'src/components/EngineeringReport.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // For Dashboard and CompletedRegistry
  const regex1 = /setTimeout\(\(\)\s*=>\s*\{\s*setSimulatedPrint\(false\);\s*window\.focus\(\);\s*window\.print\(\);\s*setTimeout\(\(\)\s*=>\s*\{\s*document\.body\.classList\.remove\("pdf-download-active"\);\s*if\s*\(customFileName\)\s*document\.title\s*=\s*originalTitle;\s*\},\s*500\);\s*\},\s*1200\);/g;
  if(content.match(regex1)) {
     content = content.replace(regex1, `
    window.focus();
    window.print();
    document.body.classList.remove("pdf-download-active");
    if (customFileName) document.title = originalTitle;
    setSimulatedPrint(false);
`);
     changed = true;
  }

  // Technicians.tsx
  const regex2 = /setTimeout\(\(\)\s*=>\s*\{\s*window\.print\(\);\s*setTimeout\(\(\)\s*=>\s*\{\s*document\.body\.classList\.remove\("pdf-download-active"\);\s*document\.title\s*=\s*originalTitle;\s*\},\s*500\);\s*\},\s*1200\);/g;
  if(content.match(regex2)) {
     content = content.replace(regex2, `
    window.print();
    document.body.classList.remove("pdf-download-active");
    document.title = originalTitle;
`);
     changed = true;
  }
  
  // Also check EngineeringReport.tsx
  const regex3 = /setTimeout\(\(\)\s*=>\s*\{\s*document\.body\.classList\.remove\("pdf-download-active"\);\s*\},\s*500\);/g;
  if(content.match(regex3) && file.includes('EngineeringReport')) {
     content = content.replace(regex3, `document.body.classList.remove("pdf-download-active");`);
     changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed', file);
  }
}
