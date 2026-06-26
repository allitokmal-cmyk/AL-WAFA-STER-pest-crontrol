const fs = require('fs');
const filePath = 'src/components/EngineeringReport.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Fix photo save to device logic
const targetPhoto = `      // Device Storage Auto-Save removed for mobile iframe safety.
      // Photo is now safely inside the system!`;

const replacementPhoto = `      // Device Storage Auto-Save: Automatically trigger physical browser download of captured photo
      try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const zoneNameForFile = liveCamType === "work" ? (activeCaptureZone || "Area") : "Recommendation";
        const filename = \`AlWafaStar-Evidence-\${zoneNameForFile.replace(/\\s+/g, "_")}-\${timestamp}.jpg\`;
        
        // Native-like download for mobile browsers
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = filename;
        link.target = "_blank"; // Fix for some webviews
        document.body.appendChild(link);
        link.click();
        
        // Cleanup after a short delay
        setTimeout(() => {
          if (document.body.contains(link)) document.body.removeChild(link);
        }, 100);
      } catch (err) {
        console.error("Auto-download of captured image failed:", err);
      }`;

content = content.replace(targetPhoto, replacementPhoto);

// 2. Fix Video save to device logic
const targetVideo = `          // Dev Storage Auto-Save for Video disabled for iframe safety on mobile browsers
          // Video URL is safely appended directly inside the app`;

const replacementVideo = `          // Download video locally onto device storage (just like photo)
          try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
            const zoneNameForFile = liveCamType === "work" ? (activeCaptureZone || "Area") : "Recommendation";
            const filename = \`AlWafaStar-Video-\${zoneNameForFile.replace(/\\s+/g, "_")}-\${timestamp}.\${ext}\`;
            
            const link = document.createElement("a");
            link.href = videoUrl;
            link.download = filename;
            link.target = "_blank"; // Fix for some webviews
            document.body.appendChild(link);
            link.click();
            
            // Cleanup
            setTimeout(() => {
              if (document.body.contains(link)) document.body.removeChild(link);
            }, 100);
          } catch(err) {
             console.error("Video download failed", err);
          }`;

content = content.replace(targetVideo, replacementVideo);

// Write back
fs.writeFileSync(filePath, content);
console.log("Successfully restored auto-downloads for photos and videos!");
