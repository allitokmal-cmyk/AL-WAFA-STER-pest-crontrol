export type AppLanguage = "en" | "ar" | "bn";

export interface ChemicalRef {
  name: string;
  dilution: string;
  batch: string;
  expiry: string;
  stock: number;
  unit: string;
  alertThreshold: number;
}

export interface ClientDirectoryItem {
  name: string;
  centerId: string;
  emirate: string;
}

export interface ReportItem {
  id: string;
  facilityName: string;
  clientId: string;
  contractNo: string;
  branchName: string;
  facilityType: string;
  emirate: "Ajman" | "Dubai" | "Sharjah" | "Umm Al Quwain" | "Ras Al Khaimah" | "Fujairah" | "Al Dhaid" | string;
  address: string;
  gpsCoordinates?: string;
  contactPerson: string;
  mobile: string;
  whatsapp: string;
  email: string;
  startDate: string;
  endDate: string;
  validity: string;
  dateOfOperation: string;
  ticketNo: string;
  startTime: string;
  endTime: string;
  duration: string;
  categories: string[];
  areas: string[];
  reportText: string;
  partialNotes?: string;
  workStatus: "Completed" | "In Progress" | "Follow-Up Required" | "Emergency Callback" | "Partially Completed";
  methods: string[];
  chemicals: {
    name: string;
    dilution: string;
    used: string;
    batch: string;
    expiry: string;
    remaining: string;
    quantityPcs?: number | string;
    storeRetrievalDate?: string;
    disposalDate?: string;
    disposalQty?: number | string;
  }[];
  infestation: Record<string, "None" | "Low" | "Medium" | "High" | string>;
  sanitation: "Poor" | "Satisfactory" | "Good";
  proofing: "Poor" | "Satisfactory" | "Good";
  sanitationRemarks?: string;
  proofingRemarks?: string;
  recommendations: string[];
  billing: {
    invoiceNo: string;
    invoiceDate: string;
    amount: number | string;
    discount: number;
    vat: number;
    total: number;
    method: "Cash" | "Bank Transfer" | "Card Payment" | "Online Payment" | string;
    status: "Paid" | "Pending" | "Partial Payment" | "Overdue";
  };
  technicians: string[];
  signatures: {
    client?: string;
    technician?: string;
    supervisor?: string;
  };
  media?: {
    beforePhotos?: string[];
    afterPhotos?: string[];
    chemicalPhotos?: string[];
    attendancePhotos?: string[];
    sitePhotos?: string[];
  };
  dateFrame?: string;
  locationType?: string;
  instructionText?: string;
  routeId?: string;
  sectionServiced?: string;
  additionalChemical?: string;
  chemicalAmount?: string;
  assignedCleanLead?: string;
  supervisingLeadOfficer?: string;
  comments?: string;
  rawEngineeringData?: any;
}

export interface AppUser {
  id: string;
  username: string;
  passwordPlain: string;
  role: "Admin" | "Moderator" | "Visitor";
}

export type UserRole = "Super Admin" | "Admin / Manager" | "Guest Admin" | "Client Portal" | "Moderator" | "Visitor" | "Admin";

