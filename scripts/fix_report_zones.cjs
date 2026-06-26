const fs = require('fs');
let code = fs.readFileSync('src/components/ClientDirectory.tsx', 'utf8');

const replacement = `const catName = (zoneId === "Kitchen" ? (isBengali ? "রান্নাঘর" : "KITCHEN") : 
                                       zoneId === "Drains" ? (isBengali ? "ড্রেন/নর্দমা" : "DRAINS/SEWERS") : 
                                       zoneId === "Garbage" ? (isBengali ? "ময়লার স্থান" : "GARBAGE/BINS") : 
                                       zoneId === "Storage" ? (isBengali ? "স্টোরেজ/গোডাউন" : "STORAGE/WAREHOUSE") : 
                                       zoneId.toUpperCase());`;

code = code.replace(/const z = reportZones\.find[^\n]*\n[^\n]*catName = [^\n]*/, replacement);

fs.writeFileSync('src/components/ClientDirectory.tsx', code);
