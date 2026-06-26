const fs = require('fs');

const files = [
  'src/components/MasterForm.tsx',
  'src/components/CompletedRegistry.tsx',
  'src/components/CustomServiceModule.tsx',
  'src/components/Dashboard.tsx',
  'src/components/EngineeringReport.tsx',
  'src/components/ClientDirectory.tsx'
];

for (const f of files) {
  let text = fs.readFileSync(f, 'utf8');
  
  // The regex pattern matches the old frameDoc.write block to replace with the fixed one.
  const regex = /frameDoc\.write\(`\s*<script>\s*window\.onload = function\(\) \{\s*setTimeout\(\(\) => \{\s*document\.title = "\$\{customFileName\}";\s*window\.print\(\);\s*\}, 500\);\s*\};\s*<\/script>\s*`\);\s*frameDoc\.close\(\);\s*\}/g;
  
  text = text.replace(regex, `frameDoc.write('<script>document.title="' + customFileName + '";</' + 'script>');
        frameDoc.close();
      }

      setTimeout(() => {
        if (printFrame.contentWindow) {
          printFrame.contentWindow.focus();
          printFrame.contentWindow.print();
        }
      }, 500);`);
      
  fs.writeFileSync(f, text, 'utf8');
}
console.log('done');
