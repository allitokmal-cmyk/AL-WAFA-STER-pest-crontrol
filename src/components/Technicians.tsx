import React, { useState, useEffect, useRef } from "react";
import { 
  Users, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Plus, 
  FileText, 
  AlertCircle,
  HelpCircle,
  Bell,
  ArrowRight,
  ShieldCheck,
  ClipboardList,
  Building,
  Activity,
  FileSpreadsheet,
  Printer,
  Download,
  Maximize2,
  Phone,
  Paperclip,
  Check,
  X,
  BookUser,
  ChevronDown
} from "lucide-react";
import { LocationRegistryItem, SupervisorRegistryItem, ReportItem, EMIRATE_MAPPING_FACILITIES } from "../types";
import { getStoreValue, saveStoreValue } from "../localDatabase";

export interface FieldPlanItem {
  id: string;
  facilityName: string;
  assignedTo: string;
  dateFrame: "Today" | "Tomorrow" | "After Tomorrow" | "Upcoming" | string;
  customDate?: string;
  tasks: string[];
  notes?: string;
  workAreas?: string;      // New field: কোথায় কোথায় কাজ করতে হবে
  reportedIssue?: string;  // New field: কী সমস্যা হয়েছে
  status: "Planned" | "Active" | "Completed" | "Partially Completed";
  locationType?: string;
  instructionText?: string;
  completedNotes?: {
    doneTasksText: string;
    pendingTasksText: string;
    quickTemplateSelected?: string;
    completedAt?: string;
    postedBy?: string;
    workAreas?: string;
    reportedIssue?: string;
  };
}

export interface TimelineFeedItem {
  id: string;
  facilityName: string;
  postedBy: string;
  timestamp: string;
  status: "Completed" | "Partially Completed";
  doneText: string;
  pendingText: string;
  quickTemplate?: string;
  workAreas?: string;
  reportedIssue?: string;
  locationType?: string;
  dateFrame?: string;
}

interface TechniciansProps {
  language: "en" | "ar" | "bn";
  locations?: LocationRegistryItem[];
  supervisors?: SupervisorRegistryItem[];
  reports?: ReportItem[];
  onUpdateReports?: (reports: ReportItem[]) => void;
  onSelectClientToPrefill?: (client: any) => void;
}

