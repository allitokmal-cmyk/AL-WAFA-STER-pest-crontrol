import { useState } from "react";
import { AlWafaBannerLogo } from "./AlWafaBannerLogo";
import AlWafaLogo from "./AlWafaLogo";
import { ReportItem, LocationRegistryItem, STANDARD_FACILITIES, SupervisorRegistryItem, EMIRATE_MAPPING_FACILITIES } from "../types";
import { saveStoreValue } from "../localDatabase";
import firebaseConfig from "../firebase-applet-config.json";
import { 
  FileCheck2, 
  MapPin,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  DollarSign,
  Printer,
  X,
  PlusCircle,
  Building2,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  UserCheck,
  Percent,
  User,
  Shield,
  Phone,
  Mail,
  Building,
  AlertOctagon,
  Edit3,
  FileText,
  Maximize,
  Minimize,
  Moon,
  Sun
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

interface DashboardProps {
  reports: ReportItem[];
  language: "en" | "ar" | "bn";
  setTab: (tab: string) => void;
  onSelectReport: (report: ReportItem) => void;
  onUpdateReports?: (reports: ReportItem[]) => void;
  locations?: LocationRegistryItem[];
  supervisors?: SupervisorRegistryItem[];
  themeMode?: "dark" | "light";
  onSetThemeMode?: (mode: "dark" | "light") => void;
  isFullscreenLayout?: boolean;
  onSetFullscreenLayout?: (val: boolean) => void;
}

interface ScheduleRouteDutyModalProps {
  facilityName: string;
  language: "en" | "ar" | "bn";
  onClose: () => void;
  onSave: (data: {
    datePeriod: "Today" | "Tomorrow" | "After Tomorrow";
    locationArea: "Inside" | "Outside" | "Both Inside & Outside" | "";
    notesText: string;
  }) => void;
}

function ScheduleRouteDutyModal({
  facilityName,
  language,
  onClose,
  onSave,
}: ScheduleRouteDutyModalProps) {
  const [datePeriod, setDatePeriod] = useState<"Today" | "Tomorrow" | "After Tomorrow">("Today");
  const [locationArea, setLocationArea] = useState<string>("Inside");
  const [notesText, setNotesText] = useState("");

  const handleToggleLocation = (id: string) => {
    const currentSections = locationArea ? locationArea.split(", ").filter(Boolean) : [];
    let updated: string[];
    if (currentSections.includes(id)) {
      updated = currentSections.filter(x => x !== id);
    } else {
      updated = [...currentSections, id];
    }
    setLocationArea(updated.join(", "));
  };

  return (
    <div id="create-partial-notes-modal" className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs select-none animate-fadeIn font-sans">
      <div className="bg-white max-w-lg w-full rounded-2xl overflow-hidden shadow-2xl border-t-8 border-indigo-500 animate-scaleIn text-slate-800 flex flex-col max-h-[90vh]">
        {/* Header - Fixed */}
        <div className="p-5 border-b border-slate-100 bg-gradient-to-br from-indigo-5 to-indigo-50/50 flex justify-between items-start flex-none">
          <div className="space-y-1">
            <span className="text-[10px] bg-indigo-150 text-indigo-700 font-mono font-black tracking-widest uppercase px-2 py-0.5 rounded border border-indigo-200">
              {language === "bn" ? "সুপারভাইজার রুট ডিসপ্যাচ" : "SUPERVISOR ROOT DISPATCH"}
            </span>
            <h3 className="text-base font-black tracking-tight text-indigo-900 leading-tight">
              {language === "bn" ? "নতুন কাজের নির্দেশক ফর্ম" : "Schedule New Route Duty"}
            </h3>
            <p className="text-[10.5px] text-slate-500 font-medium">
              {language === "bn" 
                ? "সেন্টার নির্ধারণ নির্ধারণ, দিন এবং কাজের এরিয়া স্পেসিফাই করে নির্দেশনা প্রদান করুন।" 
                : "Dispatch route plans with exact issues and work areas."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-650 rounded-full hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content - Scrollable */}
        <div className="p-5 space-y-4 text-xs font-semibold overflow-y-auto flex-1">
          
          {/* 1. Target Hospital (Prefilled Read-Only Segment) */}
          <div className="space-y-1">
            <label className="text-slate-950 block text-[11px] font-black uppercase">
              {language === "bn" ? "১. হাসপাতাল ও সেন্টার নির্বাচন:" : "1. Target Hospital Facility:"}
            </label>
            <div className="w-full bg-slate-100 border-2 border-slate-200 text-slate-900 font-sans font-black rounded-lg py-2.5 px-3 flex items-center gap-2">
              <span className="text-sm">🏥</span>
              <span className="text-xs font-extrabold text-slate-900">{facilityName}</span>
            </div>
          </div>

          {/* 2. Schedule Target Work Day */}
          <div className="space-y-1.5">
            <label className="text-slate-950 block text-[11px] font-black uppercase">
              {language === "bn" ? "২. কাজের দিন নির্ধারণ (শিডিউল):" : "2. Schedule Target Work Day:"}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "Today", labelBn: "আজ", labelEn: "Today" },
                { id: "Tomorrow", labelBn: "আগামীকাল", labelEn: "Tomorrow" },
                { id: "After Tomorrow", labelBn: "পরশু", labelEn: "After Tomorrow" }
              ].map((pd) => {
                const isSelected = datePeriod === pd.id;
                return (
                  <button
                    type="button"
                    key={pd.id}
                    onClick={() => setDatePeriod(pd.id as any)}
                    className={`py-2 px-1 rounded-lg border-2 text-[10.5px] font-black uppercase tracking-tight transition cursor-pointer flex flex-col items-center justify-center ${
                      isSelected 
                        ? "bg-[#2563EB] border-[#2563EB] text-white shadow-3xs" 
                        : "bg-white hover:bg-slate-50 border-slate-200 text-slate-800"
                    }`}
                  >
                    <span className="text-[12px] mb-0.5">📅</span>
                    <span>{language === "bn" ? pd.labelBn : pd.labelEn}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Location Area Type */}
          <div className="space-y-1.5">
            <label className="text-slate-950 block text-[11px] font-black uppercase">
              {language === "bn" ? "৩. কাজের স্থান / এরিয়া নির্ধারণী (Inside or Outside):" : "3. Location Area / Area Type:"}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "Inside", labelBn: "ইনসাইড", labelEn: "Inside" },
                { id: "Outside", labelBn: "আউটসাইড", labelEn: "Outside" },
                { id: "Both Inside & Outside", labelBn: "উভয়ই", labelEn: "Both" }
              ].map((loc) => {
                const currentSections = locationArea ? locationArea.split(", ") : [];
                const isSelected = currentSections.includes(loc.id);
                return (
                   <button
                     type="button"
                     key={loc.id}
                     onClick={() => handleToggleLocation(loc.id)}
                     className={`py-2 px-1 rounded-lg border-2 text-[10.5px] font-black uppercase tracking-tight transition cursor-pointer flex flex-col items-center justify-center ${
                       isSelected 
                         ? "bg-slate-900 border-slate-950 text-white shadow-3xs" 
                         : "bg-white hover:bg-slate-50 border-slate-200 text-slate-800"
                     }`}
                   >
                     <span className="text-[12px] mb-0.5">
                       {loc.id === "Inside" ? "🚪" : loc.id === "Outside" ? "🌳" : "🏢"}
                     </span>
                     <span>{language === "bn" ? loc.labelBn : loc.labelEn}</span>
                   </button>
                );
              })}
            </div>
          </div>

          {/* 4. Textarea for Tasks Instruction Details */}
          <div className="space-y-1 pt-1">
            <label className="text-slate-950 block text-[11px] font-extrabold uppercase flex justify-between items-center">
              <span>{language === "bn" ? "৪. কাজের বিবরণ ও নির্দেশনা (Tasks Guideline):" : "4. Tasks Instruction Details:"}</span>
              <span className="text-[9px] font-normal text-slate-400 italic">Manual Entry</span>
            </label>
            <textarea
              rows={5}
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder={language === "bn" ? "এখানে আপনার কাজের নির্দেশনা লিখুন..." : "Type your tasks instructions here..."}
              className="w-full bg-slate-50 border-2 border-slate-250 text-slate-900 font-extrabold rounded-lg py-2.5 px-3 outline-none focus:border-[#2563EB] placeholder:text-slate-400 placeholder:font-normal leading-relaxed h-32 focus:ring-0 active:ring-0 resize-y"
              style={{ minHeight: "130px" }}
            />
          </div>

        </div>

        {/* Actions Footer - Fixed */}
        <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 flex-none">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 hover:bg-slate-150 text-slate-705 font-extrabold rounded-xl text-xs cursor-pointer transition active:scale-95"
          >
            {language === "bn" ? "বাতিল" : "Cancel"}
          </button>

          <button
            type="button"
            onClick={() => onSave({ datePeriod, locationArea, notesText })}
            className="px-5 py-2.5 bg-[#2563EB] hover:bg-blue-700 font-sans text-white font-black rounded-xl text-xs cursor-pointer shadow-md shadow-blue-500/10 transition active:scale-95 flex items-center gap-2 uppercase tracking-wide"
          >
            <span>🚀 {language === "bn" ? "মেইন প্ল্যানে সেভ করুন" : "Save Plan Into Main Workbook"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard({
  reports,
  language,
  setTab,
  onSelectReport,
  onUpdateReports,
  locations = [],
  supervisors = [],
  themeMode,
  onSetThemeMode,
  isFullscreenLayout,
  onSetFullscreenLayout,
}: DashboardProps) {
  // Local UI States for search and filtering
  const [completedSearch, setCompletedSearch] = useState("");
  const [emirateFilter, setEmirateFilter] = useState("All");
  const [activeReportDetails, setActiveReportDetails] = useState<ReportItem | null>(null);
  const [simulatedPrint, setSimulatedPrint] = useState(false);
  const [activeFolder, setActiveFolder] = useState<"completed" | "partial" | "unstarted">("completed");

  // 1. Identify unique centers from the dynamic locations list in the Location Map
  const allCentersList = Array.from(new Set([
    ...(locations || []).map(l => l.name),
    ...STANDARD_FACILITIES,
    ...Object.values(EMIRATE_MAPPING_FACILITIES).flat(),
    ...reports.map(r => r.facilityName)
  ])).filter(Boolean).sort();

  const totalCentersCount = allCentersList.length;

  // State for editing notes on an existing partial report
  const [editingPartialReportId, setEditingPartialReportId] = useState<string | null>(null);
  const [editingNotesText, setEditingNotesText] = useState("");

  // State for creating a partial report from an incomplete center name
  const [creatingPartialCenterName, setCreatingPartialCenterName] = useState<string | null>(null);

  // Firebase configuration state variables
  const [fbApiKey, setFbApiKey] = useState(firebaseConfig.apiKey || "");
  const [fbAuthDomain, setFbAuthDomain] = useState(firebaseConfig.authDomain || "");
  const [fbProjectId, setFbProjectId] = useState(firebaseConfig.projectId || "");
  const [fbStorageBucket, setFbStorageBucket] = useState(firebaseConfig.storageBucket || "");
  const [fbMessagingSenderId, setFbMessagingSenderId] = useState(firebaseConfig.messagingSenderId || "");
  const [fbAppId, setFbAppId] = useState(firebaseConfig.appId || "");
  const [fbMeasurementId, setFbMeasurementId] = useState(firebaseConfig.measurementId || "");
  const [fbDatabaseId, setFbDatabaseId] = useState((firebaseConfig as any).firestoreDatabaseId || "");
  const [fbIsSaving, setFbIsSaving] = useState(false);
  const [fbRawConfigPaste, setFbRawConfigPaste] = useState("");

  const handleRawConfigPaste = (text: string) => {
    setFbRawConfigPaste(text);
    try {
      const extractField = (key: string, raw: string): string => {
        const regex = new RegExp(`['"]?${key}['"]?\\s*:\\s*['"]([^'"]+)['"]`, 'i');
        const match = raw.match(regex);
        return match ? match[1] : "";
      };
      
      const apiKey = extractField("apiKey", text);
      const authDomain = extractField("authDomain", text);
      const projectId = extractField("projectId", text);
      const storageBucket = extractField("storageBucket", text);
      const messagingSenderId = extractField("messagingSenderId", text);
      const appId = extractField("appId", text);
      const measurementId = extractField("measurementId", text);
      const datId = extractField("databaseId", text) || extractField("firestoreDatabaseId", text);

      if (apiKey) setFbApiKey(apiKey);
      if (authDomain) setFbAuthDomain(authDomain);
      if (projectId) setFbProjectId(projectId);
      if (storageBucket) setFbStorageBucket(storageBucket);
      if (messagingSenderId) setFbMessagingSenderId(messagingSenderId);
      if (appId) setFbAppId(appId);
      if (measurementId) setFbMeasurementId(measurementId);
      if (datId) setFbDatabaseId(datId);
    } catch (e) {
      console.warn("Could not auto-parse pasted config", e);
    }
  };

  const handleSaveFirebaseConfig = async () => {
    setFbIsSaving(true);
    try {
      const response = await fetch("/api/save-firebase-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: fbApiKey,
          authDomain: fbAuthDomain,
          projectId: fbProjectId,
          storageBucket: fbStorageBucket,
          messagingSenderId: fbMessagingSenderId,
          appId: fbAppId,
          measurementId: fbMeasurementId,
          firestoreDatabaseId: fbDatabaseId
        })
      });
      if (response.ok) {
        alert(language === "bn" ? "ফায়ারবেস কনফিগারেশন সফলভাবে আপডেট করা হয়েছে!" : "Firebase config successfully saved to project workspace!");
      } else {
        alert(language === "bn" ? "কনফিগারেশন সংরক্ষণ করতে ব্যর্থ হয়েছে।" : "Failed to save configuration.");
      }
    } catch (e) {
      console.error(e);
      alert(language === "bn" ? "নেটওয়ার্ক বা সার্ভার ত্রুটি ঘটেছে।" : "A network or server error occurred.");
    } finally {
      setFbIsSaving(false);
    }
  };

  const handleDownloadFirebaseConfig = () => {
    const configData = {
      apiKey: fbApiKey,
      authDomain: fbAuthDomain,
      projectId: fbProjectId,
      storageBucket: fbStorageBucket,
      messagingSenderId: fbMessagingSenderId,
      appId: fbAppId,
      measurementId: fbMeasurementId,
      firestoreDatabaseId: fbDatabaseId
    };
    const blob = new Blob([JSON.stringify(configData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "firebase-applet-config.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getHospitalInstructions = (name: string, isBen: boolean) => {
    if (isBen) {
      return `আমি এই কাজগুলো করব:
- ${name}-এর সমস্ত ওয়ার্ড এবং করিডোর জীবাণুমুক্ত করা।
- আউটসাইড বাউন্ডারি ও ড্রেনেজ পাইপলাইনে লিকুইড পেস্ট স্প্রে করা।
- ইনসাইড ও আউটসাইড পেস্ট কন্ট্রোল মেকানিজম মনিটর ও জেল বাটিং সম্পাদন করা।`;
    } else {
      return `I will do these tasks:
- Complete deep spray disinfection across all main zones of ${name}.
- Place professional gel baiting traps in cafeteria and bathroom crevices.
- Perform safe exterior drainage pipeline cleaning and insect liquid control.`;
    }
  };

  // 2. Completed checks (Only show current running month's reports to archive past months):
  // A facility is completed if we have at least one successfully submitted report with Completed status
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
  const completedCount = completedReports.length;

  // Set of completed facility names
  const completedFacilityNames = new Set(completedReports.map(r => r.facilityName));

  // Partially Completed checks:
  // A facility is partially completed if its work status shows progress or is designated Partial
  const partiallyCompletedReports = reports.filter(r => 
    r.workStatus === "Partially Completed" || 
    r.workStatus === "In Progress" || 
    r.workStatus === "Follow-Up Required"
  );
  
  // Filter out any that actually have a "Completed" status in another report (to avoid duplicates)
  const filteredPartiallyCompletedReports = partiallyCompletedReports.filter(r => 
    !completedFacilityNames.has(r.facilityName)
  );
  const partiallyCompletedCount = filteredPartiallyCompletedReports.length;
  // Set of partially completed facility names
  const partiallyCompletedFacilityNames = new Set(filteredPartiallyCompletedReports.map(r => r.facilityName));

  // Stable next due date calculator for non-completed centers
  const getDeterministicDueDateAndDiff = (facilityName: string) => {
    // Look if there's any report in progress for this center
    const matchingReport = reports.find(r => r.facilityName === facilityName);
    if (matchingReport && matchingReport.endDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const due = new Date(matchingReport.endDate);
      due.setHours(0, 0, 0, 0);
      const diffTime = due.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return {
        dueDateStr: matchingReport.endDate,
        diffDays
      };
    }

    // Fallback: Calculate a deterministic date based on the facility name hash code
    let hash = 0;
    for (let i = 0; i < facilityName.length; i++) {
      hash = facilityName.charCodeAt(i) + ((hash << 5) - hash);
    }
    hash = Math.abs(hash);

    // Spread offset between -8 (overdue) and +18 (upcoming) days relative to current time 
    const daysOffset = (hash % 26) - 8;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(today.getTime() + daysOffset * 24 * 60 * 60 * 1000);
    const dueDateStr = targetDate.toISOString().split("T")[0];
    
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      dueDateStr,
      diffDays
    };
  };

  // 3. Not Completed list: centers in our list that don't have any completed AND don't have partially completed reports yet
  // Sorted so overdue ones (diffDays < 0) come first, followed by upcoming ones (diffDays >= 0) sorted ascending
  const incompleteCentersList = allCentersList
    .filter(name => !completedFacilityNames.has(name) && !partiallyCompletedFacilityNames.has(name))
    .sort((a, b) => {
      const diffA = getDeterministicDueDateAndDiff(a).diffDays;
      const diffB = getDeterministicDueDateAndDiff(b).diffDays;
      
      const isOverdueA = diffA < 0;
      const isOverdueB = diffB < 0;
      
      if (isOverdueA && !isOverdueB) return -1;
      if (!isOverdueA && isOverdueB) return 1;
      
      // If both are overdue or both are active/upcoming, sort by remaining days ascending
      return diffA - diffB;
    });
    
  const incompleteCentersCount = incompleteCentersList.length;

  // 4. Progress ratio: completed vs total
  const progressPercent = totalCentersCount > 0 
    ? Math.round((completedCount / totalCentersCount) * 100) 
    : 0;

  // Custom Operations: Update inline partial report notes
  const handleSavePartialNotes = () => {
    if (editingPartialReportId && onUpdateReports) {
      const updated = reports.map(r => 
        r.id === editingPartialReportId 
          ? { ...r, partialNotes: editingNotesText } 
          : r
      );
      onUpdateReports(updated);
      setEditingPartialReportId(null);
    }
  };

  // Settle or upgrade partial report to fully completed
  const handleMarkAsFullyCompleted = (reportId: string) => {
    if (onUpdateReports) {
      const updated = reports.map(r => 
        r.id === reportId 
          ? { ...r, workStatus: "Completed" as const, reportText: r.partialNotes || r.reportText } 
          : r
      );
      onUpdateReports(updated);
      setEditingPartialReportId(null);
    }
  };

  // Initialize and write partial report notes from any unstarted center
  const handleCreatePartialReport = (data: {
    datePeriod: "Today" | "Tomorrow" | "After Tomorrow";
    locationArea: "Inside" | "Outside" | "Both Inside & Outside" | "";
    notesText: string;
  }) => {
    if (creatingPartialCenterName && onUpdateReports) {
      const targetState = creatingPartialCenterName.toLowerCase().includes("dubai") ? "Dubai" : 
                          creatingPartialCenterName.toLowerCase().includes("sharjah") ? "Sharjah" : "Ajman";
      const newId = `REP-PARTIAL-${Math.floor(100 + Math.random() * 900)}-AL`;
      const newReport: ReportItem = {
        id: newId,
        facilityName: creatingPartialCenterName,
        clientId: `ALW-CLI-${Math.floor(3000 + Math.random() * 6000)}`,
        contractNo: "CON-PARTIAL-2026",
        branchName: "Secondary Sector",
        facilityType: "Medical Center",
        emirate: targetState,
        address: "UAE Branch Address",
        contactPerson: "Clinical Operations Lead",
        mobile: "+971 50 XXXXXXX",
        whatsapp: "+971 50 XXXXXXX",
        email: "",
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        validity: "Monthly Cycle",
        dateOfOperation: new Date().toISOString().split("T")[0],
        ticketNo: `TKT-PARTIAL-${Math.floor(10000 + Math.random() * 90000)}`,
        startTime: "10:00",
        endTime: "11:00",
        duration: "1h",
        categories: ["General Pest Control (GPC)"],
        areas: [data.locationArea],
        reportText: "Pest control operation logged as partially finished.",
        workStatus: "Partially Completed",
        partialNotes: data.notesText,
        methods: ["Spraying"],
        chemicals: [],
        infestation: {},
        sanitation: "Satisfactory",
        proofing: "Satisfactory",
        recommendations: ["Disinfection and target action pending."],
        billing: {
          invoiceNo: "",
          invoiceDate: "",
          amount: 0,
          discount: 0,
          vat: 0,
          total: 0,
          method: "Cash",
          status: "Pending"
        },
        technicians: ["Hamdy Hussin"],
        signatures: {},
        dateFrame: data.datePeriod,
        locationType: data.locationArea,
        instructionText: data.notesText
      };

      // Save to Field Plans (ALW_FIELD_PLANS_V2) so it appears in the worksheets layout under Team & Attendance!
      const newPlan = {
        id: `PLAN-${Math.floor(100 + Math.random() * 900)}`,
        facilityName: creatingPartialCenterName,
        assignedTo: "Hamdy (Supervisor)",
        dateFrame: data.datePeriod,
        locationType: data.locationArea,
        instructionText: data.notesText.trim(),
        workAreas: data.locationArea,
        reportedIssue: language === "bn" ? "কাজের বিবরণ ও নির্দেশনা" : "Tasks & Instructions",
        tasks: [data.notesText.trim()],
        notes: data.notesText.trim(),
        status: "Planned" as const
      };
      
      const savedPlansStr = localStorage.getItem("ALW_FIELD_PLANS_V2");
      let existingPlans = [];
      if (savedPlansStr) {
        try {
          existingPlans = JSON.parse(savedPlansStr);
        } catch (e) {}
      }
      const updatedPlans = [newPlan, ...existingPlans];
      localStorage.setItem("ALW_FIELD_PLANS_V2", JSON.stringify(updatedPlans));
      
      // Multi-device Firestore synchronization
      saveStoreValue("field_plans", updatedPlans).catch((err) => console.log("Background sync field plans failed:", err));

      onUpdateReports([...reports, newReport]);
      setCreatingPartialCenterName(null);
    }
  };

  // Switch to report creation with designated prefilled facility
  const handleQuickDispatch = (facilityName: string) => {
    const matchingClient = reports.find(r => r.facilityName === facilityName) || {
      facilityName: facilityName,
      emirate: facilityName.toLowerCase().includes("dubai") ? "Dubai" : 
               facilityName.toLowerCase().includes("sharjah") ? "Sharjah" : "Ajman"
    };

    onSelectReport({
      id: "",
      facilityName: facilityName,
      clientId: `ALW-CLI-${Math.floor(1000 + Math.random() * 9000)}`,
      contractNo: `CON-${Math.floor(2000 + Math.random() * 7000)}-S`,
      branchName: "Secondary Sector",
      facilityType: "Medical Center",
      emirate: matchingClient.emirate || "Ajman",
      address: "UAE Branch Address Location",
      contactPerson: "Clinical Operations Lead",
      mobile: "+971 50 XXXXXXX",
      whatsapp: "+971 50 XXXXXXX",
      email: "hospital.safety@moh.gov.ae",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      validity: "Monthly Cycle",
      dateOfOperation: new Date().toISOString().split("T")[0],
      ticketNo: `TKT-${Math.floor(10000 + Math.random() * 90000)}-AL`,
      startTime: "10:00",
      endTime: "11:30",
      duration: "1h 30m",
      categories: ["General Pest Control (GPC)"],
      areas: ["Rooms", "Toilets", "Kitchen"],
      reportText: "General pest control sanitation maintenance operational update scheduled.",
      workStatus: "In Progress",
      methods: ["Spraying"],
      chemicals: [],
      infestation: {},
      sanitation: "Satisfactory",
      proofing: "Satisfactory",
      recommendations: ["Ensure proper sanitation access doors checked."],
      billing: {
        invoiceNo: "",
        invoiceDate: "",
        amount: "",
        discount: 0,
        vat: 0,
        total: 0,
        method: "Cash",
        status: "Pending"
      },
      technicians: ["Hamdy Hussin"],
      signatures: {}
    });
    setTab("master_form");
  };

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleDownloadPDF = async () => {
    if (!activeReportDetails) return;

    const defaultName = `AlWafaStar-Report-${activeReportDetails.ticketNo || activeReportDetails.id}`;
    const customFileName = defaultName;

    setIsGeneratingPDF(true);
    
    try {
      let contentHtml = "";
      const isEngineering = !!activeReportDetails.rawEngineeringData;

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

  // Trigger Print Overlay
  const triggerPrintDoc = (customFileName?: string) => {
    setSimulatedPrint(true);
    document.body.classList.add("pdf-download-active");
    
    const originalTitle = document.title;
    if (customFileName) document.title = customFileName;

    setTimeout(() => {
      window.focus();
      window.print();
      
      // Delay wiping the active print UI slightly so the browser print engine catches the layout
      setTimeout(() => {
        document.body.classList.remove("pdf-download-active");
        if (customFileName) document.title = originalTitle;
        setSimulatedPrint(false);
      }, 500);
    }, 500);
  };

  // Filter completed items
  const filteredCompletedReports = completedReports.filter(r => {
    const matchesSearch = r.facilityName?.toLowerCase().includes(completedSearch.toLowerCase()) || 
                          r.ticketNo?.toLowerCase().includes(completedSearch.toLowerCase()) ||
                          r.id?.toLowerCase().includes(completedSearch.toLowerCase());
    const matchesEmirate = emirateFilter === "All" || r.emirate === emirateFilter;
    return matchesSearch && matchesEmirate;
  });

  return (
    <div className="space-y-6">
      {/* Top Control Bar & Action */}
      <div className="flex flex-col sm:flex-row justify-between w-full animate-fadeIn items-center gap-4 bg-[#1e293b]/50 p-3 rounded-2xl border border-slate-700/50 backdrop-blur-md shadow-lg">
        
        <div></div>

        <button 
          id="req-new-report-dashboard"
          onClick={() => setTab("master_form")}
          className="w-full sm:w-auto px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{language === "bn" ? "নতুন রিপোর্ট যোগ করুন" : "Add Service Report"}</span>
        </button>
      </div>

      {/* Dynamic Metric Cards Row - Showing 4 metadata tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 select-none">
        
        {/* Card 1: Total Registered Centers under me */}
        <div className={`border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group ${themeMode === "dark" ? "bg-slate-800/80 border-slate-700 backdrop-blur-md" : "bg-white border-slate-200"}`}>
          <div className={`absolute top-0 left-0 w-2 h-full ${themeMode === "dark" ? "bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]" : "bg-indigo-500"}`} />
          <div className="flex items-center justify-between pl-2">
            <div className="space-y-1.5 flex-1 pr-4">
              <span className={`text-[10px] tracking-wider uppercase font-black block font-mono ${themeMode === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                {language === "bn" ? "আমার আন্ডারে থাকা মোট সেন্টার" : "Total Centers Under Me"}
              </span>
              <span className={`text-4xl font-black tracking-tight font-sans ${themeMode === "dark" ? "text-slate-100" : "text-slate-900"}`}>
                {totalCentersCount}
              </span>
              <span className={`text-[10.5px] font-bold block ${themeMode === "dark" ? "text-indigo-400" : "text-indigo-600"}`}>
                {language === "bn" ? "✓ মোট সচল মেডিকেল প্রতিষ্ঠান" : "✓ Active client health facilities"}
              </span>
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border group-hover:scale-110 transition-transform duration-300 shadow-inner ${themeMode === "dark" ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" : "bg-indigo-50 text-indigo-600 border-indigo-100/50"}`}>
              <MapPin className="w-5.5 h-5.5" />
            </div>
          </div>
        </div>

        {/* Card 2: Completed Services */}
        <div 
          onClick={() => setActiveFolder("completed")}
          className={`border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group cursor-pointer ${themeMode === "dark" ? (activeFolder === "completed" ? "bg-slate-800 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.25)]" : "bg-slate-800/80 border-slate-700 backdrop-blur-md") : (activeFolder === "completed" ? "bg-white border-emerald-500 ring-4 ring-emerald-500/10" : "bg-white border-slate-200")}`}
        >
          <div className={`absolute top-0 left-0 w-2 h-full ${themeMode === "dark" ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" : "bg-emerald-500"}`} />
          <div className="flex items-center justify-between pl-2">
            <div className="space-y-1.5 flex-1 pr-4">
              <span className={`text-[10px] tracking-wider uppercase font-black block font-mono ${themeMode === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                {language === "bn" ? "সম্পন্ন করেছি (১০০% কমপ্লিট)" : "Completed Services"}
              </span>
              <span className={`text-4xl font-black tracking-tight font-sans ${themeMode === "dark" ? "text-slate-100" : "text-slate-900"}`}>
                {completedCount}
              </span>
              <span className={`text-[10.5px] font-bold block ${themeMode === "dark" ? "text-emerald-400" : "text-emerald-600"}`}>
                {language === "bn" ? "✓ সফল কাজের সার্টিফিকেট লগার" : "✓ Completed & digitally signed"}
              </span>
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border group-hover:scale-110 transition-transform duration-300 shadow-inner ${themeMode === "dark" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-emerald-50 text-emerald-600 border-emerald-100/50"}`}>
              <CheckCircle2 className="w-5.5 h-5.5" />
            </div>
          </div>
        </div>

        {/* Card 3: Partially Completed Services */}
        <div 
          onClick={() => setActiveFolder("partial")}
          className={`border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group cursor-pointer ${themeMode === "dark" ? (activeFolder === "partial" ? "bg-slate-800 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.25)]" : "bg-slate-800/80 border-slate-700 backdrop-blur-md") : (activeFolder === "partial" ? "bg-white border-amber-500 ring-4 ring-amber-500/10" : "bg-white border-slate-200")}`}
        >
          <div className={`absolute top-0 left-0 w-2 h-full ${themeMode === "dark" ? "bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]" : "bg-amber-500"}`} />
          <div className="flex items-center justify-between pl-2">
            <div className="space-y-1.5 flex-1 pr-4">
              <span className={`text-[10px] tracking-wider uppercase font-black block font-mono ${themeMode === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                {language === "bn" ? "কিছুটা বাদ আছে (এডিটেবল)" : "Partially Completed"}
              </span>
              <span className={`text-4xl font-black tracking-tight font-sans ${themeMode === "dark" ? "text-slate-100" : "text-slate-900"}`}>
                {partiallyCompletedCount}
              </span>
              <span className={`text-[10.5px] font-bold block ${themeMode === "dark" ? "text-amber-400" : "text-amber-600"}`}>
                {language === "bn" ? "📝 কি কি কাজ বাকি আছে ট্র্যাকার" : "📝 Skipped work & dynamic logs"}
              </span>
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border group-hover:scale-110 transition-transform duration-300 shadow-inner ${themeMode === "dark" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-amber-50 text-amber-600 border-amber-100/50"}`}>
              <Clock className="w-5.5 h-5.5" />
            </div>
          </div>
        </div>

        {/* Card 4: Not Completed / Pending */}
        <div 
          onClick={() => setActiveFolder("unstarted")}
          className={`border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group cursor-pointer ${themeMode === "dark" ? (activeFolder === "unstarted" ? "bg-slate-800 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.25)]" : "bg-slate-800/80 border-slate-700 backdrop-blur-md") : (activeFolder === "unstarted" ? "bg-white border-rose-500 ring-4 ring-rose-500/10" : "bg-white border-slate-200")}`}
        >
          <div className={`absolute top-0 left-0 w-2 h-full ${themeMode === "dark" ? "bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]" : "bg-rose-500"}`} />
          <div className="flex items-center justify-between pl-2">
            <div className="space-y-1.5 flex-1 pr-4">
              <span className={`text-[10px] tracking-wider uppercase font-black block font-mono ${themeMode === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                {language === "bn" ? "এখনো কোন কিছুই করা হয়নি" : "Not Started / Remaining"}
              </span>
              <span className={`text-4xl font-black tracking-tight font-sans ${themeMode === "dark" ? "text-slate-100" : "text-slate-900"}`}>
                {incompleteCentersCount}
              </span>
              <span className={`text-[10.5px] font-bold block ${themeMode === "dark" ? "text-rose-400" : "text-rose-600"}`}>
                {language === "bn" ? "⚠ নির্ধারিত কাজের ডিউ লিস্ট" : "⚠ Awaiting treatments / overdue"}
              </span>
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border group-hover:scale-110 transition-transform duration-300 shadow-inner ${themeMode === "dark" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-rose-50 text-rose-600 border-rose-100/50"}`}>
              <AlertOctagon className="w-5.5 h-5.5" />
            </div>
          </div>
        </div>

      </div>

      {/* ================= 📂 DYNAMIC FOLDER FILE TABS INDEX SWITCHER ================= */}
      <div id="dashboard-folder-tabs" className="flex border-b border-slate-200 overflow-x-auto scrollbar-none gap-2 px-1 select-none pt-2">
        {/* Tab 1: Completed Folders */}
        <button
          type="button"
          onClick={() => setActiveFolder("completed")}
          className={`px-5 py-3.5 text-xs font-black rounded-t-xl border-t-2 flex items-center gap-2 transition-all relative shrink-0 -mb-[1px] cursor-pointer ${
            activeFolder === "completed"
              ? (themeMode === "dark" ? "bg-slate-800 border-x border-slate-700 border-t-emerald-500 text-emerald-400 font-extrabold shadow-sm" : "bg-white border-x border-slate-200 border-t-emerald-500 text-emerald-800 font-extrabold shadow-sm")
              : (themeMode === "dark" ? "bg-slate-900 border-x border-transparent hover:bg-slate-800 text-slate-400 hover:text-slate-200" : "bg-slate-50 border-x border-transparent hover:bg-slate-100 text-slate-500 hover:text-slate-800")
          }`}
        >
          <span className="text-sm">📁</span>
          <span>{language === "bn" ? "সম্পূর্ণ কাজ শেষ" : "Fully Completed"}</span>
          <span className={`px-2 py-0.5 text-[9px] rounded-full font-mono font-bold ${
            activeFolder === "completed" ? (themeMode === "dark" ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-850") : (themeMode === "dark" ? "bg-slate-800 text-slate-400" : "bg-slate-200 text-slate-600")
          }`}>
            {completedCount}
          </span>
          {activeFolder === "completed" && (
            <div className={`absolute left-0 right-0 bottom-[-1px] h-[3px] z-10 ${themeMode === "dark" ? "bg-slate-800" : "bg-white"}`} />
          )}
        </button>

        {/* Tab 2: Partially Completed Folders */}
        <button
          type="button"
          onClick={() => setActiveFolder("partial")}
          className={`px-5 py-3.5 text-xs font-black rounded-t-xl border-t-2 flex items-center gap-2 transition-all relative shrink-0 -mb-[1px] cursor-pointer ${
            activeFolder === "partial"
              ? (themeMode === "dark" ? "bg-slate-800 border-x border-slate-700 border-t-amber-500 text-amber-400 font-extrabold shadow-sm" : "bg-white border-x border-slate-200 border-t-amber-500 text-amber-800 font-extrabold shadow-sm")
              : (themeMode === "dark" ? "bg-slate-900 border-x border-transparent hover:bg-slate-800 text-slate-400 hover:text-slate-200" : "bg-slate-50 border-x border-transparent hover:bg-slate-100 text-slate-500 hover:text-slate-800")
          }`}
        >
          <span className="text-sm">📁</span>
          <span>{language === "bn" ? "কিছুটা বাদ আছে" : "Partially Completed"}</span>
          <span className={`px-2 py-0.5 text-[9px] rounded-full font-mono font-bold ${
            activeFolder === "partial" ? (themeMode === "dark" ? "bg-amber-500/20 text-amber-400" : "bg-amber-100 text-amber-850") : (themeMode === "dark" ? "bg-slate-800 text-slate-400" : "bg-slate-200 text-slate-600")
          }`}>
            {partiallyCompletedCount}
          </span>
          {activeFolder === "partial" && (
            <div className={`absolute left-0 right-0 bottom-[-1px] h-[3px] z-10 ${themeMode === "dark" ? "bg-slate-800" : "bg-white"}`} />
          )}
        </button>

        {/* Tab 3: Not Started Folders */}
        <button
          type="button"
          onClick={() => setActiveFolder("unstarted")}
          className={`px-5 py-3.5 text-xs font-black rounded-t-xl border-t-2 flex items-center gap-2 transition-all relative shrink-0 -mb-[1px] cursor-pointer ${
            activeFolder === "unstarted"
              ? (themeMode === "dark" ? "bg-slate-800 border-x border-slate-700 border-t-rose-500 text-rose-400 font-extrabold shadow-sm" : "bg-white border-x border-slate-200 border-t-rose-500 text-rose-800 font-extrabold shadow-sm")
              : (themeMode === "dark" ? "bg-slate-900 border-x border-transparent hover:bg-slate-800 text-slate-400 hover:text-slate-200" : "bg-slate-50 border-x border-transparent hover:bg-slate-100 text-slate-500 hover:text-slate-800")
          }`}
        >
          <span className="text-sm">📁</span>
          <span>{language === "bn" ? "এখনো কিছু করা হয়নি" : "Not Completed"}</span>
          <span className={`px-2 py-0.5 text-[9px] rounded-full font-mono font-bold ${
            activeFolder === "unstarted" ? (themeMode === "dark" ? "bg-rose-500/20 text-rose-400" : "bg-rose-100 text-rose-850") : (themeMode === "dark" ? "bg-slate-800 text-slate-400" : "bg-slate-200 text-slate-600")
          }`}>
            {incompleteCentersCount}
          </span>
          {activeFolder === "unstarted" && (
            <div className={`absolute left-0 right-0 bottom-[-1px] h-[3px] z-10 ${themeMode === "dark" ? "bg-slate-800" : "bg-white"}`} />
          )}
        </button>
      </div>

      {/* ================= 📂 UNIFIED FILE FOLDER DOCUMENT CONTAINER ================= */}
      <div className={`border rounded-b-2xl shadow-lg -mt-[1px] relative animate-fadeIn transition-all ${themeMode === "dark" ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
        
        {/* ================= SLOT 1: OPERATIONS LEDGER (COMPLETED OPERATIONS) ================= */}
        {activeFolder === "completed" && (
          <div className="animate-fadeIn">
            <div className={`p-5 md:p-6 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${themeMode === "dark" ? "bg-slate-800/80 border-slate-700" : "bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200"}`}>
              <div>
                <h2 className={`text-base font-black flex items-center gap-2 ${themeMode === "dark" ? "text-slate-100" : "text-slate-900"}`}>
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span>{language === "bn" ? "সম্পূর্ণ কাজ শেষ হয়ে গেছে কমপ্লিট" : "Operations Ledger (Completed Services)"}</span>
                </h2>
                <p className={`text-[11px] font-medium ${themeMode === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                  {language === "bn" ? "সিস্টেম ডাটাবেসে সফলভাবে সাবমিট ও রেজিস্টার হওয়া চিকিৎসার রেকর্ড।" : "Live list of processed operations saved securely inside central medical logbook."}
                </p>
              </div>
              
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {/* Emirate filter */}
                <select
                  value={emirateFilter}
                  onChange={(e) => setEmirateFilter(e.target.value)}
                  className={`border text-[11px] font-bold px-2 py-1.5 rounded-lg outline-none cursor-pointer focus:border-indigo-500 ${themeMode === "dark" ? "bg-slate-900 border-slate-600 text-slate-200" : "bg-white border-slate-350 text-slate-800"}`}
                >
                  <option value="All">{language === "bn" ? "সব এমিরেট" : "All Emirates"}</option>
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
                    placeholder={language === "bn" ? "সেন্টার বা টিকিট নম্বর..." : "Search completed clinics..."}
                    className={`w-full text-[11px] pl-8 pr-2 py-1.5 border rounded-lg outline-none focus:border-indigo-500 ${themeMode === "dark" ? "bg-slate-900 border-slate-600 text-slate-200 placeholder-slate-500" : "bg-white border-slate-350 text-slate-800 placeholder-slate-400"}`}
                  />
                </div>
              </div>
            </div>

            {/* Completed Table */}
            <div className={`overflow-x-auto ${themeMode === "dark" ? "bg-slate-800" : "bg-white"}`}>
              {filteredCompletedReports.length === 0 ? (
                <div className="p-12 text-center text-slate-400 space-y-2">
                  <span className="text-3xl block">📁</span>
                  <p className="text-[11px] font-bold">
                    {language === "bn" ? "কোন মেলানো সম্পন্ন রিপোর্ট পাওয়া যায়নি" : "No completed records matching filters found."}
                  </p>
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className={`uppercase font-mono tracking-wider text-[9px] select-none border-b ${themeMode === "dark" ? "bg-slate-800 text-slate-400 border-slate-700" : "bg-slate-50 text-slate-500 border-slate-200"}`}>
                      <th className="py-3 px-4 font-black">{language === "bn" ? "লগ আইডি" : "LOG ID"}</th>
                      <th className="py-3 px-4 font-black">{language === "bn" ? "সেন্টার / হসপিটাল" : "MEDICAL FACILITY"}</th>
                      <th className="py-3 px-4 font-black">{language === "bn" ? "তারিখ ও সময়" : "DATE & TIME"}</th>
                      <th className="py-3 px-4 font-black">{language === "bn" ? "পেমেন্ট অবস্থা" : "BILLING CASH STATUS"}</th>
                      <th className="py-3 px-4 font-black text-center">{language === "bn" ? "অ্যাকশন" : "ACTIONS"}</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y font-medium ${themeMode === "dark" ? "divide-slate-700/50" : "divide-slate-100"}`}>
                    {filteredCompletedReports.map((report, idx) => {
                      // Determine if free service: either isFreeService is true, or billing.amount is empty/0/"No Charge"
                      const isFree = !report.billing?.amount || 
                                     report.billing?.amount === 0 || 
                                     String(report.billing?.amount).toLowerCase().trim() === "no charge" ||
                                     String(report.billing?.amount).trim() === "" ||
                                     String(report.billing?.amount).trim() === "No";

                      return (
                        <tr key={`${report.id}-${idx}`} className={`transition-colors ${themeMode === "dark" ? "hover:bg-slate-700/50" : "hover:bg-slate-50/50"}`}>
                          <td className={`py-3 px-4 font-mono text-[10.5px] font-bold ${themeMode === "dark" ? "text-slate-400" : "text-slate-550"}`}>
                            {report.id}
                          </td>
                          <td className={`py-3 px-4 ${themeMode === "dark" ? "text-slate-100" : "text-slate-900"}`}>
                            <span className="font-extrabold text-[12px] block">{report.facilityName}</span>
                            <span className={`text-[10px] block ${themeMode === "dark" ? "text-slate-400" : "text-slate-400"}`}>{report.emirate} • {formatFacilityType(report.facilityType, language)}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`block font-bold ${themeMode === "dark" ? "text-slate-200" : "text-slate-700"}`}>{report.dateOfOperation}</span>
                            <span className={`text-[10px] block font-mono ${themeMode === "dark" ? "text-slate-400" : "text-slate-400"}`}>{report.startTime} - {report.endTime}</span>
                          </td>
                          
                          {/* Strictly respect: "টাকার কোন অপশন যাতে না আসে ফ্রি হলে" */}
                          <td className="py-3 px-4">
                            {isFree ? (
                              <span className={`text-[9.5px] px-2 py-0.5 rounded font-bold uppercase border ${themeMode === "dark" ? "bg-slate-800 text-slate-400 border-slate-600" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                                {language === "bn" ? "বিনামূল্যে সার্ভিস" : "Complimentary Service"}
                              </span>
                            ) : (
                              <div className="space-y-0.5">
                                <span className={`font-extrabold text-[11px] px-2 py-0.5 rounded border inline-block font-mono ${themeMode === "dark" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-emerald-50 text-emerald-700 border-emerald-100"}`}>
                                  {report.billing?.amount} AED
                                </span>
                                <span className={`text-[9px] block font-bold uppercase pl-1 ${themeMode === "dark" ? "text-slate-500" : "text-slate-400"}`}>
                                  • Paid ({report.billing?.method || "Cash"})
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => setActiveReportDetails(report)}
                              className={`px-3 py-1.5 font-black rounded-lg text-[10.5px] inline-flex items-center gap-1 cursor-pointer transition active:scale-95 border ${themeMode === "dark" ? "bg-indigo-500/10 hover:bg-indigo-500/20 border-indigo-500/20 text-indigo-400 hover:text-indigo-300" : "bg-indigo-50 hover:bg-indigo-100 border-indigo-100 text-indigo-700 hover:text-indigo-800"}`}
                            >
                              👁️ <span>{language === "bn" ? "দেখুন ও প্রিন্ট" : "View & PDF"}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ================= SLOT 2: PARTIALLY COMPLETED SERVICES (অর্ধেক সম্পন্ন কাজ) ================= */}
        {activeFolder === "partial" && (
          <div id="partially-completed-slot-card" className="animate-fadeIn">
            <div className="p-5 md:p-6 bg-gradient-to-r from-amber-500/10 via-amber-200/5 to-transparent border-b border-amber-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-500" />
                  <span>{language === "bn" ? "কিছুটা বাদ আছে" : "Partially Completed Services & Remaining Logs"}</span>
                </h2>
                <p className="text-[11px] text-slate-500 font-medium">
                  {language === "bn" ? "যেসব সেন্টারের কাজ আংশিক সম্পন্ন হয়েছে এবং কিছু কাজ এখনও বাকি আছে। যেকোনো কার্ডে ট্যাপ করে নিজের ইচ্ছা মত পরিবর্তন করুন।" : "Listed facilities where service was partially done with pending tasks. Tap directly on any item to write or edit completed/leftover notes."}
                </p>
              </div>
            </div>

            {/* List Grid of Partially Completed Services */}
            <div className={`p-5 md:p-6 ${themeMode === "dark" ? "bg-slate-800" : "bg-slate-50/30"}`}>
              {filteredPartiallyCompletedReports.length === 0 ? (
                <div className={`p-12 text-center text-slate-400 space-y-2 border border-dashed rounded-xl ${themeMode === "dark" ? "border-slate-700 bg-slate-800/80" : "border-slate-200 bg-white"}`}>
                  <span className="text-3xl block">📋</span>
                  <p className="text-xs font-bold text-slate-500">
                    {language === "bn" ? "বর্তমানে কোনো আংশিক সম্পন্ন হওয়া কাজের রেকর্ড নেই!" : "No partially completed service records logged currently."}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {language === "bn" ? "নিচে থাকা বকেয়া বা 'কমপ্লিট করি নাই' তালিকা থেকে 'আংশিক সম্পন্ন' বাটনে ট্যাপ করে নতুন রেকর্ড যোগ করুন।" : "You can mark any pending service below as 'Partially Completed' to add notes."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredPartiallyCompletedReports.map((report, idx) => {
                    const defaultNotes = `✓ কি কি কাজ সম্পন্ন করা হয়েছে:\n- কাজ শুরু করা হয়েছে।\n\n⚠ কি কি কাজ বাকি রয়েছে:\n- কিছু নির্দিষ্ট স্থান ও বাথরুম প্রুফিং বাকি রয়ে গেছে।`;
                    const notesToDisplay = report.partialNotes || defaultNotes;
                    return (
                      <div 
                        key={`${report.id}-${idx}`}
                        id={`partial-card-${report.id}`}
                        onClick={() => {
                          setEditingPartialReportId(report.id);
                          setEditingNotesText(notesToDisplay);
                        }}
                        className={`p-5 border rounded-xl shadow-xs hover:border-amber-400/80 hover:shadow-md transition-all duration-300 cursor-pointer group relative flex flex-col justify-between ${themeMode === "dark" ? "bg-slate-800/80 border-slate-700 hover:bg-slate-700/80" : "bg-white border-slate-200"}`}
                      >
                        <div className="absolute top-3 right-3 shrink-0 flex items-center gap-1">
                          <span className={`text-[9px] font-mono tracking-wider font-extrabold px-2 py-0.5 rounded border ${themeMode === "dark" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-amber-100 text-amber-800 border-amber-200"}`}>
                            PARTIAL DONE
                          </span>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <h3 className={`text-xs font-sans font-extrabold group-hover:text-amber-500 transition-colors flex items-center gap-1.5 ${themeMode === "dark" ? "text-slate-100" : "text-[#1E293B]"}`}>
                              <Building className="w-4 h-4 text-amber-500" />
                              <span>{report.facilityName}</span>
                            </h3>
                            <p className="text-[10px] text-slate-400 font-mono font-bold mt-0.5">
                              TICKET: {report.ticketNo || "N/A"} • ID: {report.id}
                            </p>
                          </div>

                          {/* Display Notes Block */}
                          <div className={`p-3 border rounded-lg space-y-1.5 text-left transition-all ${themeMode === "dark" ? "bg-slate-900/50 border-slate-700 group-hover:bg-slate-800 group-hover:border-amber-500/30" : "bg-slate-50 border-slate-200 group-hover:bg-amber-50/10"}`}>
                            <span className="text-[10px] font-mono font-extrabold text-slate-500 uppercase flex items-center gap-1">
                              <FileText className="w-3.5 h-3.5 text-amber-500" />
                              {language === "bn" ? "কাজের বিবরণী (ট্যাপ করে সংশোধন করুন):" : "Done / Skipped Work (Tap to edit):"}
                            </span>
                            <p className={`text-xs whitespace-pre-line leading-relaxed font-sans font-semibold ${themeMode === "dark" ? "text-slate-300" : "text-slate-700"}`}>
                              {notesToDisplay}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                          <div className="text-[10px] text-slate-500 flex items-center gap-1 font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            <span>Date: {report.dateOfOperation}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              id={`btn-edit-partial-${report.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingPartialReportId(report.id);
                                setEditingNotesText(notesToDisplay);
                              }}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-705 rounded-lg text-[10px] font-black border border-slate-200 inline-flex items-center gap-1 transition active:scale-95"
                            >
                              <Edit3 className="w-3 h-3 text-slate-550" />
                              <span>{language === "bn" ? "সংশোধন" : "Edit Notes"}</span>
                            </button>

                            <button
                              type="button"
                              id={`btn-complete-partial-${report.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsFullyCompleted(report.id);
                              }}
                              className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-450 text-slate-950 rounded-lg text-[10px] font-black inline-flex items-center gap-1 shadow-sm transition active:scale-95"
                            >
                              <CheckCircle2 className="w-3 h-3 text-slate-950" />
                              <span>{language === "bn" ? "কাজ শেষ করুন" : "Finish Job"}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= SLOT 3: NOT COMPLETED PENDING TRACKER ================= */}
        {activeFolder === "unstarted" && (
          <div className="animate-fadeIn">
            <div className="p-5 md:p-6 bg-gradient-to-r from-amber-5/50 to-orange-50/20 border-b border-slate-200">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-rose-500 animate-pulse" />
                <span>{language === "bn" ? "এখনো কোন কিছুই করা হয়নি" : "Not Completed / Pending Scheduled Operations"}</span>
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                {language === "bn" ? "নিচে আপনার আন্ডারে থাকা যে হসপিটালগুলোর কাজ এখনো চালু বা কোনো সার্ভিস প্রদান করা হয়নি তাদের তালিকা।" : "Active list of clinical accounts awaiting monthly operations cycle with physical countdown metrics."}
              </p>
            </div>

            {/* Incomplete Table */}
            <div className="overflow-x-auto">
              {incompleteCentersList.length === 0 ? (
                <div className="p-12 text-center text-slate-400 space-y-1">
                  <span className="text-3xl block">🏆</span>
                  <p className="text-[11px] font-bold text-emerald-600">
                    {language === "bn" ? "অসাধারণ! আপনার সব হাসপাতালের কাজ সম্পন্ন হয়েছে।" : "Incredible coverage! 100% of centers have been completed!"}
                  </p>
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className={`uppercase font-mono tracking-wider text-[9px] select-none border-b ${themeMode === "dark" ? "bg-slate-800 text-slate-400 border-slate-700" : "bg-slate-50 text-slate-500 border-slate-200"}`}>
                      <th className="py-3 px-4 font-black">{language === "bn" ? "হাসপাতাল / ক্লিনিক নাম" : "AWAITING SERVICE FACILITY"}</th>
                      <th className="py-3 px-4 font-black">{language === "bn" ? "নির্ধারিত পরবর্তী মেয়াদ" : "DUE DATE EXPRY"}</th>
                      <th className="py-3 px-4 font-black">{language === "bn" ? "বাকি সময় বা অতিবাহিত" : "LIVELY STATUS / METRIC"}</th>
                      <th className="py-3 px-4 font-black text-center">{language === "bn" ? "অপারেশন কোড" : "QUICK ACTION"}</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y font-medium ${themeMode === "dark" ? "divide-slate-700/50" : "divide-slate-100"}`}>
                    {incompleteCentersList.map((facilityName) => {
                      const { dueDateStr, diffDays } = getDeterministicDueDateAndDiff(facilityName);

                      return (
                        <tr key={facilityName} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 px-4 text-slate-900">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-650 font-mono text-[11px]">
                                🏥
                              </div>
                              <div>
                                <span className="font-extrabold text-[12px] block text-slate-900">{facilityName}</span>
                                <span className="text-[10px] text-slate-400 block font-mono">
                                  REGISTRY ID: ALW-CLI-{(facilityName.length * 31) % 9999 + 1000}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-700 font-mono font-bold text-[11px]">
                            {dueDateStr}
                          </td>
                          <td className="py-3.5 px-4">
                            {(() => {
                              if (diffDays < 0) {
                                return (
                                  <span className="text-[10px] text-rose-600 bg-rose-50 border border-rose-100 px-2.5 py-1 rounded inline-flex items-center gap-1 font-black">
                                    ⚠️ {language === "bn" ? `${Math.abs(diffDays)} দিন পার হয়ে গেছে!` : `${Math.abs(diffDays)}d Overdue`}
                                  </span>
                                );
                              } else if (diffDays === 0) {
                                return (
                                  <span className="text-[10px] text-amber-600 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded inline-flex items-center gap-1 font-black animate-pulse">
                                    🔔 {language === "bn" ? "আজই শেষ দিন" : "Today"}
                                  </span>
                                );
                          } else if (diffDays <= 4) {
                            return (
                              <span className="text-[10px] text-[#2563EB] bg-blue-50 border border-blue-105 px-2.5 py-1 rounded inline-flex items-center gap-1 font-black">
                                📅 {language === "bn" ? `${diffDays} দিন বাকি` : `${diffDays}d left`}
                              </span>
                            );
                          } else {
                            return (
                              <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded inline-flex items-center gap-1 font-black">
                                📅 {language === "bn" ? `${diffDays} দিন বাকি` : `${diffDays}d left`}
                              </span>
                            );
                          }
                        })()}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setCreatingPartialCenterName(facilityName);
                            }}
                            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-extrabold rounded-lg text-[10.5px] inline-flex items-center gap-1 border border-amber-200 cursor-pointer transition active:scale-95 shadow-xs"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>{language === "bn" ? "আংশিক সম্পন্ন" : "Mark Partial"}</span>
                          </button>

                          <button
                            onClick={() => handleQuickDispatch(facilityName)}
                            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-lg text-[10.5px] inline-flex items-center gap-1.5 cursor-pointer transition active:scale-95 shadow-xs"
                          >
                            ⚡ <span>{language === "bn" ? "সম্পূর্ণ করুন" : "Complete"}</span>
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
      )}
      </div>
      {/* ================= COMPREHENSIVE DIRECT VIEW & PRINT MODAL OVERLAY ================= */}
      {activeReportDetails && (
        <div id="erp-view-details-overlay" className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs transition-all">
          
          {/* Printable Container wrapper */}
          <div className="bg-[#FFFDF3] border-2 border-slate-900 max-w-4xl w-full h-[90vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl relative text-slate-900 font-sans border-t-8 border-t-indigo-600">
            
            {/* Header Tools (Hidden in Print) */}
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center no-print shrink-0">
              <div className="flex items-center gap-1">
                <span className="text-rose-500 text-xs">●</span>
                <span className="text-xs font-black tracking-widest font-mono text-slate-300">
                  {language === "bn" ? "অপারেশন প্রুফ ভিউয়ার" : "AL WAFA STAR PDF COMPLIANCE GATEWAY"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPDF}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 text-white font-black rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition duration-150 shadow animate-fadeIn"
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
                  <span>{simulatedPrint ? (language === "bn" ? "প্রিন্ট হচ্ছে..." : "Preparing...") : (language === "bn" ? "ব্রাউজার প্রিন্ট / PDF" : "Browser Print")}</span>
                </button>
                <button
                  onClick={() => setActiveReportDetails(null)}
                  className="p-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer flex items-center justify-center text-xs"
                >
                  <X className="w-4 h-4 cursor-pointer" />
                </button>
              </div>
            </div>

            {/* Print Friendly Sandbox Tip (Hidden in print) */}
            <div className="px-5 py-2.5 bg-indigo-50 border-b border-indigo-200 text-indigo-900 text-[11px] font-bold flex items-center gap-2 no-print shrink-0">
              <span className="text-sm">💡</span>
              <p>
                {language === "bn" 
                  ? "ইন্টারনেট ব্রাউজার থেকে সরাসরি PDF ডাউনলোড করতে উপরের প্রিন্ট বাটনে চাপ দিন। কোনো কারণে পপআপ বা উইন্ডো না খুললে, স্ক্রীনের উপরে ডানে থাকা 'Open in New Tab' বাটনে ক্লিক করে অ্যাপটি খুলুন।" 
                  : "To download as PDF, click print and choose 'Save as PDF'. If the print layout is blocked, please click the native 'Open in New Tab' portal launcher on the top right."}
              </p>
            </div>

            {/* Main scroll viewport of physical document */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
              
              {/* Printable sheet mirroring physical format precisely */}
              <div id="printable-service-report" className="print-sheet-paper space-y-6 text-slate-950 relative">
                
                {/* Red star watermark in the absolute background */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.06] select-none z-0">
                  <svg viewBox="0 0 100 100" className="w-[140mm] h-[140mm] object-contain">
                    <polygon points="50,5 64,36 98,36 71,57 81,91 50,70 19,91 29,57 2,36 36,36" fill="#ED1C24" />
                  </svg>
                </div>

                {/* ================= PAPER HEADER BLOCK ================= */}
                <div className="border border-slate-800 p-3 mb-3 bg-white relative z-10">
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
                              isChecked ? "border-slate-800 bg-emerald-50 text-emerald-950 font-black" : "border-slate-300 bg-white"
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
                                            ? "border-slate-805 bg-indigo-50 text-indigo-900 font-black" 
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
                                <td className="p-2 border border-slate-205 text-slate-850 font-bold uppercase font-sans text-[10px]">
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
                        <div className="bg-white p-2 rounded-lg border border-slate-350">
                          <span className="text-slate-400 block text-[8px] font-bold uppercase">INVOICE SERIAL NO</span>
                          <span className="font-mono font-bold text-slate-850 block mt-0.5">{activeReportDetails.billing?.invoiceNo || `PC-${activeReportDetails.id}`}</span>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-slate-350">
                          <span className="text-slate-400 block text-[8px] font-bold uppercase">SUBTOTAL AMOUNT</span>
                          <span className="font-mono font-extrabold text-slate-850 block mt-0.5">{activeReportDetails.billing?.amount || 0} AED</span>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-slate-350">
                          <span className="text-slate-400 block text-[8px] font-bold uppercase">TAX (5.0% GST)</span>
                          <span className="font-mono text-slate-500 font-bold block mt-0.5">{activeReportDetails.billing?.vat || 0} AED</span>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-350 p-2 rounded-lg">
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
                      <span className="text-slate-505 block uppercase text-[8px] font-bold">Engineer & Technician Signature</span>
                      <div className="h-20 border border-dashed border-slate-300 rounded-lg flex items-center justify-center p-1 bg-white shadow-inner">
                        {activeReportDetails.signatures?.technician || activeReportDetails.signatures?.supervisor ? (
                          <img src={activeReportDetails.signatures.technician || activeReportDetails.signatures.supervisor} alt="Engineer & Technician signature" className="max-h-16 object-contain" />
                        ) : (
                          <span className="bg-sky-50 text-sky-700 text-[8px] font-bold px-2 py-1 rounded border border-sky-100 select-none">CERTIFIED OPERATOR</span>
                        )}
                      </div>
                      <span className="font-sans block text-slate-805 font-semibold text-[9.5px]">AL WAFA Specialist</span>
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

          </div>
        </div>
      )}

      {/* ================= MODAL EDITOR: EDIT DONE/REMAINING WORK NOTES ================= */}
      {editingPartialReportId !== null && (() => {
        const report = reports.find(r => r.id === editingPartialReportId);
        if (!report) return null;
        return (
          <div id="edit-partial-notes-modal" className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs select-none animate-fadeIn font-sans">
            <div className="bg-white max-w-lg w-full rounded-2xl overflow-hidden shadow-2xl border-t-8 border-amber-500 animate-scaleIn text-slate-800">
              {/* Header */}
              <div className="p-5 border-b border-slate-100 bg-gradient-to-br from-amber-50 to-white flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] bg-amber-150 text-amber-800 font-mono font-black tracking-widest uppercase px-2 py-0.5 rounded border border-amber-250">
                    EDIT SERVICE MESSAGE
                  </span>
                  <h3 className="text-base font-black tracking-tight text-slate-900 leading-tight">
                    {report.facilityName}
                  </h3>
                  <p className="text-[10.5px] text-slate-500 font-medium">
                    {language === "bn" ? "কি কি কাজ শেষ হয়েছে এবং কি কি কাজ বকেয়া রয়েছে তা নিচে এডিট বা আপডেট করুন" : "Specify what has been done and what remains incomplete below."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingPartialReportId(null)}
                  className="p-1 text-slate-400 hover:text-slate-650 rounded-full hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body Content */}
              <div className="p-5 space-y-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-slate-500 uppercase block tracking-wider">
                    {language === "bn" ? "কার্যের খতিয়ান ও মেসেজ বিবরণী:" : "Skipped & Completed Details Message:"}
                  </label>
                  <textarea
                    rows={8}
                    value={editingNotesText}
                    onChange={(e) => setEditingNotesText(e.target.value)}
                    placeholder={`✓ কি কি কাজ সম্পূর্ণ করা হয়েছে:\n- \n\n⚠ কি কি কাজ বাকি রয়েছে:\n- `}
                    className="w-full bg-slate-50 border border-slate-350 rounded-xl p-3 text-xs font-semibold focus:bg-white focus:border-amber-500 outline-none transition-all leading-relaxed"
                  />
                </div>

                {/* Quick helpers tagging row */}
                <div className="space-y-1.5">
                  <span className="text-[9.5px] font-mono text-slate-400 font-bold block">
                    ⚡ QUICK INSERT WORK TEMPLATES:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { icon: "✓", textBn: "এসি নালী স্প্রে সম্পূর্ণ", textEn: "AC duct spraying complete" },
                      { icon: "✓", textBn: "কিচেন ও বাথ এরিয়া ফগিং ও স্প্রে শেষ", textEn: "Kitchen & bath fogging complete" },
                      { icon: "⚠", textBn: "কাউন্টার ও টেবিল প্রুফিং বাকি রয়ে গেছে", textEn: "Counter & table proofing remaining" },
                      { icon: "⚠", textBn: "ওটি (OT) এরিয়া পরিদর্শন বাকি", textEn: "OT area inspection remaining" }
                    ].map((tag, idx) => {
                      const textLabel = language === "bn" ? tag.textBn : tag.textEn;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            const separator = editingNotesText ? "\n" : "";
                            setEditingNotesText(prev => `${prev}${separator}${tag.icon} ${textLabel}`);
                          }}
                          className="text-[10px] bg-slate-100 hover:bg-amber-100 text-slate-705 hover:text-amber-805 border border-slate-205 hover:border-amber-350 px-2 py-1 rounded-lg font-bold transition cursor-pointer"
                        >
                          {tag.icon} {textLabel}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-5 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setEditingPartialReportId(null)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-150 text-slate-700 font-extrabold rounded-xl text-xs cursor-pointer transition active:scale-95"
                >
                  {language === "bn" ? "বাতিল" : "Cancel"}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleMarkAsFullyCompleted(report.id)}
                    className="px-3.5 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-extrabold rounded-xl text-xs cursor-pointer border border-emerald-300 transition active:scale-95 inline-flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-650" />
                    <span>{language === "bn" ? "১০০% শেষ করুন" : "Set Complete"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSavePartialNotes}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs cursor-pointer shadow-md shadow-amber-500/10 transition active:scale-95 flex items-center gap-1"
                  >
                    <span>{language === "bn" ? "সংরক্ষণ করুন" : "Save Changes"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ================= MODAL EDITOR: INITIALIZE NEW PARTIAL REPORT ================= */}
      {creatingPartialCenterName !== null && (
        <ScheduleRouteDutyModal
          facilityName={creatingPartialCenterName}
          language={language}
          onClose={() => setCreatingPartialCenterName(null)}
          onSave={(data) => handleCreatePartialReport(data)}
        />
      )}

    </div>
  );
}
