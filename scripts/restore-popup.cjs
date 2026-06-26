const fs = require('fs');

function restoreHandleDownload(file) {
    let code = fs.readFileSync(file, 'utf8');
    const brokeStr = `  const handleDownloadPDF = async () => {\n    triggerPrintDoc();\n  };`;
    const brokeStr2 = `  const handleDownloadPDF = async (reportParam?: SavedEngineeringReport) => {\n    handlePrintTrigger();\n  };`;

    if (code.includes(brokeStr) && file.includes('Dashboard')) {
        const replacement = `  const handleDownloadPDF = async () => {
    if (!activeReportDetails) return;

    const defaultName = \`AlWafaStar-Report-\${activeReportDetails.ticketNo || activeReportDetails.id}\`;
    const customFileName = defaultName;

    setIsGeneratingPDF(true);
    
    try {
      let contentHtml = "";
      const isEngineering = !!activeReportDetails.rawEngineeringData;
      const layoutWidth = isEngineering ? 794 : 816;

      if (isEngineering) {
        contentHtml = generateEngineeringHTML(activeReportDetails.rawEngineeringData, language);
      } else {
        contentHtml = generateReportHTML(activeReportDetails, language);
      }

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(contentHtml);
        printWindow.document.close();
        printWindow.document.title = customFileName;

        printWindow.setTimeout(() => {
          printWindow.focus();
          printWindow.print();
        }, 500);
      } else {
        alert("Please allow pop-ups to print the PDF report.");
      }
      setIsGeneratingPDF(false);
    } catch (e) {
      console.error(e);
      setIsGeneratingPDF(false);
    }
  };`;
        code = code.replace(brokeStr, replacement);
    }

    if (code.includes(brokeStr) && file.includes('CompletedRegistry')) {
        const replacement = `  const handleDownloadPDF = async () => {
    if (!activeReportDetails) return;

    const defaultName = \`AlWafaStar-Report-\${activeReportDetails.ticketNo || activeReportDetails.id}\`;
    const customFileName = defaultName;

    setIsGeneratingPDF(true);
    
    try {
      let contentHtml = "";
      const isEngineering = !!activeReportDetails.rawEngineeringData;
      const layoutWidth = isEngineering ? 794 : 816;

      if (isEngineering) {
        contentHtml = generateEngineeringHTML(activeReportDetails.rawEngineeringData, language);
      } else {
        contentHtml = generateReportHTML(activeReportDetails, language);
      }

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(contentHtml);
        printWindow.document.close();
        printWindow.document.title = customFileName;

        printWindow.setTimeout(() => {
          printWindow.focus();
          printWindow.print();
        }, 500);
      } else {
        alert("Please allow pop-ups to print the PDF report.");
      }
      setIsGeneratingPDF(false);
    } catch (e) {
      console.error(e);
      setIsGeneratingPDF(false);
    }
  };`;
        code = code.replace(brokeStr, replacement);
    }

    if (code.includes(brokeStr2) && file.includes('EngineeringReport')) {
        const replacement = `  const handleDownloadPDF = async (reportParam?: SavedEngineeringReport) => {
    const report = reportParam || selectedReport;
    if (!report) return;

    const defaultName = \`AlWafaStar-Engineering-\${report.reportNo || report.id}\`;
    const customFileName = defaultName;

    setIsGeneratingPDF(true);

    try {
      const contentHtml = generateEngineeringHTML(report, language);

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(contentHtml);
        printWindow.document.close();
        printWindow.document.title = customFileName;

        printWindow.setTimeout(() => {
          printWindow.focus();
          printWindow.print();
        }, 500);
      } else {
        alert("Please allow pop-ups to print the PDF report.");
      }
      setIsGeneratingPDF(false);
    } catch (e) {
      console.error(e);
      setIsGeneratingPDF(false);
    }
  };`;
        code = code.replace(brokeStr2, replacement);
    }
    
    fs.writeFileSync(file, code);
}

restoreHandleDownload('src/components/Dashboard.tsx');
restoreHandleDownload('src/components/CompletedRegistry.tsx');
restoreHandleDownload('src/components/EngineeringReport.tsx');
console.log("Restored popup logic!");
