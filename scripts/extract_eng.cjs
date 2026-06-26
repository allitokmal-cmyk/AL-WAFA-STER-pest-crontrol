const fs = require('fs');
const code = fs.readFileSync('src/components/EngineeringReport.tsx', 'utf8');

const sIdx = code.indexOf('    const htmlContent = `<!DOCTYPE html>');
const eIdx = code.indexOf('    const tempDiv = document.createElement("div");', sIdx);

if (sIdx > 0 && eIdx > 0) {
  let htmlGenCode = code.substring(sIdx, eIdx);
  const generatorStr = `
export const generateEngineeringHTML = (report: any, language: string) => {
    const isBengali = language === "bn";
    const amountLabel = report.serviceType || "Routine Visit";
    const chunkArray = <T,>(arr: T[], size: number): T[][] => {
      const result: T[][] = [];
      if (!arr) return result;
      for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size));
      }
      return result;
    };
    
${htmlGenCode}
    return htmlContent;
};
`;

  let clientDirCode = fs.readFileSync('src/components/ClientDirectory.tsx', 'utf8');
  clientDirCode = clientDirCode.replace(/export default function ClientDirectory\(\{/, generatorStr + '\nexport default function ClientDirectory({');
  fs.writeFileSync('src/components/ClientDirectory.tsx', clientDirCode);
  console.log('done modifying ClientDirectory.tsx');
} else {
  console.log('could not find indices');
}
