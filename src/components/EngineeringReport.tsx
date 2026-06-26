import React, { useState, useEffect, useRef } from "react";
// @ts-ignore
import { 
  FileText, 
  Plus, 
  Trash2, 
  Printer, 
  Image as ImageIcon, 
  FileCheck,
  Sparkles, 
  BookOpen, 
  Edit3, 
  Eye, 
  ChevronRight, 
  ChevronDown,
  FileDown,
  Info,
  Camera,
  FolderOpen,
  Wifi,
  Calendar,
  Settings2,
  Video,
  Flashlight,
  FlashlightOff,
  X
} from "lucide-react";
import { AppLanguage, LocationRegistryItem } from "../types";
import { INITIAL_LOCATIONS_REGISTRY } from "./LocationsRegistry";
import AlWafaLogo from "./AlWafaLogo";
import { generateEngineeringHTML } from "./ClientDirectory";
import { getDocuments, saveDocument, deleteDocument, subscribeCollection } from "../localDatabase";

// Static pre-made professional templates in English, Bengali & Arabic for quick click insertion
const WORK_TEMPLATES = [
  {
    title: { 
      en: "Bait Station Installation", 
      bn: "টোপ স্টেশন স্থাপন", 
      ar: "تركيب محطة الطعوم خارجية" 
    },
    text: {
      en: "We have successfully installed external termite bait stations at major perimeter security points. Fresh industrial pesticide rods have been loaded to guard the facility boundary.",
      bn: "আমরা সফলভাবে বাহ্যিক উইপোকা নিয়ন্ত্রণ টোপ স্টেশনগুলো স্থাপন করেছি। ভবনের সীমানা নজরদারির জন্য নতুন টোপ লোড করা হয়েছে।",
      ar: "لقد قمنا بنجاح بتركيب محطات طعوم النمل الأبيض الخارجية في نقاط الأمان الرئيسية المحيطة بالمبنى. تم تعبئة قضبان مبيدات حشرية صناعية جديدة لتأمين حدود المنشأة."
    }
  },
  {
    title: { 
      en: "Gel Treatment Completed", 
      bn: "জেল প্রয়োগ অপারেশন", 
      ar: "تمت معالجة الجل لانتشار الآفات" 
    },
    text: {
      en: "Applied professional gel bait in critical kitchen drawer corners, electrical shafts, and storage conduits. Excellent non-spray safety treatment for sensitive food areas.",
      bn: "রান্নাঘরের ড্রয়ারের ভেতরের কোণ, বৈদ্যুতিক প্যানেল এবং স্টোরেজ নালীতে প্রফেশনাল জেল বা টোপ প্রয়োগ সম্পন্ন করা হয়েছে।",
      ar: "تم تطبيق طعوم الجل المهنية في زوايا أدراج المطبخ الحساسة، اللوحات الكهربائية، ومجاري التخزين. معالجة غير مرشّة آمنة وممتازة لمناطق الأغذية الحساسة."
    }
  },
  {
    title: { 
      en: "Insecticidal Fogging & Barrier Spray", 
      bn: "ডিসইনফেকশন ও ব্যারিয়ার স্প্রে", 
      ar: "الرش المعقم والرش الضبابي للحاجز" 
    },
    text: {
      en: "A robust insecticidal barrier spray has been completed along peripheral floor junctions. Thorough chemical misting has been executed to prevent cockroach and crawler intrusion.",
      bn: "মেঝের চারপাশের জয়েন্টগুলোতে শক্তিশালী ব্যারিয়ার স্প্রে ছিটানো হয়েছে। পোকামাকড়ের উপদ্রব ঠেকাতে পুঙ্খানুপুঙ্খ কেমিক্যাল কুয়াশা ছিটানো সম্পন্ন হয়েছে।",
      ar: "تم إكمال رش حاجز قوي لمبيد الحشرات على طول مفاصل الأرضيات الخارجية. تم تنفيذ تضبيب كيميائي دقيق لمنع دخول الصراصير والحشرات الزاحفة."
    }
  },
  {
    title: { 
      en: "Station Inspection & Remediation", 
      bn: "স্টেশন পরিদর্শন ও সংস্কার", 
      ar: "فحص المحطات وتعديل الطعوم" 
    },
    text: {
      en: "Conducted double-check inspection of all pre-existing control traps. Rebaited 4 worn out bait containers and cleared organic debris buildups inside.",
      bn: "পূর্বে স্থাপিত সকল কন্ট্রোল ট্র্যাপসমূহ দ্বিগুণ সতর্কতা মেনে পরিদর্শন করেছি। ৪ টি ক্ষতিগ্রস্থ টোপ কন্টেইনার নতুন করে সাজানো হয়েছে এবং ময়লা পরিষ্কার করা হয়েছে।",
      ar: "تم فحص جميع مصائد المكافحة الموجودة مسبقًا بدقة. تم تجديد الطعوم لـ 4 حاويات طعوم تالفة وتنظيف التراكمات العضوية بداخلها."
    }
  }
];

export const PRESET_ZONES: { id: string; labelBN: string; labelEN: string; labelAR: string; icon: string }[] = [];

export const AVAILABLE_ADDABLE_CATEGORIES: { id: string; labelBN: string; labelEN: string; labelAR: string; icon: string }[] = [
  { id: "office_corridor", labelEN: "OFFICE CORRIDOR", labelBN: "অফিস করিডোর", labelAR: "ممر المكتب", icon: "📍" },
  { id: "office_rooms", labelEN: "OFFICE AREA", labelBN: "অফিস এরিয়া", labelAR: "منطقة المكاتب", icon: "📍" },
  { id: "pantry_kitchen", labelEN: "PANTRY & KITCHEN", labelBN: "প্যান্ট্রি ও কিচেন", labelAR: "المطبخ والبانتري", icon: "📍" },
  { id: "washroom_toilets", labelEN: "WASHROOM & TOILETS", labelBN: "ওয়াশরুম ও টয়লেট", labelAR: "دورات المياه", icon: "📍" },
  { id: "treatment_photo", labelEN: "TREATMENT PHOTO", labelBN: "ট্রিটমেন্ট ফটো", labelAR: "صور المعالجة", icon: "📍" },
  { id: "infestation_photo", labelEN: "INFESTATION PHOTO", labelBN: "ইনফেস্টেশন ফটো", labelAR: "صور الإصابة", icon: "📍" }
];

export const EMIRATE_HOSPITALS: Record<string, { en: string; bn: string; ar: string }[]> = {
  "Dubai": [
    { en: "Rashid Hospital", bn: "রাশিদ হাসপাতাল", ar: "مستشفى راشد" },
    { en: "Dubai Hospital", bn: "দুবাই হাসপাতাল", ar: "مستشفى دبي" },
    { en: "Latifa Hospital", bn: "লতিফা হাসপাতাল", ar: "مستشفى لطيفة" },
    { en: "Aster Hospital Mankhool", bn: "অ্যাস্টার হাসপাতাল মানখুল", ar: "مستشفى أستر المنخول" },
    { en: "Mediclinic City Hospital", bn: "মেডিক্লিনিক সিটি হাসপাতাল", ar: "مستشفى ميدكليك سيتي" },
    { en: "King's College Hospital", bn: "কিংস কলেজ হাসপাতাল", ar: "مستشفى كينغز كوليج" },
    { en: "Saudi German Hospital Dubai", bn: "সৌদি জার্মান হাসপাতাল দুবাই", ar: "المستشفى السعودي الألماني دبي" },
    { en: "Prime Hospital Al Garhoud", bn: "প্রাইম হাসপাতাল আল গারহুদ", ar: "مستشفى برايم القرهود" }
  ],
  "Abu Dhabi": [
    { en: "Sheikh Shakhbout Medical City (SSMC)", bn: "শেখ সাখবুত মেডিকেল সিটি", ar: "مدينة الشيخ شخبوط الطبية" },
    { en: "Cleveland Clinic Abu Dhabi", bn: "ক্লিভল্যান্ড ক্লিনিক আবুধাবি", ar: "كليفلاند كلينك أبوظبي" },
    { en: "Burjeel Hospital Abu Dhabi", bn: "বুর্জিল হাসপাতাল আবুধাবি", ar: "مستشفى برجيل أبوظبي" },
    { en: "NMC Royal Hospital Abu Dhabi", bn: "এনএমসি রয়েল হাসপাতাল", ar: "مستشفى إن إم سي رويال" },
    { en: "LLH Hospital Abu Dhabi", bn: "এলএলএইচ হাসপাতাল আবুধাবি", ar: "مستشفى إل إل إتش" },
    { en: "Lifeline Hospital Abu Dhabi", bn: "লাইফলাইন হাসপাতাল আবুধাবি", ar: "مستشفى لايف لاين" }
  ],
  "Sharjah": [
    { en: "Al Qassimi Hospital Sharjah", bn: "আল কাসিমি হাসপাতাল শারজাহ", ar: "مستشفى القاسمي الشارقة" },
    { en: "Kuwait Hospital Sharjah", bn: "কুয়েত হাসপাতাল শারজাহ", ar: "مستشفى الكويت الشارقة" },
    { en: "University Hospital Sharjah", bn: "ইউনিভার্সিটি হাসপাতাল শারজাহ", ar: "مستشفى جامعة الشارقة" },
    { en: "Zulekha Hospital Sharjah", bn: "জুলেখা হাসপাতাল শারজাহ", ar: "مستشفى زليخة الشارقة" },
    { en: "NMC Royal Hospital Sharjah", bn: "এনএমসি রয়েল হাসপাতাল শারজাহ", ar: "مستشفى إن إم سي رويال الشارقة" },
    { en: "Al Zahra Hospital Sharjah", bn: "আল জাহরা হাসপাতাল শারজাহ", ar: "مستشفى الزهراء الشارقة" }
  ],
  "Ajman": [
    { en: "Sheikh Khalifa Hospital Masout", bn: "শেখ খলিফা হাসপাতাল মাসুত", ar: "مستشفى الشيخ خليفة مصفوت" },
    { en: "Amina Hospital Ajman", bn: "আমিনা হাসপাতাল আজমান", ar: "مستشفى أمينة عجمان" },
    { en: "Sheikh Khalifa Hospital - General", bn: "শেখ খলিফা জেনারেল হাসপাতাল আজমান", ar: "مستشفى الشيخ خليفة بن زايد" },
    { en: "Thumbay University Hospital", bn: "থুম্বে ইউনিভার্সিটি হাসপাতাল আজমান", ar: "مستشفى ثومبي الجامعي" },
    { en: "Saudi German Hospital Ajman", bn: "সৌদি জার্মান হাসপাতাল আজমান", ar: "المستشفى السعودي الألماني عجمان" }
  ],
  "Umm Al Quwain": [
    { en: "Umm Al Quwain Hospital", bn: "উম্ম আল কুয়াইন হাসপাতাল", ar: "مستشفى أم القيوين" },
    { en: "Sheikh Khalifa General Hospital UAQ", bn: "শেখ খলিফা জেনারেল হাসপাতাল ইউএকিউ", ar: "مستشفى الشيخ خليفة العام" },
    { en: "Al Khaleej Medical Center UAQ", bn: "আল খলিজ মেডিক্যাল সেন্টার", ar: "مركز الخليج الطبي أم القيوين" }
  ],
  "Ras Al Khaimah": [
    { en: "Saqr Hospital RAK", bn: "সাকর হাসপাতাল আরএকে", ar: "مستشفى صقر رأس الخيمة" },
    { en: "RAK Hospital", bn: "আরএকে হাসপাতাল", ar: "مستشفى رأس الخيمة" },
    { en: "Al Oraibi Hospital RAK", bn: "আল ওরাইবি হাসপাতাল", ar: "مستشفى العريبي" },
    { en: "Ibrahim Bin Hamad Obaidullah Hospital", bn: "ইব্রাহিম বিন হামাদ ওবায়দুল্লাহ হাসপাতাল", ar: "مستشفى إبراهيم بن حمد عبيدالله" }
  ],
  "Fujairah": [
    { en: "Fujairah Hospital", bn: "ফুজাইরাহ হাসপাতাল", ar: "مستشفى الفجيرة" },
    { en: "Sheikh Khalifa Central Hospital Fujairah", bn: "শেখ খলিফা সেন্ট্রাল হাসপাতাল", ar: "مستشفى الشيخ خليفة التخصصي الفجيرة" },
    { en: "Al Sharq Hospital Fujairah", bn: "আল শার্ক হাসপাতাল ফুজাইরাহ", ar: "مستشفى الشرق الفجيرة" },
    { en: "GMC Hospital Fujairah", bn: "জিএমসি হাসপাতাল ফুজাইরাহ", ar: "مستشفى جي إم سي الفجيرة" }
  ]
};

interface SavedEngineeringReport {
  id: string;
  reportNo: string;
  companyName: string;
  reportTitle: string;
  date: string;
  clientName: string;
  emirate: string;
  engineerName: string;
  workDetails: string;
  operationalLogs?: string;
  recommendationText?: string;
  treatmentCorrectiveText?: string;
  photos: {
    url: string; // Base64 or standard reference
    caption: string;
    zone?: string;
    videoUrl?: string;
  }[];
  recommendationPhotos?: {
    url: string;
    caption: string;
    zone?: string;
    videoUrl?: string;
  }[];
  zoneComments?: Record<string, string>;
  zoneCustomTitles?: Record<string, string>;
  createdAt: string;
  serviceType?: string;
  visitLocation?: string;
  photoEvidenceCustomTitle?: string;
  purposeOfVisitText?: string;
  purposeOfVisitLabel?: string;
  includePurposeInOutput?: boolean;
  includeFindingsInOutput?: boolean;
  includeRecommendationsInOutput?: boolean;
  includeTreatmentCorrectiveInOutput?: boolean;
  includeOperationalLogInOutput?: boolean;
}

interface EngineeringReportProps {
  language: AppLanguage;
  companyBrand: string;
  profileUser: string;
  locations?: LocationRegistryItem[];
  previewTargetReport?: any;
  onClosePreview?: () => void;
}


const chunkArray = <T,>(arr: T[], size: number): T[][] => {
  const result: T[][] = [];
  if (!arr) return result;
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};

