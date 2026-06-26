const fs = require('fs');

function restorePDFDimensions(file) {
    let code = fs.readFileSync(file, 'utf8');
    
    // We only want to restrict .watermark and .watermark-absolute
    // Let's restore the whole width/height rules where it's 210mm or 297mm
    code = code.replace(/width: 100%; max-width: 210mm;/g, 'width: 210mm;');
    code = code.replace(/min-height: 100%; max-height: 297mm;/g, 'min-height: 297mm;');
    code = code.replace(/height: 100%; max-height: 297mm;/g, 'height: 297mm;');

    fs.writeFileSync(file, code);
}

restorePDFDimensions('src/components/ClientDirectory.tsx');
restorePDFDimensions('src/components/ChemicalInventory.tsx');
console.log('Restored PDF specific dimensions!');
