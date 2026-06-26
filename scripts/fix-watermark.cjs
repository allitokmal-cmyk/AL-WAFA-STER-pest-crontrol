const fs = require('fs');

function fixWatermark(file) {
    let code = fs.readFileSync(file, 'utf8');
    
    // Add max-width constraint for SVG and replace huge mm sizes
    code = code.replace(/width: (\d+)mm;/g, 'width: 100%; max-width: $1mm;');
    code = code.replace(/height: (\d+)mm;/g, 'height: 100%; max-height: $1mm;');
    
    // Explicitly target SVG to fill the watermark div
    if (!code.includes('.watermark svg {')) {
        code = code.replace('.header-box {', '.watermark svg, .watermark-chemical svg, .watermark-absolute svg { width: 100%; height: 100%; object-fit: contain; }\n        .header-box {');
        code = code.replace('        .header, .section-title,', '        .watermark svg, .watermark-absolute svg { width: 100%; height: 100%; object-fit: contain; }\n        .header, .section-title,');
    }
    
    // In ChemicalInventory it might have a different injection target
    if (file.includes('ChemicalInventory') && !code.includes('.watermark-chemical {')) {
        code = code.replace('#print-content > * {', '.watermark-chemical svg { width: 100%; height: 100%; object-fit: contain; }\n          #print-content > * {');
    }

    fs.writeFileSync(file, code);
}

fixWatermark('src/components/ClientDirectory.tsx');
fixWatermark('src/components/ChemicalInventory.tsx');
console.log('Fixed watermark CSS!');