export default function EngineeringReport({
  language,
  companyBrand,
  profileUser,
  locations = [],
  previewTargetReport,
  onClosePreview
}: EngineeringReportProps) {
  const activeLocations = locations && locations.length > 0 ? locations : INITIAL_LOCATIONS_REGISTRY;

  // Localized translator helper
  const t = (en: string, bn: string, ar: string = en) => {
    if (language === "bn") return bn;
    if (language === "ar") return ar;
    return en;
  };

  // Helper to format date display (handles YYYY-MM-DD input, converting to DD/MM/YYYY)
  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return "";
    if (dateStr.includes("-")) {
      const parts = dateStr.split("-");
      if (parts.length === 3 && parts[0].length === 4) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    }
    return dateStr;
  };

  // Helper to convert DD/MM/YYYY back into YYYY-MM-DD for native input date tag
  const parseDateToInputFormat = (dateStr: string) => {
    if (!dateStr) return "";
    if (dateStr.includes("/")) {
      const parts = dateStr.split("/");
      if (parts.length === 3) {
        const day = parts[0].trim().padStart(2, '0');
        const month = parts[1].trim().padStart(2, '0');
        const year = parts[2].trim();
        return `${year}-${month}-${day}`;
      }
    }
    return dateStr;
  };

  // State for reports history
  const [savedReports, setSavedReports] = useState<SavedEngineeringReport[]>(() => {
    const data = localStorage.getItem("ALW_ENGINEERING_REPORTS");
    if (data) {
      try {
        return JSON.parse(data);
      } catch (err) {}
    }
    return [];
  });

  // Active view: "list" or "create" or "print-preview"
  const [activeSegment, setActiveSegment] = useState<"list" | "create" | "preview">(previewTargetReport ? "preview" : "list");
  
  // States for direct PDF generation and UX feedback
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfProgressText, setPdfProgressText] = useState("");
  
  // Selection for print/view
  const [selectedReport, setSelectedReport] = useState<SavedEngineeringReport | null>(previewTargetReport || null);

  // Form states for Create Report
  const [reportNo, setReportNo] = useState("");
  const [customCompanyName, setCustomCompanyName] = useState("AL WAFA STAR PEST CONTROL SERVICE");
  const [reportTitle, setReportTitle] = useState("");
  const [reportDate, setReportDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  const getParsedReportDateParts = () => {
    const fallbackDate = new Date();
    const fallbackStr = fallbackDate.toISOString().split("T")[0];
    
    const curDate = reportDate || fallbackStr;
    const parts = curDate.split("-");
    if (parts.length === 3) {
      return {
        year: parts[0],
        month: parts[1],
        day: parts[2]
      };
    }
    const parsed = new Date(curDate);
    if (!isNaN(parsed.getTime())) {
      const iso = parsed.toISOString().split("T")[0].split("-");
      return { year: iso[0], month: iso[1], day: iso[2] };
    }
    const dIso = fallbackStr.split("-");
    return { year: dIso[0], month: dIso[1], day: dIso[2] };
  };

  const updateReportDatePart = (key: "year" | "month" | "day", val: string) => {
    const parts = getParsedReportDateParts();
    parts[key] = val;
    const combined = `${parts.year}-${parts.month}-${parts.day}`;
    setReportDate(combined);
  };
  const [clientName, setClientName] = useState("");
  const [selectedEmirate, setSelectedEmirate] = useState("Dubai");
  const [showHospitalDropdown, setShowHospitalDropdown] = useState(false);
  const [hospitalSearch, setHospitalSearch] = useState("");
  const [engineerName, setEngineerName] = useState("AISHA");
  const [workDetailsText, setWorkDetailsText] = useState("");
  const [operationalLogsText, setOperationalLogsText] = useState("");
  const [recommendationText, setRecommendationText] = useState("");
  const [treatmentCorrectiveText, setTreatmentCorrectiveText] = useState("");
  const [showQuickTextPopover, setShowQuickTextPopover] = useState(false);
  const [serviceType, setServiceType] = useState("Routine Visit");
  const [customServiceTypes, setCustomServiceTypes] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("al-wafa-custom-service-types");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      "Routine Visit",
      "Call Back / Emergency Service",
      "Deep Insect Treatment",
      "Termite Barrier & Treatment",
      "Fumigation & Fogging"
    ];
  });
  const [showCustomServicePopup, setShowCustomServicePopup] = useState(false);
  const [newCustomServiceInput, setNewCustomServiceInput] = useState("");

  useEffect(() => {
    localStorage.setItem("al-wafa-custom-service-types", JSON.stringify(customServiceTypes));
  }, [customServiceTypes]);

  const [visitLocation, setVisitLocation] = useState("");
  const [photoEvidenceCustomTitle, setPhotoEvidenceCustomTitle] = useState("");
  const [purposeOfVisitText, setPurposeOfVisitText] = useState("");
  const [purposeOfVisitLabel, setPurposeOfVisitLabel] = useState("");
  const [includePurposeInOutput, setIncludePurposeInOutput] = useState(true);
  const [includeFindingsInOutput, setIncludeFindingsInOutput] = useState(true);
  const [includeRecommendationsInOutput, setIncludeRecommendationsInOutput] = useState(true);
  const [includeTreatmentCorrectiveInOutput, setIncludeTreatmentCorrectiveInOutput] = useState(true);
  const [includeOperationalLogInOutput, setIncludeOperationalLogInOutput] = useState(false);
  const [showPurposePopup, setShowPurposePopup] = useState(false);
  
  const [showPurposeTextPopup, setShowPurposeTextPopup] = useState(false);
  const [customPurposeText, setCustomPurposeText] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("al-wafa-custom-purpose-text");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      "To perform routine pest control services.",
      "Emergency callout for pest infestation."
    ];
  });
  const [newPurposeTextInput, setNewPurposeTextInput] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem("al-wafa-custom-purpose-text", JSON.stringify(customPurposeText));
    } catch (e) {}
  }, [customPurposeText]);

  const [showWorkDetailsPopup, setShowWorkDetailsPopup] = useState(false);
  const [customWorkDetails, setCustomWorkDetails] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("al-wafa-custom-work-details");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });
  const [newWorkDetailsInput, setNewWorkDetailsInput] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem("al-wafa-custom-work-details", JSON.stringify(customWorkDetails));
    } catch (e) {}
  }, [customWorkDetails]);

  const [showRecommendationPopup, setShowRecommendationPopup] = useState(false);
  const [customRecommendations, setCustomRecommendations] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("al-wafa-custom-recommendations");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });
  const [newRecommendationInput, setNewRecommendationInput] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem("al-wafa-custom-recommendations", JSON.stringify(customRecommendations));
    } catch (e) {}
  }, [customRecommendations]);

  const [showTreatmentPopup, setShowTreatmentPopup] = useState(false);
  const [customTreatments, setCustomTreatments] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("al-wafa-custom-treatments");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });
  const [newTreatmentInput, setNewTreatmentInput] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem("al-wafa-custom-treatments", JSON.stringify(customTreatments));
    } catch (e) {}
  }, [customTreatments]);

  const [showOperationalLogsPopup, setShowOperationalLogsPopup] = useState(false);
  const [customOperationalLogs, setCustomOperationalLogs] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("al-wafa-custom-operational-logs");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });
  const [newOperationalLogsInput, setNewOperationalLogsInput] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem("al-wafa-custom-operational-logs", JSON.stringify(customOperationalLogs));
    } catch (e) {}
  }, [customOperationalLogs]);

  // Generic render for textarea popups
  const renderCustomDropdown = (
    showMenu: boolean,
    setShowMenu: (b: boolean) => void,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    currentText: string,
    setText: React.Dispatch<React.SetStateAction<string>>,
    newInput: string,
    setNewInput: (s: string) => void
  ) => {
    if (!showMenu) return null;
    return (
      <div className="absolute top-8 right-0 w-[85vw] sm:w-[450px] md:w-[600px] bg-slate-800 border border-slate-700/60 rounded-xl shadow-2xl p-3 z-50 animate-fadeIn cursor-default text-left">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-bold text-slate-300">
            {t("Select / Add Info", "তথ্য নির্বাচন / যোগ করুন", "تحديد / إضافة معلومات")}
          </span>
          <button 
            type="button" 
            onClick={() => setShowMenu(false)}
            className="text-slate-400 hover:text-rose-400 text-xs font-bold p-1 rounded"
          >
            [✕]
          </button>
        </div>
        
        <div className="flex gap-1.5 mb-2.5 items-start">
          <textarea
            value={newInput}
            onChange={(e) => setNewInput(e.target.value)}
            placeholder={t("Add new (multi-line supported)...", "নতুন যোগ করুন...", "إضافة جديد...")}
            className="flex-1 min-h-[60px] max-h-[150px] resize-y bg-slate-900 border border-slate-700 hover:border-slate-600 focus:border-cyan-500 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-200 outline-none placeholder:text-slate-500 transition-colors"
          />
          <button
            type="button"
            onClick={() => {
              if (newInput.trim()) {
                setList(prev => [...prev, newInput.trim()]);
                setNewInput("");
              }
            }}
            className="bg-cyan-600/20 text-cyan-400 hover:bg-cyan-500 hover:text-slate-900 p-1.5 rounded-lg transition-colors flex items-center justify-center shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex flex-col gap-1.5 max-h-[300px] overflow-y-auto pr-1">
          {list.length === 0 ? (
            <div className="text-[10px] text-slate-500 italic p-2 text-center">
              {t("No saved templates", "কোন সংরক্ষিত টেমপ্লেট নেই", "لا توجد قوالب محفوظة")}
            </div>
          ) : (
            list.map((item, idx) => {
              const isSelected = typeof currentText === 'string' && currentText.includes(item);
              return (
              <div 
                key={idx} 
                className="group flex items-start gap-2 p-2 hover:bg-slate-700/50 rounded-lg transition-colors border border-transparent hover:border-slate-600/50"
              >
                <div className="pt-0.5">
                  <input
                    type="checkbox"
                    className="w-3.5 h-3.5 rounded border-slate-600 text-cyan-500 focus:ring-cyan-500 bg-slate-900 cursor-pointer"
                    checked={isSelected}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setText(prev => prev ? prev + "\n\n" + item : item);
                      } else {
                        setText(prev => prev.replace(item, '').replace(/^\n+|\n+$/g, '').replace(/\n{3,}/g, '\n\n'));
                      }
                    }}
                  />
                </div>
                <div 
                  className="flex-1 text-[11.5px] font-medium text-slate-300 leading-tight cursor-pointer pr-2 break-words"
                  onClick={() => {
                      if (!isSelected) {
                        setText(prev => prev ? prev + "\n\n" + item : item);
                      } else {
                        setText(prev => prev.replace(item, '').replace(/^\n+|\n+$/g, '').replace(/\n{3,}/g, '\n\n'));
                      }
                  }}
                >
                  {item}
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setList(prev => prev.filter((_, i) => i !== idx));
                  }}
                  className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors shrink-0"
                  title={t("Delete template", "টেমপ্লেট মুছুন", "حذف القالب")}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )})
          )}
        </div>
      </div>
    );
  };

  
  const [customPurposes, setCustomPurposes] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("al-wafa-custom-purposes");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load custom purposes", e);
    }
    return [
      "Routine Inspection",
      "Emergency Response",
      "Deep Treatment",
      "Preventive Maintenance",
      "Initial Setup",
      "Follow-up Visit"
    ];
  });
  const [newPurposeInput, setNewPurposeInput] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem("al-wafa-custom-purposes", JSON.stringify(customPurposes));
    } catch (e) {
      console.error("Failed to save custom purposes", e);
    }
  }, [customPurposes]);

  // Date Input Ref for custom calendar triggers
  const dateInputRef = useRef<HTMLInputElement>(null);
  
  // Ref for auto-expanding LOCATION DETAILS textarea
  const locationDetailsRef = useRef<HTMLTextAreaElement>(null);
  
  // Ref for auto-expanding custom title textarea
  const customTitleRef = useRef<HTMLTextAreaElement>(null);
  
  // Dynamically tracked photo arrays
  const [photosList, setPhotosList] = useState<{ url: string; caption: string; zone?: string; videoUrl?: string }[]>([]);
  const [recommendationPhotosList, setRecommendationPhotosList] = useState<{ url: string; caption: string; videoUrl?: string }[]>([]);
  const [activeCaptureZone, setActiveCaptureZone] = useState<string>("Washroom");
  const [zoneComments, setZoneComments] = useState<Record<string, string>>({});
  const [zoneCustomTitles, setZoneCustomTitles] = useState<Record<string, string>>({});

  // Validation errors map for floating & visual alert feedback
  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});

  // Synchronize validation errors clearing reactively
  useEffect(() => {
    if (reportTitle.trim() && validationErrors.reportTitle) {
      setValidationErrors(prev => {
        const next = { ...prev };
        delete next.reportTitle;
        return next;
      });
    }
  }, [reportTitle, validationErrors.reportTitle]);

  useEffect(() => {
    if (customCompanyName.trim() && validationErrors.customCompanyName) {
      setValidationErrors(prev => {
        const next = { ...prev };
        delete next.customCompanyName;
        return next;
      });
    }
  }, [customCompanyName, validationErrors.customCompanyName]);

  useEffect(() => {
    if (reportDate && validationErrors.reportDate) {
      setValidationErrors(prev => {
        const next = { ...prev };
        delete next.reportDate;
        return next;
      });
    }
  }, [reportDate, validationErrors.reportDate]);

  useEffect(() => {
    if (engineerName.trim() && validationErrors.engineerName) {
      setValidationErrors(prev => {
        const next = { ...prev };
        delete next.engineerName;
        return next;
      });
    }
  }, [engineerName, validationErrors.engineerName]);

  useEffect(() => {
    if (clientName.trim() && validationErrors.clientName) {
      setValidationErrors(prev => {
        const next = { ...prev };
        delete next.clientName;
        return next;
      });
    }
  }, [clientName, validationErrors.clientName]);

  useEffect(() => {
    if (visitLocation.trim() && validationErrors.visitLocation) {
      setValidationErrors(prev => {
        const next = { ...prev };
        delete next.visitLocation;
        return next;
      });
    }
  }, [visitLocation, validationErrors.visitLocation]);

  useEffect(() => {
    if (workDetailsText.trim() && validationErrors.workDetailsText) {
      setValidationErrors(prev => {
        const next = { ...prev };
        delete next.workDetailsText;
        return next;
      });
    }
  }, [workDetailsText, validationErrors.workDetailsText]);

  // Dynamically tracked custom slots/zones
  const [dynamicZones, setDynamicZones] = useState<{ id: string; labelBN: string; labelEN: string; labelAR: string; icon: string }[]>([]);
  const [isCategorySelectorOpen, setIsCategorySelectorOpen] = useState(false);
  const [selectedCategoryLabel, setSelectedCategoryLabel] = useState<{en: string; bn: string; ar: string} | null>(null);

  // Custom premium slot creator modal states to bypass browser prompt blocking in iframe
  const [slotToCreate, setSlotToCreate] = useState<{ isOpen: boolean; defaultVal: string } | null>(null);
  const [newSlotInput, setNewSlotInput] = useState("");

  // Refs and hooks for automatic vertical expansion of all textareas
  const purposeOfVisitTextRef = useRef<HTMLTextAreaElement>(null);
  const workDetailsTextRef = useRef<HTMLTextAreaElement>(null);
  const recommendationTextRef = useRef<HTMLTextAreaElement>(null);
  const treatmentCorrectiveTextRef = useRef<HTMLTextAreaElement>(null);
  const operationalLogsTextRef = useRef<HTMLTextAreaElement>(null);

  // Common handler to resize textareas preventing clipping
  const handleResizeTextarea = (el: HTMLTextAreaElement | null) => {
    if (el) {
      el.style.height = "auto";
      // el.offsetHeight - el.clientHeight accounts for top/bottom borders.
      const borderSize = el.offsetHeight - el.clientHeight;
      el.style.height = `${el.scrollHeight + (borderSize > 0 ? borderSize : 4)}px`;
    }
  };

  useEffect(() => { handleResizeTextarea(purposeOfVisitTextRef.current); }, [purposeOfVisitText]);
  useEffect(() => { handleResizeTextarea(locationDetailsRef.current); }, [visitLocation]);
  useEffect(() => { handleResizeTextarea(workDetailsTextRef.current); }, [workDetailsText]);
  useEffect(() => { handleResizeTextarea(recommendationTextRef.current); }, [recommendationText]);
  useEffect(() => { handleResizeTextarea(treatmentCorrectiveTextRef.current); }, [treatmentCorrectiveText]);
  useEffect(() => { handleResizeTextarea(operationalLogsTextRef.current); }, [operationalLogsText]);

  // Safe confirm states to bypass iframe prompt locks or blockers
  const [reportToDeleteId, setReportToDeleteId] = useState<string | null>(null);
  const [showClearCanvasConfirm, setShowClearCanvasConfirm] = useState<boolean>(false);

  // Helper to determine the zone of a photo, either from property or caption parsing
  const getPhotoZone = (p: { url: string; caption: string; zone?: string }) => {
    if (p.zone) return p.zone;
    const caption = (p.caption || "").toLowerCase();
    if (caption.includes("treatment") || caption.includes("ট্রিটমেন্ট") || caption.includes("المعالجة")) {
      return "Treatment Photo";
    }
    if (caption.includes("infestation") || caption.includes("ইনফেস্টেশন") || caption.includes("الحشرات")) {
      return "Infestation Photo";
    }
    if (caption.includes("washroom") || caption.includes("ওয়াশরুম") || caption.includes("دورات")) {
      return "Washroom";
    }
    if (caption.includes("kitchen") || caption.includes("কিচেন") || caption.includes("المطابخ")) {
      return "Kitchen";
    }
    if (caption.includes("corridor") || caption.includes("করিডোর") || caption.includes("الممرات")) {
      return "Corridors";
    }
    if (caption.includes("office") || caption.includes("অফিস") || caption.includes("المكاتب")) {
      return "Office Rooms";
    }
    return "Other";
  };

  // Combined active zones dynamically
  const activeZones = React.useMemo(() => {
    const merged = [...PRESET_ZONES];
    for (const dz of dynamicZones) {
      if (!merged.some(z => z.id.toLowerCase() === dz.id.toLowerCase())) {
        merged.push(dz);
      }
    }
    return merged;
  }, [dynamicZones]);

  // Synchronize dynamic zones from photos, comments, and custom titles
  useEffect(() => {
    const foundZones: string[] = [];
    photosList.forEach(p => {
      const zId = getPhotoZone(p);
      if (zId && !foundZones.includes(zId)) {
        foundZones.push(zId);
      }
    });
    Object.keys(zoneComments).forEach(zId => {
      if (!foundZones.includes(zId)) {
        foundZones.push(zId);
      }
    });
    Object.keys(zoneCustomTitles).forEach(zId => {
      if (!foundZones.includes(zId)) {
        foundZones.push(zId);
      }
    });

    setDynamicZones(prev => {
      const next = [...prev];
      let updated = false;
      foundZones.forEach(zId => {
        const isPreset = PRESET_ZONES.some(pz => pz.id.toLowerCase() === zId.toLowerCase());
        const isDynamic = next.some(dz => dz.id.toLowerCase() === zId.toLowerCase());
        if (!isPreset && !isDynamic && zId !== "Other") {
          next.push({
            id: zId,
            labelEN: zId.toUpperCase(),
            labelBN: zId,
            labelAR: zId,
            icon: ""
          });
          updated = true;
        }
      });
      return updated ? next : prev;
    });
  }, [photosList, zoneComments, zoneCustomTitles]);

  // Auto-detect selected Emirate based on selected or typed Client Name
  useEffect(() => {
    if (!clientName) return;
    const lowerName = clientName.toLowerCase();

    // 1. Try to find a match in the active locations directory
    for (const loc of activeLocations) {
      if (loc.name && lowerName.includes(loc.name.toLowerCase())) {
        setSelectedEmirate(loc.emirate);
        return;
      }
    }

    // 2. Fallback: match Emirate names directly in the text (English, Bengali, Arabic, and phonetic spellings like 'আসমান' / 'আজমান')
    const keyMap: Record<string, string[]> = {
      "Dubai": ["dubai", "দুবাই", "دبي", "duba"],
      "Abu Dhabi": ["abu dhabi", "আবুধাবি", "আবু ধাবি", "أبو ظبي", "أبوظبي", "abu dha", "abudhabi"],
      "Sharjah": ["sharjah", "শারজাহ", "الشارقة", "sarjah", "শারজা", "সারজা"],
      "Ajman": ["ajman", "আজমান", "আসমান", "عجمان", "asman"],
      "Umm Al Quwain": ["umm al quwain", "uaq", "উম্ম আল কুয়াইন", "أم القيوين", "umm al", "উম্ম আল"],
      "Ras Al Khaimah": ["ras al khaimah", "rak", "রাস আল খাইমাহ", "رأس الخيمة", "ras al"],
      "Fujairah": ["fujairah", "ফুজাইরাহ", "الفجيرة", "fujayrah", "ফুজাইরা", "ফুজায়রা"]
    };

    for (const [emirate, keywords] of Object.entries(keyMap)) {
      for (const kw of keywords) {
        if (lowerName.includes(kw)) {
          setSelectedEmirate(emirate);
          return;
        }
      }
    }
  }, [clientName]);

  // Auto-resize for LOCATION DETAILS Textarea
  useEffect(() => {
    if (locationDetailsRef.current) {
      locationDetailsRef.current.style.height = "auto";
      locationDetailsRef.current.style.height = `${locationDetailsRef.current.scrollHeight}px`;
    }
  }, [workDetailsText]);

  // Auto-resize for custom title Textarea
  useEffect(() => {
    if (customTitleRef.current) {
      customTitleRef.current.style.height = "auto";
      customTitleRef.current.style.height = `${customTitleRef.current.scrollHeight}px`;
    }
  }, [photoEvidenceCustomTitle]);

  // Combine PRESET_ZONES with loaded dynamic zones for preview layout
  const reportZones = React.useMemo(() => {
    const merged = [...PRESET_ZONES];
    if (!selectedReport) return merged;
    const foundZones: string[] = [];
    (selectedReport.photos || []).forEach(p => {
      const zId = getPhotoZone(p);
      if (zId && !foundZones.includes(zId)) {
        foundZones.push(zId);
      }
    });
    Object.keys(selectedReport.zoneComments || {}).forEach(zId => {
      if (!foundZones.includes(zId)) {
        foundZones.push(zId);
      }
    });
    foundZones.forEach(zId => {
      const isPreset = PRESET_ZONES.some(pz => pz.id.toLowerCase() === zId.toLowerCase());
      if (!isPreset && zId !== "Other") {
        merged.push({
          id: zId,
          labelEN: zId.toUpperCase(),
          labelBN: zId,
          labelAR: zId,
          icon: ""
        });
      }
    });
    return merged;
  }, [selectedReport]);

  // Edit Mode state
  const [editingReportId, setEditingReportId] = useState<string | null>(null);

  // Default Preset locations and text option for work caption automation
  const [selectedLocationScope, setSelectedLocationScope] = useState<string>("");
  const [customLocationScope, setCustomLocationScope] = useState<string>("");
  const [isZoneDropdownOpen, setIsZoneDropdownOpen] = useState(false);

  // Zoomed photo modal state & Drawing canvas states
  const [activeZoomPhoto, setActiveZoomPhoto] = useState<{ url: string; caption: string; source?: "work" | "rec"; index?: number; videoUrl?: string } | null>(null);
  
  const [activeTool, setActiveTool] = useState<"pen" | "rect" | "circle" | "arrow" | "text" | "eraser" | "stamp">("pen");
  const [activeColor, setActiveColor] = useState<string>("#EF4444"); // Default red is highly visible!
  const [activeWidth, setActiveWidth] = useState<number>(4);
  const [activeFontSize, setActiveFontSize] = useState<number>(18);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingHistory, setDrawingHistory] = useState<any[]>([]);
  const [redoHistory, setRedoHistory] = useState<any[]>([]);
  const [currentAction, setCurrentAction] = useState<any | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [isBgLoaded, setIsBgLoaded] = useState(false);

  // Advanced Engineering Smart Editor States
  const [activeTextToDraw, setActiveTextToDraw] = useState<string>("");
  const [activeStamp, setActiveStamp] = useState<string>("❌");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bgImageRef = useRef<HTMLImageElement | null>(null);

  const drawAction = (ctx: CanvasRenderingContext2D, action: any) => {
    ctx.strokeStyle = action.color;
    ctx.fillStyle = action.color;
    ctx.lineWidth = action.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    
    if (action.type === "freehand") {
      if (action.points.length < 1) return;
      ctx.beginPath();
      ctx.moveTo(action.points[0].x, action.points[0].y);
      for (let i = 1; i < action.points.length; i++) {
        ctx.lineTo(action.points[i].x, action.points[i].y);
      }
      ctx.stroke();
    } else if (action.type === "rect") {
      ctx.beginPath();
      ctx.strokeRect(action.startX, action.startY, action.endX - action.startX, action.endY - action.startY);
    } else if (action.type === "circle") {
      ctx.beginPath();
      const rx = Math.abs(action.endX - action.startX) / 2;
      const ry = Math.abs(action.endY - action.startY) / 2;
      const cx = (action.startX + action.endX) / 2;
      const cy = (action.startY + action.endY) / 2;
      ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
      ctx.stroke();
    } else if (action.type === "arrow") {
      ctx.beginPath();
      ctx.moveTo(action.startX, action.startY);
      ctx.lineTo(action.endX, action.endY);
      ctx.stroke();
      
      const angle = Math.atan2(action.endY - action.startY, action.endX - action.startX);
      ctx.beginPath();
      ctx.moveTo(action.endX, action.endY);
      ctx.lineTo(action.endX - 12 * Math.cos(angle - Math.PI / 6), action.endY - 12 * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(action.endX - 12 * Math.cos(angle + Math.PI / 6), action.endY - 12 * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();
    } else if (action.type === "text") {
      ctx.beginPath();
      ctx.font = `bold ${action.fontSize}px sans-serif`;
      ctx.fillText(action.text, action.x, action.y);
    } else if (action.type === "stamp") {
      ctx.beginPath();
      ctx.font = `${action.fontSize || 32}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(action.stamp, action.x, action.y);
    }
  };

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (bgImageRef.current) {
      ctx.drawImage(bgImageRef.current, 0, 0, canvas.width, canvas.height);
    }
    
    drawingHistory.forEach((action) => {
      drawAction(ctx, action);
    });
    
    if (currentAction) {
      drawAction(ctx, currentAction);
    }
  };

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ("touches" in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;
    
    return { x, y };
  };

  const handlePointerDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!activeZoomPhoto?.source) return; // Read-only view
    
    const coords = getCoordinates(e);
    if (!coords) return;
    
    setIsDrawing(true);
    
    if (activeTool === "text") {
      const textToUse = activeTextToDraw.trim() || (language === "bn" ? "চিহ্নিত স্থান" : "Inspected Area");
      const textAction = {
        type: "text",
        x: coords.x,
        y: coords.y,
        text: textToUse,
        color: activeColor,
        fontSize: activeFontSize * 1.2
      };
      setDrawingHistory((prev) => [...prev, textAction]);
      setRedoHistory([]);
      setIsDrawing(false);
      return;
    }

    if (activeTool === "stamp") {
      const stampAction = {
        type: "stamp",
        x: coords.x,
        y: coords.y,
        stamp: activeStamp,
        color: activeColor,
        fontSize: activeFontSize * 1.8
      };
      setDrawingHistory((prev) => [...prev, stampAction]);
      setRedoHistory([]);
      setIsDrawing(false);
      return;
    }
    
    if (activeTool === "pen" || activeTool === "eraser") {
      const freshAction = {
        type: "freehand",
        points: [coords],
        color: activeTool === "eraser" ? "#ffffff" : activeColor,
        width: activeTool === "eraser" ? activeWidth * 2.5 : activeWidth
      };
      setCurrentAction(freshAction);
    } else {
      const freshAction = {
        type: activeTool,
        startX: coords.x,
        startY: coords.y,
        endX: coords.x,
        endY: coords.y,
        color: activeColor,
        width: activeWidth
      };
      setCurrentAction(freshAction);
    }
  };

  const handlePointerMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentAction) return;
    const coords = getCoordinates(e);
    if (!coords) return;
    
    if (currentAction.type === "freehand") {
      setCurrentAction((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          points: [...prev.points, coords]
        };
      });
    } else {
      setCurrentAction((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          endX: coords.x,
          endY: coords.y
        };
      });
    }
  };

  const handlePointerUp = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    if (currentAction) {
      setDrawingHistory((prev) => [...prev, currentAction]);
      setRedoHistory([]);
      setCurrentAction(null);
    }
  };

  const handleRotateImage = () => {
    if (!bgImageRef.current) return;
    
    const rotateCanvas = document.createElement("canvas");
    const rotateCtx = rotateCanvas.getContext("2d");
    if (!rotateCtx) return;
    
    const originalWidth = bgImageRef.current.naturalWidth || bgImageRef.current.width;
    const originalHeight = bgImageRef.current.naturalHeight || bgImageRef.current.height;
    
    rotateCanvas.width = originalHeight;
    rotateCanvas.height = originalWidth;
    
    rotateCtx.translate(rotateCanvas.width / 2, rotateCanvas.height / 2);
    rotateCtx.rotate((90 * Math.PI) / 180);
    rotateCtx.drawImage(bgImageRef.current, -originalWidth / 2, -originalHeight / 2, originalWidth, originalHeight);
    
    const rotatedUrl = rotateCanvas.toDataURL("image/jpeg", 0.95);
    
    setActiveZoomPhoto((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        url: rotatedUrl
      };
    });
    
    // Clear drawing history when image changes rotation to ensure new coordinate frame is clean
    setDrawingHistory([]);
    setRedoHistory([]);
  };

  const handleSaveAnnotatedPhoto = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const annotatedUrl = canvas.toDataURL("image/jpeg", 0.9);
    
    if (activeZoomPhoto?.source === "work" && typeof activeZoomPhoto.index === "number") {
      const idx = activeZoomPhoto.index;
      setPhotosList((prev) => {
        const copy = [...prev];
        if (copy[idx]) {
          copy[idx] = { ...copy[idx], url: annotatedUrl };
        }
        return copy;
      });
    } else if (activeZoomPhoto?.source === "rec" && typeof activeZoomPhoto.index === "number") {
      const idx = activeZoomPhoto.index;
      setRecommendationPhotosList((prev) => {
        const copy = [...prev];
        if (copy[idx]) {
          copy[idx] = { ...copy[idx], url: annotatedUrl };
        }
        return copy;
      });
    }
    
    setActiveZoomPhoto(null);
  };

  // Image loader effect
  useEffect(() => {
    if (!activeZoomPhoto) {
      setDrawingHistory([]);
      setRedoHistory([]);
      setIsBgLoaded(false);
      return;
    }
    
    setIsBgLoaded(false);
    const img = new Image();
    img.src = activeZoomPhoto.url;
    img.crossOrigin = "anonymous";
    img.onload = () => {
      bgImageRef.current = img;
      setIsBgLoaded(true);
      
      const maxW = Math.min(window.innerWidth * 0.85, 800);
      const maxH = Math.min(window.innerHeight * 0.60, 500);
      
      let w = img.naturalWidth || 800;
      let h = img.naturalHeight || 600;
      
      const ratio = w / h;
      if (w > maxW) {
        w = maxW;
        h = w / ratio;
      }
      if (h > maxH) {
        h = maxH;
        w = h * ratio;
      }
      
      setCanvasSize({ width: Math.round(w), height: Math.round(h) });
    };
  }, [activeZoomPhoto]);

  // Reactive redraw effect
  useEffect(() => {
    if (isBgLoaded) {
      redrawCanvas();
    }
  }, [isBgLoaded, drawingHistory, currentAction, canvasSize]);

  // Live in-app camera states
  const [isLiveCamOpen, setIsLiveCamOpen] = useState(false);
  const [liveCamType, setLiveCamType] = useState<"work" | "rec">("work");
  const [activeStream, setActiveStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraActiveCount, setCameraActiveCount] = useState(0);
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [cameraHasFlashlight, setCameraHasFlashlight] = useState(false);
  const [isFlashlightOn, setIsFlashlightOn] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Stop existing stream tracks
  const stopCameraStream = (streamToStop: MediaStream | null) => {
    if (streamToStop) {
      streamToStop.getTracks().forEach((track) => track.stop());
    }
  };


  // Bind camera stream reliably when activeStream is available and video element renders
  useEffect(() => {
    if (isLiveCamOpen && activeStream) {
      const videoEl = document.getElementById("live-viewfinder") as HTMLVideoElement | null;
      if (videoEl && !videoEl.srcObject) {
        videoEl.srcObject = activeStream;
        videoEl.play().catch((err) => console.error("Video play error:", err));
      }
    }
  }, [isLiveCamOpen, activeStream]);

  // Start the device camera
  const startLiveCamera = async (type: "work" | "rec", currentFacing: "user" | "environment" = "environment") => {
    setLiveCamType(type);
    setFacingMode(currentFacing);
    setCameraError(null);
    setCameraActiveCount(0);
    setIsLiveCamOpen(true);

    try {
      if (activeStream) {
        stopCameraStream(activeStream);
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: currentFacing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setActiveStream(stream);
      setIsFlashlightOn(false);
      
      const track = stream.getVideoTracks()[0];
      if (track && typeof track.getCapabilities === "function") {
        const caps = track.getCapabilities() as any;
        setCameraHasFlashlight(!!caps.torch);
      } else {
        setCameraHasFlashlight(false);
      }
      // Removed setTimeout. The binding is now handled securely inside a useEffect!
    } catch (err: any) {
      console.error("Camera access error:", err);
      // Fallback simple request if facingMode fails
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        setActiveStream(fallbackStream);
        setIsFlashlightOn(false);
        const fbTrack = fallbackStream.getVideoTracks()[0];
        if (fbTrack && typeof fbTrack.getCapabilities === "function") {
          const caps = fbTrack.getCapabilities() as any;
          setCameraHasFlashlight(!!caps.torch);
        } else {
          setCameraHasFlashlight(false);
        }
        // Removed setTimeout. The binding is now handled securely inside a useEffect!
      } catch (fallbackErr) {
        setCameraError(
          language === "bn"
            ? "ক্যামেরা প্রিভিউ চালু করা সম্ভব হয়নি। দয়া করে ক্যামেরা ব্যবহারের অনুমতি দিন!"
            : "Could not open camera. Please grant camera permissions to this browser!"
        );
      }
    }
  };

  const handleCloseLiveCamera = () => {
    if (isRecordingVideo) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      setIsRecordingVideo(false);
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    stopCameraStream(activeStream);
    setActiveStream(null);
    setIsLiveCamOpen(false);
  };

  const handleToggleFacingMode = () => {
    const nextFacing = facingMode === "environment" ? "user" : "environment";
    startLiveCamera(liveCamType, nextFacing);
  };

  const captureLivePhoto = (recordedVideoUrl?: string) => {
    const videoEl = document.getElementById("live-viewfinder") as HTMLVideoElement | null;
    if (!videoEl || !activeStream) return;

    // Capture using canvas
    const canvas = document.createElement("canvas");
    canvas.width = videoEl.videoWidth || 640;
    canvas.height = videoEl.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      let dataUrl = "";
      try {
        // Draw frame
        ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
        dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      } catch(err) {
        console.error("Failed to capture image from video:", err);
        setCameraError("Canvas error: Device not ready for photo frame.");
        return; // Abort
      }

      // Append dynamically
      if (liveCamType === "work") {
        const activeZone = activeCaptureZone || "Other";
        setPhotosList((prev: any) => {
          const finalCap = `${activeZone} - ${t("Photo", "ছবি", "صورة")} ${prev.length + 1}`;
          return [
            ...prev,
            {
              url: dataUrl,
              caption: finalCap,
              zone: activeZone,
              videoUrl: recordedVideoUrl
            }
          ];
        });
      } else {
        setRecommendationPhotosList((prev: any) => [
          ...prev,
          {
            url: dataUrl,
            caption: t(
              `Detected issue recommendation ${prev.length + 1}`,
              `পেস্ট সমস্যা রিকমেন্ডেশন ${prev.length + 1}`,
              `توصيات مشكلة الآفات المكتشفة ${prev.length + 1}`
            ),
            videoUrl: recordedVideoUrl
          }
        ]);
      }

      // Add camera action visual confirmation count/flash
      setCameraActiveCount((c) => c + 1);
      
      // Temporarily flash overlay white/green for feedback
      const flashEl = document.getElementById("camera-flash-overlay");
      if (flashEl) {
        flashEl.classList.remove("opacity-0");
        flashEl.classList.add("opacity-80", "bg-emerald-400"); // stronger flash
        setTimeout(() => {
          flashEl.classList.remove("opacity-80", "bg-emerald-400");
          flashEl.classList.add("opacity-0", "bg-white");
        }, 300);
      }

      // Removed automatic camera close so user can take multiple photos consecutively
      // handleCloseLiveCamera();
    }
  };

  const toggleFlashlight = async () => {
    if (!activeStream) return;
    const track = activeStream.getVideoTracks()[0];
    if (track) {
      try {
        const nextState = !isFlashlightOn;
        await track.applyConstraints({
          advanced: [{ torch: nextState } as any]
        });
        setIsFlashlightOn(nextState);
      } catch (err) {
        console.error("Flashlight toggle error:", err);
      }
    }
  };

  const toggleLiveVideoRecording = () => {
    if (isRecordingVideo) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      setIsRecordingVideo(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    } else {
      if (!activeStream) return;
      videoChunksRef.current = [];
      setRecordingDuration(0);
      try {
        const mediaRecorder = new MediaRecorder(activeStream, { videoBitsPerSecond: 250000 }); // lower bitrate for smaller size
        mediaRecorderRef.current = mediaRecorder;
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            videoChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const type = mediaRecorder.mimeType;
          const ext = type.includes("video/mp4") ? "mp4" : "webm";
          const blob = new Blob(videoChunksRef.current, { type });
          
          const videoUrl = URL.createObjectURL(blob);
          
          // Download video locally onto device storage (just like photo)
          try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
            const zoneNameForFile = liveCamType === "work" ? (activeCaptureZone || "Area") : "Recommendation";
            const filename = `AlWafaStar-Video-${zoneNameForFile.replace(/\s+/g, "_")}-${timestamp}.${ext}`;
            
            const link = document.createElement("a");
            link.href = videoUrl;
            link.download = filename;
            link.target = "_blank"; // Fix for some webviews
            document.body.appendChild(link);
            link.click();
            
            // Cleanup
            setTimeout(() => {
              if (document.body.contains(link)) document.body.removeChild(link);
            }, 100);
          } catch(err) {
             console.error("Video download failed", err);
          }

          // Capture the last frame as photo evidence for the report, providing the persistent video URL
          captureLivePhoto(videoUrl);
        };

        mediaRecorder.start();
        setIsRecordingVideo(true);
        timerIntervalRef.current = setInterval(() => {
          setRecordingDuration((prev) => prev + 1);
        }, 1000);
      } catch (err) {
        alert("Video recording is not supported in this browser.");
      }
    }
  };

  // Stop stream tracks on unmount
  useEffect(() => {
    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [activeStream]);

  // Subscribe to engineering reports from Firestore in real-time
  useEffect(() => {
    const unsubscribe = subscribeCollection<SavedEngineeringReport>("engineeringReports", (list) => {
      if (list && list.length > 0) {
        setSavedReports(list);
        localStorage.setItem("ALW_ENGINEERING_REPORTS", JSON.stringify(list));
      } else {
        // Fallback: seed from local storage if standard list is empty
        const saved = localStorage.getItem("ALW_ENGINEERING_REPORTS");
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setSavedReports(parsed);
              for (const r of parsed) {
                if (r.id) saveDocument("engineeringReports", r.id, r);
              }
            }
          } catch (e) {}
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync to localStorage only (Firestore saves happen on action)
  useEffect(() => {
    localStorage.setItem("ALW_ENGINEERING_REPORTS", JSON.stringify(savedReports));
  }, [savedReports]);

  // Sync brand name whenever parents change
  useEffect(() => {
    if (!editingReportId) {
      setCustomCompanyName("AL WAFA STAR PEST CONTROL SERVICE");
      setEngineerName("AISHA");
    }
  }, [editingReportId]);

  // Auto-generate report number
  const initNewReportForm = () => {
    const num = `ALW-ENG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setReportNo(num);
    setCustomCompanyName("AL WAFA STAR PEST CONTROL SERVICE");
    setReportTitle(t("Termite Protection & Pest Engineering Report", "উইপোকা ও সাধারণ কেমিক্যাল পেস্ট দমন রিপোর্ট", "تقرير الهندسة لمكافحة النمل الأبيض والآفات العامة"));
    setReportDate(new Date().toISOString().split("T")[0]);
    setClientName("");
    setSelectedEmirate("Dubai");
    setEngineerName("AISHA");
    setWorkDetailsText("");
    setOperationalLogsText("");
    setRecommendationText("");
    setTreatmentCorrectiveText("");
    setServiceType("Routine Visit");
    setVisitLocation("");
    setPhotoEvidenceCustomTitle("");
    setPhotosList([]);
    setRecommendationPhotosList([]);
    setZoneComments({});
    setZoneCustomTitles({});
    setDynamicZones([]);
    setEditingReportId(null);
    setActiveSegment("create");
  };

  // Trigger quick template append
  const handleInsertTemplate = (templateEn: string, templateBn: string, templateAr: string = templateEn) => {
    const toAppend = language === "bn" ? templateBn : (language === "ar" ? templateAr : templateEn);
    setWorkDetailsText((prev) => {
      const spacing = prev.trim() ? "\n\n" : "";
      return prev + spacing + toAppend;
    });
  };

  // Dynamic image handlers
  const handleAddNewPhoto = (file: File, type: "work" | "rec", designatedZone?: string) => {
    if (file.type.startsWith("video/")) {
      const videoUrl = URL.createObjectURL(file);
      const videoEl = document.createElement("video");
      videoEl.src = videoUrl;
      videoEl.muted = true;
      videoEl.playsInline = true;
      videoEl.crossOrigin = "anonymous";
      
      videoEl.onloadeddata = () => {
        videoEl.currentTime = Math.min(1, videoEl.duration / 2 || 0); // Seek to 1s or middle to capture frame
      };
      
      videoEl.onseeked = () => {
        const canvas = document.createElement("canvas");
        canvas.width = videoEl.videoWidth || 800;
        canvas.height = videoEl.videoHeight || 600;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
          addMediaToState(dataUrl, type, designatedZone, videoUrl); // persistent URL object
        }
      };
    } else {
      const reader = new FileReader();
      reader.onloadend = () => {
        const resultStr = reader.result as string;
        addMediaToState(resultStr, type, designatedZone);
      };
      reader.readAsDataURL(file);
    }
  };

  const addMediaToState = (dataUrl: string, type: "work" | "rec", designatedZone?: string, videoUrl?: string) => {
    if (type === "work") {
      const activeZone = designatedZone || selectedLocationScope || "Other";
      setPhotosList((prev: any) => {
        const finalCap = `${activeZone} - ${videoUrl ? t("Video", "ভিডিও", "فيديو") : t("Photo", "ছবি", "صورة")} ${prev.length + 1}`;
        return [
          ...prev,
          {
            url: dataUrl,
            caption: finalCap,
            zone: activeZone,
            videoUrl: videoUrl
          }
        ];
      });
    } else {
      setRecommendationPhotosList((prev: any) => [
        ...prev,
        {
          url: dataUrl,
          caption: t(
            `Detected issue recommendation ${prev.length + 1}`,
            `পেস্ট সমস্যা রিকমেন্ডেশন ${prev.length + 1}`,
            `توصيات مشكلة الآفات المكتشفة ${prev.length + 1}`
          ),
          videoUrl: videoUrl
        }
      ]);
    }
  };

  const handleRemovePhoto = (index: number, type: "work" | "rec") => {
    if (type === "work") {
      setPhotosList((prev) => prev.filter((_, idx) => idx !== index));
    } else {
      setRecommendationPhotosList((prev) => prev.filter((_, idx) => idx !== index));
    }
  };

  const handleUpdateCaption = (index: number, text: string, type: "work" | "rec") => {
    if (type === "work") {
      setPhotosList((prev) => prev.map((item, idx) => idx === index ? { ...item, caption: text } : item));
    } else {
      setRecommendationPhotosList((prev) => prev.map((item, idx) => idx === index ? { ...item, caption: text } : item));
    }
  };

  // Save/Submit Form
  const resetForm = () => {
    setReportNo("");
    setReportTitle("");
    setClientName("");
    setWorkDetailsText("");
    setOperationalLogsText("");
    setRecommendationText("");
    setTreatmentCorrectiveText("");
    setPhotosList([]);
    setRecommendationPhotosList([]);
    setZoneComments({});
    setZoneCustomTitles({});
    setVisitLocation("");
    setServiceType("Routine Visit");
    setPhotoEvidenceCustomTitle("");
    setIncludePurposeInOutput(true);
    setIncludeFindingsInOutput(true);
    setIncludeRecommendationsInOutput(true);
    setIncludeTreatmentCorrectiveInOutput(true);
    setIncludeOperationalLogInOutput(false);
    setEditingReportId(null);
  };

  const handleSaveReport = (viewImmediate?: boolean) => {
    const errors: Record<string, boolean> = {};
    if (!reportTitle.trim()) errors.reportTitle = true;
    if (!customCompanyName.trim()) errors.customCompanyName = true;
    if (!reportDate) errors.reportDate = true;
    if (!engineerName.trim()) errors.engineerName = true;
    if (!clientName.trim()) errors.clientName = true;
    if (!visitLocation.trim()) errors.visitLocation = true;
    if (!workDetailsText.trim()) errors.workDetailsText = true;

    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      alert(
        language === "bn" 
          ? "দয়া করে চিহ্নিত প্রয়োজনীয় ঘরগুলো পূরণ করুন! (কিছু তথ্য বাদ আছে যা উপরে-নিচে কাঁপছে)" 
          : "Please fill in the highlighted required fields! (Missing fields are bouncing up & down)"
      );
      
      const firstKey = Object.keys(errors)[0];
      const targetId = `field-${firstKey}`;
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    const filteredPhotos = photosList.filter(p => p.url !== "");
    const filteredRecPhotos = recommendationPhotosList.filter(p => p.url !== "");

    let targetReport: SavedEngineeringReport;

    if (editingReportId) {
      // Modify existing
      targetReport = {
        id: editingReportId,
        reportNo,
        companyName: customCompanyName,
        reportTitle,
        date: reportDate,
        clientName,
        emirate: selectedEmirate,
        engineerName,
        workDetails: workDetailsText,
        operationalLogs: operationalLogsText,
        recommendationText: recommendationText,
        treatmentCorrectiveText: treatmentCorrectiveText,
        photos: filteredPhotos,
        recommendationPhotos: filteredRecPhotos,
        zoneComments,
        zoneCustomTitles,
        serviceType,
        visitLocation,
        photoEvidenceCustomTitle,
        purposeOfVisitText,
        purposeOfVisitLabel,
        includePurposeInOutput,
        includeFindingsInOutput,
        includeRecommendationsInOutput,
        includeTreatmentCorrectiveInOutput,
        includeOperationalLogInOutput,
        createdAt: savedReports.find(r => r.id === editingReportId)?.createdAt || new Date().toISOString()
      };
    } else {
      // Create new
      targetReport = {
        id: "rep_" + Date.now(),
        reportNo,
        companyName: customCompanyName,
        reportTitle,
        date: reportDate,
        clientName,
        emirate: selectedEmirate,
        engineerName,
        workDetails: workDetailsText,
        operationalLogs: operationalLogsText,
        recommendationText: recommendationText,
        treatmentCorrectiveText: treatmentCorrectiveText,
        photos: filteredPhotos,
        recommendationPhotos: filteredRecPhotos,
        zoneComments,
        zoneCustomTitles,
        serviceType,
        visitLocation,
        photoEvidenceCustomTitle,
        purposeOfVisitText,
        purposeOfVisitLabel,
        includePurposeInOutput,
        includeFindingsInOutput,
        includeRecommendationsInOutput,
        includeTreatmentCorrectiveInOutput,
        includeOperationalLogInOutput,
        createdAt: new Date().toISOString()
      };
    }

    // Offline-First: update state and localStorage immediately
    let updatedReports: SavedEngineeringReport[];
    const existsIndex = savedReports.findIndex(r => r.id === targetReport.id);
    if (existsIndex >= 0) {
      updatedReports = savedReports.map(r => r.id === targetReport.id ? targetReport : r);
    } else {
      updatedReports = [targetReport, ...savedReports];
    }
    setSavedReports(updatedReports);
    localStorage.setItem("ALW_ENGINEERING_REPORTS", JSON.stringify(updatedReports));

    saveDocument("engineeringReports", targetReport.id, targetReport).catch(e => {
        console.warn("Firestore save failing on engineeringReports, kept locally:", e);
    });

    if (viewImmediate) {
      setSelectedReport(targetReport);
      setActiveSegment("preview");
    } else {
      setActiveSegment("list");
      alert("Report successfully saved!");
    }

    // Reset details
    resetForm();
  };

  const handleEditReportClick = (report: SavedEngineeringReport) => {
    setReportNo(report.reportNo);
    setCustomCompanyName(
      !report.companyName || report.companyName === "AL WAFA STAR"
        ? "AL WAFA STAR PEST CONTROL SERVICE"
        : report.companyName
    );
    setReportTitle(report.reportTitle);
    setReportDate(report.date);
    setClientName(report.clientName);
    setSelectedEmirate(report.emirate);
    setEngineerName(report.engineerName);
    setWorkDetailsText(report.workDetails);
    setOperationalLogsText(report.operationalLogs || "");
    setRecommendationText(report.recommendationText || "");
    setTreatmentCorrectiveText(report.treatmentCorrectiveText || "");
    setPhotosList(report.photos || []);
    setRecommendationPhotosList(report.recommendationPhotos || []);
    setZoneComments(report.zoneComments || {});
    setZoneCustomTitles(report.zoneCustomTitles || {});
    setServiceType(report.serviceType || "Routine Visit");
    setVisitLocation(report.visitLocation || "");
    setPhotoEvidenceCustomTitle(report.photoEvidenceCustomTitle || "");
    setPurposeOfVisitText(report.purposeOfVisitText || "");
    setPurposeOfVisitLabel(report.purposeOfVisitLabel || "");
    setIncludePurposeInOutput(report.includePurposeInOutput !== false);
    setIncludeFindingsInOutput(report.includeFindingsInOutput !== false);
    setIncludeRecommendationsInOutput(report.includeRecommendationsInOutput !== false);
    setIncludeTreatmentCorrectiveInOutput(report.includeTreatmentCorrectiveInOutput !== false);
    setIncludeOperationalLogInOutput(report.includeOperationalLogInOutput || false);
    setEditingReportId(report.id);
    setActiveSegment("create");
  };

  const handlePrintTrigger = () => {
    document.body.classList.add("pdf-download-active");
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        document.body.classList.remove("pdf-download-active");
      }, 500);
    }, 500);
  };

  const handleDownloadPDF = async (reportParam?: SavedEngineeringReport) => {
    const report = reportParam || selectedReport;
    if (!report) return;

    const defaultName = `AlWafaStar-Engineering-${report.reportNo || report.id}`;
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
  };

  const handleExportJSON = () => {
    try {
      const dataStr = JSON.stringify(savedReports, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `AlWafaStar_Engineering_Backup_${new Date().toISOString().slice(0, 10)}.json`;
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (err) {
      alert("Failed to export backup file.");
    }
  };

  const handleDeleteReport = (id: string) => {
    setReportToDeleteId(id);
  };

  const confirmDeleteReport = async () => {
    if (!reportToDeleteId) return;

    // Offline-First: immediately remove from local state
    const updated = savedReports.filter(r => r.id !== reportToDeleteId);
    setSavedReports(updated);
    localStorage.setItem("ALW_ENGINEERING_REPORTS", JSON.stringify(updated));

    try {
      await deleteDocument("engineeringReports", reportToDeleteId);
    } catch(e) {
      console.warn("Firestore delete failing on engineeringReports, deleted locally:", e);
    }
    if (selectedReport && selectedReport.id === reportToDeleteId) {
      setSelectedReport(null);
    }
    setReportToDeleteId(null);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed)) {
            // Validate basic structure
            const validated = parsed.filter(item => {
              return item && typeof item === "object" && "id" in item && "reportNo" in item && "clientName" in item;
            }) as SavedEngineeringReport[];

            if (validated.length === 0) {
              alert(t("Invalid backup file or no valid reports found.", "অকার্যকর ব্যাকআপ ফাইল বা কোনো সঠিক রিপোর্ট পাওয়া যায়নি।", "ملف احتياطي غير صالح أو لم يتم العথুর على تقارير صالحة."));
              return;
            }

            const confirmReplace = window.confirm(
              language === "bn" 
              ? `আমরা ${validated.length}টি রিপোর্ট পেয়েছি। আপনি কি এগুলো বর্তমান রিপোর্টের সাথে যুক্ত করতে চান?`
              : (language === "ar" 
                 ? `تم العثور على ${validated.length} تقارير. هل تريد دمجها مع التقارير الحالية؟`
                 : `Found ${validated.length} reports. Do you want to merge them with your current reports?`)
            );

            if (confirmReplace) {
              setSavedReports((prev) => {
                const existingIds = new Set(prev.map(r => r.id));
                const filteredNew = validated.filter(r => !existingIds.has(r.id));
                return [...prev, ...filteredNew];
              });
              alert(t("Backup restored successfully!", "ব্যাকআপ সফলভাবে রিস্টোর হয়েছে!", "تم استعادة النسخة الاحتياطية بنجاح!"));
            }
          } else {
            alert(t("Invalid file schema. Backup content must be an array of reports.", "অকার্যকর ফাইল স্কিমা। ব্যাকআপ ফাইলটি অবশ্যই খতিয়ান তালিকা হতে হবে।", "صيغة ملف غير صالحة. يجب أن يكون محتوى النسخ الاحتياطية قائمة من التقারير."));
          }
        } catch (err) {
          alert("Error parsing JSON file. Check if the file is correct.");
        }
      };
    }
  };

  return (
    <div id="engineering-report-root" className="space-y-6 w-full max-w-7xl mx-auto font-sans text-slate-100 select-none animate-fadeIn pb-12">
      
      {/* PDF Generation Loading Backdrop Overlay */}
      {isGeneratingPDF && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-[99999] flex flex-col items-center justify-center p-6 animate-fadeIn text-center select-none">
          <div className="relative flex items-center justify-center mb-6">
            <span className="absolute animate-ping inline-flex h-16 w-16 rounded-full bg-rose-500/30 opacity-75"></span>
            <div className="relative w-14 h-14 rounded-full border-4 border-[#ED1C24] border-t-transparent animate-spin"></div>
          </div>
          <h3 className="text-lg font-bold tracking-wide text-white mb-2">
            {language === "bn" ? "পিডিএফ রিপোর্ট তৈরি হচ্ছে..." : "GENERATING SYSTEM PDF REPORT..."}
          </h3>
          <p className="text-xs text-slate-450 max-w-md antialiased leading-relaxed font-mono">
            {pdfProgressText || (language === "bn" ? "অনুগ্রহ করে অপেক্ষা করুন, ইমেজ লোড এবং লেআউট সাজানো হচ্ছে..." : "Preparing document and high resolution visual assets...")}
          </p>
        </div>
      )}

      {/* SEGMENT 1: REPORTS LIST */}
      {activeSegment === "list" && (
        <div id="list-segment-container" className="space-y-6 animate-fadeIn">
          {/* Header Action Row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-850 rounded-3xl p-6 shadow-2xl">
            <div className="space-y-1.5 text-left">
              <span className="text-[10px] uppercase font-mono tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-md font-bold">🛡️ {t("PEST CONTROL DEPT", "পেষ্ট কন্ট্রোল বিভাগ", "التحكم في الآفات")}</span>
              <h2 className="text-2xl font-black text-white tracking-tight">{t("Engineering Service Reports Log", "ইঞ্জিনিয়ারিং সার্ভিস রিপোর্ট বুক", "سجلات تقارير الخدمة")}</h2>
              <p className="text-xs text-slate-400 font-medium">{t("Real-time digital inspection logs & sanitization proofs book", "বাস্তবসম্মত ডিজিটাল রিপোর্ট বুক এবং স্যানিটেশন তথ্যভাণ্ডার", "سجلات تفتيش رقمية وإثباتات التعقيم")}</p>
            </div>
            
            <button
              onClick={() => {
                resetForm();
                setActiveSegment("create");
              }}
              className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-600/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer text-white"
            >
              🚀 {t("CREATE NEW REPORT", "নতুন রিপোর্ট তৈরি করুন", "إنشاء تقرير جديد")}
            </button>
          </div>

          {/* List display */}
          {savedReports.length === 0 ? (
            <div className="bg-slate-900/40 border border-slate-850 rounded-3xl p-16 text-center space-y-4 animate-fadeIn">
              <div className="w-16 h-16 bg-slate-950/60 rounded-full flex items-center justify-center mx-auto border border-slate-800">
                <span className="text-2xl">📁</span>
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-sm font-bold text-slate-200">{t("No Reports Found Yet", "কোনো রিপোর্ট পাওয়া যায়নি", "لا توجد تقارير حالياً")}</h3>
                <p className="text-[11px] text-slate-500 font-sans leading-relaxed">{t("Start your work by tapping the green 'CREATE NEW REPORT' button above.", "উপরে সবুজ বোতামে ক্লিক করে পরিদর্শনের রিপোর্ট সাজানো শুরু করুন।", "ابدأ العمل بالضغط على زر إنشاء تقرير جديد بالأعلى.")}</p>
              </div>
            </div>
          ) : (
          <div className="bg-[#0B1121] border border-blue-900/40 rounded-[2rem] overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-emerald-400 to-blue-600 opacity-20" />
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0F172A] border-b border-blue-900/40 text-slate-400 text-[10px] uppercase font-mono tracking-widest">
                    <th className="px-5 py-4 font-bold">Report ID</th>
                    <th className="px-5 py-4 font-bold">Client / Title</th>
                    <th className="px-5 py-4 font-bold">Details</th>
                    <th className="px-5 py-4 font-bold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-900/20">
                  {savedReports.map((report, idx) => (
                    <tr key={`${report.id}-${idx}`} className="hover:bg-[#1E293B]/50 transition-colors group">
                      <td className="px-5 py-4 align-middle">
                        <div className="flex flex-col gap-1.5 items-start">
                          <span className="text-[10px] font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-700 font-bold text-slate-300 uppercase tracking-widest">{report.reportNo}</span>
                          <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-wider">{t(report.serviceType || "Routine Visit", report.serviceType || "রুটিন ভিজিট", report.serviceType || "زيارة روتينية")}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 align-middle">
                        <div className="flex flex-col">
                          <span className="text-[13px] font-extrabold text-white tracking-tight capitalize">{report.clientName}</span>
                          <span className="text-[11px] text-slate-400 font-medium mt-0.5">{report.reportTitle}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 align-middle">
                        <div className="flex flex-col gap-1 text-[10px] text-slate-400 font-mono">
                          <div className="flex items-center gap-1.5"><span className="text-[12px]">👷‍♂️</span> {report.engineerName}</div>
                          <div className="flex items-center gap-1.5 text-sky-300"><span className="text-[12px]">📅</span> {formatDateDisplay(report.date)}</div>
                          <div className="flex items-center gap-1.5 text-amber-300"><span className="text-[12px]">📍</span> {report.emirate}</div>
                        </div>
                      </td>
                      <td className="px-5 py-4 align-middle">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedReport(report);
                              setActiveSegment("preview");
                            }}
                            title="View / Print Document"
                            className="p-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-white rounded-lg transition-all cursor-pointer opacity-80 group-hover:opacity-100"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditReportClick(report)}
                            title="Edit Report"
                            className="p-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 hover:text-white rounded-lg transition-all cursor-pointer opacity-80 group-hover:opacity-100"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownloadPDF(report)}
                            title="Download Direct PDF Report"
                            className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-[#10B981] hover:text-white rounded-lg transition-all cursor-pointer opacity-80 group-hover:opacity-100"
                          >
                            <FileCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteReport(report.id)}
                            title="Delete Report Permanently"
                            className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 hover:text-white rounded-lg transition-all cursor-pointer opacity-80 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          )}
        </div>
      )}

      {/* SEGMENT 2: REAL-TIME CREATION FORM */}
      {activeSegment === "create" && (
        <div id="report-creation-panel" className="max-w-5xl mx-auto space-y-6">
          <div className="space-y-6 w-full">
            <div className="bg-[#0B1121] border border-blue-900/50 rounded-[2rem] p-6 sm:p-8 space-y-6 shadow-[0_0_50px_rgba(30,58,138,0.1)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-emerald-400 to-blue-600 opacity-20" />
              
              {/* Top Navigation / Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-2 justify-between relative z-10">
                <div className="flex flex-wrap items-center gap-3">
                  
                  {/* EDIT MODE Tab */}
                  <div className="flex items-center bg-[#0F172A] border border-blue-500/30 rounded-lg overflow-hidden shadow-sm">
                     <div className="px-2.5 py-1.5 bg-[#10B981] flex items-center justify-center">
                       <span className="text-slate-950 font-black text-xs">W</span>
                     </div>
                     <div className="px-3 py-1.5 flex items-center justify-center">
                       <span className="text-[11px] font-bold tracking-widest text-slate-200">EDIT MODE</span>
                     </div>
                  </div>
                  
                  {/* QUICK TEXT button */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowQuickTextPopover(!showQuickTextPopover)}
                      className="bg-transparent hover:bg-[#10B981]/10 text-[#10B981] font-sans font-bold text-[10px] uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-[#10B981] flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                      title={t("Insert Work Description Templates", "কাজের বিবরণ টেমপ্লেট ইনসার্ট", "قوالب تفاصيل العمل")}
                    >
                      <Wifi className="w-3 h-3 shrink-0" />
                      <span>{t("Quick Text", "কাজের বিবরণ টেমপ্লেট ইনসার্ট", "النصوص السريعة")}</span>
                    </button>
                    
                    {/* Quick Text Popover Menu */}
                    {showQuickTextPopover && (
                      <div className="absolute left-0 top-10 w-72 bg-[#0B1121] border border-blue-500/30 rounded-2xl shadow-2xl p-2 z-50 animate-fadeIn font-sans space-y-1.5 max-h-[300px] overflow-y-auto">
                        <div className="p-2 border-b border-slate-800 flex justify-between items-center">
                          <span className="text-[10px] font-black tracking-wider uppercase text-[#10B981]">{t("Select Template", "কাজের বিবরণ নির্বাচন", "اختر القالب")}</span>
                          <button type="button" onClick={() => setShowQuickTextPopover(false)} className="text-[9px] font-bold text-rose-450 hover:text-rose-405">[✕]</button>
                        </div>
                        {WORK_TEMPLATES.map((tpl, tIdx) => (
                          <button
                            key={tIdx}
                            type="button"
                            onClick={() => {
                              setReportTitle(tpl.title.en);
                              setShowQuickTextPopover(false);
                            }}
                            className="w-full text-left p-2 hover:bg-[#1E293B] rounded-xl transition text-[11px] font-semibold text-slate-300 hover:text-white"
                          >
                            ⭐ {language === 'bn' ? tpl.title.bn : (language === 'ar' ? tpl.title.ar : tpl.title.en)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => setActiveSegment("list")}
                    className="flex-1 lg:flex-none justify-center px-4 py-2 bg-[#0F172A] border border-blue-500/30 hover:bg-slate-800 text-slate-300 font-bold text-[10px] uppercase tracking-wider rounded-lg flex items-center gap-2 cursor-pointer transition-all active:scale-95 shadow-sm"
                  >
                    <span>📄 {t("All Saved Reports", "সব রিপোর্ট", "كل التقارير")}</span>
                  </button>
                </div>
              </div>

              {/* Form Metadata Fields Container */}
              <div className="bg-[#0B1121] border border-blue-500/30 p-6 rounded-2xl space-y-6 shadow-inner relative z-10">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Left Column Box 1: SCOPE */}
                  <div 
                    id="field-reportTitle"
                    className={`space-y-1.5 relative transition-all duration-300 ${
                      validationErrors.reportTitle ? "animate-float-alert border-2 border-sky-500 rounded-xl p-2 bg-sky-500/5" : ""
                    }`}
                  >
                    <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold font-mono">
                      🛠️ {t("Scope / Work Category", "কাজের বিবরণ / ক্ষেত্র", "مجال العمل")}
                    </label>
                    <input
                      type="text"
                      value={reportTitle}
                      onChange={(e) => setReportTitle(e.target.value)}
                      placeholder={t("Pest Control Audit, Fumigation, Routine Inspection...", "ক্যাম্পাস অডিট, ফিউমিগেশন, সামগ্রিক পরিদর্শন...", "التحكم في الآفات، تعقيم، تفتيش...")}
                      className="w-full bg-[#0B0F19] border border-[#1D4ED8] focus:border-[#3B82F6] placeholder-slate-600 text-slate-100 rounded-xl py-2.5 px-3.5 outline-none font-bold text-[11px] tracking-wide transition-colors shadow-inner"
                    />
                  </div>

                  {/* Right Column Box 1: FROM ALWAFA STAR - PEST CONTROL */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold font-mono flex justify-between items-center">
                      <span>🏢 {t("Company Brand", "কোম্পানি ব্র্যান্ড", "علامة الشركة التجارية")}</span>
                    </label>
                    <div className="bg-[#0B0F19] border border-[#1D4ED8] p-1 rounded-xl shadow-inner h-[42px] items-center w-full">
                      <div className="flex items-center pl-2.5 gap-2 bg-cyan-500 h-full rounded-lg border border-cyan-400">
                        <span className="w-2 h-2 rounded-full bg-white animate-ping shrink-0" />
                        <span className="w-2 h-2 rounded-full bg-white absolute shrink-0" />
                        <span className="text-[10px] font-black tracking-widest text-[#0B1121] font-sans select-none pl-3 truncate">
                          {customCompanyName ? customCompanyName.toUpperCase().trim() : "AL WAFA STAR PEST CONTROL SERVICE"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* SYSTEM ENGINEER */}
                  <div className="grid grid-cols-2 gap-2 w-full col-span-1">
                    {/* Left Sub-Column */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold font-mono">
                          👷‍♂️ {t("Prepared by", "প্রস্তুতককারী (Prepared By)", "أعدت بواسطة")}
                        </label>
                        {!engineerName.trim() && (
                          <span className="text-[9.5px] text-amber-500 font-extrabold animate-pulse flex items-center gap-1 font-sans">
                            ⚠️ {t("Required", "পূরণ করুন", "مطلوب")}
                          </span>
                        )}
                      </div>
                      <div 
                        id="field-engineerName"
                        className={`flex items-center gap-2 bg-[#1D4ED8] hover:bg-blue-700 transition text-white px-4 py-2.5 rounded-xl border-2 shadow-sm w-full transition-all duration-300 relative h-[46px] ${
                          validationErrors.engineerName ? "animate-float-alert border-blue-400" : ""
                        } ${
                          !engineerName.trim()
                            ? "border-sky-500 shadow-[0_0_14px_rgba(14,165,233,0.5)]"
                            : "border-blue-500"
                        }`}
                      >
                        <span className="text-[10.5px] font-black shrink-0 tracking-tight">ENGINEER:</span>
                        <input
                          type="text"
                          value={engineerName}
                          onChange={(e) => setEngineerName(e.target.value)}
                          className="bg-transparent border-none text-white focus:outline-none w-full font-black text-xs placeholder-blue-200 uppercase cursor-text"
                          placeholder="AISHA"
                        />
                        <Edit3 className="w-3.5 h-3.5 text-blue-200/80 shrink-0 pointer-events-none" />
                        {validationErrors.engineerName && (
                          <span className="absolute -bottom-5 left-0 bg-sky-600 text-white text-[8px] px-1.5 py-0.5 rounded shadow-lg font-black animate-pulse z-50 whitespace-nowrap">
                            ⚠️ {t("Engineer Required!", "প্রকৌশলীর নাম লিখুন!", "اسم المهندس مطلوب")}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right Sub-Column */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold font-mono">
                          📍 {t("State Name", "স্টেটের নাম (State Name)", "الولاية")}
                        </label>
                      </div>
                      <select
                        value={selectedEmirate}
                        onChange={(e) => setSelectedEmirate(e.target.value)}
                        className="w-full bg-[#1D4ED8] hover:bg-blue-700 border-2 border-blue-500 text-white font-extrabold rounded-xl py-2.5 px-3 text-xs outline-none cursor-pointer transition-colors h-[46px] uppercase font-sans"
                      >
                        <option value="Dubai" className="bg-[#111827] text-slate-100 font-sans">Dubai</option>
                        <option value="Abu Dhabi" className="bg-[#111827] text-slate-100 font-sans">Abu Dhabi</option>
                        <option value="Sharjah" className="bg-[#111827] text-slate-100 font-sans">Sharjah</option>
                        <option value="Ajman" className="bg-[#111827] text-slate-100 font-sans">Ajman</option>
                        <option value="Umm Al Quwain" className="bg-[#111827] text-slate-100 font-sans">Umm Al Quwain</option>
                        <option value="Ras Al Khaimah" className="bg-[#111827] text-slate-100 font-sans">Ras Al Khaimah</option>
                        <option value="Fujairah" className="bg-[#111827] text-slate-100 font-sans">Fujairah</option>
                      </select>
                    </div>
                  </div>

                  {/* CLIENT / FACILITY NAME */}
                  <div 
                    id="field-clientName"
                    className={`space-y-1.5 relative transition-all duration-300 ${
                      validationErrors.clientName ? "animate-float-alert border-2 border-sky-500 rounded-xl p-2 bg-sky-500/5" : ""
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <label className="text-[10.5px] uppercase tracking-wider text-slate-400 font-bold font-mono">
                        💼 {t("TO *", "প্রাপক (To) *", "إلى *")}
                      </label>
                      {!clientName.trim() && (
                        <span className="text-[9.5px] text-[#A855F7] font-extrabold animate-pulse flex items-center gap-1 font-sans">
                          ⚠️ {t("Required", "পূরণ করুন", "مطلوب")}
                        </span>
                      )}
                    </div>
                    
                    <div className="relative flex items-center font-sans">
                      <input
                        type="text"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder={t("Enter client name or click 🏥 to look up...", "ক্লায়েন্ট নাম লিখুন অথবা 🏥 ক্লিক করে পছন্দ করুন...", "أدخل اسم العميل أو اضغط 🏥 للاختيار...")}
                        className={`w-full bg-[#0B0F19] border placeholder-slate-600 text-slate-100 rounded-xl py-2.5 pl-3 pr-16 outline-none focus:border-[#10B981] font-medium font-sans ${
                          !clientName.trim()
                            ? "border-sky-500 shadow-[0_0_14px_rgba(14,165,233,0.5)]"
                            : "border-slate-700 font-sans"
                        }`}
                      />
                      {validationErrors.clientName && (
                        <span className="absolute -top-10 right-2 bg-sky-600 text-white text-[9px] px-2 py-0.5 rounded shadow-lg font-black animate-pulse z-50 whitespace-nowrap font-sans font-sans">
                          ⚠️ {t("Client Required!", "ক্লায়েন্টের নাম আবশ্যক!", "يرجى اختيار العميل")}
                        </span>
                      )}
                      
                      {/* Interactive Hospital Picker Action Button */}
                      <button
                        type="button"
                        onClick={() => setShowHospitalDropdown(!showHospitalDropdown)}
                        title={`Show ${selectedEmirate} Hospitals List`}
                        className="absolute right-1.5 top-1.5 bottom-1.5 px-2 bg-emerald-500/10 hover:bg-emerald-500/20 active:scale-95 text-[#10B981] border border-emerald-500/20 rounded-lg flex items-center gap-1 transition-all cursor-pointer font-sans font-black text-[9px]"
                      >
                        <span className="text-sm">🏥</span>
                        <span className="text-[8.5px] font-black tracking-widest font-mono">GET</span>
                      </button>
                    </div>

                    {/* Popover / Dropdown for selection with Search & Emirates filter */}
                    {showHospitalDropdown && (
                      <div className="absolute left-0 right-0 z-50 mt-1 bg-[#111827] border-2 border-slate-700 p-3 rounded-2xl shadow-2xl space-y-2 max-h-[340px] overflow-y-auto">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                          <span className="text-[10px] font-black text-[#10B981] font-mono tracking-wider uppercase flex items-center gap-1.5">
                            🏥 <span>{t("Hospital & Clinic Directory", "হসপিটাল ও ক্লিনিক ডিরেক্টরি", "دليل المستشفيات والعيادات")}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setShowHospitalDropdown(false);
                              setHospitalSearch("");
                            }}
                            className="text-[9px] font-extrabold text-rose-450 hover:text-rose-400 cursor-pointer"
                          >
                            [✕ CLOSE]
                          </button>
                        </div>

                        {/* Search and Filters inside directory dropdown */}
                        <div className="grid grid-cols-12 gap-2 pb-1.5 font-sans">
                          <input
                            type="text"
                            value={hospitalSearch}
                            onChange={(e) => setHospitalSearch(e.target.value)}
                            placeholder={t("Filter by name...", "নাম দিয়ে ফিল্টার করুন...", "البحث بالاسم...")}
                            className="col-span-7 bg-[#0B0F19] text-white border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs focus:border-[#10B981] outline-none font-sans"
                          />
                          <select
                            value={selectedEmirate}
                            onChange={(e) => setSelectedEmirate(e.target.value)}
                            className="col-span-5 bg-[#0B0F19] text-white border border-slate-700 rounded-xl px-1.5 py-1.5 text-xs outline-none cursor-pointer font-sans font-bold"
                          >
                            {["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Umm Al Quwain", "Ras Al Khaimah", "Fujairah"].map((emi) => (
                              <option key={emi} value={emi} className="bg-slate-900">{emi}</option>
                            ))}
                          </select>
                        </div>

                        {/* Hospital entries list */}
                        <div className="space-y-1 divide-y divide-slate-800/60 max-h-[180px] overflow-y-auto pr-1">
                          {hospitalSearch.trim() ? (
                            (() => {
                              const queryStr = hospitalSearch.toLowerCase().trim();
                              const matched = activeLocations.filter(
                                loc => loc.name.toLowerCase().includes(queryStr) || loc.emirate.toLowerCase().includes(queryStr)
                              );

                              if (matched.length === 0) {
                                return (
                                  <div className="text-[10px] text-slate-500 py-6 text-center font-sans">
                                    {t("No hospital presets found matching your query.", "কোনো মিল পাওয়া যায়নি।", "لم يتم العثور على أي مستشفى مطابق لعملية البحث.")}
                                  </div>
                                );
                              }

                              return matched.map((loc, idx) => {
                                return (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => {
                                      setClientName(loc.name);
                                      setSelectedEmirate(loc.emirate);
                                      setShowHospitalDropdown(false);
                                      setHospitalSearch("");
                                    }}
                                    className="w-full text-left py-2 px-1.5 hover:bg-slate-800 text-xs text-slate-200 hover:text-white rounded-lg transition-all flex items-center justify-between font-sans cursor-pointer group"
                                  >
                                    <div className="flex flex-col text-left font-sans">
                                      <span className="font-extrabold group-hover:text-emerald-400 transition-colors">{loc.name}</span>
                                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider font-mono">{loc.emirate}</span>
                                    </div>
                                    <span className="text-[8.5px] font-black bg-[#10B981]/15 text-[#10B981] px-1.5 py-0.5 rounded uppercase font-mono tracking-wider shrink-0">
                                      PICK
                                    </span>
                                  </button>
                                );
                              });
                            })()
                          ) : (
                            activeLocations
                              .filter(loc => loc.emirate.toLowerCase() === selectedEmirate.toLowerCase())
                              .map((loc, idx) => {
                                return (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => {
                                      setClientName(loc.name);
                                      setSelectedEmirate(loc.emirate);
                                      setShowHospitalDropdown(false);
                                    }}
                                    className="w-full text-left py-2.5 px-1.5 hover:bg-slate-850 text-xs text-slate-200 hover:text-white rounded-lg transition-all flex items-center justify-between font-sans cursor-pointer group"
                                  >
                                    <div className="flex flex-col text-left font-sans font-sans">
                                      <span className="font-extrabold group-hover:text-emerald-400 transition-colors">{loc.name}</span>
                                      <span className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider font-mono">{loc.emirate}</span>
                                    </div>
                                    <span className="text-[8.5px] font-black bg-[#10B981]/15 text-[#10B981] px-1.5 py-0.5 rounded uppercase font-mono tracking-wider shrink-0">
                                      PICK
                                    </span>
                                  </button>
                                );
                              })
                          )}
                          
                          {!hospitalSearch.trim() && activeLocations.filter(loc => loc.emirate.toLowerCase() === selectedEmirate.toLowerCase()).length === 0 && (
                            <p className="text-[10px] text-slate-500 py-4 text-center font-sans">
                              {t("No locations found for this Emirate.", "এই আমিরাতে কোনো সক্রিয় লোকেশন ফাইল করা নেই।", "لا توجد مستشفيات مضافة في هذه الإمارة.")}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* TYPE OF SERVICE & PLACEHOLDER */}
                  <div className="grid grid-cols-2 gap-2 w-full font-sans">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold font-mono flex items-center justify-between">
                        <span>🛡️ {t("Type of Service", "সার্ভিসের ধরণ", "نوع الخدمة")}</span>
                        <button
                          type="button"
                          onClick={() => setShowCustomServicePopup(true)}
                          className="text-[9px] text-emerald-400 hover:text-emerald-300 font-bold px-1.5 py-0.5 rounded transition-all cursor-pointer select-none border border-emerald-500/20 bg-emerald-500/5 active:scale-95"
                        >
                          {t("+ Add New", "+ নতুন যোগ", "+ إضافة جديد")}
                        </button>
                      </label>
                      <select
                        value={serviceType}
                        onChange={(e) => {
                          if (e.target.value === "__add_new_custom__") {
                            setShowCustomServicePopup(true);
                          } else {
                            setServiceType(e.target.value);
                          }
                        }}
                        className="w-full bg-[#1D4ED8] hover:bg-blue-700 border-2 border-blue-500 text-white font-black rounded-xl h-[42px] px-3 text-[11px] outline-none cursor-pointer transition-colors uppercase font-sans"
                      >
                        {customServiceTypes.map((stVal, idx) => (
                          <option key={idx} value={stVal} className="bg-[#111827] text-slate-100 font-sans">
                            {stVal}
                          </option>
                        ))}
                        <option value="__add_new_custom__" className="bg-[#111827] text-yellow-400 font-bold font-sans">
                          {t("+ Add Custom Type...", "+ নতুন ধরণের সার্ভিস যোগ...", "+ إضافة خدمة مخصصة...")}
                        </option>
                      </select>
                    </div>
                      
                    {/* Date Box */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold font-mono">
                        📅 {t("Date", "তারিখ", "التاريخ")}
                      </label>
                      <div className="w-full bg-yellow-100/90 hover:bg-yellow-250/50 rounded-xl font-mono flex items-center justify-between relative transition-colors h-[42px] shadow-sm border border-yellow-300 px-3 py-1">
                        {/* Dropdown selectors tightly packed in a compact row */}
                        <div className="flex items-center gap-1.5 text-[13px] font-black text-slate-800">
                          {/* DAY SELECT */}
                          <div className="flex items-center relative hover:bg-yellow-200/60 p-1.5 rounded-lg transition-colors">
                            <select
                              value={getParsedReportDateParts().day}
                              onChange={(e) => updateReportDatePart("day", e.target.value)}
                              className="bg-transparent text-slate-800 font-extrabold outline-none cursor-pointer appearance-none pr-3 text-center w-[30px] h-[30px] border-none p-0 focus:ring-0 leading-none"
                              style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                            >
                              {Array.from({ length: 31 }, (_, i) => {
                                const d = String(i + 1).padStart(2, "0");
                                return <option key={d} value={d} className="bg-slate-900 text-white font-mono">{d}</option>;
                              })}
                            </select>
                            <span className="text-[8px] text-slate-500 font-bold absolute right-1 pointer-events-none select-none">v</span>
                          </div>

                          <span className="text-slate-400 font-bold select-none">/</span>

                          {/* MONTH SELECT */}
                          <div className="flex items-center relative hover:bg-yellow-200/60 p-1.5 rounded-lg transition-colors">
                            <select
                              value={getParsedReportDateParts().month}
                              onChange={(e) => updateReportDatePart("month", e.target.value)}
                              className="bg-transparent text-slate-800 font-extrabold outline-none cursor-pointer appearance-none pr-3 text-center w-[30px] h-[30px] border-none p-0 focus:ring-0 leading-none"
                              style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                            >
                              {["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"].map(m => (
                                <option key={m} value={m} className="bg-slate-900 text-white font-mono">{m}</option>
                              ))}
                            </select>
                            <span className="text-[8px] text-slate-500 font-bold absolute right-1 pointer-events-none select-none">v</span>
                          </div>

                          <span className="text-slate-400 font-bold select-none">/</span>

                          {/* YEAR SELECT */}
                          <div className="flex items-center relative hover:bg-yellow-200/60 p-1.5 rounded-lg transition-colors font-mono">
                            <select
                              value={getParsedReportDateParts().year}
                              onChange={(e) => updateReportDatePart("year", e.target.value)}
                              className="bg-transparent text-slate-800 font-extrabold outline-none cursor-pointer appearance-none pr-3 text-center w-[46px] h-[30px] border-none p-0 focus:ring-0 leading-none"
                              style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                            >
                              {Array.from({ length: 15 }, (_, i) => {
                                const y = String(2024 + i);
                                return <option key={y} value={y} className="bg-slate-900 text-white font-mono">{y}</option>;
                              })}
                            </select>
                            <span className="text-[8px] text-slate-500 font-bold absolute right-1 pointer-events-none select-none">v</span>
                          </div>
                        </div>

                        {/* Calendar Icon Button with its own separate Date picker input */}
                        <div className="relative flex items-center justify-center w-8 h-8 rounded-lg hover:bg-yellow-200/80 active:scale-95 transition-all cursor-pointer">
                          <Calendar className="w-4.5 h-4.5 text-slate-800 group-hover:text-amber-700 pointer-events-none" />
                          <input
                            type="date"
                            value={reportDate}
                            onChange={(e) => {
                              if (e.target.value) {
                                setReportDate(e.target.value);
                              }
                            }}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full text-[16px]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* LOCATION DETAILS */}
                  <div 
                    className={`space-y-1.5 relative transition-all duration-300 ${
                      validationErrors.visitLocation ? "animate-float-alert border-2 border-sky-500 rounded-xl p-2 bg-sky-500/5" : ""
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold font-mono">
                        📍 {t("Location Details", "লোকেশন ডিটেইলস", "تفاصيل الموقع")}
                      </label>
                      {!visitLocation.trim() && (
                        <span className="text-[9.5px] text-[#A855F7] font-extrabold animate-pulse flex items-center gap-1 font-sans">
                          ⚠️ {t("Required", "পূরণ করুন", "مطلوب")}
                        </span>
                      )}
                    </div>
                    <textarea
                      ref={locationDetailsRef}
                      rows={1}
                      value={visitLocation}
                      onChange={(e) => setVisitLocation(e.target.value)}
                      placeholder={t("All outer regions, specific wards...", "ভবনের চারপাশে, নির্দিষ্ট ওয়ার্ড...", "جميع المناطق الخارجية...")}
                      className="w-full bg-cyan-100/90 hover:bg-cyan-100 border-2 border-cyan-300 focus:border-[#10B981] placeholder-slate-500 text-slate-900 rounded-xl py-2.5 px-3.5 outline-none font-bold text-[11px] tracking-wide transition-colors shadow-inner resize-none min-h-[42px] overflow-hidden leading-tight"
                    />
                    {validationErrors.visitLocation && (
                      <span className="absolute -top-10 right-2 bg-sky-600 text-white text-[9px] px-2 py-0.5 rounded shadow-lg font-black animate-pulse z-50 whitespace-nowrap">
                        ⚠️ {t("Location Required!", "লোকেশন আবশ্যক!", "الموقع مطلوب")}
                      </span>
                    )}
                  </div>
                </div>

                {/* NEW FULL-WIDTH PURPOSE OF VISITS TEXT AREA */}
                <div className="pt-1.5 w-full space-y-1.5 relative">
                  <div className="flex justify-between items-center relative w-full">
                    <div className="flex items-center gap-1.5 cursor-pointer group" onClick={() => setShowPurposePopup(!showPurposePopup)}>
                      <input 
                        type="checkbox" 
                        className="w-3.5 h-3.5 rounded border-slate-700 text-cyan-500 focus:ring-cyan-500 bg-slate-900 cursor-pointer"
                        checked={includePurposeInOutput}
                        onChange={(e) => setIncludePurposeInOutput(e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                        title={t("Include in Report Output", "রিপোর্ট আউটপুটে যুক্ত করুন", "تضمين في مخرجات التقرير")}
                      />
                      <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold font-mono cursor-pointer flex items-center gap-1.5">
                        🎯 {purposeOfVisitLabel || t("Purpose of visits", "পরিদর্শনের উদ্দেশ্য", "الغرض من الزيارات")}
                        <Settings2 className="w-3.5 h-3.5 text-cyan-500 opacity-60 group-hover:opacity-100 transition-opacity" />
                      </label>
                    </div>
                    
                    {showPurposePopup && (
                      <div className="absolute top-6 left-0 w-[280px] sm:w-[320px] bg-slate-800 border border-slate-700/60 rounded-xl shadow-2xl p-3 z-50 animate-fadeIn cursor-default z-[55]">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-bold text-slate-300">
                            {t("Select / Add Purpose", "উদ্দেশ্য নির্বাচন / যোগ করুন", "تحديد / إضافة الغرض")}
                          </span>
                          <button 
                            type="button" 
                            onClick={() => setShowPurposePopup(false)}
                            className="text-slate-400 hover:text-rose-400 text-xs font-bold p-1 rounded"
                          >
                            [✕]
                          </button>
                        </div>
                        
                        <div className="flex gap-1.5 mb-2.5 items-start">
                          <textarea
                            value={newPurposeInput}
                            onChange={(e) => setNewPurposeInput(e.target.value)}
                            placeholder={t("Add new (multi-line supported)...", "নতুন যোগ করুন...", "إضافة جديد...")}
                            className="flex-1 min-h-[60px] max-h-[150px] resize-y bg-slate-900 border border-slate-700 hover:border-slate-600 focus:border-cyan-500 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-200 outline-none placeholder:text-slate-500 transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (newPurposeInput.trim()) {
                                setCustomPurposes(prev => [...prev, newPurposeInput.trim()]);
                                setNewPurposeInput("");
                              }
                            }}
                            className="bg-cyan-600/20 text-cyan-400 hover:bg-cyan-500 hover:text-slate-900 p-1.5 rounded-lg transition-colors flex items-center justify-center shrink-0"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex flex-col gap-1.5 max-h-[300px] overflow-y-auto pr-1">
                          {customPurposes.map((opt, i) => (
                            <div key={i} className="flex group items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setPurposeOfVisitLabel(opt);
                                  setShowPurposePopup(false);
                                }}
                                className="flex-1 text-left text-[11px] font-sans text-slate-200 hover:text-white bg-slate-900/50 hover:bg-cyan-600/40 border border-slate-700/50 hover:border-cyan-500/50 p-2 rounded-lg transition-all truncate"
                                title={opt}
                              >
                                {opt}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(t("Delete this item?", "এই আইটেমটি মুছবেন?", "هل تريد حذف هذا العنصر؟"))) {
                                    setCustomPurposes(prev => prev.filter((_, idx) => idx !== i));
                                  }
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-all shrink-0"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                          {customPurposes.length === 0 && (
                            <div className="text-center p-3 text-[10px] text-slate-500 italic border border-dashed border-slate-700 rounded-lg">
                              {t("No items found. Add one above.", "কোন আইটেম নেই। উপরে যোগ করুন।", "لا توجد عناصر. أضف واحدًا أعلاه.")}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center">
                      <button 
                        type="button"
                        onClick={() => setShowPurposeTextPopup(!showPurposeTextPopup)}
                        className="text-cyan-400 hover:text-cyan-300 transition-colors p-0.5 rounded cursor-pointer relative z-10"
                      >
                         <Settings2 className="w-4 h-4" />
                      </button>
                      {renderCustomDropdown(showPurposeTextPopup, setShowPurposeTextPopup, customPurposeText, setCustomPurposeText, purposeOfVisitText, setPurposeOfVisitText, newPurposeTextInput, setNewPurposeTextInput)}
                    </div>
                  </div>
                  <textarea
                    ref={purposeOfVisitTextRef}
                    rows={1}
                    value={purposeOfVisitText}
                    onChange={(e) => setPurposeOfVisitText(e.target.value)}
                    placeholder={t("Enter custom purpose of visits here...", "এখানে পরিদর্শনের কাস্টম উদ্দেশ্য লিখুন...", "أدخل الغرض المخصص من الزيارة هنا...")}
                    className="w-full bg-cyan-100/90 hover:bg-cyan-100 border-2 border-cyan-300 focus:border-[#10B981] placeholder-slate-500 text-slate-900 rounded-xl py-2.5 px-3.5 outline-none font-bold text-[11px] tracking-wide transition-colors shadow-inner resize-none min-h-[42px] overflow-hidden leading-tight"
                  />
                </div>

                {/* FULL WIDTH TEXT AREAS */}
                <div className="space-y-5 pt-3">
                  {/* INSPECTION (workDetailsText) */}
                  <div 
                    className={`space-y-1.5 relative transition-all duration-300 ${
                      validationErrors.workDetailsText ? "animate-float-alert border-2 border-sky-500 rounded-xl p-2 bg-sky-500/5" : ""
                    }`}
                  >
                    <div className="flex justify-between items-center relative w-full">
                      <label className="text-[10px] uppercase tracking-wider text-slate-300 font-bold font-mono flex items-center gap-1.5 cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="w-3.5 h-3.5 rounded border-slate-700 text-sky-500 focus:ring-sky-500 bg-slate-900 cursor-pointer"
                          checked={includeFindingsInOutput}
                          onChange={(e) => setIncludeFindingsInOutput(e.target.checked)}
                          title={t("Include in Report Output", "রিপোর্ট আউটপুটে যুক্ত করুন", "تضمين في مخرجات التقرير")}
                        />
                        <span className="text-sm">🔍</span> {t("Inspection", "পরিদর্শন", "تفتيش")}
                      </label>
                      <button 
                        type="button"
                        onClick={() => setShowWorkDetailsPopup(!showWorkDetailsPopup)}
                        className="text-cyan-400 hover:text-cyan-300 transition-colors p-0.5 rounded cursor-pointer relative z-10"
                      >
                         <Settings2 className="w-4 h-4" />
                      </button>
                      {renderCustomDropdown(showWorkDetailsPopup, setShowWorkDetailsPopup, customWorkDetails, setCustomWorkDetails, workDetailsText, setWorkDetailsText, newWorkDetailsInput, setNewWorkDetailsInput)}
                    </div>
                    <textarea
                      ref={workDetailsTextRef}
                      rows={2}
                      value={workDetailsText}
                      onChange={(e) => setWorkDetailsText(e.target.value)}
                      placeholder={t("Enter inspection findings...", "পরিদর্শনের বর্ণনা লিখুন...", "أدخل نتائج التفتيش...")}
                      className="w-full bg-[#1D4ED8] hover:bg-blue-700 border-2 border-[#1E3A8A] focus:border-[#3B82F6] placeholder-blue-300 text-white rounded-xl py-3 px-4 outline-none font-medium text-[12px] tracking-wide transition-colors shadow-inner min-h-[56px] overflow-hidden leading-relaxed"
                    />
                    {validationErrors.workDetailsText && (
                      <span className="absolute -top-10 right-2 bg-sky-600 text-white text-[9px] px-2 py-0.5 rounded shadow-lg font-black animate-pulse z-50 whitespace-nowrap">
                        ⚠️ {t("Inspection info Required!", "পরিদর্শনের তথ্য আবশ্যক!", "معلومات التفتيش مطلوبة")}
                      </span>
                    )}
                  </div>

                  {/* RECOMMENDATION (recommendationText) */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center relative w-full">
                      <label className="text-[10px] uppercase tracking-wider text-slate-300 font-bold font-mono flex items-center gap-1.5 cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="w-3.5 h-3.5 rounded border-slate-700 text-amber-500 focus:ring-amber-500 bg-slate-900 cursor-pointer"
                          checked={includeRecommendationsInOutput}
                          onChange={(e) => setIncludeRecommendationsInOutput(e.target.checked)}
                          title={t("Include in Report Output", "রিপোর্ট আউটপুটে যুক্ত করুন", "تضمين في مخرجات التقرير")}
                        />
                        <span className="text-sm">💡</span> {t("Recommendation", "সুপারিশ", "توصية")}
                      </label>
                      <button 
                        type="button"
                        onClick={() => setShowRecommendationPopup(!showRecommendationPopup)}
                        className="text-cyan-400 hover:text-cyan-300 transition-colors p-0.5 rounded cursor-pointer relative z-10"
                      >
                         <Settings2 className="w-4 h-4" />
                      </button>
                      {renderCustomDropdown(showRecommendationPopup, setShowRecommendationPopup, customRecommendations, setCustomRecommendations, recommendationText, setRecommendationText, newRecommendationInput, setNewRecommendationInput)}
                    </div>
                    <textarea
                      ref={recommendationTextRef}
                      rows={2}
                      value={recommendationText}
                      onChange={(e) => setRecommendationText(e.target.value)}
                      placeholder={t("Enter recommendations...", "সুপারিশ বা প্রস্তাবনা লিখুন...", "أدخل التوصيات...")}
                      className="w-full bg-[#1D4ED8] hover:bg-blue-700 border-2 border-[#1E3A8A] focus:border-[#3B82F6] placeholder-blue-300 text-white rounded-xl py-3 px-4 outline-none font-medium text-[12px] tracking-wide transition-colors shadow-inner min-h-[56px] overflow-hidden"
                    />
                  </div>

                  {/* TREATMENT CORRECTIVE RECOMMENDATIONS */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between items-center border-b border-red-500/30 pb-0.5 relative w-full">
                      <label className="text-[10px] uppercase tracking-wider text-red-500 font-bold font-mono flex items-center gap-1.5">
                        <span className="text-sm">🛠️</span> {t("TREATMENT CORRECTIVE RECOMMENDATIONS:", "সংশোধনমূলক সুপারিশ:", "التوصيات التصحيحية للمعالجة:")}
                      </label>
                      <div className="flex items-center gap-1.5 relative">
                        <input 
                          type="checkbox" 
                          className="w-3.5 h-3.5 rounded border-slate-700 text-red-500 focus:ring-red-500 bg-slate-900 cursor-pointer"
                          checked={includeTreatmentCorrectiveInOutput}
                          onChange={(e) => setIncludeTreatmentCorrectiveInOutput(e.target.checked)}
                          title={t("Include in Report Output", "রিপোর্ট আউটপুটে যুক্ত করুন", "تضمين في مخرجات التقرير")}
                        />
                        <button 
                          type="button"
                          onClick={() => setShowTreatmentPopup(!showTreatmentPopup)}
                          className="text-cyan-400 hover:text-cyan-300 transition-colors p-0.5 rounded cursor-pointer ml-1 relative z-10"
                        >
                           <Settings2 className="w-4 h-4" />
                        </button>
                        {renderCustomDropdown(showTreatmentPopup, setShowTreatmentPopup, customTreatments, setCustomTreatments, treatmentCorrectiveText, setTreatmentCorrectiveText, newTreatmentInput, setNewTreatmentInput)}
                      </div>
                    </div>
                    <textarea
                      ref={treatmentCorrectiveTextRef}
                      rows={2}
                      value={treatmentCorrectiveText}
                      onChange={(e) => setTreatmentCorrectiveText(e.target.value)}
                      placeholder={t("Enter treatment corrective recommendations...", "সংশোধনমূলক সুপারিশ লিখুন...", "أدخل التوصيات التصحيحية...")}
                      className="w-full bg-[#0F172A] border border-red-900/50 focus:border-red-500 placeholder-slate-600 text-slate-200 rounded-xl py-3 px-4 outline-none font-medium text-[12px] tracking-wide transition-colors shadow-inner min-h-[56px] overflow-hidden leading-relaxed"
                    />
                  </div>

                  {/* OPERATIONAL LOG ENTRY (operationalLogsText) */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center relative w-full">
                      <label className="text-[10px] uppercase tracking-wider text-slate-300 font-bold font-mono flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={includeOperationalLogInOutput}
                          onChange={(e) => setIncludeOperationalLogInOutput(e.target.checked)}
                          className="w-3.5 h-3.5 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-900 cursor-pointer"
                        />
                        <span className="text-sm">📄</span> {t("Operational Log Entry", "অপারেশনাল লগ", "سجل العمليات")}
                      </label>
                      <button 
                        type="button"
                        onClick={() => setShowOperationalLogsPopup(!showOperationalLogsPopup)}
                        className="text-cyan-400 hover:text-cyan-300 transition-colors p-0.5 rounded cursor-pointer relative z-10"
                      >
                         <Settings2 className="w-4 h-4" />
                      </button>
                      {renderCustomDropdown(showOperationalLogsPopup, setShowOperationalLogsPopup, customOperationalLogs, setCustomOperationalLogs, operationalLogsText, setOperationalLogsText, newOperationalLogsInput, setNewOperationalLogsInput)}
                    </div>
                    {includeOperationalLogInOutput && (
                      <textarea
                        ref={operationalLogsTextRef}
                        rows={2}
                        value={operationalLogsText}
                        onChange={(e) => setOperationalLogsText(e.target.value)}
                        placeholder={t("Enter operational log details (Type anything you want here, it will not populate automatically)...", "অপারেশনাল লগের বিবরণ লিখুন...", "أدخل تفاصيل سجل العمليات...")}
                        className="w-full bg-[#0B0F19] border border-slate-700 focus:border-[#10B981] placeholder-slate-600 text-slate-300 rounded-xl py-3 px-4 outline-none font-medium text-[12px] tracking-wide transition-colors shadow-inner min-h-[56px] overflow-hidden leading-relaxed"
                      />
                    )}
                  </div>
                </div>

              </div>

              {/* Select Photo Category dropdown selector aligned here at the head of Work Evidence proofs */}
              <div className="space-y-3 border-t border-slate-800 pt-6 font-sans mt-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 font-sans pb-3 border-b border-slate-800/45">
                  <div className="flex flex-wrap items-center gap-3 w-full justify-between">
                    <div className="relative" id="zone-selector-container">
                      <button
                        type="button"
                        onClick={() => setIsCategorySelectorOpen(!isCategorySelectorOpen)}
                        className="h-[38px] bg-slate-950/80 hover:bg-slate-900 text-white border-2 border-emerald-500 hover:border-emerald-400 font-sans font-extrabold text-[12px] rounded-xl px-3.5 flex items-center justify-between shadow-lg transition-all active:scale-98 cursor-pointer gap-2"
                      >
                        <span className="flex items-center gap-1.5 text-emerald-400">
                          📸 {selectedCategoryLabel 
                            ? t(selectedCategoryLabel.en, selectedCategoryLabel.bn, selectedCategoryLabel.ar)
                            : t("Select Photo Category", "ক্যাটাগরি সিলেক্ট করুন", "اختر تصنيف الصور")}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-emerald-400 transition-transform duration-250 ${isCategorySelectorOpen ? 'rotate-180': ''}`} />
                      </button>

                      {/* Dropdown Options List */}
                      {isCategorySelectorOpen && (
                        <div className="absolute left-0 mt-2 w-[280px] bg-slate-950 border border-slate-850 rounded-2xl shadow-2xl p-2 z-50 space-y-1 animate-fadeIn font-sans max-h-[320px] overflow-y-auto">
                          {AVAILABLE_ADDABLE_CATEGORIES.map((cat) => {
                            const isAlreadyActive = activeZones.some(z => z.id.toLowerCase() === cat.id.toLowerCase());
                            return (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => {
                                  // Add/load category zone
                                  const alreadyExists = activeZones.some(z => z.id.toLowerCase() === cat.id.toLowerCase());
                                  if (!alreadyExists) {
                                    setDynamicZones((prev) => {
                                      if (prev.some(z => z.id.toLowerCase() === cat.id.toLowerCase())) {
                                        return prev;
                                      }
                                      return [
                                        ...prev,
                                        {
                                          id: cat.id,
                                          labelEN: cat.labelEN,
                                          labelBN: cat.labelBN,
                                          labelAR: cat.labelAR,
                                          icon: cat.icon
                                        }
                                      ];
                                    });
                                  }
                                  setSelectedCategoryLabel({
                                    en: cat.labelEN,
                                    bn: cat.labelBN,
                                    ar: cat.labelAR
                                  });
                                  setIsCategorySelectorOpen(false);

                                  // Smooth scroll to the element
                                  setTimeout(() => {
                                    const el = document.getElementById(`zone-section-${cat.id}`);
                                    if (el) {
                                      el.scrollIntoView({ behavior: "smooth", block: "center" });
                                      el.classList.add("ring-2", "ring-emerald-500");
                                      setTimeout(() => {
                                        el.classList.remove("ring-2", "ring-emerald-500");
                                      }, 2050);
                                    }
                                  }, 200);
                                }}
                                className={`w-full text-left font-sans flex items-center justify-between p-2.5 rounded-xl text-[12px] font-semibold transition-all duration-150 cursor-pointer ${
                                  isAlreadyActive 
                                    ? 'bg-slate-900/60 text-slate-400 hover:text-white border-none shrink shadow-none outline-none' 
                                    : 'hover:bg-slate-900 text-white hover:text-[#10B981]'
                                }`}
                              >
                                <span className="flex items-center gap-2">
                                  <span className="text-base">{cat.icon}</span>
                                  <span>{language === "bn" ? cat.labelBN : (language === "ar" ? cat.labelAR : cat.labelEN)}</span>
                                </span>
                                {isAlreadyActive && (
                                  <span className="text-[10px] text-[#10B981] font-bold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-900/40">✓</span>
                                )}
                              </button>
                            );
                          })}
                          
                          {/* Option to create a totally custom name zone */}
                          <div
                            onClick={() => {
                              setIsCategorySelectorOpen(false);
                              const defaultName = language === "bn" ? "অফিস করিডর" : "Office Corridor";
                              setNewSlotInput(defaultName);
                              setSlotToCreate({ isOpen: true, defaultVal: defaultName });
                            }}
                            className="w-full text-left font-sans flex items-center gap-2 p-2.5 rounded-xl text-[12px] font-extrabold text-amber-500 hover:bg-slate-900 transition-all duration-150 cursor-pointer border-t border-slate-900 pt-3 mt-1"
                          >
                            <span>📍</span>
                            <span>{t("Add Custom Category...", "নতুন কাস্টম জোন যোগ করুন...", "إضافة منطقة مخصصة...")}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Photo count indicator */}
                    <span className="text-[10px] uppercase font-mono px-3 py-1 bg-slate-950/80 rounded border border-slate-800 text-emerald-400 font-bold h-[38px] flex items-center justify-center">
                      {t(`Total Attached: ${photosList.length}`, `মোট যুক্ত ছবি: ${photosList.length} টি`, `الصور المرفقة: ${photosList.length}`)}
                    </span>
                  </div>
                </div>

                <div className="space-y-8 pt-2">
                  {activeZones.length > 0 ? (
                    activeZones.map((zone) => {
                      // Filter photos matching this zone ID or name
                      const zonePhotos = photosList.filter((p) => {
                        const detectedZone = getPhotoZone(p);
                        return detectedZone.toLowerCase() === zone.id.toLowerCase();
                      });

                      return (
                        <div key={zone.id} id={`zone-section-${zone.id}`} className="space-y-3 pb-4 border-b border-slate-800/40 last:border-b-0 transition-all text-left">
                          {/* Zone Header: Title on left, actions on right */}
                          <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                            <div className="flex items-center gap-1.5 text-left flex-wrap">
                              <span className="text-[11px] font-black text-amber-500 font-sans tracking-wide uppercase px-2.5 py-0.5 bg-amber-950/20 border border-amber-900/35 rounded-lg flex items-center gap-1">
                                <span>{zone.icon || "📍"}</span>
                                <span>{language === "bn" ? zone.labelBN : (language === "ar" ? zone.labelAR : zone.labelEN)}</span>
                              </span>

                              {/* Custom Zone Title input */}
                              <input
                                type="text"
                                value={zoneCustomTitles[zone.id] || ""}
                                onChange={(e) => {
                                  const newVal = e.target.value;
                                  setZoneCustomTitles((prev) => ({
                                    ...prev,
                                    [zone.id]: newVal,
                                  }));
                                }}
                                placeholder={t("Edit zone display title...", "জোনের কাস্টম নাম লিখুন...", "تحديث اسم المنطقة...")}
                                className="bg-slate-950 border border-slate-850 hover:border-slate-800 text-slate-100 placeholder-slate-700 rounded-xl py-1 px-3 text-[11px] font-bold outline-none focus:border-emerald-500 transition-colors w-[150px] sm:w-[220px]"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              {/* Delete custom slot button */}
                              {!PRESET_ZONES.some(pz => pz.id === zone.id) && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    // Remove comments, custom titles, photos
                                    setZoneComments((prev) => {
                                      const next = { ...prev };
                                      delete next[zone.id];
                                      return next;
                                    });
                                    setZoneCustomTitles((prev) => {
                                      const next = { ...prev };
                                      delete next[zone.id];
                                      return next;
                                    });
                                    setPhotosList((prev) => prev.filter(p => getPhotoZone(p).toLowerCase() !== zone.id.toLowerCase()));
                                    setDynamicZones((prev) => prev.filter(dz => dz.id.toLowerCase() !== zone.id.toLowerCase()));
                                  }}
                                  className="text-rose-450 hover:text-rose-400 text-[10px] font-bold bg-rose-950/20 px-2 py-0.5 rounded border border-rose-900/30 transition-all cursor-pointer active:scale-95 font-sans"
                                >
                                  {t("Remove Slot", "বাদ দিন", "إزالة المنطقة")}
                                </button>
                              )}

                              {/* Zone photo count indicator */}
                              {zonePhotos.length > 0 && (
                                <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-900/30">
                                  {zonePhotos.length} {t("photos", "টি ছবি", "صور")}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* If Other Custom zone, show custom text input */}
                          {zone.id === "Other" && (
                            <div className="animate-fadeIn font-sans pt-1">
                              <input
                                type="text"
                                value={customLocationScope}
                                onChange={(e) => setCustomLocationScope(e.target.value)}
                                placeholder={t("✍️ Enter Custom Zone Name (e.g., Server Room)", "✍️ কাস্টম জোনের নাম লিখুন (যেমন: সার্ভার রুম, লবি ইত্যাদি)...", "✍️ اكتب اسم المنطقة المخصصة...")}
                                className="w-full bg-slate-950 border border-slate-850 text-slate-100 placeholder-slate-700 rounded-xl py-2 px-3 text-xs font-bold outline-none focus:border-emerald-500 transition-colors"
                              />
                            </div>
                          )}

                          {/* PHOTO GRID: Clean, borderless grid of square images matching drawing */}
                          {zonePhotos.length > 0 ? (
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 animate-fadeIn">
                              {zonePhotos.map((item, pIdx) => {
                                // Find index of this item in the master photosList to trigger remove
                                const masterIndex = photosList.findIndex((p) => p.url === item.url);

                                return (
                                  <div 
                                    key={pIdx} 
                                    className="aspect-square relative group/img bg-slate-955 rounded-xl overflow-hidden border border-slate-900 shadow-md transform active:scale-95 transition-all w-full"
                                  >
                                    <img 
                                      src={item.url} 
                                      alt={`${zone.id} proof ${pIdx + 1}`} 
                                      className="w-full h-full object-cover cursor-zoom-in hover:scale-105 transition-all duration-300"
                                      onClick={() => setActiveZoomPhoto({ url: item.url, caption: item.caption, source: "work", index: masterIndex, videoUrl: item.videoUrl })}
                                      referrerPolicy="no-referrer"
                                    />
                                    {item.videoUrl && (
                                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="w-8 h-8 rounded-full bg-slate-950/60 flex items-center justify-center text-rose-500 backdrop-blur-sm border border-slate-700">
                                          ▶
                                        </div>
                                      </div>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (masterIndex !== -1) {
                                          handleRemovePhoto(masterIndex, "work");
                                        }
                                      }}
                                      className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center text-[10px] font-bold shadow-md cursor-pointer transition-colors z-10 animate-fadeIn"
                                      title={t("Delete photo", "ছবি মুছুন", "حذف")}
                                    >
                                      ✕
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-[10px] text-slate-600 italic px-0.5 font-sans">
                              {t("No photos captured for this zone yet", "এই জোনের জন্য কোনো ছবি তোলা হয়নি", "لم يتم التقاط صور لهذه المنطقة")}
                            </div>
                          )}

                          {/* PHOTO ACTION TOOLS */}
                          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 pt-1 font-sans">
                            {/* Option 2: Live Cam (In-app stream with custom video recording option) */}
                            <button
                              type="button"
                              onClick={() => {
                                setActiveCaptureZone(zone.id);
                                setLiveCamType("work");
                                startLiveCamera("work");
                              }}
                              className="flex-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 active:scale-95 text-slate-300 hover:text-white font-extrabold text-[11px] h-9 rounded-xl outline-none transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              📹 {t("Live Cam", "ইন-অ্যাপ লাইভ", "كاميرا مباشر")}
                            </button>

                            {/* Option 3: Choose file */}
                            <div className="flex-1 relative">
                              <input
                                type="file"
                                accept="image/*,image/heic,image/heif"
                                multiple={true}
                                onChange={(e) => {
                                  const files = e.target.files;
                                  if (files && files.length > 0) {
                                    (Array.from(files) as File[]).forEach((file) => {
                                      handleAddNewPhoto(file, "work", zone.id);
                                    });
                                  }
                                }}
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-15"
                              />
                              <button
                                type="button"
                                className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-extrabold text-[11px] h-9 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                📁 {t("File", "ফাইল", "ملف")}
                              </button>
                            </div>

                            {/* Option 4: Next Slot */}
                            <button
                              type="button"
                              onClick={() => {
                                setIsCategorySelectorOpen(false);
                                const defaultName = language === "bn" ? "অফিস করিডর" : "Office Corridor";
                                setNewSlotInput(defaultName);
                                setSlotToCreate({ isOpen: true, defaultVal: defaultName });
                              }}
                              className="flex-1 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 active:scale-95 text-indigo-400 hover:text-indigo-300 h-9 text-[11px] font-black rounded-xl transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              ⏭️ {t("Next Slot", "নেক্সট লট", "الفتحة التالية")}
                            </button>
                          </div>

                          {/* TEXT BOX DIRECTLY BELOW PHOTOS/PLACEHOLDERS */}
                          <div className="pt-1.5 font-sans">
                            <textarea
                              rows={1}
                              value={zoneComments[zone.id] || ""}
                              onChange={(e) => {
                                setZoneComments((prev) => ({
                                  ...prev,
                                  [zone.id]: e.target.value,
                                }));
                                e.target.style.height = "auto";
                                e.target.style.height = `${e.target.scrollHeight}px`;
                              }}
                              placeholder={t(
                                `✍️ Write comments for ${language === "bn" ? zone.labelBN : (language === "ar" ? zone.labelAR : zone.labelEN)}...`,
                                `${language === "bn" ? zone.labelBN : (language === "ar" ? zone.labelAR : zone.labelEN)} জোনের জন্য মন্তব্য লিখুন...`,
                                `أدخل ملاحظاتك لـ ${language === "bn" ? zone.labelBN : (language === "ar" ? zone.labelAR : zone.labelEN)}...`
                              )}
                              className="w-full bg-[#1e293b] hover:bg-slate-900 focus:bg-slate-950 transition-all border border-slate-700 focus:border-emerald-500 text-white font-medium text-xs rounded-xl py-2.5 px-3 outline-none placeholder-slate-500 resize-none overflow-hidden min-h-[38px] active:scale-98"
                            />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center p-8 bg-slate-955/40 rounded-3xl border border-slate-800 font-sans">
                      <p className="text-sm text-slate-400 font-medium">{t("No active categories selected. Please add one above.", "কোনো সক্রিয় ক্যাটাগরি যুক্ত নেই, উপরে পছন্দের ক্যাটাগরি সিলেক্ট করুন।", "لا توجد تصنيفات نشطة مضافة، يرجى إضافة تصنيف من الأعلى.")}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* RECOMMENDATIONS EVIDENCE / CORRECTIVE ACTION PROOFS (perfectly borderless card grids) */}
              <div className="space-y-4 border-t border-slate-800 pt-6 font-sans">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800/40 font-sans">
                  <div className="text-left">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-350">
                      💡 {t("RECOMMENDATIONS EVIDENCE / ATTACHED PROOFS", "রিকমেন্ডেশন সংক্রান্ত প্রমাণাদি বা ছবি", "إثباتات التوصيات والإجراءات التصحيحية")}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-medium">
                      {t("Attach photos related to recommendations or target areas being treated", "রিকমেন্ডেশন বা চিকিৎসা করা হচ্ছে এমন জায়গা বা পদক্ষেপের ছবি যোগ করুন", "أرفق صوراً للمواقع المعالجة أو التوصيات")}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-3 py-1 bg-slate-950 rounded border border-slate-850 text-amber-500 font-bold h-[32px] flex items-center">
                    {t(`Attached: ${recommendationPhotosList.length}`, `যোগ করা হয়েছে: ${recommendationPhotosList.length} টি`, `المرفقة: ${recommendationPhotosList.length}`)}
                  </span>
                </div>

                {/* Grid layout of attached recommendation proof photographs */}
                {recommendationPhotosList.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 animate-fadeIn">
                    {recommendationPhotosList.map((item, idx) => (
                      <div 
                        key={idx} 
                        className="aspect-square relative group bg-slate-950 rounded-xl overflow-hidden border border-slate-900 shadow-md transform active:scale-95 transition-all w-full"
                      >
                        <img 
                          src={item.url} 
                          alt={`recommendation proof ${idx + 1}`} 
                          className="w-full h-full object-cover cursor-zoom-in hover:scale-105 transition-all duration-300"
                          onClick={() => setActiveZoomPhoto({ url: item.url, caption: item.caption, source: "rec", index: idx, videoUrl: item.videoUrl })}
                          referrerPolicy="no-referrer"
                        />
                        {item.videoUrl && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-8 h-8 rounded-full bg-slate-950/60 flex items-center justify-center text-rose-500 backdrop-blur-sm border border-slate-700">
                              ▶
                            </div>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx, "rec")}
                          className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center text-[10px] font-bold shadow-md cursor-pointer transition-colors z-10"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-600 italic px-0.5 font-sans text-left">
                    {t("No recommendation photos captured yet", "কোনো রিকমেন্ডেশন ছবি তোলা হয়নি", "لم يتم التقاط صور لتوصيات المعالجة")}
                  </div>
                )}

                {/* RECOMMENDATIONS CAPTURE TOOLS buttons block */}
                <div className="flex items-center gap-2 pt-1 font-sans">
                  {/* Option 1: Camera */}
                  <button
                    type="button"
                    onClick={() => {
                      setLiveCamType("rec");
                      startLiveCamera("rec");
                    }}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 px-3 py-2.5 text-[11px] font-black rounded-xl transition duration-150 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    📷 {t("Camera", "ক্যামেরা", "كاميرا")}
                  </button>

                  {/* Option 2: File */}
                  <div className="flex-1 relative">
                    <input
                      type="file"
                      accept="image/*,image/heic,image/heif"
                      multiple={true}
                      onChange={(e) => {
                        const files = e.target.files;
                        if (files && files.length > 0) {
                          (Array.from(files) as File[]).forEach((file) => {
                            handleAddNewPhoto(file, "rec");
                          });
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-15"
                    />
                    <button
                      type="button"
                      className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white px-3 py-2.5 text-[11px] font-black rounded-xl transition duration-150 flex items-center justify-center gap-1.5"
                    >
                      📁 {t("File", "ফাইল", "ملف")}
                    </button>
                  </div>

                  {/* Option 3: Next Slot */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsCategorySelectorOpen(false);
                      const defaultName = language === "bn" ? "অফিস করিডর" : "Office Corridor";
                      setNewSlotInput(defaultName);
                      setSlotToCreate({ isOpen: true, defaultVal: defaultName });
                    }}
                    className="flex-1 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 active:scale-95 text-indigo-400 hover:text-indigo-300 px-3 py-2.5 text-[11px] font-black rounded-xl transition duration-150 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    ⏭️ {t("Next Slot", "নেক্সট লট", "الفتحة التالية")}
                  </button>
                </div>
              </div>

              {/* SAVE & SUBMIT PRIMARY ACTIONS CTA CONTROL RAIL */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-800/60 font-sans">
                <button
                  type="button"
                  onClick={() => handleSaveReport(true)}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-98 text-slate-950 hover:text-slate-950 font-black text-xs sm:text-base h-16 rounded-2xl shadow-xl shadow-emerald-500/10 cursor-pointer transition-all uppercase flex items-center justify-center gap-2 text-white"
                >
                  🚀 {t("Save & Generate Live Preview", "রিপোর্ট সংরক্ষণ ও ডিরেক্ট প্রিভিউ", "حفظ وتوليد ومعاينة التقرير")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setActiveSegment("list");
                  }}
                  className="bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white px-5 h-16 rounded-2xl font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    {/* SEGMENT 3: REPORT PREVIEW PANEL */}
    {selectedReport && activeSegment === "preview" && (
      <div id="report-preview-panel" className="max-w-5xl mx-auto space-y-6 print:space-y-0 print:m-0 print:p-0 animate-fadeIn font-sans">
        {/* UPPER CONTROLLERS BLOCK */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl print:hidden">
          <div className="space-y-1 text-left">
            <span className="text-[10px] font-black tracking-widest text-[#10B981] uppercase font-mono bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/25 animate-pulse">
              {t("LIVE REPORT VIEW", "লাইভ রিপোর্ট ওভারভিউ", "معاينة حية للمستند")}
            </span>
            <h2 className="text-xl font-black text-white leading-tight">
              {selectedReport.clientName}
            </h2>
            <p className="text-xs text-slate-450 font-mono">
              ID: {selectedReport.reportNo} | {formatDateDisplay(selectedReport.date)}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 shrink-0">
            {onClosePreview ? (
              <button
                onClick={onClosePreview}
                className="bg-slate-950 hover:bg-slate-900 text-slate-300 hover:text-white px-4 py-2.5 rounded-xl text-xs font-extrabold border border-slate-800 transition cursor-pointer flex items-center gap-1.5 active:scale-95 leading-none"
              >
                ❌ {t("Close", "বন্ধ করুন", "إغلاق")}
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    if (editingReportId) {
                      setActiveSegment("create");
                    } else {
                      setActiveSegment("list");
                    }
                  }}
                  className="bg-slate-950 hover:bg-slate-900 text-slate-300 hover:text-white px-4 py-2.5 rounded-xl text-xs font-extrabold border border-slate-800 transition cursor-pointer flex items-center gap-1.5 active:scale-95 leading-none"
                >
                  ⬅️ {t("Back To Editor", "এডিটর-এ ফিরুন", "العودة للمحرر")}
                </button>
                <button
                  onClick={() => {
                    setActiveSegment("list");
                  }}
                  className="bg-slate-950 hover:bg-slate-900 text-slate-300 hover:text-white px-4 py-2.5 rounded-xl text-xs font-extrabold border border-slate-800 transition cursor-pointer flex items-center gap-1.5 active:scale-95 leading-none"
                >
                  📋 {t("All Reports", "রিপোর্ট তালিকা", "جميع التقارير")}
                </button>
              </>
            )}
            <button
              onClick={() => handleDownloadPDF(selectedReport)}
              className="bg-[#10B981] hover:bg-emerald-400 text-slate-950 px-4 py-2.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 active:scale-95 leading-none shadow-lg shadow-emerald-500/15"
            >
              📥 {t("Download PDF", "সরাসরি PDF ডাউনলোড", "تحميل بصيغة PDF")}
            </button>
            <button
              onClick={handlePrintTrigger}
              className="bg-indigo-600 hover:bg-[#1D4ED8] text-white px-4 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 active:scale-95 leading-none shadow-md"
            >
              🖨️ {t("Print / PDF Creator", "প্রিন্ট এবং পিডিএফ তৈরি", "طباعة / حفظ PDF")}
            </button>
          </div>
        </div>
        {/* PRINTABLE PAGES STAGE SHEET */}
        {(() => {
          const allReportPhotos = selectedReport.photos || [];
          let globalPicIdx = 0;

            return (
              <div id="printable-document-sheet" className="relative select-text w-full max-w-4xl mx-auto bg-white text-slate-900 shadow-2xl rounded-2xl border border-slate-200/80 p-8 sm:p-12 md:p-12 print:w-[210mm] print:rounded-none print:shadow-none print:border-0 print:p-0 flex flex-col mb-8 print:mb-0">
                
                {/* Red star watermark in the absolute background */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.06] select-none z-0">
                  <svg viewBox="0 0 100 100" className="w-[140mm] h-[140mm] object-contain">
                    <polygon points="50,5 64,36 98,36 71,57 81,91 50,70 19,91 29,57 2,36 36,36" fill="#ED1C24" />
                  </svg>
                </div>

                <div className="relative z-10 flex flex-col w-full h-full font-sans gap-6 print:gap-4">
                  {/* High-Fidelity STAR Combination Header */}
                  <div className="pb-3 flex flex-col items-center gap-1.5 font-sans w-full">
                    <div className="flex items-center gap-4 w-full">
                      <div className="shrink-0">
                        <svg viewBox="0 0 100 100" className="w-[52px] h-[52px] sm:w-[62px] sm:h-[62px]">
                          <polygon points="50,5 64,36 98,36 71,57 81,91 50,70 19,91 29,57 2,36 36,36" fill="#ED1C24" stroke="#000000" strokeWidth="4.5" />
                        </svg>
                      </div>
                      <div className="flex-1 flex flex-col justify-center select-text">
                        {/* Arabic text - starts nicely alignment */}
                        <div className="text-[18px] sm:text-[23px] font-extrabold text-black tracking-wide leading-tight text-left" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                          نجمة الوفاء لخدمات التنظيف والحراسة
                        </div>
                        {/* English text - inline combo */}
                        <div className="flex flex-wrap items-baseline gap-x-2 mt-0.5 leading-none">
                          <span className="text-[19px] sm:text-[24px] font-black text-black font-sans tracking-tight">
                            AL WAFA STAR
                          </span>
                          <span className="text-[11.5px] sm:text-[14px] font-bold text-black font-sans">
                            Cleaning & Security Services
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Precise double rule, extending edge-to-edge underneath */}
                    <div className="w-full mt-1.5 select-none">
                      <div className="h-[2px] bg-black w-full"></div>
                      <div className="h-[1.5px] bg-white w-full"></div>
                      <div className="h-[1.5px] bg-[#ED1C24] w-full"></div>
                    </div>
                  </div>

                  {/* Body Content Continuous Flow */}
                  <div className="flex flex-col gap-10">
                    {/* Part 1 Content */}
                    <div className="space-y-6 flex flex-col pr-1 w-full" style={{ breakInside: "avoid" }}>
                      {/* Centered underlined Title */}
                      <div className="text-center my-3 select-text">
                        <h2 className="text-[17px] sm:text-[19px] md:text-[21px] font-extrabold underline text-indigo-900 font-sans tracking-tight leading-normal">
                          {selectedReport.reportTitle}
                        </h2>
                      </div>
  
                      {/* Meta Fields Block */}
                      <div className="space-y-4 text-[13px] sm:text-[14px] md:text-[14.5px] leading-relaxed text-slate-800 font-sans pl-2 py-2 select-text">
                        <div className="flex flex-col sm:flex-row sm:items-start gap-1">
                          <span className="font-extrabold text-black uppercase w-32 shrink-0">
                            {t("FROM:", "প্রেরক (FROM):", "من:")}
                          </span>
                          <span className="font-semibold text-slate-800 flex-1">
                            {t("AL WAFA Star – Pest Control", "আল ওয়াফা স্টার – পেস্ট কন্ট্রোল", "نجمة الوفاء – مكافحة الحشرات")}
                          </span>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-start gap-1 pt-2 sm:pt-1">
                          <span className="font-extrabold text-black uppercase w-32 shrink-0">
                            {t("PREPARED BY:", "প্রস্তুতককারী (PREPARED BY):", "أعدت بواسطة:")}
                          </span>
                          <span className="font-extrabold text-slate-900 uppercase tracking-wide flex-1 text-[12.5px] sm:text-[13px]">
                            {t("ENGINEER", "ইঞ্জিনিয়ার", "المهندس/")} {selectedReport.engineerName.toUpperCase()}
                          </span>
                        </div>
  
                        <div className="flex flex-col sm:flex-row sm:items-start gap-1 pt-2 sm:pt-1">
                          <span className="font-extrabold text-black uppercase w-32 shrink-0">
                            {t("To:", "প্রাপক (To):", "إلى:")}
                          </span>
                          <span className="font-extrabold text-[#111827] uppercase tracking-tight flex-1">
                            {selectedReport.clientName.toUpperCase()}
                          </span>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-start gap-1 pt-2 sm:pt-1">
                          <span className="font-extrabold text-black uppercase w-32 shrink-0">
                            {t("STATE NAME:", "স্টেটের নাম (STATE NAME):", "الولاية:")}
                          </span>
                          <span className="font-extrabold text-[#111827] uppercase tracking-tight flex-1">
                            {selectedReport.emirate ? selectedReport.emirate.toUpperCase() : ""}
                          </span>
                        </div>
  
                        <div className="flex flex-col sm:flex-row sm:items-start gap-1 pt-2 sm:pt-1">
                          <span className="font-extrabold text-slate-900 uppercase w-32 shrink-0">
                            {t("Date of Visit:", "ভিজিটের তারিখ:", "تاريخ الزيارة:")}
                          </span>
                          <span className="font-semibold text-slate-800 flex-1">
                            {formatDateDisplay(selectedReport.date)}
                          </span>
                        </div>
  
                        <div className="flex flex-col sm:flex-row sm:items-start gap-1 pt-2 sm:pt-1">
                          <span className="font-extrabold text-slate-900 uppercase w-32 shrink-0">
                            {t("Location:", "পরিদর্শন স্থল (Location):", "الموقع:")}
                          </span>
                          <span className="font-semibold text-slate-800 leading-relaxed capitalize flex-1">
                            {selectedReport.visitLocation || t("Outdoor areas around all hospital buildings, Garden areas & Parking areas, All Rodent Bait Stations.", "হাসপাতালের বাইরের দিক, বাগান ও পার্কিং এরিয়া, সব রোডেন্ট টোপ স্টেশন সমূহ।", "المناطق الخارجية حول مباني المستشفى، ومناطق الحدائق والمواقف، وجميع محطات طعوم القوارض.")}
                          </span>
                        </div>
  
                        <div className="flex flex-col sm:flex-row sm:items-start gap-1 pt-2 sm:pt-1">
                          <span className="font-extrabold text-slate-900 uppercase w-32 shrink-0">
                            {t("Type of Visit:", "পরিদর্শনের ধরণ (Type of Visit):", "نوع الزيارة:")}
                          </span>
                          <span className="font-bold text-slate-800 capitalize flex-1">
                            {t(selectedReport.serviceType || "Routine Visit", selectedReport.serviceType || "রুটিন ভিজিট", selectedReport.serviceType || "زيارة روتينية")}
                          </span>
                        </div>
                      </div>
  
                      {/* Horizonal Line Divider */}
                      <div className="border-t-2 border-slate-300 my-4 opacity-90" />
  
                      {/* Purpose of visits section */}
                      {selectedReport.includePurposeInOutput !== false && (
                        <div className="space-y-4 pt-1">
                          <h3 className="font-serif italic text-indigo-700 font-extrabold text-sm sm:text-base tracking-wide flex items-center gap-1.5 pl-1">
                            {selectedReport.purposeOfVisitLabel ? `1. ${selectedReport.purposeOfVisitLabel}` : t("1. Purpose of visits", "১. পরিদর্শনের উদ্দেশ্য (Purpose of visits)", "١. الغرض من الزيارة")}
                          </h3>
                          <ul className="list-disc pl-6 space-y-4 text-[12px] sm:text-[13px] md:text-[13.5px] text-slate-800 font-bold leading-relaxed pr-2 select-text">
                            <li className="marker:text-indigo-600 pl-1 leading-relaxed">
                              <span className="font-black text-slate-950 uppercase">
                                {t(selectedReport.serviceType || "Routine Visit", selectedReport.serviceType || "রুটিন ভিজিট", selectedReport.serviceType || "زيارة روتينية")}:
                              </span>{" "}
                              <span className="font-medium text-slate-700 block mt-1">
                                <strong className="text-slate-900">{selectedReport.purposeOfVisitLabel || t("Purpose of visits", "পরিদর্শনের উদ্দেশ্য", "الغرض من الزيارات")}:</strong> {selectedReport.purposeOfVisitText || " - "}
                              </span>
                            </li>
                          </ul>
                        </div>
                      )}
  
                      {/* INSPECTION FINDINGS */}
                      {selectedReport.includeFindingsInOutput !== false && (
                        <div className="pt-2">
                          <span className="text-[10px] font-extrabold text-[#ED1C24] uppercase tracking-wider block mb-1">
                            🔍 {t("INSPECTION FINDINGS:", "পরিদর্শন পর্যবেক্ষণসমূহ:", "ملاحظات التفتيش:")}
                          </span>
                          <ul className="list-disc pl-5 space-y-1.5 text-[12.5px] text-slate-800 leading-relaxed font-bold">
                            {selectedReport.workDetails && selectedReport.workDetails.trim() ? (
                              selectedReport.workDetails
                                .split("\n\n")
                                .map((line, idx) => {
                                  if (!line.trim()) return null;
                                  return (
                                    <li key={idx} className="marker:text-[#ED1C24] whitespace-pre-wrap mb-1.5">
                                      {line.trim()}
                                    </li>
                                  );
                                })
                            ) : (
                              <li className="marker:text-[#ED1C24] text-slate-400 italic font-medium">
                                {t(
                                  "No specified inspection findings recorded.",
                                  "কোনো নির্দিষ্ট পরিদর্শন ফলাফল রেকর্ড করা হয়নি।",
                                  "لم يتم تسجيل أي ملاحظات محددة للفحص."
                                )}
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
  
                      {/* RECOMMENDATIONS */}
                      {selectedReport.includeRecommendationsInOutput !== false && selectedReport.recommendationText && selectedReport.recommendationText.trim() ? (
                        <div className="pt-2 border-t border-slate-100">
                          <span className="text-[10px] font-extrabold text-amber-500 uppercase tracking-wider block mb-1">
                            💡 {t("RECOMMENDATIONS:", "পরামর্শ ও নির্দেশনা সমূহ:", "التوصيات الفنية المقترحة:")}
                          </span>
                          <ul className="list-disc pl-5 space-y-1.5 text-[12.5px] text-slate-800 leading-relaxed font-bold">
                            {selectedReport.recommendationText
                              .split("\n\n")
                              .map((line, idx) => {
                                if (!line.trim()) return null;
                                return (
                                  <li key={idx} className="marker:text-amber-500 whitespace-pre-wrap mb-1.5">
                                    {line.trim()}
                                  </li>
                                );
                              })
                            }
                          </ul>
                        </div>
                      ) : null}
                    </div>

                    {/* Part 2 Content */}
                    <div className="space-y-6 flex flex-col pr-1 w-full">
                      <h3 className="text-[12.5px] font-black text-indigo-900 uppercase tracking-wider border-b border-slate-200 pb-1 flex items-center gap-2">
                         <span className="bg-indigo-900 text-white text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">2</span>
                         <span>{t("Inspection Findings & Field Logs:", "অনুসন্ধান এবং ফিল্ড রেজিস্টার পর্যবেক্ষণসমূহ:", "نتائج التفتيش والملاحظات الميدانية:")}</span>
                      </h3>
  
                      {/* Operational logs removed from here, moving to bottom if enabled */}

                      {/* TREATMENT CORRECTIVE RECOMMENDATIONS */}
                      {selectedReport.treatmentCorrectiveText && selectedReport.treatmentCorrectiveText.trim() && selectedReport.includeTreatmentCorrectiveInOutput !== false ? (
                        <div className="pt-2 border-t border-slate-100">
                          <span className="text-[10px] font-extrabold text-red-500 uppercase tracking-wider block mb-1">
                            🛠️ {t("TREATMENT CORRECTIVE RECOMMENDATIONS:", "সংশোধনমূলক সুপারিশ:", "التوصيات التصحيحية للمعالجة:")}
                          </span>
                          <ul className="list-disc pl-5 space-y-1.5 text-[12.5px] text-slate-800 leading-relaxed font-bold">
                            {selectedReport.treatmentCorrectiveText
                              .split("\n\n")
                              .map((line, idx) => {
                                if (!line.trim()) return null;
                                return (
                                  <li key={idx} className="marker:text-red-500 whitespace-pre-wrap mb-1.5">
                                    {line.trim()}
                                  </li>
                                );
                              })
                            }
                          </ul>
                        </div>
                      ) : null}
  
                      {/* Area-Specific Special Observations */}
                      {selectedReport.zoneComments && Object.entries(selectedReport.zoneComments).some(([_, val]) => typeof val === "string" && (val as string).trim()) && (
                        <div className="space-y-2 border-t border-slate-100 pt-2.5">
                          <p className="text-[10px] font-extrabold text-[#ED1C24] uppercase tracking-wider">
                            📍 {t("Area-Specific Special Observations:", "জোন ভিত্তিক বিশেষ পর্যবেক্ষণসমূহ:", "ملاحظات تشخيصية محددة للمناطق:")}
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-[11px] font-sans">
                            {Object.entries(selectedReport.zoneComments).map(([zoneId, comment]) => {
                              if (!comment || typeof comment !== "string" || !(comment as string).trim()) return null;
                              const commentStr = comment as string;
                              const z = reportZones.find(x => x.id.toLowerCase() === zoneId.toLowerCase());
                              
                              const categoryName = z 
                                ? (language === "bn" ? z.labelBN : (language === "ar" ? z.labelAR : z.labelEN))
                                : zoneId.toUpperCase();
                                
                              const categoryIcon = z ? z.icon : "📍";
  
                              return (
                                <div key={zoneId} className="p-2 border border-slate-200 bg-slate-50/50 rounded-xl leading-relaxed select-text flex flex-col justify-between" style={{ breakInside: "avoid" }}>
                                  <div className="mb-1.5 flex flex-wrap items-center gap-1.5 text-left">
                                    <span className="text-[9px] font-black text-indigo-900 uppercase tracking-wide inline-flex items-center gap-1 bg-indigo-50/50 px-1.5 py-0.5 rounded border border-indigo-100">
                                      {categoryIcon} {categoryName}
                                    </span>
                                  </div>
                                  <span className="text-slate-700 font-bold italic block">
                                    "{commentStr}"
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
  
                      {/* Moved OPERATIONAL LOG ENTRY to the very bottom */}
                      {selectedReport.includeOperationalLogInOutput && selectedReport.operationalLogs && selectedReport.operationalLogs.trim() && (
                        <div className="p-4 mt-6 bg-slate-50 border border-slate-200 rounded-xl space-y-1 w-full" style={{ breakInside: "avoid" }}>
                           <span className="text-[9px] font-black font-mono text-slate-400 uppercase tracking-widest block">OPERATIONAL LOG ENTRY:</span>
                           <p className="text-[12.5px] text-slate-800 font-semibold whitespace-pre-wrap leading-relaxed select-text">
                              {selectedReport.operationalLogs}
                           </p>
                        </div>
                      )}


                    </div>

                    {/* Zone Photos Dynamic Flow */}
                    {(() => {
                       const zonesWithPhotos = reportZones.filter(zone => 
                         allReportPhotos.some(photo => getPhotoZone(photo).toLowerCase() === zone.id.toLowerCase())
                       );
                       return zonesWithPhotos.map((zone, zoneIdx) => {
                       const zonePhotos = allReportPhotos.filter(photo => 
                         getPhotoZone(photo).toLowerCase() === zone.id.toLowerCase()
                       );
                       const zoneName = language === "bn" ? zone.labelBN : (language === "ar" ? zone.labelAR : zone.labelEN);
                       
                       return (
                         <div key={zone.id} className="space-y-4 flex flex-col text-left font-sans">
                           <div className="space-y-1.5 shrink-0 text-left">
                             <h3 className="text-[12.5px] font-black text-indigo-900 uppercase tracking-wider border-b border-slate-200 pb-1 flex items-center gap-2 font-sans">
                                <span className="bg-indigo-900 text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-bold">4.{zoneIdx + 1}</span>
                                <span className="flex items-center gap-1">
                                  <span>{zone.icon || "📍"}</span>
                                  <span>
                                    {language === "bn" 
                                      ? `${zoneName} কাজের ছবিসমূহ:` 
                                      : language === "ar"
                                      ? `صور إثبات العمل في ${zoneName}:`
                                      : `${zoneName.toUpperCase()} WORK EVIDENCE PHOTOS:`
                                    }
                                  </span>
                                </span>
                             </h3>
                             {selectedReport?.photoEvidenceCustomTitle && selectedReport.photoEvidenceCustomTitle.trim() !== "" && (
                               <div className="text-[10.5px] font-black text-slate-700 uppercase font-sans tracking-wide leading-normal bg-slate-100/80 py-0.5 px-2 rounded border border-slate-200 inline-block">
                                 ✍️ {selectedReport.photoEvidenceCustomTitle.trim()}
                               </div>
                             )}
                           </div>
                           <div className="grid grid-cols-2 gap-2">
                              {zonePhotos.map((item, idx) => (
                                <div 
                                  key={idx} 
                                  className="flex flex-col justify-between select-none cursor-pointer group"
                                  onClick={() => setActiveZoomPhoto({ url: item.url, caption: item.caption || `Field zone proof`, videoUrl: item.videoUrl })}
                                  style={{ breakInside: "avoid" }}
                                >
                                   <div className="aspect-[4/3] w-full bg-slate-100 rounded-lg overflow-hidden relative shadow-sm border border-slate-300">
                                      <img 
                                        src={item.url} 
                                        alt="Evidence Proof" 
                                        className="w-full h-full object-cover transition"
                                        referrerPolicy="no-referrer"
                                      />
                                      {item.videoUrl && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                          <div className="w-8 h-8 rounded-full bg-slate-950/60 flex items-center justify-center text-rose-500 backdrop-blur-sm border border-slate-300">
                                            ▶
                                          </div>
                                        </div>
                                      )}
                                      <span className="absolute bottom-2 right-2 bg-black/75 text-white font-mono text-[9px] px-1.5 py-0.5 rounded font-black tracking-wider">
                                        PIC {++globalPicIdx}
                                      </span>
                                   </div>
                                </div>
                              ))}
                           </div>
                         </div>
                       );
                    })})()}

                    {/* Recommendation Photos Dynamic Flow */}
                    {(() => {
                       const recPhotos = selectedReport.recommendationPhotos || [];
                       if (recPhotos.length === 0) return null;
                       return (
                      <div className="space-y-4 flex flex-col text-left font-sans">
                        <h3 className="text-[12.5px] font-black text-amber-800 uppercase tracking-wider border-b border-amber-250 pb-1 flex items-center gap-2 font-sans">
                           <span className="bg-amber-800 text-white text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">5.1</span>
                           <span>{t(`Recommended Action Images:`, `রিকমেন্ডেশন এবং সংশোধন রেফারেন্স ছবিসমূহ:`, `صور الإجراءات الوقائية الموصى بها:`)}</span>
                        </h3>
                        {/* Photos grid */}
                        <div className="grid grid-cols-2 gap-2">
                           {recPhotos.map((item, idx) => (
                              <div 
                                key={idx} 
                                className="flex flex-col justify-between select-none cursor-pointer group"
                                onClick={() => setActiveZoomPhoto({ url: item.url, caption: item.caption || `Recommendation proof`, videoUrl: item.videoUrl })}
                                style={{ breakInside: "avoid" }}
                              >
                                 <div className="aspect-[4/3] w-full bg-slate-100 rounded-lg overflow-hidden relative shadow-sm border border-slate-300">
                                    <img 
                                      src={item.url} 
                                      alt="Recommendation Proof" 
                                      className="w-full h-full object-cover transition"
                                      referrerPolicy="no-referrer"
                                    />
                                    {item.videoUrl && (
                                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="w-8 h-8 rounded-full bg-slate-950/60 flex items-center justify-center text-rose-500 backdrop-blur-sm border border-slate-300">
                                          ▶
                                        </div>
                                      </div>
                                    )}
                                    <span className="absolute bottom-2 right-2 bg-amber-950/85 text-white font-mono text-[9px] px-1.5 py-0.5 rounded font-black tracking-wider">
                                      REC {idx + 1}
                                    </span>
                                 </div>
                              </div>
                           ))}
                        </div>
                      </div>
                    )})()}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Lightbox Zoomed Photo Modal & Smart Image Painter Editor */}
      {activeZoomPhoto && (
        <div 
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 sm:p-6 animate-fadeIn select-none print:hidden"
          onClick={() => setActiveZoomPhoto(null)}
        >
          {/* Top header navigation row: Title and Close button */}
          <div className="absolute top-4 left-6 right-6 flex items-center justify-between z-10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-xs sm:text-sm font-black text-slate-200 uppercase tracking-widest font-mono">
                {activeZoomPhoto.source 
                  ? t("🔍 Smart Interactive Image Editor (Direct Report Sync)", "🔍 স্মার্ট ইমেজ এডিটর ও পরিবর্ধন (সরাসরি রিপোর্ট সিঙ্ক)", "🔍 محرر الملاحظات الذكي للصور")
                  : t("🔍 Inspection Image Viewer", "🔍 পরিদর্শন ইমেজ ভিউয়ার", "🔍 عارض صور التفتيش")
                }
              </h3>
            </div>
            
            <button 
              type="button"
              onClick={() => setActiveZoomPhoto(null)}
              className="text-slate-300 hover:text-white bg-slate-900/90 hover:bg-slate-800 px-4 py-2 rounded-xl border border-slate-800 transition shadow-xl cursor-pointer text-xs font-bold leading-none"
            >
              ✕ {language === "bn" ? "বন্ধ করুন" : "Close"}
            </button>
          </div>

          {/* MAIN COLUMN WORKSPACE CONTAINER */}
          <div 
            className="flex flex-row items-start justify-center gap-4 sm:gap-6 w-full max-w-6xl mt-14 mb-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 1. COMPACT DRAWING FLOATING TOOLBAR ON THE LEFT SIDE OF CANVAS */}
            {!activeZoomPhoto.videoUrl && activeZoomPhoto.source && (
              <div className="flex flex-col bg-slate-900/95 border border-slate-800/80 rounded-2xl p-1.5 gap-1.5 shadow-2xl items-center justify-center shrink-0 w-11 sm:w-12 border-l-4 border-l-emerald-500 animate-fadeIn select-none">
                {/* TOOL: FREEDRAW PEN */}
                <button
                  type="button"
                  title={t("Pen Tool", "কলম টুল", "قلم التلوين")}
                  onClick={() => setActiveTool("pen")}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                    activeTool === "pen" 
                      ? "bg-emerald-500 text-slate-950 font-bold scale-105 shadow-md shadow-emerald-500/20" 
                      : "text-slate-400 hover:text-white hover:bg-slate-850"
                  }`}
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                {/* TOOL: RECTANGLE */}
                <button
                  type="button"
                  title={t("Rectangle Shape", "চারকোণা আকৃতি", "مستطيل")}
                  onClick={() => setActiveTool("rect")}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                    activeTool === "rect" 
                      ? "bg-emerald-500 text-slate-950 font-bold scale-105 shadow-md shadow-emerald-500/20" 
                      : "text-slate-400 hover:text-white hover:bg-slate-850"
                  }`}
                >
                  <span className="text-sm font-black leading-none">▢</span>
                </button>

                {/* TOOL: CIRCLE */}
                <button
                  type="button"
                  title={t("Circle Shape", "বৃত্তাকার আকৃতি", "دائرة")}
                  onClick={() => setActiveTool("circle")}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                    activeTool === "circle" 
                      ? "bg-emerald-500 text-slate-950 font-bold scale-105 shadow-md shadow-emerald-500/20" 
                      : "text-slate-400 hover:text-white hover:bg-slate-850"
                  }`}
                >
                  <span className="text-base font-bold leading-none">○</span>
                </button>

                {/* TOOL: ARROW */}
                <button
                  type="button"
                  title={t("Arrow Director", "দিকনির্দেশক তীর", "توجيه بسهم")}
                  onClick={() => setActiveTool("arrow")}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                    activeTool === "arrow" 
                      ? "bg-emerald-500 text-slate-950 font-bold scale-105 shadow-md shadow-emerald-500/20" 
                      : "text-slate-400 hover:text-white hover:bg-slate-850"
                  }`}
                >
                  <span className="text-sm font-bold leading-none">➔</span>
                </button>

                {/* TOOL: TEXT ANNOTATOR */}
                <button
                  type="button"
                  title={t("Text Annotator", "লেখা যুক্তকরণ", "إضافة نص")}
                  onClick={() => {
                    setActiveTool("text");
                    if (!activeTextToDraw) {
                      setActiveTextToDraw(language === "bn" ? "সমস্যা" : "Defect");
                    }
                  }}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                    activeTool === "text" 
                      ? "bg-emerald-500 text-slate-950 font-bold scale-105 shadow-md shadow-emerald-500/20" 
                      : "text-slate-400 hover:text-white hover:bg-slate-850"
                  }`}
                >
                  <span className="text-sm font-black leading-none font-sans">A</span>
                </button>

                {/* TOOL: QUICK STAMPS */}
                <button
                  type="button"
                  title={t("Quick Stamps", "দ্রুত স্ট্যাম্পিং", "طوابع سريعة")}
                  onClick={() => setActiveTool("stamp")}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                    activeTool === "stamp" 
                      ? "bg-emerald-500 text-slate-950 font-bold scale-105 shadow-md shadow-emerald-500/20" 
                      : "text-slate-400 hover:text-white hover:bg-slate-850"
                  }`}
                >
                  <span className="text-xs font-bold leading-none">💮</span>
                </button>

                {/* TOOL: ERASER */}
                <button
                  type="button"
                  title={t("Eraser / Correction Tape", "ইরেজার / সংশোধন ব্রাশ", "ممحاة")}
                  onClick={() => setActiveTool("eraser")}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                    activeTool === "eraser" 
                      ? "bg-emerald-500 text-slate-950 font-bold scale-105 shadow-md shadow-emerald-500/20" 
                      : "text-slate-400 hover:text-white hover:bg-slate-850"
                  }`}
                >
                  <span className="text-xs font-bold leading-none">🧽</span>
                </button>

                <div className="h-px w-6 bg-slate-800 my-1" />

                {/* ROTATE 90° CLOCKWISE */}
                <button
                  type="button"
                  title={t("Rotate Picture 90° Clockwise", "ছবি ৯০ ডিগ্রি ঘোরান", "تدوير الصورة")}
                  onClick={handleRotateImage}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-amber-400 hover:text-amber-300 hover:bg-slate-850 cursor-pointer transition-colors"
                >
                  <span className="text-xs font-black">🔄</span>
                </button>

                {/* UNDO BUTTON */}
                <button
                  type="button"
                  title={t("Undo Last Drawing (↩)", "আগের ধাপে ফিরুন (↩)", "تراجع")}
                  onClick={() => {
                    if (drawingHistory.length > 0) {
                      const last = drawingHistory[drawingHistory.length - 1];
                      setRedoHistory((prev) => [...prev, last]);
                      setDrawingHistory((prev) => prev.slice(0, -1));
                    }
                  }}
                  disabled={drawingHistory.length === 0}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-850 disabled:opacity-20 cursor-pointer transition-colors"
                >
                  <span className="text-sm font-bold leading-none">↩</span>
                </button>

                {/* REDO BUTTON */}
                <button
                  type="button"
                  title={t("Redo Drawing (↪)", "পরের ধাপে যান (↪)", "إعادة تطبيق")}
                  onClick={() => {
                    if (redoHistory.length > 0) {
                      const next = redoHistory[redoHistory.length - 1];
                      setDrawingHistory((prev) => [...prev, next]);
                      setRedoHistory((prev) => prev.slice(0, -1));
                    }
                  }}
                  disabled={redoHistory.length === 0}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-850 disabled:opacity-20 cursor-pointer transition-colors"
                >
                  <span className="text-sm font-bold leading-none">↪</span>
                </button>

                {/* RESET/CLEAR CANVAS BUTTON */}
                <div className="relative">
                  <button
                    type="button"
                    title={t("Reset Canvas", "সব মুছুন", "مسح الكل")}
                    onClick={() => {
                      setShowClearCanvasConfirm((prev) => !prev);
                    }}
                    disabled={drawingHistory.length === 0}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
                      showClearCanvasConfirm
                        ? "bg-rose-600 text-white animate-pulse"
                        : "text-rose-450 hover:text-rose-400 hover:bg-rose-500/10 disabled:opacity-20"
                    }`}
                  >
                    <span className="text-sm font-bold">🗑️</span>
                  </button>
                  
                  {showClearCanvasConfirm && (
                    <div className="absolute top-10 left-0 bg-slate-950 border border-rose-500/40 p-2.5 rounded-xl flex flex-col gap-2 z-50 shadow-2xl w-44 font-sans no-print">
                      <span className="text-[10px] font-bold text-slate-300">
                        {language === "bn" ? "সব ড্রয়িং মুছবেন কি?" : "Reset all drawings?"}
                      </span>
                      <div className="flex gap-1.5 justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setDrawingHistory([]);
                            setRedoHistory([]);
                            setShowClearCanvasConfirm(false);
                          }}
                          className="px-2 py-1 bg-rose-500 hover:bg-rose-600 font-bold rounded-lg text-[9.5px] uppercase font-mono text-white cursor-pointer"
                        >
                          {language === "bn" ? "হাঁ মুছুন" : "Reset"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowClearCanvasConfirm(false)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-705 font-bold rounded-lg text-[9.5px] uppercase font-mono text-slate-350 cursor-pointer"
                        >
                          {language === "bn" ? "বাতিল" : "Cancel"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. CHOSEN WORKING INTERACTIVE RESIZABLE CANVAS CONTAINER */}
            <div className="relative flex flex-col items-center justify-center bg-slate-900 border border-slate-800 p-3 sm:p-4 rounded-3xl shadow-2xl max-w-full">
              {activeZoomPhoto.videoUrl ? (
                <div className="overflow-hidden rounded-2xl relative flex items-center justify-center bg-black border border-slate-800 shadow-xl max-w-full w-full">
                  <video 
                    src={activeZoomPhoto.videoUrl} 
                    controls 
                    autoPlay 
                    className="max-w-full max-h-[70vh] rounded-2xl" 
                  />
                </div>
              ) : (
                <>
                  {/* Image preloader for rendering */}
                  {!isBgLoaded && (
                    <div className="flex flex-col items-center justify-center h-72 w-96 text-slate-500 font-bold space-y-2 font-mono">
                      <span className="w-10 h-10 border-4 border-slate-850 border-t-emerald-500 rounded-full animate-spin" />
                      <span className="text-xs uppercase">{t("Preparing Editor canvas...", "ক্যানভাস লোড হচ্ছে...", "جاري تحميل محرر الصور...")}</span>
                    </div>
                  )}

                  {/* Touch Responsive Canvas */}
                  <div 
                    className={`overflow-hidden rounded-2xl relative flex items-center justify-center bg-slate-950/80 ${isBgLoaded ? "block" : "hidden"}`}
                    style={{ width: canvasSize.width, height: canvasSize.height }}
                  >
                    <canvas
                      ref={canvasRef}
                      width={canvasSize.width}
                      height={canvasSize.height}
                      onMouseDown={handlePointerDown}
                      onMouseMove={handlePointerMove}
                      onMouseUp={handlePointerUp}
                      onMouseLeave={handlePointerUp}
                      onTouchStart={handlePointerDown}
                      onTouchMove={handlePointerMove}
                      onTouchEnd={handlePointerUp}
                      className={`w-full h-full ${activeZoomPhoto.source ? "cursor-crosshair" : "cursor-default"}`}
                    />
                  </div>
                </>
              )}

              {/* EDITOR PROPERTY PRESETS DIALOG DIRECTLY BELOW CANVAS */}
              {!activeZoomPhoto.videoUrl && activeZoomPhoto.source && isBgLoaded && (
                <div className="w-full flex flex-col gap-3 mt-3.5 pt-3 border-t border-slate-850 animate-fadeIn">
                  
                  {/* DYNAMIC TEXT BAR / STAMP SELECTION PORTAL */}
                  <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
                    {/* If selected Text tool "A" */}
                    {activeTool === "text" && (
                      <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800 w-full animate-fadeIn">
                        <span className="text-emerald-500 font-extrabold text-[10px] uppercase font-mono tracking-wider shrink-0 flex items-center gap-1">
                          <span>✍️</span> {t("TEXT BAR:", "টেক্সট বার:", "سطر النص:")}
                        </span>
                        <input
                          type="text"
                          value={activeTextToDraw}
                          onChange={(e) => setActiveTextToDraw(e.target.value)}
                          placeholder={t("Type custom text here to stamp on photo...", "ছবিতে অঙ্কন করার জন্য এখানে টেক্সট লিখুন...", "اكتب التسمية أو الملحوظة هنا...")}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-bold focus:outline-none focus:border-emerald-500 placeholder:text-slate-600 placeholder:font-normal"
                        />
                      </div>
                    )}

                    {/* If selected Stamp tool */}
                    {activeTool === "stamp" && (
                      <div className="flex items-center gap-2 bg-slate-950 p-1.5 py-2 rounded-xl border border-slate-800 w-full justify-between animate-fadeIn">
                        <span className="text-amber-500 font-extrabold text-[10px] uppercase font-mono tracking-wider shrink-0 flex items-center gap-1 pl-1.5">
                          <span>💮</span> {t("CHOOSE STAMP:", "স্ট্যাম্প নির্বাচন:", "اختر الختم:")}
                        </span>
                        <div className="flex items-center gap-2 pr-2">
                          {[
                            { emoji: "✔️", label: t("PASS / OK", "ঠিক আছে", "مقبول") },
                            { emoji: "❌", label: t("DEFECT / FAIL", "সমস্যা / ত্রুটি", "خلل") },
                            { emoji: "⚠️", label: t("WARNING", "সতর্কতা", "تحذير") },
                            { emoji: "🔧", label: t("MAINTAINED", "সমাধানকৃত", "تم الإصلاح") },
                            { emoji: "💡", label: t("RECOMMENDATION", "পরামর্শ", "ملحوظة هام") }
                          ].map((st) => (
                            <button
                              key={st.emoji}
                              type="button"
                              onClick={() => setActiveStamp(st.emoji)}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all cursor-pointer ${
                                activeStamp === st.emoji 
                                  ? "bg-amber-500/20 border-2 border-amber-500 scale-110 shadow-lg" 
                                  : "border border-slate-805 hover:border-slate-600 hover:bg-slate-900"
                              }`}
                              title={st.label}
                            >
                              {st.emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* LOWER COLOR & SIZE PALETTE WITH ACTIONS */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/40 p-2 rounded-2xl border border-slate-850/60 w-full">
                    {/* COLOR SQUARES PALETTE SELECTOR */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-black tracking-wider text-slate-500 font-mono flex-shrink-0">
                        🎨 {t("Color:", "রং:", "اللون:")}
                      </span>
                      <div className="flex items-center gap-1.5 bg-slate-950 p-1 px-1.5 rounded-xl border border-slate-850">
                        {[
                          { hex: "#EF4444", label: "Red" },
                          { hex: "#10B981", label: "Green" },
                          { hex: "#3B82F6", label: "Blue" },
                          { hex: "#F59E0B", label: "Yellow" },
                          { hex: "#FFFFFF", label: "White" },
                          { hex: "#000000", label: "Black" }
                        ].map((col) => (
                          <button
                            key={col.hex}
                            type="button"
                            onClick={() => setActiveColor(col.hex)}
                            className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg transition-transform border ${
                              activeColor === col.hex 
                                ? "scale-110 border-white shadow-xl" 
                                : "border-transparent opacity-85 hover:opacity-105"
                            }`}
                            style={{ backgroundColor: col.hex }}
                            title={col.label}
                          />
                        ))}
                      </div>
                    </div>

                    {/* BRUSH LINE WIDTH TOGGLES */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-black tracking-wider text-slate-500 font-mono flex-shrink-0">
                        ✏️ {t("Size:", "সাইজ:", "الحجم:")}
                      </span>
                      <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-850 text-[10px] font-bold">
                        {[
                          { size: 2, label: t("Thin", "চিকন", "رقيق") },
                          { size: 4, label: t("Medium", "মাঝারি", "متوسط") },
                          { size: 8, label: t("Thick", "মোটা", "سميك") }
                        ].map((wItem) => (
                          <button
                            key={wItem.size}
                            type="button"
                            onClick={() => {
                              setActiveWidth(wItem.size);
                              setActiveFontSize(wItem.size * 4 + 10);
                            }}
                            className={`px-2.5 py-1 rounded-lg transition ${
                              activeWidth === wItem.size 
                                ? "bg-slate-850 text-emerald-400 border border-slate-700" 
                                : "text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            {wItem.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* SAVE & CLOSE COMMAND BUTTON */}
                    <button
                      type="button"
                      onClick={handleSaveAnnotatedPhoto}
                      className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-black px-5 py-2 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-xs uppercase cursor-pointer"
                    >
                      <span>✔️</span>
                      <span>{t("Apply & Sync Photo", "রিপোর্টে সংরক্ষণ করুন", "حفظ وتعديل التقرير")}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CAPTION VIEW OR EXTRA MANUAL EXPLANATION ACCENTS */}
          {activeZoomPhoto.caption && (
            <div 
              className="mt-2 max-w-2xl text-center bg-slate-900/90 border border-slate-800/80 px-6 py-2.5 rounded-2xl text-xs sm:text-xs font-bold text-slate-350 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              📝 <span className="text-emerald-400">{language === "bn" ? "বিবরণ:" : "Caption:"}</span> {activeZoomPhoto.caption}
            </div>
          )}
        </div>
      )}

      {/* Premium custom Slot Creation Modal Overlay */}
      {slotToCreate?.isOpen && (
        <div 
          className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 animate-fadeIn select-none print:hidden"
          onClick={() => setSlotToCreate(null)}
        >
          <div 
            className="w-full max-w-sm bg-[#0F172A] border border-slate-800 rounded-2xl shadow-2xl p-5 space-y-4 relative animate-fadeIn font-sans text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-850">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <h4 className="text-xs sm:text-sm font-extrabold text-slate-200 uppercase tracking-wider">
                  📍 {t("Create New Slot", "নতুন স্লট তৈরি করুন", "إضافة منطقة جديدة")}
                </h4>
              </div>
              <button 
                type="button" 
                onClick={() => setSlotToCreate(null)}
                className="text-slate-400 hover:text-white transition cursor-pointer font-sans"
              >
                ✕
              </button>
            </div>

            {/* Input label & Info */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[10px] uppercase font-mono text-slate-400 tracking-wider font-extrabold flex items-center justify-between">
                <span>{t("Select predefined or enter custom name:", "পূর্বনির্ধারিত বা কাস্টম নাম লিখুন:", "حدد اسمًا معرفًا مسبقًا أو أدخل اسمًا مخصصًا:")}</span>
              </label>
              
              <div className="relative">
                <select
                  className="w-full bg-slate-900 border border-slate-700 hover:border-slate-600 focus:border-[#F59E0B] rounded-xl px-3 py-2.5 text-xs text-slate-200 font-bold outline-none transition-colors duration-150 appearance-none mb-2"
                  onChange={(e) => {
                    if (e.target.value) {
                      setNewSlotInput(e.target.value);
                    }
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>{t("-- Select Predefined Zone --", "-- প্রিডিফাইন্ড জোন নির্বাচন করুন --", "-- اختر منطقة محددة مسبقا --")}</option>
                  {AVAILABLE_ADDABLE_CATEGORIES.map(cat => (
                    <option key={cat.id} value={t(cat.labelEN, cat.labelBN, cat.labelAR)}>
                      {t(cat.labelEN, cat.labelBN, cat.labelAR)}
                    </option>
                  ))}
                  <option value={t("Reception Area", "রিসেপশন এরিয়া", "منطقة الاستقبال")}>{t("Reception Area", "রিসেপশন এরিয়া", "منطقة الاستقبال")}</option>
                  <option value={t("Meeting Room", "মিটিং রুম", "غرفة الاجتماعات")}>{t("Meeting Room", "মিটিং রুম", "غرفة الاجتماعات")}</option>
                  <option value={t("Cafeteria", "ক্যাফেটেরিয়া", "كافتيريا")}>{t("Cafeteria", "ক্যাফেটেরিয়া", "كافتيريا")}</option>
                  <option value={t("Basement Parking", "বেসমেন্ট পার্কিং", "مواقف سيارات في القبو")}>{t("Basement Parking", "বেসমেন্ট পার্কিং", "مواقف سيارات في القبو")}</option>
                  <option value={t("Electrical & Pump Room", "ইলেকট্রিক্যাল ও পাম্প রুম", "غرفة الكهرباء والمضخات")}>{t("Electrical & Pump Room", "ইলেকট্রিক্যাল ও পাম্প রুম", "غرفة الكهرباء والمضخات")}</option>
                  <option value={t("Server & IT Room", "সার্ভার ও আইটি রুম", "غرفة الخوادم وتكنولوجيا المعلومات")}>{t("Server & IT Room", "সার্ভার ও আইটি রুম", "غرفة الخوادم وتكنولوجيا المعلومات")}</option>
                  <option value={t("Storage Facility", "স্টোরেজ সুবিধা", "مرفق التخزين")}>{t("Storage Facility", "স্টোরেজ সুবিধা", "مرفق التخزين")}</option>
                  <option value={t("Exterior Perimeter / Boundary", "বহিঃসীমানা ও বাউন্ডারি", "المحيط الخارجي / الحدود")}>{t("Exterior Perimeter / Boundary", "বহিঃসীমানা ও বাউন্ডারি", "المحيط الخارجي / الحدود")}</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 mb-2">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>

              <input
                type="text"
                autoFocus
                className="w-full bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-[#F59E0B] rounded-xl px-3 py-2.5 text-xs text-slate-100 font-bold outline-none placeholder-slate-700 transition-colors duration-150"
                value={newSlotInput}
                onChange={(e) => setNewSlotInput(e.target.value)}
                placeholder={slotToCreate.defaultVal}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    document.getElementById("btn-save-custom-slot")?.click();
                  }
                }}
              />
            </div>

            {/* Actions Panel */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSlotToCreate(null)}
                className="bg-slate-950 hover:bg-slate-850 text-slate-300 font-bold text-xs px-4 py-2 rounded-xl transition duration-150 cursor-pointer border border-slate-850"
              >
                {t("Cancel", "বাতিল", "إلغاء")}
              </button>
              <button
                id="btn-save-custom-slot"
                type="button"
                onClick={() => {
                  const trimmed = newSlotInput.trim() || slotToCreate.defaultVal;
                  if (trimmed) {
                    const cleanString = (str: string) => str.toLowerCase().replace(/[^a-zA-Z0-9\u0980-\u09FF]/g, "");
                    const cleanTrimmed = cleanString(trimmed);
                    
                    const matchedCat = AVAILABLE_ADDABLE_CATEGORIES.find((cat) => {
                      return cleanString(cat.id) === cleanTrimmed ||
                             cleanString(cat.labelEN) === cleanTrimmed ||
                             cleanString(cat.labelBN) === cleanTrimmed ||
                             cleanString(cat.labelAR) === cleanTrimmed;
                    });

                    if (matchedCat) {
                      const alreadyActive = activeZones.some((z) => z.id.toLowerCase() === matchedCat.id.toLowerCase());
                      if (!alreadyActive) {
                        setDynamicZones((prev) => {
                          if (prev.some((z) => z.id.toLowerCase() === matchedCat.id.toLowerCase())) {
                            return prev;
                          }
                          return [
                            ...prev,
                            {
                              id: matchedCat.id,
                              labelEN: matchedCat.labelEN,
                              labelBN: matchedCat.labelBN,
                              labelAR: matchedCat.labelAR,
                              icon: matchedCat.icon,
                            },
                          ];
                        });
                      }
                      
                      setSelectedCategoryLabel({
                        en: matchedCat.labelEN,
                        bn: matchedCat.labelBN,
                        ar: matchedCat.labelAR
                      });

                      setTimeout(() => {
                        const el = document.getElementById(`zone-section-${matchedCat.id}`);
                        if (el) {
                          el.scrollIntoView({ behavior: "smooth", block: "center" });
                          el.classList.add("ring-2", "ring-[#F59E0B]");
                          setTimeout(() => {
                            el.classList.remove("ring-2", "ring-[#F59E0B]");
                          }, 2000);
                        }
                      }, 250);
                    } else {
                      if (!activeZones.some((z) => z.id.toLowerCase() === trimmed.toLowerCase())) {
                        setDynamicZones((prev) => [
                          ...prev,
                          {
                            id: trimmed,
                            labelEN: trimmed.toUpperCase(),
                            labelBN: trimmed,
                            labelAR: trimmed,
                            icon: "📍",
                          },
                        ]);
                        setSelectedCategoryLabel({
                          en: trimmed.toUpperCase(),
                          bn: trimmed,
                          ar: trimmed
                        });
                        
                        // Smooth scroll
                        setTimeout(() => {
                          const el = document.getElementById(`zone-section-${trimmed}`);
                          if (el) {
                            el.scrollIntoView({ behavior: "smooth", block: "center" });
                            el.classList.add("ring-2", "ring-[#F59E0B]");
                            setTimeout(() => {
                              el.classList.remove("ring-2", "ring-[#F59E0B]");
                            }, 2000);
                          }
                        }, 250);
                      }
                    }
                  }
                  setSlotToCreate(null);
                }}
                className="bg-[#F59E0B] hover:bg-amber-600 text-slate-950 font-black text-xs px-4 py-2 rounded-xl transition duration-150 cursor-pointer"
              >
                {t("Add Slot", "যোগ করুন", "إضافة")}
              </button>
            </div>
          </div>
        </div>
      )}

            {/* Live Webcam Capturing overlay Modal */}
      {isLiveCamOpen && (
        <div className="fixed inset-0 z-[120] flex flex-col bg-slate-950 select-none print:hidden overflow-hidden">
          
          {/* Camera Header Banner */}
          <div className="absolute top-0 left-0 right-0 z-30 flex justify-between items-center p-4 bg-gradient-to-b from-slate-950/80 to-transparent pt-safe">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <h4 className="text-xs font-black text-white uppercase tracking-widest font-mono line-clamp-1 max-w-[140px] sm:max-w-full">
                {language === "bn" ? "লাইভ ক্যামেরা" : "LIVE CAMERA"}
              </h4>
            </div>
            
            <div className="flex items-center gap-3">
              {cameraHasFlashlight && (
                <button
                  type="button"
                  onClick={toggleFlashlight}
                  className={`p-2.5 rounded-full transition cursor-pointer backdrop-blur flex items-center justify-center ${isFlashlightOn ? 'bg-amber-400 text-slate-900 shadow-[0_0_15px_rgba(251,191,36,0.5)]' : 'bg-slate-900/50 hover:bg-slate-900/80 text-white'}`}
                  title={language === "bn" ? "ফ্ল্যাশ লাইট" : "Flashlight"}
                >
                  {isFlashlightOn ? <Flashlight className="w-5 h-5" /> : <FlashlightOff className="w-5 h-5" />}
                </button>
              )}
              <button
                type="button"
                onClick={handleCloseLiveCamera}
                className="p-2.5 bg-slate-900/50 hover:bg-slate-900/80 text-white rounded-full transition cursor-pointer backdrop-blur"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Captured count counter */}
          <div className="absolute top-14 right-4 z-10">
            <span className="text-[10px] font-mono px-2.5 py-1.5 bg-emerald-500/20 backdrop-blur border border-emerald-500/50 text-emerald-400 rounded-lg font-bold shadow-lg">
              {language === "bn" ? `নতুন ছবি: ${cameraActiveCount} টি` : `Added index: ${cameraActiveCount}`}
            </span>
          </div>

          {/* Error Banner if any */}
          {cameraError ? (
            <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 z-20 bg-rose-500/20 backdrop-blur border border-rose-500/30 text-rose-300 text-xs py-4 px-5 rounded-2xl flex flex-col items-center gap-3 shadow-2xl">
              <span className="text-center font-bold">⚠️ {cameraError}</span>
              <button 
                onClick={() => startLiveCamera(liveCamType, facingMode)} 
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold cursor-pointer transition"
              >
                {language === "bn" ? "পুনরায় চেষ্টা" : "Retry"}
              </button>
            </div>
          ) : null}

          {/* Live streaming Viewfinder (Takes available relative space) */}
          <div className="relative flex-1 w-full bg-black flex items-center justify-center">
            <video 
              id="live-viewfinder" 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover"
            />

            {/* Recording Indicator */}
            {isRecordingVideo && (
              <div className="absolute top-24 right-4 z-10 flex items-center gap-1.5 bg-slate-950/80 backdrop-blur px-3 py-1.5 rounded-lg border border-rose-500/50 shadow-lg">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-rose-400 font-mono text-[11px] font-bold uppercase tracking-widest">{recordingDuration}s</span>
              </div>
            )}

            {/* Grid lines helper like professional DSLRs */}
            <div className="absolute inset-0 pointer-events-none opacity-20 border-t border-b border-dashed border-white/50 flex justify-between mix-blend-overlay">
              <div className="h-full border-l border-r border-dashed border-white/50 w-1/3" />
              <div className="h-full border-r border-dashed border-white/50 w-1/3" />
            </div>

            {/* Flash feedback overlay */}
            <div 
              id="camera-flash-overlay" 
              className="absolute inset-0 bg-white opacity-0 transition-opacity duration-150 pointer-events-none z-10"
            />

            {/* Helper badge */}
            <span className="absolute bottom-32 left-1/2 -translate-x-1/2 z-10 bg-slate-950/60 backdrop-blur border border-white/10 text-[10px] uppercase font-mono px-3 py-1.5 rounded-full text-slate-300 shadow-lg tracking-wider">
              {liveCamType === "work" 
                ? (language === "bn" ? "কার্যের প্রমাণ" : "Work-Evidence") 
                : (language === "bn" ? "রিকমেন্ডেশন" : "Recommendation")}
            </span>
          </div>

          {/* Controlling Tools and Shutter (Bottom Panel) */}
          <div className="absolute bottom-0 left-0 right-0 z-30 bg-slate-950/90 backdrop-blur-md pt-4 px-6 pb-6 lg:pb-8 flex justify-between items-center w-full min-h-[100px] border-t border-slate-800/50 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
            {/* Optional facing mode switcher */}
            <button
              type="button"
              onClick={handleToggleFacingMode}
              className="w-12 h-12 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white rounded-full transition cursor-pointer"
              title={language === "bn" ? "ক্যামেরা ঘোরান" : "Toggle Camera"}
            >
              🔄
            </button>

            {/* BIG SHUTTER BUTTONS */}
            <div className="flex justify-center items-center gap-6">
              {/* Video Button */}
              <button
                type="button"
                onClick={toggleLiveVideoRecording}
                className={`w-14 h-14 rounded-full bg-slate-900 border-2 ${isRecordingVideo ? "border-rose-500 animate-pulse" : "border-slate-600"} flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer`}
                title={language === "bn" ? (isRecordingVideo ? "ভিডিও বন্ধ করুন" : "ভিডিও শুরু করুন") : (isRecordingVideo ? "Stop Video" : "Record Video")}
              >
                <div className={`w-8 h-8 flex items-center justify-center transition-all ${isRecordingVideo ? "rounded bg-rose-600" : "rounded-full bg-slate-700 hover:bg-slate-600"} text-white`}>
                  <Video className={`w-4 h-4 text-white ${isRecordingVideo ? "animate-bounce" : ""}`} />
                </div>
              </button>

              {/* Photo Button */}
              <button
                type="button"
                onClick={() => captureLivePhoto()}
                className="w-20 h-20 rounded-full border-4 border-white/80 flex items-center justify-center active:scale-90 transition-all cursor-pointer shadow-lg outline-none"
                title={language === "bn" ? "ছবি তুলুন" : "Capture Photo Frame"}
              >
                <div className="w-16 h-16 rounded-full bg-white transition hover:bg-slate-100 items-center justify-center shadow-inner" />
              </button>
            </div>

            {/* Phantom div to balance the space */}
            <div className="w-12 h-12" />
          </div>

          {/* Micro instructional helper */}
          <div className="absolute bottom-2 w-full text-center pb-2">
            <p className="text-[10px] text-emerald-400 font-bold opacity-80">
              {language === "bn" 
                ? "💡 ছবি তোলার সাথে সাথেই সেটি যুক্ত হয়ে ক্যামেরা স্বয়ংক্রিয়ভাবে বন্ধ হয়ে যাবে!"
                : "💡 Snapping a photo will instantly capture and close the camera for you!"}
            </p>
          </div>
        </div>
      )}
      
      {/* ⚠️ IFRAME SAFE INTERACTIVE REPORT DELETE CONFIRMATION MODAL OVERLAY */}
      {reportToDeleteId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] no-print animate-fadeIn">
          <div className="bg-[#1E293B] border-2 border-rose-500 rounded-3xl p-6 shadow-2xl max-w-sm w-full space-y-4">
            <div className="flex items-center gap-3 text-rose-500">
              <span className="text-3xl">⚠️</span>
              <div>
                <h4 className="text-sm font-black uppercase text-slate-100 font-mono tracking-wider">
                  {language === "bn" ? "রিপোর্ট মুছুন নিশ্চিতকরণ" : "CONFIRM DELETE REPORT"}
                </h4>
                <p className="text-[10px] text-rose-400 font-bold uppercase tracking-widest mt-0.5">
                  {language === "bn" ? "স্থায়ীভাবে মুছে ফেলা হবে" : "Action is irreversible"}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-350 leading-relaxed">
              {language === "bn"
                ? "আপনি কি নিশ্চিতভাবে এই ইন্জিনিয়ারিং রিপোর্টটি ডিলিট করতে চান? এই অ্যাকশনটি স্থায়ী এবং এটি ফেরত আনা যাবে না।"
                : "Are you sure you want to delete this engineering inspection report? This will permanently delete the report file contents from local directories."}
            </p>

            <div className="flex gap-2.5 pt-2 justify-end">
              <button
                type="button"
                onClick={() => setReportToDeleteId(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-705 text-slate-300 font-bold rounded-xl text-xs transition duration-150 cursor-pointer"
              >
                {language === "bn" ? "বাতিল" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={confirmDeleteReport}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl text-xs shadow-lg shadow-rose-600/20 transition duration-150 cursor-pointer"
              >
                {language === "bn" ? "হ্যাঁ, ডিলিট করুন" : "Yes, Delete PDF"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Custom Service Types Manager Modal */}
      {showCustomServicePopup && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] no-print animate-fadeIn text-slate-100">
          <div className="bg-[#1E293B] border-2 border-blue-500 rounded-3xl p-6 shadow-2xl max-w-sm w-full space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🛡️</span>
                <div className="text-left">
                  <h4 className="text-sm font-black uppercase font-mono tracking-wider text-slate-100">
                    {t("Manage Services List", "সার্ভিসের তালিকা ব্যবস্থাপনা", "إدارة قائمة الخدمات")}
                  </h4>
                  <p className="text-[9px] text-blue-400 font-bold uppercase tracking-widest mt-0.5">
                    {t("Customize service type options", "নতুন ধরণের সার্ভিস যোগ বা সংশোধন করুন", "تخصيص خيارات نوع الخدمة")}
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setShowCustomServicePopup(false)}
                className="text-slate-400 hover:text-rose-450 text-xs font-bold p-1 rounded transition-colors"
                title={t("Close", "বন্ধ করুন", "إغلاق")}
              >
                [✕]
              </button>
            </div>

            {/* Quick Add Form Section */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (newCustomServiceInput.trim()) {
                  const cleaned = newCustomServiceInput.trim();
                  if (!customServiceTypes.includes(cleaned)) {
                    setCustomServiceTypes(prev => [...prev, cleaned]);
                    setServiceType(cleaned);
                  } else {
                    setServiceType(cleaned);
                  }
                  setNewCustomServiceInput("");
                  setShowCustomServicePopup(false);
                }
              }}
              className="space-y-2 pt-1.5 border-t border-slate-700/60"
            >
              <label className="text-[10px] text-slate-400 font-bold font-mono uppercase tracking-wider block text-left">
                {t("Add New Service Title", "নতুন সার্ভিস লিখুন:", "إضافة اسم خدمة جديد")}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCustomServiceInput}
                  onChange={(e) => setNewCustomServiceInput(e.target.value)}
                  placeholder={t("e.g. Bedbug Treatment, Fogging...", "উদা: বেডবাগ ট্রিটমেন্ট, ফগিং ও স্প্রে...", "مثال: مكافحة بق الفراش...")}
                  className="flex-1 bg-slate-900 border border-slate-700 hover:border-slate-600 focus:border-blue-500 rounded-xl px-3 py-2 text-[11px] text-white outline-none placeholder:text-slate-500 transition-colors font-sans"
                />
                <button
                  type="submit"
                  disabled={!newCustomServiceInput.trim()}
                  className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white font-black text-[10px] px-3.5 rounded-xl uppercase shadow-lg shadow-blue-600/20 active:scale-95 transition-all cursor-pointer select-none"
                >
                  {t("Add", "যোগ", "إضافة")}
                </button>
              </div>
            </form>

            {/* Current Active List View with Delete (Trash) Button */}
            <div className="space-y-2 text-left">
              <span className="text-[10px] text-slate-400 font-bold font-mono uppercase tracking-wider block">
                {t("Existing Service Types List", "বর্তমানে সচল সার্ভিস সমূহের তালিকা:", "قائمة أنواع الخدمات الحالية")}
              </span>
              <div className="max-h-[180px] overflow-y-auto space-y-1.5 pr-1.5 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                {customServiceTypes.map((stVal, idx) => {
                  const isCoreDefault = [
                    "Routine Visit",
                    "Call Back / Emergency Service",
                    "Deep Insect Treatment",
                    "Termite Barrier & Treatment",
                    "Fumigation & Fogging"
                  ].includes(stVal);

                  return (
                    <div 
                      key={idx} 
                      className="flex items-center justify-between p-2 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 rounded-xl transition-all"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setServiceType(stVal);
                          setShowCustomServicePopup(false);
                        }}
                        className="flex-1 text-left text-[11px] font-bold font-sans text-slate-200 hover:text-white truncate"
                        title={t("Click to select", "নির্বাচন করতে ক্লিক করুন", "انقر للتحديد")}
                      >
                        {stVal} {serviceType === stVal && <span className="text-emerald-400 ml-1.5 font-mono text-[9px] uppercase font-black">✓</span>}
                      </button>
                      
                      {!isCoreDefault && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(t(`Are you sure you want to delete "${stVal}" type?`, `আপনি কি নিশ্চিত যে "${stVal}" সার্ভিস অপশনটি তালিকা থেকে ডিলিট করতে চান?`, `هل أنت متأكد من حذف خدمة "${stVal}"؟`))) {
                              setCustomServiceTypes(prev => prev.filter(item => item !== stVal));
                              if (serviceType === stVal) {
                                setServiceType("Routine Visit");
                              }
                            }
                          }}
                          className="text-slate-500 hover:text-rose-500 p-1 rounded transition-colors active:scale-90"
                          title={t("Delete option", "ডিলিট করুন", "حذف")}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-1 flex justify-end">
              <button
                type="button"
                onClick={() => setShowCustomServicePopup(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-705 text-slate-300 font-bold rounded-xl text-xs transition duration-150 cursor-pointer"
              >
                {t("Close", "বন্ধ করুন", "حفظ وإغلاق")}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
