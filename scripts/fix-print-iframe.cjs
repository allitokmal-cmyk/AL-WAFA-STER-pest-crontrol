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
  
  // replace the old absolute positioned appending block
  const startTarget = 'const printFrame = document.createElement("iframe");';
  const endTarget = '}, 500);';
  
  if (text.includes(startTarget)) {
    const startIndex = text.indexOf(startTarget);
    const endIndex = text.indexOf(endTarget, startIndex) + endTarget.length;
    
    if (startIndex > -1 && endIndex > -1) {
      const newBlock = `const printFrame = document.createElement("iframe");
      printFrame.style.position = "fixed";
      printFrame.style.right = "0";
      printFrame.style.bottom = "0";
      printFrame.style.width = "0";
      printFrame.style.height = "0";
      printFrame.style.border = "none";
      document.body.appendChild(printFrame);

      const frameDoc = printFrame.contentWindow?.document;
      if (frameDoc) {
        frameDoc.open();
        frameDoc.write(contentHtml);
        frameDoc.close();
      }

      if (printFrame.contentWindow) {
        printFrame.contentWindow.document.title = customFileName;
      }

      setTimeout(() => {
        try {
          printFrame.contentWindow?.focus();
          printFrame.contentWindow?.print();
        } catch (e) {
          console.error("Print frame error", e);
        }
        setTimeout(() => {
          if (document.body.contains(printFrame)) {
            document.body.removeChild(printFrame);
          }
        }, 1000);
      }, 500);`;
      
      text = text.slice(0, startIndex) + newBlock + text.slice(endIndex);
      fs.writeFileSync(f, text, 'utf8');
      console.log('Fixed', f);
    }
  }
}