export const DICTIONARY: Record<AppLanguage, Record<string, string>> = {
  en: {
    appTitle: "AL WAFA STAR ERP",
    systemSubtitle: "Smart Pest Control & Medical Facility Management System",
    dashboard: "Dashboard",
    clientDirectory: "Location Directory",
    masterForm: "New Service Report",
    inventory: "Chemical Inventory",
    technicians: "Technicians",
    clientPortal: "Pest Control Service",
    aiPestDetection: "AI Pest Expert (Gemini)",
    addReportSuccess: "Report auto-filed successfully with real-time stock adjustment!",
    activeClients: "Active Clients",
    servicesCompleted: "Services Completed",
    revenue: "Total Revenue",
    pendingPayments: "Pending Payments",
    expiringContracts: "Expiring Contracts",
    infestationMonitoring: "Pest Infestation Monitoring",
    chemicalReference: "Chemical Usage Metrics",
    recentReports: "Recent Service Operations Logs",
    addReportBtn: "Open Dynamic Form",
    allRightsReserved: "Al Wafa Star ERP © 2026. All Rights Reserved."
  },
  ar: {
    appTitle: "الوفاء ستار ERP",
    systemSubtitle: "نظام ذكي لمكافحة الحشرات وإدارة المنشآت الطبية",
    dashboard: "لوحة التحكم",
    clientDirectory: "دليل المواقع",
    masterForm: "تقرير الخدمة الجديد",
    inventory: "مخزون المواد الكيميائية",
    technicians: "الفنيين والمشرفين",
    clientPortal: "خدمة مكافحة الآفات",
    aiPestDetection: "خبير الذكاء الاصطناعي (Gemini)",
    addReportSuccess: "تم حفظ التقرير بنجاح مع الخصم التلقائي للمخزون!",
    activeClients: "العملاء النشطين",
    servicesCompleted: "الخدمات المكتملة",
    revenue: "إجمالي الإيرادات",
    pendingPayments: "الدفعات المعلقة",
    expiringContracts: "العقود المنتهية قريباً",
    infestationMonitoring: "مراقبة مستوى انتشار الآفات",
    chemicalReference: "مؤشرات استهلاك المواد الكيميائية",
    recentReports: "سجلات عمليات الخدمة الأخيرة",
    addReportBtn: "فتح النموذج الديناميكي",
    allRightsReserved: "الوفاء ستار ERP © 2026. جميع الحقوق محفوظة."
  },
  bn: {
    appTitle: "আল ওয়াফা স্টার ERP",
    systemSubtitle: "স্মার্ট পেস্ট কন্ট্রোল এবং মেডিকেল ফেসিলিটি ম্যানেজমেন্ট সিস্টেম",
    dashboard: "ড্যাশবোর্ড",
    clientDirectory: "লোকেশন ডিরেক্টরি",
    masterForm: "নতুন সার্ভিস রিপোর্ট",
    inventory: "কেমিক্যাল ইনভেন্টরি",
    technicians: "টেকনিশিয়ান প্যানেল",
    clientPortal: "Pest Control Service",
    aiPestDetection: "AI পেস্ট এক্সপার্ট (Gemini)",
    addReportSuccess: "সার্ভিস রিপোর্ট সফলভাবে দাখিল করা হয়েছে এবং স্টক স্বয়ংক্রিয়ভাবে সমন্বয় করা হয়েছে!",
    activeClients: "মোট সক্রিয় ক্লায়েন্ট",
    servicesCompleted: "সম্পন্ন সার্ভিস সমূহ",
    revenue: "মোট রাজস্ব",
    pendingPayments: "বকেয়া পেমেন্ট",
    expiringContracts: "মেয়াদোত্তীর্ণ হতে নেওয়া চুক্তি",
    infestationMonitoring: "পোকা-মাকড় উপদ্রব নিরীক্ষণ",
    chemicalReference: "কেমিক্যাল স্টক ও ব্যবহারের হিসাব",
    recentReports: "সম্পন্ন হওয়া সাম্প্রতিক অপারেশন লগ",
    addReportBtn: "নতুন ফর্ম পূরণ করুন",
    allRightsReserved: "আল ওয়াফা স্টার ERP © ২০২৬। সর্বস্বত্ব সংরক্ষিত।"
  }
};

export interface LocationRegistryItem {
  id: string;
  name: string;
  emirate: string;
  mapUrl?: string;
}

export interface SupervisorRegistryItem {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  facilityName: string;
  emirate: string;
  avatarUrl?: string;
  avatarEmoji?: string;
}

export const EMIRATE_MAPPING_FACILITIES: Record<string, string[]> = {
  "ajman": [
    "Al Hamidiyah Health Center",
    "Public Health Center",
    "Dental Health Center",
    "Mushairif Health Center",
    "Maple Clinic",
    "Ajman Medical Store",
    "Ajman DTC",
    "Al Rashidiya Clinic"
  ],
  "dubai": [
    "Al Kuwait Hospital (Dubai)",
    "Hor Al Anz Health Center",
    "Smart Salem Medical Fitness Centre",
    "DTC Rashidiya",
    "ENOC Salem",
    "Erada Center",
    "Silicon Oasis Health Center",
    "Family Health Promotion Center",
    "Blood Transfusion Center"
  ],
  "sharjah": [
    "Al Kuwait Hospital (Sharjah)",
    "Khorfakkan Hospital",
    "Malaria Unit"
  ],
  "umm al quwain": [
    "Umm Al Quwain Hospital",
    "Al Khazan Health Center",
    "Falaj Al Mualla Health Center",
    "Al Rafa Health Center"
  ],
  "ras al khaimah": [
    "Abdullah Bin Omran Hospital",
    "Saqr Hospital",
    "Shaam Hospital"
  ],
  "fujairah": [
    "Fujairah Hospital",
    "Fujairah Medical Store"
  ],
  "al dhaid": [
    "Al Kuwait Hospital (Sharjah)",
    "Khorfakkan Hospital"
  ]
};

