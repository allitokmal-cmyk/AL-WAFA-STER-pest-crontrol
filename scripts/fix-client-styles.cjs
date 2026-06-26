const fs = require('fs');

const file = 'src/components/ClientDirectory.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Fix CSS for generateReportHTML
// Find the <style> tag of generateReportHTML
let firstStyleStart = code.indexOf('<style>', 0);
let firstStyleEnd = code.indexOf('</style>', firstStyleStart);

if (firstStyleStart > -1 && firstStyleEnd > -1) {
    let reportCss = `    <style>
        * { box-sizing: border-box; }
        @media print {
            @page { size: A4 portrait; margin: 0; }
            * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
            }
            body { margin: 0 !important; padding: 0 !important; background: #ffffff !important; }
            .report-wrapper {
                margin: 0 !important;
                padding: 10mm 15mm !important;
                width: 210mm !important;
                max-width: 210mm !important;
                box-shadow: none !important;
                border: none !important;
            }
        }
        .report-wrapper {
            font-family: Arial, sans-serif;
            color: #0f172a;
            background-color: #FFFDF3;
            line-height: 1.4;
            max-width: 210mm;
            margin: 0 auto;
            border: 1px solid black;
            box-shadow: 0 10px 30px rgba(0,0,0,0.8);
            padding: 30px; 
            position: relative;
        }
        /* Absolute Watermark for Report Wrapper if needed (from the screenshot it has a star watermark top right) */
        .watermark-absolute {
           position: absolute;
           top: 50%;
           left: 50%;
           transform: translate(-50%, -50%);
           width: 120mm;
           height: 120mm;
           opacity: 0.05;
           z-index: 0;
           pointer-events: none;
        }
        .header-box { border: 1px solid #0f172a; padding: 12px; margin-bottom: 12px; background-color: #ffffff; position: relative; z-index: 10; }
        .header-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 11px; }
        .header-grid div { display: flex; }
        .header-grid div strong { width: 100px; flex-shrink: 0; }
        .header-grid div span { flex-grow: 1; border-bottom: 1px dotted #94a3b8; padding-bottom: 2px; }
        .company-header { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #0f172a; padding-bottom: 10px; margin-bottom: 15px; position: relative; z-index: 10; }
        .company-header h1 { margin: 0; font-size: 20px; font-weight: 900; color: #0f172a; }
        .company-header p { margin: 2px 0 0 0; font-size: 10px; font-weight: bold; color: #b91c1c; }
        .section-title { background-color: #1e293b; color: #ffffff; padding: 6px 10px; font-size: 12px; font-weight: bold; margin-bottom: 15px; position: relative; z-index: 10; }
        
        .box-container { border: 1px solid #0f172a; padding: 15px; border-radius: 4px; margin-bottom: 15px; background-color: #ffffff; position: relative; z-index: 10; }
        .flex-row { display: flex; gap: 20px; align-items: flex-start; }
        .col-half { width: 50%; }
        
        .checkbox-group { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; font-size: 11px; }
        .checkbox-item { display: flex; align-items: center; gap: 6px; }
        .check-box { width: 12px; height: 12px; border: 1px solid #0f172a; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; background: white; }
        .check-box.checked { background-color: #0f172a; color: white; border-color: #0f172a; }
        
        table { width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 10px; position: relative; z-index: 10; background: white;}
        th, td { border: 1px solid #0f172a; padding: 6px; text-align: left; }
        th { background-color: #cbd5e1; font-weight: bold; }
        td.center { text-align: center; }
        
        .textarea-box { width: 100%; min-height: 50px; font-size: 11px; padding: 10px; border: 1px solid #0f172a; background-color: #ffffff; position: relative; z-index: 10; }
        .recommendation-box { width: 100%; min-height: 80px; font-size: 11px; padding: 10px; border: 1px solid #0f172a; border-radius: 4px; background-color: #f8fafc; position: relative; z-index: 10; }
        
        .footer-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 30px; font-size: 11px; position: relative; z-index: 10; }
        .footer-sig-box { min-height: 60px; border: 1px solid #cbd5e1; border-radius: 4px; background-color: #ffffff; display: flex; align-items: center; justify-content: center; overflow: hidden;}
        .footer-sig-box img { max-height: 58px; max-width: 100%; object-fit: contain;}
        
        .condition-list { font-size: 10px; border: 1px solid #e2e8f0; border-radius: 4px; background-color: #ffffff; position: relative; z-index: 10;}
        .condition-row { display: flex; border-bottom: 1px dashed #e2e8f0; }
        .condition-row:last-child { border-bottom: none; }
`;

    // replace old CSS block but keep everything after the last class in the block
    let endCssIndex = code.indexOf('        @media print {', firstStyleStart);
    if(endCssIndex === -1) endCssIndex = code.indexOf('.container {', firstStyleStart);
    if(endCssIndex === -1) endCssIndex = firstStyleEnd;

    // wait just replace the whole style tag
    // it's easier to use substring logic
    // we know what we need for generateReportHTML
    code = code.substring(0, firstStyleStart) + reportCss + code.substring(firstStyleEnd);
}

