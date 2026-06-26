import { useState } from "react";
import { ReportItem, SupervisorRegistryItem } from "../types";
import AlWafaLogo from "./AlWafaLogo";
import { deleteDocument } from "../localDatabase";
import { 
  CheckCircle2, 
  Search, 
  X, 
  Printer, 
  DollarSign,
  Briefcase,
  MapPin,
  Clock,
  ExternalLink
} from "lucide-react";
import { generateReportHTML, generateEngineeringHTML } from "./ClientDirectory";

const formatFacilityType = (type: string, lang: "en" | "ar" | "bn") => {
  if (!type) return "";
  if (type === "Completed") {
    return lang === "bn" ? "কমপ্লিট" : "Completed";
  }
  if (type === "Partially Completed" || type === "In Progress") {
    return lang === "bn" ? "অর্ধেক করা হয়েছে" : "Partially Completed";
  }
  if (type === "Incomplete" || type === "Not Started") {
    return lang === "bn" ? "কমপ্লিট হয়নি" : "Incomplete";
  }
  return type;
};

const parseAreaString = (str: string) => {
  const qtyMarker = " (Qty: ";
  const markerIdx = str.lastIndexOf(qtyMarker);
  if (markerIdx === -1) {
    // Support free-form separators like " - " or ":"
    const dashParts = str.split(/\s+-\s+/);
    if (dashParts.length >= 3) {
      return { 
        areaName: dashParts[0].trim(), 
        qty: dashParts[1].trim(), 
        details: dashParts.slice(2).join(" - ").trim() 
      };
    } else if (dashParts.length === 2) {
      const rest = dashParts[1].trim();
      if (/^\d+$/.test(rest)) {
        return { areaName: dashParts[0].trim(), qty: rest, details: "" };
      }
      return { areaName: dashParts[0].trim(), qty: "1", details: rest };
    }

    const colonParts = str.split(/\s*:\s*/);
    if (colonParts.length >= 2) {
      return { 
        areaName: colonParts[0].trim(), 
        qty: "1", 
        details: colonParts.slice(1).join(": ").trim() 
      };
    }

    return { areaName: str, qty: "1", details: "" };
  }
  const areaName = str.substring(0, markerIdx).trim();
  let remaining = str.substring(markerIdx + qtyMarker.length);
  if (remaining.endsWith(")")) {
    remaining = remaining.substring(0, remaining.length - 1);
  }
  const splitIdx = remaining.indexOf(" - ");
  if (splitIdx === -1) {
    return { areaName, qty: remaining.trim(), details: "" };
  } else {
    return {
      areaName,
      qty: remaining.substring(0, splitIdx).trim(),
      details: remaining.substring(splitIdx + 3).trim()
    };
  }
};

interface CompletedRegistryProps {
  reports: ReportItem[];
  language: "en" | "ar" | "bn";
  setTab: (tab: string) => void;
  onSelectReport: (report: ReportItem) => void;
  onUpdateReports?: (reports: ReportItem[]) => void;
  onEditReport?: (report: ReportItem) => void;
  supervisors?: SupervisorRegistryItem[];
}

