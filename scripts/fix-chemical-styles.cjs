const fs = require('fs');
const file = 'src/components/ChemicalInventory.tsx';

let code = fs.readFileSync(file, 'utf8');

// The <style> tag starts with `<style>\n          @import`
let tagStart = code.lastIndexOf('<style>');
let importLine = code.lastIndexOf('@import url(', tagStart + 200);

if (tagStart > -1) {
   let endTag = code.indexOf('</style>', tagStart);
   if (endTag > -1) {
     let newStyle = `<style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap');
          * { box-sizing: border-box; }
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
            font-family: Arial, Helvetica, sans-serif !important;
          }
          #print-content {
            width: 210mm;
            min-height: 297mm;
            padding: 15mm;
            margin: 0 auto;
            box-sizing: border-box;
            background: #ffffff;
            border: 1px solid #e5e5e5;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            position: relative;
          }
          .watermark-chemical {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 140mm;
            height: 140mm;
            opacity: 0.05;
            pointer-events: none;
            z-index: 0;
          }
          #print-content > * {
            position: relative;
            z-index: 10;
          }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; background: #fff;}
          th, td { border: 1px solid #111; padding: 8px; text-align: left; }
          th { background-color: #f3f4f6 !important; font-weight: bold; }
          .header-box { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 25px; border-bottom: 3px solid #111; padding-bottom: 10px; }
          .signature-box { border: 1px dashed #999; height: 80px; width: 100%; margin-top: 5px; background: #fafafa;}
          @media print {
            @page { size: A4 portrait; margin: 0; }
            body { margin: 0 !important; }
            #print-content {
               width: 210mm !important;
               min-height: 297mm !important;
               margin: 0 auto !important;
               padding: 10mm 15mm !important;
               border: none !important;
               box-shadow: none !important;
            }
          }`;
      code = code.substring(0, tagStart) + newStyle + code.substring(endTag);
      fs.writeFileSync(file, code);
      console.log("Updated chemical");
   }
}
