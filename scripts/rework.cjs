const fs = require('fs');
let content = fs.readFileSync('src/components/EngineeringReport.tsx', 'utf8');

const targetRegex = /const handleDownloadPDF = async \([\s\S]*?catch \(e\) \{\n      console\.error\(e\);\n      setIsGeneratingPDF\(false\);\n    \}\n  \};/;

const newImplementation = `const handleDownloadPDF = async (reportParam?: SavedEngineeringReport) => {
    const report = reportParam || selectedReport;
    if (!report) return;

    const defaultName = \`AlWafaStar-Engineering-\${report.reportNo || report.id}\`;
    const customFileName = defaultName;

    setIsGeneratingPDF(true);

    const wasPreviewActive = activeSegment === "preview" && selectedReport?.id === report.id;
    
    try {
      const overlay = document.createElement("div");
      overlay.id = "pdf-loading-overlay";
      overlay.style.position = "fixed";
      overlay.style.top = "0";
      overlay.style.left = "0";
      overlay.style.width = "100vw";
      overlay.style.height = "100vh";
      overlay.style.backgroundColor = "rgba(15, 23, 42, 0.95)";
      overlay.style.zIndex = "999999";
      overlay.style.display = "flex";
      overlay.style.flexDirection = "column";
      overlay.style.alignItems = "center";
      overlay.style.justifyContent = "center";
      overlay.style.color = "white";
      overlay.innerHTML = \`
        <div style="font-size: 40px; margin-bottom: 20px;">🖨️</div>
        <div style="font-size: 18px; font-weight: bold; font-family: sans-serif;">\${language === "bn" ? "PDF তৈরি হচ্ছে, অপেক্ষা করুন..." : "Preparing PDF Document..."}</div>
      \`;
      document.body.appendChild(overlay);

      if (!wasPreviewActive) {
        setSelectedReport(report);
        setActiveSegment("preview");
        // Wait for React to render the component correctly
        await new Promise(r => setTimeout(r, 600));
      }

      const originalElement = document.getElementById("printable-document-sheet");
      if (!originalElement) {
        throw new Error("Printable document missing from DOM.");
      }

      const clone = originalElement.cloneNode(true) as HTMLElement;
      
      // Remove any interactive UI boundaries to look like paper
      clone.classList.remove('shadow-2xl', 'rounded-2xl', 'border', 'border-slate-200/80', 'p-8', 'sm:p-12', 'md:p-12', 'mb-8', 'max-w-4xl', 'mx-auto');
      
      // Ensure specific print dimensions matching A4 standard
      const container = document.createElement("div");
      container.id = "pdf-temp-container";
      container.style.position = "absolute";
      container.style.left = "-9999px";
      container.style.top = "-9999px";
      container.style.width = "794px"; // 210mm in px roughly
      container.style.backgroundColor = "#FFFDF3"; // Paper color
      container.appendChild(clone);
      document.body.appendChild(container);

      const images = Array.from(container.querySelectorAll("img"));
      const imagePromises = images.map((img) => {
        return new Promise<void>((resolve) => {
          if (img.complete) {
            resolve();
          } else {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          }
        });
      });

      Promise.all(imagePromises).then(async () => {
        await new Promise(r => setTimeout(r, 10));
        try {
          const opt = {
            margin:       0,
            filename:     customFileName + '.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true, windowWidth: 794 },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
          };
          await html2pdf().set(opt).from(clone).save();
        } catch (err) {
          console.error("PDF generator error:", err);
        } finally {
          if (document.body.contains(overlay)) document.body.removeChild(overlay);
          if (document.body.contains(container)) document.body.removeChild(container);
          
          if (!wasPreviewActive) {
            setActiveSegment("list"); // Restore back to list
          }
          setIsGeneratingPDF(false);
        }
      });

    } catch (e) {
      console.error(e);
      setIsGeneratingPDF(false);
      const overlay = document.getElementById("pdf-loading-overlay");
      if (overlay && document.body.contains(overlay)) document.body.removeChild(overlay);
    }
  };`;

if (content.match(targetRegex)) {
  content = content.replace(targetRegex, newImplementation);
  fs.writeFileSync('src/components/EngineeringReport.tsx', content, 'utf8');
  console.log("Success");
} else {
  console.log("Regex missed!");
}
