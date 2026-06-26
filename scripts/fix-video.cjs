const fs = require('fs');
const filePath = 'src/components/EngineeringReport.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

const targetVideoDownload = `          // Download video locally
          const a = document.createElement("a");
          a.style.display = "none";
          a.href = videoUrl;
          const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
          const zoneNameForFile = liveCamType === "work" ? (activeCaptureZone || "Area") : "Recommendation";
          a.download = \`AlWafaStar-Video-\${zoneNameForFile.replace(/\\s+/g, "_")}-\${timestamp}.\${ext}\`;
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            document.body.removeChild(a);
            // We do NOT revoke the URL here because we need it to play inside the app!
          }, 100);`;

const safeVideoDownload = `          // Dev Storage Auto-Save for Video disabled for iframe safety on mobile browsers
          // Video URL is safely appended directly inside the app`;

content = content.replace(targetVideoDownload, safeVideoDownload);

fs.writeFileSync(filePath, content);
console.log("Safe video logic applied.");
