const fs = require('fs');

const files = [
  'src/components/MasterForm.tsx',
  'src/components/CompletedRegistry.tsx',
  'src/components/CustomServiceModule.tsx',
  'src/components/Dashboard.tsx',
  'src/components/EngineeringReport.tsx',
  'src/components/ClientDirectory.tsx',
];

for (const filePath of files) {
  if (!fs.existsSync(filePath)) continue;
  let code = fs.readFileSync(filePath, 'utf8');

  const marker = 'alert("Please allow pop-ups to print the PDF report.");\n      }';
  const endMarker = '    } catch (e) {';
  const endMarkerAlt = '    } catch (err) {';

  let mIdx = code.indexOf(marker);
  if (mIdx !== -1) {
    let startCut = mIdx + marker.length;
    // We want the last catch block of the function. Let's find the first catch(e) that matches the outer try.
    // Let's just find the exact last catch block in the function! 
    // Wait, let's just find `    } catch (e) {` or `    } catch (err) {` by looking forward from startCut, and taking the LAST one before `  };`
    let nextFuncEnd = code.indexOf('  };', startCut);
    if (nextFuncEnd === -1) nextFuncEnd = startCut + 2000;
    
    let sub = code.slice(startCut, nextFuncEnd);
    let lastCatch = sub.lastIndexOf('    } catch (e) {');
    if (lastCatch === -1) lastCatch = sub.lastIndexOf('    } catch (err) {');
    if (lastCatch === -1) lastCatch = sub.lastIndexOf('    } catch (');
    
    if (lastCatch !== -1) {
       let isGeneratingVar = sub.includes('setIsGeneratingPDF(false)') ? '\n      setIsGeneratingPDF(false);' : '';
       let finalEndCut = startCut + lastCatch;
       code = code.slice(0, startCut) + isGeneratingVar + '\n' + code.slice(finalEndCut);
       fs.writeFileSync(filePath, code);
       console.log("Fixed", filePath);
    }
  }
}
