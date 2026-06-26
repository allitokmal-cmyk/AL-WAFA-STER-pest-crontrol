const fs = require('fs');
let code = fs.readFileSync('src/components/ChemicalInventory.tsx', 'utf8');

// I will just replace the exact text I accidentally inserted, with the original text!
const botched = `{reqClosingLine}
                           <style dangerouslySetInnerHTML={{ __html: \`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap');
          * { box-sizing: border-box; }
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
            font-family: Arial, Helvetica, sans-serif !important;
          }
          #print-content {
            width: 210mm;
            min-height: 297mm;
            padding: 15mm;
            margin: 0 auto;
            box-sizing: border-box;
            background: #ffffff;
            border: 1px solid #e5e5e5;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            position: relative;
          }
          .watermark-chemical {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 140mm;
            height: 140mm;
            opacity: 0.05;
            pointer-events: none;
            z-index: 0;
          }
          #print-content > * {
            position: relative;
            z-index: 10;
          }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; background: #fff;}
          th, td { border: 1px solid #111; padding: 8px; text-align: left; }
          th { background-color: #f3f4f6 !important; font-weight: bold; }
          .header-box { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 25px; border-bottom: 3px solid #111; padding-bottom: 10px; }
          .signature-box { border: 1px dashed #999; height: 80px; width: 100%; margin-top: 5px; background: #fafafa;}
          @media print {
            @page { size: A4 portrait; margin: 0; }
            body { margin: 0 !important; }
            #print-content {
               width: 210mm !important;
               min-height: 297mm !important;
               margin: 0 auto !important;
               padding: 10mm 15mm !important;
               border: none !important;
               box-shadow: none !important;
            }
          }
            \` }} /></div>
                      </div>
                    </div>
                  )}`;

const original = `{reqClosingLine}
                      </p>

                      {/* Signature Area */}
                      <div className="flex justify-end mt-4" style={{ fontFamily: 'Arial, sans-serif' }}>
                        <div className="text-center flex flex-col items-center">
                          {aishaSigned ? (
                            <div className="relative w-40 flex flex-col items-center">
                              {/* Signature Image or SVG Draft design */}
                              {customSignatureUrl ? (
                                <img 
                                  src={customSignatureUrl} 
                                  alt="Authorized Signature" 
                                  className="h-10 max-w-[140px] object-contain mix-blend-multiply dark:mix-blend-normal opacity-95 block mb-1" 
                                />
                              ) : (
                                <svg viewBox="0 0 100 35" className="w-28 h-9 text-blue-900 ml-4 opacity-90 block">
                                  <path d="M5,25 C15,5 30,10 40,22 C50,30 65,5 75,18 C85,25 90,15 98,24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                                  <path d="M12,18 C35,15 60,30 85,15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                                  <circle cx="85" cy="24" r="8" fill="none" stroke="#dc2626" strokeWidth="1" strokeDasharray="2,1" />
                                  <text x="85" y="26" fontSize="6" textAnchor="middle" fill="#dc2626" fontWeight="bold" fontFamily="monospace">OK</text>
                                </svg>
                              )}
                              <div className="font-bold text-slate-900 text-[11.5px] mt-1">{requesterName}</div>
                              <div className="text-[9.5px] text-slate-500 font-bold tracking-wide uppercase">{requesterDesignation}</div>
                            </div>
                          ) : (
                            <div className="w-40 border-b border-dashed border-slate-300 h-10 flex items-center justify-center text-[10px] text-slate-400 italic">
                              Pending sign-off review
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}`;

const styleErr = `            <style>{\`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap');`;

const styleFix = `            <style dangerouslySetInnerHTML={{ __html: \`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap');`;

const endErr = `               box-shadow: none !important;
            }
          }\`}</style>`;

const endFix = `               box-shadow: none !important;
            }
          }
          \` }} />`;

if (code.includes(botched)) {
  code = code.replace(botched, original);
}

if (code.includes(styleErr)) {
  code = code.replace(styleErr, styleFix);
}
if (code.includes(endErr)) {
  code = code.replace(endErr, endFix);
}

fs.writeFileSync('src/components/ChemicalInventory.tsx', code);
console.log("Fixed errors");
