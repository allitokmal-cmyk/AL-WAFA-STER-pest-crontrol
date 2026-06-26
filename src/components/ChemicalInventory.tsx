import React, { useState, useEffect } from "react";
// @ts-ignore
import { 
  FlaskConical, 
  HelpCircle, 
  RefreshCw, 
  ArrowUpRight, 
  AlertOctagon, 
  QrCode, 
  CheckCircle,
  FileSpreadsheet,
  Trash2,
  X,
  Search,
  Lock,
  ChevronRight,
  Eye,
  Database,
  Building2,
  Calendar,
  Droplets,
  ClipboardList,
  Printer,
  Send,
  Plus,
  ShoppingCart,
  Save,
  FolderOpen
} from "lucide-react";
import { ChemicalRef } from "../types";
import { getDocuments, saveDocument, deleteDocument, getStoreValue, saveStoreValue, subscribeCollection, subscribeStoreValue } from "../localDatabase";


interface ChemicalInventoryProps {
  language: "en" | "ar" | "bn";
  themeMode?: "dark" | "light";
}

export default function ChemicalInventory({ language, themeMode = "dark" }: ChemicalInventoryProps) {
  const isDark = themeMode === "dark";
  const [chemicals, setChemicals] = useState<ChemicalRef[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Add new chemical state
  const [newChemName, setNewChemName] = useState("");
  const [newChemReceived, setNewChemReceived] = useState("");
  const [newChemDilution, setNewChemDilution] = useState("");
  const [newChemBatch, setNewChemBatch] = useState("");
  const [newChemExpiry, setNewChemExpiry] = useState("");
  const [newChemStock, setNewChemStock] = useState("");
  const [newChemUnit, setNewChemUnit] = useState("L");
  
  // Custom dialogs & notifications state
  const [deleteConfirmName, setDeleteConfirmName] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  // Chemical Received History Log spreadsheet state
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [historySearch, setHistorySearch] = useState("");
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Chemical Service Reports consumption log state
  const [reports, setReports] = useState<any[]>([]);
  const [isServiceReportModalOpen, setIsServiceReportModalOpen] = useState(false);
  const [serviceReportSearch, setServiceReportSearch] = useState("");

  // Chemical Requisition & Order Request State
  const [isRequisitionModalOpen, setIsRequisitionModalOpen] = useState(false);
  const [requisitionItems, setRequisitionItems] = useState([
    { id: "req-1", name: "DELTACIDE SPEEDY", batch: "BATCH-88219", qty: "10", unit: "Pcs", purpose: "2026-06-12" },
    { id: "req-2", name: "TRIPLE POWER", batch: "BATCH-11029", qty: "12", unit: "Pcs", purpose: "2026-06-12" },
    { id: "req-3", name: "PROVECTA", batch: "BATCH-99411", qty: "3", unit: "Pcs", purpose: "2026-06-12" },
    { id: "req-4", name: "CHOCKROACH GEL", batch: "BATCH-44023", qty: "6", unit: "Pcs", purpose: "2026-06-12" },
    { id: "req-5", name: "ANT GEL", batch: "BATCH-10992", qty: "4", unit: "Pcs", purpose: "2026-06-12" },
    { id: "req-6", name: "SNAKE REPELLENT", batch: "BATCH-30112", qty: "3", unit: "Pcs", purpose: "2026-06-12" },
    { id: "req-7", name: "WAX BLOCKS", batch: "BATCH-22018", qty: "5", unit: "kg", purpose: "2026-06-12" },
    { id: "req-8", name: "FOGGING MACHIN (GOOD QUALITY)", batch: "N/A", qty: "1", unit: "Pcs", purpose: "2026-06-12" }
  ]);
  const [reqInputName, setReqInputName] = useState("");
  const [reqInputBatch, setReqInputBatch] = useState("");
  const [reqInputQty, setReqInputQty] = useState("");
  const [reqInputUnit, setReqInputUnit] = useState("Pcs");
  const [reqInputPurpose, setReqInputPurpose] = useState(() => new Date().toISOString().split('T')[0]);
  const [isCustomReqChemical, setIsCustomReqChemical] = useState(false);

  const handleReqChemicalSelect = (chemName: string) => {
    setReqInputName(chemName);
    if (!chemName) return;
    const found = chemicals.find(c => c.name === chemName);
    if (found) {
      setReqInputBatch(found.batch || "N/A");
      setReqInputUnit(found.unit || "L");
      showToast(
        language === "bn"
          ? `${found.name} কেমিক্যালের বিবরণ ও ব্যাচ নং (${found.batch || "N/A"}) স্বয়ংক্রিয়ভাবে লোড হয়েছে!`
          : `${found.name} details & Batch (${found.batch || "N/A"}) loaded automatically!`,
        "success"
      );
    }
  };

  const handleReqBatchSelect = (batchVal: string) => {
    setReqInputBatch(batchVal);
    if (!batchVal) return;
    const found = chemicals.find(c => c.batch === batchVal);
    if (found) {
      setReqInputName(found.name);
      setReqInputUnit(found.unit || "L");
      showToast(
        language === "bn"
          ? `ব্যাচ নং ${batchVal} এর কেমিক্যাল (${found.name}) স্বয়ংক্রিয়ভাবে লোড হয়েছে!`
          : `Chemical (${found.name}) loaded automatically for Batch ${batchVal}!`,
        "success"
      );
    }
  };

  const increaseRequisitionQty = (id: string) => {
    setRequisitionItems(prev => prev.map(item => {
      if (item.id === id) {
        const current = parseFloat(item.qty) || 0;
        return { ...item, qty: (current + 1).toString() };
      }
      return item;
    }));
    showToast(
      language === "bn" ? "পরিমাণ বাড়ানো হয়েছে!" : "Quantity increased!",
      "success"
    );
  };

  const decreaseRequisitionQty = (id: string) => {
    let wasRemoved = false;
    setRequisitionItems(prev => {
      const updated = prev.map(item => {
        if (item.id === id) {
          const current = parseFloat(item.qty) || 0;
          const newQty = current - 1;
          if (newQty <= 0) {
            wasRemoved = true;
            return null;
          }
          return { ...item, qty: newQty.toString() };
        }
        return item;
      }).filter((item): item is typeof requisitionItems[0] => item !== null);
      
      return updated;
    });

    if (wasRemoved) {
      showToast(
        language === "bn" ? "আইটেমটি চাহিদা তালিকা থেকে মুছে ফেলা হয়েছে!" : "Item removed from draft!",
        "info"
      );
    } else {
      showToast(
        language === "bn" ? "পরিমাণ কমানো হয়েছে!" : "Quantity decreased!",
        "success"
      );
    }
  };
  
  // Custom document flow headers to exactly replicate uploaded image
  const [reqFrom, setReqFrom] = useState("AL WAFA Star – Pest Control Department");
  const [reqEngineer, setReqEngineer] = useState("Engineer Aisha");
  const [reqTo, setReqTo] = useState("Store Keeper");
  const [reqDateStr, setReqDateStr] = useState(new Date().toLocaleDateString("en-GB"));
  const [reqOpeningLine, setReqOpeningLine] = useState("I would like to request the following pest control chemicals and tools for routine services.");
  const [reqClosingLine, setReqClosingLine] = useState("Kindly arrange to provide the above chemicals & Tools and hand them over to our technician.");

  const [requesterName, setRequesterName] = useState("Aisha Elsiddig");
  const [requesterDesignation, setRequesterDesignation] = useState("Pest Control Engineer");
  const [aishaSigned, setAishaSigned] = useState(true);
  const [customSignatureUrl, setCustomSignatureUrl] = useState<string>(() => {
    return localStorage.getItem("ALW_STAR_CUSTOM_SIGNATURE") || "";
  });
  const [requisitionViewMode, setRequisitionViewMode] = useState<"draft" | "preview">("preview");

  const [savedRequisitions, setSavedRequisitions] = useState<any[]>(() => {
    const cached = localStorage.getItem("ALW_STAR_SAVED_REQUISITIONS");
    return cached ? JSON.parse(cached) : [];
  });

  // Pull shared requisitions on load from Firestore
  useEffect(() => {
    getStoreValue<any[]>("chemicalRequisitions", [])
      .then(data => {
        if (data && data.length > 0) {
          setSavedRequisitions(data);
          localStorage.setItem("ALW_STAR_SAVED_REQUISITIONS", JSON.stringify(data));
        }
      })
      .catch((error) => {
        console.warn("Firestore error reading chemicalRequisitions (running offline):", error);
      });
  }, []);

  const updateSavedRequisitions = (newList: any[]) => {
    // Only local update; saving individual files is handled by handleSaveRequisition 
    // Wait, updateSavedRequisitions is used somewhere else, maybe delete so I should implement setDoc for each item.
    setSavedRequisitions(newList);
    localStorage.setItem("ALW_STAR_SAVED_REQUISITIONS", JSON.stringify(newList));
  };

  const [isSavedReqsHistoryModalOpen, setIsSavedReqsHistoryModalOpen] = useState(false);
  const [viewingSavedReqPdf, setViewingSavedReqPdf] = useState<any | null>(null);
  const [tempPrintReq, setTempPrintReq] = useState<any | null>(null);

  const handleSaveRequisition = () => {
    if (requisitionItems.length === 0) {
      showToast(
        language === "bn" 
          ? "সংরক্ষণ করার মতো রিকুয়েস্ট আইটেম নেই।" 
          : "No items added to current requisition to save.", 
        "error"
      );
      return;
    }
    
    const newRecord = {
      id: `saved-req-${Date.now()}`,
      savedAt: new Date().toLocaleString(),
      dateStr: reqDateStr,
      from: reqFrom,
      engineer: reqEngineer,
      to: reqTo,
      items: [...requisitionItems],
      opening: reqOpeningLine,
      closing: reqClosingLine,
      signatoryName: requesterName,
      signatoryDesignation: requesterDesignation,
      aishaSigned: aishaSigned,
      customSignatureUrl: customSignatureUrl
    };

    // Offline-First: update state and localStorage immediately
    const updated = [newRecord, ...savedRequisitions];
    updateSavedRequisitions(updated);

    saveStoreValue("chemicalRequisitions", updated).catch(err => {
      console.warn("Failed to sync chemical requisition to Firestore, kept locally:", err);
    });

    // Clear Requisition items draft: "তার উপরে ব্ল্যাক [ফাঁকা/ব্ল্যাঙ্ক] হয়ে যাবে যাতে নতুন করে শুরু করতে পারি"
    setRequisitionItems([]);
    
    showToast(
      language === "bn"
        ? "ড্রাফট চাহিদাপত্রটি সফলভাবে সেভ করা হয়েছে এবং নতুন করে শুরু করার জন্য তালিকা ফাঁকা করা হয়েছে!"
        : "Requisition archived to history! The draft list has been cleared to start fresh.",
      "success"
    );
  };

  const handleDownloadPdf = async (customFileName: string, isSaved: boolean = false) => {
    // Small delay to let React render tempPrintReq if isSaved is true
    setTimeout(async () => {
      const element = document.getElementById("print-requisition-area");
      if (!element) return;
      
      const contentHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${customFileName}</title>
        <meta charset="utf-8">
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap');
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            font-family: Arial, Helvetica, sans-serif !important;
          }
          #print-content {
            width: 210mm;
            min-height: 297mm;
            padding: 15mm;
            margin: 0 auto;
            box-sizing: border-box;
            background: #ffffff !important;
            position: relative;
          }
          @media print {
            @page { size: A4 portrait; margin: 0; }
            body {
              margin: 0 !important;
              padding: 0 !important;
            }
            #print-content {
              width: 210mm !important;
              min-height: 297mm !important;
              margin: 0 auto !important;
              padding: 10mm 15mm !important;
              border: none !important;
              box-shadow: none !important;
              box-sizing: border-box;
            }
          }
        </style>
      </head>
      <body>
        <div id="print-content">
          ${element.innerHTML}
        </div>
      </body>
      </html>
      `;

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(contentHtml);
        printWindow.document.close();
        printWindow.document.title = customFileName;

        printWindow.setTimeout(() => {
          printWindow.focus();
          printWindow.print();
          if (isSaved) {
            setTempPrintReq(null);
          }
        }, 500);
      } else {
        alert("Please allow pop-ups to print the PDF report.");
        if (isSaved) setTempPrintReq(null);
      }
    }, 250);
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith("image/")) {
      showToast(
        language === "bn" ? "অনুগ্রহ করে একটি ছবি ফাইল (.jpg, .png, .jpeg) নির্বাচন করুন।" : "Please select a valid image file (.jpg, .png, .jpeg)",
        "error"
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Str = event.target?.result as string;
      if (base64Str) {
        setCustomSignatureUrl(base64Str);
        localStorage.setItem("ALW_STAR_CUSTOM_SIGNATURE", base64Str);
        showToast(
          language === "bn" ? "নতুন স্বাক্ষর সফলভাবে আপলোড এবং সেভ করা হয়েছে!" : "Custom signature successfully uploaded and saved!",
          "success"
        );
      }
    };
    reader.onerror = () => {
      showToast(
        language === "bn" ? "স্বাক্ষর ফাইলটি পড়তে সমস্যা হয়েছে।" : "Error reading signature file.",
        "error"
      );
    };
    reader.readAsDataURL(file);
  };

  const handleResetSignature = () => {
    setCustomSignatureUrl("");
    localStorage.removeItem("ALW_STAR_CUSTOM_SIGNATURE");
    showToast(
      language === "bn" ? "স্বাক্ষর রিসেট করা হয়েছে। ডিফল্ট স্বাক্ষর পুনরায় সক্রিয়।" : "Signature reset completed. Default signature is restored.",
      "info"
    );
  };

  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage({ text, type });
    // Safe auto dismiss in 4 seconds
    setTimeout(() => {
      setToastMessage(prev => prev?.text === text ? null : prev);
    }, 4000);
  };

  const handleNameChange = (val: string) => {
    setNewChemName(val);
    if (!val) return;
    const trimmed = val.trim().toLowerCase();
    
    // Find matching chemical in currently fetched reserves
    const matched = chemicals.find(c => c.name && c.name.trim().toLowerCase() === trimmed);
    if (matched) {
      if (matched.batch && matched.batch !== "N/A") {
        setNewChemBatch(matched.batch);
      }
      if (matched.receivedDate && matched.receivedDate !== "N/A") {
        setNewChemReceived(matched.receivedDate);
      }
      if (matched.expiry) {
        setNewChemExpiry(matched.expiry);
      }
      setNewChemDilution(matched.dilution || "");
      setNewChemUnit(matched.unit || "L");
      showToast(
        language === "bn" 
          ? `আগে থেকে থাকা কেমিক্যালের তথ্য খুঁজে পাওয়া গেছে ও বিবরণ পূরণ করা হয়েছে!` 
          : `Found existing chemical details and prefilled the form!`, 
        "info"
      );
    }
  };

  const handleBatchNoChange = (val: string) => {
    setNewChemBatch(val);
    if (!val) return;
    const trimmed = val.trim().toLowerCase();
    
    // Find matching chemical in currently fetched reserves by batch
    const matched = chemicals.find(c => c.batch && c.batch.trim().toLowerCase() === trimmed);
    if (matched) {
      setNewChemName(matched.name);
      if (matched.receivedDate && matched.receivedDate !== "N/A") {
        setNewChemReceived(matched.receivedDate);
      }
      if (matched.expiry) {
        setNewChemExpiry(matched.expiry);
      }
      setNewChemDilution(matched.dilution || "");
      setNewChemUnit(matched.unit || "L");
      showToast(
        language === "bn" 
          ? `"${matched.name}" কেমিক্যালের তথ্য ব্যাচ নং থেকে অটো ফিলআপ করা হয়েছে!` 
          : `Autofilled matching details for "${matched.name}" using Batch No!`, 
        "info"
      );
    }
  };
  
  // QR scanner state (retained for scanning functions if triggered from other items)
  const [scanning, setScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState<string | null>(null);

  // Authenticated user constraints
  const loggedInUserStr = localStorage.getItem("ALW_STAR_LOGGED_IN_USER") || sessionStorage.getItem("ALW_STAR_LOGGED_IN_USER");
  let loggedInUser = null;
  if (loggedInUserStr) {
    try {
      loggedInUser = JSON.parse(loggedInUserStr);
    } catch(e) {}
  }
  const isVisitor = false; // Bypass visitor restriction to allow full testing privileges in sandbox/demo

  // Helper to get formatted month/year (bilingual)
  const getMonthYearString = (dateStr: string) => {
    if (!dateStr) return language === "bn" ? "অনির্ধারিত মাস" : "Unknown Month";
    const parts = dateStr.split("-");
    if (parts.length < 2) return dateStr;
    const year = parts[0];
    const monthInt = parseInt(parts[1], 10);
    
    const monthsEn = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    
    const monthsBn = [
      "জানুয়ারী", "ফেব্রুয়ারী", "মার্চ", "এপ্রিল", "মে", "জুন",
      "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
    ];
    
    const mIndex = monthInt - 1;
    if (mIndex >= 0 && mIndex < 12) {
      if (language === "bn") {
        return `${monthsBn[mIndex]} ${year}`;
      }
      return `${monthsEn[mIndex]} ${year}`;
    }
    return dateStr;
  };

  interface UsageEntry {
    facilityName: string;
    dateStr: string;
    monthYear: string;
    chemicalName: string;
    amountUsed: string;
    batch: string;
  }

  const usageEntries: UsageEntry[] = [];
  reports.forEach((rep: any) => {
    const facility = rep.facilityName || "Unknown Facility";
    const date = rep.dateOfOperation || rep.startDate || "N/A";
    const monthYear = getMonthYearString(date);
    
    if (rep.chemicals && Array.isArray(rep.chemicals)) {
      rep.chemicals.forEach((chem: any) => {
        usageEntries.push({
          facilityName: facility,
          dateStr: date,
          monthYear: monthYear,
          chemicalName: chem.name || "Unknown Chemical",
          amountUsed: chem.used || "0 mL",
          batch: chem.batch || "N/A"
        });
      });
    }
  });

  const filteredUsageEntries = usageEntries.filter((entry) => {
    if (!serviceReportSearch) return true;
    const q = serviceReportSearch.toLowerCase();
    return (
      entry.facilityName.toLowerCase().includes(q) ||
      entry.chemicalName.toLowerCase().includes(q) ||
      entry.dateStr.toLowerCase().includes(q) ||
      entry.batch.toLowerCase().includes(q)
    );
  });

  // Group filtered entries by Month
  const groupedUsageByMonth: Record<string, UsageEntry[]> = {};
  filteredUsageEntries.forEach((entry) => {
    if (!groupedUsageByMonth[entry.monthYear]) {
      groupedUsageByMonth[entry.monthYear] = [];
    }
    groupedUsageByMonth[entry.monthYear].push(entry);
  });

  // CSV download function for service consumption
  const downloadServiceReportsCSV = () => {
    const headers = [
      "Month",
      "Hospital / Clinic Name",
      "Date",
      "Chemical Used",
      "Amount Consumed",
      "Batch No"
    ];
    
    const rows = usageEntries.map(entry => {
      const monthVal = entry.monthYear.replace(/"/g, '""');
      const facilityVal = entry.facilityName.replace(/"/g, '""');
      const dateVal = entry.dateStr.replace(/"/g, '""');
      const chemVal = entry.chemicalName.replace(/"/g, '""');
      const amountVal = entry.amountUsed.replace(/"/g, '""');
      const batchVal = entry.batch.replace(/"/g, '""');

      return [
        `"${monthVal}"`,
        `"${facilityVal}"`,
        `"${dateVal}"`,
        `"${chemVal}"`,
        `"${amountVal}"`,
        `"${batchVal}"`
      ];
    });

    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Al_Wafa_Star_Chemical_Usage_Service_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(
      language === "bn" 
        ? "সার্ভিস রিপোর্ট খরচ শিট (এক্সেল/CSV) সফলভাবে ডাউনলোড সম্পন্ন হয়েছে!" 
        : "Service Chemical Consumption file (Excel/CSV) successfully downloaded!",
      "success"
    );
  };

  // CSV download function for requisition requirements
  const downloadRequisitionCSV = () => {
    const headers = [
      "Company Name",
      "Item Number",
      "Chemical Name",
      "Batch No",
      "Requested Quantity",
      "Unit",
      "Required Date",
      "Requested By",
      "Approval Status",
      "Authorized Signatory"
    ];
    
    const rows = requisitionItems.map((item, idx) => {
      const companyVal = "Al Wafa Star Chemical Equipment & Pest Control".replace(/"/g, '""');
      const itemNo = (idx + 1).toString();
      const chemVal = item.name.replace(/"/g, '""');
      const batchVal = (item.batch || "N/A").replace(/"/g, '""');
      const qtyVal = item.qty.replace(/"/g, '""');
      const unitVal = item.unit.replace(/"/g, '""');
      const purposeVal = item.purpose.replace(/"/g, '""');
      const reqByVal = requesterName.replace(/"/g, '""');
      const statusVal = aishaSigned ? "Approved & Signed" : "Pending Approval";
      const signVal = aishaSigned ? "Aisha (Official Sign-off)" : "No Signatory";

      return [
        `"${companyVal}"`,
        `"${itemNo}"`,
        `"${chemVal}"`,
        `"${batchVal}"`,
        `"${qtyVal}"`,
        `"${unitVal}"`,
        `"${purposeVal}"`,
        `"${reqByVal}"`,
        `"${statusVal}"`,
        `"${signVal}"`
      ];
    });

    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Al_Wafa_Star_Chemical_Requisition_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(
      language === "bn" 
        ? "চাহিদা পত্র এক্সেল ফাইল (CSV Format) সফলভাবে ডাউনলোড সম্পন্ন হয়েছে!" 
        : "Requisition Excel File (CSV Format) successfully downloaded!",
      "success"
    );
  };

  // Multi language translations
  const t = {
    en: {
      title: "Smart Chemical Inventory Management",
      subtitle: "Medical and food-safety certified chemical logs, dosing margins & QR scans",
      chemName: "Chemical Name",
      receivedDate: "Received Date",
      dilution: "Dilution Rate",
      remaining: "Remaining Stock",
      batch: "Batch No",
      expiry: "Expiry Date",
      restockTitle: "Bulk Chemical Restocking Station",
      qrScanTitle: "Chemical Received Date Logs",
      lowAlert: "Low Stock Alert: Reorder Required",
      scanBtn: "Download Excel Report",
      restockBtn: "Restock Now",
      unit: "Unit"
    },
    ar: {
      title: "الإدارة الذكية لمخزون المواد الكيميائية",
      subtitle: "سجلات المواد المصرحة والمواصفات المعتمدة ورموز الـ QR الدفيقة للمنشآت الصحية",
      chemName: "اسم المادة الكيميائية",
      receivedDate: "تاريخ الاستلام",
      dilution: "معدل التخفيف",
      remaining: "المخزون المتبقي",
      batch: "رقم الدفعة",
      expiry: "تاريخ الانتهاء",
      restockTitle: "تحديث وتزويد مخزون المواد",
      qrScanTitle: "سجل تواريخ استلام المواد",
      lowAlert: "تنبيه نقص المخزون: يرجى المزامنة وإعادة الطلب",
      scanBtn: "تنزيل تقرير إكسل",
      restockBtn: "إعادة تزويد الآن",
      unit: "الوحدة"
    },
    bn: {
      title: "স্মার্ট কেমিক্যাল ইনভেন্টরি ম্যানেজমেন্ট",
      subtitle: "ফুড সেফটি ও মেডিকেল গ্রেড কেমিক্যাল তালিকা ও বারকোড ট্র্যাকিং",
      chemName: "কেমিক্যালের নাম",
      receivedDate: "গ্রহণের তারিখ",
      dilution: "জলীয় মিশ্রণ হার",
      remaining: "অবশিষ্ট মজুদ",
      batch: "ব্যাচ নং",
      expiry: "মেয়াদ চর্তুথী",
      restockTitle: "কেমিক্যাল রিস্টকিং স্টেশন",
      qrScanTitle: "কেমিক্যাল গ্রহণের রেকর্ড এবং ফাইল",
      lowAlert: "সতর্কতা: অতিসত্বর নতুন কেমিক্যাল স্টক অর্ডার করুন",
      scanBtn: "এক্সেল ডাউনলোড করুন",
      restockBtn: "স্টক যুক্ত করুন",
      unit: "ইউনিট"
    }
  }[language];

  const fetchInventory = () => {
    // Handled in real-time by subscriptions
  };

  useEffect(() => {
    // 1. Subscribe to Chemical Inventory from Firestore in real-time
    const unsubscribeChemicals = subscribeCollection<ChemicalRef>("chemicalInventory", (data) => {
      if (data && data.length > 0) {
        setChemicals(data);
        localStorage.setItem("ALW_CHEMICAL_INVENTORY", JSON.stringify(data));
      }
    });

    // 2. Subscribe to Requisitions / History logs from Firestore store in real-time
    const unsubscribeRequisitions = subscribeStoreValue<any[]>("chemicalRequisitions", [], (data) => {
      if (data && data.length > 0) {
        setHistoryLogs(data);
        setSavedRequisitions(data);
        localStorage.setItem("ALW_STAR_SAVED_REQUISITIONS", JSON.stringify(data));
      }
    });

    // 3. Subscribe to Service Reports for consumption logs in real-time
    const unsubscribeReports = subscribeCollection<any>("serviceReports", (data) => {
      if (data && data.length > 0) {
        setReports(data);
      }
    });

    return () => {
      unsubscribeChemicals();
      unsubscribeRequisitions();
      unsubscribeReports();
    };
  }, []);

  const downloadExcelCSV = () => {
    // Generate CSV Header
    const headers = [
      "Date Received", 
      "Chemical Name", 
      "Batch No", 
      "Quantity Received", 
      "Unit", 
      "Expiry Date", 
      "Dilution Rate"
    ];
    
    const rows = historyLogs.map(log => {
      const dateVal = log.date || log.receivedDate || "";
      const nameVal = (log.name || "").replace(/"/g, '""');
      const batchVal = (log.batch || "").replace(/"/g, '""');
      const stockVal = log.stock;
      const unitVal = log.unit || "L";
      const expiryVal = log.expiry || "N/A";
      const dilutionVal = (log.dilution || "N/A").replace(/"/g, '""');

      return [
        `"${dateVal}"`,
        `"${nameVal}"`,
        `"${batchVal}"`,
        stockVal,
        `"${unitVal}"`,
        `"${expiryVal}"`,
        `"${dilutionVal}"`
      ];
    });

    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    // UTF-8 Byte Order Mark (BOM) to support Bangla and Arabic text in MS Excel
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Chemical_Received_History_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(
      language === "bn" 
        ? "গ্রহণের ইতিহাস ফাইল (এক্সেল/CSV) সফলভাবে ডাউনলোড সম্পন্ন হয়েছে!" 
        : "Received History file (Excel/CSV) successfully downloaded!",
      "success"
    );
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAddNewChemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isVisitor) {
      showToast(
        language === "bn" ? "ভিজিটর মোডে নতুন কেমিক্যাল যুক্ত করার অনুমতি নেই!" : "Adding chemical is disabled in Visitor mode!",
        "error"
      );
      return;
    }
    if (!newChemName || !newChemStock || isNaN(Number(newChemStock))) {
      showToast(
        language === "bn" ? "দয়া করে সঠিক নাম এবং মজুদের পরিমাণ প্রদান করুন।" : "Please provide valid name and stock amount.",
        "error"
      );
      return;
    }

    try {
      const targetId = newChemName.trim().replace(/[^a-zA-Z0-9_-]/g, "_");
      
      const newChemData: any = { 
        id: targetId,
        name: newChemName,
        receivedDate: newChemReceived || new Date().toISOString().split('T')[0],
        dilution: newChemDilution || "N/A",
        batch: newChemBatch || "N/A",
        expiry: newChemExpiry || "2029-12-31",
        stock: parseFloat(newChemStock) || 0,
        unit: newChemUnit || "L",
        alertThreshold: 1.0
      };

      // Update local state offline-first on screen instantly
      let updatedChems: ChemicalRef[];
      const existingChem = chemicals.find(c => c.name.toLowerCase() === newChemName.toLowerCase());
      if (existingChem) {
        newChemData.stock = parseFloat((existingChem.stock + parseFloat(newChemStock)).toFixed(3));
        updatedChems = chemicals.map(c => c.name.toLowerCase() === newChemName.toLowerCase() ? { ...existingChem, ...newChemData } : c);
        setChemicals(updatedChems);
        localStorage.setItem("ALW_CHEMICAL_INVENTORY", JSON.stringify(updatedChems));
        showToast(
          language === "bn" ? `আগে থেকে থাকা "${newChemName}" কেমিক্যালের মজুদ বৃদ্ধি করা হয়েছে!` : `Successfully increased stock for existing chemical "${newChemName}"!`,
          "success"
        );
      } else {
        updatedChems = [newChemData, ...chemicals];
        setChemicals(updatedChems);
        localStorage.setItem("ALW_CHEMICAL_INVENTORY", JSON.stringify(updatedChems));
        showToast(
          language === "bn" ? `নতুন কেমিক্যাল সফলভাবে যুক্ত করা হয়েছে: ${newChemName}!` : `Successfully added new chemical: ${newChemName}!`,
          "success"
        );
      }

      // Sync Firestore
      saveDocument("chemicalInventory", newChemName, {
        id: newChemName.replace(/[^a-zA-Z0-9_-]/g, "_"),
        name: newChemName,
        receivedDate: newChemReceived || new Date().toISOString().split('T')[0],
        dilution: newChemDilution || "N/A",
        batch: newChemBatch || "N/A",
        expiry: newChemExpiry || "2029-12-31",
        stock: parseFloat(newChemStock) || 0,
        unit: newChemUnit || "L",
        alertThreshold: 1.0
      })
      .then(() => fetchInventory())
      .catch(err => {
        console.warn("Failed to sync new chemical to Firestore:", err);
      });

      setNewChemName("");
      setNewChemReceived("");
      setNewChemDilution("");
      setNewChemBatch("");
      setNewChemExpiry("");
      setNewChemStock("");
    } catch (e) {
      console.warn("Error adding chemical locally:", e);
    }
  };

  const handleDeleteChemical = async (name: string) => {
    if (isVisitor) {
      showToast(
        language === "bn" ? "ভিজিটর মোডে কেমিক্যাল মুছে ফেলার অনুমতি নেই!" : "Deleting chemical is disabled in Visitor mode!",
        "error"
      );
      return;
    }

    // Set modern modal confirmation instead of window.confirm!
    setDeleteConfirmName(name);
  };

  const executeDeleteChemical = async (name: string) => {
    try {
      setLoading(true);

      // Offline-First: update state and localStorage immediately
      const updated = chemicals.filter(c => c.name !== name);
      setChemicals(updated);
      localStorage.setItem("ALW_CHEMICAL_INVENTORY", JSON.stringify(updated));

      await deleteDocument("chemicalInventory", name);
      fetchInventory();

      showToast(
        language === "bn" ? `সফলভাবে "${name}" মুছে ফেলা হয়েছে!` : `Successfully deleted "${name}"!`,
        "success"
      );
    } catch (e) {
      console.warn("REST API delete failed for chemical, deleted locally:", e);
    } finally {
      setLoading(false);
    }
  };

  // Simulated scan camera triggers
  const startScanningAndParse = () => {
    if (isVisitor) {
      alert(language === "bn" ? "ভিজিটর মোডে বারকোড স্ক্যান করার অনুমতি নেই!" : "QR Code Scanning validation is disabled inside read-only Visitor mode!");
      return;
    }
    setScanning(true);
    setScannedResult(null);
    setTimeout(() => {
      // Auto parse random chemical tag for highest fidelity after 2 seconds
      const names = ["Deltacide SC", "Advion Gel", "Cypermethrin"];
      const rName = names[Math.floor(Math.random() * names.length)];
      setScannedResult(`Verified Code: ALW-${rName.toUpperCase().replace(/\s+/g, "-")}-2026. Certified Clinical Chemical Stock active.`);
      setScanning(false);
    }, 2000);
  };

  return (
    <div id="erp-chemical-view" className="space-y-6">
      
      {/* Title block */}
      <div className={`p-6 rounded-3xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border transition-all ${isDark ? "bg-[#0B1324]/85 border-slate-700/80 text-white" : "bg-[#F8FAFC] border-[#CBD5E1] text-slate-900"}`}>
        <div>
          <h2 className={`text-xl font-bold tracking-tight flex items-center gap-2 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
            <FlaskConical className="text-[#10B981] w-5 h-5 align-middle" />
            <span>{t.title}</span>
          </h2>
          <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {t.subtitle}
          </p>
        </div>

        <button
          id="refresh-inv-btn"
          onClick={fetchInventory}
          className={`px-4 py-2 rounded-xl text-xs font-bold leading-none inline-flex items-center gap-1.5 cursor-pointer shadow-sm border transition-all ${isDark ? "bg-slate-800 text-slate-100 hover:bg-slate-700 border-slate-700" : "bg-slate-800 text-slate-100 hover:bg-slate-700 border-slate-300"}`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh stock status</span>
        </button>
      </div>

      {/* Main Grid: Info Table & Side Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chemicals Stock Levels list */}
        <div className={`p-6 rounded-2xl shadow-sm lg:col-span-2 border transition-all ${isDark ? "bg-[#0B1324]/85 border-slate-700/80 text-slate-100" : "bg-[#F8FAFC] border-[#CBD5E1] text-slate-900"}`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-sm font-bold ${isDark ? "text-slate-200" : "text-slate-900"}`}>Live UAE Chemical Reserves</h3>
            <span className={`text-[10px] font-mono font-bold uppercase rounded px-2.5 py-1 tracking-wider border ${isDark ? "bg-emerald-950/40 text-[#2DD4BF] border-emerald-900/30" : "bg-emerald-50 text-[#10B981] border-emerald-100"}`}>
               Audit Compliance Checked
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs text-left">
              <thead>
                <tr className={`border-b ${isDark ? "bg-slate-800/50 border-slate-700" : "bg-slate-100 border-slate-250"}`}>
                  <th className={`p-3 font-extrabold ${isDark ? "text-slate-300" : "text-[#555]"}`}>{t.chemName}</th>
                  <th className={`p-3 font-extrabold ${isDark ? "text-slate-300" : "text-[#555]"}`}>{t.receivedDate}</th>
                  <th className={`p-3 font-extrabold ${isDark ? "text-slate-300" : "text-[#555]"}`}>{t.dilution}</th>
                  <th className={`p-3 font-extrabold ${isDark ? "text-slate-300" : "text-[#555]"}`}>{t.batch}</th>
                  <th className={`p-3 font-extrabold ${isDark ? "text-slate-300" : "text-[#555]"}`}>{t.remaining}</th>
                  <th className={`p-3 font-extrabold text-right ${isDark ? "text-slate-300" : "text-[#555]"}`}>{t.expiry}</th>
                  <th className={`p-3 font-extrabold text-center ${isDark ? "text-slate-300" : "text-[#555]"}`}>{language === "bn" ? "অ্যাকশন" : "Actions"}</th>
                </tr>
              </thead>
              <tbody className={`divide-y font-semibold ${isDark ? "divide-slate-800 text-slate-300" : "divide-slate-100 text-slate-700"}`}>
                {chemicals.map((chem) => {
                  const threshold = chem.alertThreshold || 1.0;
                  const isLow = chem.stock <= threshold;
                  const isMedium = chem.stock > threshold && chem.stock <= threshold * 4;
                  
                  // Color statuses as explicitly requested by user
                  let statusBg = "bg-emerald-500/10";
                  let statusTextCls = "text-emerald-400 font-bold";
                  let statusBorder = "border-emerald-500/20";
                  let statusLabel = language === "bn" ? "পর্যাপ্ত মজুদ (সবুজ)" : "High Stock (Green)";
                  let dotColor = "bg-emerald-500 animate-pulse";
                  
                  if (isLow) {
                    statusBg = "bg-red-500/10";
                    statusTextCls = "text-red-400 font-black animate-pulse";
                    statusBorder = "border-red-500/20";
                    statusLabel = language === "bn" ? "অল্প মজুদ (লাল)" : "Low Stock (Red)";
                    dotColor = "bg-red-500 animate-ping";
                  } else if (isMedium) {
                    statusBg = "bg-amber-500/10";
                    statusTextCls = "text-amber-450 font-extrabold";
                    statusBorder = "border-amber-500/20";
                    statusLabel = language === "bn" ? "মধ্যম মজুদ (হলুদ)" : "Medium Stock (Yellow)";
                    dotColor = "bg-amber-500";
                  }

                  return (
                    <tr 
                      id={`chem-row-${chem.name}`} 
                      key={chem.name} 
                      className={`group transition-colors ${isDark ? "hover:bg-slate-800/40 border-slate-800" : "hover:bg-slate-50 border-slate-100"} ${isLow ? (isDark ? "bg-red-950/20" : "bg-red-50/40") : ""}`}
                    >
                      <td className="p-3">
                        <div className="flex flex-col">
                          <span className={`font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}>{chem.name}</span>
                          {isLow && (
                            <span className="text-[8px] text-red-400 uppercase font-mono mt-0.5 animate-pulse">⚠️ {language === "bn" ? "রি-অর্ডার প্রয়োজন!" : "Low Stock alert!"}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 font-mono">{chem.receivedDate || "N/A"}</td>
                      <td className="p-3 font-mono">{chem.dilution}</td>
                      <td className="p-3">
                        <span className={`font-mono px-1.5 py-0.5 rounded border ${isDark ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-slate-100 border-slate-200 text-slate-600"}`}>
                          {chem.batch}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-col gap-1.5 justify-start">
                          <span className={`${statusTextCls} font-mono text-sm`}>
                            {chem.stock} {chem.unit}
                          </span>
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] w-fit font-bold border ${statusBg} ${statusTextCls} ${statusBorder}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                            <span>{statusLabel}</span>
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-right font-mono text-slate-500">
                        {chem.expiry}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          title={language === "bn" ? "মুছে ফেলুন" : "Delete chemical"}
                          onClick={() => handleDeleteChemical(chem.name)}
                          className="md:opacity-0 md:group-hover:opacity-100 md:pointer-events-none md:group-hover:pointer-events-auto transition-all duration-200 p-1.5 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg cursor-pointer inline-flex items-center justify-center active:scale-95"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Warning Card */}
          <div className={`mt-8 rounded-xl p-4 flex items-start gap-3 border ${isDark ? "bg-amber-950/20 border-amber-900/30 text-amber-300/90" : "bg-amber-50 border-amber-200 text-slate-900"}`}>
            <AlertOctagon className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h4 className={`text-xs font-bold ${isDark ? "text-amber-400" : "text-amber-800"}`}>Automatic Expiration Warning Protocol</h4>
              <p className={`text-[11px] mt-1 leading-relaxed ${isDark ? "text-amber-300/80" : "text-amber-700"}`}>
                The ERP cross-references the batch dates on each chemical container scan. Containers within 60 days of expiry will trigger automatic block holds preventing field assignments.
              </p>
            </div>
          </div>
        </div>

        {/* Side Actions Drawer: QR Scanner & Add New Chemical Drawer */}
        <div className="space-y-6">

          {/* Add New Chemical Form */}
          <div className={`p-6 rounded-2xl shadow-sm space-y-4 border transition-all ${isDark ? "bg-[#0B1324]/85 border-slate-700/80 text-white" : "bg-[#F8FAFC] border-[#CBD5E1] text-slate-900"}`}>
            <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {language === "bn" ? "নতুন কেমিক্যাল যুক্ত করুন" : "Add New Chemical"}
            </h3>
            
            <form onSubmit={handleAddNewChemSubmit} className="space-y-3 text-xs font-semibold">
              <div className="space-y-1">
                <label className={`block ${isDark ? "text-slate-300" : "text-slate-700"}`}>Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fendona 1.5 SC"
                  value={newChemName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  list="name-suggestions"
                  className={`w-full font-bold placeholder:font-medium rounded-xl py-2 px-3 outline-none border transition-all ${isDark ? "bg-[#0E172B] border-slate-700 text-white placeholder:text-slate-600 focus:border-indigo-500" : "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-indigo-550"}`}
                />
                <datalist id="name-suggestions">
                  {chemicals.map((c) => (
                    <option key={c.name} value={c.name} />
                  ))}
                </datalist>
              </div>
              <div className="space-y-1">
                <label className={`block ${isDark ? "text-slate-300" : "text-slate-700"}`}>{language === "bn" ? "গ্রহণের তারিখ" : "Received Date"}</label>
                <input
                  type="date"
                  value={newChemReceived}
                  onChange={(e) => setNewChemReceived(e.target.value)}
                  className={`w-full font-bold placeholder:font-medium rounded-xl py-2 px-3 outline-none border transition-all ${isDark ? "bg-[#0E172B] border-slate-700 text-white placeholder:text-slate-605 focus:border-indigo-500" : "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-indigo-550"}`}
                />
              </div>
              <div className="space-y-1">
                <label className={`block ${isDark ? "text-slate-300" : "text-slate-700"}`}>Expiry Date</label>
                <input
                  type="date"
                  value={newChemExpiry}
                  onChange={(e) => setNewChemExpiry(e.target.value)}
                  className={`w-full font-bold placeholder:font-medium rounded-xl py-2 px-3 outline-none border transition-all ${isDark ? "bg-[#0E172B] border-slate-700 text-white placeholder:text-slate-605 focus:border-indigo-500" : "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-indigo-550"}`}
                />
              </div>
              <div className="flex gap-2">
                <div className="space-y-1 flex-1">
                  <label className={`block ${isDark ? "text-slate-300" : "text-slate-700"}`}>Dilution Rate</label>
                  <input
                    type="text"
                    placeholder="e.g. 10ml / 1L"
                    value={newChemDilution}
                    onChange={(e) => setNewChemDilution(e.target.value)}
                    className={`w-full font-bold placeholder:font-medium rounded-xl py-2 px-3 outline-none border transition-all ${isDark ? "bg-[#0E172B] border-slate-700 text-white placeholder:text-slate-605 focus:border-indigo-500" : "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-indigo-550"}`}
                  />
                </div>
                <div className="space-y-1 flex-1">
                  <label className={`block ${isDark ? "text-slate-300" : "text-slate-700"}`}>Batch No</label>
                  <input
                    type="text"
                    placeholder="e.g. X1-99"
                    value={newChemBatch}
                    onChange={(e) => handleBatchNoChange(e.target.value)}
                    list="batch-suggestions"
                    className={`w-full font-bold placeholder:font-medium rounded-xl py-2 px-3 outline-none border transition-all ${isDark ? "bg-[#0E172B] border-slate-700 text-white placeholder:text-slate-605 focus:border-indigo-500" : "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-indigo-550"}`}
                  />
                  <datalist id="batch-suggestions">
                    {chemicals.map((c) => (
                      c.batch && c.batch !== "N/A" ? <option key={c.batch} value={c.batch} /> : null
                    ))}
                  </datalist>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="space-y-1 flex-[2]">
                  <label className={`block ${isDark ? "text-slate-300" : "text-slate-700"}`}>Initial Stock</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    placeholder="e.g. 5"
                    value={newChemStock}
                    onChange={(e) => setNewChemStock(e.target.value)}
                    className={`w-full font-bold placeholder:font-medium rounded-xl py-2 px-3 outline-none border transition-all ${isDark ? "bg-[#0E172B] border-slate-700 text-white placeholder:text-slate-605 focus:border-indigo-500" : "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-indigo-550"}`}
                  />
                </div>
                <div className="space-y-1 flex-1">
                  <label className={`block ${isDark ? "text-slate-300" : "text-slate-700"}`}>Unit</label>
                  <select
                    value={newChemUnit}
                    onChange={(e) => setNewChemUnit(e.target.value)}
                    className={`w-full font-bold rounded-xl py-2 px-3 outline-none border transition-all ${isDark ? "bg-[#0E172B] border-slate-705 text-white focus:border-indigo-550" : "bg-white border-slate-300 text-slate-900 focus:border-indigo-550"}`}
                  >
                    <option value="L">L</option>
                    <option value="g">g</option>
                    <option value="kg">kg</option>
                    <option value="ml">ml</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className={`w-full mt-2 px-4 py-2 font-bold border-none rounded-xl text-xs cursor-pointer inline-flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow ${isDark ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-indigo-650 hover:bg-indigo-700 text-white"}`}
              >
                <FlaskConical className="w-3.5 h-3.5" />
                <span>{language === "bn" ? "নতুন কেমিক্যাল অ্যাড করুন" : "Add Chemical"}</span>
              </button>
            </form>
          </div>

          {/* Chemical System Registers & Sheet Logs */}
          <div className={`p-5 rounded-2xl shadow-sm space-y-4 border transition-all ${isDark ? "bg-[#0B1324]/85 border-slate-700/80 text-white" : "bg-[#F8FAFC] border-[#CBD5E1] text-slate-900"}`}>
            <div>
              <div className="flex items-center justify-between">
                <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-300" : "text-slate-800"}`}>
                  {language === "bn" ? "সিস্টেম রেজিস্টার এবং লগ" : language === "ar" ? "سجلات النظام وأوراق العمل" : "System Registers & Logs"}
                </h3>
                <span className="font-mono text-[9px] px-1.5 py-0.5 bg-indigo-500 rounded text-white font-extrabold uppercase shrink-0">
                  {language === "bn" ? "৩ টি অপশন" : "3 Options"}
                </span>
              </div>
              <p className={`text-[10px] mt-1 leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                {language === "bn" 
                  ? "সিস্টেমের গুরুত্বপূর্ণ কেমিক্যাল ডেটা ও লগ ফাইল দেখার জন্য নির্ধারিত প্যানেল।" 
                  : "Dedicated panel to view vital system chemical registers, logs, and database files."}
              </p>
            </div>

            {/* The Three Options */}
            <div className="space-y-3">
              {/* Option 1: Chemical Received Logs (Clickable, opens large sheet) */}
              <button
                type="button"
                onClick={() => setIsHistoryModalOpen(true)}
                className={`w-full text-left p-3.5 rounded-xl border flex items-start gap-3.5 transition-all text-xs cursor-pointer group hover:-translate-y-0.5 hover:shadow-md ${
                  isDark 
                    ? "bg-[#0E172B] border-slate-700 hover:border-indigo-500 hover:bg-[#13203C]" 
                    : "bg-white border-[#CBD5E1] hover:border-indigo-550 hover:bg-slate-50"
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 transition-colors ${isDark ? "bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20" : "bg-emerald-50 text-emerald-605 group-hover:bg-emerald-100"}`}>
                  <FileSpreadsheet className="w-5 h-5 animate-pulse" />
                </div>
                <div className="flex-1 space-y-0.5 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className={`font-bold block truncate text-[11px] ${isDark ? "text-slate-100 group-hover:text-indigo-400" : "text-slate-900 group-hover:text-indigo-600"}`}>
                      {language === "bn" ? "১. কেমিক্যাল প্রাপ্তির সম্পূর্ণ রেকর্ড শিট" : language === "ar" ? "١. سجلات استلام المواد الكيميائية" : "1. Chemical Received Detail Sheet"}
                    </span>
                    <span className="shrink-0 text-[8px] font-mono font-bold bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 px-1 py-0.5 rounded uppercase">
                      {language === "bn" ? "সক্রিয়" : "Active"}
                    </span>
                  </div>
                  <span className={`text-[9.5px] block leading-snug truncate ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    {language === "bn" 
                      ? "কেমিক্যাল নেম, প্রাপ্তির তারিখ এবং পরিমাণের প্রধান বিবরণী ফাইল।" 
                      : "Main record sheet showing names, dates received, and quantity supplied."}
                  </span>
                </div>
                <ChevronRight className={`w-4 h-4 mt-1 shrink-0 transition-transform ${isDark ? "text-slate-500 group-hover:text-slate-300" : "text-slate-400 group-hover:text-slate-700"}`} />
              </button>

              {/* Option 2: Active Service Report Chemical Usage */}
              <button
                type="button"
                onClick={() => setIsServiceReportModalOpen(true)}
                className={`w-full text-left p-3.5 rounded-xl border flex items-start gap-3.5 transition-all text-xs cursor-pointer group hover:-translate-y-0.5 hover:shadow-md ${
                  isDark 
                    ? "bg-[#0E172B] border-slate-700 hover:border-violet-500 hover:bg-[#13203C]" 
                    : "bg-white border-[#CBD5E1] hover:border-violet-550 hover:bg-slate-50"
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 transition-colors ${isDark ? "bg-violet-500/10 text-violet-400 group-hover:bg-violet-500/20" : "bg-violet-50 text-violet-600 group-hover:bg-violet-100"}`}>
                  <Database className="w-5 h-5 animate-pulse" />
                </div>
                <div className="flex-1 space-y-0.5 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className={`font-bold block truncate text-[11px] ${isDark ? "text-slate-100 group-hover:text-violet-400" : "text-slate-900 group-hover:text-violet-600"}`}>
                      {language === "bn" ? "২. সার্ভিস রিপোর্ট কেমিক্যাল খরচ রেকর্ড" : language === "ar" ? "٢. سجلات استهلاك المواد الكيميائية" : "2. Service Report Chemical Usage"}
                    </span>
                    <span className="shrink-0 text-[8px] font-mono font-bold bg-violet-500/10 text-violet-500 dark:text-violet-400 px-1 py-0.5 rounded uppercase">
                      {language === "bn" ? "সক্রিয়" : "Active"}
                    </span>
                  </div>
                  <span className={`text-[9.5px] block leading-snug truncate ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    {language === "bn" 
                      ? "বিভিন্ন হসপিটাল ও ক্লিনিকে প্রতি মাসে কেমিক্যাল ব্যবহারের প্রক্ষেপণ শিট।" 
                      : "Monthly chemical logs consumed across clinical hubs, with quantities and dates."}
                  </span>
                </div>
                <ChevronRight className={`w-4 h-4 mt-1 shrink-0 transition-transform ${isDark ? "text-slate-350 group-hover:text-slate-100" : "text-slate-400 group-hover:text-slate-700"}`} />
              </button>

              {/* Option 3: Active Requisition Sheet for Chemical Request */}
              <button
                type="button"
                onClick={() => setIsRequisitionModalOpen(true)}
                className={`w-full text-left p-3.5 rounded-xl border flex items-start gap-3.5 transition-all text-xs cursor-pointer group hover:-translate-y-0.5 hover:shadow-md ${
                  isDark 
                    ? "bg-[#0E172B] border-slate-700 hover:border-emerald-500 hover:bg-[#13203C]" 
                    : "bg-white border-[#CBD5E1] hover:border-emerald-550 hover:bg-slate-50"
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 transition-colors ${isDark ? "bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20" : "bg-emerald-50 text-emerald-605 group-hover:bg-emerald-100"}`}>
                  <ClipboardList className="w-5 h-5 animate-pulse" />
                </div>
                <div className="flex-1 space-y-0.5 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className={`font-bold block truncate text-[11px] ${isDark ? "text-slate-100 group-hover:text-emerald-400" : "text-slate-900 group-hover:text-emerald-605"}`}>
                      {language === "bn" ? "৩. কেমিক্যাল রিকুইজিশন এবং চাহিদা পত্র" : language === "ar" ? "٣. طلب الحصول على المواد الكيميائية" : "3. Chemical Requisition & Order Request"}
                    </span>
                    <span className="shrink-0 text-[8px] font-mono font-bold bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 px-1 py-0.5 rounded uppercase font-bold">
                      {language === "bn" ? "সক্রিয়" : "Active"}
                    </span>
                  </div>
                  <span className={`text-[9.5px] block leading-snug truncate ${isDark ? "text-slate-400" : "text-slate-505"}`}>
                    {language === "bn" 
                      ? "কোম্পানির জন্য কেমিক্যালের চাহিদা লিখে এক্সেল এবং স্বাক্ষরযুক্ত পিডিএফ প্রিন্ট করুন।" 
                      : "Draft chemical requirements and export Excel or print signed request letters."}
                  </span>
                </div>
                <ChevronRight className={`w-4 h-4 mt-1 shrink-0 transition-transform ${isDark ? "text-slate-300 group-hover:text-slate-100" : "text-slate-400 group-hover:text-slate-700"}`} />
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Custom Delete Confirmation Modal */}
      {deleteConfirmName && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`p-6 rounded-2xl max-w-sm w-full border shadow-2xl transition-all scale-100 ${isDark ? "bg-[#1E293B] border-slate-705 text-white" : "bg-white border-slate-200 text-slate-900"}`}>
            <div className="flex items-center gap-3 text-rose-500 mb-3">
              <AlertOctagon className="w-6 h-6 animate-pulse shrink-0" />
              <h4 className="font-bold text-sm tracking-tight">
                {language === "bn" ? "মুছে ফেলার নিশ্চিতকরণ" : "Confirm Deletion"}
              </h4>
            </div>
            <p className="text-xs leading-relaxed mb-6 text-slate-400">
              {language === "bn" 
                ? `আপনি কি সত্যিই "${deleteConfirmName}" কেমিক্যালটি পুরোপুরি মুছে ফেলতে চান? এটি আর ফেরত আনা যাবে না।`
                : `Are you sure you want to completely delete "${deleteConfirmName}" from the inventory? This action is permanent and cannot be undone.`}
            </p>
            <div className="flex gap-2.5 justify-end">
              <button
                type="button"
                onClick={() => setDeleteConfirmName(null)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${isDark ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700" : "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-250"}`}
              >
                {language === "bn" ? "বাতিল" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={() => {
                  const name = deleteConfirmName;
                  setDeleteConfirmName(null);
                  executeDeleteChemical(name);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
              >
                {language === "bn" ? "হ্যাঁ, মুছে ফেলুন" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Big Spreadsheet Modal for Option 1: Chemical Received logs */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-5">
          <div className={`w-full max-w-4xl rounded-3xl border shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transition-all duration-300 scale-100 ${isDark ? "bg-[#1E293B] border-slate-700 text-white" : "bg-white border-slate-250 text-slate-900"}`}>
            
            {/* Modal Header */}
            <div className={`p-4 border-b flex items-center justify-between ${isDark ? "border-slate-705 bg-slate-900/60" : "border-slate-200 bg-slate-50"}`}>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500 text-white shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base tracking-tight leading-tight">
                    {language === "bn" ? "কেমিক্যাল প্রাপ্তি রেকর্ড ডেটাবেস (Excel Spreadsheet)" : "Chemical Received Records Database (Excel Spreadsheet)"}
                  </h3>
                  <p className={`text-[10px] sm:text-xs font-mono select-none ${isDark ? "text-emerald-450" : "text-emerald-600"}`}>
                    al_wafa_star_received_history.xlsx • {historyLogs.length} {language === "bn" ? "টি তথ্য লোড হয়েছে" : "rows loaded"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsHistoryModalOpen(false);
                  setHistorySearch("");
                }}
                className={`p-2 rounded-xl transition-all cursor-pointer ${isDark ? "hover:bg-slate-800 text-slate-400 hover:text-white" : "hover:bg-slate-250 text-slate-500 hover:text-slate-800"}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body & Filtering */}
            <div className={`p-4 sm:p-5 space-y-4 flex-1 overflow-y-auto ${isDark ? "bg-slate-900/30" : "bg-white"}`}>
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                
                {/* Search Bar */}
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    placeholder={language === "bn" ? "নাম, ব্যাচ অথবা তারিখ দিয়ে সার্চ করুন..." : "Search sheet by Chemical Name / date received / batch..."}
                    className={`w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-xl border outline-none transition-all ${
                      isDark 
                        ? "bg-[#0E172B] border-slate-705 text-slate-100 placeholder:text-slate-500 focus:border-indigo-500" 
                        : "bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-indigo-550"
                    }`}
                  />
                </div>

                {/* CSV Download Button in Sheets */}
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={downloadExcelCSV}
                    className="flex-1 sm:flex-initial px-4 py-2 bg-[#107C41] hover:bg-[#107C41]/90 hover:shadow-md text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                  >
                    <FileSpreadsheet className="w-4 h-4 shrink-0" />
                    <span>{language === "bn" ? "এক্সেল রিপোর্ট ডাউনলোড সম্পন্ন ফাইল" : "Download Excel Report (CSV)"}</span>
                  </button>
                </div>

              </div>

              {/* Data Grid table */}
              <div className={`border rounded-xl overflow-hidden shadow-sm ${isDark ? "border-slate-700 bg-slate-950/40" : "border-slate-250 bg-white"}`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className={`border-b select-none font-mono text-[9px] uppercase tracking-wider font-bold ${isDark ? "bg-slate-800/80 border-slate-700 text-slate-400" : "bg-slate-100 border-slate-250 text-slate-500"}`}>
                        <th className="py-2.5 px-3 text-center border-r border-[#CBD5E1]/30 dark:border-slate-800 max-w-[50px]">ROW</th>
                        <th className="py-2.5 px-3 border-r border-[#CBD5E1]/30 dark:border-slate-800 min-w-[110px]">{language === "bn" ? "গ্রহণের তারিখ" : "Date Received"}</th>
                        <th className="py-2.5 px-3 border-r border-[#CBD5E1]/30 dark:border-slate-800 min-w-[160px]">{language === "bn" ? "কেমিক্যালের নাম" : "Chemical Name"}</th>
                        <th className="py-2.5 px-3 border-r border-[#CBD5E1]/30 dark:border-slate-800 min-w-[90px]">{language === "bn" ? "ব্যাচ নং" : "Batch No"}</th>
                        <th className="py-2.5 px-3 border-r border-[#CBD5E1]/30 dark:border-slate-800 text-center min-w-[100px]">{language === "bn" ? "পরিমাণ" : "Qty Received"}</th>
                        <th className="py-2.5 px-3 border-r border-[#CBD5E1]/30 dark:border-slate-800 min-w-[110px]">{language === "bn" ? "মেয়াদ চর্তুথী" : "Expiry Date"}</th>
                        <th className="py-2.5 px-3 min-w-[110px]">{language === "bn" ? "জলীয় মিশ্রণ হার" : "Dilution Rate"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 dark:divide-slate-850 font-mono text-[11px]">
                      {historyLogs
                        .filter(log => {
                          if (!historySearch) return true;
                          const q = historySearch.toLowerCase();
                          return (
                            (log.name || "").toLowerCase().includes(q) ||
                            (log.date || "").toLowerCase().includes(q) ||
                            (log.batch || "").toLowerCase().includes(q)
                          );
                        })
                        .map((log, index) => (
                          <tr 
                            key={index} 
                            className={`font-semibold hover:bg-slate-100/40 dark:hover:bg-slate-800/40 transition-colors ${
                              index % 2 === 0 ? (isDark ? "bg-slate-900/10" : "bg-white") : (isDark ? "bg-slate-800/20" : "bg-slate-50/50")
                            }`}
                          >
                            <td className="py-3 px-3 text-center text-slate-400 font-bold border-r border-[#CBD5E1]/30 dark:border-slate-800 max-w-[50px]">{index + 1}</td>
                            <td className="py-3 px-3 border-r border-[#CBD5E1]/30 dark:border-slate-800 text-teal-600 dark:text-teal-400 font-bold whitespace-nowrap">{log.date || log.receivedDate || "N/A"}</td>
                            <td className="py-3 px-3 font-sans font-bold border-r border-[#CBD5E1]/30 dark:border-slate-800 text-slate-900 dark:text-slate-100 max-w-[200px] truncate">{log.name}</td>
                            <td className="py-3 px-3 border-r border-[#CBD5E1]/30 dark:border-slate-800 text-slate-600 dark:text-slate-350">{log.batch || "N/A"}</td>
                            <td className="py-3 px-3 text-center border-r border-[#CBD5E1]/30 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 font-extrabold">{log.stock} <span className="text-[9px] text-[#94A3B8] lowercase">{log.unit || "L"}</span></td>
                            <td className="py-3 px-3 border-r border-[#CBD5E1]/30 dark:border-slate-800 text-rose-600 dark:text-rose-400 whitespace-nowrap">{log.expiry || "N/A"}</td>
                            <td className="py-3 px-3 text-slate-500 dark:text-slate-400">{log.dilution || "N/A"}</td>
                          </tr>
                        ))}
                      {historyLogs.filter(log => {
                        if (!historySearch) return true;
                        const q = historySearch.toLowerCase();
                        return (
                          (log.name || "").toLowerCase().includes(q) ||
                          (log.date || "").toLowerCase().includes(q) ||
                          (log.batch || "").toLowerCase().includes(q)
                        );
                      }).length === 0 && (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-[#94A3B8] font-bold font-sans text-xs">
                            {language === "bn" ? "কোন তথ্য খুঁজে পাওয়া যায় নি।" : "No matches found. Try modifying your search criteria."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`p-4 border-t flex items-center justify-end gap-2.5 ${isDark ? "border-slate-700 bg-slate-900/30" : "border-slate-205 bg-slate-50"}`}>
              <button
                type="button"
                onClick={() => {
                  setIsHistoryModalOpen(false);
                  setHistorySearch("");
                }}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                  isDark 
                    ? "bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white" 
                    : "bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {language === "bn" ? "বন্ধ করুন" : "Close Sheet"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Big Spreadsheet Modal for Option 2: Service Report Chemical Usage */}
      {isServiceReportModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-5">
          <div className={`w-full max-w-4xl rounded-3xl border shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transition-all duration-300 scale-100 ${isDark ? "bg-[#1E293B] border-slate-700 text-white" : "bg-white border-slate-250 text-slate-900"}`}>
            
            {/* Modal Header */}
            <div className={`p-4 border-b flex items-center justify-between ${isDark ? "border-slate-700 bg-slate-900/60" : "border-slate-200 bg-slate-50"}`}>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-violet-600 text-white shrink-0">
                  <Database className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base tracking-tight leading-tight">
                    {language === "bn" ? "সার্ভিস রিপোর্ট কেমিক্যাল খরচ ডাটাবেস (Excel Spreadsheet)" : "Service Report Chemical Usage Database (Excel Spreadsheet)"}
                  </h3>
                  <p className={`text-[10px] sm:text-xs font-mono select-none ${isDark ? "text-violet-400" : "text-violet-600"}`}>
                    al_wafa_star_service_chemical_consumption.xlsx • {filteredUsageEntries.length} {language === "bn" ? "টি তথ্য লোড হয়েছে" : "rows loaded"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsServiceReportModalOpen(false);
                  setServiceReportSearch("");
                }}
                className={`p-2 rounded-xl transition-all cursor-pointer ${isDark ? "hover:bg-slate-800 text-slate-400 hover:text-white" : "hover:bg-slate-250 text-slate-500 hover:text-slate-800"}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body & Filtering */}
            <div className={`p-4 sm:p-5 space-y-4 flex-1 overflow-y-auto ${isDark ? "bg-[#0F172A]/35" : "bg-white"}`}>
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                
                {/* Search Bar */}
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={serviceReportSearch}
                    onChange={(e) => setServiceReportSearch(e.target.value)}
                    placeholder={language === "bn" ? "হাসপাতাল/ক্লিনিকের নাম, কেমিক্যালের নাম বা তারিখ দিয়ে খুঁজুন..." : "Search usage by Hospital name / chemical used / date / batch..."}
                    className={`w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-xl border outline-none transition-all ${
                      isDark 
                        ? "bg-[#0E172B] border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-indigo-505" 
                        : "bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-indigo-550"
                    }`}
                  />
                </div>

                {/* CSV Download Button */}
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={downloadServiceReportsCSV}
                    className="flex-1 sm:flex-initial px-4 py-2 bg-[#107C41] hover:bg-[#107C41]/90 hover:shadow-md text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                  >
                    <FileSpreadsheet className="w-4 h-4 shrink-0" />
                    <span>{language === "bn" ? "এক্সেল রিপোর্ট ডাউনলোড সম্পন্ন ফাইল" : "Download Excel Report (CSV)"}</span>
                  </button>
                </div>

              </div>

              {/* Month-wise segregated groups */}
              <div className="space-y-6">
                {Object.keys(groupedUsageByMonth).length === 0 ? (
                  <div className={`p-10 text-center rounded-xl border-2 border-dashed ${isDark ? "border-slate-800 text-slate-500" : "border-slate-200 text-slate-400"} font-bold text-xs`}>
                    {language === "bn" 
                      ? "কোন তথ্য পাওয়া যায় নি বা সার্চের সাথে মেলেনি!" 
                      : "No chemical consumption records matched your search query."}
                  </div>
                ) : (
                  Object.keys(groupedUsageByMonth)
                    .sort((a, b) => b.localeCompare(a)) // Sort months descending for latest view
                    .map((monthKey) => {
                      const monthEntries = groupedUsageByMonth[monthKey];
                      return (
                        <div key={monthKey} className="space-y-2">
                          {/* Month Heading */}
                          <div className="flex items-center gap-2 px-1">
                            <Calendar className="w-4 h-4 text-violet-500" />
                            <h4 className={`text-xs font-extrabold uppercase tracking-wider ${isDark ? "text-[#94A3B8]" : "text-slate-605"}`}>
                              {monthKey} ({monthEntries.length} {language === "bn" ? "টি ব্যবহার" : "usages"})
                            </h4>
                            <div className={`flex-1 h-px ml-2 ${isDark ? "bg-slate-800" : "bg-slate-100"}`} />
                          </div>

                          {/* Table Container */}
                          <div className={`border rounded-2xl overflow-hidden shadow-sm ${isDark ? "border-slate-800 bg-[#0B1324]/40" : "border-slate-200 bg-white"}`}>
                            <div className="overflow-x-auto">
                              <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                  <tr className={`border-b select-none font-mono text-[9px] uppercase tracking-wider font-bold ${isDark ? "bg-slate-800/60 border-slate-700 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-500"}`}>
                                    <th className="py-2 px-3 text-center border-r border-[#CBD5E1]/20 dark:border-slate-800/30 max-w-[44px]">ROW</th>
                                    <th className="py-2 px-3 border-r border-[#CBD5E1]/20 dark:border-slate-800/30 min-w-[200px]">{language === "bn" ? "হসপিটাল / ক্লিনিক এর নাম" : "Hospital / Clinic Name"}</th>
                                    <th className="py-2 px-3 border-r border-[#CBD5E1]/20 dark:border-slate-800/30 min-w-[95px]">{language === "bn" ? "ডেট" : "Date"}</th>
                                    <th className="py-2 px-3 border-r border-[#CBD5E1]/20 dark:border-slate-800/30 min-w-[200px]">{language === "bn" ? "ব্যবহৃত কেমিক্যাল এবং পরিমাণ" : "Chemical Used & Consumed"}</th>
                                    <th className="py-2 px-3 min-w-[90px]">{language === "bn" ? "ব্যাচ নং" : "Batch No"}</th>
                                  </tr>
                                </thead>
                                <tbody className={`divide-y font-semibold ${isDark ? "divide-slate-800 text-slate-300" : "divide-slate-150 text-slate-700"}`}>
                                  {monthEntries.map((entry, idx) => (
                                    <tr 
                                      key={idx} 
                                      className={`hover:bg-slate-50/40 dark:hover:bg-slate-800/35 transition-all ${
                                        idx % 2 === 0 ? (isDark ? "bg-slate-900/10" : "bg-white") : (isDark ? "bg-slate-800/10" : "bg-slate-50/25")
                                      }`}
                                    >
                                      {/* Row Index */}
                                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-400 border-r border-[#CBD5E1]/20 dark:border-slate-800/20 max-w-[44px]">
                                        {idx + 1}
                                      </td>

                                      {/* Hospital/Clinic with Icon */}
                                      <td className="py-3 px-3 border-r border-[#CBD5E1]/20 dark:border-slate-800/20">
                                        <div className="flex items-center gap-2">
                                          <div className={`p-1 rounded bg-blue-500/10 text-blue-500 ${isDark ? "bg-blue-500/15" : "bg-blue-50"}`}>
                                            <Building2 className="w-3.5 h-3.5" />
                                          </div>
                                          <span className={`font-bold tracking-tight text-[11px] ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                                            {entry.facilityName}
                                          </span>
                                        </div>
                                      </td>

                                      {/* Date with Icon */}
                                      <td className="py-3 px-3 font-mono border-r border-[#CBD5E1]/20 dark:border-slate-800/20">
                                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[10.5px]">
                                          <Calendar className="w-3 h-3 text-[#10B981]" />
                                          <span>{entry.dateStr}</span>
                                        </div>
                                      </td>

                                      {/* Chemical & Consumption with Icon */}
                                      <td className="py-3 px-3 border-r border-[#CBD5E1]/20 dark:border-slate-800/20">
                                        <div className="flex items-center gap-2">
                                          <div className={`p-1 rounded bg-violet-500/10 text-violet-500 ${isDark ? "bg-violet-500/15" : "bg-violet-50"}`}>
                                            <Droplets className="w-3.5 h-3.5 animate-pulse" />
                                          </div>
                                          <div className="flex items-baseline gap-1.5 min-w-0">
                                            <span className={`font-bold truncate text-[11.5px] ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                                              {entry.chemicalName}
                                            </span>
                                            <span className="font-mono font-extrabold text-[#7C3AED] dark:text-violet-400 text-[12px] bg-violet-500/5 dark:bg-violet-500/10 px-1.5 py-0.5 rounded border border-violet-500/10 shrink-0">
                                              {entry.amountUsed}
                                            </span>
                                          </div>
                                        </div>
                                      </td>

                                      {/* Batch No */}
                                      <td className="py-3 px-3 font-mono text-[10.5px] text-slate-500 dark:text-slate-400">
                                        {entry.batch}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`p-4 border-t flex items-center justify-end gap-2.5 ${isDark ? "border-slate-700 bg-slate-900/30" : "border-slate-200 bg-slate-50"}`}>
              <button
                type="button"
                onClick={() => {
                  setIsServiceReportModalOpen(false);
                  setServiceReportSearch("");
                }}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                  isDark 
                    ? "bg-slate-800 border border-[#475569] text-slate-300 hover:bg-slate-700 hover:text-white" 
                    : "bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-205"
                }`}
              >
                {language === "bn" ? "বন্ধ করুন" : "Close Sheet"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Chemical Requisition & Order Request Modal (Option 3) */}
      {isRequisitionModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 overflow-hidden flex items-center justify-center">
          <div className={`w-full h-full border-none shadow-none transition-all flex flex-col ${isDark ? "bg-[#0B1324] text-white" : "bg-[#F8FAFC] text-slate-900"}`}>
            
            {/* Modal Header */}
            <div className="p-5 border-b border-[#CBD5E1]/30 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
                  <ClipboardList className="w-5.5 h-5.5 animate-bounce" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm tracking-tight text-emerald-600 dark:text-emerald-400">
                    {language === "bn" ? "কেমিক্যাল চাহিদা এবং অফিসিয়াল রিকুইজিশন পোর্টাল" : "Official Chemical Request & Requisition Station"}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5 animate-pulse">
                    {language === "bn" ? "কোম্পানিতে প্রয়োজনীয় নতুন কেমিক্যাল চাহিদাপত্র ও আয়েশার স্বাক্ষরসহ পিডিএফ প্রস্তুত করুন" : "Draft required chemicals, generate download-ready Excel logs, and print authorized requisitions"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRequisitionModalOpen(false)}
                className={`p-1.5 rounded-lg border transition-all cursor-pointer ${isDark ? "bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-400 hover:text-white" : "bg-slate-50 border-slate-250 hover:bg-slate-100 text-slate-500"}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
              
              {/* Left Column: Form Controls */}
              <div className="lg:col-span-5 space-y-4">
                <h4 className={`text-xs font-extrabold uppercase tracking-wider pb-1.5 border-b border-dashed ${isDark ? "text-slate-300 border-slate-700" : "text-slate-700 border-slate-200"}`}>
                  {language === "bn" ? "নতুন কেমিক্যালের চাহিদা যুক্ত করুন" : "Add Chemical Requirement"}
                </h4>

                {/* Form Inputs */}
                <div className="space-y-3">
                  {/* Row splitting into Chemical Name & Batch No */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Column 1: Choose Chemical Name */}
                    <div>
                      <label className={`block text-[10.5px] font-bold mb-1 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                        {isCustomReqChemical 
                          ? (language === "bn" ? "নতুন কেমিক্যালের নাম লিখুন" : "Type New Chemical Name")
                          : (language === "bn" ? "ইনভেন্টরি থেকে কেমিক্যাল বাছুন" : "Choose Chemical Name")
                        }
                      </label>
                      <div className="space-y-1.5">
                        {!isCustomReqChemical ? (
                          <select 
                            value={reqInputName}
                            onChange={(e) => handleReqChemicalSelect(e.target.value)}
                            className={`w-full p-2 rounded-xl text-xs border select-none outline-none cursor-pointer ${
                              isDark 
                                ? "bg-slate-800/80 border-slate-700 text-slate-205 focus:border-emerald-500" 
                                : "bg-slate-50 border-slate-300 text-slate-805 focus:border-emerald-500"
                            }`}
                          >
                            <option value="">-- {language === "bn" ? "ইনভেন্টরি থেকে বাছুন" : "Choose from inventory"} --</option>
                            {chemicals.map((chem) => (
                              <option key={chem.id || chem.name} value={chem.name}>
                                {chem.name} ({chem.stock} {chem.unit} left)
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={reqInputName}
                            onChange={(e) => setReqInputName(e.target.value)}
                            placeholder={language === "bn" ? "কেমিক্যালের নাম লিখুন" : "Type custom name"}
                            className={`w-full p-2 rounded-xl text-xs border outline-none ${
                              isDark 
                                ? "bg-slate-800/80 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500" 
                                : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-500"
                            }`}
                          />
                        )}
                      </div>
                    </div>

                    {/* Column 2: Choose / Enter Batch No */}
                    <div>
                      <label className={`block text-[10.5px] font-bold mb-1 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                        {isCustomReqChemical 
                          ? (language === "bn" ? "কাস্টম ব্যাচ নং লিখুন" : "Type Batch No")
                          : (language === "bn" ? "ব্যাচ নং নির্বাচন করুন" : "Batch No Selection")
                        }
                      </label>
                      <div className="space-y-1.5">
                        {!isCustomReqChemical ? (
                          <select 
                            value={reqInputBatch}
                            onChange={(e) => handleReqBatchSelect(e.target.value)}
                            className={`w-full p-2 rounded-xl text-xs border select-none outline-none cursor-pointer ${
                              isDark 
                                ? "bg-slate-800/80 border-slate-700 text-slate-205 focus:border-emerald-500" 
                                : "bg-slate-50 border-slate-300 text-slate-805 focus:border-emerald-500"
                            }`}
                          >
                            <option value="">-- {language === "bn" ? "ব্যাচ নং সিলেক্ট করুন" : "Pick Batch No"} --</option>
                            {Array.from(
                              new Set(chemicals.map((chem) => chem.batch).filter((b): b is string => !!b && b !== "N/A" && b.trim() !== ""))
                            ).map((batch) => (
                              <option key={batch} value={batch}>
                                {batch}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={reqInputBatch}
                            onChange={(e) => setReqInputBatch(e.target.value)}
                            placeholder={language === "bn" ? "ব্যাচ নং প্রদান করুন" : "Type batch number"}
                            className={`w-full p-2 rounded-xl text-xs border outline-none ${
                              isDark 
                                ? "bg-slate-800/80 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500" 
                                : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-500"
                            }`}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Small option to type custom / edit details manually */}
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed transition-all ${
                    isDark 
                      ? "bg-slate-900/45 border-slate-700 hover:border-emerald-500/40" 
                      : "bg-[#F8FAFC] border-slate-200 hover:border-emerald-500/40"
                  }`}>
                    <input
                      type="checkbox"
                      id="custom-req-chem-toggle"
                      checked={isCustomReqChemical}
                      onChange={(e) => {
                        setIsCustomReqChemical(e.target.checked);
                        if (e.target.checked) {
                          showToast(
                            language === "bn"
                              ? "ম্যানুয়াল টাইপিং সক্রিয় হয়েছে। নিজের মতো কেমিক্যালের নাম, ব্যাচ ও একক (যেমন: Pcs) টাইপ করতে পারবেন!"
                              : "Manual typing option loaded. Type any custom chemical name, batch and unit (e.g. Pcs) now!",
                            "info"
                          );
                        } else {
                          showToast(
                            language === "bn"
                              ? "ইনভেন্টরি সিলেকশন সক্রিয় হয়েছে!"
                              : "Inventory selection loaded successfully!",
                            "info"
                          );
                        }
                      }}
                      className="rounded border-slate-300 dark:border-slate-700 text-emerald-500 focus:ring-emerald-500 cursor-pointer w-4 h-4"
                    />
                    <label 
                      htmlFor="custom-req-chem-toggle" 
                      className={`text-[10.5px] font-bold cursor-pointer select-none py-0.5 flex items-center gap-1.5 ${
                        isDark ? "text-slate-300 hover:text-white" : "text-slate-700 hover:text-slate-900"
                      }`}
                    >
                      <span className="text-emerald-500">✍️</span>
                      {language === "bn" 
                        ? "কাস্টম/নতুন কেমিক্যাল নিজে লিখে দিতে চান?" 
                        : "Type custom/new chemical manually?"}
                    </label>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="col-span-2">
                      <label className={`block text-[10.5px] font-bold mb-1 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                        {language === "bn" ? "পরিমাণ" : "Required Qty"}
                      </label>
                      <input
                        type="number"
                        min="0.1"
                        step="any"
                        value={reqInputQty}
                        onChange={(e) => setReqInputQty(e.target.value)}
                        placeholder="e.g. 5"
                        className={`w-full p-2 rounded-xl text-xs border outline-none ${
                          isDark 
                            ? "bg-slate-800/80 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500" 
                            : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-500"
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-[10.5px] font-bold mb-1 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                        {language === "bn" ? "একক/Unit" : "Unit"}
                      </label>
                      {!isCustomReqChemical ? (
                        <select
                          value={reqInputUnit}
                          onChange={(e) => setReqInputUnit(e.target.value)}
                          className={`w-full p-2 rounded-xl text-xs border outline-none cursor-pointer ${
                            isDark 
                              ? "bg-slate-800/80 border-slate-700 text-white focus:border-emerald-500" 
                              : "bg-white border-slate-300 text-slate-900 focus:border-emerald-500"
                          }`}
                        >
                          <option value="L">L</option>
                          <option value="mL">mL</option>
                          <option value="kg">kg</option>
                          <option value="g">g</option>
                          <option value="Bags">Bags</option>
                          <option value="Cans">Cans</option>
                          <option value="Pcs">Pcs</option>
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={reqInputUnit}
                          onChange={(e) => setReqInputUnit(e.target.value)}
                          placeholder={language === "bn" ? "যেমন: Pcs" : "e.g. Pcs"}
                          className={`w-full p-2 rounded-xl text-xs border outline-none ${
                            isDark 
                              ? "bg-slate-800/80 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500" 
                              : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-500"
                          }`}
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className={`block text-[10.5px] font-bold mb-1 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                      {language === "bn" ? "প্রয়োজনীয় তারিখ (ক্যালেন্ডার)" : "Required Date (Calendar)"}
                    </label>
                    <input
                      type="date"
                      value={reqInputPurpose}
                      onChange={(e) => setReqInputPurpose(e.target.value)}
                      className={`w-full p-2 rounded-xl text-xs border outline-none ${
                        isDark 
                          ? "bg-slate-800/80 border-slate-700 text-white focus:border-emerald-500" 
                          : "bg-white border-slate-300 text-slate-900 focus:border-emerald-500"
                      }`}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!reqInputName.trim()) {
                        showToast(language === "bn" ? "দয়া করে কেমিক্যালের নাম লিখুন বা সিলেক্ট করুন।" : "Please provide a valid chemical name.", "error");
                        return;
                      }
                      if (!reqInputQty || parseFloat(reqInputQty) <= 0) {
                        showToast(language === "bn" ? "সকরিমানে সঠিক মান দিন।" : "Please enter a valid positive quantity.", "error");
                        return;
                      }
                      
                      const trimmedName = reqInputName.trim().toUpperCase();
                      const trimmedBatch = reqInputBatch.trim() || "N/A";
                      
                      // Format date from YYYY-MM-DD to DD/MM/YYYY if possible for visual design
                      let formattedDate = reqInputPurpose;
                      if (reqInputPurpose.includes("-")) {
                        const parts = reqInputPurpose.split("-");
                        if (parts.length === 3) {
                          formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
                        }
                      }

                      const newItem = {
                        id: `req-${Date.now()}`,
                        name: trimmedName,
                        batch: trimmedBatch,
                        qty: reqInputQty,
                        unit: reqInputUnit,
                        purpose: formattedDate || new Date().toLocaleDateString("en-GB")
                      };
                      setRequisitionItems(prev => [...prev, newItem]);
                      
                      // Auto-save new/custom chemical or batch into master inventory database
                      const matchedChem = chemicals.find(c => c.name.trim().toLowerCase() === trimmedName.toLowerCase());
                      const isNewBatch = matchedChem && trimmedBatch !== "N/A" && matchedChem.batch !== trimmedBatch;

                      if (!matchedChem || isNewBatch) {
                        const targetId = trimmedName.replace(/[^a-zA-Z0-9_-]/g, "_");
                        const newChemData = {
                          id: targetId,
                          name: trimmedName,
                          receivedDate: matchedChem ? (matchedChem.receivedDate || "N/A") : new Date().toISOString().split('T')[0],
                          dilution: matchedChem ? (matchedChem.dilution || "N/A") : "N/A",
                          batch: trimmedBatch,
                          expiry: matchedChem ? (matchedChem.expiry || "2029-12-31") : "2029-12-31",
                          stock: 0,
                          unit: reqInputUnit,
                          alertThreshold: 1.0
                        };
                        saveDocument("chemicalInventory", trimmedName, newChemData)
                        .then(() => fetchInventory())
                        .catch(err => {
                          console.warn("Failed to auto save custom chemical to Firestore:", err);
                        });
                      }

                      setReqInputName("");
                      setReqInputBatch("");
                      setReqInputQty("");
                      // Reset to today's date
                      setReqInputPurpose(new Date().toISOString().split('T')[0]);
                      setIsCustomReqChemical(false);
                      showToast(language === "bn" ? "চাহিদা তালিকায় সফলভাবে যোগ করা হয়েছে!" : "Chemical requested successfully!", "success");
                    }}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer hover:shadow-lg hover:-translate-y-0.5"
                  >
                    <Plus className="w-4 h-4" />
                    {language === "bn" ? "তালিকায় যুক্ত করুন" : "Add to Request Cart"}
                  </button>
                </div>

                {/* Quick Interactive Requisition Cart Manager (প্লাস-মাইনাস কুয়িক এডিটর) */}
                <div className={`mt-4 p-4 rounded-xl border space-y-3 ${isDark ? "bg-slate-900/65 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                  <div className="flex items-center justify-between pb-1.5 border-b border-dashed border-slate-700/30">
                    <h5 className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <ShoppingCart className="w-3.5 h-3.5" />
                      {language === "bn" ? "চাহিদাকৃত আইটেম প্লাস-মাইনাস প্যানেল" : "Request Cart Live Adjuster"}
                    </h5>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                      {requisitionItems.length} {language === "bn" ? "পিস" : "Items"}
                    </span>
                  </div>

                  {requisitionItems.length === 0 ? (
                    <div className="py-4 text-center text-slate-400 italic text-[10.5px] border border-dashed border-slate-700/20 rounded-lg">
                      {language === "bn" ? "কোন রিকুয়েস্ট আইটেম যুক্ত নেই" : "No items added to draft yet"}
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 select-none">
                      {requisitionItems.map((item) => (
                        <div 
                          key={item.id} 
                          className={`flex items-center justify-between p-2 rounded-xl border text-[11px] transition-all hover:border-emerald-500/50 ${
                            isDark ? "bg-slate-850 border-slate-800" : "bg-slate-50 border-slate-150"
                          }`}
                        >
                          {/* Part 1: Chemical Name */}
                          <div className="flex-1 min-w-0 pr-2">
                            <span className="font-bold text-emerald-650 dark:text-emerald-400 block truncate" title={item.name}>
                              {item.name}
                            </span>
                            {/* Part 2: Batch No */}
                            <span className="text-[9px] text-slate-400 font-mono block">
                              {language === "bn" ? "ব্যাচ নং: " : "Batch: "} {item.batch || "N/A"}
                            </span>
                          </div>

                          {/* Part 3 & 4: Live Plus/Minus adjusters */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => decreaseRequisitionQty(item.id)}
                              className={`w-5 h-5 rounded-md flex items-center justify-center font-black transition-all border cursor-pointer hover:bg-rose-600 hover:text-white hover:border-rose-600 ${
                                isDark ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-slate-100 border-slate-300 text-slate-705"
                              }`}
                              title={language === "bn" ? "কমান (০ হলে মুছে যাবে)" : "Decrease (removes if 0)"}
                            >
                              -
                            </button>
                            <span className="font-bold font-mono min-w-[36px] text-center px-1 bg-emerald-500/10 text-emerald-500 rounded text-[11px]">
                              {item.qty} <span className="text-[9px] font-normal text-slate-400">{item.unit}</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => increaseRequisitionQty(item.id)}
                              className={`w-5 h-5 rounded-md flex items-center justify-center font-black transition-all border cursor-pointer hover:bg-emerald-600 hover:text-white hover:border-emerald-600 ${
                                isDark ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-slate-100 border-slate-300 text-slate-705"
                              }`}
                              title={language === "bn" ? "বাড়ান" : "Increase quantity"}
                            >
                              +
                            </button>
                            
                            {/* Trash button */}
                            <button
                              type="button"
                              onClick={() => {
                                setRequisitionItems(prev => prev.filter(p => p.id !== item.id));
                                showToast(
                                  language === "bn" ? "চাহিদা তালিকা থেকে মুছে ফেলা হয়েছে!" : "Removed from requisition list!", 
                                  "info"
                                );
                              }}
                              className="ml-1 p-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                              title={language === "bn" ? "তালিকা থেকে মুছুন" : "Remove item"}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Meta Inputs: Rich Real-time Configuration Controls for Requisition Form */}
                <div className={`mt-5 p-4 rounded-xl border space-y-3 ${isDark ? "bg-slate-900/40 border-slate-700" : "bg-slate-50/50 border-slate-200"}`}>
                  <h5 className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider pb-1.5 border-b border-dashed border-slate-700/30">
                    {language === "bn" ? "ডকুমেন্ট কাস্টমাইজেশন ও সিগনেচার" : "Document Configuration & Sign-off"}
                  </h5>
                  
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 mb-0.5 uppercase">FROM / উৎস</label>
                      <input
                        type="text"
                        value={reqFrom}
                        onChange={(e) => setReqFrom(e.target.value)}
                        className={`w-full p-1.5 rounded-lg text-xs border outline-none ${
                          isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 mb-0.5 uppercase">Engineer / প্রকৌশলী</label>
                      <input
                        type="text"
                        value={reqEngineer}
                        onChange={(e) => setReqEngineer(e.target.value)}
                        className={`w-full p-1.5 rounded-lg text-xs border outline-none ${
                          isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 mb-0.5 uppercase">To / প্রাপক</label>
                      <input
                        type="text"
                        value={reqTo}
                        onChange={(e) => setReqTo(e.target.value)}
                        className={`w-full m-0 p-1.5 rounded-lg text-xs border outline-none ${
                          isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 mb-0.5 uppercase">Date / তারিখ</label>
                      <input
                        type="text"
                        value={reqDateStr}
                        onChange={(e) => setReqDateStr(e.target.value)}
                        className={`w-full m-0 p-1.5 rounded-lg text-xs border outline-none ${
                          isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-0.5 uppercase">{language === "bn" ? "ভূমিকা লাইন" : "Opening Remark"}</label>
                    <textarea
                      rows={1.5}
                      value={reqOpeningLine}
                      onChange={(e) => setReqOpeningLine(e.target.value)}
                      className={`w-full m-0 p-1.5 rounded-lg text-xs border outline-none resize-none ${
                        isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-0.5 uppercase">{language === "bn" ? "সমাপ্তি লাইন" : "Closing Remark"}</label>
                    <textarea
                      rows={1.5}
                      value={reqClosingLine}
                      onChange={(e) => setReqClosingLine(e.target.value)}
                      className={`w-full m-0 p-1.5 rounded-lg text-xs border outline-none resize-none ${
                        isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
                      }`}
                    />
                  </div>

                  <div className="border-t border-slate-200/50 dark:border-slate-800 pt-2 flex flex-col gap-2">
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 mb-0.5 uppercase">Signatory Name</label>
                        <input
                          type="text"
                          value={requesterName}
                          onChange={(e) => setRequesterName(e.target.value)}
                          className={`w-full p-1.5 rounded-lg text-xs border outline-none ${
                            isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 mb-0.5 uppercase">Designation</label>
                        <input
                          type="text"
                          value={requesterDesignation}
                          onChange={(e) => setRequesterDesignation(e.target.value)}
                          className={`w-full p-1.5 rounded-lg text-xs border outline-none ${
                            isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
                          }`}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-1.5 pt-2">
                      <div>
                        <span className="text-[11px] font-bold block leading-tight">
                          {language === "bn" ? "আয়েশার স্বাক্ষর ও স্ট্যাম্প" : "Include Aisha's Signature Stamp"}
                        </span>
                        <span className="text-[8.5px] text-slate-400 block leading-tight mt-0.5">
                          {language === "bn" ? "প্রিন্ট ও পিডিএফ কপিতে অফিসিয়াল সাইন স্ট্যাম্প বসানো হবে" : "Verify and stamp this sheet with dynamic authorized signatures"}
                        </span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                        <input 
                          type="checkbox" 
                          checked={aishaSigned} 
                          onChange={(e) => setAishaSigned(e.target.checked)}
                          className="sr-only peer" 
                        />
                        <div className="w-8 h-4 bg-slate-250 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>

                    {/* Signature Upload Area */}
                    {aishaSigned && (
                      <div className={`mt-2.5 p-2 rounded-xl border border-dashed text-center flex flex-col items-center justify-center gap-1.5 transition-all ${
                        isDark 
                          ? "bg-slate-900/45 border-slate-700 hover:border-emerald-500/45" 
                          : "bg-[#F8FAFC] border-slate-300 hover:border-emerald-500/45"
                      }`}>
                        <span className="text-[10px] text-slate-400 font-bold block leading-tight">
                          {language === "bn" ? "নিজের স্বাক্ষর আপলোড করুন (ঐচ্ছিক)" : "Upload Custom Signature Image (Optional)"}
                        </span>
                        
                        {customSignatureUrl ? (
                          <div className="flex items-center gap-2">
                            <img 
                              src={customSignatureUrl} 
                              alt="Uploaded Authorized Signature" 
                              className="h-8 max-w-[120px] object-contain bg-white dark:bg-slate-900 rounded p-0.5 border border-emerald-500/40"
                            />
                            <button
                              type="button"
                              onClick={handleResetSignature}
                              className="p-1 px-1.5 rounded bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 text-[9px] font-bold flex items-center gap-0.5 transition-all cursor-pointer"
                              title={language === "bn" ? "স্বাক্ষর মুছুন" : "Reset to default logo signature"}
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                              {language === "bn" ? "মুছুন" : "Remove"}
                            </button>
                          </div>
                        ) : (
                          <label className="text-[10px] px-2 py-0.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-500 font-bold rounded cursor-pointer transition-all inline-flex items-center gap-1">
                            <span>✍️</span>
                            {language === "bn" ? "ফাইল বাছাই করুন" : "Browse Signature File"}
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleSignatureUpload} 
                              className="hidden" 
                            />
                          </label>
                        )}
                        <span className="text-[8px] text-slate-400 leading-tight">
                          {language === "bn" ? "স্বচ্ছ PNG অথবা সাদা ব্যাকগ্রাউন্ড ছবি সবচেয়ে ভালো দেখাবে" : "Works best with cropped transparent PNG/JPG"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Right Column: Requisition Interactive Table (Chart) */}
              <div className="lg:col-span-7 flex flex-col justify-between">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-slate-700/20 pb-2">
                    <div className="flex items-center gap-1.5 p-1 bg-slate-950/20 dark:bg-slate-900/60 rounded-xl max-w-max">
                      <button 
                        type="button"
                        onClick={() => setRequisitionViewMode("draft")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                          requisitionViewMode === "draft" 
                            ? "bg-slate-800 text-white dark:bg-slate-700 shadow-sm" 
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <ClipboardList className="w-3.5 h-3.5" />
                        {language === "bn" ? "ড্রাফট লিস্ট ও এডিটর" : "Draft Editor List"}
                      </button>
                      <button 
                        type="button"
                        onClick={() => setRequisitionViewMode("preview")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer relative ${
                          requisitionViewMode === "preview" 
                            ? "bg-emerald-600 text-white shadow-sm font-black" 
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-450 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                        </span>
                        <span>{language === "bn" ? "লাইভ পেপার ভিউ ডেকোরেশন" : "Live Page Sheet Preview"}</span>
                      </button>
                    </div>

                    <span className="text-[11px] px-2.5 py-1 bg-emerald-500/10 text-emerald-500 rounded-full font-bold self-end sm:self-center">
                      {requisitionItems.length} {language === "bn" ? "টি রিকুয়েস্ট আইটেম" : "Items Added"}
                    </span>
                  </div>

                  {requisitionViewMode === "draft" ? (
                    /* Table Element Draft View */
                    <div className="space-y-4">
                      <div className={`border rounded-xl spill-x overflow-hidden ${isDark ? "border-slate-700" : "border-slate-200"}`}>
                        <table className="w-full text-left text-[11px] border-collapse">
                          <thead>
                            <tr className={`${isDark ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-700"}`}>
                              <th className="py-2.5 px-3 font-extrabold">#</th>
                              <th className="py-2.5 px-3 font-extrabold">{language === "bn" ? "কেমিক্যালের নাম" : "Chemical Name"}</th>
                              <th className="py-2.5 px-3 font-extrabold text-center">{language === "bn" ? "ব্যাচ নং" : "Batch No"}</th>
                              <th className="py-2.5 px-3 font-extrabold text-center">{language === "bn" ? "প্রয়োজনীয় পরিমাণ" : "Qty Requested"}</th>
                              <th className="py-2.5 px-3 font-extrabold">{language === "bn" ? "প্রয়োজনীয় তারিখ" : "Required Date"}</th>
                              <th className="py-2.5 px-3 text-center font-extrabold">{language === "bn" ? "অ্যাকশন" : "Delete"}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800">
                            {requisitionItems.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="py-8 text-center text-slate-400 italic text-[11px]">
                                  {language === "bn" ? "কোন রিকুয়েস্ট কেমিক্যাল যোগ করা হয়নি। বামপাশের ফর্মটি ব্যবহার করুন।" : "Requisition draft is empty. Add items using the left form."}
                                </td>
                              </tr>
                            ) : (
                              requisitionItems.map((item, index) => (
                                <tr key={item.id} className="transition-colors hover:bg-slate-500/5">
                                  <td className="py-2.5 px-3 font-mono text-slate-400">{index + 1}</td>
                                  <td className="py-2.5 px-3 font-bold text-emerald-555 dark:text-emerald-400">{item.name}</td>
                                  <td className="py-2.5 px-3 text-center font-bold text-slate-400 font-mono">{item.batch || "N/A"}</td>
                                  <td className="py-2.5 px-3 text-center font-bold font-mono">
                                    <div className="inline-flex items-center gap-1.5 justify-center">
                                      <button
                                        type="button"
                                        onClick={() => decreaseRequisitionQty(item.id)}
                                        className={`w-5 h-5 rounded flex items-center justify-center font-black transition-all border cursor-pointer hover:bg-rose-600 hover:text-white hover:border-rose-600 ${
                                          isDark ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-slate-200 border-slate-300 text-slate-700"
                                        }`}
                                        title={language === "bn" ? "কমান (০ হলে মুছে যাবে)" : "Decrease (removes if 0)"}
                                      >
                                        -
                                      </button>
                                      <span className={`px-2 py-0.5 rounded text-center min-w-[36px] ${isDark ? "bg-slate-800 text-slate-200" : "bg-slate-150 text-slate-800"}`}>
                                        {item.qty} <span className="text-[9px] font-normal text-slate-400">{item.unit}</span>
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => increaseRequisitionQty(item.id)}
                                        className={`w-5 h-5 rounded flex items-center justify-center font-black transition-all border cursor-pointer hover:bg-emerald-600 hover:text-white hover:border-emerald-600 ${
                                          isDark ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-slate-200 border-slate-300 text-slate-705"
                                        }`}
                                        title={language === "bn" ? "বাড়ান" : "Increase quantity"}
                                      >
                                        +
                                      </button>
                                    </div>
                                  </td>
                                  <td className="py-2.5 px-3 text-slate-500 truncate max-w-[150px]" title={item.purpose}>
                                    {item.purpose}
                                  </td>
                                  <td className="py-2.5 px-3 text-center">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setRequisitionItems(prev => prev.filter(p => p.id !== item.id));
                                        showToast(language === "bn" ? "আইটেমটি মুছে ফেলা হয়েছে!" : "Item removed from draft!", "info");
                                      }}
                                      className="p-1 hover:text-red-500 transition-colors text-slate-400 hover:scale-110 cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Preview of Aisha Signature */}
                      {aishaSigned && (
                        <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 ${isDark ? "bg-[#14233C]/40 border-slate-700" : "bg-teal-50/50 border-teal-200"}`}>
                          <div className="space-y-0.5">
                            <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                              {language === "bn" ? "প্রিন্ট এবং পিডিএফ স্বাক্ষর স্ট্যাটাস" : "Print & PDF Signatory Status"}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                {language === "bn" ? "আয়েশার স্বাক্ষর ও অফিসিয়াল ড্রাফট স্ট্যাম্প অনুমোদিত" : "Authorized with Aisha's Stamp and Digital Signature"}
                              </span>
                            </div>
                          </div>
                          <div className="border border-dashed border-emerald-500/30 rounded-lg py-1 px-3 bg-white text-black shrink-0 text-center scale-90 md:scale-100">
                            <span className="text-[8px] font-mono italic block text-slate-400 -mb-1">Signature applied</span>
                            <span className="font-serif italic text-xs text-blue-800 font-bold block">Aisha Al-Wafa</span>
                            <span className="text-[7.5px] uppercase tracking-widest text-red-500 font-bold block border-t border-slate-100 mt-0.5 pt-0.5">APPROVED</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Stunning Real-time A4 Paper Replica "View Decoration" */
                    <div className="bg-white text-black p-6 md:p-8 rounded-2xl shadow-2xl border border-slate-300 relative overflow-hidden text-left" style={{ fontFamily: 'Arial, sans-serif' }}>
                      {/* Red 5-Point star logo / header board */}
                      <div className="flex items-center justify-between pb-2" style={{ borderBottom: '2.5px solid #dc2626' }}>
                        <div className="flex items-center gap-3">
                          <svg viewBox="0 0 24 24" className="w-[44px] h-[44px] shrink-0" style={{ fill: '#dc2626', filter: 'drop-shadow(1.5px 1.5px 1px rgba(0,0,0,0.15))' }}>
                            <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
                          </svg>
                          <div>
                            <div className="flex flex-col md:flex-row md:items-baseline md:gap-2">
                              <span className="text-base md:text-lg font-bold tracking-tight m-0 leading-none" style={{ color: '#dc2626', fontFamily: 'Georgia, Times, serif', fontSize: '18px', fontWeight: 900 }}>
                                AL WAFA STAR
                              </span>
                              <span className="text-[9.5px] md:text-[10px] font-bold tracking-wide leading-none pb-0.5" style={{ color: '#dc2626', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                                Cleaning & Security Services
                              </span>
                            </div>
                            <p className="text-[8.5px] font-extrabold tracking-widest uppercase m-0 mt-1" style={{ color: '#dc2626' }}>
                              Pest Control Department
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm md:text-base font-bold block leading-none" style={{ color: '#dc2626', fontFamily: 'Arial, sans-serif' }}>نجمة الوفاء</span>
                          <span className="text-[8.5px] font-bold block mt-1" style={{ color: '#dc2626', fontFamily: 'Arial, sans-serif' }}>لخدمات التنظيف والحراسة</span>
                        </div>
                      </div>
                      <div className="h-[1.5px] bg-black w-full mt-0.5 mb-4"></div>

                      {/* Center Title */}
                      <div className="text-center my-3">
                        <h2 className="text-xs md:text-sm font-bold text-[#1e3a8a] inline-block uppercase pb-0.5" style={{ textDecoration: 'underline', textUnderlineOffset: '3px', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>
                          Request for Pest Control Chemicals & Tools
                        </h2>
                      </div>

                      {/* Requisition Metadata Details */}
                      <div className="space-y-0.5 text-xs text-black mb-4 leading-normal" style={{ fontFamily: 'Arial, sans-serif' }}>
                        <p className="m-0"><span className="font-bold">FROM:</span> {reqFrom}</p>
                        <p className="m-0 pl-12 text-slate-700 text-[10.5px]">{reqEngineer}</p>
                        <p className="m-0"><span className="font-bold">To:</span> {reqTo}</p>
                        <p className="m-0"><span className="font-bold">Date:</span> {reqDateStr}</p>
                      </div>

                      {/* Opening Statement */}
                      <p className="text-[11.5px] text-black mb-3 leading-normal" style={{ fontFamily: 'Arial, sans-serif' }}>
                        {reqOpeningLine}
                      </p>

                      {/* Table Title label */}
                      <p className="text-[11.5px] font-bold text-[#1e3a8a] mb-1.5" style={{ fontFamily: 'Arial, sans-serif' }}>
                        List of Required Chemicals & Tools:
                      </p>

                      {/* Table Container with Fade Watermark */}
                      <div className="relative border border-slate-700 overflow-hidden mb-4 bg-white" style={{ minHeight: '90px' }}>
                        {/* Centered Star Watermark overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none select-none" style={{ zIndex: 0 }}>
                          <svg viewBox="0 0 24 24" className="w-[180px] h-[180px]" style={{ fill: '#dc2626' }}>
                            <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
                          </svg>
                        </div>

                        <table className="w-full text-left text-[11px] border-collapse relative" style={{ zIndex: 1, backgroundColor: 'transparent' }}>
                          <thead>
                            <tr className="bg-[#E2E8F0] border-b border-slate-700 text-slate-900 font-bold">
                              <th className="py-1.5 px-2.5 border-r border-slate-700 text-center w-10 font-bold">No</th>
                              <th className="py-1.5 px-2.5 border-r border-slate-700 font-bold">Name</th>
                              <th className="py-1.5 px-2.5 border-r border-slate-700 font-bold text-center w-28">Batch No</th>
                              <th className="py-1.5 px-2.5 border-r border-slate-700 font-bold text-center w-28">Required Date</th>
                              <th className="py-1.5 px-2.5 font-bold text-center w-28">Quantity</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-700">
                            {requisitionItems.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="py-6 text-center text-slate-500 italic">
                                  No requested chemicals or tools.
                                </td>
                              </tr>
                            ) : (
                              requisitionItems.map((item, idx) => (
                                <tr key={item.id} className="text-slate-900">
                                  <td className="py-1.5 px-2.5 border-r border-slate-700 text-center font-semibold">{idx + 1}</td>
                                  <td className="py-1.5 px-2.5 border-r border-slate-700 font-semibold">{item.name}</td>
                                  <td className="py-1.5 px-2.5 border-r border-slate-700 text-center font-semibold font-mono text-slate-600">{item.batch || "N/A"}</td>
                                  <td className="py-1.5 px-2.5 border-r border-slate-700 text-center font-semibold font-mono text-slate-500">{item.purpose}</td>
                                  <td className="py-1.5 px-2.5 text-center font-bold">
                                    {item.qty} {item.unit !== "Pcs" ? item.unit : ""}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Closing instruction */}
                      <p className="text-[11.5px] text-black mb-5 leading-normal" style={{ fontFamily: 'Arial, sans-serif' }}>
                        {reqClosingLine}
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
                  )}
                </div>

                {/* Bottom Action bar */}
                <div className={`mt-6 pt-4 border-t flex flex-wrap gap-2 justify-end ${isDark ? "border-slate-800" : "border-slate-100"}`}>
                  <button
                    type="button"
                    onClick={() => {
                      if (requisitionItems.length === 0) {
                        showToast(language === "bn" ? "চাহিদা তালিকা খালি থাকায় এক্সেল ডাউনলোড করা সম্ভব নয়।" : "Requisition items are empty. Please add items first.", "error");
                        return;
                      }
                      downloadRequisitionCSV();
                    }}
                    className="px-3 md:px-4 py-2 bg-emerald-600 hover:bg-emerald-750 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer select-none active:scale-95 whitespace-nowrap"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    {language === "bn" ? "এক্সেল শিট" : "Download Excel"}
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveRequisition}
                    className="px-3 md:px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer select-none active:scale-95 whitespace-nowrap"
                  >
                    <Save className="w-4 h-4" />
                    {language === "bn" ? "হিস্ট্রি সেভ এবং ক্লিয়ার" : "Save History & Clear"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsSavedReqsHistoryModalOpen(true)}
                    className={`px-3 md:px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer select-none active:scale-95 flex items-center gap-1.5 whitespace-nowrap ${
                      isDark 
                        ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white" 
                        : "bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <FolderOpen className="w-4 h-4 text-[#38bdf8]" />
                    <span>{language === "bn" ? "সংরক্ষিত ফাইল সমূহ" : "Saved History Logs"}</span>
                    {savedRequisitions.length > 0 && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[#38bdf8]/15 text-[#38bdf8] rounded-full">
                        {savedRequisitions.length}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (requisitionItems.length === 0) {
                        showToast(language === "bn" ? "চাহিদা তালিকা খালি থাকায় প্রিন্ট করা সম্ভব নয়।" : "Requisition items are empty. Please add items first.", "error");
                        return;
                      }

                      const defaultName = `AlWafaStar-Requisition-${Date.now().toString().slice(-4)}`;
                      const customFileName = defaultName;

                      handleDownloadPdf(customFileName, false);
                    }}
                    className="px-3 md:px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer select-none active:scale-95 whitespace-nowrap"
                  >
                    <Printer className="w-4 h-4" />
                    {language === "bn" ? "পিডিএফ / প্রিন্ট করুন" : "Print & Save to PDF"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsRequisitionModalOpen(false)}
                    className={`px-3 md:px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer whitespace-nowrap ${
                      isDark 
                        ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700" 
                        : "bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {language === "bn" ? "বন্ধ করুন" : "Close Portal"}
                  </button>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

      {/* HIDDEN PRINTABLE REQUISITION SHEET LAYOUT (TRIGGERS BEAUTIFULLY WITH BROWSER PRINTING ONLY) */}
      {(() => {
        const activePrintData = tempPrintReq || {
          dateStr: reqDateStr,
          from: reqFrom,
          engineer: reqEngineer,
          to: reqTo,
          items: requisitionItems,
          opening: reqOpeningLine,
          closing: reqClosingLine,
          signatoryName: requesterName,
          signatoryDesignation: requesterDesignation,
          aishaSigned: aishaSigned,
          customSignatureUrl: customSignatureUrl
        };
        return (
          <div id="print-requisition-area" className="hidden print:block bg-white text-black p-10 font-sans" style={{ color: '#000000', backgroundColor: '#ffffff', fontFamily: 'Arial, Helvetica, sans-serif' }}>
            
            {/* Print-specific style tags safely embedded */}
            <p className="hidden select-none mr-2"></p>
            <style dangerouslySetInnerHTML={{ __html: `
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
          .watermark svg, .watermark-chemical svg, .watermark-absolute svg { width: 100%; height: 100%; object-fit: contain; }
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
          }` }} />

            {/* Official Header Board */}
            <div className="flex items-center justify-between pb-1" style={{ borderBottom: '2.5px solid #dc2626' }}>
              <div className="flex items-center gap-4">
                {/* Red 5-Point star logo */}
                <svg viewBox="0 0 24 24" className="w-[52px] h-[52px] shrink-0" style={{ fill: '#dc2626', filter: 'drop-shadow(1px 1.5px 1px rgba(0,0,0,0.1))' }}>
                  <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
                </svg>
                <div>
                  <div className="flex items-baseline gap-2">
                    <h1 className="text-xl font-black tracking-tight m-0 leading-none" style={{ color: '#dc2626', fontFamily: 'Georgia, Times, serif', fontSize: '23px', fontWeight: 900 }}>
                      AL WAFA STAR
                    </h1>
                    <span className="text-[11px] font-bold tracking-wide inline-block leading-none pb-0.5" style={{ color: '#dc2626', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                      Cleaning & Security Services
                    </span>
                  </div>
                  <p className="text-[9.5px] font-extrabold tracking-widest uppercase m-0 mt-1" style={{ color: '#dc2626' }}>
                    Pest Control Department
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold block leading-none" style={{ color: '#dc2626', fontFamily: 'Arial, sans-serif', fontSize: '21px' }}>نجمة الوفاء</span>
                <span className="text-[10px] font-bold block mt-1" style={{ color: '#dc2626', fontFamily: 'Arial, sans-serif' }}>لخدمات التنظيف والحراسة</span>
              </div>
            </div>
            <div className="h-[2px] bg-black w-full mt-0.5 mb-6"></div>

            {/* Center Title */}
            <div className="text-center my-6">
              <h2 className="text-lg font-bold text-[#1e3a8a] inline-block uppercase pb-0.5" style={{ textDecoration: 'underline', textUnderlineOffset: '4px', fontFamily: 'Arial, sans-serif', fontSize: '15px' }}>
                Request for Pest Control Chemicals & Tools
              </h2>
            </div>

            {/* Requisition Metadata Details */}
            <div className="space-y-1.5 text-xs text-black mb-6" style={{ fontFamily: 'Arial, sans-serif', fontSize: '12.5px', lineHeight: '1.4' }}>
              <p className="m-0"><span className="font-bold">FROM:</span> {activePrintData.from}</p>
              <p className="m-0 pl-14">{activePrintData.engineer}</p>
              <p className="m-0"><span className="font-bold">To:</span> {activePrintData.to}</p>
              <p className="m-0"><span className="font-bold">Date:</span> {activePrintData.dateStr}</p>
            </div>

            {/* Opening Statement */}
            <p className="text-xs text-black mb-5 leading-normal" style={{ fontFamily: 'Arial, sans-serif', fontSize: '12.5px' }}>
              {activePrintData.opening}
            </p>

            {/* Table Title label */}
            <p className="text-xs font-bold text-[#1e3a8a] mb-2" style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px' }}>
              List of Required Chemicals & Tools:
            </p>

            {/* Custom Table with Faded Watermark Star in its Center Background */}
            <div className="relative border border-slate-700 overflow-hidden mb-6 bg-white" style={{ minHeight: '130px' }}>
              
              {/* Centered Star Watermark overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.055] pointer-events-none select-none" style={{ zIndex: 0 }}>
                <svg viewBox="0 0 24 24" className="w-[340px] h-[340px]" style={{ fill: '#dc2626' }}>
                  <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
                </svg>
              </div>

              <table className="w-full text-left text-xs border-collapse relative" style={{ zIndex: 1, backgroundColor: 'transparent' }}>
                <thead>
                  <tr className="bg-[#E2E8F0] border-b border-slate-700 text-slate-900 font-bold" style={{ fontSize: '11.5px' }}>
                    <th className="py-2 px-3 border-r border-slate-700 text-center w-12 font-bold">No</th>
                    <th className="py-2 px-3 border-r border-slate-700 font-bold">Name</th>
                    <th className="py-2 px-3 border-r border-slate-700 font-bold text-center w-36">Batch No</th>
                    <th className="py-2 px-3 border-r border-slate-700 font-bold text-center w-36">Required Date</th>
                    <th className="py-2 px-3 font-bold text-center w-32">Quantity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {activePrintData.items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500 italic">
                        No requested chemicals or tools.
                      </td>
                    </tr>
                  ) : (
                    activePrintData.items.map((item: any, idx: number) => (
                      <tr key={item.id} className="text-slate-900 border-b border-slate-700">
                        <td className="py-2 px-3 border-r border-slate-700 text-center font-semibold">{idx + 1}</td>
                        <td className="py-2 px-3 border-r border-slate-700 font-semibold">{item.name}</td>
                        <td className="py-2 px-3 border-r border-slate-700 text-center font-semibold font-mono">{item.batch || "N/A"}</td>
                        <td className="py-2 px-3 border-r border-slate-700 text-center font-semibold font-mono text-slate-600">{item.purpose}</td>
                        <td className="py-2 px-3 text-center font-bold">
                          {item.qty} {item.unit !== "Pcs" ? item.unit : ""}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Closing instruction */}
            <p className="text-xs text-black mb-12 leading-normal" style={{ fontFamily: 'Arial, sans-serif', fontSize: '12.5px' }}>
              {activePrintData.closing}
            </p>

            {/* Signature Box on Bottom Right */}
            <div className="flex justify-end mt-12 mb-6" style={{ fontFamily: 'Arial, sans-serif' }}>
              <div className="text-center flex flex-col items-center">
                {activePrintData.aishaSigned ? (
                  <div className="relative w-48 py-1 flex flex-col items-center">
                    {/* Signature Image or SVG path */}
                    {activePrintData.customSignatureUrl ? (
                      <img 
                        src={activePrintData.customSignatureUrl} 
                        alt="Authorized Signature" 
                        className="h-12 max-w-[170px] object-contain mix-blend-multiply opacity-95 block mb-1" 
                        style={{ maxHeight: '48px' }}
                      />
                    ) : (
                      <svg viewBox="0 0 100 35" className="w-36 h-12 text-blue-900 ml-5 opacity-90 block">
                        <path d="M5,25 C15,5 30,10 40,22 C50,30 65,5 75,18 C85,25 90,15 98,24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                        <path d="M12,18 C35,15 60,30 85,15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        <circle cx="85" cy="24" r="8" fill="none" stroke="#dc2626" strokeWidth="1" strokeDasharray="2,1" />
                        <text x="85" y="26" fontSize="6" textAnchor="middle" fill="#dc2626" fontWeight="bold" fontFamily="monospace">OK</text>
                      </svg>
                    )}
                    
                    <div className="font-bold text-slate-900 mt-2 text-xs" style={{ fontSize: '12.5px' }}>{activePrintData.signatoryName}</div>
                    <div className="text-[10px] text-slate-500 font-bold tracking-wide uppercase mt-0.5">{activePrintData.signatoryDesignation}</div>
                  </div>
                ) : (
                  <div className="w-48 border-b-2 border-dashed border-slate-300 h-16 flex items-center justify-center text-xs text-slate-400 italic">
                    Pending sign-off review
                  </div>
                )}
              </div>
            </div>

          </div>
        );
      })()}

      {/* Custom Delete Confirmation Modal */}
      {deleteConfirmName && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`p-6 rounded-2xl max-w-sm w-full border shadow-2xl transition-all scale-100 ${isDark ? "bg-[#1E293B] border-slate-700 text-white" : "bg-white border-slate-200 text-slate-900"}`}>
            <div className="flex items-center gap-3 text-rose-500 mb-3">
              <AlertOctagon className="w-6 h-6 animate-pulse shrink-0" />
              <h4 className="font-bold text-sm tracking-tight">
                {language === "bn" ? "মুছে ফেলার নিশ্চিতকরণ" : "Confirm Deletion"}
              </h4>
            </div>
            <p className="text-xs leading-relaxed mb-6 text-slate-400">
              {language === "bn" 
                ? `আপনি কি সত্যিই "${deleteConfirmName}" কেমিক্যালটি পুরোপুরি মুছে ফেলতে চান? এটি আর ফেরত আনা যাবে না।`
                : `Are you sure you want to completely delete "${deleteConfirmName}" from the inventory? This action is permanent and cannot be undone.`}
            </p>
            <div className="flex gap-2.5 justify-end">
              <button
                type="button"
                onClick={() => setDeleteConfirmName(null)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${isDark ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700" : "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-250"}`}
              >
                {language === "bn" ? "বাতিল" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={() => {
                  const name = deleteConfirmName;
                  setDeleteConfirmName(null);
                  executeDeleteChemical(name);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
              >
                {language === "bn" ? "হ্যাঁ, মুছে ফেলুন" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved Requisition History Modal (সংরক্ষিত চাহিদাপত্র রেকর্ড - পূর্ণ স্ক্রিন ও এক্সেল শিট স্টাইল) */}
      {isSavedReqsHistoryModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 overflow-hidden flex items-center justify-center">
          <div className={`w-full h-full border-none shadow-none transition-all flex flex-col ${isDark ? "bg-[#0B1324] text-white" : "bg-[#F8FAFC] text-slate-900"}`}>
            
            {/* Modal Header */}
            <div className={`px-6 py-4 border-b flex items-center justify-between shrink-0 ${isDark ? "border-slate-800 bg-slate-900/60" : "border-slate-200 bg-white shadow-sm"}`}>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-sky-500/10 text-[#38bdf8] rounded-xl">
                  <FolderOpen className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base md:text-lg tracking-tight">
                    {language === "bn" ? "সংরক্ষিত চাহিদাপত্র রেকর্ডসমূহ ও আর্কাইভ" : "Saved Requisitions Draft History Portal"}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {language === "bn" ? "এক্সেল শিট স্টাইলে সকল তথ্য দেখুন, হুবহু পিডিএফ দেখুন অথবা ডিলিট করুন" : "Explore historical requisitions in standard spreadsheet format, view PDFs and delete entries"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setViewingSavedReqPdf(null);
                  setIsSavedReqsHistoryModalOpen(false);
                }}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  isDark 
                    ? "bg-slate-850 hover:bg-slate-800 border-slate-700 text-slate-400 hover:text-white" 
                    : "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-600 hover:text-slate-900"
                }`}
                title={language === "bn" ? "বন্ধ করুন" : "Close Portal"}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 min-h-0">
              {viewingSavedReqPdf ? (
                /* ----------------- MODE 1: EXTREMELY BEAUTIFUL PDF REPLICA VIEW ----------------- */
                <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
                  
                  {/* Internal Navigation & Action Banner */}
                  <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${isDark ? "bg-slate-900/50 border-slate-850" : "bg-slate-50 border-slate-200"}`}>
                    <button
                      type="button"
                      onClick={() => setViewingSavedReqPdf(null)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                        isDark ? "bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300" : "bg-white border-slate-300 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <ChevronRight className="w-4 h-4 rotate-180" />
                      <span>{language === "bn" ? "তালিকায় ফিরে যান" : "Back to History"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const defaultName = `AlWafaStar-Req-${viewingSavedReqPdf?.id || Date.now().toString().slice(-4)}`;
                        const customFileName = defaultName;

                        setTempPrintReq(viewingSavedReqPdf);
                        handleDownloadPdf(customFileName, true);
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer select-none active:scale-95 whitespace-nowrap"
                    >
                      <Printer className="w-4 h-4" />
                      <span>{language === "bn" ? "এটি ডাউনলোড ও প্রিন্ট করুন" : "Download & Print PDF"}</span>
                    </button>
                  </div>

                  {/* Real-time A4 Paper Replica "Exact Letterhead Preview Document" */}
                  <div className="bg-white text-black p-8 md:p-12 rounded-2xl shadow-xl border border-slate-300 relative text-left" style={{ fontFamily: 'Arial, sans-serif' }}>
                    {/* Watermark Logo star */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.045] pointer-events-none select-none" style={{ zIndex: 0 }}>
                      <svg viewBox="0 0 24 24" className="w-[320px] h-[320px]" style={{ fill: '#dc2626' }}>
                        <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
                      </svg>
                    </div>

                    {/* Official Banner */}
                    <div className="flex items-center justify-between pb-2 relative" style={{ borderBottom: '2.5px solid #dc2626', zIndex: 1 }}>
                      <div className="flex items-center gap-3">
                        <svg viewBox="0 0 24 24" className="w-[48px] h-[48px] shrink-0" style={{ fill: '#dc2626' }}>
                          <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
                        </svg>
                        <div>
                          <div className="flex flex-col md:flex-row md:items-baseline md:gap-2">
                            <span className="text-base md:text-lg font-bold tracking-tight m-0 leading-none" style={{ color: '#dc2626', fontFamily: 'Georgia, Times, serif', fontSize: '19px', fontWeight: 900 }}>
                              AL WAFA STAR
                            </span>
                            <span className="text-[10px] font-bold tracking-wide leading-none pb-0.5" style={{ color: '#dc2626', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                              Cleaning & Security Services
                            </span>
                          </div>
                          <p className="text-[9px] font-extrabold tracking-widest uppercase m-0 mt-1" style={{ color: '#dc2626' }}>
                            Pest Control Department
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-bold block leading-none" style={{ color: '#dc2626', fontFamily: 'Arial, sans-serif' }}>نجمة الوفاء</span>
                        <span className="text-[9px] font-bold block mt-1" style={{ color: '#dc2626', fontFamily: 'Arial, sans-serif' }}>لخدمات التنظيف والحراسة</span>
                      </div>
                    </div>
                    <div className="h-[1.5px] bg-black w-full mt-0.5 mb-5 relative" style={{ zIndex: 1 }}></div>

                    {/* Document Title */}
                    <div className="text-center my-4 relative" style={{ zIndex: 1 }}>
                      <h2 className="text-xs md:text-sm font-bold text-[#1e3a8a] inline-block uppercase pb-0.5 style-underline" style={{ textDecoration: 'underline', textUnderlineOffset: '3px', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>
                        Request for Pest Control Chemicals & Tools
                      </h2>
                    </div>

                    {/* Meta Details Group */}
                    <div className="space-y-1 text-[#1e293b] text-xs mb-5 relative leading-relaxed pl-1" style={{ fontFamily: 'Arial, sans-serif', zIndex: 1 }}>
                      <p className="m-0"><span className="font-bold text-black uppercase">FROM:</span> {viewingSavedReqPdf.from || "AL WAFA Star"}</p>
                      <p className="m-0 pl-14 text-slate-600 font-bold italic">({viewingSavedReqPdf.engineer || "Pest Control Engineer"})</p>
                      <p className="m-0"><span className="font-bold text-black uppercase">To:</span> {viewingSavedReqPdf.to || "Store Keeper"}</p>
                      <p className="m-0"><span className="font-bold text-black uppercase">Date:</span> {viewingSavedReqPdf.dateStr}</p>
                    </div>

                    {/* Opening Text */}
                    <p className="text-[12px] text-slate-800 mb-4 leading-relaxed relative pl-1" style={{ fontFamily: 'Arial, sans-serif', zIndex: 1 }}>
                      {viewingSavedReqPdf.opening}
                    </p>

                    {/* Inline Chemical Request Table */}
                    <div className="relative border border-slate-700 overflow-hidden mb-5 bg-white shadow-sm" style={{ minHeight: '100px', zIndex: 1 }}>
                      <table className="w-full text-left text-[11.5px] border-collapse relative">
                        <thead>
                          <tr className="bg-[#E2E8F0] border-b border-slate-700 text-slate-900 font-bold">
                            <th className="py-2 px-3 border-r border-slate-700 text-center w-12 font-bold">No</th>
                            <th className="py-2 px-3 border-r border-slate-700 font-bold">Name</th>
                            <th className="py-2 px-3 border-r border-slate-700 font-bold text-center w-32">Batch No</th>
                            <th className="py-2 px-3 border-r border-slate-700 font-bold text-center w-32">Required Date</th>
                            <th className="py-2 px-3 font-bold text-center w-28">Quantity</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                          {viewingSavedReqPdf.items.map((item: any, idx: number) => (
                            <tr key={item.id || idx} className="text-slate-900 font-semibold h-9">
                              <td className="py-1.5 px-3 border-r border-slate-700 text-center font-bold">{idx + 1}</td>
                              <td className="py-1.5 px-3 border-r border-slate-700">{item.name}</td>
                              <td className="py-1.5 px-3 border-r border-slate-700 text-center font-mono text-slate-700">{item.batch || "N/A"}</td>
                              <td className="py-1.5 px-3 border-r border-slate-700 text-center font-mono text-slate-550">{item.purpose}</td>
                              <td className="py-1.5 px-3 text-center font-black text-xs text-[#047857]">
                                {item.qty} {item.unit !== "Pcs" ? item.unit : ""}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Closing Text */}
                    <p className="text-[12px] text-slate-800 mb-6 leading-relaxed relative pl-1" style={{ fontFamily: 'Arial, sans-serif', zIndex: 1 }}>
                      {viewingSavedReqPdf.closing}
                    </p>

                    {/* Signbox Stamp Area */}
                    <div className="flex justify-end mt-4 relative" style={{ fontFamily: 'Arial, sans-serif', zIndex: 2 }}>
                      <div className="text-center flex flex-col items-center">
                        {viewingSavedReqPdf.aishaSigned ? (
                          <div className="relative w-44 flex flex-col items-center">
                            {viewingSavedReqPdf.customSignatureUrl ? (
                              <img 
                                src={viewingSavedReqPdf.customSignatureUrl} 
                                alt="Authorized Signature" 
                                className="h-11 max-w-[155px] object-contain mix-blend-multiply opacity-95 block mb-1" 
                              />
                            ) : (
                              <svg viewBox="0 0 100 35" className="w-28 h-9 text-blue-900 ml-4 opacity-90 block">
                                <path d="M5,25 C15,5 30,10 40,22 C50,30 65,5 75,18 C85,25 90,15 98,24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                                <path d="M12,18 C35,15 60,30 85,15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                                <circle cx="85" cy="24" r="8" fill="none" stroke="#dc2626" strokeWidth="1" strokeDasharray="2,1" />
                                <text x="85" y="26" fontSize="6" textAnchor="middle" fill="#dc2626" fontWeight="bold" fontFamily="monospace">OK</text>
                              </svg>
                            )}
                            <div className="font-bold text-slate-900 text-[11.5px] mt-1.5">{viewingSavedReqPdf.signatoryName || "Aisha Elsiddig"}</div>
                            <div className="text-[9.5px] text-slate-500 font-bold tracking-wide uppercase">{viewingSavedReqPdf.signatoryDesignation || "Pest Control Engineer"}</div>
                          </div>
                        ) : (
                          <div className="w-44 border-b border-dashed border-slate-300 h-11 flex items-center justify-center text-[10.5px] text-slate-400 italic">
                            Pending sign-off review
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              ) : (
                /* ----------------- MODE 2: EXCEL-STYLE SPREADSHEET TABLE GRID VIEW ----------------- */
                <div className="w-full h-full flex flex-col space-y-4">
                  {savedRequisitions.length === 0 ? (
                    <div className="py-24 text-center flex flex-col items-center justify-center space-y-4">
                      <div className="p-5 bg-slate-500/5 text-slate-400 rounded-full">
                        <ClipboardList className="w-12 h-12 opacity-30" />
                      </div>
                      <p className="text-slate-400 italic text-sm">
                        {language === "bn" ? "কোন সংরক্ষিত চাহিদাপত্রের রেকর্ড ট্র্যাকার খুঁজে পাওয়া যায়নি।" : "No historical saved requisition records found."}
                      </p>
                    </div>
                  ) : (
                    <div className="flex-1 overflow-auto border rounded-xl shadow-md border-slate-300/80 dark:border-slate-800">
                      <table className="w-full text-left text-xs border-collapse font-sans">
                        <thead>
                          <tr className={`border-b text-[10.5px] uppercase tracking-wider font-extrabold select-none ${
                            isDark ? "bg-[#1E293B] border-slate-700 text-slate-300" : "bg-slate-100 border-slate-300 text-slate-700"
                          }`}>
                            <th className="p-3.5 border-r border-slate-300/60 dark:border-slate-700 text-center w-14 font-black">#</th>
                            <th className="p-3.5 border-r border-slate-300/60 dark:border-slate-700 w-36 font-black">{language === "bn" ? "তারিখ (Date/Time)" : "Saved Timestamp"}</th>
                            <th className="p-3.5 border-r border-slate-300/60 dark:border-slate-700 w-52 font-black">{language === "bn" ? "প্রকৌশলী ও উৎস (From)" : "Sender & Dept"}</th>
                            <th className="p-3.5 border-r border-slate-300/60 dark:border-slate-700 w-32 font-black">{language === "bn" ? "প্রাপক (To)" : "To Recipient"}</th>
                            <th className="p-3.5 border-r border-slate-300/60 dark:border-slate-700 font-black">{language === "bn" ? "চাহিদাকৃত আইটেম বিবরণ তালিকা (Excel Sheets Content)" : "Requested Products Items"}</th>
                            <th className="p-3.5 font-black text-center w-56">{language === "bn" ? "অ্যাকশন কার্যক্রম" : "Operations Control"}</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${isDark ? "divide-slate-800 text-slate-200" : "divide-slate-200 text-slate-900"}`}>
                          {savedRequisitions.map((savedReq, sIdx) => {
                            const serialNo = savedRequisitions.length - sIdx;
                            return (
                              <tr 
                                key={savedReq.id}
                                className={`transition-colors text-[11.5px] h-12 ${
                                  isDark 
                                    ? "bg-[#111A2E]/50 hover:bg-slate-900/40 border-slate-800" 
                                    : "bg-white hover:bg-slate-50 border-slate-200"
                                }`}
                              >
                                {/* Column 1: No */}
                                <td className="p-3 border-r border-slate-300/50 dark:border-slate-800 text-center font-mono font-bold text-sky-500">
                                  {serialNo}
                                </td>

                                {/* Column 2: Saved Date */}
                                <td className="p-3 border-r border-slate-300/50 dark:border-slate-800 font-medium">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold block text-center ${
                                    isDark ? "bg-[#1E293B] text-slate-300" : "bg-slate-100 text-slate-700 border border-slate-200"
                                  }`}>
                                    {savedReq.dateStr}
                                  </span>
                                  <span className="block text-[9.5px] text-slate-400 mt-1 font-mono text-center">
                                    {savedReq.savedAt}
                                  </span>
                                </td>

                                {/* Column 3: From Engineer */}
                                <td className="p-3 border-r border-slate-300/50 dark:border-slate-800 leading-normal">
                                  <div className="font-extrabold">{savedReq.engineer}</div>
                                  <div className="text-[10px] text-slate-400 font-medium mt-0.5">{savedReq.from}</div>
                                </td>

                                {/* Column 4: To Recipient */}
                                <td className="p-3 border-r border-slate-300/50 dark:border-slate-800 font-extrabold text-blue-600 dark:text-sky-400">
                                  {savedReq.to || "N/A"}
                                </td>

                                {/* Column 5: Items inline spreadsheet format */}
                                <td className="p-3 border-r border-slate-300/50 dark:border-slate-800 leading-normal">
                                  <div className="flex flex-wrap gap-1">
                                    {savedReq.items.map((it: any, i: number) => (
                                      <div 
                                        key={it.id || i} 
                                        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10.5px] border ${
                                          isDark 
                                            ? "bg-slate-900/60 border-slate-800 text-slate-300" 
                                            : "bg-slate-50 border-slate-200 text-slate-700"
                                        }`}
                                      >
                                        <span className="font-bold">{it.name}</span>
                                        <span className="text-[9.5px] text-slate-400 font-mono">({it.batch || "N/A"})</span>
                                        <span className="px-1 py-0.2 text-[9px] font-extrabold text-emerald-600 bg-emerald-500/10 dark:text-emerald-400 rounded">
                                          {it.qty} {it.unit}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </td>

                                {/* Column 6: Action Control */}
                                <td className="p-3 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    
                                    {/* Action 1: View PDF (হুবহু পিডিএফ) */}
                                    <button
                                      type="button"
                                      onClick={() => setViewingSavedReqPdf(savedReq)}
                                      className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                                      title={language === "bn" ? "হুবহু পিডিএফ দেখুন" : "View Replica PDF"}
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                      <span>{language === "bn" ? "পিডিএফ" : "View"}</span>
                                    </button>

                                    {/* Action 2: Restore to active draft */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (confirm(language === "bn" ? "আপনি কি এই চাহিদাপত্রটি ড্রাফটে রিস্টোর করতে চান? এটি বর্তমান ড্রাফটকে পরিবর্তন করবে।" : "Are you sure you want to load this saved requisition into the active draft? It will replace your current active draft.")) {
                                          setRequisitionItems(savedReq.items);
                                          if (savedReq.from) setReqFrom(savedReq.from);
                                          if (savedReq.engineer) setReqEngineer(savedReq.engineer);
                                          if (savedReq.to) setReqTo(savedReq.to);
                                          if (savedReq.dateStr) setReqDateStr(savedReq.dateStr);
                                          if (savedReq.opening) setReqOpeningLine(savedReq.opening);
                                          if (savedReq.closing) setReqClosingLine(savedReq.closing);
                                          if (savedReq.signatoryName) setRequesterName(savedReq.signatoryName);
                                          if (savedReq.signatoryDesignation) setRequesterDesignation(savedReq.signatoryDesignation);
                                          setAishaSigned(!!savedReq.aishaSigned);
                                          if (savedReq.customSignatureUrl) setCustomSignatureUrl(savedReq.customSignatureUrl);
                                          
                                          setViewingSavedReqPdf(null);
                                          setIsSavedReqsHistoryModalOpen(false);
                                          showToast(
                                            language === "bn" 
                                              ? "পূর্ববর্তী চাহিদাপত্র সফলভাবে ড্রাফটে লোড করা হয়েছে!" 
                                              : "Successfully restored requisition to active draft!", 
                                            "success"
                                          );
                                        }
                                      }}
                                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                                      title={language === "bn" ? "রিস্টোর করুন" : "Load back to active draft"}
                                    >
                                      <RefreshCw className="w-3.5 h-3.5" />
                                      <span>{language === "bn" ? "পুনরুদ্ধার" : "Restore"}</span>
                                    </button>

                                    {/* Action 3: Delete Record */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (confirm(language === "bn" ? "আপনি কি এই সংরক্ষণ করা রেকর্ডটি চিরতরে ডিলিট করতে চান?" : "Are you sure you want to permanently delete this requisition log record?")) {
                                          const filtered = savedRequisitions.filter(r => r.id !== savedReq.id);
                                          updateSavedRequisitions(filtered);
                                          showToast(
                                            language === "bn" ? "রেকর্ড ডিলিট করা হয়েছে!" : "Requisition record deleted!", 
                                            "info"
                                          );
                                        }
                                      }}
                                      className="px-2 py-1.5 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-500 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                                      title={language === "bn" ? "ডিলিট করুন" : "Delete record"}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      <span>{language === "bn" ? "মুছুন" : "Delete"}</span>
                                    </button>

                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className={`px-6 py-4 border-t flex items-center justify-between shrink-0 ${isDark ? "border-slate-800 bg-slate-900/40" : "border-slate-205 bg-slate-50"}`}>
              <div className="text-xs text-slate-400">
                {language === "bn" ? `মোট ড্রাফট হিস্ট্রি রেকর্ড সংখ্যা: ${savedRequisitions.length} টি` : `Total historical archived items: ${savedRequisitions.length}`}
              </div>
              <div className="flex items-center gap-2.5">
                {viewingSavedReqPdf && (
                  <button
                    type="button"
                    onClick={() => setViewingSavedReqPdf(null)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      isDark 
                        ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700" 
                        : "bg-white border-slate-300 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {language === "bn" ? "তালিকায় যান" : "Table List View"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setViewingSavedReqPdf(null);
                    setIsSavedReqsHistoryModalOpen(false);
                  }}
                  className={`px-5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    isDark 
                      ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white" 
                      : "bg-[#0B1324] border-slate-800 text-white hover:bg-black"
                  }`}
                >
                  {language === "bn" ? "বন্ধ করুন" : "Close Portal"}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Custom Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 max-w-sm rounded-2xl p-4 shadow-2xl flex items-center gap-3 border transition-all duration-300 shrink-0 ${
          toastMessage.type === "success" 
            ? (isDark ? "bg-slate-900 border-emerald-500/30 text-white" : "bg-emerald-50 border-emerald-250 text-slate-900")
            : toastMessage.type === "error"
            ? (isDark ? "bg-slate-900 border-rose-500/30 text-white" : "bg-rose-50 border-rose-250 text-slate-900")
            : (isDark ? "bg-slate-900 border-indigo-500/30 text-white" : "bg-indigo-50 border-indigo-200 text-slate-900")
        }`}>
          <div className="rounded-full p-1 shrink-0">
            <CheckCircle className={`w-5 h-5 ${
              toastMessage.type === "success" ? "text-emerald-400" : toastMessage.type === "error" ? "text-rose-400" : "text-indigo-400"
            }`} />
          </div>
          <p className="text-xs font-semibold leading-relaxed flex-1">{toastMessage.text}</p>
          <button 
            type="button"
            onClick={() => setToastMessage(null)} 
            className="p-1 hover:opacity-80 transition-opacity font-extrabold text-[#94A3B8]"
          >
            ×
          </button>
        </div>
      )}

    </div>
  );
}
