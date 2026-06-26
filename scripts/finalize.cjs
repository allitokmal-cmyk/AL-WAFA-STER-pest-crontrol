const fs = require('fs');
const lines = fs.readFileSync('src/components/ChemicalInventory.tsx', 'utf8').split('\n');

// Find the line that ends the CSS (which currently says "          }\` }} />" or "          }</style>"
const endIdx = lines.findIndex((l, i) => i > 2630 && l.includes('</style>'));
if (endIdx > -1) {
    console.log("Found at", endIdx, Object.is(lines[endIdx], undefined) ? 'undef' : lines[endIdx]);
    lines[endIdx] = '          }` }} />';
} else {
    // Wait, earlier I might have replaced it with \` }} /> but left a missing backtick, or maybe it WASNT replaced.
    const badEnd = lines.findIndex((l, i) => i > 2630 && i < 2700 && (l.includes('}} />') || l.includes('</style>')));
    if (badEnd > -1) {
        console.log("Found bad end at", badEnd, lines[badEnd]);
        lines[badEnd] = '          }` }} />';
    }
}

fs.writeFileSync('src/components/ChemicalInventory.tsx', lines.join('\n'));
console.log("Fixed backtick close!");
