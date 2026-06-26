const fs = require('fs');
let code = fs.readFileSync('src/components/EngineeringReport.tsx', 'utf8');

const sIdx = code.indexOf('    const isBengali = language === "bn";');
const eIdx = code.indexOf('    const tempDiv = document.createElement("div");', sIdx);

if (sIdx > 0 && eIdx > 0) {
  let innerVars = code.substring(sIdx, eIdx);
  const generatorStr = `
export const generateEngineeringHTML = (report: any, language: string) => {
    const amountLabel = report.serviceType || "Routine Visit";
    const chunkArray = <T,>(arr: T[], size: number): T[][] => {
      const result: T[][] = [];
      if (!arr) return result;
      for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size));
      }
      return result;
    };
    
${innerVars}
    return htmlContent;
};
`;

  let clientDirCode = fs.readFileSync('src/components/ClientDirectory.tsx', 'utf8');
  
  // Replace the old export const generateEngineeringHTML ... to its end
  const patternStart = 'export const generateEngineeringHTML = (report: any, language: string) => {';
  const patternEnd = '    return htmlContent;\n};\n';
  
  const cStartIdx = clientDirCode.indexOf(patternStart);
  const cEndIdx = clientDirCode.indexOf(patternEnd, cStartIdx) + patternEnd.length;
  
  if (cStartIdx > -1) {
    clientDirCode = clientDirCode.substring(0, cStartIdx) + generatorStr + clientDirCode.substring(cEndIdx);
    fs.writeFileSync('src/components/ClientDirectory.tsx', clientDirCode);
    console.log('fixed ClientDirectory.tsx');
  } else {
    console.log('could not find old generateEngineeringHTML');
  }
} else {
  console.log('could not find indices in EngineeringReport');
}