// 2. Fix CSS for generateEngineeringHTML
// Find the <style> tag of generateEngineeringHTML
const secondStyleStart = code.lastIndexOf('<style>');
const secondStyleEnd = code.lastIndexOf('</style>');

if (secondStyleStart > -1 && secondStyleEnd > -1 && secondStyleStart !== firstStyleStart) {
    let engCss = `    <style>
        * { box-sizing: border-box; }
        .engineering-report-wrapper {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #1e293b;
            background-color: #f1f5f9;
            line-height: 1.5;
            margin: 0;
            padding: 30px;
        }
        .pdf-page {
            box-sizing: border-box;
            width: 210mm;
            min-height: 297mm;
            padding: 15mm;
            background: #ffffff;
            position: relative;
            margin: 0 auto 30px auto;
            border: 1px solid #1f1f1f;
            box-shadow: 0 10px 30px rgba(0,0,0,0.8);
            page-break-after: always;
            break-after: page;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }
        .pdf-page-flow {
            box-sizing: border-box;
            width: 210mm;
            min-height: 297mm;
            padding: 15mm;
            background: #ffffff;
            position: relative;
            margin: 0 auto 30px auto;
            border: 1px solid #1f1f1f;
            box-shadow: 0 10px 30px rgba(0,0,0,0.8);
            page-break-after: always;
            break-after: page;
        }
        /* Add CSS for the red watermark star so it's a giant background watermark! */
        .watermark {
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
        /* the dynamic content must have z-index to appear above the watermark */
        .header, .section-title, .photo-grid, .executive-summary, .status-grid, table {
            position: relative;
            z-index: 10;
        }
        /* Prevent extra blank trailing page at the end of the PDF */
        .pdf-page:last-of-type,
        .pdf-page-flow:last-of-type,
        body > *:last-child {
            margin-bottom: 0 !important;
            border-bottom: none !important;
            page-break-after: avoid !important;
            break-after: avoid !important;
        }
        .text-area-box {
            font-size: 11px;
            color: #334155;
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 10px;
            margin-bottom: 12px;
            white-space: pre-wrap;
            line-height: 1.6;
            position: relative;
            z-index: 10;
        }
        .photo-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-top: 15px;
        }
        .photo-card {
            border: 1px solid #e2e8f0;
            padding: 12px;
            border-radius: 8px;
            background-color: #ffffff;
            page-break-inside: avoid;
            background: #fff;
        }
        .photo-card img {
            width: 100%;
            height: 180px;
            object-fit: cover;
            border-radius: 4px;
            margin-bottom: 10px;
        }
        .photo-card p {
            margin: 0;
            font-size: 10px;
            color: #475569;
        }
        .status-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-top: 20px;
        }
        .status-box {
            background-color: #f8fafc;
            border: 1px solid #cbd5e1;
            border-radius: 4px;
            padding: 15px;
        }
        .status-box h3 { margin: 0 0 10px 0; font-size: 13px; color: #0f172a; text-transform: uppercase; font-weight: bold; border-bottom: 2px solid #cbd5e1; padding-bottom: 5px; }
        .status-item { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 8px; border-bottom: 1px dashed #e2e8f0; padding-bottom: 4px;}
        .status-item:last-child { margin-bottom: 0; border-bottom: none; padding-bottom: 0; }
        
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
            margin-top: 8px;
            background: #fff;
        }
        th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
        th { background-color: #f1f5f9; color: #0f172a; font-weight: bold; text-transform: uppercase; border-bottom: 2px solid #94a3b8; }
        
        @media print {
            @page { size: A4 portrait; margin: 0; }
            * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
            }
            body { margin: 0 !important; background: #ffffff !important; }
            .engineering-report-wrapper { padding: 0 !important; margin: 0 !important; background: #ffffff !important; width: 100%; }
            .pdf-page, .pdf-page-flow {
                width: 210mm !important;
                height: 297mm !important;
                margin: 0 auto !important;
                border: none !important;
                box-shadow: none !important;
                padding: 10mm 15mm !important;
            }
            .pdf-page-flow {
                height: auto !important;
                min-height: 297mm !important;
            }
        }`;
    
    code = code.substring(0, secondStyleStart) + engCss + code.substring(secondStyleEnd);
}

fs.writeFileSync(file, code);
console.log("Updated styles in", file);