export default function Technicians({ 
  language,
  locations = [],
  supervisors = [],
  reports = [],
  onUpdateReports,
  onSelectClientToPrefill
}: TechniciansProps) {

  const isBengali = language === "bn";

  // 1. Core Plans Database State synced to localStorage
  const [plans, setPlans] = useState<FieldPlanItem[]>(() => {
    const saved = localStorage.getItem("ALW_FIELD_PLANS_V2");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    // Realistic seeded initial plans matching users main routes / square market
    return [
      {
        id: "PLAN-101",
        facilityName: "Al Kuwait Hospital (Dubai)",
        assignedTo: "Hussin (Technician)",
        dateFrame: "Today",
        workAreas: "Hospital Ward 3, Kitchen Cabinet, Base Drain 1",
        reportedIssue: "High density cockroach infestation and drain flies in catering base",
        tasks: ["Cockroach Busting", "Tube Sub Inspection"],
        notes: "Apply defensive insecticide gel spray into kitchen corners.",
        status: "Planned"
      },
      {
        id: "PLAN-102",
        facilityName: "Mushairif Health Center (Ajman)",
        assignedTo: "Hamdy (Supervisor)",
        dateFrame: "Tomorrow",
        workAreas: "Outer Lawn Grasses, Secondary Gutter Drainage",
        reportedIssue: "Stagnant rainwater breeding mosquito larvae",
        tasks: ["General Pest Control", "Mosquito Fogging"],
        notes: "Execute thorough fogging around lawn periphery before evening.",
        status: "Planned"
      },
      {
        id: "PLAN-103",
        facilityName: "Al Hamidiyah Health Center",
        assignedTo: "Ahmed (Technician)",
        dateFrame: "After Tomorrow",
        workAreas: "Medical Registry Toilet Block, Sector 4 Pipes",
        reportedIssue: "Sewage drain valve blockage leaking gas bugs",
        tasks: ["Drain Fly Treatment", "Sanitization Service"],
        notes: "Apply professional chemical disinfectant to all floor traps.",
        status: "Planned"
      }
    ];
  });

  // 2. Timeline Feed Items synced to localStorage
  const [timelineFeed, setTimelineFeed] = useState<TimelineFeedItem[]>(() => {
    const saved = localStorage.getItem("ALW_TIMELINE_FEED_V2");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    // Initial completed items as realistic Excel feed rows
    return [
      {
        id: "FEED-201",
        facilityName: "Al Kuwait Hospital (Dubai)",
        postedBy: "Hamdy Hussin (Supervisor)",
        timestamp: "2026-06-01 10:45 AM",
        status: "Completed",
        workAreas: "Sector A Base Kitchen & Drain pipes",
        reportedIssue: "Drain Fly infestation noticed by chef staff",
        doneText: "কি কি কাজ সম্পন্ন করা হয়েছে:\n- সম্পূর্ণ কিচেন ও বেসিন এলাকা স্প্রে করা হয়েছে।\n- উপদ্রব নিয়ন্ত্রণ করতে স্যানিটারি জেল প্রয়োগ করা হয়েছে।",
        pendingText: "কি কি কাজ বাকি রয়েছে:\n- কোনো কাজ বাকি নেই। সম্পূর্ণ এলাকা স্যানিটাইজ করা হয়েছে।"
      },
      {
        id: "FEED-202",
        facilityName: "Mushairif Health Center (Ajman)",
        postedBy: "Hussin (Technician)",
        timestamp: "2026-05-31 03:15 PM",
        status: "Partially Completed",
        workAreas: "Ground floor toilets and outside diagnostic pipeline",
        reportedIssue: "Persistent rodent holes behind air conditioner duct",
        doneText: "কি কি কাজ সম্পন্ন করা হয়েছে:\n- আংশিক ভ্যাকুয়াম এবং পেস্ট কন্ট্রোল বেট জেল স্থাপন করা হয়েছে।",
        pendingText: "কি কি কাজ বাকি রয়েছে:\n- আরও কিছু ড্রেন স্লিপ প্রুফিং বাকি রয়ে গেছে যা পরবর্তী শিফটে লাগবে।",
        quickTemplate: "২. আংশিক কাজ হয়েছে, কিছু জায়গায় কাজ বাকি রয়েছে।"
      }
    ];
  });

  // Excel State preferences
  const [selectedPlanRow, setSelectedPlanRow] = useState<string | null>(null);
  const [selectedFeedRow, setSelectedFeedRow] = useState<string | null>(null);
  const [activeTabSheet, setActiveTabSheet] = useState<"plans" | "completed">("plans");
  const [searchQuery, setSearchQuery] = useState("");

  const serverLoadedRef = useRef({ plans: false, feed: false });

  // Load initial plans and timeline feed from Firestore to support multi-device viewing
  useEffect(() => {
    getStoreValue<any[]>("field_plans", []).then((val) => {
      if (val && val.length > 0) {
        setPlans(val);
        localStorage.setItem("ALW_FIELD_PLANS_V2", JSON.stringify(val));
      }
      serverLoadedRef.current.plans = true;
    }).catch(() => {
      serverLoadedRef.current.plans = true;
    });

    getStoreValue<any[]>("timeline_feed", []).then((val) => {
      if (val && val.length > 0) {
        setTimelineFeed(val);
        localStorage.setItem("ALW_TIMELINE_FEED_V2", JSON.stringify(val));
      }
      serverLoadedRef.current.feed = true;
    }).catch(() => {
      serverLoadedRef.current.feed = true;
    });
  }, []);

  // State Persistence effects
  useEffect(() => {
    localStorage.setItem("ALW_FIELD_PLANS_V2", JSON.stringify(plans));
    if (serverLoadedRef.current.plans) {
      saveStoreValue("field_plans", plans).catch((err) => console.log("Failed to sync plans to Firestore:", err));
    }
  }, [plans]);

  useEffect(() => {
    localStorage.setItem("ALW_TIMELINE_FEED_V2", JSON.stringify(timelineFeed));
    if (serverLoadedRef.current.feed) {
      saveStoreValue("timeline_feed", timelineFeed).catch((err) => console.log("Failed to sync feed to Firestore:", err));
    }
  }, [timelineFeed]);

  // Toast / System Messages
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 3. Helper for pre-population of hospital tasks instructions
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

  // Create Simplified Field Plan variables
  const [targetFacility, setTargetFacility] = useState("");
  const [assignedStaff, setAssignedStaff] = useState("Hamdy (Supervisor)");
  const [datePeriod, setDatePeriod] = useState<"Today" | "Tomorrow" | "After Tomorrow" | "">("Today");
  const [locationArea, setLocationArea] = useState<string>("Inside");
  const [instructionText, setInstructionText] = useState("");
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [showCustomClinicInput, setShowCustomClinicInput] = useState(false);
  const [newClinicName, setNewClinicName] = useState("");
  const [newClinicEmirate, setNewClinicEmirate] = useState("Dubai");
  const [quickLinkEmirateFilter, setQuickLinkEmirateFilter] = useState("All");
  const [isQuickLinkOpen, setIsQuickLinkOpen] = useState(false);
  const [deletedFacilities, setDeletedFacilities] = useState<string[]>(() => {
    try {
      const cache = localStorage.getItem("ALW_DELETED_FACILITIES");
      return cache ? JSON.parse(cache) : [];
    } catch(e) { return []; }
  });

  const handleDeleteFacility = (facName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextList = [...deletedFacilities, facName];
    setDeletedFacilities(nextList);
    localStorage.setItem("ALW_DELETED_FACILITIES", JSON.stringify(nextList));
  };
  const [forceUpdateToggle, setForceUpdateToggle] = useState(0);

  // Duty Contacts
  const [isContactsOpen, setIsContactsOpen] = useState(false);
  const [dutyContacts, setDutyContacts] = useState<{ id: string, name: string, role: string, phone: string }[]>(() => {
    const saved = localStorage.getItem("ALW_DUTY_CONTACTS");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      { id: "1", name: "Hamdy", role: "Supervisor", phone: "+971 50 123 4567" },
      { id: "2", name: "Hussin", role: "Technician", phone: "+971 50 987 6543" },
      { id: "3", name: "Ahmed", role: "Driver", phone: "+971 52 111 2222" }
    ];
  });
  const [newContactName, setNewContactName] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");
  const [newContactRole, setNewContactRole] = useState("Technician");

  useEffect(() => {
    localStorage.setItem("ALW_DUTY_CONTACTS", JSON.stringify(dutyContacts));
  }, [dutyContacts]);

  const handleAddContact = () => {
    if (newContactName && newContactPhone) {
      setDutyContacts([...dutyContacts, { id: Date.now().toString(), name: newContactName, phone: newContactPhone, role: newContactRole }]);
      setNewContactName("");
      setNewContactPhone("");
    }
  };

  const handleRemoveContact = (id: string) => {
    setDutyContacts(dutyContacts.filter(c => c.id !== id));
  };

  // Keep compatibility fields
  const [workAreas, setWorkAreas] = useState("");
  const [reportedIssue, setReportedIssue] = useState("");
  const [selectedPresetTasks, setSelectedPresetTasks] = useState<string[]>([]);
  const [customTaskInput, setCustomTaskInput] = useState("");
  const [extraPlanNotes, setExtraPlanNotes] = useState("");

  const presetTasksOptions: string[] = [];

  const handleToggleTaskOption = (task: string) => {};
  const handleAddCustomTask = () => {};

  // Watch for facility change (no auto-population to keep textarea clean)
  const handleFacilitySelect = (val: string) => {
    setTargetFacility(val);
    if (val) {
      setWorkAreas(locationArea);
      setReportedIssue(isBengali ? "কাজের বিবরণ ও নির্দেশনা" : "Tasks Description");
    }
  };

  // 4. Save New Field Plan handler (Supervisor feature)
  const handleCreateNewFieldPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetFacility) {
      triggerToast(isBengali ? "অনুগ্রহ করে একটি সেন্টার বা হসপিটাল সিলেক্ট করুন!" : "Please select or type a target facility center!");
      return;
    }
    
    const finalInstructions = instructionText.trim() || (isBengali ? "সম্পূর্ণ সাধারণ পেস্ট কন্ট্রোল" : "General Pest Control");

    const newPlan: FieldPlanItem = {
      id: `PLAN-${Math.floor(100 + Math.random() * 900)}`,
      facilityName: targetFacility,
      assignedTo: assignedStaff,
      dateFrame: datePeriod || "Today",
      locationType: locationArea || "Inside",
      instructionText: finalInstructions,
      workAreas: locationArea || "Inside",
      reportedIssue: finalInstructions,
      tasks: [finalInstructions],
      notes: finalInstructions,
      status: "Planned"
    };

    setPlans(prev => [newPlan, ...prev]);
    triggerToast(isBengali ? `✓ ${targetFacility} এর জন্য নতুন প্ল্যান সফলভাবে এক্সেল আকারে সংযুক্ত হয়েছে!` : `✓ Plan for ${targetFacility} loaded to active spreadsheet!`);
    
    // Clear Form inputs and hide modal
    setTargetFacility("");
    setInstructionText("");
    setDatePeriod("Today");
    setLocationArea("Inside");
    setIsSchedulerOpen(false);
    setActiveTabSheet("plans");
  };

  // Navigate directly to the Daily Entry Report Form (MasterForm) pre-filling client
  const handleGoToFormForPlan = (plan: FieldPlanItem) => {
    if (onSelectClientToPrefill) {
      const matched = locations.find(l => l.name === plan.facilityName);
      onSelectClientToPrefill({
        id: matched?.id || `ALW-CLI-${Math.floor(3000 + Math.random() * 6000)}`,
        name: plan.facilityName,
        contract: "CON-924-ST",
        emirate: matched?.emirate || "Ajman",
        type: "Clinic",
        email: ""
      });
      triggerToast(isBengali ? `✓ ${plan.facilityName} এর জন্য ডেইলি রিপোর্ট ফর্মে রিডাইরেক্ট করা হচ্ছে...` : `✓ Redirecting to Daily Service Sheet for ${plan.facilityName}...`);
    } else {
      triggerToast("Error: Navigation function not bound!");
    }
  };

  // Delete plan handler 
  const handleDeletePlan = (planId: string, facilityName: string) => {
    setPlans(prev => prev.filter(p => p.id !== planId));
    triggerToast(isBengali ? `✓ ${facilityName} এর প্ল্যানটি মুছে ফেলা হয়েছে।` : `✓ Plan for ${facilityName} deleted.`);
  };

  // Delete timeline feed item handler
  const handleDeleteTimelineEntry = (feedId: string) => {
    setTimelineFeed(prev => prev.filter(f => f.id !== feedId));
    triggerToast(isBengali ? "✓ টাইমলাইন ইনফরমেশন মুছে ফেলা হয়েছে।" : "✓ Timeline entry cleared.");
  };

  // 5. PROGRESS SUBMISSION DIALOG STATES (DTC Pop-Up Video replication)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatingPlan, setUpdatingPlan] = useState<FieldPlanItem | null>(null);
  
  // Modal Fields
  const [tasksDoneText, setTasksDoneText] = useState("");
  const [tasksPendingText, setTasksPendingText] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  // Quick choose template definitions (Exact replica from Bengali video prompt)
  const quickChooseTemplates = [
    {
      id: "T1",
      label: "১. এখনও কাজ পুরোপুরি সমাধান শেষ হয়নি।",
      descBengali: "এখনও কাজ পুরোপুরি সমাধান শেষ হয়নি। কিছু কেমিক্যালের জটিলতা ও অতিরিক্ত স্যানিটেশন বাকি আছে।",
      descEnglish: "Work is not yet fully finished. Some chemical issues and sanitization remain."
    },
    {
      id: "T2",
      label: "২. আংশিক কাজ হয়েছে, কিছু জায়গায় কাজ বাকি রয়েছে।",
      descBengali: "আংশিক কাজ সম্পন্ন হয়েছে, কিছু স্যানিটারি ড্রেন স্লিভ পাইপ ও বাথরুম প্রুফিং বাকি রয়েছে।",
      descEnglish: "Partial work completed, some sanitary drain tubes and toilet proofing remain."
    },
    {
      id: "T3",
      label: "৩. কেমিক্যালের সমস্যা ছিল",
      descBengali: "সেন্টারে কেমিক্যালের সমস্যা ছিল, যার দরুন বাকি কেমিক্যাল স্প্রে পরবর্তী শিফটে সম্পন্ন করতে হবে।",
      descEnglish: "There was a chemical asset issue, remaining spray postponed to next shift."
    },
    {
      id: "T4",
      label: "৪. অতিরিক্ত ময়লা থাকার কারণে কাজটি পুরোপুরি করা সম্ভব হয়নি।",
      descBengali: "অতিরিক্ত ময়লা থাকার কারণে কাজটি পুরোপুরি করা সম্ভব হয়নি। রোগজীবাণু মুক্ত করতে পরিষ্কার কাজের নির্দেশনা দেয়া হয়েছে।",
      descEnglish: "Extreme debris/dirt prevented complete treatment. Instructed deep cleaning."
    }
  ];

  const handleOpenProgressUpdate = (plan: FieldPlanItem) => {
    setUpdatingPlan(plan);
    setTasksDoneText(`- ${plan.tasks.join("\n- ")} সম্পন্ন হয়েছে।\n- ${plan.workAreas || "নির্ধারিত এলাকায়"} প্রয়োজনীয় স্প্রে ও স্যানিটেশন জেল দেওয়া হয়েছে।`);
    setTasksPendingText("- কোনো বকেয়া কাজ নেই।");
    setSelectedTemplate(null);
    setIsModalOpen(true);
  };

  const handleSelectQuickTemplate = (tmpl: typeof quickChooseTemplates[0]) => {
    setSelectedTemplate(tmpl.label);
    setTasksPendingText(`- ${isBengali ? tmpl.descBengali : tmpl.descEnglish}`);
  };

  // Submit progress and post to timeline stream (Replicates video's dynamic post logic)
  const handleSubmitProgress = (isPartial: boolean) => {
    if (!updatingPlan) return;

    const loggedInUserStr = localStorage.getItem("ALW_STAR_LOGGED_IN_USER") || sessionStorage.getItem("ALW_STAR_LOGGED_IN_USER");
    let loggedInName = "Supervisor Hamdy Hussin";
    if (loggedInUserStr) {
      try {
        const u = JSON.parse(loggedInUserStr);
        loggedInName = `${u.username} (${u.role})`;
      } catch (e) {}
    }

    const reportStatus = isPartial ? "Partially Completed" : "Completed";

    // Format current timestamp
    const now = new Date();
    const formattedTime = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;

    // A. Add to central Completed Timeline feed
    const newFeedItem: TimelineFeedItem = {
      id: `FEED-${Math.floor(1000 + Math.random() * 9000)}`,
      facilityName: updatingPlan.facilityName,
      postedBy: loggedInName,
      timestamp: formattedTime,
      status: reportStatus,
      workAreas: updatingPlan.workAreas,
      reportedIssue: updatingPlan.reportedIssue,
      doneText: tasksDoneText,
      pendingText: tasksPendingText,
      quickTemplate: selectedTemplate || undefined
    };

    setTimelineFeed(prev => [newFeedItem, ...prev]);

    // B. Maintain plans array status (mark Completed in the sheet)
    setPlans(prev => prev.map(p => {
      if (p.id === updatingPlan.id) {
        return {
          ...p,
          status: reportStatus,
          completedNotes: {
            doneTasksText: tasksDoneText,
            pendingTasksText: tasksPendingText,
            quickTemplateSelected: selectedTemplate || undefined,
            completedAt: formattedTime,
            postedBy: loggedInName,
            workAreas: updatingPlan.workAreas,
            reportedIssue: updatingPlan.reportedIssue
          }
        };
      }
      return p;
    }));

    // C. Write report in props database
    if (onUpdateReports) {
      const templateNoteText = selectedTemplate ? `\n⚙️ কুইক টেম্পলেট নোটিফিকেশন: ${selectedTemplate}` : "";
      const textForReport = `✓ কি কি কাজ সম্পন্ন করা হয়েছে:\n${tasksDoneText}\n\n⚠ কি কি কাজ বাকি রয়েছে:\n${tasksPendingText}${templateNoteText}`;
      
      const newReportLog: ReportItem = {
        id: `REP-PLAN-${Math.floor(100 + Math.random() * 900)}-AL`,
        facilityName: updatingPlan.facilityName,
        clientId: `ALW-CLI-${Math.floor(2000 + Math.random() * 7000)}`,
        contractNo: "CON-PLAN-2026",
        branchName: updatingPlan.workAreas || "Primary Block",
        facilityType: "Medical Center",
        emirate: updatingPlan.facilityName.toLowerCase().includes("dubai") ? "Dubai" : 
                 updatingPlan.facilityName.toLowerCase().includes("sharjah") ? "Sharjah" : "Ajman",
        address: "UAE Assigned Clinical Center",
        contactPerson: "Clinical Operations Lead",
        mobile: "+971 50 XXXXXXX",
        whatsapp: "+971 50 XXXXXXX",
        email: "hospital.safety@moh.gov.ae",
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        validity: "Monthly Cycle",
        dateOfOperation: new Date().toISOString().split("T")[0],
        ticketNo: `TKT-DTC-${Math.floor(10000 + Math.random() * 90000)}`,
        startTime: "09:30",
        endTime: "11:00",
        duration: "1h 30m",
        categories: updatingPlan.tasks,
        areas: [updatingPlan.workAreas || "Facility Block"],
        reportText: isPartial 
          ? `Pest control operation logged as partially finished. Area problem reported: ${updatingPlan.reportedIssue}`
          : `General pest control sanitation maintenance completely done. Problems addressed.`,
        workStatus: isPartial ? "Partially Completed" : "Completed",
        partialNotes: textForReport,
        methods: ["Baiting", "Gel Treatment", "Defensive Spray"],
        chemicals: [{ name: "Target Gel V4", dilution: "1:10", used: "45ml", batch: "B-2026", expiry: "2028-12-31", remaining: "500ml", quantityPcs: "1" }],
        infestation: { cockroach: "High", flies: "Medium" },
        sanitation: "Satisfactory",
        proofing: isPartial ? "Poor" : "Good",
        recommendations: [isPartial ? "Complete remaining slot proofer lines in upcoming shifts." : "Audit safe sanitization regularly."],
        billing: {
          invoiceNo: "INV-PRE-" + Math.floor(1000+Math.random()*9000),
          invoiceDate: new Date().toISOString().split("T")[0],
          amount: 250,
          discount: 0,
          vat: 12.5,
          total: 262.5,
          method: "Cash",
          status: "Pending"
        },
        technicians: [updatingPlan.assignedTo.split(" ")[0]],
        signatures: {
          client: "Clinical Operations Lead",
          technician: "Hussin (Logged)",
          supervisor: "M. Hamdy"
        }
      };

      onUpdateReports([...reports, newReportLog]);
    }

    setIsModalOpen(false);
    setUpdatingPlan(null);
    setActiveTabSheet("completed");
    triggerToast(isBengali 
      ? `✓ ${updatingPlan.facilityName} এর কাজের এক্সেল বিবরণ সরাসরি সংরক্ষণ করা হয়েছে!` 
      : `✓ Progress sheet logged successfully for ${updatingPlan.facilityName}!`);
  };

  // PRINT FORM VIEW DISPLAY GENERATOR MODAL ("ক্লিক করে ফরম চলে আসবে")
  const [activeFormPrintItem, setActiveFormPrintItem] = useState<any | null>(null);

  // WhatsApp Messaging states
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [selectedWhatsAppContact, setSelectedWhatsAppContact] = useState("");
  const [customWhatsAppMessage, setCustomWhatsAppMessage] = useState("");
  const [activeWhatsAppTab, setActiveWhatsAppTab] = useState<"staff" | "centers">("staff");
  
  // Centers derived from current plans paired with supervisor lookup
  const planCenters = plans.map(p => String((p as any).centerName || '')).filter(name => !!name);
  const uniqueCenters = Array.from(new Set(planCenters)) as string[];
  
  const centerRecipients = uniqueCenters.map((centerName: string) => {
     // match supervisor by facilityName (case-insensitive approximation)
     const sup = supervisors?.find(s => {
       if (!s || !s.facilityName || !centerName) return false;
       const sName = s.facilityName.toLowerCase();
       const cName = centerName.toLowerCase();
       return sName === cName || cName.includes(sName) || sName.includes(cName);
     });
     return { centerName, supervisor: sup };
  });

  // Set default message when contact is selected
  useEffect(() => {
    if (activeWhatsAppTab === "staff") {
      if (selectedWhatsAppContact) {
        const contact = dutyContacts.find(c => c.id === selectedWhatsAppContact);
        if (contact) {
          let msg = isBengali 
            ? `📋 *আল ওয়াফা ষ্টার ডিউটি শিডিউল*\n👤 *যার জন্য:* ${contact.name} (${contact.role})\n\n`
            : `📋 *AL WAFA STAR DUTY SCHEDULE*\n👤 *To:* ${contact.name} (${contact.role})\n\n`;

          const todayPlans = plans.filter(p => p.shift?.toLowerCase() === "today");
          const tomorrowPlans = plans.filter(p => p.shift?.toLowerCase() === "tomorrow");
          const otherPlans = plans.filter(p => p.shift?.toLowerCase() !== "today" && p.shift?.toLowerCase() !== "tomorrow");

          if (todayPlans.length > 0) {
            msg += isBengali ? `*🔴 আজকের কাজ:*\n` : `*🔴 TODAY'S TARGETS:*\n`;
            todayPlans.forEach((p, i) => {
              msg += `${i + 1}. *${p.centerName}*\n   📍 ${p.workAreas}\n`;
            });
            msg += `\n`;
          }

          if (tomorrowPlans.length > 0) {
            msg += isBengali ? `*🔵 আগামীকালের কাজ:*\n` : `*🔵 TOMORROW'S TARGETS:*\n`;
            tomorrowPlans.forEach((p, i) => {
              msg += `${i + 1}. *${p.centerName}*\n   📍 ${p.workAreas}\n`;
            });
            msg += `\n`;
          }

          if (otherPlans.length > 0) {
            msg += isBengali ? `*⚪ অন্যান্য কাজ:*\n` : `*⚪ UPCOMING TARGETS:*\n`;
            otherPlans.forEach((p, i) => {
              msg += `${i + 1}. *${p.centerName}* (${p.shift})\n   📍 ${p.workAreas}\n`;
            });
            msg += `\n`;
          }

          setCustomWhatsAppMessage(msg.trim());
        }
      } else {
        setCustomWhatsAppMessage("");
      }
    }
  }, [selectedWhatsAppContact, plans, dutyContacts, isBengali, activeWhatsAppTab]);

  const handleSendStaffWhatsApp = () => {
    if (!selectedWhatsAppContact || !customWhatsAppMessage) return;
    
    const contact = dutyContacts.find(c => c.id === selectedWhatsAppContact);
    if (!contact) return;
    
    const phoneDigits = contact.phone.replace(/\D/g, "");
    const encodedMessage = encodeURIComponent(customWhatsAppMessage);
    const whatsappUrl = `https://wa.me/${phoneDigits}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  const handleSendCenterWhatsApp = (centerName: string, phone: string) => {
     let centerMsg = isBengali
       ? `আগামীকাল আমরা আপনার সেন্টারে (${centerName}) পেস্ট কন্ট্রোল করার জন্য আসবো।`
       : `Tomorrow we will come to your center (${centerName}) for pest control services.`;
       
     const phoneDigits = phone.replace(/\D/g, "");
     const encodedMessage = encodeURIComponent(centerMsg);
     const whatsappUrl = `https://wa.me/${phoneDigits}?text=${encodedMessage}`;
     window.open(whatsappUrl, '_blank');
  };


  const handleOpenPrintForm = (item: any, type: "plan" | "completed") => {
    setActiveFormPrintItem({
      ...item,
      sheetType: type
    });
  };

  const handleTriggerBrowserPrint = () => {
    const defaultName = `AlWafaStar-Task-${activeFormPrintItem?.ticketNo || activeFormPrintItem?.id || Date.now()}`;
    const customFileName = defaultName;

    document.body.classList.add("pdf-download-active");
    const originalTitle = document.title;
    document.title = customFileName;

    setTimeout(() => {
      window.print();
      setTimeout(() => {
        document.body.classList.remove("pdf-download-active");
        document.title = originalTitle;
      }, 500);
    }, 500);
  };

  // Filter lists based on Search
  const filteredPlans = plans.filter(p => 
    p.facilityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.workAreas && p.workAreas.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (p.reportedIssue && p.reportedIssue.toLowerCase().includes(searchQuery.toLowerCase())) ||
    p.assignedTo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFeed = timelineFeed.filter(f => 
    f.facilityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.postedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (f.workAreas && f.workAreas.toLowerCase().includes(searchQuery.toLowerCase())) ||
    f.doneText.toLowerCase().includes(searchQuery.toLowerCase())
  );



  return (
    <div id="erp-planning-timeline-dashboard" className="space-y-6 pb-16 font-sans antialiased text-slate-900">

      {/* Global Toast Notification */}
      {toastMessage && (
        <div id="timeline-global-toast" className="fixed top-6 right-6 z-[160] bg-slate-900 border border-slate-700 text-white p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-left max-w-sm">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping inline-block" />
          <span className="text-xs font-black">{toastMessage}</span>
        </div>
      )}

      {/* Title Header Panel */}
      <div className="bg-white border-2 border-slate-900 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fadeIn">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[9px] bg-slate-100 text-slate-850 font-mono font-black tracking-widest uppercase px-2.5 py-1 rounded-sm border border-slate-350 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-[#2563EB] animate-pulse" />
              {isBengali ? "রিয়েল-টাইম কাজের খতিয়ান ও এক্সেল ট্র্যাকার" : "LIVE FIELD WORKBOOK"}
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-950 flex items-center gap-2 mt-1">
            <ClipboardList className="w-6.5 h-6.5 text-[#2563EB]" />
            <span>{isBengali ? "পরিকল্পনা ও টাইমলাইন এটেনশন" : "Planning & Timeline Attention"}</span>
          </h1>
          <p className="text-xs text-slate-500 max-w-xl font-semibold">
            {isBengali 
              ? "সুপারভাইজার কর্তৃক নির্ধারিত আজ, আগামীকাল এবং পরশুর রুট প্ল্যান এবং সম্পন্ন হওয়া স্যানিটেশন কাজের এক্সেল স্প্রেডশীট খতিয়ান।"
              : "Supervisor route plans for Today, Tomorrow and After Tomorrow with Excel spreadsheet attention logs."}
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <span className="text-xs bg-slate-950 text-white font-mono font-black px-3.5 py-2 rounded-lg flex items-center gap-2 shadow-xs">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>{plans.length + timelineFeed.length} ROW TOTAL</span>
          </span>
        </div>
      </div>

      {/* Main Grid: Excel Sheets Workbook (Now full page!) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ================= COLUMN 2 (12 COLS): EXCEL SPREADSHEET WORKBOOK ================= */}
        <div className="lg:col-span-12 space-y-4">
          
          {/* Search bar and control row */}
          <div className="bg-white border-2 border-slate-900 p-3 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto relative">
              <span className="text-xs font-black bg-slate-100 px-2 py-1 border border-slate-300 rounded font-mono text-slate-800 shrink-0">
                [GRID VIEW]
              </span>
              <button
                type="button"
                onClick={() => {
                  setTargetFacility("");
                  setInstructionText("");
                  setIsSchedulerOpen(true);
                }}
                className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white text-[10.5px] font-black uppercase rounded-lg border border-blue-600 shadow-xs cursor-pointer transition active:scale-95 inline-flex items-center gap-1.5 font-sans whitespace-nowrap shrink-0"
              >
                <span>➕ {isBengali ? "নতুন কাজের শিডিউল তৈরি করুন" : "Schedule New Route Plan"}</span>
              </button>
              
              <div className="relative flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsContactsOpen(!isContactsOpen)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10.5px] font-black uppercase rounded-lg border border-slate-300 shadow-xs cursor-pointer transition active:scale-95 inline-flex items-center gap-1.5 font-sans whitespace-nowrap shrink-0"
                >
                  <BookUser className="w-4 h-4 text-emerald-600" />
                  <span>{isBengali ? "কন্টাক্টস বুক" : "Contacts"}</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setIsWhatsAppModalOpen(true)}
                  className="px-3 py-2 bg-[#25D366] hover:bg-[#128C7E] text-white text-[10.5px] font-black uppercase rounded-lg shadow-xs cursor-pointer transition active:scale-95 inline-flex items-center gap-1.5 font-sans whitespace-nowrap shrink-0"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.878-.788-1.472-1.742-1.644-2.04-.173-.298-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                  <span>{isBengali ? "সাবমিট" : "Submit"}</span>
                </button>

                {isContactsOpen && (
                  <div className="absolute top-full left-0 mt-2 w-[300px] bg-white border-2 border-slate-900 rounded-xl shadow-2xl z-50 overflow-hidden font-sans">
                    <div className="p-3 bg-slate-900 text-white font-bold text-xs flex justify-between items-center">
                      <span>{isBengali ? "জরুরি কন্টাক্ট লিস্ট" : "Duty Contacts List"}</span>
                      <button onClick={() => setIsContactsOpen(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4"/></button>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto p-2 space-y-2 bg-slate-50">
                      {dutyContacts.map(c => (
                        <div key={c.id} className="flex flex-col bg-white border border-slate-200 rounded p-2 shadow-xs group">
                          <div className="flex justify-between items-start">
                            <div className="flex flex-col">
                               <span className="font-bold text-xs text-slate-800 leading-tight">{c.name}</span>
                               <span className="text-[9.5px] text-slate-500 font-bold uppercase tracking-wide">{c.role}</span>
                            </div>
                            <button onClick={() => handleRemoveContact(c.id)} className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 shrink-0">
                               <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="mt-1.5 flex items-center justify-between">
                             <a href={`tel:${c.phone}`} className="flex items-center gap-1.5 text-[11px] text-[#2563EB] hover:text-blue-700 font-bold bg-blue-50 px-2 py-1 rounded-md transition-colors border border-blue-100">
                                <Phone className="w-3 h-3" />
                                {c.phone}
                             </a>
                          </div>
                        </div>
                      ))}
                      {dutyContacts.length === 0 && (
                        <div className="text-center text-slate-400 text-xs py-4 italic font-medium">{isBengali ? "কোনো নাম্বার নেই" : "No contacts added"}</div>
                      )}
                    </div>
                    <div className="p-3 bg-slate-100 border-t border-slate-200 space-y-2 flex flex-col gap-2">
                      <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{isBengali ? "নতুন নাম্বার সংযুক্ত করুন" : "Add New Contact"}</div>
                      <div className="flex gap-2">
                        <input type="text" placeholder="Name" value={newContactName} onChange={(e) => setNewContactName(e.target.value)} className="w-full text-[11px] font-medium border border-slate-300 px-2.5 py-1.5 rounded-md outline-none focus:border-blue-500 placeholder-slate-400" />
                        <select value={newContactRole} onChange={(e) => setNewContactRole(e.target.value)} className="text-[11px] font-medium border border-slate-300 px-2 py-1.5 rounded-md outline-none focus:border-blue-500 cursor-pointer bg-white text-slate-700">
                           <option value="Technician">Tech</option>
                           <option value="Supervisor">Supvr</option>
                           <option value="Driver">Driver</option>
                           <option value="Manager">Manager</option>
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <input type="tel" placeholder="Phone Number" value={newContactPhone} onChange={(e) => setNewContactPhone(e.target.value)} className="w-full text-[11px] font-medium border border-slate-300 px-2.5 py-1.5 rounded-md outline-none focus:border-blue-500 placeholder-slate-400" />
                        <button onClick={handleAddContact} className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-md font-black text-[11px] flex items-center justify-center gap-1 shrink-0 transition-colors cursor-pointer shadow-sm">
                           <Plus className="w-3.5 h-3.5" /> Add
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isBengali ? "হাসপাতাল বা টেকনিশিয়ান নাম খুঁজুন..." : "Filter worksheet records..."}
                className="w-full bg-slate-50 border border-slate-350 px-3 py-1.5 text-xs rounded font-bold outline-none font-mono placeholder:text-slate-400 focus:border-[#2563EB]"
              />
            </div>
          </div>

          {/* EXCEL SHEET WORKBOOK SHEETS TABS CONTROL */}
          <div className="bg-white border-2 border-slate-900 rounded-lg overflow-hidden shadow-2xs">
            
            {/* Sheet Tabs */}
            <div className="bg-slate-100 border-b-2 border-slate-900 flex select-none text-[10.5px] font-black uppercase text-slate-700">
              <button
                type="button"
                onClick={() => setActiveTabSheet("plans")}
                className={`py-2 px-4 border-r border-slate-300 flex items-center gap-2 font-mono transition-none cursor-pointer ${
                  activeTabSheet === "plans" 
                    ? "bg-white text-slate-950 border-t-4 border-t-indigo-600 font-extrabold" 
                    : "hover:bg-slate-200"
                }`}
              >
                📄 Sheet 1: Scheduled Plans ({filteredPlans.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTabSheet("completed")}
                className={`py-2 px-4 border-r border-slate-300 flex items-center gap-2 font-mono transition-none cursor-pointer ${
                  activeTabSheet === "completed" 
                    ? "bg-white text-slate-950 border-t-4 border-t-[#2563EB] font-extrabold" 
                    : "hover:bg-slate-200"
                }`}
              >
                ✔ Sheet 2: Completed Timeline Logs ({filteredFeed.length})
              </button>
            </div>

            {/* SHEET CONTENT AREA - HIGH FIDELITY COMPACT SPREADSHEET */}
            <div className="p-3 bg-white overflow-x-auto min-h-[480px]">

              {/* SHEET 1: ACTIVE PLANS EXCEL */}
              {activeTabSheet === "plans" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">
                      * Al Wafa Star Professional Duty Schedule Grid Table
                    </span>
                    <span className="text-[9.5px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border font-black uppercase font-mono">
                      Total: {filteredPlans.length} records
                    </span>
                  </div>

                  <table className="w-full text-left border-collapse border border-slate-300 font-mono text-[10.5px] select-text">
                    <thead>
                      <tr className="bg-slate-50/80 text-slate-700">
                        <th className="border border-slate-300 p-1 bg-slate-100 font-extrabold text-center w-8">A</th>
                        <th className="border border-slate-300 p-1.5 font-black uppercase text-slate-950">Plan ID / Center Name</th>
                        <th className="border border-slate-300 p-1.5 font-black uppercase text-slate-950">Shift</th>
                        <th className="border border-slate-300 p-1.5 font-black uppercase text-slate-950">{isBengali ? "কাজের স্থান" : "Work Areas"}</th>
                        <th className="border border-slate-300 p-1.5 font-black uppercase text-slate-950">Reported Problem</th>
                        <th className="border border-slate-300 p-1.5 font-black uppercase text-slate-950 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPlans.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="border border-slate-300 p-8 text-center text-slate-400 select-none italic font-sans text-xs">
                            {isBengali ? "কোনো সক্রিয় রুট পরিকল্পনা মেলেনি!" : "No scheduled excel entries found."}
                          </td>
                        </tr>
                      ) : (
                        filteredPlans.map((plan, index) => {
                          const isSelected = selectedPlanRow === plan.id;
                          const isCompleted = plan.status === "Completed" || plan.status === "Partially Completed";
                          
                          return (
                            <React.Fragment key={plan.id}>
                              <tr 
                                onClick={() => setSelectedPlanRow(isSelected ? null : plan.id)}
                                className={`group border-b border-slate-300 transition-colors cursor-pointer text-slate-900 ${
                                  isCompleted ? "bg-emerald-50/40 hover:bg-emerald-50" : 
                                  isSelected ? "bg-indigo-50/80 hover:bg-indigo-100/30" : "hover:bg-slate-50"
                                }`}
                              >
                                {/* Spreadsheet cell reference index */}
                                <td className="border border-slate-300 p-1 bg-slate-100/60 font-bold text-center text-slate-500 w-8 select-none">
                                  {index + 1}
                                </td>

                                {/* ID and Hospital Name */}
                                <td className="border border-slate-300 p-2 max-w-xs font-bold">
                                  <div className="font-mono text-[9px] text-[#2563EB] font-black">{plan.id}</div>
                                  <div className="font-sans font-black text-slate-950 leading-snug">{plan.facilityName}</div>
                                  <div className="text-[9px] text-slate-400 font-sans mt-0.5 font-bold">Assigned: <span className="text-slate-700 underline">{plan.assignedTo}</span></div>
                                </td>

                                {/* Target Scheduled Shift Frame */}
                                <td className="border border-slate-300 p-2 font-extrabold">
                                  <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-sans font-black uppercase ${
                                    plan.dateFrame === "Today" ? "bg-emerald-600/10 text-emerald-800" :
                                    plan.dateFrame === "Tomorrow" ? "bg-amber-500/10 text-amber-800" :
                                    "bg-indigo-50 text-indigo-700"
                                  }`}>
                                    {isBengali ? (
                                      plan.dateFrame === "Today" ? "আজ" :
                                      plan.dateFrame === "Tomorrow" ? "আগামীকাল" : "পরশু"
                                    ) : plan.dateFrame}
                                  </span>
                                </td>

                                {/* Areas where control must occur */}
                                <td className="border border-slate-300 p-2 font-semibold text-slate-705 leading-snug font-sans whitespace-pre-wrap break-words min-w-[120px]" title={plan.workAreas}>
                                  {plan.workAreas || "-"}
                                </td>

                                {/* Specific problem recorded */}
                                <td className="border border-slate-300 p-2 text-slate-900 font-bold leading-snug font-sans whitespace-pre-wrap break-words min-w-[180px]" title={plan.instructionText || plan.notes || plan.reportedIssue}>
                                  {plan.instructionText || plan.notes || plan.reportedIssue || "-"}
                                </td>

                                {/* Quick buttons */}
                                <td className="border border-slate-300 p-1.5 text-center" onClick={(e) => e.stopPropagation()}>
                                  <div className="flex justify-center items-center gap-1">
                                    {/* Direct line to Daily Entry Form */}
                                    {!isCompleted ? (
                                      <button
                                        type="button"
                                        id={`btn-rpt-${plan.id}`}
                                        title={isBengali ? "ডেইলি রিপোর্ট ফর্মে যান" : "Go to Daily Entry Form Sheet"}
                                        onClick={() => handleGoToFormForPlan(plan)}
                                        className="p-1 px-2.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded font-sans font-black text-[9.5px] uppercase tracking-wider cursor-pointer active:scale-95 transition flex items-center gap-0.5"
                                      >
                                        <span>📝</span>
                                        <span>{isBengali ? "ফর্ম" : "FORM"}</span>
                                      </button>
                                    ) : (
                                      <span className="text-emerald-700 font-sans font-black flex items-center gap-0.5 text-[9px] shrink-0">
                                        ✔ DONE
                                      </span>
                                    )}

                                    {/* Print report form pop-up */}
                                    <button
                                      type="button"
                                      title="Open Form / Sheet Details"
                                      onClick={() => handleOpenPrintForm(plan, "plan")}
                                      className="p-1 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded border border-indigo-200 cursor-pointer"
                                    >
                                      📄
                                    </button>

                                    {/* Delete Row button */}
                                    <button
                                      type="button"
                                      title="Remove Plan"
                                      onClick={() => handleDeletePlan(plan.id, plan.facilityName)}
                                      className="p-1 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded border border-rose-200 cursor-pointer"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                </td>
                              </tr>

                              {/* Accordion Sub-row: Click Row Details ("EXCEL sheet cells") */}
                              {isSelected && (
                                <tr className="bg-slate-50/50">
                                  <td className="border border-slate-300 p-1 bg-slate-200 text-center select-none font-bold text-slate-500">
                                    +
                                  </td>
                                  <td colSpan={5} className="border border-slate-300 p-3.5 text-left font-sans space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="space-y-1 bg-white p-2.5 rounded border">
                                        <b className="text-[10px] text-indigo-700 uppercase tracking-widest font-mono block">📍 {isBengali ? "কোথায় কোথায় কাজ করতে হবে:" : "Work Areas To Treat:"}</b>
                                        <p className="text-xs font-black text-slate-900 leading-relaxed bg-slate-50 p-2 rounded">{plan.workAreas || "Not Specified"}</p>
                                      </div>

                                      <div className="space-y-1 bg-white p-2.5 rounded border">
                                        <b className="text-[10px] text-[#2563EB] uppercase tracking-widest font-mono block">⚠️ {isBengali ? "কী সমস্যা হয়েছে:" : "Reported Problem:"}</b>
                                        <p className="text-xs font-black text-slate-900 leading-relaxed bg-rose-50/20 p-2 rounded">{plan.instructionText || plan.notes || plan.reportedIssue || "Not Specified"}</p>
                                      </div>
                                    </div>

                                    <div className="space-y-2.5 bg-white p-3 rounded border">
                                      <div className="flex justify-between items-center border-b pb-1.5">
                                        <span className="text-[10px] text-slate-550 font-black font-mono">SPECIFIED ASSIGNED PRESCRIPTIONS & TASKS:</span>
                                        <span className="text-[9px] bg-indigo-100 text-indigo-850 font-mono font-bold px-1.5 rounded">{plan.tasks.length} Duties</span>
                                      </div>
                                      <div className="flex flex-wrap gap-1.5">
                                        {plan.tasks.map((t, idx) => (
                                          <span key={idx} className="text-xs font-black bg-slate-100 text-slate-800 border-2 border-slate-200 py-1 px-2.5 rounded-lg">
                                            ✓ {t}
                                          </span>
                                        ))}
                                      </div>
                                      {plan.notes && (
                                        <div className="p-2.5 bg-[#FFFBEB] text-[#92400E] text-xs font-bold rounded-lg mt-2 leading-relaxed italic border border-[#FDE68A]">
                                          "নির্দেশনা: {plan.notes}"
                                        </div>
                                      )}
                                    </div>

                                    <div className="flex justify-end gap-2 pt-2">
                                      <button
                                        type="button"
                                        onClick={() => handleOpenPrintForm(plan, "plan")}
                                        className="p-1 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded font-black text-[10px] uppercase flex items-center gap-1 cursor-pointer"
                                      >
                                        <Printer className="w-3.5 h-3.5 text-emerald-400" />
                                        <span>{isBengali ? "ফরম দেখুন ও প্রিন্ট" : "View Report sheet & Print"}</span>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* SHEET 2: COMPLETED TIMELINE TIMELINE FEED */}
              {activeTabSheet === "completed" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <span className="text-[10px] font-mono text-slate-500 block uppercase font-bold">
                      * {isBengali ? "সম্পন্ন কাজের এক্সেল বিবরণ" : "Completed Services Timeline logs"}
                    </span>
                    <span className="text-[9.5px] text-[#2563EB] bg-blue-50 px-2.5 py-1 rounded-lg border-2 border-blue-200 font-black uppercase font-mono">
                      {isBengali ? "সংরক্ষিত সেন্টার:" : "Archived Logs:"} {filteredFeed.length}
                    </span>
                  </div>

                  {filteredFeed.length === 0 ? (
                    <div className="border border-dashed border-slate-200 p-12 text-center text-slate-400 select-none italic font-sans text-xs rounded-xl bg-slate-50">
                      {isBengali ? "কোনো সম্পন্ন সার্ভিস খতিয়ান পাওয়া যায়নি!" : "No archived completed timelines yet."}
                    </div>
                  ) : (
                    <div className="space-y-3 font-sans">
                      {filteredFeed.map((feed) => {
                        // Extract localized values
                        const timing = feed.timestamp.includes("Tomorrow") || feed.timestamp.toLowerCase().includes("tomorrow") || feed.dateFrame?.includes("Tomorrow") ? "Tomorrow" : "Today";
                        const isTom = feed.dateFrame === "Tomorrow" || timing === "Tomorrow";
                        const timingBn = isTom ? "আগামীকাল" : (feed.dateFrame === "Today" ? "আজ" : "পরশু");
                        const timingEn = feed.dateFrame || timing;

                        const loc = feed.locationType || feed.workAreas || "Inside";
                        const locBn = loc.toLowerCase().includes("outside") ? "আউটসাইড" : 
                                      loc.toLowerCase().includes("both") ? "ইনসাইড ও আউটসাইড" : "ইনসাইড";
                        const locEn = loc;

                        return (
                          <div 
                            key={feed.id} 
                            className="w-full bg-slate-900 border-2 border-slate-950 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between text-slate-100 shadow-sm gap-4 transition hover:shadow-md"
                          >
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                              {/* Hospital Name with beautiful custom layout */}
                              <div className="flex items-center gap-2.5">
                                <span className="text-xl">🏥</span>
                                <span className="font-sans font-black text-sm tracking-tight text-white capitalize">
                                  {feed.facilityName}
                                </span>
                              </div>

                              {/* Day Period Indicator Badge */}
                              <div className="flex items-center gap-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full text-[11px] font-black uppercase font-mono">
                                <span className="text-xs">📅</span>
                                <span>{isBengali ? timingBn : timingEn}</span>
                              </div>

                              {/* Location Scope Indicator Badge */}
                              <div className="flex items-center gap-1.5 bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/20 px-3 py-1 rounded-full text-[11px] font-black uppercase font-mono">
                                <span className="text-xs">🚪</span>
                                <span>{isBengali ? locBn : locEn}</span>
                              </div>
                            </div>

                            {/* Control operations aligned perfectly to the right */}
                            <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t border-slate-800 pt-3 sm:pt-0 sm:border-0 shrink-0">
                              <button
                                type="button"
                                title="Open Service Voucher Form"
                                onClick={() => handleOpenPrintForm(feed, "completed")}
                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-sans font-black text-[10px] rounded-lg tracking-wider cursor-pointer uppercase transition-all flex items-center gap-1.5"
                              >
                                <span>📄</span>
                                <span>{isBengali ? "ফরম দেখুন" : "View Voucher"}</span>
                              </button>
                              <button
                                type="button"
                                title="Delete records"
                                onClick={() => handleDeleteTimelineEntry(feed.id)}
                                className="p-1 px-2.5 bg-red-600/10 hover:bg-red-650 text-red-400 hover:text-white rounded-lg transition-all border border-red-650/20 cursor-pointer"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Informative Spreadsheet Tips */}
              <div className="mt-4 p-3 bg-slate-50 border border-slate-300 rounded text-[10.5px] text-slate-500 leading-relaxed font-bold font-sans">
                💡 <span className="text-slate-800">{isBengali ? "এক্সেল নির্দেশক:" : "Worksheet Note:"}</span>{" "}
                {isBengali 
                  ? "যেকোনো সারিতে ক্লিক করলে স্যানিটারি কাজের বিস্তারিত খতিয়ান সেলের তথ্য দেখা যাবে এবং PDF ভিউ তথা প্রিন্টআউট ফরমের বাটন প্রদর্শিত হবে।"
                  : "Click any route or attention Row to inspect cell information, view check list reports, and open standard Clinical Service Forms for printing."}
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* ================= 📲 WHATSAPP MESSAGING MODAL ================= */}
      {isWhatsAppModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm transition-all duration-200 animate-fadeIn font-sans">
          <div className="bg-white border-2 border-slate-900 rounded-2xl max-w-md w-full flex flex-col shadow-2xl relative overflow-hidden animate-scale-up">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center border-b-4 border-emerald-500">
              <h3 className="font-black text-sm uppercase tracking-wider flex items-center gap-2">
                <span className="text-emerald-400">💬</span> 
                {isBengali ? "হোয়াটসঅ্যাপ মেসেজ পাঠান" : "Send WhatsApp Message"}
              </h3>
              <button 
                onClick={() => setIsWhatsAppModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex border-b border-slate-200">
              <button 
                onClick={() => setActiveWhatsAppTab("staff")}
                className={`flex-1 py-3 text-xs font-bold uppercase transition-colors pointer-events-auto cursor-pointer ${activeWhatsAppTab === "staff" ? 'border-b-2 border-emerald-500 text-emerald-600 bg-emerald-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                {isBengali ? "স্টাফদের মেসেজ" : "Staff Message"}
              </button>
              <button 
                onClick={() => setActiveWhatsAppTab("centers")}
                className={`flex-1 py-3 text-xs font-bold uppercase transition-colors pointer-events-auto cursor-pointer ${activeWhatsAppTab === "centers" ? 'border-b-2 border-emerald-500 text-emerald-600 bg-emerald-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                {isBengali ? "সেন্টারদের নোটিফিকেশন" : "Center Notification"}
              </button>
            </div>

            <div className="p-5 space-y-4 bg-slate-50 max-h-[60vh] overflow-y-auto">
              {activeWhatsAppTab === "staff" ? (
                <>
                  {/* Select Contact */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex justify-between">
                      <span>{isBengali ? "কন্টাক্ট পার্সন (যাকে পাঠাবেন)" : "Recipient Contact"}</span>
                    </label>
                    <select 
                      className="w-full border-2 border-slate-200 rounded-lg px-3 py-2.5 text-sm font-bold text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none bg-white cursor-pointer"
                      value={selectedWhatsAppContact}
                      onChange={(e) => setSelectedWhatsAppContact(e.target.value)}
                    >
                      <option value="" disabled>{isBengali ? "লিস্ট থেকে কন্টাক্ট সিলেক্ট করুন..." : "Select a contact..."}</option>
                      {dutyContacts.map((c) => (
                        <option key={c.id} value={c.id}>{c.name} ({c.role}) - {c.phone}</option>
                      ))}
                    </select>
                    {dutyContacts.length === 0 && (
                       <p className="text-[10px] text-rose-500 font-bold">{isBengali ? "লিস্টে কোনো নাম্বার এড নেই। উপরের কন্টাক্ট আইকনে গিয়ে নাম্বার এড করুন।" : "No contacts available. Add contacts first."}</p>
                    )}
                  </div>

                  {/* Message Box */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      {isBengali ? "মেসেজ লিখুন (কাস্টমাইজ করতে পারবেন)" : "Message Content"}
                    </label>
                    <textarea 
                      className="w-full border-2 border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none bg-white min-h-[170px] resize-y"
                      value={customWhatsAppMessage}
                      onChange={(e) => setCustomWhatsAppMessage(e.target.value)}
                      placeholder={isBengali ? "এখানে আপনার মেসেজ লিখুন..." : "Type your message..."}
                    ></textarea>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                   <p className="text-[11.5px] text-slate-500 font-bold mb-2">
                     {isBengali ? "আজ এবং আগামীকালের সিডিউল করা সেন্টারগুলোতে নোটিফিকেশন পাঠান।" : "Send notification to currently scheduled centers."}
                   </p>
                   {centerRecipients.length === 0 ? (
                     <div className="text-center text-slate-400 text-xs italic font-bold p-6 bg-white rounded-lg border border-slate-200">{isBengali ? "কোনো সেন্টার সিডিউল করা নেই।" : "No centers scheduled."}</div>
                   ) : (
                     centerRecipients.map((cr, idx) => (
                       <div key={idx} className="bg-white border text-left border-slate-200 rounded-lg p-3 flex flex-col gap-2 shadow-sm pointer-events-auto">
                         <div>
                            <span className="font-bold text-slate-800 text-[13px] block">{cr.centerName}</span>
                            {cr.supervisor ? (
                               <span className="text-[10px] font-black text-emerald-600 block mt-0.5">{isBengali ? "সুপারভাইজার:" : "Supervisor:"} {cr.supervisor.name} {cr.supervisor.phone ? `(${cr.supervisor.phone})` : ''}</span>
                            ) : (
                               <span className="text-[10px] font-black text-rose-500 block mt-0.5">{isBengali ? "ডিরেক্টরিতে নাম্বার পাওয়া যায়নি" : "Not found in directory"}</span>
                            )}
                         </div>
                         <button 
                           disabled={!cr.supervisor || !cr.supervisor.phone}
                           onClick={() => handleSendCenterWhatsApp(cr.centerName, cr.supervisor?.phone || "")}
                           className="mt-1 w-full flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#128C7E] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold text-[11px] py-2 rounded-lg transition-colors cursor-pointer"
                         >
                           <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.878-.788-1.472-1.742-1.644-2.04-.173-.298-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                           {isBengali ? "মেসেজ পাঠান" : "Notify Center"}
                         </button>
                       </div>
                     ))
                   )}
                </div>
              )}
            </div>

            <div className="p-4 bg-white border-t border-slate-200 flex justify-end gap-3 pointer-events-auto">
              <button 
                onClick={() => setIsWhatsAppModalOpen(false)}
                className="px-4 py-2 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer text-[11px] uppercase"
              >
                {isBengali ? (activeWhatsAppTab === "staff" ? "বাতিল" : "বন্ধ করুন") : (activeWhatsAppTab === "staff" ? "Cancel" : "Close")}
              </button>
              {activeWhatsAppTab === "staff" && (
                <button 
                  onClick={handleSendStaffWhatsApp}
                  disabled={!selectedWhatsAppContact || !customWhatsAppMessage}
                  className="px-5 py-2 font-black text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-md transition-all cursor-pointer text-[11px] uppercase flex items-center gap-2"
                >
                   {isBengali ? "হোয়াটসঅ্যাপে পাঠান" : "Send WhatsApp"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= ⚙️ HIGH-FIDELITY DTC PROGRESS SUBMISSION POP-UP OVERLAY ================= */}
      {isModalOpen && updatingPlan && (
        <div id="dtc-progress-overlay-container" className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm transition-all duration-200 animate-fadeIn text-left text-slate-900 font-sans">
          
          <div className="bg-white border-2 border-slate-900 rounded-2xl max-w-xl w-full flex flex-col shadow-2xl relative overflow-hidden text-sm border-t-8 border-t-[#2563EB] animate-scale-up">
            
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-1.5 font-sans font-black text-xs uppercase tracking-widest text-slate-100">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>INITIALIZE PROGRESS UPDATE (DTC CODE)</span>
              </div>
              <button
                type="button"
                onClick={() => { setIsModalOpen(false); setUpdatingPlan(null); }}
                className="p-1 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-xs select-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Target Clinic Details */}
            <div className="bg-slate-50 border-b border-slate-200 p-4 space-y-1">
              <span className="text-[9.5px] uppercase font-mono tracking-wider font-extrabold text-[#2563EB] block">TARGET HEALTH CLINIC ENTRANCE:</span>
              <h3 className="text-[13px] font-black text-[#1E293B] font-sans">
                {updatingPlan.facilityName}
              </h3>
              <div className="grid grid-cols-2 gap-2 text-[10.5px] text-slate-500 pt-1 font-bold">
                <div>{isBengali ? "📌 কোথায় কাজ:" : "📌 Work Areas:"} <span className="text-slate-800 font-black">{updatingPlan.workAreas || "-"}</span></div>
                <div>{isBengali ? "⚠️ সমস্যা:" : "⚠️ Problem:"} <span className="text-slate-800 font-black">{updatingPlan.reportedIssue || "-"}</span></div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 md:p-6 space-y-4 overflow-y-auto max-h-[50vh] text-xs">
              
              {/* Done Checklist Text Field */}
              <div className="space-y-1">
                <label className="text-slate-900 block text-[11px] font-black uppercase">
                  {isBengali ? "✓ কি কি কাজ সম্পন্ন করা হয়েছে:" : "✓ Tasks Completed:"}
                </label>
                <textarea
                  id="dtc-done-textarea"
                  value={tasksDoneText}
                  onChange={(e) => setTasksDoneText(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-250 rounded-xl py-2 px-3 h-20 outline-none focus:border-[#2563EB] font-sans font-extrabold text-xs leading-relaxed"
                  placeholder={isBengali ? "যেমন: এলাকা স্প্রে করা হয়েছে..." : "E.g. Spraying completed in rooms..."}
                />
              </div>

              {/* Pending Checklist Text Field */}
              <div className="space-y-1">
                <label className="text-slate-900 block text-[11px] font-black uppercase">
                  {isBengali ? "⚠ কি কি কাজ বাকি রয়েছে:" : "⚠ Tasks Pending:"}
                </label>
                <textarea
                  id="dtc-pending-textarea"
                  value={tasksPendingText}
                  onChange={(e) => setTasksPendingText(e.target.value)}
                  className="w-full bg-rose-50/10 border-2 border-slate-250 text-slate-800 rounded-xl py-2 px-3 h-16 outline-none focus:border-red-500 font-sans font-extrabold text-xs leading-relaxed text-left"
                />
              </div>

              {/* Exact Bengali prompt template layout block */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-[#2563EB] block flex items-center gap-1 font-black">
                  ⚙️ {isBengali ? "কুইক টেম্পলেট সিলেক্ট" : "QUICK CHOOSE TEMPLATE"}
                </span>
                <div className="grid grid-cols-1 gap-1.5">
                  {quickChooseTemplates.map((tmpl) => {
                    const isSelected = selectedTemplate === tmpl.label;
                    return (
                      <button
                        type="button"
                        key={tmpl.id}
                        id={`btn-tmpl-${tmpl.id}`}
                        onClick={() => handleSelectQuickTemplate(tmpl)}
                        className={`w-full text-left p-2.5 rounded-lg border text-[10.5px] font-extrabold leading-relaxed transition ${
                          isSelected 
                            ? "bg-indigo-50 border-[#2563EB] text-[#2563EB] font-black" 
                            : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                        }`}
                      >
                        {tmpl.label}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Modal Actions Footer */}
            <div className="bg-slate-50 border-t border-slate-200 p-4 flex flex-col sm:flex-row gap-2 justify-end">
              <button
                type="button"
                id="btn-cancel-dtc"
                onClick={() => { setIsModalOpen(false); setUpdatingPlan(null); }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer text-center text-xs"
              >
                {isBengali ? "বাতিল" : "Cancel"}
              </button>

              <button
                type="button"
                id="btn-partial-dtc"
                onClick={() => handleSubmitProgress(true)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-450 text-slate-950 font-black rounded-xl cursor-pointer text-center text-xs"
              >
                {isBengali ? "আংশিক কাজ" : "File Partial Work"}
              </button>

              <button
                type="button"
                id="btn-complete-dtc"
                onClick={() => handleSubmitProgress(false)}
                className="px-4 py-2 bg-[#2563EB] hover:bg-blue-600 text-white font-black rounded-xl cursor-pointer text-center text-xs"
              >
                {isBengali ? "কাজ সমাপ্ত ও সেভ" : "Complete & Save"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= 📝 PRINT FORM VIEW DISPLAY GENERATOR MODAL ("ক্লিক করে ফরম চলে আসবে") ================= */}
      {activeFormPrintItem && (
        <div id="print-form-modal-overlay" className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border-2 border-slate-950 rounded-2xl max-w-2xl w-full flex flex-col shadow-2xl relative overflow-hidden max-h-[90vh]">
            
            {/* Modal Toolbar Header */}
            <div className="bg-slate-900 border-b border-slate-800 p-3 flex justify-between items-center text-white shrink-0">
              <div className="flex items-center gap-2 text-xs font-mono font-black text-amber-400">
                <span>📄 {language === 'bn' ? "অফিসিয়াল মেডিকেল স্যানিটেশন রিপোর্ট" : "REGULATION SERVICE CLINICAL STATEMENT"}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTriggerBrowserPrint}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 rounded text-[10.5px] font-black uppercase text-white flex items-center gap-1 cursor-pointer select-none"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? "প্রিন্ট" : "Print PDF"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFormPrintItem(null)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 hover:text-white font-bold text-[11px] cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>
            </div>

            {/* Print Area inside Modal Body styled like standard official document */}
            <div id="clinical-printout-sheet" className="p-8 space-y-6 overflow-y-auto font-sans text-xs text-slate-950 bg-white leading-relaxed select-text text-left">
              
              {/* Letterhead */}
              <div className="border-b-4 border-slate-900 pb-4 flex justify-between items-start">
                <div className="space-y-1">
                  <h2 className="text-xl font-extrabold tracking-tight text-slate-950">AL WAFA STAR PEST CONTROL SERVICES</h2>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">
                    APPROVED SANITIZATION CONTRACTOR BY MOH & DUBAI MUNICIPIALITIES
                  </p>
                  <p className="text-[9.5px] text-slate-400 font-mono">TEL: +971 6 565 XXXXX | EMAIL: safe.control@alwafastar.ae</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-[#2563EB] select-none tracking-widest bg-slate-100 p-1.5 rounded-lg border border-slate-300 font-mono inline-block">
                    ★ AL WAF STAR
                  </div>
                  <p className="text-[9px] text-slate-450 font-mono mt-1 font-bold">ERP-DOCREF: {activeFormPrintItem.id}</p>
                </div>
              </div>

              {/* Clinic & Facility Account Details */}
              <div className="bg-slate-50 border border-slate-300 p-3 roundedGrid p-4 rounded-xl grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-mono font-bold text-slate-400 block">CLINICAL SUITE FACILITY:</span>
                  <p className="text-[12.5px] font-black text-slate-950">{activeFormPrintItem.facilityName}</p>
                  <p className="text-[10.5px] font-bold text-slate-600">Assigned Official: <span className="text-slate-900 underline font-black">{activeFormPrintItem.assignedTo || activeFormPrintItem.postedBy}</span></p>
                </div>
                <div className="space-y-1 border-l-2 border-slate-200 pl-4 font-mono text-[10px] font-bold">
                  <div><b>REFERENCE TICKET:</b> #{activeFormPrintItem.id}</div>
                  <div><b>VISIT SHIFT:</b> {activeFormPrintItem.dateFrame || "Archived Visit Log"}</div>
                  <div><b>LOGSTAMP:</b> {activeFormPrintItem.timestamp || "Active planned route window"}</div>
                </div>
              </div>

              {/* CORE FIELDS: কোথায় কোথায় কাজ ও কী সমস্যা হয়েছে */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-2 border-slate-900 p-3 rounded-lg space-y-1.5">
                  <b className="text-[10.5px] font-black text-slate-950 uppercase tracking-wide block border-b pb-1 font-mono">
                    📍 {isBengali ? "কোথায় কোথায় কাজ করতে হবে / হয়েছে:" : "WORK AREAS:"}
                  </b>
                  <p className="font-extrabold text-[#111827] text-xs">
                    {activeFormPrintItem.workAreas || "সম্পূর্ণ হসপিটাল এরিয়া ও নির্ধারিত পাইপ স্লিভস।"}
                  </p>
                </div>

                <div className="border-2 border-rose-900/50 p-3 rounded-lg bg-rose-50/5 space-y-1.5">
                  <b className="text-[10.5px] font-black text-rose-900 uppercase tracking-wide block border-b pb-1 font-mono">
                    ⚠️ {isBengali ? "কী সমস্যা নথিভুক্ত হয়েছে:" : "REPORTED ISSUE:"}
                  </b>
                  <p className="font-extrabold text-[#111827] text-xs">
                    {activeFormPrintItem.reportedIssue || "অতিরিক্ত ময়লা এবং বেকিং কর্নারে পোকামাকড়ের উৎপাত।"}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase text-slate-900 border-b-2 border-slate-900 pb-1 font-mono">
                  I. CLINICAL PEST TREATMENT STATEMENT & TASKS FULFILLMENT:
                </h3>
                <div className="grid grid-cols-1 gap-2 bg-slate-50 p-3 rounded">
                  {activeFormPrintItem.tasks ? (
                    <div>
                      <p className="text-[9.5px] text-slate-450 uppercase font-mono font-bold">PRESCRIPTION CHECKLIST FOR STAFF:</p>
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        {activeFormPrintItem.tasks.map((tk: string, i: number) => (
                          <span key={i} className="bg-white border text-xs px-2 py-0.5 rounded-md font-bold font-mono">
                            ☑ {tk}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div>
                        <span className="text-[9px] uppercase font-mono font-black text-emerald-800">✓ COMPLETED SANITIZATION WORK DETAIL:</span>
                        <p className="text-xs font-extrabold text-slate-900 mt-0.5 bg-white p-2 border rounded whitespace-pre-line leading-relaxed">
                          {activeFormPrintItem.doneText || "কাজের নির্ধারিত এলাকায় পেস্ট কন্ট্রোল জেল প্রয়োগ ও স্প্রে সফলভাবে সম্পন্ন করা হয়েছে।"}
                        </p>
                      </div>

                      <div>
                        <span className="text-[9px] uppercase font-mono font-black text-rose-600">⚠ PENDING / CRITICAL REMAINING NOTES:</span>
                        <p className="text-xs font-bold text-slate-700 mt-0.5 bg-white p-2 border rounded whitespace-pre-line leading-relaxed italic">
                          {activeFormPrintItem.pendingText || "কোনো বকেয়া কাজ বা উপদ্রব অবশিষ্ট নেই।"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Chemical Approvals Table */}
              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase text-slate-900 border-b-2 border-slate-900 pb-1 font-mono">
                  II. MOCCAE CLINICAL CHEMICAL PRESCRIPTION APPROVAL:
                </h3>
                <table className="w-full text-left font-mono text-[9px] border border-slate-350">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border p-1">PRESCRIPTION PRODUCT</th>
                      <th className="border p-1">MOH LICENSE NO</th>
                      <th className="border p-1">QTY DOSAGE</th>
                      <th className="border p-1">SAFETY TARGET STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-1 font-bold">Target Cockroach Bait Gel V4</td>
                      <td className="border p-1">MOH-APP-92-DUBAI</td>
                      <td className="border p-1">45 ml / spot</td>
                      <td className="border p-1 text-emerald-700 font-bold">APPROVED & APPLIED</td>
                    </tr>
                    <tr>
                      <td className="border p-1 font-bold">EcoSan Biological Inhaler</td>
                      <td className="border p-1">MOH-APP-105-SHJ</td>
                      <td className="border p-1">100g / drain sleeves</td>
                      <td className="border p-1 text-emerald-700 font-bold">APPROVED & APPLIED</td>
                    </tr>
                  </tbody>
				</table>
			  </div>

              {/* Remarks/Signatures Column */}
              <div className="pt-8 border-t border-slate-200 grid grid-cols-3 gap-6 font-mono text-[9px] font-bold text-slate-600">
                <div className="space-y-8 flex flex-col justify-between">
                  <span>CLIENT DISPATCH STAMP:</span>
                  <div className="border-t border-dashed border-slate-400 pt-1 text-center font-sans font-black text-slate-950 uppercase">
                    CLINICAL MANAGEMENT ACK
                  </div>
                </div>

                <div className="space-y-8 flex flex-col justify-between items-center text-center">
                  <span>AL WAFA STAR LICENSED SEAL:</span>
                  <div className="w-16 h-16 rounded-full border-4 border-double border-blue-600/60 font-sans flex items-center justify-center p-1 text-[8.5px] text-blue-700 font-black rotate-[-12deg] select-none shrink-0 pointer-events-none">
                    AL WAFA STAR APPROVED
                  </div>
                </div>

                <div className="space-y-8 flex flex-col justify-between">
                  <span>DISPATCHED LICENSED OFFICER:</span>
                  <div className="border-t border-dashed border-slate-400 pt-1 text-center font-sans font-black text-slate-950 uppercase">
                    {activeFormPrintItem.assignedTo || activeFormPrintItem.postedBy || "Hamdy (Supervisor)"}
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Actions Footer */}
            <div className="bg-slate-50 border-t border-slate-200 p-3.5 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setActiveFormPrintItem(null)}
                className="px-6 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-950 text-white rounded-lg font-black text-xs uppercase cursor-pointer"
              >
                ✕ Close Sheet View
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= MODAL EDITOR: SCHEDULER NEW ROUTE DUTY ================= */}
      {isSchedulerOpen && (
        <div id="schedule-new-route-duty-modal" className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs select-none animate-fadeIn font-sans">
          <div className="bg-white max-w-lg w-full rounded-2xl overflow-hidden shadow-2xl border-t-8 border-indigo-600 animate-scaleIn text-slate-800 flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-100 bg-gradient-to-br from-indigo-5 to-indigo-50/50 flex justify-between items-start flex-none">
              <div className="space-y-1">
                <span className="text-[10px] bg-indigo-150 text-indigo-700 font-mono font-black tracking-widest uppercase px-2 py-0.5 rounded border border-indigo-200">
                  {isBengali ? "সুপারভাইজার রুট ডিসপ্যাচ" : "SUPERVISOR ROOT DISPATCH"}
                </span>
                <h3 className="text-sm font-black tracking-tight text-indigo-900 leading-tight">
                  {isBengali ? "নতুন কাজের নির্দেশক ফর্ম" : "Schedule New Route Duty"}
                </h3>
                <p className="text-[10.5px] text-slate-500 font-medium">
                  {isBengali 
                    ? "সেন্টার নির্ধারণ করে দিন এবং কাজের এরিয়া স্পেসিফাই করে নির্দেশনা প্রদান করুন।" 
                    : "Dispatch route plans with exact issues and work areas."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSchedulerOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-650 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable form body */}
            <form onSubmit={handleCreateNewFieldPlan} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs font-semibold">
              
              {/* 1. Target Center Selection */}
              <div className="space-y-1">
                <div className="flex justify-between items-end gap-2">
                  <label className="text-slate-950 block text-[11px] font-black uppercase">
                    {isBengali ? "১. হাসপাতাল ও সেন্টার নির্বাচন:" : "1. Target Hospital Facility:"}
                  </label>
                  <button type="button" onClick={() => setShowCustomClinicInput(!showCustomClinicInput)} className="text-[9px] font-black text-emerald-600 hover:text-emerald-700 bg-emerald-100/50 px-2 py-0.5 rounded shrink-0 mb-0.5 cursor-pointer transition-colors">＋ ADD NEW</button>
                </div>

                <div className="mb-2">
                  <select 
                    value={quickLinkEmirateFilter}
                    onChange={(e) => setQuickLinkEmirateFilter(e.target.value)}
                    className="w-full text-xs font-bold px-3 py-2 bg-slate-200 border-2 border-slate-250 rounded-lg text-slate-800 cursor-pointer focus:outline-none focus:border-[#2563EB] transition-colors"
                  >
                    <option value="All">All States (সমগ্র ইউএই)</option>
                    {["Dubai", "Sharjah", "Ajman", "Umm Al Quwain", "Ras Al Khaimah", "Fujairah", "Abu Dhabi"].map(em => (
                      <option key={em} value={em}>{em}</option>
                    ))}
                  </select>
                </div>
                
                {showCustomClinicInput && (
                  <div className="mb-2 p-2 bg-slate-100 border border-slate-300 rounded animate-fadeIn space-y-2">
                    <input 
                      type="text" 
                      placeholder="Clinic name..." 
                      className="w-full text-xs font-bold px-2 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-emerald-500 text-slate-800"
                      value={newClinicName}
                      onChange={(e) => setNewClinicName(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <select 
                        className="flex-1 text-xs font-bold px-2 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-emerald-500 text-slate-800 cursor-pointer"
                        value={newClinicEmirate}
                        onChange={(e) => setNewClinicEmirate(e.target.value)}
                      >
                        {["Dubai", "Sharjah", "Ajman", "Umm Al Quwain", "Ras Al Khaimah", "Fujairah", "Abu Dhabi"].map(em => (
                          <option key={em} value={em}>{em}</option>
                        ))}
                      </select>
                      <button 
                        type="button"
                        onClick={() => {
                          if (!newClinicName.trim()) return;
                          try {
                            const cached = localStorage.getItem("ALW_CUSTOM_EMIRATE_FACILITIES");
                            const parsed = cached ? JSON.parse(cached) : {};
                            const emLower = newClinicEmirate.toLowerCase();
                            if (!parsed[emLower]) parsed[emLower] = [];
                            if (!parsed[emLower].includes(newClinicName.trim())) {
                              parsed[emLower].push(newClinicName.trim());
                              localStorage.setItem("ALW_CUSTOM_EMIRATE_FACILITIES", JSON.stringify(parsed));
                            }
                            handleFacilitySelect(newClinicName.trim());
                            setNewClinicName("");
                            setShowCustomClinicInput(false);
                            setForceUpdateToggle(prev => prev + 1);
                          } catch (e) {}
                        }}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black px-3 py-1.5 rounded transition-colors shrink-0 cursor-pointer"
                      >
                        SAVE
                      </button>
                    </div>
                  </div>
                )}

                <div className="relative mt-2">
                  <button 
                    type="button" 
                    onClick={() => setIsQuickLinkOpen(!isQuickLinkOpen)}
                    className="w-full flex justify-between items-center bg-slate-50 border-2 border-slate-250 text-slate-900 font-black rounded-lg py-2.5 px-3 outline-none focus:border-[#2563EB] cursor-pointer animate-fadeIn"
                  >
                    <span>{targetFacility || `-- ${isBengali ? "সেন্টার নির্ধারণ করুন" : "Choose Primary Route Center"} --`}</span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>

                  {isQuickLinkOpen && (
                    <div className="absolute z-[999] top-full right-0 left-0 mt-1 bg-white border border-slate-300 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                      <div className="p-1 space-y-1">
                        {(() => {
                          const grouped: Record<string, string[]> = {};
                          
                          const addFacility = (state: string, name: string) => {
                            if (!name) return;
                            if (deletedFacilities.includes(name.trim())) return; // skip deleted facilities
                            const normalizedState = state.split(' ')
                              .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                              .join(' ');
                            
                            if (!grouped[normalizedState]) grouped[normalizedState] = [];
                            if (!grouped[normalizedState].includes(name)) {
                              grouped[normalizedState].push(name);
                            }
                          };

                          // Add from EMIRATE_MAPPING_FACILITIES
                          Object.entries(EMIRATE_MAPPING_FACILITIES).forEach(([em, facilities]) => {
                             facilities.forEach(fac => addFacility(em, fac));
                          });

                          // Add from LocationRegistry (locations)
                          if (locations && locations.length > 0) {
                            locations.forEach(loc => addFacility(loc.emirate || "Other", loc.name));
                          }

                          // Add from custom local storage
                          try {
                            const customCache = localStorage.getItem("ALW_CUSTOM_EMIRATE_FACILITIES");
                            if (customCache) {
                              const parsed = JSON.parse(customCache);
                              Object.entries(parsed).forEach(([em, facilities]) => {
                                if (Array.isArray(facilities)) {
                                  facilities.forEach(fac => addFacility(em, fac));
                                }
                              });
                            }
                          } catch (e) {
                            // ignore
                          }
                          
                          let groups = Object.keys(grouped).sort();
                          if (quickLinkEmirateFilter !== "All") {
                            groups = groups.filter(g => g.toLowerCase() === quickLinkEmirateFilter.toLowerCase());
                          }

                          return groups.map(state => (
                            <div key={state} className="mb-2">
                              <div className="px-2 py-1 text-[11px] font-black text-slate-500 uppercase tracking-tight bg-slate-50 rounded mb-0.5">{state}</div>
                              {grouped[state].sort().map(center => (
                                <div 
                                  key={center} 
                                  className="group flex justify-between items-center px-2 py-1.5 text-xs font-bold text-slate-800 hover:bg-[#2563EB]/10 hover:text-[#2563EB] cursor-pointer rounded"
                                  onClick={() => {
                                    handleFacilitySelect(center);
                                    setIsQuickLinkOpen(false);
                                  }}
                                >
                                  <span className="truncate pr-2">{center}</span>
                                  <button 
                                    type="button"
                                    title="Remove facility"
                                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-all focus:outline-none shrink-0"
                                    onClick={(e) => handleDeleteFacility(center, e)}
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Date Scheduling selection: Today, Tomorrow, After Tomorrow */}
              <div className="space-y-1.5">
                <label className="text-slate-950 block text-[11px] font-black uppercase">
                  {isBengali ? "২. কাজের দিন নির্ধারণ (শিডিউল):" : "2. Schedule Target Work Day:"}
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
                        onClick={() => {
                          if (datePeriod === pd.id) {
                            setDatePeriod("" as any);
                          } else {
                            setDatePeriod(pd.id as any);
                          }
                        }}
                        className={`py-2.5 px-1 rounded-lg border-2 text-[10.5px] font-black uppercase tracking-tight transition cursor-pointer flex flex-col items-center justify-center ${
                          isSelected 
                            ? "bg-[#2563EB] border-[#2563EB] text-white shadow-3xs" 
                            : "bg-white hover:bg-slate-50 border-slate-200 text-slate-800"
                        }`}
                      >
                        <span className="text-[12px] mb-0.5">📅</span>
                        <span>{isBengali ? pd.labelBn : pd.labelEn}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Location Scope: Inside or Outside */}
              <div className="space-y-1.5">
                <label className="text-slate-950 block text-[11px] font-black uppercase">
                  {isBengali ? "৩. কাজের স্থান / এরিয়া নির্ধারণী (Inside or Outside):" : "3. Location Area / Area Type:"}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "Inside", labelBn: "ইনসাইড", labelEn: "Inside" },
                    { id: "Outside", labelBn: "আউটসাইড", labelEn: "Outside" },
                    { id: "Both", labelBn: "উভয়ই", labelEn: "Both" }
                  ].map((loc) => {
                    const mappedVal = loc.id === "Both" ? "Both Inside & Outside" : loc.id;
                    const currentSections = locationArea ? locationArea.split(", ").filter(Boolean) : [];
                    const isSelected = currentSections.includes(mappedVal);
                    return (
                      <button
                        type="button"
                        key={loc.id}
                        onClick={() => {
                          const val = loc.id === "Both" ? "Both Inside & Outside" : loc.id;
                          let updated: string[];
                          if (currentSections.includes(val)) {
                            updated = currentSections.filter(x => x !== val);
                          } else {
                            updated = [...currentSections, val];
                          }
                          const jointVal = updated.join(", ");
                          setLocationArea(jointVal);
                          setWorkAreas(jointVal);
                        }}
                        className={`py-2.5 px-1 rounded-lg border-2 text-[10.5px] font-black uppercase tracking-tight transition cursor-pointer flex flex-col items-center justify-center ${
                          isSelected 
                            ? "bg-slate-900 border-slate-900 text-white shadow-3xs" 
                            : "bg-white hover:bg-slate-50 border-slate-200 text-slate-800"
                        }`}
                      >
                        <span className="text-[12px] mb-0.5">
                          {loc.id === "Inside" ? "🚪" : loc.id === "Outside" ? "🌳" : "🏢"}
                        </span>
                        <span>{isBengali ? loc.labelBn : loc.labelEn}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Textarea for Tasks Instruction: Blank initially ("nothing will be written here") */}
              <div className="space-y-1 pt-1">
                <label className="text-slate-950 block text-[11px] font-extrabold uppercase flex justify-between items-center">
                  <span>{isBengali ? "৪. কাজের বিবরণ ও নির্দেশনা (Tasks Guideline):" : "4. Tasks Instruction Details:"}</span>
                  <span className="text-[9px] font-normal text-slate-400 italic">Manual Entry</span>
                </label>
                <textarea
                  rows={4}
                  value={instructionText}
                  onChange={(e) => setInstructionText(e.target.value)}
                  placeholder={isBengali ? "এখানে আপনার কাজের নির্দেশনা লিখুন..." : "Type your tasks instructions here..."}
                  className="w-full bg-slate-50 border-2 border-slate-250 text-slate-900 font-extrabold rounded-lg py-2.5 px-3 outline-none focus:border-[#2563EB] placeholder:text-slate-400 placeholder:font-normal leading-relaxed h-28 focus:ring-0 active:ring-0 resize-y"
                  style={{ minHeight: "100px" }}
                />
              </div>

              {/* Modal footer actions integrated inside form container */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 flex-none bg-white">
                <button
                  type="button"
                  onClick={() => setIsSchedulerOpen(false)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-150 text-slate-700 font-extrabold rounded-xl text-xs cursor-pointer transition active:scale-95"
                >
                  {isBengali ? "বাতিল" : "Cancel"}
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#2563EB] hover:bg-blue-700 font-sans text-white font-black rounded-xl text-xs cursor-pointer shadow-md shadow-blue-500/10 transition active:scale-95 flex items-center gap-2 uppercase tracking-wide"
                >
                  <span>🚀 {isBengali ? "মেইন প্ল্যানে সেভ করুন" : "Save Plan Into Main Workbook"}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
