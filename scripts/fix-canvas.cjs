const fs = require('fs');
const filePath = 'src/components/EngineeringReport.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

const targetCanvasCapture = `    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Draw frame
      ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);`;

const safeCanvasCapture = `    const ctx = canvas.getContext("2d");
    if (ctx) {
      let dataUrl = "";
      try {
        // Draw frame
        ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
        dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      } catch(err) {
        console.error("Failed to capture image from video:", err);
        setCameraError("Canvas error: Device not ready for photo frame.");
        return; // Abort
      }`;

content = content.replace(targetCanvasCapture, safeCanvasCapture);

fs.writeFileSync(filePath, content);
console.log("Made canvas capture safe.");
