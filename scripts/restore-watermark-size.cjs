const fs = require('fs');

function restoreWatermarkSize(file) {
    let code = fs.readFileSync(file, 'utf8');

    code = code.replace(/width: 100%; max-width: (\d+)mm;/g, 'width: $1mm;');
    code = code.replace(/height: 100%; max-height: (\d+)mm;/g, 'height: $1mm;');

    fs.writeFileSync(file, code);
}

restoreWatermarkSize('src/components/ClientDirectory.tsx');
restoreWatermarkSize('src/components/ChemicalInventory.tsx');
console.log('Restored mm sizes directly instead of max-width!');