export const STANDARD_FACILITIES = [
  "GENETIC AND NEONATAL SCREENING DIAGNOSTIC CENTER.",
  "AL MADINA HEALTH CENTER -AJMAN",
  "AL MANAMA HEALTH CENTER -AJMAN",
  "MUZEIRAH HEALTH CENTER -AJMAN",
  "AL HAMIDIYA CLINIC-AJMAN",
  "PUBLIC HEALTH CENTER-AJMAN",
  "DENTAL CLINIC-AJMAN",
  "AL MUSHEIRIF HEALTH CENTER -AJMAN",
  "MEDICAL STORE -AJMAN",
  "MAPLE CLINIC - AL JURF",
  "MAPLE CLINIC - AL RAWDAH",
  "MAPLE RED PHARMACY - AL RAWDAH",
  "MAPLE RED PHARMACY - AL NUAMIA",
  "MAPLE RED PHARMACY - G+",
  "AL KUWAIT HOSPITAL",
  "AL AMAL PSYCHIATRIC HOSPITAL",
  "DTC",
  "EMARAT HEALTH SERVICE(SILICON)",
  "ERADA CENTER",
  "AL AWIR HEALTH CENTER",
  "AL ITTIHAD HEALTH CENTER",
  "DUBAI DENTAL SPECIALISED CENTER",
  "HOR AL ANZ HEALTH CENTER",
  "AL MUHAISNA HEALTH CENTER",
  "CENTRAL MEDICAL STORE",
  "NATIONAL RADIATION PROTECTION CENTER .",
  "PREVENTIVE MEDICINE(AL BARAHA)",
  "SMART SALEEM CITY WALK",
  "SMART SALEEM KNOWLADGE VILLAGE",
  "SMART SALEEM INDEX MALL",
  "ENOCK SALEEM MFC",
  "EMIRATES DRUG ESTABLISHMENT (LAB)",
  "MBRHE",
  "BUS WASH",
  "FUJAIRAH HOSPITAL",
  "FUJAIRAH MEDICAL STORE",
  "FUJAIRAH PUBLIC HEALTH CENTER",
  "ABDULLAH BIN OMRAN HOSPITAL",
  "SAQR HOSPITAL",
  "SHA'AM HOSPITAL",
  "AL MAERID HEALTH CENTER",
  "AL JEER HEALTH CENTER",
  "ABDULLAH BIN ALI AL HARHAN HEALTH CENTER",
  "AL JAZEERA AL HAMRAH HEALTH CENTER",
  "RAS AL KHAIMAH HEALTH CENTER",
  "AL NAKHEEL HEALTH CENTER",
  "EHS MEDICAL STORE - RAK",
  "EHS OFFICES - RAK",
  "PHYSIOTHERAPY & SPORTS CENTER",
  "RAK SPECIALIZED DENTAL CENTER",
  "KHORFAKKAN HOSPITAL",
  "KHORFAKKAN DENTAL CLINIC",
  "KALBA PUBLIC HEALTH",
  "KALBA DENTAL CENTER",
  "DIBBA PUBLIC HEALTH",
  "AL NAHWA HEALTH CENTER",
  "KUWAIT HOSPITAL- SHARJAH",
  "FAMILY HEALTH CENTER - SHARJAH",
  "BLOOD TRANSFUSION AND RESEARCH CENTER",
  "PUBLIC HEALTH CENTER",
  "NATIONAL MALARIA CLINIC",
  "EHS OFFICE",
  "AL DHAID HEALTH CENTER",
  "AL DHAIDPUBLIC HEALTH CENTER",
  "AL MALIHA HEALTH CENTER",
  "AL THAMEED HEALTH CENTER",
  "AL MADAM HEALTH CENTER",
  "NAZWA HEALTH CENTER",
  "UMM AL QUWAIN HOSPITAL",
  "KHAZAN HEALTH CENTER-UAQ",
  "DENTAL CLINIC -UAQ",
  "PUBLIC HEALTH CENTER -UAQ",
  "SALAMA HEALTH CENTER -UAQ",
  "FALAJ AL MUALLA HEALTH CENTER -UAQ",
  "RAFA HEALTH CENTER -UAQ"
];

