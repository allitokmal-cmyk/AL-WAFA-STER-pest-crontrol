const fs = require('fs');

const files = [
  'src/components/MasterForm.tsx',
  'src/components/CompletedRegistry.tsx',
  'src/components/CustomServiceModule.tsx',
  'src/components/Dashboard.tsx',
  'src/components/EngineeringReport.tsx',
  'src/components/ClientDirectory.tsx',
  'src/components/ChemicalInventory.tsx'
];

for (const filePath of files) {
  if (!fs.existsSync(filePath)) continue;
  let code = fs.readFileSync(filePath, 'utf8');

  const searchStart = 'const printFrame = document.createElement("iframe");';
  
  if (code.includes(searchStart)) {
    const startIdx = code.indexOf(searchStart);
    // find '    } catch'
    const tryCatchEndIdx = code.indexOf('    } catch', startIdx);
    
    if (startIdx > -1 && tryCatchEndIdx > -1) {
        const replacement = `const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(contentHtml);
        printWindow.document.close();
        printWindow.document.title = customFileName;

        printWindow.setTimeout(() => {
          printWindow.focus();
          printWindow.print();
        }, 500);
      } else {
        alert("Please allow pop-ups to print the PDF report.");
      }
`;
        code = code.slice(0, startIdx) + replacement + code.slice(tryCatchEndIdx);
        fs.writeFileSync(filePath, code);
        console.log("Updated", filePath);
    }
  } else {
    console.log("Not found in", filePath);
  }
}
