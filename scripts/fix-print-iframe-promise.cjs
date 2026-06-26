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
  
  // To avoid spamming, we will make the main timeout wrap in a Promise if the function is async
  // But wait, it's easier: just replace the 'setTimeout(() => { try ...' block with a Promise returning block.
  
  const blockStart = `setTimeout(() => {
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
      
  const newBlock = `await new Promise(resolve => {
        setTimeout(() => {
          try {
            printFrame.contentWindow?.focus();
            printFrame.contentWindow?.print();
          } catch (e) {
            console.error("Print frame error", e);
          }
          // Remove frame after print dialog closes
          setTimeout(() => {
            if (document.body.contains(printFrame)) {
              document.body.removeChild(printFrame);
            }
            resolve(true);
          }, 1000);
        }, 500);
      });`;
      
  if (text.includes(blockStart)) {
    text = text.replace(blockStart, newBlock);
    fs.writeFileSync(f, text, 'utf8');
    console.log("Updated await in", f);
  }
}