export default function CompletedRegistry({
  reports,
  language,
  setTab,
  onSelectReport,
  onUpdateReports,
  onEditReport,
  supervisors = []
}: CompletedRegistryProps) {
  const [completedSearch, setCompletedSearch] = useState("");
  const [emirateFilter, setEmirateFilter] = useState("All");
  const [activeReportDetails, setActiveReportDetails] = useState<ReportItem | null>(null);
  const [deleteConfirmReport, setDeleteConfirmReport] = useState<ReportItem | null>(null);
  const [simulatedPrint, setSimulatedPrint] = useState(false);

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmReport) return;
    const targetId = deleteConfirmReport.id;

    // 1. Instantly update local state and storage for immediate feedback
    const remaining = reports.filter(r => r.id !== targetId);
    if (onUpdateReports) {
      onUpdateReports(remaining);
    }
    setDeleteConfirmReport(null);

    // 2. Perform background delete Firestore call
    try {
      if (targetId) {
        await deleteDocument("serviceReports", targetId);
      }
    } catch (e: any) {
      console.error("Error during Firestore delete in background:", e);
    }
  };

  const t = {
    en: {
      title: "Completed Services",
      subtitle: "Review and access live logs of successfully completed health safety operations across U.A.E.",
      logId: "LOG ID",
      facility: "MEDICAL FACILITY",
      dateTime: "DATE & TIME",
      technician: "TECHNICIAN",
      paymentStatus: "BILLING CASH STATUS",
      action: "ACTIONS",
      allEmirates: "All Emirates",
      searchPlaceholder: "Search completed services...",
      noMatched: "No completed services matching the filters.",
      viewPdf: "View & PDF",
      edit: "Edit",
      delete: "Delete",
      complimentary: "Complimentary Service",
      invoiceNo: "INVOICE SERIAL NO:",
      subtotal: "SUBTOTAL AMOUNT:",
      tax: "TAX (5.0% UAE VAT):",
      total: "TOTAL CASH CHARGED:",
      notes: "FIELD TREATMENT CLINICAL PROTOCOL NOTES:",
      advisories: "OPERATIONAL COMPLIANCE ADVISORIES TO PREVENT INFESTATION:"
    },
    bn: {
      title: "কমপ্লিট সার্ভিস",
      subtitle: "সরাসরি সিস্টেম ডাটাবেসে সফলভাবে রেজিস্টার হওয়া সমস্ত সম্পন্ন চিকিৎসা ও পেস্ট কন্ট্রোল কাজের খতিয়ান রিপোর্ট ভিউয়ার পরিধি।",
      logId: "লগ আইডি",
      facility: "সেন্টার / হসপিটাল",
      dateTime: "তারিখ ও সময়",
      technician: "টেকনিশিয়ান",
      paymentStatus: "পেমেন্ট অবস্থা",
      action: "অ্যাকশন",
      allEmirates: "সব এমিরেট",
      searchPlaceholder: "সেন্টার বা টিকিট নম্বর...",
      noMatched: "কোন মেলানো সম্পন্ন রিপোর্ট পাওয়া যায়নি",
      viewPdf: "দেখুন ও প্রিন্ট",
      edit: "এডিট",
      delete: "ডিলিট",
      complimentary: "বিনামূল্যে সার্ভিস",
      invoiceNo: "ইনভয়েস নম্বর:",
      subtotal: "সাবটোটাল পরিমাণ:",
      tax: "কর (৫% ইউএই ভ্যাট):",
      total: "সর্বমোট টাকা:",
      notes: "কাজের বিবরণী ও ট্রিটমেন্ট রিপোর্ট সম্বলিত খসড়া:",
      advisories: "পোকামাকড় ও ব্যাকটেরিয়া মুক্ত রাখতে উপদেশসমূহ:"
    },
    ar: {
      title: "الخدمات المنجزة",
      subtitle: "استعراض والوصول إلى سجل الكشوف والتقارير الطبية المسجلة للعمليات المنتهية بنجاح في الإمارة والدولة.",
      logId: "معرف السجل",
      facility: "المرفق الطبي",
      dateTime: "التاريخ والوقت",
      technician: "الفني المختص",
      paymentStatus: "حالة الفاتورة والتحصيل",
      action: "إجراءات",
      allEmirates: "جميع الإمارات",
      searchPlaceholder: "البحث في الخدمات المكتملة...",
      noMatched: "لا توجد خدمات مكتملة تطابق معايير التصفية.",
      viewPdf: "عرض وتحميل PDF",
      edit: "تعديل",
      delete: "حذف",
      complimentary: "خدمة مجانية",
      invoiceNo: "رقم الفاتورة:",
      subtotal: "المبلغ الفرعي:",
      tax: "الضريبة المضافة (5.0٪):",
      total: "المجموع الكلي المعتمد:",
      notes: "ملاحظات وتفاصيل المعالجة الميدانية للمرفق المعتمد:",
      advisories: "التوصيات التشغيلية والوقائية لمنع انتشار الآفات:"
    }
  }[language];

  // Helper filter completed items (excluding past months to archive them)
  const completedReports = reports.filter(r => {
    const isCompleted = r.workStatus === "Completed" || !r.workStatus;
    if (!isCompleted) return false;

    if (!r.dateOfOperation) return true;
    try {
      const match = r.dateOfOperation.trim().match(/^(\d{4})-(\d{2})-\d{2}/);
      const now = new Date();
      if (match) {
        const year = parseInt(match[1], 10);
        const month = parseInt(match[2], 10) - 1; // 0-indexed
        return year === now.getFullYear() && month === now.getMonth();
      }
      const parsedDate = new Date(r.dateOfOperation);
      if (isNaN(parsedDate.getTime())) return true;
      return parsedDate.getFullYear() === now.getFullYear() && parsedDate.getMonth() === now.getMonth();
    } catch (e) {
      return true;
    }
  });
  
  const filteredCompletedReports = completedReports.filter(r => {
    const matchesSearch = r.facilityName?.toLowerCase().includes(completedSearch.toLowerCase()) || 
                          r.ticketNo?.toLowerCase().includes(completedSearch.toLowerCase()) ||
                          r.id?.toLowerCase().includes(completedSearch.toLowerCase());
    const matchesEmirate = emirateFilter === "All" || r.emirate === emirateFilter;
    return matchesSearch && matchesEmirate;
  });

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleDownloadPDF = async () => {
    if (!activeReportDetails) return;

    const defaultName = `AlWafaStar-Report-${activeReportDetails.ticketNo || activeReportDetails.id}`;
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
  };

  const triggerPrintDoc = (customFileName?: string) => {
    setSimulatedPrint(true);
    document.body.classList.add("pdf-download-active");
    
    const originalTitle = document.title;
    if (customFileName) document.title = customFileName;

    setTimeout(() => {
      window.focus();
      window.print();
      
      setTimeout(() => {
        document.body.classList.remove("pdf-download-active");
        if (customFileName) document.title = originalTitle;
        setSimulatedPrint(false);
      }, 500);
    }, 500);
  };

  return (
    <div id="erp-completed-services-view" className="space-y-6 pb-16 font-sans">
      
      {/* Visual Title Banner Row */}
      <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fadeIn">
        <div className="space-y-1">
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-7 h-7 text-emerald-500 animate-pulse" />
            <span>{t.title}</span>
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl font-medium">
            {t.subtitle}
          </p>
        </div>
        <div className="shrink-0">
          <span className="text-xs bg-[#10B981]/15 text-[#10B981] font-extrabold px-3 py-1.5 rounded-full border border-emerald-500/20 shadow-xs flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full inline-block animate-pulse" />
            <span>{completedReports.length} {language === "bn" ? "টি সম্পন্ন সার্ভিস" : "Operations Completed"}</span>
          </span>
        </div>
      </div>

      {/* Main Ledger Section mirroring Dashboard */}
      <div className="bg-white border border-slate-200/95 rounded-2xl shadow-sm overflow-hidden animate-fadeIn">
        <div className="p-5 md:p-6 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>{language === "bn" ? "সম্পন্ন হওয়া সার্ভিসসমূহের তালিকা" : "Completed Services Ledger"}</span>
            </h2>
            <p className="text-[11px] text-slate-500 font-medium">
              {language === "bn" ? "সিস্টেম ডাটাবেসে সফলভাবে সাবমিট ও রেজিস্টার হওয়া চিকিৎসার রেকর্ড।" : "Live list of processed operations saved securely inside central medical logbook."}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Emirate filter */}
            <select
              value={emirateFilter}
              onChange={(e) => setEmirateFilter(e.target.value)}
              className="bg-white border border-slate-350 text-slate-800 text-[11px] font-bold px-2 py-1.5 rounded-lg outline-none cursor-pointer focus:border-indigo-500"
            >
              <option value="All">{t.allEmirates}</option>
              {["Ajman", "Dubai", "Sharjah", "Umm Al Quwain", "Ras Al Khaimah", "Fujairah"].map(em => (
                <option key={em} value={em}>{em}</option>
              ))}
            </select>

            {/* Keyword Search */}
            <div className="relative w-full sm:w-48 text-xs">
              <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                value={completedSearch}
                onChange={(e) => setCompletedSearch(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full bg-white text-slate-800 text-[11px] pl-8 pr-2 py-1.5 border border-slate-350 rounded-lg outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Completed Table */}
        <div className="overflow-x-auto">
          {filteredCompletedReports.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <span className="text-3xl block">📁</span>
              <p className="text-[11px] font-bold">
                {t.noMatched}
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-mono tracking-wider text-[9px] select-none">
                  <th className="py-3 px-4 font-black">{t.logId}</th>
                  <th className="py-3 px-4 font-black">{t.facility}</th>
                  <th className="py-3 px-4 font-black">{t.dateTime}</th>
                  <th className="py-3 px-4 font-black">{t.paymentStatus}</th>
                  <th className="py-3 px-4 font-black text-center">{t.action}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredCompletedReports.map((report, idx) => {
                  const isFree = !report.billing?.amount || 
                                 report.billing?.amount === 0 || 
                                 String(report.billing?.amount).toLowerCase().trim() === "no charge" ||
                                 String(report.billing?.amount).trim() === "" ||
                                 String(report.billing?.amount).trim() === "No";

                  return (
                    <tr key={`${report.id}-${idx}`} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 text-slate-550 font-mono text-[10.5px] font-bold">
                        {report.id}
                      </td>
                      <td className="py-3 px-4 text-slate-900">
                        <span className="font-extrabold text-[12px] block">{report.facilityName}</span>
                        <span className="text-[10px] text-slate-400 block">{report.emirate} • {formatFacilityType(report.facilityType, language)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-slate-700 block font-bold">{report.dateOfOperation}</span>
                        <span className="text-[10px] text-slate-400 block font-mono">{report.startTime} - {report.endTime}</span>
                      </td>
                      <td className="py-3 px-4">
                        {isFree ? (
                          <span className="text-[9.5px] bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded font-bold uppercase">
                            {t.complimentary}
                          </span>
                        ) : (
                          <div className="space-y-0.5">
                            <span className="text-emerald-700 font-extrabold bg-emerald-50 text-[11px] px-2 py-0.5 rounded border border-emerald-100 inline-block font-mono">
                              {report.billing?.amount} AED
                            </span>
                            <span className="text-[9px] text-slate-400 block font-bold uppercase pl-1">
                              • Paid ({report.billing?.method || "Cash"})
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex justify-center items-center gap-1.5 whitespace-nowrap">
                          {/* EDIT BUTTON - LEFT */}
                          <button
                            onClick={() => {
                              if (onEditReport) {
                                onEditReport(report);
                              }
                            }}
                            className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 hover:text-amber-800 font-extrabold rounded-lg text-[10.5px] inline-flex items-center gap-1 cursor-pointer transition active:scale-95 shadow-xs"
                            title={t.edit}
                          >
                            📝 <span>{t.edit}</span>
                          </button>

                          {/* VIEW BUTTON - MIDDLE */}
                          <button
                            onClick={() => setActiveReportDetails(report)}
                            className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 hover:text-indigo-800 font-extrabold rounded-lg text-[10.5px] inline-flex items-center gap-1 cursor-pointer transition active:scale-95 shadow-xs"
                            title={t.viewPdf}
                          >
                            👁️ <span>{t.viewPdf}</span>
                          </button>

                          {/* DELETE BUTTON - RIGHT */}
                          <button
                            onClick={() => setDeleteConfirmReport(report)}
                            className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 hover:text-rose-800 border border-rose-200 font-extrabold rounded-lg text-[10.5px] inline-flex items-center gap-1 cursor-pointer transition active:scale-95 shadow-xs"
                            title={t.delete}
                          >
                            🗑️ <span>{t.delete}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL OVERLAY */}
      {deleteConfirmReport && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs transition-all animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 max-w-sm w-full p-6 rounded-2xl shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center gap-3 text-rose-500">
              <span className="text-2xl">⚠️</span>
              <h3 className="text-md font-bold uppercase tracking-wide">
                {language === "bn" ? "রিপোর্ট ডিলিট নিশ্চিতকরণ" : language === "ar" ? "تأكيد حذف التقرير" : "Confirm Delete Action"}
              </h3>
            </div>
            
            <p className="text-xs leading-relaxed text-slate-300">
              {language === "bn" 
                ? "আপনি কি নিশ্চিতভাবে এই চিকিৎসা রিপোর্টটি ডিলিট করতে চান? এই কাজ করার পর ডাটাবেস থেকে এটি স্থায়ীভাবে মুছে যাবে এবং পুনরুদ্ধার করা সম্ভব হবে না।" 
                : language === "ar"
                ? "هل أنت متأكد تمامًا من رغبتك في حذف هذا الملف العلاجي الهام نهائيًا؟ لن يكون بمقدورك استعادة السجل لاحقًا."
                : "Are you absolutely sure you want to permanently delete this operational report? Once deleted, this dataset cannot be recovered."}
            </p>

            <div className="bg-slate-955 bg-black/40 p-3 rounded-xl border border-slate-800 text-[11px] font-medium space-y-1">
              <div>
                <span className="text-slate-500 uppercase tracking-wider font-mono">ID:</span>{" "}
                <b className="text-slate-200 font-mono font-bold">{deleteConfirmReport.id}</b>
              </div>
              <div className="truncate">
                <span className="text-slate-500 uppercase tracking-wider font-mono">FACILITY:</span>{" "}
                <b className="text-slate-200 font-bold">{deleteConfirmReport.facilityName}</b>
              </div>
              <div>
                <span className="text-slate-500 uppercase tracking-wider font-mono">DATE:</span>{" "}
                <b className="text-slate-200 font-bold">{deleteConfirmReport.dateOfOperation}</b>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => setDeleteConfirmReport(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
              >
                {language === "bn" ? "বাতিল" : language === "ar" ? "إلغاء الأمر" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-rose-650 hover:bg-rose-700 text-white rounded-xl transition cursor-pointer shadow-lg shadow-rose-500/10 font-bold"
              >
                {language === "bn" ? "ডিলিট করুন" : language === "ar" ? "تأكيد الحذف الكلي" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMPREHENSIVE VIEW & PRINT MODAL OVERLAY */}
      {activeReportDetails && (
        <div id="erp-completed-details-overlay" className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs transition-all animate-fadeIn">
          
          <div className="bg-[#FFFDF3] border-2 border-slate-900 max-w-4xl w-full h-[90vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl relative text-slate-900 font-sans border-t-8 border-t-indigo-650">
            
            {/* Header Tools (Hidden in Print) */}
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center no-print shrink-0">
              <div className="flex items-center gap-1">
                <span className="text-rose-550 text-xs">●</span>
                <span className="text-xs font-black tracking-widest font-mono text-slate-300">
                  {language === "bn" ? "অপারেশন প্রুফ ভিউয়ার" : "AL WAFA STAR PDF COMPLIANCE GATEWAY"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPDF}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 text-white font-black rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition duration-150 shadow"
                >
                  <span className="text-sm">📥</span>
                  <span>
                    {isGeneratingPDF
                      ? (language === "bn" ? "PDF তৈরি হচ্ছে..." : "Generating PDF...")
                      : (language === "bn" ? "সরাসরি PDF ডাউনলোড" : "Download PDF")}
                  </span>
                </button>

                <button
                  onClick={triggerPrintDoc}
                  disabled={simulatedPrint}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition duration-150 shadow border border-slate-700"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{simulatedPrint ? (language === "bn" ? "প্রিন্ট হচ্ছে..." : "Printing...") : (language === "bn" ? "ব্রাউজার প্রিন্ট / PDF" : "Browser Print")}</span>
                </button>
              </div>
            </div>

            {/* Print Friendly Sandbox Tip (Hidden in print) */}
            <div className="px-5 py-2.5 bg-indigo-50 border-b border-indigo-200 text-indigo-900 text-[11px] font-bold flex items-center gap-2 no-print shrink-0">
              <span className="animate-pulse">💡</span>
              <p className="leading-normal">
                {language === "bn"
                  ? "ইন্টারনেট ব্রাউজার থেকে সরাসরি PDF ডাউনলোড করতে উপরের প্রিন্ট বাটনে চাপ দিন। কোনো কারণে পপআপ বা উইন্ডো না খুললে, স্ক্রীনের উপরে ডানে থাকা 'Open in New Tab' বাটনে ক্লিক করে অ্যাপটি খুলুন।"
                  : "To download as PDF, click print and choose 'Save as PDF'. If the print layout is blocked, please click the native 'Open in New Tab' portal launcher on the top right."}
              </p>
            </div>

            {/* Main scroll viewport of physical document */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
              
              {/* Printable sheet mirroring physical format precisely */}
              <div id="printable-service-report" className="print-sheet-paper space-y-6 text-slate-950 font-sans">
                
                {/* ================= PAPER HEADER BLOCK ================= */}
                <div className="border border-slate-800 p-3 mb-3 bg-white">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-3 pb-2 border-b border-slate-300 text-center md:text-left">
                    
                    {/* Left Header info */}
                    <div className="space-y-1.5 w-full md:w-auto text-left">
                      <div className="flex items-center gap-1 font-semibold text-xs">
                        <span className="text-slate-500 font-mono">SL. No</span>
                        <input
                          type="text"
                          readOnly
                          value={activeReportDetails.id.split('-')[1] || "0229"}
                          className="w-16 px-1.5 py-0.5 bg-yellow-50/50 border border-red-300 text-red-600 font-bold font-mono text-center rounded outline-none"
                        />
                      </div>

                      <div className="flex flex-col gap-1 text-[10.5px]">
                        <div className="flex items-center gap-1">
                          <span className="text-slate-500 w-12 font-medium">Date:</span>
                          <input
                            type="text"
                            readOnly
                            value={activeReportDetails.dateOfOperation}
                            className="px-1.5 py-0.5 border border-slate-300 rounded font-mono font-bold bg-white text-slate-900 w-28 text-center"
                          />
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-slate-500 w-12 font-medium">Contract:</span>
                          <input
                            type="text"
                            readOnly
                            value={activeReportDetails.contractNo || "Optional"}
                            className="px-1.5 py-0.5 border border-slate-300 rounded font-medium bg-white text-slate-900 w-28 text-center"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Central Star & Trademark block */}
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-2.5 py-0.5">
                        <span className="text-3xl text-[#ED1C24] block leading-none shrink-0" style={{ filter: "drop-shadow(0 0 2px rgba(237,28,36,0.3))" }}>★</span>
                        <div className="text-left font-serif">
                          <span className="block text-[13px] font-extrabold tracking-wide text-slate-950 leading-tight">نجمة الوفاء</span>
                          <div className="flex items-center gap-1.5 leading-none mt-0.5">
                            <span className="text-[12px] font-black tracking-tight text-[#ED1C24] font-mono">AL WAFA STAR</span>
                            <span className="text-[10px] font-extrabold text-[#ED1C24] font-sans">Pest Control Services</span>
                          </div>
                          <div className="mt-1">
                            <span className="inline-block py-0.5 px-3 bg-slate-900 text-yellow-400 font-extrabold font-mono text-[8.5px] uppercase tracking-wider rounded-full border border-slate-700 leading-none">
                              Pest Control Division
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right spacer */}
                    <div className="hidden md:block w-32"></div>

                  </div>

                  {/* TREATMENT REPORT title line */}
                  <div className="bg-slate-900 text-white text-center font-serif font-black tracking-wider text-[12px] py-1 mt-1">
                    TREATMENT REPORT
                  </div>
                </div>

                {/* CLIENT & DETAILS SECTION */}
                <div className="border border-slate-800 bg-white grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800 text-[10.5px]">
                  {/* Left Column */}
                  <div className="p-3 space-y-2">
                    <div className="flex items-start gap-1">
                      <span className="font-extrabold text-slate-500 uppercase min-w-[120px] block shrink-0">CLIENT NAME:</span>
                      <span className="font-black text-slate-900 uppercase">{activeReportDetails.facilityName}</span>
                    </div>
                    <div className="flex items-start gap-1">
                      <span className="font-extrabold text-slate-500 uppercase min-w-[120px] block shrink-0">CONTACT NO. (OPT):</span>
                      <span className="font-bold text-slate-800">{activeReportDetails.mobile || "Optional"}</span>
                    </div>
                    <div className="flex items-start gap-1">
                      <span className="font-extrabold text-slate-500 uppercase min-w-[120px] block shrink-0">TIME START:</span>
                      <span className="font-bold text-slate-800 uppercase">{activeReportDetails.startTime}</span>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="p-3 space-y-2">
                    <div className="flex items-start gap-1">
                      <span className="font-extrabold text-slate-500 uppercase min-w-[100px] block shrink-0">ADDRESS:</span>
                      <span className="font-bold text-slate-900 uppercase">{activeReportDetails.address || activeReportDetails.emirate}</span>
                    </div>
                    <div className="flex items-start gap-1">
                      <span className="font-extrabold text-slate-500 uppercase min-w-[100px] block shrink-0">EMAIL (OPT):</span>
                      <span className="font-bold text-slate-800 select-all">{activeReportDetails.email || "Optional"}</span>
                    </div>
                    <div className="flex items-start gap-1">
                      <span className="font-extrabold text-slate-500 uppercase min-w-[100px] block shrink-0">TIME END:</span>
                      <span className="font-bold text-slate-900 uppercase">{activeReportDetails.endTime}</span>
                    </div>
                  </div>
                </div>

                {/* SERVICE CHECKLISTS & TREATMENT SCOPE */}
                <div className="border border-slate-800 bg-white grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800 text-[10.5px]">
                  
                  {/* Service Checklists */}
                  <div className="p-3">
                    <span className="block font-black uppercase tracking-wider text-slate-900 mb-2 border-b border-dashed border-slate-300 pb-1">
                      SERVICE CHECKLISTS:
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {["Basic", "Follow Up", "Call Back", "Replenishing", "Free", "Sample"].map((item) => {
                        const isChecked = activeReportDetails.categories?.some(c => c && typeof c === "string" && c.toLowerCase() === item.toLowerCase()) || 
                                          activeReportDetails.methods?.some(m => m && typeof m === "string" && m.toLowerCase() === item.toLowerCase());
                        return (
                          <div key={item} className="flex items-center gap-1.5 font-bold">
                            <div className={`w-4 h-4 border flex items-center justify-center rounded-sm transition ${
                              isChecked ? "border-slate-800 bg-emerald-50 text-emerald-900 font-black" : "border-slate-300 bg-white"
                            }`}>
                              {isChecked ? <span className="text-[10px] leading-none">✔</span> : null}
                            </div>
                            <span className="text-[10px] text-slate-800 whitespace-nowrap">{item}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Treatment Scope (Abbr) */}
                  <div className="p-3">
                    <span className="block font-black uppercase tracking-wider text-slate-905 mb-2 border-b border-dashed border-slate-300 pb-1">
                      TREATMENT SCOPE (ABBR):
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {["GPC", "FICP", "RCP", "TCP", "BCP", "SCP"].map((item) => {
                        const isChecked = activeReportDetails.categories?.some(c => {
                          if (!c || typeof c !== "string") return false;
                          const lc = c.toLowerCase();
                          return lc === item.toLowerCase() || lc === `${item.toLowerCase()} treatment` || lc.startsWith(item.toLowerCase() + " ");
                        });
                        return (
                          <div key={item} className="flex items-center gap-1.5 font-bold">
                            <div className={`w-4 h-4 border flex items-center justify-center rounded-sm transition ${
                              isChecked ? "border-slate-800 bg-indigo-50 text-indigo-900 font-black" : "border-slate-300 bg-white"
                            }`}>
                              {isChecked ? <span className="text-[10px] leading-none">✔</span> : null}
                            </div>
                            <span className="text-[10px] text-slate-800 whitespace-nowrap">{item}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* COVERED AREA DETAILS & FINDINGS */}
                <div className="border border-slate-800 bg-white p-3 text-[10.5px]">
                  <span className="block font-black uppercase tracking-wider text-slate-900 mb-1.5 border-b border-dashed border-slate-300 pb-1">
                    COVERED AREA DETAILS & FINDINGS:
                  </span>
                  {activeReportDetails.areas && activeReportDetails.areas.length > 0 ? (
                    <div className="mt-1.5 p-3.5 bg-[#FFFDF9] border border-slate-300 rounded font-mono text-[11px] font-bold text-slate-850 whitespace-pre-wrap break-words leading-relaxed">
                      {activeReportDetails.areas.join("\n")}
                    </div>
                  ) : (
                    <div className="text-slate-400 italic text-[10px] py-1">
                      {language === "bn" ? "কোন কাভারেজ এরিয়া বিবরণী যুক্ত করা নাই।" : "No covered area details logged."}
                    </div>
                  )}
                </div>
 
                {/* ================= METHOD OF APPLICATION, TREATMENT & EFFICACY SUB-REPORT SECTION ================= */}
                <div className="border border-slate-800 bg-white grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-800 text-[10.5px]">
                  {/* Method of Application Column */}
                  <div className="p-3">
                    <span className="block font-black uppercase tracking-wider text-slate-900 mb-1.5 border-b border-dashed border-slate-300 pb-1 text-left">
                      {language === "bn" ? "প্রয়োগ পদ্ধতি (Method of Application):" : "METHOD OF APPLICATION:"}
                    </span>
                    <div className="grid grid-cols-2 gap-1.5 font-bold">
                      {["Spraying", "Trapping", "Dusting", "Baiting", "Repellents", "IGR's"].map((item) => {
                        const isChecked = activeReportDetails.methods?.some(m => m && typeof m === "string" && m.toLowerCase() === item.toLowerCase());
                        return (
                          <div key={item} className="flex items-center gap-1.5 font-bold text-[9.5px]">
                            <div className={`w-3.5 h-3.5 border flex items-center justify-center rounded-sm transition shrink-0 ${
                              isChecked ? "border-slate-800 bg-emerald-50 text-emerald-900 font-extrabold" : "border-slate-300 bg-white"
                            }`}>
                              {isChecked ? <span className="text-[9px] leading-none">✔</span> : null}
                            </div>
                            <span className="text-[10px] text-slate-800 whitespace-nowrap">{item}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Method of Treatment Column */}
                  <div className="p-3">
                    <span className="block font-black uppercase tracking-wider text-slate-900 mb-1.5 border-b border-dashed border-slate-300 pb-1 text-left">
                      {language === "bn" ? "ট্রিটমেন্ট পদ্ধতি (Method of Treatment):" : "METHOD OF TREATMENT:"}
                    </span>
                    <div className="grid grid-cols-2 gap-1.5 font-bold">
                      {["Space Treatment", "Spot Treatment", "Cracks/Crevices", "Band Treatment"].map((item) => {
                        const isChecked = activeReportDetails.methods?.some(m => m && typeof m === "string" && m.toLowerCase() === item.toLowerCase());
                        return (
                          <div key={item} className="flex items-center gap-1.5 font-bold text-[9.5px]">
                            <div className={`w-3.5 h-3.5 border flex items-center justify-center rounded-sm transition shrink-0 ${
                              isChecked ? "border-slate-800 bg-indigo-50 text-indigo-900 font-extrabold" : "border-slate-300 bg-white"
                            }`}>
                              {isChecked ? <span className="text-[9px] leading-none">✔</span> : null}
                            </div>
                            <span className="text-[10px] text-slate-800 whitespace-nowrap">{item}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Effectiveness / Efficacy Column */}
                  <div className="p-3 flex flex-col justify-between">
                    <div>
                      <span className="block font-black uppercase tracking-wider text-slate-900 mb-1.5 border-b border-dashed border-slate-300 pb-1 text-left">
                        {language === "bn" ? "কার্যকারিতা (Effectiveness / Efficacy):" : "EFFECTIVENESS / EFFICACY:"}
                      </span>
                      <div className="grid grid-cols-1 gap-1.5 font-bold">
                        {["Residual Treatment", "Knockdown Treatment"].map((item) => {
                          const isChecked = activeReportDetails.methods?.some(m => m && typeof m === "string" && m.toLowerCase() === item.toLowerCase());
                          return (
                            <div key={item} className="flex items-center gap-1.5 font-bold text-[9.5px]">
                              <div className={`w-3.5 h-3.5 border flex items-center justify-center rounded-sm transition shrink-0 ${
                                isChecked ? "border-slate-800 bg-rose-50 text-rose-900 font-extrabold" : "border-slate-300 bg-white"
                              }`}>
                                {isChecked ? <span className="text-[9px] leading-none">✔</span> : null}
                              </div>
                              <span className="text-[10px] text-slate-800 whitespace-nowrap">{item}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-[8.5px] text-slate-500 bg-slate-50 p-1 rounded border border-slate-200">
                      <span>🎫 {language === "bn" ? "যাচাইকৃত নিরাপদ ফর্মূলা মানসমূহ" : "Verified safe formula values"}</span>
                    </div>
                  </div>
                </div>

                {/* ================= SECTION 4: INFESTATION MONITORING TABLE ================= */}
                <div className="border border-slate-800 bg-white p-3 space-y-2">
                  <span className="block font-black uppercase tracking-wider text-slate-900 border-b border-dashed border-slate-300 pb-1 text-[10.5px]">
                    4. INFESTATION MONITORING TABLE / DETAILED INCIDENCE MATRIX:
                  </span>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px] border-collapse min-w-[500px]">
                      <thead>
                        <tr className="bg-slate-900 text-white uppercase text-[8px] tracking-wider font-extrabold">
                          <th className="p-2 border border-slate-800 w-[180px]">PEST TYPE / SPECIES</th>
                          <th className="p-2 border border-slate-800 w-[60px] text-center">NONE</th>
                          <th className="p-2 border border-slate-800 w-[60px] text-center">LOW</th>
                          <th className="p-2 border border-slate-800 w-[60px] text-center">MEDIUM</th>
                          <th className="p-2 border border-slate-800 w-[60px] text-center">HIGH</th>
                          <th className="p-2 border border-slate-800">FINDINGS LOCATION</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {activeReportDetails.infestation && Object.keys(activeReportDetails.infestation).length > 0 ? (
                          Object.entries(activeReportDetails.infestation).map(([key, level], idx) => {
                            const match = key.match(/^([^(]+)(?:\s*\(([^)]+)\))?/);
                            const pestName = match ? match[1].trim() : key;
                            const findingsLocation = (match && match[2]) ? match[2].trim() : "N/A";
                            const currentLevel = (String(level || "None")).trim();

                            return (
                              <tr key={idx} className="bg-white">
                                <td className="p-2 border border-slate-200 font-sans font-extrabold text-slate-950 uppercase text-[10px]">
                                  {pestName}
                                </td>
                                {["None", "Low", "Medium", "High"].map((levelOpt) => {
                                  const isSelected = currentLevel.toLowerCase() === levelOpt.toLowerCase();
                                  return (
                                    <td key={levelOpt} className="p-2 border border-slate-200 text-center">
                                      <div className="flex justify-center items-center">
                                        <div className={`w-5 h-5 border flex items-center justify-center rounded transition ${
                                          isSelected 
                                            ? "border-slate-850 bg-indigo-50 text-indigo-900 font-black" 
                                            : "border-slate-300 bg-white"
                                        }`}>
                                          {isSelected ? (
                                            <span className="font-extrabold text-[12px] leading-none text-indigo-650">✔</span>
                                          ) : null}
                                        </div>
                                      </div>
                                    </td>
                                  );
                                })}
                                <td className="p-2 border border-slate-205 text-slate-800 font-bold uppercase font-sans text-[10px]">
                                  {findingsLocation}
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr className="bg-white">
                            <td colSpan={6} className="p-3 text-center text-slate-400 font-sans italic">
                              {language === "bn" ? "কোন প্রকার উপদ্রব সনাক্ত করা যায়নি।" : "No pest infestation incidence parameters recorded."}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* ================= LINE-BY-LINE SECTOR 5: CHEMICAL DOSAGES & DILUTION DOSES REGISTERED ================= */}
                <div className="bg-slate-50/50 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="border-b border-dashed border-slate-300 pb-2">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest font-mono block">
                      {language === "bn" ? "৫. ব্যবহৃত কেমিক্যাল ও ডোজ জাবদা" : "5. CHEMICAL DOSAGES & DILUTION DOSES REGISTERED"}
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px] border-collapse min-w-[500px]">
                      <thead>
                        <tr className="bg-slate-900 text-white uppercase text-[8px] tracking-wider font-black">
                          <th className="p-2 border border-slate-800">CHEMICAL NAME</th>
                          <th className="p-2 border border-slate-800">DILUTION RATE</th>
                          <th className="p-2 border border-slate-800">QTY SPEC</th>
                          <th className="p-2 border border-slate-800">BATCH NUMBER</th>
                          <th className="p-2 border border-slate-800">EXPIRY DATE</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-mono">
                        {activeReportDetails.chemicals && activeReportDetails.chemicals.length > 0 ? (
                          activeReportDetails.chemicals.map((chem, idx) => (
                             <tr key={idx} className="bg-white">
                               <td className="p-2 border border-slate-200 font-sans font-extrabold text-slate-950 uppercase">{chem.name}</td>
                               <td className="p-2 border border-slate-200 text-slate-700">{chem.dilution}</td>
                               <td className="p-2 border border-slate-200 text-slate-900 font-extrabold">{chem.used}</td>
                               <td className="p-2 border border-slate-200 text-slate-505">{chem.batch}</td>
                               <td className="p-2 border border-slate-200 text-slate-550">{chem.expiry}</td>
                             </tr>
                          ))
                        ) : (
                          <tr className="bg-white">
                            <td colSpan={5} className="p-3 text-center text-slate-400 font-sans italic">
                              {language === "bn" ? "কোন প্রকার কেমিক্যাল উপাদান ব্যবহার করার প্রয়োজন হয়নি।" : "No chemical material usage parameters recorded for this schedule service."}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* SANITARY RATINGS & CREW */}
                <div className="border border-slate-800 bg-white divide-y divide-slate-800 text-[10.5px]">
                  
                  {/* Sanitation block */}
                  <div className="p-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3 flex-wrap bg-[#FFFDF9]">
                    <div className="md:w-3/12 min-w-[130px] text-left">
                      <span className="text-[10.5px] font-extrabold text-slate-900 uppercase">
                        {language === "bn" ? "স্যানিটেশন কন্ডিশন:" : "Sanitation Condition:"}
                      </span>
                    </div>
                    <div className="md:w-4/12 flex items-center justify-start md:justify-center gap-4">
                      {(["Poor", "Satisfactory", "Good"] as const).map(lev => {
                        const isChecked = (activeReportDetails.sanitation || "Good") === lev;
                        return (
                          <div key={lev} className="flex items-center gap-1.5 font-bold select-none text-[10px]">
                            <div className="w-3.5 h-3.5 rounded-full border border-slate-400 flex items-center justify-center bg-white shrink-0">
                              {isChecked && (
                                <div className="w-2 h-2 rounded-full bg-emerald-600" />
                              )}
                            </div>
                            <span className={isChecked ? "text-slate-900 font-extrabold" : "text-slate-500"}>
                              {lev === "Good" ? (language === "bn" ? "ভালো" : "Good") : lev === "Satisfactory" ? (language === "bn" ? "সন্তোষজনক" : "Satisfactory") : (language === "bn" ? "খারাপ" : "Poor")}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="md:w-4.5/12 w-full md:flex-1 text-left">
                      <div className="w-full bg-[#FFFDF3] border border-slate-300 text-slate-900 font-bold rounded px-2.5 py-1 text-[10.5px] min-h-[22px] flex items-center font-mono">
                        {activeReportDetails.sanitationRemarks || (language === "bn" ? "কোন রিমার্কস বা মন্তব্য নেই।" : "No remarks.")}
                      </div>
                    </div>
                  </div>

                  {/* Proofing block */}
                  <div className="p-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3 flex-wrap bg-[#FFFDF9]">
                    <div className="md:w-3/12 min-w-[130px] text-left">
                      <span className="text-[10.5px] font-extrabold text-slate-900 uppercase">
                        {language === "bn" ? "প্রুফিং কন্ডিশন:" : "Proofing Condition:"}
                      </span>
                    </div>
                    <div className="md:w-4/12 flex items-center justify-start md:justify-center gap-4">
                      {(["Poor", "Satisfactory", "Good"] as const).map(lev => {
                        const isChecked = (activeReportDetails.proofing || "Good") === lev;
                        return (
                          <div key={lev} className="flex items-center gap-1.5 font-bold select-none text-[10px]">
                            <div className="w-3.5 h-3.5 rounded-full border border-slate-400 flex items-center justify-center bg-white shrink-0">
                              {isChecked && (
                                <div className="w-2 h-2 rounded-full bg-indigo-600" />
                              )}
                            </div>
                            <span className={isChecked ? "text-slate-900 font-extrabold" : "text-slate-500"}>
                              {lev === "Good" ? (language === "bn" ? "ভালো" : "Good") : lev === "Satisfactory" ? (language === "bn" ? "সন্তোষজনক" : "Satisfactory") : (language === "bn" ? "খারাপ" : "Poor")}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="md:w-4.5/12 w-full md:flex-1 text-left">
                      <div className="w-full bg-[#FFFDF3] border border-slate-300 text-slate-900 font-bold rounded px-2.5 py-1 text-[10.5px] min-h-[22px] flex items-center font-mono">
                        {activeReportDetails.proofingRemarks || (language === "bn" ? "কোন রিমার্কস বা মন্তব্য নেই।" : "No remarks.")}
                      </div>
                    </div>
                  </div>



                </div>

                {/* ================= LINE-BY-LINE SECTOR 6: ADVISORIES / RECOMMENDATIONS ================= */}
                <div className="bg-slate-50/50 border border-slate-800 rounded-xl p-4 space-y-2">
                  <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest font-mono block">
                    {language === "bn" ? "৬. স্যানিটারি নির্দেশিকা ও প্রতিরোধক পরামর্শ" : "6. OPERATIONAL COMPLIANCE ADVISORIES / RECOMMENDATIONS"}
                  </span>
                  <div className="p-3 bg-white rounded-lg border border-slate-350 shadow-sm">
                    <ul className="space-y-1.5 text-[11px] text-slate-850 font-sans">
                      {activeReportDetails.recommendations && activeReportDetails.recommendations.length > 0 ? (
                        activeReportDetails.recommendations.map((r, i) => (
                          <li key={i} className="font-sans font-medium leading-relaxed">
                            {r}
                          </li>
                        ))
                      ) : (
                        <li className="text-slate-400 italic font-sans font-medium leading-relaxed">
                          Keep environmental water inlets airtight and sanitization channels active.
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* ================= LINE-BY-LINE SECTOR 7: BILLING INVOICE STRUCTURE ================= */}
                {(() => {
                  const isFree = !activeReportDetails.billing?.amount || 
                                 activeReportDetails.billing?.amount === 0 || 
                                 String(activeReportDetails.billing?.amount).toLowerCase().trim() === "no charge" ||
                                 String(activeReportDetails.billing?.amount).trim() === "" ||
                                 String(activeReportDetails.billing?.amount).trim() === "No";

                  if (isFree) return null;

                  return (
                    <div className="bg-slate-50/50 border border-slate-800 rounded-xl p-4 space-y-3">
                      <span className="text-[10px] font-bold text-slate-800 uppercase tracking-widest font-mono block">
                        💰 {language === "bn" ? "৭. বিলিং তথ্য" : "7. BILLING INVOICE REPORT SUMMARY"}
                      </span>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        <div className="bg-white p-2 rounded-lg border border-slate-300">
                          <span className="text-slate-400 block text-[8px] font-bold uppercase">INVOICE SERIAL NO</span>
                          <span className="font-mono font-bold text-slate-850 block mt-0.5">{activeReportDetails.billing?.invoiceNo || `PC-${activeReportDetails.id}`}</span>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-slate-300">
                          <span className="text-slate-400 block text-[8px] font-bold uppercase">SUBTOTAL AMOUNT</span>
                          <span className="font-mono font-extrabold text-slate-850 block mt-0.5">{activeReportDetails.billing?.amount || 0} AED</span>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-slate-300">
                          <span className="text-slate-400 block text-[8px] font-bold uppercase">TAX (5.0% GST)</span>
                          <span className="font-mono text-slate-500 font-bold block mt-0.5">{activeReportDetails.billing?.vat || 0} AED</span>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-300 p-2 rounded-lg">
                          <span className="text-emerald-700 block text-[8px] font-black uppercase">TOTAL SECURE CHARGE</span>
                          <span className="font-mono font-black text-emerald-800 text-sm block mt-0.5 select-all">{activeReportDetails.billing?.total || 0} AED</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* ================= LINE-BY-LINE SECTOR 9: OFFICIAL VALIDATION SIGNATURE BLOCK ================= */}
                <div className="pt-4 border-t border-slate-400">
                  <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest font-mono block mb-3 text-center">
                    {language === "bn" ? "৮. স্বাক্ষর ও সীল ভ্যালিডেশন সনদ" : "8. OFFICIAL STAMP & SEAL RECOGNITION"}
                  </span>
                  
                  <div className="grid grid-cols-2 gap-4 text-center text-[10px] select-none">
                    <div className="space-y-1">
                      <span className="text-slate-500 block uppercase text-[8px] font-bold">Client Seal / Signature</span>
                      <div className="h-20 border border-dashed border-slate-300 rounded-lg flex items-center justify-center p-1 bg-white shadow-inner">
                        {activeReportDetails.signatures?.client ? (
                          <img src={activeReportDetails.signatures.client} alt="Client signature" className="max-h-16 object-contain" />
                        ) : (
                          <span className="text-slate-300 text-[8px] font-mono">[ Clinician Representative ]</span>
                        )}
                      </div>
                      <span className="font-sans block font-extrabold text-slate-800 truncate">{activeReportDetails.contactPerson || "Attendant Guest"}</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-slate-500 block uppercase text-[8px] font-bold">Engineer & Technician Signature</span>
                      <div className="h-20 border border-dashed border-slate-300 rounded-lg flex items-center justify-center p-1 bg-white shadow-inner">
                        {activeReportDetails.signatures?.technician || activeReportDetails.signatures?.supervisor ? (
                          <img src={activeReportDetails.signatures.technician || activeReportDetails.signatures.supervisor} alt="Engineer & Technician signature" className="max-h-16 object-contain" />
                        ) : (
                          <span className="bg-sky-50 text-sky-700 text-[8px] font-bold px-2 py-1 rounded border border-sky-100 select-none">CERTIFIED OPERATOR</span>
                        )}
                      </div>
                      <span className="font-sans block text-slate-800 font-semibold text-[9.5px]">AL WAFA Specialist</span>
                    </div>
                  </div>
                </div>

                {/* Letterhead Footer */}
                <div className="border-t border-slate-300 pt-3 text-center text-[8.5px] text-slate-400 font-serif leading-relaxed font-bold">
                  <p>Tel: 04-2959731, Fax: 04-2959732, P.O Box: 181244, Deira, Dubai - United Arab Emirates</p>
                  <p>E-mail: pestcontrol@alwafagroupuae.com, wafastaruae@yahoo.com | Website: www.alwafagroupuae.com</p>
                </div>

              </div>

            </div>

            <div className="bg-[#F8FAFC] border-t border-slate-200 p-4 shrink-0 flex flex-wrap gap-2.5 justify-end items-center font-sans">
              <button
                onClick={() => {
                  onSelectReport(activeReportDetails);
                  setActiveReportDetails(null);
                  setTab("master_form");
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>📝 Auto-Fill/Copy to form</span>
              </button>
              <button
                onClick={() => setActiveReportDetails(null)}
                className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Close View
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
