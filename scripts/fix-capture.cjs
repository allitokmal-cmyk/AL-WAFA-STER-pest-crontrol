const fs = require('fs');
const filePath = 'src/components/EngineeringReport.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

const targetCapture = `      // Provide better feedback and close after a slightly longer delay so the user understands the photo was taken!
      setTimeout(() => {
        handleCloseLiveCamera();
      }, 900);`;

const replacement = `      // Removed automatic camera close so user can take multiple photos consecutively
      // handleCloseLiveCamera();`;

content = content.replace(targetCapture, replacement);

fs.writeFileSync(filePath, content);
console.log("Auto-close removed.");
