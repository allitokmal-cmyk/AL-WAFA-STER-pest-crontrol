const fs = require('fs');

const filePath = 'src/components/ChemicalInventory.tsx';
let code = fs.readFileSync(filePath, 'utf8');

const searchStart = 'const iframe = document.createElement("iframe");';
const searchEnd = '}, 250);';

if (code.includes(searchStart)) {
  const startIdx = code.indexOf(searchStart);
  // find '    }, 250);'
  const tryCatchEndIdx = code.indexOf('    }, 250);', startIdx);
  
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
          if (isSaved) {
            setTempPrintReq(null);
          }
        }, 500);
      } else {
        alert("Please allow pop-ups to print the PDF report.");
        if (isSaved) setTempPrintReq(null);
      }
`;
      code = code.slice(0, startIdx) + replacement + code.slice(tryCatchEndIdx);
      fs.writeFileSync(filePath, code);
      console.log("Updated", filePath);
  }
}
