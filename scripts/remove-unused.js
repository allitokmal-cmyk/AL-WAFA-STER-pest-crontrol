const fs = require('fs');

let content = fs.readFileSync('src/components/EngineeringReport.tsx', 'utf8');

const docStart = content.indexOf('  const handleDownloadReportDoc =');
const wordStart = content.indexOf('  const handleDownloadReportWord =');
const jsonStart = content.indexOf('  const handleExportJSON =');

if (docStart > -1 && jsonStart > -1) {
  content = content.slice(0, docStart) + content.slice(jsonStart);
  fs.writeFileSync('src/components/EngineeringReport.tsx', content, 'utf8');
  console.log("Success: removed both handleDownloadReportDoc and handleDownloadReportWord");
} else {
  console.log("Failed to find boundaries", {docStart, wordStart, jsonStart});
}
