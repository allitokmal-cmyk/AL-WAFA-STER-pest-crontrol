import React, { useState, useRef, useEffect } from "react";
// @ts-ignore
import { 
  FileCheck2, 
  MapPin, 
  Clock, 
  FlaskConical, 
  AlertOctagon, 
  Camera, 
  DollarSign, 
  Signature, 
  CheckCircle, 
  Info, 
  HelpCircle, 
  QrCode,
  AlertTriangle,
  User,
  Plus,
  Trash2,
  FileCheck,
  Edit3,
  X,
  Settings,
  Droplet,
  ChevronDown
} from "lucide-react";
import { ReportItem, LocationRegistryItem, STANDARD_FACILITIES, EMIRATE_MAPPING_FACILITIES } from "../types";
import { saveDocument } from "../localDatabase";
import { generateReportHTML } from "./ClientDirectory";

interface MasterFormProps {
  onAddReport: (report: ReportItem) => void;
  editingReport?: ReportItem | null;
  onUpdateReport?: (report: ReportItem) => void;
  onCancelEdit?: () => void;
  prefilledClient: any;
  language: "en" | "ar" | "bn";
  setTab: (tab: string) => void;
  locations?: LocationRegistryItem[];
  setLocations?: React.Dispatch<React.SetStateAction<LocationRegistryItem[]>>;
  reports?: ReportItem[];
}

// Interactive Drawing Canvas for Digital Signatures
function SignaturePad({
  id,
  title,
  subtitle,
  onSaveSignature,
  initialUrl = ""
}: {
  id: string;
  title: string;
  subtitle: string;
  onSaveSignature: (dataUrl: string) => void;
  initialUrl?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(!!initialUrl);
  const [signatureUrl, setSignatureUrl] = useState(initialUrl);

  useEffect(() => {
    setSignatureUrl(initialUrl);
    setHasSigned(!!initialUrl);
  }, [initialUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = "#000000"; // Sharp, distinctive contrasting solid black signature ink!
        ctx.lineWidth = 2.5;         // Solid visible stroke thickness for nice rendering
        ctx.lineCap = "round";
      }
    }
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    let clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    let clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSigned(true);
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const canvas = canvasRef.current;
      if (canvas && hasSigned) {
        const dataUrl = canvas.toDataURL();
        setSignatureUrl(dataUrl);
        onSaveSignature(dataUrl);
      }
    }
  };

  const clearPad = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasSigned(false);
        setSignatureUrl("");
        onSaveSignature("");
      }
    }
  };

  return (
    <div id={`sig-container-${id}`} className="bg-slate-50 border border-slate-300 p-2.5 rounded-lg flex flex-col gap-1.5 flex-1 min-w-[200px]">
      <div className="flex justify-between items-center border-b border-slate-200 pb-1">
        <span className="text-[10px] font-bold text-slate-800 flex items-center gap-1">
          <Signature className="w-3 h-3 text-slate-600" />
          {title}
        </span>
        <button
          id={`clear-${id}`}
          type="button"
          onClick={clearPad}
          className="text-[9px] text-red-600 hover:text-red-800 font-bold px-1.5 py-0.5 bg-red-50 hover:bg-red-100 rounded border border-red-100 no-print"
        >
          Clear
        </button>
      </div>
      <div className="relative border border-dotted border-slate-350 bg-white rounded h-[70px] w-full overflow-hidden">
        {signatureUrl ? (
          <img 
            src={signatureUrl} 
            alt="Signature" 
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            referrerPolicy="no-referrer"
          />
        ) : null}
        <canvas
          id={`canvas-${id}`}
          ref={canvasRef}
          width={240}
          height={70}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className={`absolute inset-0 w-full h-full cursor-crosshair touch-none ${signatureUrl ? "opacity-0" : "opacity-100"}`}
        />
      </div>
      <div className="text-[8px] text-slate-400 text-center italic leading-none">
        {hasSigned ? "✓ Signature Captured" : subtitle}
      </div>
    </div>
  );
}

export default function MasterForm({
  onAddReport,
  editingReport,
  onUpdateReport,
  onCancelEdit,
  prefilledClient,
  language,
  setTab,
  locations = [],
  setLocations,
  reports = []
}: MasterFormProps) {
  const [showNotification, setShowNotification] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const triggerToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
    // Auto dismiss
    const msg = message;
    setTimeout(() => {
      setToast(curr => curr?.message === msg ? null : curr);
    }, 5000);
  };
  const recommendationsRef = useRef<HTMLTextAreaElement>(null);

  // Replicating physical form top headers
  const [slNo, setSlNo] = useState(() => {
    let maxNum = 229; // default starting number
    const storedLast = typeof window !== "undefined" ? localStorage.getItem("ALW_LAST_SL_NO") : null;
    if (storedLast) {
      const parsedStored = parseInt(storedLast, 10);
      if (!isNaN(parsedStored) && parsedStored > maxNum) {
        maxNum = parsedStored;
      }
    }
    return String(maxNum + 1).padStart(4, "0");
  });

  // Auto-calculate and advance serial number on mount/reports list population
  useEffect(() => {
    if (!editingReport) {
      let maxNum = 229;
      const storedLast = localStorage.getItem("ALW_LAST_SL_NO");
      if (storedLast) {
        const parsedStored = parseInt(storedLast, 10);
        if (!isNaN(parsedStored) && parsedStored > maxNum) {
          maxNum = parsedStored;
        }
      }
      if (reports && reports.length > 0) {
        reports.forEach(r => {
          if (r.id) {
            const parts = r.id.split("-");
            if (parts.length >= 2) {
              const middlePart = parts[1];
              const parsed = parseInt(middlePart, 10);
              if (!isNaN(parsed) && parsed > 0 && parsed < 9999) {
                if (parsed > maxNum) {
                  maxNum = parsed;
                }
              }
            }
          }
        });
      }
      const nextVal = String(maxNum + 1).padStart(4, "0");
      setSlNo(nextVal);
    }
  }, [reports, editingReport]);

  const [dateOfOperation, setDateOfOperation] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  });

  const getParsedDateParts = () => {
    const fallbackDate = new Date();
    fallbackDate.setMinutes(fallbackDate.getMinutes() - fallbackDate.getTimezoneOffset());
    const fallbackStr = fallbackDate.toISOString().slice(0, 10);
    
    const curDate = dateOfOperation || fallbackStr;
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
      parsed.setMinutes(parsed.getMinutes() - parsed.getTimezoneOffset());
      const iso = parsed.toISOString().slice(0, 10).split("-");
      return { year: iso[0], month: iso[1], day: iso[2] };
    }
    const dIso = fallbackStr.split("-");
    return { year: dIso[0], month: dIso[1], day: dIso[2] };
  };

  const updateDatePart = (key: "year" | "month" | "day", val: string) => {
    const parts = getParsedDateParts();
    parts[key] = val;
    const combined = `${parts.year}-${parts.month}-${parts.day}`;
    setDateOfOperation(combined);
  };

  const [contractNo, setContractNo] = useState("");

  // Section 1: Client details
  const [facilityName, setFacilityName] = useState("");
  const [address, setAddress] = useState("");
  const [isEmirateAddressDropdownOpen, setIsEmirateAddressDropdownOpen] = useState(false);

  const handleSelectEmirateAddress = (selectedEmirate: string) => {
    setAddress(selectedEmirate);
    setEmirate(selectedEmirate);
    setIsEmirateAddressDropdownOpen(false);
  };

  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [clientId, setClientId] = useState("");
  const [branchName, setBranchName] = useState("Deira Main Center");
  const [facilityType, setFacilityType] = useState("Clinic");
  const [emirate, setEmirate] = useState("Ajman");
  const [googleMapLink, setGoogleMapLink] = useState("");
  const [gpsCoordinates, setGpsCoordinates] = useState("25.4052° N, 55.5136° E");

  // Quick Add Custom Clinic
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

  // Check if clinical facility exists in database registry maps
  const facilityExists = facilityName.trim() !== "" && locations.some(
    (l) => l.name?.toLowerCase().trim() === facilityName?.toLowerCase().trim()
  );

  const handleRegisterNewLocationInline = () => {
    if (!facilityName.trim()) return;
    if (setLocations) {
      const code = emirate.substring(0, 3).toUpperCase();
      const newId = `LOC-${code}-${Math.floor(100 + Math.random() * 900)}`;
      const newLoc: LocationRegistryItem = {
        id: newId,
        name: facilityName.trim(),
        emirate: emirate,
        mapUrl: newLocationMapUrl.trim() || `https://maps.google.com/?q=${encodeURIComponent(facilityName.trim())}`
      };
      setLocations(prev => {
        if (prev.some(l => l.name?.toLowerCase().trim() === facilityName.toLowerCase().trim())) {
          return prev;
        }
        return [...prev, newLoc];
      });
      setRegistryMessage(language === "bn" ? "✓ লোকেশন রেজিস্ট্রিতে সফলভাবে সংরক্ষিত হয়েছে!" : "✓ Hospital registered into Locations Directory successfully!");
      setTimeout(() => setRegistryMessage(null), 3000);
    }
  };

  // Section 2: Time logs
  const [startTime, setStartTime] = useState("01:30");
  const [startAmpm, setStartAmpm] = useState("AM");
  const [endTime, setEndTime] = useState("02:15");
  const [endAmpm, setEndAmpm] = useState("PM");
  const [duration, setDuration] = useState("45 mins");
  const [ticketNo, setTicketNo] = useState("");

  // Section 3: Service Checkboxes
  const [serviceTypes, setServiceTypes] = useState<Record<string, boolean>>({
    Basic: false,
    "Follow Up": false,
    "Call Back": false,
    Replenishing: false,
    Free: false,
    Sample: false
  });

  // Section 4: Treatment Checkboxes
  const [treatmentTypes, setTreatmentTypes] = useState<Record<string, boolean>>({
    GPC: false,
    FICP: false,
    RCP: false,
    TCP: false,
    BCP: false,
    SCP: false
  });

  // Section 5: Area logs (Text area for free-form textbox, supporting custom presets)
  const [coveredAreaText, setCoveredAreaText] = useState("");
  const [areaEntriesList, setAreaEntriesList] = useState<any[]>([]);
  const coveredAreaRef = useRef<HTMLTextAreaElement>(null);

  // Section 6: Methods Checkboxes
  const [applicationMethods, setApplicationMethods] = useState<Record<string, boolean>>({
    Spraying: false,
    Trapping: false,
    Dusting: false,
    Baiting: false,
    Repellents: false,
    "IGR's": false
  });

  const [treatmentMethods, setTreatmentMethods] = useState<Record<string, boolean>>({
    "Space Treatment": false,
    "Spot Treatment": false,
    "Cracks/Crevices": false,
    "Band Treatment": false
  });

  const [efficacyMethods, setEfficacyMethods] = useState<Record<string, boolean>>({
    "Residual Treatment": false,
    "Knockdown Treatment": false
  });

  // Section 7: Pesticide Usage Table (exactly representing the rows on the paper)
  const [chemicalsUsed, setChemicalsUsed] = useState<any[]>([
    { name: "", dilution: "", used: "", isChecked: true },
    { name: "", dilution: "", used: "", isChecked: true },
    { name: "", dilution: "", used: "", isChecked: true },
    { name: "", dilution: "", used: "", isChecked: true }
  ]);

// Dynamic chemical presets list that the developer can add items to or import
  const [chemicalPresets, setChemicalPresets] = useState<any[]>(() => {
    const saved = localStorage.getItem("alwafa_chemical_presets");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error("Error reading chemical presets", e);
      }
    }
    return [
      { name: "Deltacide (sc)", dilution: "10ml / 1 L", used: "75 ml", icon: "🧪" },
      { name: "Advion gel", dilution: "N/A", used: "5 grams", icon: "💉" },
      { name: "Pesguard FG", dilution: "5ml / 1 L", used: "100 ml", icon: "🧴" },
      { name: "K-Othrine", dilution: "10ml / 1 L", used: "50 ml", icon: "🧪" },
      { name: "Temprid SC", dilution: "8ml / 1 L", used: "80 ml", icon: "🧴" },
      { name: "Ficam W", dilution: "15g / 5 L", used: "150 ml", icon: "📦" }
    ];
  });

  useEffect(() => {
    localStorage.setItem("alwafa_chemical_presets", JSON.stringify(chemicalPresets));
  }, [chemicalPresets]);

  // Dynamic set of pre-written dilution options
  const [dilutionPresets, setDilutionPresets] = useState<string[]>(() => {
    const saved = localStorage.getItem("alwafa_dilution_presets");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error("Error reading dilution presets", e);
      }
    }
    return [
      "10ml / 1 L",
      "5ml / 1 L",
      "8ml / 1 L",
      "15ml / 1 L",
      "1:100",
      "0.5%",
      "N/A"
    ];
  });

  useEffect(() => {
    localStorage.setItem("alwafa_dilution_presets", JSON.stringify(dilutionPresets));
  }, [dilutionPresets]);

  const [activeDilutionDropdownIdx, setActiveDilutionDropdownIdx] = useState<number | null>(null);
  const [popoverNewDilution, setPopoverNewDilution] = useState("");

  const [isEditingPresets, setIsEditingPresets] = useState(false);
  const [editingPresetIdx, setEditingPresetIdx] = useState<number | null>(null);
  const [editingDropdownPresetIdx, setEditingDropdownPresetIdx] = useState<number | null>(null);

  const [customChemNameInput, setCustomChemNameInput] = useState("");
  const [customChemDilutionInput, setCustomChemDilutionInput] = useState("10ml / 1 L");
  const [customChemUsedInput, setCustomChemUsedInput] = useState("75 ml");

  // Section 8: Infestation Matrix (Dynamic list starting with No activity / Nothing identified row)
  const [infestEntriesList, setInfestEntriesList] = useState<any[]>([
    { pestName: "Nothing identified", level: "None", location: "N/A" }
  ]);
  const [customPestInput, setCustomPestInput] = useState("");
  const [showPestSelector, setShowPestSelector] = useState(false);

  // States for interactive chemical picker from pest table
  const [activeChemPopoverIdx, setActiveChemPopoverIdx] = useState<number | null>(null);
  const [activePestPopoverIdx, setActivePestPopoverIdx] = useState<number | null>(null);
  const [activePesticideDropdownIdx, setActivePesticideDropdownIdx] = useState<number | null>(null);
  const [popoverNewChemName, setPopoverNewChemName] = useState("");
  const [popoverNewChemDilution, setPopoverNewChemDilution] = useState("10ml / 1 L");
  const [popoverNewChemQty, setPopoverNewChemQty] = useState("75 ml");

  // Section 9: Sanitation & Proofing Condition
  const [sanitation, setSanitation] = useState<"Poor" | "Satisfactory" | "Good">("Good");
  const [proofing, setProofing] = useState<"Poor" | "Satisfactory" | "Good">("Good");
  const [sanitationRemarks, setSanitationRemarks] = useState("");
  const [proofingRemarks, setProofingRemarks] = useState("");

  // Section 10: Recommendations List (Single rich textarea representation with no line-by-line splits)
  const [recommendations, setRecommendations] = useState<string>(
    "Kitchen sub-counters must keep dry.\nRepair perimeter screen mesh of Deira main office windows."
  );

  // Section 11: Team members
  const [teamMembers, setTeamMembers] = useState<any[]>([
    { name: "Hamdy", position: "Supervisor" },
    { name: "Hussin", position: "Technician" }
  ]);
  const [additionalNotes, setAdditionalNotes] = useState("Fully completed four floors treatment with zero clinical hazard.");
  const [workStatus, setWorkStatus] = useState<"Completed" | "In Progress" | "Follow-Up Required" | "Emergency Callback" | "Partially Completed">("Completed");
  const [newLocationMapUrl, setNewLocationMapUrl] = useState("");
  const [registryMessage, setRegistryMessage] = useState<string | null>(null);

  // Section 12: Billing Info
  const [isFreeService, setIsFreeService] = useState(true);
  const [invoiceAmount, setInvoiceAmount] = useState<number | string>(1200);
  const [discount, setDiscount] = useState<number | string>(0);
  const [vat, setVat] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [invoiceNo, setInvoiceNo] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  const [paymentStatus, setPaymentStatus] = useState<"Paid" | "Pending" | "Partial Payment" | "Overdue">("Paid");

  // Signatures
  const [clientSign, setClientSign] = useState("");
  const [techSign, setTechSign] = useState("");
  const [supervisorSign, setSupervisorSign] = useState("");

  // Validation errors map for Master Treatment Form
  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (slNo.trim() && validationErrors.slNo) {
      setValidationErrors(prev => { const n = { ...prev }; delete n.slNo; return n; });
    }
  }, [slNo, validationErrors.slNo]);

  useEffect(() => {
    if (facilityName.trim() && validationErrors.facilityName) {
      setValidationErrors(prev => { const n = { ...prev }; delete n.facilityName; return n; });
    }
  }, [facilityName, validationErrors.facilityName]);

  useEffect(() => {
    if (address.trim() && validationErrors.address) {
      setValidationErrors(prev => { const n = { ...prev }; delete n.address; return n; });
    }
  }, [address, validationErrors.address]);

  useEffect(() => {
    if (dateOfOperation.trim() && validationErrors.dateOfOperation) {
      setValidationErrors(prev => { const n = { ...prev }; delete n.dateOfOperation; return n; });
    }
  }, [dateOfOperation, validationErrors.dateOfOperation]);

  useEffect(() => {
    const hasServiceType = Object.values(serviceTypes).some(v => v === true);
    if (hasServiceType && validationErrors.serviceTypes) {
      setValidationErrors(prev => { const n = { ...prev }; delete n.serviceTypes; return n; });
    }
  }, [serviceTypes, validationErrors.serviceTypes]);

  useEffect(() => {
    const hasTreatmentType = Object.values(treatmentTypes).some(v => v === true);
    if (hasTreatmentType && validationErrors.treatmentTypes) {
      setValidationErrors(prev => { const n = { ...prev }; delete n.treatmentTypes; return n; });
    }
  }, [treatmentTypes, validationErrors.treatmentTypes]);

  useEffect(() => {
    if (coveredAreaText.trim() !== "" && validationErrors.areaEntriesList) {
      setValidationErrors(prev => { const n = { ...prev }; delete n.areaEntriesList; return n; });
    }
  }, [coveredAreaText, validationErrors.areaEntriesList]);

  // Auto-resize the covered areas textarea dynamically
  useEffect(() => {
    const el = coveredAreaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [coveredAreaText]);

  useEffect(() => {
    const hasMethods = Object.values(applicationMethods).some(v => v === true) || 
                       Object.values(treatmentMethods).some(v => v === true) || 
                       Object.values(efficacyMethods).some(v => v === true);
    if (hasMethods && validationErrors.methods) {
      setValidationErrors(prev => { const n = { ...prev }; delete n.methods; return n; });
    }
  }, [applicationMethods, treatmentMethods, efficacyMethods, validationErrors.methods]);

  useEffect(() => {
    const activeTechs = teamMembers.filter(t => t.name.trim() !== "");
    if (activeTechs.length > 0 && validationErrors.teamMembers) {
      setValidationErrors(prev => { const n = { ...prev }; delete n.teamMembers; return n; });
    }
  }, [teamMembers, validationErrors.teamMembers]);

  // Download & Success tracking states triggered at form submission end
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdReport, setCreatedReport] = useState<any>(null);

  // Autofill some tokens (only if not editing)
  useEffect(() => {
    if (!editingReport) {
      setTicketNo(`TKT-${Math.floor(10000 + Math.random() * 90000)}-AL`);
      setClientId(`ALW-CLI-${Math.floor(3000 + Math.random() * 6000)}`);
      setInvoiceNo(`INV-2026-${Math.floor(1000 + Math.random() * 9000)}`);
    }
  }, [editingReport]);

  // Prefill linkage
  useEffect(() => {
    if (prefilledClient && !editingReport) {
      setFacilityName(prefilledClient.name || "");
      setClientId(prefilledClient.id || `ALW-CLI-${Math.floor(3000 + Math.random() * 6000)}`);
      setContractNo(prefilledClient.contract || "CON-924-ST");
      setEmirate(prefilledClient.emirate || "Ajman");
      setFacilityType(prefilledClient.type || "Clinic");
      setEmail(prefilledClient.email || "");
      setAddress(prefilledClient.emirate || "Ajman");
      setGoogleMapLink(`https://maps.google.com/?q=${encodeURIComponent(prefilledClient.name || "")}`);
      setShowNotification(true);
      const timer = setTimeout(() => setShowNotification(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [prefilledClient, editingReport]);

  // Population linkage for editingReport
  useEffect(() => {
    if (editingReport) {
      // 1. Replicating physical form top headers
      setSlNo(editingReport.id?.split("-")[1] || "0229");
      
      const getLocalToday = () => {
        const d = new Date();
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        return d.toISOString().slice(0, 10);
      };

      setDateOfOperation(editingReport.dateOfOperation || getLocalToday());
      setContractNo(editingReport.contractNo || "");

      // 2. Client Details
      setFacilityName(editingReport.facilityName || "");
      setAddress(editingReport.address || "");
      setContactPerson(editingReport.contactPerson || "");
      setEmail(editingReport.email || "");
      setClientId(editingReport.clientId || "");
      setBranchName(editingReport.branchName || "Deira Main Center");
      setFacilityType(editingReport.facilityType || "Clinic");
      setEmirate(editingReport.emirate || "Ajman");

      // 3. Time logs
      if (editingReport.startTime) {
        const parts = editingReport.startTime.split(" ");
        if (parts[0]) setStartTime(parts[0]);
        if (parts[1]) setStartAmpm(parts[1].toUpperCase());
      }
      if (editingReport.endTime) {
        const parts = editingReport.endTime.split(" ");
        if (parts[0]) setEndTime(parts[0]);
        if (parts[1]) setEndAmpm(parts[1].toUpperCase());
      }
      setDuration(editingReport.duration || "45 mins");
      setTicketNo(editingReport.ticketNo || "");

      // 4. Service Checkboxes / Treatment Checkboxes / Methods Checkboxes
      const newServiceTypes = {
        Basic: false,
        "Follow Up": false,
        "Call Back": false,
        Replenishing: false,
        Free: false,
        Sample: false
      };
      const newTreatmentTypes = {
        GPC: false,
        FICP: false,
        RCP: false,
        TCP: false,
        BCP: false,
        SCP: false
      };

      if (editingReport.categories) {
        editingReport.categories.forEach(cat => {
          if (cat in newServiceTypes) {
            newServiceTypes[cat as keyof typeof newServiceTypes] = true;
          }
          const cleanTreatment = cat.replace(" Treatment", "");
          if (cleanTreatment in newTreatmentTypes) {
            newTreatmentTypes[cleanTreatment as keyof typeof newTreatmentTypes] = true;
          }
        });
      }
      setServiceTypes(newServiceTypes);
      setTreatmentTypes(newTreatmentTypes);

      // Areas parsing
      if (editingReport.areas) {
        const parsedAreas = editingReport.areas.map(areaText => {
          const qtyMatch = areaText.match(/^(.*?)\s*\(Qty:\s*(.*?)\)/);
          if (qtyMatch) {
            const areaName = qtyMatch[1].trim();
            const qtyAndDetails = qtyMatch[2].split(" - ");
            const qty = qtyAndDetails[0]?.trim() || "1";
            const details = qtyAndDetails[1]?.trim() || "";
            return { areaName, qty, details };
          }
          return { areaName: areaText, qty: "1", details: "" };
        });
        setAreaEntriesList(parsedAreas);
        setCoveredAreaText(editingReport.areas.join("\n"));
      } else {
        setAreaEntriesList([]);
        setCoveredAreaText("");
      }

      // Methods Checkboxes
      const newApplicationMethods = {
        Spraying: false,
        Trapping: false,
        Dusting: false,
        Baiting: false,
        Repellents: false,
        "IGR's": false
      };
      const newTreatmentMethods = {
        "Space Treatment": false,
        "Spot Treatment": false,
        "Cracks/Crevices": false,
        "Band Treatment": false
      };
      const newEfficacyMethods = {
        "Residual Treatment": false,
        "Knockdown Treatment": false
      };

      if (editingReport.methods) {
        editingReport.methods.forEach(m => {
          if (m in newApplicationMethods) {
            newApplicationMethods[m as keyof typeof newApplicationMethods] = true;
          }
          if (m in newTreatmentMethods) {
            newTreatmentMethods[m as keyof typeof newTreatmentMethods] = true;
          }
          if (m in newEfficacyMethods) {
            newEfficacyMethods[m as keyof typeof newEfficacyMethods] = true;
          }
        });
      }
      setApplicationMethods(newApplicationMethods);
      setTreatmentMethods(newTreatmentMethods);
      setEfficacyMethods(newEfficacyMethods);

      // Chemicals Used
      if (editingReport.chemicals) {
        const mappedChems = editingReport.chemicals.map(c => ({
          name: c.name,
          dilution: c.dilution,
          used: c.used,
          isChecked: true
        }));
        while (mappedChems.length < 4) {
          mappedChems.push({ name: "", dilution: "10ml / 1 L", used: "75 ml", isChecked: true });
        }
        setChemicalsUsed(mappedChems);
      } else {
        setChemicalsUsed([
          { name: "", dilution: "", used: "", isChecked: true },
          { name: "", dilution: "", used: "", isChecked: true },
          { name: "", dilution: "", used: "", isChecked: true },
          { name: "", dilution: "", used: "", isChecked: true }
        ]);
      }

      // Infestation Matrix
      if (editingReport.infestation) {
        const mappedInfest = Object.entries(editingReport.infestation).map(([key, val]) => {
          const locMatch = key.match(/^(.*?)\s*\((.*?)\)$/);
          if (locMatch) {
            return { pestName: locMatch[1].trim(), level: val, location: locMatch[2].trim() };
          }
          return { pestName: key, level: val, location: "N/A" };
        });
        setInfestEntriesList(mappedInfest.length > 0 ? mappedInfest : [{ pestName: "Nothing identified", level: "None", location: "N/A" }]);
      } else {
        setInfestEntriesList([{ pestName: "Nothing identified", level: "None", location: "N/A" }]);
      }

      // Sanitation & Proofing
      setSanitation(editingReport.sanitation || "Good");
      setProofing(editingReport.proofing || "Good");
      setSanitationRemarks(editingReport.sanitationRemarks || "");
      setProofingRemarks(editingReport.proofingRemarks || "");

      // Recommendations
      if (editingReport.recommendations) {
        setRecommendations(editingReport.recommendations.join("\n"));
      } else {
        setRecommendations("");
      }

      // Team members
      if (editingReport.technicians) {
        const mappedTechs = editingReport.technicians.map(t => {
          let name = t.trim();
          let position = "Technician"; // default
          
          if (name.endsWith("(Engineer)")) {
            position = "Engineer";
            name = name.slice(0, -10).trim();
          } else if (name.endsWith("(ইঞ্জিনিয়ার)")) {
            position = "Engineer";
            name = name.slice(0, -12).trim();
          } else if (name.endsWith("(Supervisor)")) {
            position = "Supervisor";
            name = name.slice(0, -12).trim();
          } else if (name.endsWith("(সুপারভাইজার)")) {
            position = "Supervisor";
            name = name.slice(0, -13).trim();
          } else if (name.endsWith("(Operator)")) {
            position = "Operator";
            name = name.slice(0, -10).trim();
          } else if (name.endsWith("(অপারেটর)")) {
            position = "Operator";
            name = name.slice(0, -9).trim();
          } else if (name.endsWith("(Technician)")) {
            position = "Technician";
            name = name.slice(0, -12).trim();
          } else if (name.endsWith("(টেকনিশিয়ান)")) {
            position = "Technician";
            name = name.slice(0, -13).trim();
          }
          return { name, position };
        });
        setTeamMembers(mappedTechs.length > 0 ? mappedTechs : [{ name: "", position: "Supervisor" }]);
      }

      // Notes
      setAdditionalNotes(editingReport.reportText || "");
      setWorkStatus(editingReport.workStatus || "Completed");

      // Billing Info
      if (editingReport.billing) {
        const b = editingReport.billing;
        setIsFreeService(b.amount === 0 || b.amount === "0" || !b.amount);
        setInvoiceAmount(b.amount || "0");
        setDiscount(b.discount || "0");
        setVat(b.vat || 0);
        setTotal(b.total || 0);
        setInvoiceNo(b.invoiceNo || "");
        setPaymentMethod(b.method || "Bank Transfer");
        setPaymentStatus(b.status || "Paid");
      }

      // Signatures
      if (editingReport.signatures) {
        setClientSign(editingReport.signatures.client || "");
        setTechSign(editingReport.signatures.technician || "");
        setSupervisorSign(editingReport.signatures.supervisor || "");
      }
    }
  }, [editingReport]);

  // Auto calculate total
  useEffect(() => {
    if (isFreeService) {
      setVat(0);
      setTotal(0);
    } else {
      const amt = invoiceAmount === "" ? 0 : Number(invoiceAmount);
      const disc = discount === "" ? 0 : Number(discount);
      const net = Math.max(0, amt - disc);
      const computedVat = parseFloat((net * 0.05).toFixed(2));
      setVat(computedVat);
      setTotal(parseFloat((net + computedVat).toFixed(2)));
    }
  }, [invoiceAmount, discount, isFreeService]);

  // Auto-resize recommendations textarea based on content length
  useEffect(() => {
    const textarea = recommendationsRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [recommendations]);

  const handleAreaChange = (index: number, field: "areaName" | "qty" | "details", value: any) => {
    const copy = [...areaEntriesList];
    copy[index] = { ...copy[index], [field]: value };
    setAreaEntriesList(copy);
  };

  const addAreaRow = (name: string) => {
    const cleanName = name.trim();
    if (!cleanName) return;
    setAreaEntriesList(prev => [...prev, { areaName: cleanName, qty: "1", details: "" }]);
  };

  const removeAreaRow = (index: number) => {
    setAreaEntriesList(prev => prev.filter((_, i) => i !== index));
  };

  const handleChemicalChange = (index: number, field: string, value: any) => {
    const copy = [...chemicalsUsed];
    copy[index] = { ...copy[index], [field]: value };
    setChemicalsUsed(copy);
  };

  const handlePestChange = (index: number, field: string, value: string) => {
    const copy = [...infestEntriesList];
    copy[index] = { ...copy[index], [field]: value };
    setInfestEntriesList(copy);
  };

  const addPestRow = (name: string) => {
    const cleanName = name.trim();
    if (!cleanName) return;
    setInfestEntriesList(prev => {
      // If the list is currently only the empty row "Nothing identified", replace it.
      const filtered = prev.filter(item => item.pestName !== "Nothing identified");
      if (filtered.some(item => item.pestName.toLowerCase() === cleanName.toLowerCase())) {
        return prev;
      }
      return [...filtered, { pestName: cleanName, level: "Low", location: "" }];
    });
  };

  const addNewEmptyPestRow = () => {
    setInfestEntriesList(prev => {
      const filtered = prev.filter(item => item.pestName !== "Nothing identified");
      return [...filtered, { pestName: "", level: "Low", location: "" }];
    });
  };

  const removePestRow = (index: number) => {
    setInfestEntriesList(prev => {
      const updated = prev.filter((_, i) => i !== index);
      if (updated.length === 0) {
        return [{ pestName: "Nothing identified", level: "None", location: "N/A" }];
      }
      return updated;
    });
  };

  const setNoPestActivity = () => {
    setInfestEntriesList([{ pestName: "Nothing identified", level: "None", location: "N/A" }]);
  };

  const addChemicalUsedRow = () => {
    setChemicalsUsed([...chemicalsUsed, { name: "", dilution: "", used: "", isChecked: true }]);
  };

  const removeChemicalUsedRow = (index: number) => {
    setChemicalsUsed(prev => {
      const filtered = prev.filter((_, i) => i !== index);
      if (filtered.length === 0) {
        return [{ name: "", dilution: "", used: "", isChecked: true }];
      }
      return filtered;
    });
  };

  const addChemicalPresetToTable = (preset: { name: string, dilution: string, used: string }) => {
    setChemicalsUsed(prev => {
      const idx = prev.findIndex(item => !item.name || !item.name.trim());
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = { name: preset.name, dilution: preset.dilution || "", used: preset.used || "", isChecked: true };
        return copy;
      } else {
        return [...prev, { name: preset.name, dilution: preset.dilution || "", used: preset.used || "", isChecked: true }];
      }
    });
  };

  const addNewChemicalPreset = (name: string, dilution: string, used: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setChemicalPresets(prev => {
      if (prev.some(item => item.name.toLowerCase() === trimmed.toLowerCase())) {
        return prev;
      }
      return [...prev, { name: trimmed, dilution: dilution, used: used, icon: "🧪" }];
    });
  };

  const updateChemicalPreset = (index: number, name: string, dilution: string, used: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setChemicalPresets(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], name: trimmed, dilution, used };
      return copy;
    });
    setEditingPresetIdx(null);
    setCustomChemNameInput("");
  };

  const deleteChemicalPreset = (index: number) => {
    setChemicalPresets(prev => prev.filter((_, i) => i !== index));
    if (editingPresetIdx === index) {
      setEditingPresetIdx(null);
      setCustomChemNameInput("");
    }
  };

  const deleteDilutionPreset = (val: string) => {
    setDilutionPresets(prev => prev.filter(item => item !== val));
  };

  const addTeamMemberRow = (role: string) => {
    setTeamMembers(prev => [...prev, { name: "", position: role }]);
  };

  const removeTeamMemberRow = (index: number) => {
    setTeamMembers(prev => prev.filter((_, i) => i !== index));
  };

  const handleDownloadPDF = async () => {
    const defaultName = `AlWafaStar-Report-${slNo || "0229"}-${Date.now().toString().slice(-3)}`;
    const customFileName = defaultName;

    // Assemble payload dynamically from current form input states
    const finalCategories = [
      ...Object.keys(serviceTypes).filter(k => serviceTypes[k]),
      ...Object.keys(treatmentTypes).filter(k => treatmentTypes[k]).map(k => `${k} Treatment`)
    ];

    const finalAreas = coveredAreaText
      .split("\n")
      .map(line => line.trim())
      .filter(line => line !== "");

    const finalMethods = [
      ...Object.keys(applicationMethods).filter(k => applicationMethods[k]),
      ...Object.keys(treatmentMethods).filter(k => treatmentMethods[k]),
      ...Object.keys(efficacyMethods).filter(k => efficacyMethods[k])
    ];

    const finalChemicals = chemicalsUsed
      .filter(c => c.name.trim() !== "" && c.isChecked)
      .map(c => ({
        name: c.name,
        dilution: c.dilution || "10ml / 1 L",
        used: c.used || "10ml",
        batch: "ST-2026-REG",
        expiry: "2028-12-31",
        remaining: "Ok",
        quantityPcs: "1",
        storeRetrievalDate: dateOfOperation,
        disposalDate: "",
        disposalQty: "0"
      }));

    const finalInfestation: Record<string, string> = {};
    infestEntriesList.forEach(item => {
      if (item.pestName && item.pestName.trim() !== "") {
        const key = item.location && item.location.trim() !== "" && item.location !== "N/A"
          ? `${item.pestName} (${item.location})`
          : item.pestName;
        finalInfestation[key] = item.level;
      }
    });

    const payload: ReportItem = {
      ...editingReport, // preserve other fields of the report being edited
      id: editingReport ? editingReport.id : `REP-${slNo || "0229"}-${Date.now().toString().slice(-3)}`,
      facilityName,
      clientId: clientId || `ALW-CLI-${Math.floor(3000 + Math.random() * 6000)}`,
      contractNo: contractNo || "CON-PRE-2026",
      branchName,
      facilityType,
      emirate,
      address: address || "Deira, Dubai, UAE",
      contactPerson: contactPerson || "Authorized Officer",
      mobile: "+971 50 0000000",
      whatsapp: "+971 50 0000000",
      email: email || "pestcontrol@alwafagroupuae.com",
      startDate: "2026-01-01",
      endDate: "2026-12-31",
      validity: "Quarterly",
      dateOfOperation,
      ticketNo,
      startTime: `${startTime} ${startAmpm}`,
      endTime: `${endTime} ${endAmpm}`,
      duration,
      categories: finalCategories,
      areas: finalAreas,
      reportText: additionalNotes,
      workStatus,
      methods: finalMethods,
      chemicals: finalChemicals,
      infestation: finalInfestation,
      sanitation,
      proofing,
      sanitationRemarks,
      proofingRemarks,
      recommendations: recommendations.split("\n").map(r => r.trim()).filter(r => r !== ""),
      billing: {
        invoiceNo,
        invoiceDate: dateOfOperation,
        amount: isFreeService ? 0 : Number(invoiceAmount),
        discount: isFreeService ? 0 : Number(discount),
        vat,
        total,
        method: paymentMethod,
        status: isFreeService ? "Paid" : paymentStatus
      },
      technicians: (() => {
        const positionOrder: Record<string, number> = {
          "Engineer": 1,
          "Supervisor": 2,
          "Technician": 3,
          "Operator": 4
        };
        const sorted = [...teamMembers]
          .filter(t => t.name.trim() !== "")
          .sort((a, b) => {
            const orderA = positionOrder[a.position] || 99;
            const orderB = positionOrder[b.position] || 99;
            return orderA - orderB;
          });
        return sorted.map(t => {
          const trimmedName = t.name.trim();
          return `${trimmedName} (${t.position || "Technician"})`;
        });
      })(),
      signatures: {
        client: clientSign || undefined,
        supervisor: supervisorSign || undefined,
        technician: techSign || undefined
      }
    };

    try {
      const contentHtml = generateReportHTML(payload, language);

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
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, boolean> = {};
    if (!slNo.trim()) errors.slNo = true;
    if (!facilityName.trim()) errors.facilityName = true;
    if (!address.trim()) errors.address = true;
    if (!dateOfOperation.trim()) errors.dateOfOperation = true;

    // Ensure at least one Service Type is checked
    const hasServiceType = Object.values(serviceTypes).some(v => v === true);
    if (!hasServiceType) errors.serviceTypes = true;

    // Ensure at least one Treatment Type is checked
    const hasTreatmentType = Object.values(treatmentTypes).some(v => v === true);
    if (!hasTreatmentType) errors.treatmentTypes = true;

    // Ensure at least one Treatment Area is filled
    if (!coveredAreaText.trim()) errors.areaEntriesList = true;

    // Ensure at least one application method/treatment method/efficacy checked
    const hasMethods = Object.values(applicationMethods).some(v => v === true) || 
                       Object.values(treatmentMethods).some(v => v === true) || 
                       Object.values(efficacyMethods).some(v => v === true);
    if (!hasMethods) errors.methods = true;

    // Ensure at least one technician/supervisor in team with name (Bypassed as per user's request)
    // const activeTechs = teamMembers.filter(t => t.name.trim() !== "");
    // if (activeTechs.length === 0) errors.teamMembers = true;

    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      triggerToast(
        language === "bn"
          ? "দয়া করে চিহ্নিত প্রয়োজনীয় ঘরগুলো পূরণ করুন! (কিছু তথ্য বাদ আছে যা উপরে-নিচে কাঁপছে)"
          : "Please fill in the highlighted required fields! (Missing fields are bouncing up & down)",
        "error"
      );

      // Scroll to the first missing element
      const firstKey = Object.keys(errors)[0];
      const targetId = `master-${firstKey}`;
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    // Assemble payload
    const finalCategories = [
      ...Object.keys(serviceTypes).filter(k => serviceTypes[k]),
      ...Object.keys(treatmentTypes).filter(k => treatmentTypes[k]).map(k => `${k} Treatment`)
    ];

    const finalAreas = coveredAreaText
      .split("\n")
      .map(line => line.trim())
      .filter(line => line !== "");

    const finalMethods = [
      ...Object.keys(applicationMethods).filter(k => applicationMethods[k]),
      ...Object.keys(treatmentMethods).filter(k => treatmentMethods[k]),
      ...Object.keys(efficacyMethods).filter(k => efficacyMethods[k])
    ];

    const finalChemicals = chemicalsUsed
      .filter(c => c.name.trim() !== "" && c.isChecked)
      .map(c => ({
        name: c.name,
        dilution: c.dilution || "10ml / 1 L",
        used: c.used || "10ml",
        batch: "ST-2026-REG",
        expiry: "2028-12-31",
        remaining: "Ok",
        quantityPcs: "1",
        storeRetrievalDate: dateOfOperation,
        disposalDate: "",
        disposalQty: "0"
      }));

    const finalInfestation: Record<string, string> = {};
    infestEntriesList.forEach(item => {
      if (item.pestName && item.pestName.trim() !== "") {
        const key = item.location && item.location.trim() !== "" && item.location !== "N/A"
          ? `${item.pestName} (${item.location})`
          : item.pestName;
        finalInfestation[key] = item.level;
      }
    });

    const payload: ReportItem = {
      ...editingReport, // preserve other fields of the report being edited
      id: editingReport ? editingReport.id : `REP-${slNo || "0229"}-${Date.now().toString().slice(-3)}`,
      facilityName,
      clientId: clientId || `ALW-CLI-${Math.floor(3000 + Math.random() * 6000)}`,
      contractNo: contractNo || "CON-PRE-2026",
      branchName,
      facilityType,
      emirate,
      address: address || "Deira, Dubai, UAE",
      contactPerson: contactPerson || "Authorized Officer",
      mobile: "+971 50 0000000",
      whatsapp: "+971 50 0000000",
      email: email || "pestcontrol@alwafagroupuae.com",
      startDate: "2026-01-01",
      endDate: "2026-12-31",
      validity: "Quarterly",
      dateOfOperation,
      ticketNo,
      startTime: `${startTime} ${startAmpm}`,
      endTime: `${endTime} ${endAmpm}`,
      duration,
      categories: finalCategories,
      areas: finalAreas,
      reportText: additionalNotes,
      workStatus,
      methods: finalMethods,
      chemicals: finalChemicals,
      infestation: finalInfestation,
      sanitation,
      proofing,
      sanitationRemarks,
      proofingRemarks,
      recommendations: recommendations.split("\n").map(r => r.trim()).filter(r => r !== ""),
      billing: {
        invoiceNo,
        invoiceDate: dateOfOperation,
        amount: isFreeService ? 0 : Number(invoiceAmount),
        discount: isFreeService ? 0 : Number(discount),
        vat,
        total,
        method: paymentMethod,
        status: isFreeService ? "Paid" : paymentStatus
      },
      technicians: (() => {
        const positionOrder: Record<string, number> = {
          "Engineer": 1,
          "Supervisor": 2,
          "Technician": 3,
          "Operator": 4
        };
        const sorted = [...teamMembers]
          .filter(t => t.name.trim() !== "")
          .sort((a, b) => {
            const orderA = positionOrder[a.position] || 99;
            const orderB = positionOrder[b.position] || 99;
            return orderA - orderB;
          });
        return sorted.map(t => {
          const trimmedName = t.name.trim();
          return `${trimmedName} (${t.position || "Technician"})`;
        });
      })(),
      signatures: {
        client: clientSign || undefined,
        supervisor: supervisorSign || undefined,
        technician: techSign || undefined
      }
    };

    try {
      // Update local chemical inventory cache in localStorage for instant front-end sync even in offline mode
      try {
        const storedInvStr = localStorage.getItem("ALW_CHEMICAL_INVENTORY");
        if (storedInvStr) {
          const inv = JSON.parse(storedInvStr);
          if (Array.isArray(inv)) {
            const cleanName = (n: string) => n.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
            const isMatch = (name1: string, name2: string) => {
              if (!name1 || !name2) return false;
              const n1 = cleanName(name1);
              const n2 = cleanName(name2);
              if (n1 === n2) return true;
              if (n1.length > 3 && n2.length > 3) {
                if (n1.includes(n2) || n2.includes(n1)) return true;
              }
              const words1 = name1.toLowerCase().split(/[^a-z0-9]+/);
              const words2 = name2.toLowerCase().split(/[^a-z0-9]+/);
              const ignore = ["sc", "ec", "gel", "liquid", "powder", "wp", "wg", "cs", "gr", "ulv", "sl", "sp", "g", "ml", "l"];
              const sig1 = words1.filter(w => w.length > 2 && !ignore.includes(w));
              const sig2 = words2.filter(w => w.length > 2 && !ignore.includes(w));
              return sig1.some(w1 => sig2.some(w2 => w1 === w2));
            };
            const parseQty = (usedStr: string, targetUnit: string) => {
              if (!usedStr) return 0;
              const numericVal = parseFloat(usedStr);
              if (isNaN(numericVal)) return 0;
              const clean = usedStr.toLowerCase().trim();
              let srcUnit = "";
              if (clean.includes("ml")) srcUnit = "ml";
              else if (clean.includes("l")) srcUnit = "l";
              else if (clean.includes("kg")) srcUnit = "kg";
              else if (clean.includes("g") || clean.includes("gm") || clean.includes("gram")) srcUnit = "g";
              else srcUnit = targetUnit.toLowerCase() === "l" && numericVal >= 1.0 && numericVal <= 1000 ? "ml" : targetUnit.toLowerCase();
              
              if (srcUnit === targetUnit.toLowerCase()) return numericVal;
              if (srcUnit === "ml" && targetUnit.toLowerCase() === "l") return numericVal / 1000;
              if (srcUnit === "l" && targetUnit.toLowerCase() === "ml") return numericVal * 1000;
              if (srcUnit === "g" && targetUnit.toLowerCase() === "kg") return numericVal / 1000;
              if (srcUnit === "kg" && targetUnit.toLowerCase() === "g") return numericVal * 1000;
              return numericVal;
            };

            // Refund edit if editing
            if (editingReport && editingReport.chemicals) {
              editingReport.chemicals.forEach((chem: any) => {
                const found = inv.find(c => isMatch(c.name, chem.name));
                if (found) {
                  const qty = parseQty(chem.used, found.unit);
                  found.stock = parseFloat((found.stock + qty).toFixed(3));
                }
              });
            }

            // Deduct new report chemicals
            if (payload.chemicals) {
              payload.chemicals.forEach((chem: any) => {
                const found = inv.find(c => isMatch(c.name, chem.name));
                if (found) {
                  const qty = parseQty(chem.used, found.unit);
                  found.stock = Math.max(0, parseFloat((found.stock - qty).toFixed(3)));
                  chem.remaining = `${found.stock} ${found.unit}`;
                }
              });
            }

            localStorage.setItem("ALW_CHEMICAL_INVENTORY", JSON.stringify(inv));
          }
        }
      } catch (err) {
        console.error("Local chemical inventory update error: ", err);
      }

      // Offline-First Approach: Save to local state and localStorage immediately
      // This allows the app to work seamlessly both offline and online without blocking on network errors.
      if (editingReport && onUpdateReport) {
        onUpdateReport(payload);
      } else {
        onAddReport(payload);
        // Save the used slNo to localStorage to keep incrementing nicely next time!
        const parsedSl = parseInt(slNo, 10);
        if (!isNaN(parsedSl)) {
          localStorage.setItem("ALW_LAST_SL_NO", String(parsedSl));
          // Pre-increment state to make subsequent report creation completely seamless
          setSlNo(String(parsedSl + 1).padStart(4, "0"));
        }
      }
      setCreatedReport(payload);
      setShowSuccessModal(true);

      // Attempt background online sync to Firestore
      saveDocument("serviceReports", payload.id, payload)
        .catch(err => console.log("Failed to sync report to Firestore: ", err));
      
    } catch (e: any) {
      console.error(e);
      triggerToast("Submission error: " + e.message, "error");
    }
  };

  const prefillDefaultPaperData = () => {
    // Fill values mirroring the photographed treatment report exactly
    // but keep SL auto and date today
    
    const getLocalToday = () => {
      const d = new Date();
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      return d.toISOString().slice(0, 10);
    };

    setDateOfOperation(getLocalToday());
    setContractNo("CON-924-ST");
    setFacilityName("E.H-S Hospital");
    setAddress("DXB (Dubai Office)");
    setContactPerson("Authorized Dr.");
    setEmail("pestcontrol@alwafagroupuae.com");
    setStartTime("01:30");
    setStartAmpm("AM");
    setEndTime("02:15");
    setEndAmpm("PM");
    setDuration("45 mins");

    // Checkboxes
    setServiceTypes({
      Basic: true,
      "Follow Up": false,
      "Call Back": false,
      Replenishing: false,
      Free: false,
      Sample: false
    });

    setTreatmentTypes({
      GPC: true,
      FICP: false,
      RCP: false,
      TCP: false,
      BCP: false,
      SCP: false
    });

    setAreaEntriesList([
      { areaName: "Rooms", qty: "4", details: "E.H.S Four Floor treatment spraying" },
      { areaName: "Kitchen", qty: "1", details: "All offices, meeting room, waiting Area" },
      { areaName: "Store", qty: "2", details: "Kitchen, Bathroom, UT Floor Pantry" }
    ]);

    setApplicationMethods({
      Spraying: true,
      Trapping: false,
      Dusting: false,
      Baiting: false,
      Repellents: false,
      "IGR's": false
    });

    setTreatmentMethods({
      "Space Treatment": true,
      "Spot Treatment": false,
      "Cracks/Crevices": false,
      "Band Treatment": false
    });

    setEfficacyMethods({
      "Residual Treatment": true,
      "Knockdown Treatment": false
    });

    setChemicalsUsed([
      { name: "", dilution: "", used: "", isChecked: true },
      { name: "", dilution: "", used: "", isChecked: true },
      { name: "", dilution: "", used: "", isChecked: true },
      { name: "", dilution: "", used: "", isChecked: true }
    ]);

    setInfestEntriesList([
      { pestName: "Cockroaches", level: "Low", location: "Under pantry sink" },
      { pestName: "Drain fly", level: "Low", location: "Washroom drainage" }
    ]);

    setSanitation("Good");
    setProofing("Good");
    setSanitationRemarks("");
    setProofingRemarks("");

    setRecommendations(
      "Kitchen sub-counters must keep dry.\nRepair perimeter screen mesh of Deira main office windows."
    );

    setAdditionalNotes("Four floors clinical treatment successfully finalized. Safe and verified.");
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto text-slate-900 font-sans">
      
      {/* Beautiful Floating Visual Toast Alerts */}
      {toast && (
        <div id="master-toast-alert" className={`fixed top-6 right-6 z-[250] p-4 rounded-2xl shadow-2xl border-2 flex items-center gap-3 animate-bounce ${
          toast.type === "error" 
            ? "bg-rose-950/95 text-rose-100 border-rose-500/80 backdrop-blur" 
            : toast.type === "success" 
            ? "bg-emerald-950/95 text-emerald-100 border-emerald-500/80 backdrop-blur" 
            : "bg-slate-900/95 text-slate-100 border-slate-700 backdrop-blur"
        }`}>
          <span className="text-sm shrink-0">{toast.type === "error" ? "❌" : toast.type === "success" ? "✅" : "ℹ️"}</span>
          <div className="text-xs font-black font-sans leading-snug max-w-[280px]">{toast.message}</div>
          <button 
            type="button" 
            onClick={() => setToast(null)} 
            className="text-slate-400 hover:text-white font-mono text-sm cursor-pointer ml-2 p-1 hover:bg-white/10 rounded transition"
          >
            ✕
          </button>
        </div>
      )}

      {/* Dynamic Linked Toast Alert */}
      {showNotification && (
        <div className="bg-slate-900 text-emerald-400 p-3 rounded-2xl border border-slate-700 shadow-xl flex items-center justify-between gap-3 animate-bounce">
          <div className="flex items-center gap-2">
            <span className="p-1 px-2 bg-emerald-900/40 rounded text-xs">✔</span>
            <span className="text-xs font-semibold">
              {language === "bn" 
                ? `ডিরেক্টরি লিংক: ${facilityName} এর ডাটা ফর্মে সফলভাবে বসানো হয়েছে!` 
                : `Linked Directory: Imported ${facilityName} data correctly!`}
            </span>
          </div>
          <button onClick={() => setShowNotification(false)} className="text-xs font-bold text-slate-400">✕</button>
        </div>
      )}

      {/* Control Actions / Quick Action Buttons for users */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-4 rounded-3xl border border-slate-800 shadow-sm no-print">
        <div className="space-y-0.5">
          <h2 className="text-sm font-black text-white flex items-center gap-2">
            <span className="text-emerald-500">{editingReport ? "✏️" : "📄"}</span>
            <span>
              {editingReport ? (
                language === "bn" 
                  ? `সার্ভিস রিপোর্ট এডিট করুন (${editingReport.id})` 
                  : `Edit Service Report (${editingReport.id})`
              ) : (
                language === "bn" 
                  ? "নতুন ট্রিটমেন্ট রিপোর্ট ফরম" 
                  : "New Treatment Report Form"
              )}
            </span>
          </h2>
          <p className="text-[10px] text-slate-400">
            {editingReport ? (
              language === "bn" 
                ? "আপনি একটি বিদ্যমান চিকিৎসা বা পেস্ট কন্ট্রোল লগ এবং ডাটা পরিবর্তন করছেন।" 
                : "You are updating an active, registered treatment ledger record details."
            ) : (
              language === "bn" 
                ? "মহামূল্যবান কার্বন পেপার ফর্মের হুবহু রিপ্রেজেন্টেশন (ছোট ও অত্যন্ত কম্প্যাক্ট শাড়ি সমৃদ্ধ)" 
                : "High-density exact replica representing the physical client treatment card"
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!editingReport && (
            <button
              type="button"
              onClick={prefillDefaultPaperData}
              className="px-3.5 py-2 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 hover:text-emerald-350 border border-emerald-500/20 rounded-xl text-[10.5px] font-extrabold cursor-pointer transition flex items-center gap-1"
              title="Auto-fill with exact test entries from the uploaded photo"
            >
              📸 Prefill Photo Data
            </button>
          )}
          
          <button
            type="button"
            onClick={() => {
              if (editingReport && onCancelEdit) {
                onCancelEdit();
              } else {
                setTab("dashboard");
              }
            }}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold rounded-xl text-[10.5px] cursor-pointer hover:text-white"
          >
            ✕ {editingReport ? (language === "bn" ? "এডিট বাতিল" : "Cancel Edit") : (language === "bn" ? "বাতিল" : "Cancel")}
          </button>
        </div>
      </div>

      {/* Main Carbon Copy Paper Form Simulator container with clean cream background */}
      <form id="master-well-form" onSubmit={handleSubmitForm} className="bg-[#FFFDF3] border-2 border-slate-800 rounded-2xl shadow-xl overflow-hidden p-3 md:p-5 text-[11px]">
        
        {/* ================= PAPER HEADER BLOCK ================= */}
        <div className="border border-slate-800 p-3 mb-3 bg-white">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 pb-2 border-b border-slate-300 text-center md:text-left">
            
            {/* Left Header info */}
            <div className="space-y-1.5 w-full md:w-auto text-left">
              <div 
                id="master-slNo"
                className={`flex items-center gap-1 font-semibold text-xs transition-all duration-300 relative ${validationErrors.slNo ? "animate-float-alert border-2 border-sky-500 p-1 rounded-xl bg-sky-500/5" : ""}`}
              >
                <span className="text-slate-500 font-mono">SL. No</span>
                <input
                  type="text"
                  required
                  value={slNo}
                  onChange={(e) => setSlNo(e.target.value)}
                  className="w-16 px-1.5 py-0.5 bg-yellow-50/50 border border-red-300 text-red-600 font-bold font-mono text-center rounded outline-none"
                />
                {validationErrors.slNo && (
                  <span className="absolute -top-6 left-0 bg-sky-600 text-white text-[8px] sm:text-[9.5px] px-2 py-0.5 rounded shadow-md font-black animate-pulse z-50 whitespace-nowrap">
                    ⚠️ {language === "bn" ? "SL নম্বর লিখুন!" : "SL No Required!"}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1 text-[10.5px]">
                <div 
                  id="master-dateOfOperation"
                  className={`flex items-center gap-1 transition-all duration-300 relative ${validationErrors.dateOfOperation ? "animate-float-alert border-2 border-sky-400 p-1 rounded-xl bg-sky-500/5" : ""}`}
                >
                  <span className="text-slate-500 w-12 font-medium">Date:</span>
                  <div className="flex items-center gap-1 text-[11px]">
                    <select
                      value={getParsedDateParts().day}
                      onChange={(e) => updateDatePart("day", e.target.value)}
                      className="px-1.5 py-0.5 border border-slate-300 rounded font-mono font-bold bg-white text-slate-900 outline-none cursor-pointer focus:border-red-400"
                    >
                      {Array.from({ length: 31 }, (_, i) => {
                        const d = String(i + 1).padStart(2, "0");
                        return <option key={d} value={d}>{d}</option>;
                      })}
                    </select>

                    <span className="text-slate-400 font-mono font-bold">/</span>

                    <select
                      value={getParsedDateParts().month}
                      onChange={(e) => updateDatePart("month", e.target.value)}
                      className="px-1.5 py-0.5 border border-slate-300 rounded font-mono font-bold bg-white text-slate-900 outline-none cursor-pointer focus:border-red-400"
                    >
                      {["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"].map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>

                    <span className="text-slate-400 font-mono font-bold">/</span>

                    <select
                      value={getParsedDateParts().year}
                      onChange={(e) => updateDatePart("year", e.target.value)}
                      className="px-1.5 py-0.5 border border-slate-300 rounded font-mono font-bold bg-white text-slate-900 outline-none cursor-pointer focus:border-red-400"
                    >
                      {Array.from({ length: 11 }, (_, i) => {
                        const y = String(2024 + i);
                        return <option key={y} value={y}>{y}</option>;
                      })}
                    </select>
                  </div>
                  {validationErrors.dateOfOperation && (
                    <span className="absolute -top-6 left-12 bg-sky-600 text-white text-[8px] sm:text-[9.5px] px-2 py-0.5 rounded shadow-md font-black animate-pulse z-50 whitespace-nowrap">
                      ⚠️ {language === "bn" ? "তারিখ সিলেক্ট করুন!" : "Date Required!"}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-0.5" title={language === "bn" ? "কন্ট্রাক্ট বা চুক্তি নাম্বার (ঐচ্ছিক)" : "Contract number (Optional)"}>
                  <span className="text-slate-500 w-12 font-medium">Contract:</span>
                  <input
                    type="text"
                    placeholder={language === "bn" ? "ঐচ্ছিক" : "Optional"}
                    value={contractNo}
                    onChange={(e) => setContractNo(e.target.value)}
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

            {/* Right Quick link dropdown */}
            <div className="w-full md:w-auto text-right no-print">
              <div className="inline-block bg-slate-100 p-2 rounded-xl border border-slate-300 text-left">
                <div className="flex justify-between items-center mb-1 gap-2">
                  <span className="block text-[9px] font-bold text-slate-500">Quick Link Clinic:</span>
                  <button type="button" onClick={() => setShowCustomClinicInput(!showCustomClinicInput)} className="text-[8px] font-black text-emerald-600 hover:text-emerald-700 bg-emerald-100/50 px-1.5 py-0.5 rounded shrink-0 cursor-pointer transition-colors">＋ ADD NEW</button>
                </div>

                <div className="mb-1.5">
                  <select 
                    value={quickLinkEmirateFilter}
                    onChange={(e) => setQuickLinkEmirateFilter(e.target.value)}
                    className="w-full text-[9px] font-bold px-1 py-1 bg-slate-200 border border-slate-300 rounded text-slate-800 cursor-pointer focus:outline-none focus:border-emerald-500 transition-colors"
                  >
                    <option value="All">All Emirates</option>
                    {["Dubai", "Sharjah", "Ajman", "Umm Al Quwain", "Ras Al Khaimah", "Fujairah", "Abu Dhabi"].map(em => (
                      <option key={em} value={em}>{em}</option>
                    ))}
                  </select>
                </div>
                
                {showCustomClinicInput && (
                  <div className="mb-2 p-1.5 bg-white border border-slate-200 rounded animate-fadeIn space-y-1.5">
                    <input 
                      type="text" 
                      placeholder="Clinic name..." 
                      className="w-full text-[9px] font-bold px-1.5 py-1 border border-slate-300 rounded focus:outline-none focus:border-emerald-500 text-slate-800"
                      value={newClinicName}
                      onChange={(e) => setNewClinicName(e.target.value)}
                    />
                    <div className="flex gap-1">
                      <select 
                        className="flex-1 text-[9px] font-bold px-1 py-1 border border-slate-300 rounded focus:outline-none focus:border-emerald-500 text-slate-800 cursor-pointer"
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
                            setFacilityName(newClinicName.trim());
                            setNewClinicName("");
                            setShowCustomClinicInput(false);
                            setForceUpdateToggle(prev => prev + 1);
                          } catch (e) {}
                        }}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-[9px] font-black px-2 py-1 rounded transition-colors shrink-0 cursor-pointer"
                      >
                        SAVE
                      </button>
                    </div>
                  </div>
                )}

                <div className="relative mt-1">
                  <button 
                    type="button" 
                    onClick={() => setIsQuickLinkOpen(!isQuickLinkOpen)}
                    className="w-full md:w-40 flex justify-between items-center text-[10px] font-bold px-1.5 py-1 bg-white border border-slate-300 rounded text-slate-800 cursor-pointer focus:outline-none"
                  >
                    <span>-- {language === "bn" ? "বাছাই করুন" : "Select Predefined"} --</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {isQuickLinkOpen && (
                    <div className="absolute z-[999] top-full right-0 md:left-0 md:right-auto mt-1 w-56 bg-white border border-slate-300 rounded shadow-xl max-h-64 overflow-y-auto">
                      <div className="p-1 space-y-1">
                        {(() => {
                          const grouped: Record<string, string[]> = {};
                          
                          const addFacility = (state: string, name: string) => {
                            if (!name) return;
                            if (deletedFacilities.includes(name.trim())) return; // skip deleted
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
                              <div className="px-2 py-0.5 text-[9px] font-black text-slate-500 uppercase tracking-tight bg-slate-50 rounded-sm mb-0.5">{state}</div>
                              {grouped[state].sort().map(fac => (
                                <div 
                                  key={fac} 
                                  className="group flex justify-between items-center px-1.5 py-1 text-[10px] font-bold text-slate-800 hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer rounded"
                                  onClick={() => {
                                    setFacilityName(fac);
                                    setIsQuickLinkOpen(false);
                                  }}
                                >
                                  <span className="truncate pr-2">{fac}</span>
                                  <button 
                                    type="button"
                                    title="Remove facility"
                                    className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-all focus:outline-none shrink-0"
                                    onClick={(e) => handleDeleteFacility(fac, e)}
                                  >
                                    <X className="w-3 h-3" />
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
            </div>
          </div>

          {/* TREATMENT REPORT title line */}
          <div className="bg-slate-900 text-white text-center font-serif font-black tracking-wider text-[12px] py-1 mt-1">
            TREATMENT REPORT
          </div>
        </div>

        {/* ================= CORE ATTRIBUTES BLOCK GRID ================= */}
        <div className="border border-slate-800 bg-white grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800 mb-3">
          
          {/* Left Grid Half */}
          <div className="divide-y divide-slate-800">
            {/* Client Name Row */}
            <div 
              id="master-facilityName"
              className={`flex items-center p-1.5 gap-2 transition-all duration-300 relative ${validationErrors.facilityName ? "animate-float-alert border-2 border-sky-500 rounded-xl bg-sky-500/5" : ""}`}
            >
              <span className="text-[10.5px] font-extrabold text-slate-850 w-24 shrink-0 uppercase tracking-tight">Client Name:</span>
              <input
                type="text"
                required
                placeholder="E.H.S (Hospital)"
                value={facilityName}
                onChange={(e) => setFacilityName(e.target.value)}
                className="bg-transparent font-bold text-slate-900 border-none w-full outline-none focus:ring-0 p-0"
              />
              {validationErrors.facilityName && (
                <span className="absolute -top-4 right-2 bg-sky-600 text-white text-[9px] px-2 py-0.5 rounded shadow-lg font-black animate-pulse z-50 whitespace-nowrap">
                  ⚠️ {language === "bn" ? "ক্লিনিক বা ক্লায়েন্টের নাম লিখুন!" : "Client/Facility Name Required!"}
                </span>
              )}
            </div>
            {/* Contact No Row */}
            <div className="flex items-center p-1.5 gap-2">
              <span className="text-[10.5px] font-extrabold text-slate-850 w-24 shrink-0 uppercase tracking-tight" title={language === "bn" ? "কন্টাক্ট নাম্বার (ঐচ্ছিক)" : "Contact No. (Optional)"}>Contact No. (Opt):</span>
              <input
                type="tel"
                placeholder={language === "bn" ? "+৯৭১ ৫০ ১২৩৪৫৬৭ (ঐচ্ছিক)" : "+971 50 1234567 (Optional)"}
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="bg-transparent font-medium text-slate-900 border-none w-full outline-none focus:ring-0 p-0"
              />
            </div>
            {/* Time Start Row */}
            <div className="flex items-center p-1.5 gap-2">
              <span className="text-[10.5px] font-extrabold text-slate-850 w-24 shrink-0 uppercase tracking-tight">Time Start:</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="01:30"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 text-center font-bold text-slate-900 w-16"
                />
                <select
                  value={startAmpm}
                  onChange={(e) => setStartAmpm(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded px-1 py-0.5 font-bold cursor-pointer"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>
          </div>

          {/* Right Grid Half */}
          <div className="divide-y divide-slate-800">
            {/* Address Row */}
            <div 
              id="master-address"
              className={`flex items-center p-1.5 gap-2 relative transition-all duration-300 ${validationErrors.address ? "animate-float-alert border-2 border-sky-500 rounded-xl bg-sky-500/5" : ""}`}
            >
              <span className="text-[10.5px] font-extrabold text-slate-850 w-20 shrink-0 uppercase tracking-tight">Address:</span>
              <div className="flex-1 flex items-center justify-between gap-1">
                <input
                  type="text"
                  placeholder="DXB / Dubai, UAE"
                  value={address}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAddress(val);
                    const lower = val.toLowerCase();
                    if (lower.includes("dubai")) setEmirate("Dubai");
                    else if (lower.includes("sharjah")) setEmirate("Sharjah");
                    else if (lower.includes("ajman")) setEmirate("Ajman");
                    else if (lower.includes("abu dhabi") || lower.includes("abudhabi")) setEmirate("Abu Dhabi");
                    else if (lower.includes("fujairah")) setEmirate("Fujairah");
                    else if (lower.includes("ras al khaimah")) setEmirate("Ras Al Khaimah");
                    else if (lower.includes("umm al quwain") || lower.includes("umm alquwain")) setEmirate("Umm Al Quwain");
                  }}
                  className="bg-transparent font-medium text-slate-900 border-none w-full outline-none focus:ring-0 p-0 flex-1"
                />
                
                {/* Small location icon choice */}
                <div className="relative shrink-0 no-print flex items-center">
                  <button
                    type="button"
                    onClick={() => setIsEmirateAddressDropdownOpen(!isEmirateAddressDropdownOpen)}
                    className="p-1 px-2 hover:bg-amber-50/40 active:scale-95 text-slate-600 hover:text-slate-955 transition rounded flex items-center justify-center gap-1 cursor-pointer border border-slate-300 bg-[#FFFDF9]"
                    title={language === "bn" ? "ঠিকানা বাছাই করুন" : "Quick Location Select"}
                    id="btn-address-map-pin"
                  >
                    <span className="text-[9.5px] font-black tracking-tight text-slate-800">
                      {language === "bn" ? "বাছাই করুন" : "Select"}
                    </span>
                    <ChevronDown size={11} className="text-slate-550 shrink-0" />
                  </button>
                  
                  {isEmirateAddressDropdownOpen && (
                    <div 
                      id="dropdown-address-emirates" 
                      className="absolute right-0 mt-1 w-52 bg-white rounded-md shadow-lg border border-slate-200 py-1 text-left z-50 animate-fadeIn font-sans"
                      style={{ position: 'absolute', right: 0, top: '24px' }}
                    >
                      <div className="px-2 py-0.5 text-[8.5px] uppercase font-bold text-slate-400 border-b border-slate-100 select-none">
                        {language === "bn" ? "লোকেশন সিলেক্ট করুন" : "Select UAE Emirates"}
                      </div>
                      
                      {[
                        { label: language === "bn" ? "দুবাই" : "Dubai", value: "Dubai" },
                        { label: language === "bn" ? "শারজাহ" : "Sharjah", value: "Sharjah" },
                        { label: language === "bn" ? "আবুধাবি" : "Abu Dhabi", value: "Abu Dhabi" },
                        { label: language === "bn" ? "আজমান" : "Ajman", value: "Ajman" },
                        { label: language === "bn" ? "রাস আল খাইমাহ" : "Ras Al Khaimah", value: "Ras Al Khaimah" },
                        { label: language === "bn" ? "ফুজাইরাহ" : "Fujairah", value: "Fujairah" },
                        { label: language === "bn" ? "উম্ম আল কুয়াইন" : "Umm Al Quwain", value: "Umm Al Quwain" }
                      ].map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => handleSelectEmirateAddress(item.value)}
                          className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 text-slate-800 text-xs font-semibold flex items-center justify-between transition"
                        >
                          <span className="font-extrabold text-slate-900 text-[11px]">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {validationErrors.address && (
                <span className="absolute -top-4 right-2 bg-sky-600 text-white text-[9px] px-2 py-0.5 rounded shadow-lg font-black animate-pulse z-50 whitespace-nowrap">
                  ⚠️ {language === "bn" ? "ঠিকানা লিখুন!" : "Client Address Required!"}
                </span>
              )}
            </div>
            {/* Email Row */}
            <div className="flex items-center p-1.5 gap-2">
              <span className="text-[10.5px] font-extrabold text-slate-850 w-20 shrink-0 uppercase tracking-tight" title={language === "bn" ? "ইমেইল এড্রেস (ঐচ্ছিক)" : "Email (Optional)"}>Email (Opt):</span>
              <input
                type="email"
                placeholder={language === "bn" ? "info@example.com (ঐচ্ছিক)" : "pestcontrol@alwafagroupuae.com (Optional)"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent font-medium text-slate-900 border-none w-full outline-none focus:ring-0 p-0"
              />
            </div>
            {/* Time End Row */}
            <div className="flex items-center p-1.5 gap-2">
              <span className="text-[10.5px] font-extrabold text-slate-850 w-20 shrink-0 uppercase tracking-tight">Time End:</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="02:15"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 text-center font-bold text-slate-900 w-16"
                />
                <select
                  value={endAmpm}
                  onChange={(e) => setEndAmpm(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 font-bold cursor-pointer"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>
          </div>

        </div>

        {/* ================= SERVICE & TREATMENT CLASSIFICATION checkboxes ================= */}
        <div className="border border-slate-800 bg-white grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800 mb-3">
          
          {/* Service options on the paper */}
          <div 
            id="master-serviceTypes"
            className={`p-2 transition-all duration-300 relative ${validationErrors.serviceTypes ? "animate-float-alert border-2 border-sky-500 rounded-xl bg-sky-500/5" : ""}`}
          >
            <span className="block text-[10.5px] font-black uppercase tracking-wider text-slate-955 mb-1 border-b border-dashed pb-0.5">
              Service Checklists:
            </span>
            <div className="grid grid-cols-3 gap-1.5 pt-0.5">
              {Object.keys(serviceTypes).map(type => (
                <label key={type} className="flex items-center gap-1.5 cursor-pointer font-bold select-none text-[10px]">
                  <input
                    type="checkbox"
                    checked={serviceTypes[type]}
                    onChange={(e) => setServiceTypes(prev => ({ ...prev, [type]: e.target.checked }))}
                    className="w-4 h-4 text-emerald-600 rounded cursor-pointer accent-emerald-500 border-slate-400 focus:ring-0"
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
            {validationErrors.serviceTypes && (
              <span className="absolute -top-3.5 right-2 bg-sky-600 text-white text-[9px] px-2 py-0.5 rounded shadow-lg font-black animate-pulse z-50 whitespace-nowrap">
                ⚠️ {language === "bn" ? "অন্তত একটি সার্ভিস সিলেক্ট করুন!" : "Select at least 1 Service Checklist!"}
              </span>
            )}
          </div>

          {/* Treatment options on the paper */}
          <div 
            id="master-treatmentTypes"
            className={`p-2 transition-all duration-300 relative ${validationErrors.treatmentTypes ? "animate-float-alert border-2 border-sky-500 rounded-xl bg-sky-500/5" : ""}`}
          >
            <span className="block text-[10.5px] font-black uppercase tracking-wider text-slate-955 mb-1 border-b border-dashed pb-0.5">
              Treatment Scope (Abbr):
            </span>
            <div className="grid grid-cols-3 gap-1.5 pt-0.5">
              {Object.keys(treatmentTypes).map(type => (
                <label key={type} className="flex items-center gap-1.5 cursor-pointer font-bold select-none text-[10px]" title={`Pest Control Standard: ${type}`}>
                  <input
                    type="checkbox"
                    checked={treatmentTypes[type]}
                    onChange={(e) => setTreatmentTypes(prev => ({ ...prev, [type]: e.target.checked }))}
                    className="w-4 h-4 text-indigo-600 rounded cursor-pointer accent-indigo-505 border-slate-400 focus:ring-0"
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
            {validationErrors.treatmentTypes && (
              <span className="absolute -top-3.5 right-2 bg-sky-600 text-white text-[9px] px-2 py-0.5 rounded shadow-lg font-black animate-pulse z-50 whitespace-nowrap">
                ⚠️ {language === "bn" ? "অন্তত একটি স্কোপ সিলেক্ট করুন!" : "Select at least 1 Treatment Scope!"}
              </span>
            )}
          </div>

        </div>

        {/* ================= COMPACT TABLE: COVERED AREAS ================= */}
        <div 
          id="master-areaEntriesList"
          className={`border border-slate-800 bg-white mb-3 p-3 space-y-3 transition-all duration-300 relative ${validationErrors.areaEntriesList ? "animate-float-alert border-2 border-sky-500 rounded-xl bg-sky-500/5" : ""}`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-2.5 relative">
            <div>
              <span className="block text-[11px] font-black uppercase tracking-wider text-slate-955">
                {language === "bn" ? "⭐ কাভারেজ এরিয়া ও উপদ্বব বিবরণী" : "Covered Area Details & Findings"}
              </span>
              <p className="text-[9.5px] text-slate-500 italic">
                {language === "bn" 
                  ? "নিচে আপনার ইচ্ছেমতো সব কাভারেজ এরিয়া ও ফাইন্ডিংস টাইপ করুন।" 
                  : "Type any covered area details and specific findings below freely."}
              </p>
            </div>
            {validationErrors.areaEntriesList && (
              <span className="absolute -top-3.5 right-2 bg-sky-600 text-white text-[9px] px-2 py-0.5 rounded shadow-lg font-black animate-pulse z-50 whitespace-nowrap">
                ⚠️ {language === "bn" ? "কাভারেজ এরিয়া ও বিবরণী খালি রাখা যাবে না!" : "Covered Area details cannot be empty!"}
              </span>
            )}
          </div>

          <div className="relative">
            <textarea
              ref={coveredAreaRef}
              rows={4}
              value={coveredAreaText}
              onChange={(e) => setCoveredAreaText(e.target.value)}
              placeholder={language === "bn" 
                ? "আপনার কাজের চমৎকার বিবরণ লিখুন। যেমন:\nকিচেন (Qty: 1 - তেলাপোকা দমন করা হয়েছে)\nরুমস (Qty: 4 - বেড বাগ ট্রিটমেন্ট করা হয়েছে)\nঅথবা আপনার মনের মতো যেকোনো লেখা টাইপ করুন..."
                : "Enter details here. For neat column layout, write in format:\nKitchen (Qty: 1 - Treated cockroach infestation)\nRooms (Qty: 4 - Treated for bugs)\nOr write any text freely..."}
              className="w-full text-[11px] font-bold border border-slate-800 bg-[#FFFDF9] rounded-lg p-3 outline-none focus:ring-1 focus:ring-indigo-300 transition placeholder:text-slate-400 placeholder:italic min-h-[120px] font-mono leading-relaxed overflow-hidden resize-none"
            />
          </div>
        </div>

        {/* ================= TREATMENT CLASSIFICATIONS & EFFECTIVENESS ================= */}
        <div 
          id="master-methods"
          className={`border border-slate-800 bg-white grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-800 mb-3 p-2 transition-all duration-300 relative ${validationErrors.methods ? "animate-float-alert border-2 border-sky-500 rounded-xl bg-sky-500/5" : ""}`}
        >
          {validationErrors.methods && (
            <span className="absolute -top-3.5 right-2 bg-sky-600 text-white text-[9px] px-2 py-0.5 rounded shadow-lg font-black animate-pulse z-50 whitespace-nowrap">
              ⚠️ {language === "bn" ? "কমপক্ষে একটি পিরয়োগ বা ট্রিটমেন্ট পদ্ধতি সিলেক্ট করুন!" : "Select at least 1 Treatment Method / Efficacy!"}
            </span>
          )}
          
          {/* Method of application checkboxes */}
          <div>
            <span className="block text-[10.5px] font-black text-slate-955 uppercase mb-1">
              Method of Application:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {Object.keys(applicationMethods).map(m => (
                <label key={m} className="flex items-center gap-1 cursor-pointer font-bold select-none text-[9.5px]">
                  <input
                    type="checkbox"
                    checked={applicationMethods[m]}
                    onChange={(e) => setApplicationMethods(prev => ({ ...prev, [m]: e.target.checked }))}
                    className="w-3.5 h-3.5 rounded text-emerald-650 accent-emerald-600 focus:ring-0"
                  />
                  <span>{m}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Treatment methodology checkboxes */}
          <div className="pt-2 md:pt-0">
            <span className="block text-[10.5px] font-black text-slate-950 uppercase mb-1">
              Method of Treatment:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {Object.keys(treatmentMethods).map(t => (
                <label key={t} className="flex items-center gap-1 cursor-pointer font-bold select-none text-[9.5px]">
                  <input
                    type="checkbox"
                    checked={treatmentMethods[t]}
                    onChange={(e) => setTreatmentMethods(prev => ({ ...prev, [t]: e.target.checked }))}
                    className="w-3.5 h-3.5 rounded text-indigo-650 accent-indigo-600 focus:ring-0 cursor-pointer"
                  />
                  <span>{t}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Effectiveness checkboxes */}
          <div className="pt-2 md:pt-0 pl-0 md:pl-2">
            <span className="block text-[10.5px] font-black text-slate-955 uppercase mb-1">
              Effectiveness / Efficacy:
            </span>
            <div className="grid grid-cols-1 gap-1.5">
              {Object.keys(efficacyMethods).map(ef => (
                <label key={ef} className="flex items-center gap-1.5 cursor-pointer font-bold select-none text-[9.5px]">
                  <input
                    type="checkbox"
                    checked={efficacyMethods[ef]}
                    onChange={(e) => setEfficacyMethods(prev => ({ ...prev, [ef]: e.target.checked }))}
                    className="w-3.5 h-3.5 rounded text-rose-650 accent-rose-650 focus:ring-0 cursor-pointer"
                  />
                  <span>{ef}</span>
                </label>
              ))}
              <div className="mt-1 flex items-center gap-1 text-[9px] text-slate-500 bg-slate-50 p-1 rounded border border-slate-200">
                <span>🎫 Verified safe formula values</span>
              </div>
            </div>
          </div>

        </div>

        {/* ================= TABLE: INFESTATION MONITORING ================= */}
        <div className="border border-slate-800 bg-white mb-3 p-3 space-y-3">
          <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
            {/* Invisibly balanced block to ensure title is perfectly centered on desktop */}
            <div className="w-[85px] hidden md:block" />
            
            <div className="text-center flex-1">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-slate-955 font-bold">
                <span className="text-indigo-650">🪳</span>
                <span>{language === "bn" ? "পোকা-মাকড় উপদ্রব নিরীক্ষণ" : "Infestation Monitoring Table"}</span>
              </span>
            </div>
            
            {/* Header permanent add row & preset buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={addNewEmptyPestRow}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded text-[10px] transition cursor-pointer flex items-center gap-1 active:scale-95 shadow-md relative z-50 pointer-events-auto"
                title={language === "bn" ? "নতুন কীট-পতঙ্গ সারি যোগ করুন" : "Add custom pest row"}
              >
                <Plus className="w-3 h-3" />
                <span>{language === "bn" ? "সারি যোগ করুন" : "Add Row"}</span>
              </button>
            </div>
          </div>

          <div className="hidden md:block border border-slate-300 rounded-lg overflow-visible max-w-full">
            <table className="w-full border-collapse text-left text-[10px] overflow-visible">
              <thead>
                <tr className="bg-slate-900 text-white font-serif uppercase tracking-wider border-b border-slate-800 text-[10px]">
                  <th className="py-1 px-2 border-r border-slate-700 w-[170px]">{language === "bn" ? "আক্রান্ত কীট-পতঙ্গ / প্রজাতি" : "Pest Type / Species"}</th>
                  <th className="py-1 px-2 border-r border-slate-700 w-[55px] text-center">{language === "bn" ? "নেই" : "None"}</th>
                  <th className="py-1 px-2 border-r border-slate-700 w-[55px] text-center">{language === "bn" ? "কম" : "Low"}</th>
                  <th className="py-1 px-2 border-r border-slate-700 w-[55px] text-center">{language === "bn" ? "মাঝারি" : "Medium"}</th>
                  <th className="py-1 px-2 border-r border-slate-700 w-[55px] text-center">{language === "bn" ? "বেশি" : "High"}</th>
                  <th className="py-1 px-2 border-r border-slate-700">{language === "bn" ? "উপদ্রব স্থান" : "Findings Location"}</th>
                  <th className="py-1 px-2 w-[55px] text-center">{language === "bn" ? "অ্যাকশন" : "Action"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {infestEntriesList.map((item, idx) => {
                  const isNothingIdentified = item.pestName === "Nothing identified";
                  return (
                    <tr key={idx} className={`group ${isNothingIdentified ? "bg-emerald-50/20 font-semibold" : "hover:bg-amber-50/20"}`}>
                      <td className="py-1.5 px-2 font-black border-r border-slate-300 text-slate-850 bg-slate-50/60 min-w-[150px] relative overflow-visible">
                        <div className="flex flex-col gap-1.5 w-full">
                          <div className="flex items-center gap-1.5 min-w-0 justify-between">
                            
                            {/* Pest quick selector button */}
                            <div className="relative inline-block shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  setActivePestPopoverIdx(activePestPopoverIdx === idx ? null : idx);
                                  setActiveChemPopoverIdx(null);
                                }}
                                className={`p-1 rounded transition cursor-pointer flex items-center justify-center ${
                                  activePestPopoverIdx === idx
                                    ? "bg-indigo-600 text-white shadow"
                                    : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                                }`}
                                title={language === "bn" ? "কীট-পতঙ্গ দ্রুত প্রিসেট" : "Quick Pest Presets"}
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>

                              {/* Pest Preset Popover */}
                              {activePestPopoverIdx === idx && (
                                <div className="absolute left-0 mt-2 bg-white border border-slate-300 rounded-xl shadow-2xl p-3 z-50 w-64 text-left text-slate-900 border-t-4 border-t-indigo-600 animate-fadeIn font-sans">
                                  <div className="flex items-center justify-between border-b pb-1 mb-2">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-900 flex items-center gap-1">
                                      <span>🪳</span>
                                      <span>{language === "bn" ? "কীট-পতঙ্গ বাছাই করুন" : "Pest Species list"}</span>
                                    </span>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActivePestPopoverIdx(null);
                                      }}
                                      className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>

                                  {/* Custom input inside popover */}
                                  <div className="space-y-1 mb-2.5 bg-indigo-50/40 p-1.5 rounded-lg border border-indigo-100">
                                    <span className="block text-[8.5px] font-black text-indigo-700 uppercase">
                                      {language === "bn" ? "নতুন কীট-পতঙ্গের নাম:" : "Custom Pest Name:"}
                                    </span>
                                    <div className="flex items-center gap-1">
                                      <input
                                        type="text"
                                        placeholder={language === "bn" ? "যেমন: উইপোকা" : "e.g. Termites"}
                                        value={customPestInput}
                                        onChange={(e) => setCustomPestInput(e.target.value)}
                                        className="flex-1 text-[9.5px] font-bold border border-slate-300 focus:border-indigo-650 rounded bg-white px-2 py-0.5 outline-none text-slate-900"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const cleanName = customPestInput.trim();
                                          if (cleanName) {
                                            handlePestChange(idx, "pestName", cleanName);
                                            setCustomPestInput("");
                                            setActivePestPopoverIdx(null);
                                          }
                                        }}
                                        className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded text-[9px] transition cursor-pointer shrink-0"
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>

                                  {/* Quick Pest Presets */}
                                  <span className="block text-[8.5px] font-extrabold text-slate-500 uppercase tracking-wide mb-1.5">
                                    📌 {language === "bn" ? "অনুরোধ তালিকা বাছাই:" : "Click preset to select:"}
                                  </span>
                                  <div className="grid grid-cols-2 gap-1 max-h-[140px] overflow-y-auto pr-1">
                                    {[
                                      { label: language === "bn" ? "তেলাপোকা" : "Cockroaches", value: "Cockroaches", icon: "🪳" },
                                      { label: language === "bn" ? "পিঁপড়া" : "Ants", value: "Ants", icon: "🐜" },
                                      { label: language === "bn" ? "ইঁদুর" : "Rodents", value: "Rodents", icon: "🐀" },
                                      { label: language === "bn" ? "ড্রেন ফ্লাই" : "Drain Fly", value: "Drain Fly", icon: "🪰" },
                                      { label: language === "bn" ? "ছাড়পোকা" : "Bed Bugs", value: "Bed Bugs", icon: "🪵" },
                                      { label: language === "bn" ? "মশা" : "Mosquitoes", value: "Mosquitoes", icon: "🦟" },
                                      { label: language === "bn" ? "উইপোকা" : "Termites", value: "Termites", icon: "🪵" },
                                      { label: language === "bn" ? "মাছি" : "Flies", value: "Flies", icon: "🪰" }
                                    ].map((p, pIdx) => (
                                      <button
                                        key={pIdx}
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          e.preventDefault();
                                          handlePestChange(idx, "pestName", p.value);
                                          setActivePestPopoverIdx(null);
                                        }}
                                        className="px-1.5 py-0.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-[9px] text-slate-800 font-bold rounded transition cursor-pointer flex items-center gap-1 active:scale-95 text-left"
                                      >
                                        <span className="shrink-0">{p.icon}</span>
                                        <span className="truncate">{p.label}</span>
                                      </button>
                                    ))}
                                    
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handlePestChange(idx, "pestName", "Nothing identified");
                                        handlePestChange(idx, "level", "None");
                                        handlePestChange(idx, "location", "N/A");
                                        setActivePestPopoverIdx(null);
                                      }}
                                      className="col-span-2 px-1.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-850 font-black rounded text-[9px] transition cursor-pointer flex items-center justify-center gap-1 active:scale-95 mt-1"
                                    >
                                      <span>✅</span>
                                      <span>{language === "bn" ? "সব সাফ করুন" : "Set Empty / None"}</span>
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>

                            <input
                              type="text"
                              value={item.pestName}
                              onChange={(e) => handlePestChange(idx, "pestName", e.target.value)}
                              placeholder={language === "bn" ? "কীট-পতঙ্গের নাম..." : "Type pest name..."}
                              className={`flex-1 font-bold bg-transparent border-none outline-none focus:ring-1 focus:ring-indigo-200 rounded px-1 text-[11px] min-w-0 ${
                                isNothingIdentified ? "text-emerald-800 italic" : "text-slate-900"
                              }`}
                            />
                            
                            {/* Beaker trigger icon for linking/setting chemicals on that row */}
                            <div className="relative inline-block shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveChemPopoverIdx(activeChemPopoverIdx === idx ? null : idx);
                                  setActivePestPopoverIdx(null);
                                }}
                                className={`p-1 rounded transition cursor-pointer flex items-center justify-center ${
                                  activeChemPopoverIdx === idx
                                    ? "bg-emerald-600 text-white shadow-xs"
                                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-150"
                                }`}
                                title={language === "bn" ? "কেমিক্যাল তালিকা ও নতুন সেট করার অপশন" : "Link Chemical Presets or add new"}
                              >
                                <FlaskConical className="w-3 h-3" />
                              </button>

                              {/* Dropdown Popover */}
                              {activeChemPopoverIdx === idx && (
                                <div className="absolute left-0 mt-2 bg-white border border-slate-300 rounded-xl shadow-2xl p-3 z-50 w-64 text-left text-slate-900 border-t-4 border-t-emerald-600 animate-fadeIn font-sans">
                                  <div className="flex items-center justify-between border-b pb-1.5 mb-2">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-950 flex items-center gap-1">
                                      <span>🧪</span>
                                      <span>{language === "bn" ? "কেমিক্যাল বাছাই ও সেট" : "Chemical Picker"}</span>
                                    </span>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveChemPopoverIdx(null);
                                      }}
                                      className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>

                                  {/* Select from current registered presets */}
                                  <span className="block text-[8.5px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                                    📋 {language === "bn" ? "নিচের যেকোনোটি বাছাই করুন:" : "Quick click preset list:"}
                                  </span>
                                  <div className="grid grid-cols-1 gap-1 max-h-[120px] overflow-y-auto pr-1 mb-2 border-b pb-1.5 border-slate-100">
                                    {chemicalPresets.map((chemItem, cIdx) => (
                                      <button
                                        key={cIdx}
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          e.preventDefault();
                                          addChemicalPresetToTable({
                                            name: chemItem.name,
                                            dilution: chemItem.dilution,
                                            used: chemItem.used
                                          });
                                          // Immediately save chemical to this specific pest row
                                          handlePestChange(idx, "chemical", `${chemItem.name} (${chemItem.used})`);
                                          setActiveChemPopoverIdx(null);
                                        }}
                                        className="px-2 py-1 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-[9px] text-slate-800 font-bold rounded-lg transition cursor-pointer flex items-center justify-between active:scale-95 text-left w-full"
                                      >
                                        <span className="flex items-center gap-1 min-w-0">
                                          <span className="shrink-0">{chemItem.icon || "🧪"}</span>
                                          <span className="font-bold truncate">{chemItem.name}</span>
                                        </span>
                                        <span className="text-[8.5px] text-slate-500 shrink-0 font-mono italic">{chemItem.used}</span>
                                      </button>
                                    ))}
                                  </div>

                                  {/* Option to create/set a new chemical preset right here */}
                                  <div className="space-y-1 bg-emerald-50/45 p-1.5 rounded-lg border border-emerald-150">
                                    <span className="block text-[8.5px] font-extrabold text-emerald-800 uppercase tracking-wide">
                                      ⚙️ {language === "bn" ? "নতুন কেমিক্যালঃ" : "Register custom chemical:"}
                                    </span>
                                    <div className="space-y-1">
                                      <input
                                        type="text"
                                        placeholder={language === "bn" ? "কেমিক্যাল নাম..." : "Chemical name..."}
                                        value={popoverNewChemName}
                                        onChange={(e) => setPopoverNewChemName(e.target.value)}
                                        className="w-full text-[9px] font-bold border border-slate-300 focus:border-emerald-600 rounded bg-white px-1.5 py-0.5 outline-none text-slate-900"
                                      />
                                      <div className="flex gap-1">
                                        <input
                                          type="text"
                                          placeholder="Dilution"
                                          value={popoverNewChemDilution}
                                          onChange={(e) => setPopoverNewChemDilution(e.target.value)}
                                          className="flex-1 text-[8.5px] font-semibold border border-slate-250 rounded bg-white px-1 py-0.5 outline-none text-slate-900 w-10"
                                        />
                                        <input
                                          type="text"
                                          placeholder="Quantity"
                                          value={popoverNewChemQty}
                                          onChange={(e) => setPopoverNewChemQty(e.target.value)}
                                          className="flex-1 text-[8.5px] font-semibold border border-slate-250 rounded bg-white px-1 py-0.5 outline-none text-slate-900 w-10"
                                        />
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            const name = popoverNewChemName.trim();
                                            if (name) {
                                              addNewChemicalPreset(name, popoverNewChemDilution, popoverNewChemQty);
                                              addChemicalPresetToTable({
                                                name,
                                                dilution: popoverNewChemDilution,
                                                used: popoverNewChemQty
                                              });
                                              // Immediately save chemical to this specific pest row
                                              handlePestChange(idx, "chemical", `${name} (${popoverNewChemQty})`);
                                              setPopoverNewChemName("");
                                              setPopoverNewChemDilution("10ml / 1 L");
                                              setPopoverNewChemQty("75 ml");
                                              setActiveChemPopoverIdx(null);
                                            }
                                          }}
                                          className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[8.5px] transition cursor-pointer shrink-0 active:scale-95"
                                        >
                                          {language === "bn" ? "সেট" : "Set"}
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Beautiful display of the Bound Chemical under the input field */}
                          {item.chemical && (
                            <div className="group/chem text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-250 rounded px-1.5 py-0.5 inline-flex items-center justify-between gap-1 w-full max-w-full font-sans animate-fadeIn">
                              <span className="truncate font-semibold text-[8.5px]">🧪 {item.chemical}</span>
                              <button
                                type="button"
                                onClick={() => handlePestChange(idx, "chemical", "")}
                                className="text-red-500 hover:text-red-700 font-extrabold text-[9.5px] ml-1 bg-white hover:bg-red-50 rounded-full w-3.5 h-3.5 flex items-center justify-center cursor-pointer transition shrink-0 opacity-0 group-hover/chem:opacity-100 transition-opacity duration-150"
                                title="Clear Chemical"
                              >
                                ×
                              </button>
                            </div>
                          )}
                        </div>
                      </td>

                      {["None", "Low", "Medium", "High"].map((levelOpt) => {
                        const isSelected = item.level === levelOpt;
                        return (
                          <td 
                            key={levelOpt} 
                            className="py-1 px-1 border-r border-slate-300 text-center cursor-pointer hover:bg-slate-50 transition-colors select-none"
                            onClick={() => handlePestChange(idx, "level", levelOpt)}
                          >
                            <div className="flex justify-center items-center">
                              <div className={`w-5 h-5 border flex items-center justify-center rounded transition-all duration-155 ${
                                isSelected 
                                  ? "border-slate-800 bg-indigo-55/10 text-indigo-900 font-extrabold shadow-sm scale-110" 
                                  : "border-slate-350 bg-white"
                              }`}>
                                {isSelected ? (
                                  <span className="font-extrabold text-[12.5px] leading-none text-indigo-600">✔</span>
                                ) : null}
                              </div>
                            </div>
                          </td>
                        );
                      })}

                      <td className="py-0.5 px-2 border-r border-slate-300">
                        <input
                          type="text"
                          placeholder={isNothingIdentified ? "N/A" : (language === "bn" ? "উপদ্রব স্থান লিখুন..." : "Where identified...")}
                          disabled={isNothingIdentified}
                          value={item.location}
                          onChange={(e) => handlePestChange(idx, "location", e.target.value)}
                          className="w-full bg-transparent border-none outline-none focus:ring-1 focus:ring-indigo-200 rounded px-1 py-0.5 text-[10px] disabled:text-slate-400 disabled:cursor-not-allowed text-slate-800 font-bold"
                        />
                      </td>

                      <td className="py-1 px-1 text-center relative">
                        {isNothingIdentified ? (
                          <p className="text-[9.5px] text-slate-400 italic py-1">N/A</p>
                        ) : (
                          <button
                            type="button"
                            onClick={() => removePestRow(idx)}
                            className="p-1 text-red-650 hover:text-red-800 hover:bg-red-50 rounded transition cursor-pointer outline-none inline-flex items-center justify-center mx-auto"
                            title="Remove Row"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile-optimised touch-friendly infestation cards block */}
          <div className="block md:hidden space-y-4">
            {infestEntriesList.map((item, idx) => {
              const isNothingIdentified = item.pestName === "Nothing identified";
              return (
                <div 
                  key={idx} 
                  className={`border-2 rounded-xl p-4 space-y-3 relative transition shadow-sm ${
                    isNothingIdentified 
                      ? "border-emerald-300 bg-emerald-50/10" 
                      : "border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between border-b pb-2 border-slate-100">
                    <span className="text-[11px] font-black text-indigo-950 uppercase tracking-widest flex items-center gap-1">
                      <span>🪳</span>
                      <span>
                        {language === "bn" ? `কীট-পতঙ্গ #${idx + 1}` : `Pest Record #${idx + 1}`}
                      </span>
                    </span>
                    {!isNothingIdentified && (
                      <button
                        type="button"
                        onClick={() => removePestRow(idx)}
                        className="p-1 px-2 bg-red-50 hover:bg-red-100 text-red-650 rounded-lg text-xs font-bold flex items-center gap-1 active:scale-95 transition cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>{language === "bn" ? "মুছুন" : "Delete"}</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-1 relative">
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                      {language === "bn" ? "পোকার নাম বা প্রজাতি" : "Pest Name or Species"}
                    </label>
                    <div className="flex items-center gap-1.5 relative">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => {
                            setActivePestPopoverIdx(activePestPopoverIdx === idx ? null : idx);
                            setActiveChemPopoverIdx(null);
                          }}
                          className={`p-2 rounded-lg transition border cursor-pointer flex items-center justify-center ${
                            activePestPopoverIdx === idx
                              ? "bg-indigo-600 text-white border-indigo-600"
                              : "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
                          }`}
                          title={language === "bn" ? "কীট-পতঙ্গ দ্রুত প্রিসেট" : "Quick Pest Presets"}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Relative Popup placement for Mobile Pests Selector */}
                        {activePestPopoverIdx === idx && (
                          <div className="absolute left-0 mt-2 bg-white border border-slate-300 rounded-xl shadow-2xl p-3 z-50 w-64 text-left text-slate-900 border-t-4 border-t-indigo-600 animate-fadeIn font-sans">
                            <div className="flex items-center justify-between border-b pb-1 mb-2">
                              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-900 flex items-center gap-1">
                                <span>🪳</span>
                                <span>{language === "bn" ? "কীট-পতঙ্গ বাছাই করুন" : "Pest Species list"}</span>
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActivePestPopoverIdx(null);
                                }}
                                className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>

                            <div className="space-y-1 mb-2.5 bg-indigo-50/40 p-1.5 rounded-lg border border-indigo-100">
                              <span className="block text-[8.5px] font-black text-indigo-700 uppercase">
                                {language === "bn" ? "নতুন কীট-পতঙ্গের নাম:" : "Custom Pest Name:"}
                              </span>
                              <div className="flex items-center gap-1">
                                <input
                                  type="text"
                                  placeholder={language === "bn" ? "যেমন: উইপোকা" : "e.g. Termites"}
                                  value={customPestInput}
                                  onChange={(e) => setCustomPestInput(e.target.value)}
                                  className="flex-1 text-[9.5px] font-bold border border-slate-300 focus:border-indigo-650 rounded bg-white px-2 py-0.5 outline-none text-slate-900"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const cleanName = customPestInput.trim();
                                    if (cleanName) {
                                      handlePestChange(idx, "pestName", cleanName);
                                      setCustomPestInput("");
                                      setActivePestPopoverIdx(null);
                                    }
                                  }}
                                  className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded text-[9px] transition cursor-pointer shrink-0"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            <span className="block text-[8.5px] font-extrabold text-slate-500 uppercase tracking-wide mb-1.5">
                              📌 {language === "bn" ? "অনুরোধ তালিকা বাছাই:" : "Click preset to select:"}
                            </span>
                            <div className="grid grid-cols-2 gap-1 max-h-[140px] overflow-y-auto pr-1">
                              {[
                                { label: language === "bn" ? "তেলাপোকা" : "Cockroaches", value: "Cockroaches", icon: "🪳" },
                                { label: language === "bn" ? "পিঁপড়া" : "Ants", value: "Ants", icon: "🐜" },
                                { label: language === "bn" ? "ইঁদুর" : "Rodents", value: "Rodents", icon: "🐀" },
                                { label: language === "bn" ? "ড্রেন ফ্লাই" : "Drain Fly", value: "Drain Fly", icon: "🪰" },
                                { label: language === "bn" ? "ছাড়পোকা" : "Bed Bugs", value: "Bed Bugs", icon: "🪵" },
                                { label: language === "bn" ? "মশা" : "Mosquitoes", value: "Mosquitoes", icon: "🦟" },
                                { label: language === "bn" ? "উইপোকা" : "Termites", value: "Termites", icon: "🪵" },
                                { label: language === "bn" ? "মাছি" : "Flies", value: "Flies", icon: "🪰" }
                              ].map((p, pIdx) => (
                                <button
                                  key={pIdx}
                                  type="button"
                                  onClick={() => {
                                    handlePestChange(idx, "pestName", p.value);
                                    setActivePestPopoverIdx(null);
                                  }}
                                  className="px-1.5 py-0.5 bg-slate-55 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-[9px] text-slate-800 font-bold rounded transition cursor-pointer flex items-center gap-1 active:scale-95 text-left"
                                >
                                  <span className="shrink-0">{p.icon}</span>
                                  <span className="truncate">{p.label}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <input
                        type="text"
                        value={item.pestName}
                        onChange={(e) => handlePestChange(idx, "pestName", e.target.value)}
                        placeholder={language === "bn" ? "কীট-পতঙ্গের নাম লিখুন..." : "Type pest name..."}
                        className={`flex-1 font-extrabold bg-slate-50 border border-slate-300 focus:border-indigo-600 rounded-lg px-3 py-2 text-xs outline-none ${
                          isNothingIdentified ? "text-emerald-800 italic" : "text-slate-900"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Level Pllls Selector */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                      {language === "bn" ? "আক্রান্তের মাত্রা" : "Infestation Level"}
                    </label>
                    <div className="grid grid-cols-4 gap-1">
                      {["None", "Low", "Medium", "High"].map((levelOpt) => {
                        const isSelected = item.level === levelOpt;
                        let textLabel = levelOpt;
                        if (language === "bn") {
                          if (levelOpt === "None") textLabel = "নেই";
                          else if (levelOpt === "Low") textLabel = "কম";
                          else if (levelOpt === "Medium") textLabel = "মাঝারি";
                          else if (levelOpt === "High") textLabel = "বেশি";
                        }
                        return (
                          <button
                            key={levelOpt}
                            type="button"
                            onClick={() => handlePestChange(idx, "level", levelOpt)}
                            className={`py-1.5 px-0.5 rounded-lg border text-center font-bold text-[10px] transition cursor-pointer select-none active:scale-95 ${
                              isSelected
                                ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            {textLabel}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                      {language === "bn" ? "উপদ্রব স্থান" : "Findings Location"}
                    </label>
                    <input
                      type="text"
                      placeholder={isNothingIdentified ? "N/A" : (language === "bn" ? "উপদ্রব স্থান লিখুন..." : "Where identified...")}
                      disabled={isNothingIdentified}
                      value={item.location}
                      onChange={(e) => handlePestChange(idx, "location", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 focus:border-indigo-600 font-bold rounded-lg px-3 py-2 text-xs outline-none text-slate-850"
                    />
                  </div>

                  {/* Chemical Selector on mobile row card */}
                  <div className="space-y-1 relative">
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                      {language === "bn" ? "রাসায়নিক লিংক বা প্রিসেট যোগ" : "Link Pesticide / Chemical"}
                    </label>
                    <div className="flex items-center gap-1.5 relative">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveChemPopoverIdx(activeChemPopoverIdx === idx ? null : idx);
                            setActivePestPopoverIdx(null);
                          }}
                          className={`p-2 rounded-lg transition border cursor-pointer flex items-center justify-center ${
                            activeChemPopoverIdx === idx
                              ? "bg-emerald-600 text-white border-emerald-650"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                          }`}
                          title={language === "bn" ? "কেমিক্যাল তালিকা" : "Chemical Presets"}
                        >
                          <FlaskConical className="w-4 h-4" />
                        </button>

                        {/* Absolute inner dropdown inside the absolute mobile space to prevent out-of-screen clipping */}
                        {activeChemPopoverIdx === idx && (
                          <div className="absolute left-0 mt-2 bg-white border border-slate-300 rounded-xl shadow-2xl p-3 z-50 w-64 text-left text-slate-900 border-t-4 border-t-emerald-600 animate-fadeIn font-sans">
                            <div className="flex items-center justify-between border-b pb-1.5 mb-2">
                              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-955 flex items-center gap-1">
                                <span>🧪</span>
                                <span>{language === "bn" ? "কেমিক্যাল তালিকা ও বাছাই" : "Link Chemical"}</span>
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveChemPopoverIdx(null);
                                }}
                                className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>

                            <span className="block text-[8.5px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                              📋 {language === "bn" ? "নিচের যেকোনোটি বাছাই করুন:" : "Quick click preset list:"}
                            </span>
                            <div className="grid grid-cols-1 gap-1 max-h-[140px] overflow-y-auto pr-1 mb-2 border-b pb-1.5 border-slate-100">
                              {chemicalPresets.map((chemItem, cIdx) => (
                                <button
                                  key={cIdx}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    addChemicalPresetToTable({
                                      name: chemItem.name,
                                      dilution: chemItem.dilution,
                                      used: chemItem.used
                                    });
                                    handlePestChange(idx, "chemical", `${chemItem.name} (${chemItem.used})`);
                                    setActiveChemPopoverIdx(null);
                                  }}
                                  className="px-2 py-1.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-[10px] text-slate-800 font-bold rounded-lg transition cursor-pointer flex items-center justify-between active:scale-95 text-left w-full"
                                >
                                  <span className="flex items-center gap-1 min-w-0">
                                    <span className="shrink-0">{chemItem.icon || "🧪"}</span>
                                    <span className="font-bold truncate">{chemItem.name}</span>
                                  </span>
                                  <span className="text-[9px] text-slate-500 shrink-0 font-mono italic">{chemItem.used}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                        <span className="text-[10px] text-slate-450 italic">
                          {language === "bn" ? "বাম পাশের আইকনে ক্লিক করে কেমিক্যাল অ্যাসাইন করুন" : "Click flask icon to choose presets"}
                        </span>
                      </div>

                      {item.chemical && (
                        <div className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg px-2.5 py-1.5 flex items-center justify-between gap-1 w-full font-sans animate-fadeIn mt-1.5">
                          <span className="truncate font-bold">🧪 {item.chemical}</span>
                          <button
                            type="button"
                            onClick={() => handlePestChange(idx, "chemical", "")}
                            className="text-red-500 hover:text-red-700 font-black text-[12px] bg-white hover:bg-red-50 rounded-full w-5 h-5 flex items-center justify-center cursor-pointer transition shrink-0 shadow-xs"
                            title="Clear Chemical"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ================= TABLE: PESTICIDE / CHEMICAL USAGE ================= */}
          <div className="border border-slate-800 bg-white mb-3 p-3 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-2.5 relative">
              {/* Centered Heading segment */}
              <div className="text-center mx-auto flex-1">
                <span className="block text-[11px] font-black uppercase tracking-wider text-slate-955 text-center">
                  {language === "bn" ? "পেস্টিসাইড বা কেমিক্যাল ব্যবহার লেজার" : "Chemical / Pesticide Usage Ledger"}
                </span>
                <p className="text-[9.5px] text-slate-500 italic text-center">
                  {language === "bn" 
                    ? "টেবিলের পাশে থাকা আইকনে ক্লিক করে সরাসরি যেকোনো কেমিক্যাল প্রিসেট ড্রপডাউন থেকে সিলেক্ট করুন।" 
                    : "Click the beaker icon next to input to select any pre-registered chemical preset."}
                </p>
              </div>
              
              <button
                id="row-add-chem-master"
                type="button"
                onClick={addChemicalUsedRow}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded text-[11px] transition cursor-pointer self-center sm:self-auto sm:absolute sm:right-0 active:scale-95 relative z-50 pointer-events-auto shadow-md"
              >
                + {language === "bn" ? "নতুন সারি যোগ করুন" : "Add Row"}
              </button>
            </div>


            <div className="hidden md:block border border-slate-300 rounded-lg overflow-visible max-w-full relative z-20">
            <table className="w-full border-collapse text-left text-[10px]">
              <thead>
                <tr className="bg-slate-900 text-white font-serif uppercase tracking-wider border-b border-slate-800 text-[10px]">
                  <th className="py-1.5 px-2 border-r border-slate-700">{language === "bn" ? "পেস্টিসাইড / রাসায়নিক নাম" : "Pesticide / Chemical Brand"}</th>
                  <th className="py-1.5 px-2 border-r border-slate-700 w-[200px]">{language === "bn" ? "মিশ্রণ বা ডিলুশন অনুপাত" : "Dilution Rate"}</th>
                  <th className="py-1.5 px-2 border-r border-slate-700 w-[180px]">{language === "bn" ? "মোট ব্যবহৃত পরিমাণ" : "Total Quantity Used"}</th>
                  <th className="py-1.5 px-2 w-[45px] text-center">{language === "bn" ? "মুছুন" : "Del"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {chemicalsUsed.map((chem, idx) => (
                  <tr key={idx} className="group hover:bg-amber-50/20">
                    {/* Pesticide / Chemical Name Column */}
                    <td className={`py-1 px-2 border-r border-slate-300 text-slate-850 bg-slate-50/20 relative overflow-visible ${
                      activePesticideDropdownIdx === idx ? "z-40" : "z-10"
                    }`}>
                      <div className="flex items-center gap-1.5 w-full justify-between">
                        <input
                          type="text"
                          placeholder={language === "bn" ? "পেস্টিসাইড / কেমিক্যালের নাম..." : "Pesticide / Chemical name..."}
                          value={chem.name}
                          onChange={(e) => handleChemicalChange(idx, "name", e.target.value)}
                          onFocus={() => {
                            setActivePesticideDropdownIdx(idx);
                            setActiveDilutionDropdownIdx(null);
                          }}
                          onClick={() => {
                            setActivePesticideDropdownIdx(idx);
                            setActiveDilutionDropdownIdx(null);
                          }}
                          className="flex-1 font-bold bg-transparent border-none outline-none focus:ring-1 focus:ring-indigo-150 rounded px-1.5 py-0.5 text-[10.5px] text-slate-900 min-w-0"
                        />
                        
                        <div className={`relative inline-block shrink-0 ${activePesticideDropdownIdx === idx ? "z-50" : "z-10"}`}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActivePesticideDropdownIdx(activePesticideDropdownIdx === idx ? null : idx);
                              setActiveDilutionDropdownIdx(null);
                            }}
                            className={`p-1 rounded transition cursor-pointer flex items-center justify-center ${
                              activePesticideDropdownIdx === idx
                                ? "bg-indigo-600 text-white shadow-xs"
                                : "bg-indigo-50 text-indigo-700 hover:bg-indigo-150"
                            }`}
                            title={language === "bn" ? "কেমিক্যাল তালিকা" : "Chemical Presets"}
                          >
                            <FlaskConical className="w-3.5 h-3.5" />
                          </button>

                          {activePesticideDropdownIdx === idx && (
                            <div className="absolute right-0 mt-1.5 bg-white border border-slate-350 rounded-xl shadow-2xl p-2.5 z-50 w-64 text-left text-slate-900 border-t-4 border-t-indigo-600 animate-fadeIn font-sans">
                              <div className="flex items-center justify-between border-b pb-1.5 mb-2">
                                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-955 flex items-center gap-1">
                                  <span>🧪</span>
                                  <span>{language === "bn" ? "কেমিক্যাল প্রিসেট" : "Chemical Picker"}</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActivePesticideDropdownIdx(null);
                                    setEditingDropdownPresetIdx(null);
                                    setPopoverNewChemName("");
                                  }}
                                  className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>

                              <span className="block text-[8.5px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                                📋 {language === "bn" ? "নিচের যেকোনোটি বাছাই করুন:" : "Quick click preset list:"}
                              </span>

                              <div className="grid grid-cols-1 gap-1 max-h-[120px] overflow-y-auto pr-1 mb-2 border-b pb-1.5 border-slate-100">
                                {chemicalPresets.map((preset, cIdx) => (
                                  <div
                                    key={cIdx}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      e.preventDefault();
                                      handleChemicalChange(idx, "name", preset.name);
                                      setActivePesticideDropdownIdx(null);
                                      setEditingDropdownPresetIdx(null);
                                      setPopoverNewChemName("");
                                    }}
                                    className="group/item px-2 py-1 flex items-center justify-between hover:bg-emerald-50/55 border border-slate-150 hover:border-emerald-250 rounded-md transition duration-150 text-slate-800 text-[10px] w-full gap-1 cursor-pointer"
                                    title={language === "bn" ? "অটোপেস্ট করতে ক্লিক করুন" : "Click to auto-paste/apply"}
                                  >
                                    <div className="flex-1 flex items-center justify-between min-w-0 pr-1">
                                      <span className="flex items-center gap-1.5 min-w-0">
                                        <span className="shrink-0 text-xs">{preset.icon || "🧪"}</span>
                                        <span className="font-extrabold truncate text-slate-900">{preset.name}</span>
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-0.5 shrink-0 opacity-45 group-hover/item:opacity-100 transition-opacity">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          e.preventDefault();
                                          setEditingDropdownPresetIdx(cIdx);
                                          setPopoverNewChemName(preset.name);
                                        }}
                                        className="p-1 hover:bg-indigo-50 hover:text-indigo-650 text-slate-400 rounded transition active:scale-90"
                                        title={language === "bn" ? "এডিট করুন" : "Edit preset"}
                                      >
                                        <Edit3 className="w-2.5 h-2.5" />
                                      </button>
                                      
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          e.preventDefault();
                                          if (confirm(language === "bn" ? `"${preset.name}" মুছতে চান?` : `Are you sure you want to delete "${preset.name}"?`)) {
                                            deleteChemicalPreset(cIdx);
                                            if (editingDropdownPresetIdx === cIdx) {
                                              setEditingDropdownPresetIdx(null);
                                              setPopoverNewChemName("");
                                            }
                                          }
                                        }}
                                        className="p-1 hover:bg-red-50 hover:text-red-650 text-slate-400 rounded transition active:scale-90"
                                        title={language === "bn" ? "মুছুন" : "Delete preset"}
                                      >
                                        <Trash2 className="w-2.5 h-2.5" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {editingDropdownPresetIdx !== null ? (
                                <div className="space-y-1 bg-indigo-50/70 p-1.5 rounded-lg border border-indigo-150">
                                  <div className="flex items-center justify-between">
                                    <span className="block text-[8.5px] font-extrabold text-indigo-850 uppercase tracking-wide">
                                      ✏️ {language === "bn" ? "প্রিসেট এডিট করুনঃ" : "Edit Preset Detail:"}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setEditingDropdownPresetIdx(null);
                                        setPopoverNewChemName("");
                                      }}
                                      className="text-[8px] font-bold text-slate-400 hover:text-red-500 hover:underline"
                                    >
                                      {language === "bn" ? "বাতিল" : "Cancel"}
                                    </button>
                                  </div>
                                  <div className="flex gap-1">
                                    <input
                                      type="text"
                                      placeholder={language === "bn" ? "নাম..." : "Name..."}
                                      value={popoverNewChemName}
                                      onChange={(e) => setPopoverNewChemName(e.target.value)}
                                      onClick={(e) => e.stopPropagation()}
                                      className="flex-1 text-[9px] font-bold border border-slate-250 rounded bg-white px-1.5 py-0.5 outline-none text-slate-900 focus:border-indigo-500 min-w-0"
                                    />
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        const name = popoverNewChemName.trim();
                                        if (name && editingDropdownPresetIdx !== null) {
                                          updateChemicalPreset(editingDropdownPresetIdx, name, "", "");
                                          handleChemicalChange(idx, "name", name);
                                          setEditingDropdownPresetIdx(null);
                                          setPopoverNewChemName("");
                                          setActivePesticideDropdownIdx(null);
                                        }
                                      }}
                                      className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded text-[8.5px] cursor-pointer transition active:scale-95 shadow-xs shrink-0"
                                    >
                                      {language === "bn" ? "সেভ" : "Save"}
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-1 bg-emerald-50/45 p-1.5 rounded-lg border border-emerald-150">
                                  <span className="block text-[8.5px] font-extrabold text-emerald-800 uppercase tracking-white">
                                    ⚙️ {language === "bn" ? "নতুন কেমিক্যাল যোগ করুনঃ" : "Add custom chemical preset:"}
                                  </span>
                                  <div className="flex gap-1">
                                    <input
                                      type="text"
                                      placeholder={language === "bn" ? "যেমনঃ ডেল্টাসাইড স্যন" : "e.g. Deltacide"}
                                      value={popoverNewChemName}
                                      onChange={(e) => setPopoverNewChemName(e.target.value)}
                                      onClick={(e) => e.stopPropagation()}
                                      className="flex-1 text-[9px] font-bold border border-slate-250 rounded bg-white px-1.5 py-0.5 outline-none text-slate-900 focus:border-emerald-500 min-w-0"
                                    />
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        const name = popoverNewChemName.trim();
                                        if (name) {
                                          addNewChemicalPreset(name, "", "");
                                          handleChemicalChange(idx, "name", name);
                                          setPopoverNewChemName("");
                                          setActivePesticideDropdownIdx(null);
                                        }
                                      }}
                                      className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[8.5px] cursor-pointer transition active:scale-95 shadow-xs shrink-0"
                                    >
                                      {language === "bn" ? "যোগ" : "Add"}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Dilution Rate Column */}
                    <td className={`py-1 px-2 border-r border-slate-300 text-slate-850 bg-slate-50/20 relative overflow-visible ${
                      activeDilutionDropdownIdx === idx ? "z-40" : "z-10"
                    }`}>
                      <div className="flex items-center gap-1.5 w-full justify-between">
                        <input
                          type="text"
                          placeholder={language === "bn" ? "যেমনঃ ১০ এমএল / ১ লিটার" : "e.g. 10ml / 1 L, 1:100"}
                          value={chem.dilution || ""}
                          onChange={(e) => handleChemicalChange(idx, "dilution", e.target.value)}
                          onFocus={() => {
                            setActiveDilutionDropdownIdx(idx);
                            setActivePesticideDropdownIdx(null);
                          }}
                          onClick={() => {
                            setActiveDilutionDropdownIdx(idx);
                            setActivePesticideDropdownIdx(null);
                          }}
                          className="flex-1 font-semibold bg-transparent border-none outline-none focus:ring-1 focus:ring-indigo-150 rounded px-1.5 py-0.5 text-[10.5px] text-slate-900 min-w-0"
                        />
                        
                        <div className={`relative inline-block shrink-0 ${activeDilutionDropdownIdx === idx ? "z-50" : "z-10"}`}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDilutionDropdownIdx(activeDilutionDropdownIdx === idx ? null : idx);
                              setActivePesticideDropdownIdx(null);
                            }}
                            className={`p-1 rounded transition cursor-pointer flex items-center justify-center ${
                              activeDilutionDropdownIdx === idx
                                ? "bg-indigo-600 text-white shadow-xs"
                                : "bg-indigo-50 text-indigo-700 hover:bg-indigo-150"
                            }`}
                            title={language === "bn" ? "ডিলুশন প্রিসেট" : "Dilution Suggestions"}
                          >
                            <Droplet className="w-3.5 h-3.5" />
                          </button>

                          {activeDilutionDropdownIdx === idx && (
                            <div className="absolute right-0 mt-1.5 bg-white border border-slate-350 rounded-xl shadow-2xl p-2.5 z-50 w-56 text-left text-slate-900 border-t-4 border-t-indigo-600 animate-fadeIn font-sans">
                              <div className="flex items-center justify-between border-b pb-1.5 mb-2">
                                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-955 flex items-center gap-1">
                                  <span>💧</span>
                                  <span>{language === "bn" ? "ডিলুশন প্রিসেট" : "Dilution Presets"}</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveDilutionDropdownIdx(null);
                                    setPopoverNewDilution("");
                                  }}
                                  className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>

                              <span className="block text-[8.5px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                                📋 {language === "bn" ? "যেকোনোটি বাছাই করুন:" : "Quick click suggestion:"}
                              </span>

                              <div className="grid grid-cols-1 gap-1 max-h-[110px] overflow-y-auto pr-1 mb-2 border-b pb-1.5 border-slate-100">
                                {dilutionPresets.map((presetDil, cIdx) => (
                                  <div
                                    key={cIdx}
                                    className="group/item px-2 py-1 flex items-center justify-between hover:bg-emerald-50/50 border border-slate-150 hover:border-emerald-250 rounded-md transition duration-150 text-slate-800 text-[10px] w-full gap-1 cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      e.preventDefault();
                                      handleChemicalChange(idx, "dilution", presetDil);
                                      setActiveDilutionDropdownIdx(null);
                                      setPopoverNewDilution("");
                                    }}
                                  >
                                    <div className="flex-1 font-bold text-slate-900 text-[10px]">
                                      {presetDil}
                                    </div>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        deleteDilutionPreset(presetDil);
                                      }}
                                      className="p-1 hover:bg-red-55 hover:text-red-700 text-slate-400 rounded transition active:scale-90 opacity-0 group-hover/item:opacity-100"
                                      title={language === "bn" ? "মুছুন" : "Delete preset"}
                                    >
                                      <Trash2 className="w-2.5 h-2.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>

                              {/* Simple dilution adder section inside the dropdown */}
                              <div className="space-y-1 bg-emerald-50/45 p-1.5 rounded-lg border border-emerald-150">
                                <span className="block text-[8.5px] font-extrabold text-emerald-800 uppercase tracking-wide">
                                  ⚙️ {language === "bn" ? "নতুন ডিলুশন যোগ করুনঃ" : "Add custom dilution suggestion:"}
                                </span>
                                <div className="flex gap-1">
                                  <input
                                    type="text"
                                    placeholder={language === "bn" ? "যেমনঃ ১০ এমএল / ১ লি." : "e.g. 10ml / 1 L"}
                                    value={popoverNewDilution}
                                    onChange={(e) => setPopoverNewDilution(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex-1 text-[9px] font-bold border border-slate-250 rounded bg-white px-1.5 py-0.5 outline-none text-slate-900 focus:border-emerald-500 min-w-0"
                                  />
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      e.preventDefault();
                                      const clean = popoverNewDilution.trim();
                                      if (clean) {
                                        if (!dilutionPresets.includes(clean)) {
                                          setDilutionPresets([...dilutionPresets, clean]);
                                        }
                                        handleChemicalChange(idx, "dilution", clean);
                                        setPopoverNewDilution("");
                                        setActiveDilutionDropdownIdx(null);
                                      }
                                    }}
                                    className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[8.5px] cursor-pointer transition active:scale-95 shadow-xs shrink-0"
                                  >
                                    {language === "bn" ? "যোগ" : "Add"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Used Quantity Column */}
                    <td className="py-1 px-2 border-r border-slate-300">
                      <input
                        type="text"
                        placeholder={language === "bn" ? "যেমনঃ ৫০ এমএল, ১০ গ্রাম" : "e.g. 50 ml, 10g"}
                        value={chem.used || ""}
                        onChange={(e) => handleChemicalChange(idx, "used", e.target.value)}
                        onFocus={() => {
                          setActivePesticideDropdownIdx(null);
                          setActiveDilutionDropdownIdx(null);
                        }}
                        className="w-full bg-transparent border-none outline-none focus:ring-1 focus:ring-indigo-150 rounded px-1.5 py-0.5 text-[10.5px] text-slate-900 font-bold"
                      />
                    </td>

                    {/* Delete Column */}
                    <td className="py-2 px-1 text-center w-[45px]">
                      <button
                        type="button"
                        onClick={() => removeChemicalUsedRow(idx)}
                        className="p-1 hover:bg-red-55 hover:text-red-700 text-red-500 rounded transition cursor-pointer shrink-0 mx-auto"
                        title={language === "bn" ? "মুছুন" : "Delete chemical row"}
                      >
                        <Trash2 className="w-3.5 h-3.5 mx-auto" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="block md:hidden space-y-4 pt-3">
            {chemicalsUsed.map((chem, idx) => (
              <div key={idx} className="border-2 rounded-xl p-4 space-y-3 relative transition shadow-sm border-slate-300 bg-white">
                <div className="flex items-center justify-between border-b pb-2 border-slate-100">
                  <span className="text-[11px] font-black text-indigo-950 uppercase tracking-widest flex items-center gap-1">
                    <span>🧪</span>
                    <span>{language === "bn" ? `কেমিক্যাল / পেস্টিসাইড #${idx + 1}` : `Chemical Record #${idx + 1}`}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => removeChemicalUsedRow(idx)}
                    className="p-1 px-2 bg-red-50 hover:bg-red-100 text-red-650 rounded-lg text-xs font-bold flex items-center gap-1 active:scale-95 transition cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{language === "bn" ? "মুছুন" : "Delete"}</span>
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                    {language === "bn" ? "পেস্টিসাইড / রাসায়নিক নাম" : "Pesticide / Chemical Brand"}
                  </label>
                  <input
                    type="text"
                    placeholder={language === "bn" ? "পেস্টিসাইড / কেমিক্যালের নাম..." : "Pesticide / Chemical name..."}
                    value={chem.name}
                    onChange={(e) => handleChemicalChange(idx, "name", e.target.value)}
                    className="font-extrabold bg-slate-50 border border-slate-300 focus:border-indigo-600 rounded-lg w-full px-3 py-2 text-xs outline-none text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                      {language === "bn" ? "মিশ্রণ অনুপাত" : "Dilution Rate"}
                    </label>
                    <input
                      type="text"
                      placeholder={language === "bn" ? "যেমনঃ ১০ এমএল / ১ লি." : "e.g. 10ml/1L"}
                      value={chem.dilution}
                      onChange={(e) => handleChemicalChange(idx, "dilution", e.target.value)}
                      className="font-extrabold bg-slate-50 border border-slate-300 focus:border-indigo-600 rounded-lg w-full px-3 py-2 text-xs outline-none text-slate-900"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                      {language === "bn" ? "মোট পরিমাণ" : "Quantity Used"}
                    </label>
                    <input
                      type="text"
                      placeholder={language === "bn" ? "যেমনঃ ৫০ এমএল" : "e.g. 50ml"}
                      value={chem.used}
                      onChange={(e) => handleChemicalChange(idx, "used", e.target.value)}
                      className="font-extrabold bg-slate-50 border border-slate-300 focus:border-indigo-600 rounded-lg w-full px-3 py-2 text-xs outline-none text-slate-900"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ================= SANITATION & PROOFING CONDITIONS checkboxes ================= */}
        <div className="border border-slate-800 bg-white flex flex-col divide-y divide-slate-800 mb-3">
          
          {/* Sanitation block */}
          <div className="p-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3 flex-wrap">
            <div className="md:w-3/12 min-w-[130px] text-left">
              <span className="text-[10.5px] font-extrabold text-slate-900 uppercase">
                {language === "bn" ? "স্যানিটেশন কন্ডিশন:" : "Sanitation Condition:"}
              </span>
            </div>
            <div className="md:w-4/12 flex items-center justify-start md:justify-center gap-3">
              {(["Poor", "Satisfactory", "Good"] as const).map(lev => (
                <label key={lev} className="flex items-center gap-1.5 cursor-pointer font-bold select-none text-[10px]">
                  <input
                    type="radio"
                    name="sanitation-level"
                    checked={sanitation === lev}
                    onChange={() => setSanitation(lev)}
                    className="w-4 h-4 text-emerald-600 rounded cursor-pointer accent-emerald-500"
                  />
                  <span>{lev === "Good" ? (language === "bn" ? "ভালো" : "Good") : lev === "Satisfactory" ? (language === "bn" ? "সন্তোষজনক" : "Satisfactory") : (language === "bn" ? "খারাপ" : "Poor")}</span>
                </label>
              ))}
            </div>
            <div className="md:w-4.5/12 w-full md:flex-1 text-left">
              <input
                type="text"
                placeholder={language === "bn" ? "রিমার্কস বা মন্তব্য লিখুন..." : "Enter sanitation remarks / comments..."}
                value={sanitationRemarks}
                onChange={(e) => setSanitationRemarks(e.target.value)}
                className="w-full bg-[#FFFDF9] border border-slate-300 text-slate-900 font-bold rounded px-2.5 py-1 focus:ring-1 focus:ring-emerald-500 text-[10.5px] outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Proofing block */}
          <div className="p-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3 flex-wrap">
            <div className="md:w-3/12 min-w-[130px] text-left">
              <span className="text-[10.5px] font-extrabold text-slate-900 uppercase">
                {language === "bn" ? "প্রুফিং কন্ডিশন:" : "Proofing Condition:"}
              </span>
            </div>
            <div className="md:w-4/12 flex items-center justify-start md:justify-center gap-3">
              {(["Poor", "Satisfactory", "Good"] as const).map(lev => (
                <label key={lev} className="flex items-center gap-1.5 cursor-pointer font-bold select-none text-[10px]">
                  <input
                    type="radio"
                    name="proofing-level"
                    checked={proofing === lev}
                    onChange={() => setProofing(lev)}
                    className="w-4 h-4 text-indigo-650 rounded cursor-pointer accent-indigo-505"
                  />
                  <span>{lev === "Good" ? (language === "bn" ? "ভালো" : "Good") : lev === "Satisfactory" ? (language === "bn" ? "সন্তোষজনক" : "Satisfactory") : (language === "bn" ? "খারাপ" : "Poor")}</span>
                </label>
              ))}
            </div>
            <div className="md:w-4.5/12 w-full md:flex-1 text-left">
              <input
                type="text"
                placeholder={language === "bn" ? "রিমার্কস বা মন্তব্য লিখুন..." : "Enter proofing remarks / comments..."}
                value={proofingRemarks}
                onChange={(e) => setProofingRemarks(e.target.value)}
                className="w-full bg-[#FFFDF9] border border-slate-300 text-slate-900 font-bold rounded px-2.5 py-1 focus:ring-1 focus:ring-indigo-550 text-[10.5px] outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

        </div>

        {/* ================= RECOMMENDATIONS BLOCK ================= */}
        <div className="border border-slate-800 bg-white p-3 mb-3">
          <div className="text-center pb-2 border-b border-dashed border-slate-300 mb-2.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-955 block">
              {language === "bn" ? "⭐ রিকমেন্ডেশন ও সংশোধন গাইডলাইন" : "⭐ Recommendations & Corrective Guidelines"}
            </span>
          </div>
          <div className="relative">
            <textarea
              ref={recommendationsRef}
              rows={4}
              placeholder={language === "bn" ? "এখানে আপনার পরামর্শ বা রিকমেন্ডেশন লিখুন..." : "Enter client corrective recommendations here..."}
              value={recommendations}
              onChange={(e) => setRecommendations(e.target.value)}
              className="w-full bg-[#FFFDF9] hover:bg-white text-slate-955 rounded-lg border border-slate-350 p-3 text-[10.5px] font-bold leading-relaxed outline-none focus:ring-1 focus:ring-indigo-300 focus:border-indigo-500 transition overflow-hidden min-h-[95px]"
            />
          </div>
        </div>

        {/* ================= TEAM & ASSIGNED MEMBERS =============== */}
        <div 
          id="master-teamMembers"
          className="hidden"
        >
          {validationErrors.teamMembers && (
            <span className="absolute -top-3.5 right-2 bg-sky-600 text-white text-[9px] px-2 py-0.5 rounded shadow-lg font-black animate-pulse z-50 whitespace-nowrap">
              ⚠️ {language === "bn" ? "কমপক্ষে একজন সদস্য যোগ করুন!" : "Add at least 1 Attending Crew member!"}
            </span>
          )}
          
          <div className="border-b border-dashed pb-1 mb-2">
            <span className="block text-[11px] font-black uppercase text-slate-950">
              {language === "bn" ? "অ্যাসাইনকৃত টিম মেম্বার ও ক্রু" : "Team Members / Attending Crew:"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-2.5">
            {/* Box 1: Engineers */}
            <div className="border border-slate-350 rounded-lg p-2.5 bg-slate-50/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-dashed border-slate-250 pb-1 mb-2">
                  <span className="font-extrabold text-[10.5px] text-indigo-950 flex items-center gap-1">
                    ⚙️ {language === "bn" ? "১. ইঞ্জিনিয়ার" : "1. Engineer"}
                    <span className="text-[9px] font-bold text-indigo-505 bg-indigo-50 px-1 rounded-sm">
                      {teamMembers.filter(t => t.position === "Engineer").length}
                    </span>
                  </span>
                </div>
                <div className="space-y-1.5 mb-2">
                  {teamMembers.map((member, index) => {
                    if (member.position !== "Engineer") return null;
                    return (
                      <div key={index} className="flex items-center gap-1.5 bg-white p-1 rounded border border-slate-200">
                        <input
                          type="text"
                          placeholder={language === "bn" ? "ইঞ্জিনিয়ারের নাম" : "Engineer Name"}
                          value={member.name}
                          onChange={(e) => {
                            const copy = [...teamMembers];
                            copy[index].name = e.target.value;
                            setTeamMembers(copy);
                          }}
                          className="bg-[#FFFDF9] border border-slate-250 text-slate-900 font-bold rounded px-1.5 py-1 w-full focus:ring-1 text-[10.5px] outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => removeTeamMemberRow(index)}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition cursor-pointer shrink-0"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                  {teamMembers.filter(t => t.position === "Engineer").length === 0 && (
                    <p className="text-[9px] text-slate-400 italic py-2 text-center">
                      {language === "bn" ? "কোন ইঞ্জিনিয়ার নেই" : "No engineers listed"}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => addTeamMemberRow("Engineer")}
                className="w-full mt-1.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-extrabold rounded text-[9.5px] cursor-pointer transition active:scale-95 text-center"
              >
                + {language === "bn" ? "ইঞ্জিনিয়ার যোগ করুন" : "Add Engineer"}
              </button>
            </div>

            {/* Box 2: Supervisors */}
            <div className="border border-slate-350 rounded-lg p-2.5 bg-slate-50/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-dashed border-slate-250 pb-1 mb-2">
                  <span className="font-extrabold text-[10.5px] text-indigo-950 flex items-center gap-1">
                    👮‍♂️ {language === "bn" ? "২. সুপারভাইজার" : "2. Supervisor"}
                    <span className="text-[9px] font-bold text-indigo-505 bg-indigo-50 px-1 rounded-sm">
                      {teamMembers.filter(t => t.position === "Supervisor").length}
                    </span>
                  </span>
                </div>
                <div className="space-y-1.5 mb-2">
                  {teamMembers.map((member, index) => {
                    if (member.position !== "Supervisor") return null;
                    return (
                      <div key={index} className="flex items-center gap-1.5 bg-white p-1 rounded border border-slate-200">
                        <input
                          type="text"
                          placeholder={language === "bn" ? "সুপারভাইজার নাম" : "Supervisor Name"}
                          value={member.name}
                          onChange={(e) => {
                            const copy = [...teamMembers];
                            copy[index].name = e.target.value;
                            setTeamMembers(copy);
                          }}
                          className="bg-[#FFFDF9] border border-slate-250 text-slate-900 font-bold rounded px-1.5 py-1 w-full focus:ring-1 text-[10.5px] outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => removeTeamMemberRow(index)}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition cursor-pointer shrink-0"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                  {teamMembers.filter(t => t.position === "Supervisor").length === 0 && (
                    <p className="text-[9px] text-slate-400 italic py-2 text-center">
                      {language === "bn" ? "কোন সুপারভাইজার নেই" : "No supervisors listed"}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => addTeamMemberRow("Supervisor")}
                className="w-full mt-1.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-extrabold rounded text-[9.5px] cursor-pointer transition active:scale-95 text-center"
              >
                + {language === "bn" ? "সুপারভাইজার যোগ করুন" : "Add Supervisor"}
              </button>
            </div>

            {/* Box 3: Technicians & Operators */}
            <div className="border border-slate-350 rounded-lg p-2.5 bg-slate-50/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-dashed border-slate-250 pb-1 mb-2">
                  <span className="font-extrabold text-[10.5px] text-indigo-950 flex items-center gap-1">
                    🛠️ {language === "bn" ? "৩. টেকনিশিয়ান ও অপারেটর" : "3. Technicians & Operators"}
                    <span className="text-[9px] font-bold text-indigo-505 bg-indigo-50 px-1 rounded-sm">
                      {teamMembers.filter(t => t.position !== "Engineer" && t.position !== "Supervisor").length}
                    </span>
                  </span>
                </div>
                <div className="space-y-1.5 mb-2">
                  {teamMembers.map((member, index) => {
                    if (member.position === "Engineer" || member.position === "Supervisor") return null;
                    return (
                      <div key={index} className="flex items-center gap-1.5 bg-white p-1 rounded border border-slate-200 animate-fadeIn">
                        <div className="flex flex-col gap-1 w-full text-left">
                          <input
                            type="text"
                            placeholder={language === "bn" ? "নাম" : "Name"}
                            value={member.name}
                            onChange={(e) => {
                              const copy = [...teamMembers];
                              copy[index].name = e.target.value;
                              setTeamMembers(copy);
                            }}
                            className="bg-[#FFFDF9] border border-slate-250 text-slate-900 font-bold rounded px-1.5 py-0.5 w-full focus:ring-1 text-[10.5px] outline-none"
                          />
                          <div className="flex items-center gap-1">
                            <span className="text-[8px] font-bold text-slate-500 uppercase">{language === "bn" ? "পদবী:" : "Role:"}</span>
                            <select
                              value={member.position || "Technician"}
                              onChange={(e) => {
                                const copy = [...teamMembers];
                                copy[index].position = e.target.value;
                                setTeamMembers(copy);
                              }}
                              className="bg-white border border-slate-250 text-[8.5px] font-extrabold text-slate-700 rounded px-1 outline-none cursor-pointer focus:ring-1"
                            >
                              <option value="Technician">{language === "bn" ? "টেকনিশিয়ান" : "Technician"}</option>
                              <option value="Operator">{language === "bn" ? "অপারেটর" : "Operator"}</option>
                            </select>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeTeamMemberRow(index)}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition cursor-pointer shrink-0 self-center"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                  {teamMembers.filter(t => t.position !== "Engineer" && t.position !== "Supervisor").length === 0 && (
                    <p className="text-[9px] text-slate-400 italic py-2 text-center">
                      {language === "bn" ? "কোন কর্মী নেই" : "No crew listed"}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1 mt-1.5">
                <button
                  type="button"
                  onClick={() => addTeamMemberRow("Technician")}
                  className="py-1 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-extrabold rounded text-[8.5px] cursor-pointer transition active:scale-95 text-center"
                >
                  + {language === "bn" ? "টেকনিশিয়ান" : "Technician"}
                </button>
                <button
                  type="button"
                  onClick={() => addTeamMemberRow("Operator")}
                  className="py-1 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-extrabold rounded text-[8.5px] cursor-pointer transition active:scale-95 text-center"
                >
                  + {language === "bn" ? "অপারেটর" : "Operator"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ================= JOB COMPLETION STATUS & ADDITIONAL NOTES =============== */}
        <div className="hidden">
          <div className="hidden">
            <span className="block text-[10.5px] font-black uppercase text-slate-955 border-b border-dashed pb-1">
              {language === "bn" ? "কাজ সম্পন্ন করার ধরন:" : "Job Completion Status:"}
            </span>
            <div className="grid grid-cols-2 gap-2 mt-1.5 no-print">
              <button
                type="button"
                id="btn-status-completed"
                onClick={() => setWorkStatus("Completed")}
                className={`p-2 rounded-lg border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
                  workStatus === "Completed"
                    ? "bg-emerald-550/15 border-emerald-500 text-emerald-800 font-extrabold"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-bold"
                }`}
              >
                <span className="text-sm">⚡</span>
                <span className="text-[10.5px] leading-tight font-extrabold">
                  {language === "bn" ? "সম্পূর্ণ সম্পন্ন" : "Fully Completed"}
                </span>
                <span className="text-[8.5px] opacity-75 font-normal">
                  {language === "bn" ? "ক্লিনিকের সব কাজ শেষ" : "All tasks complete"}
                </span>
              </button>

              <button
                type="button"
                id="btn-status-partial"
                onClick={() => {
                  setWorkStatus("Partially Completed");
                  if (additionalNotes.toLowerCase().includes("fully completed")) {
                    setAdditionalNotes(
                      language === "bn"
                        ? "✓ সম্পন্ন কাজসমূহ:\n- কাজ শুরু করা হয়েছে।\n\n⚠ বাকি কাজসমূহ:\n- কিছু নির্দিষ্ট স্থান ও বাথরুম প্রুফিং বাকি রয়ে গেছে।"
                        : "✓ Tasks Completed:\n- Treatment initialized in main rooms.\n\n⚠ Pending Work:\n- Insect control block and restroom proofing still remaining."
                    );
                  }
                }}
                className={`p-2 rounded-lg border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
                  workStatus === "Partially Completed"
                    ? "bg-amber-500/15 border-amber-500 text-amber-800 font-extrabold"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-bold"
                }`}
              >
                <span className="text-sm">⏳</span>
                <span className="text-[10.5px] leading-tight font-extrabold">
                  {language === "bn" ? "আংশিক বা অর্ধেক সম্পন্ন" : "Partially Completed"}
                </span>
                <span className="text-[8.5px] opacity-75 font-normal">
                  {language === "bn" ? "কিছু কাজ বাকি আছে" : "Some work pending"}
                </span>
              </button>
            </div>
          </div>

          <div>
            <span className="block text-[10.5px] font-black uppercase text-slate-955 border-b border-dashed pb-1">
              Work Synopsis & Additional Notes:
            </span>
            <textarea
              rows={3}
              placeholder="Clinical treatment operation note details..."
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              className="w-full bg-slate-50 text-slate-955 rounded border border-slate-300 p-2 text-[10.5px] font-bold mt-1 outline-none focus:bg-white"
            />
          </div>
        </div>

        {/* ================= SMART INVOICING / BILLING SECURE PANEL ================= */}
        <div className={`border border-slate-800 bg-amber-50/25 p-3 mb-3 text-xs rounded-lg border-dashed ${isFreeService ? "no-print hidden sm:block" : ""}`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-1.5 border-b border-slate-300">
            <span className="font-extrabold text-slate-900 flex items-center gap-1 text-[11px]">
              <DollarSign className="w-3.5 h-3.5 text-slate-705" />
              <span>Smart Billing Account Ledger (VAT Compliant)</span>
            </span>
            
            <label className="flex items-center gap-1 text-[10px] bg-indigo-50 border border-indigo-200 text-indigo-700 px-2.5 py-1 rounded font-bold cursor-pointer hover:bg-indigo-100 select-none no-print">
              <input
                type="checkbox"
                checked={isFreeService}
                onChange={(e) => {
                  setIsFreeService(e.target.checked);
                  if (e.target.checked) {
                    setInvoiceAmount(0);
                    setDiscount(0);
                  } else {
                    setInvoiceAmount(1200);
                  }
                }}
                className="w-3.5 h-3.5 text-indigo-650 cursor-pointer rounded"
              />
              <span>Free Service (No Billing Account Card)</span>
            </label>
          </div>

          {!isFreeService ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 text-[10px]">
              <div className="space-y-0.5">
                <span className="text-slate-600 block">Net Fee Amount (AED):</span>
                <input
                  type="number"
                  placeholder="AED 1200"
                  value={invoiceAmount}
                  onChange={(e) => setInvoiceAmount(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-[10.5px] font-bold text-slate-900"
                />
              </div>

              <div className="space-y-0.5">
                <span className="text-slate-600 block">Discount Allowed (AED):</span>
                <input
                  type="number"
                  placeholder="Discount"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-[10.5px] font-bold text-slate-900"
                />
              </div>

              <div className="space-y-0.5">
                <span className="text-slate-600 block">VAT TAX Tax (5% UAE):</span>
                <span className="p-1.5 bg-slate-100 border rounded block font-mono font-bold text-slate-700 text-[10px]">
                  AED {vat}
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-slate-650 block font-bold">Calculated Total:</span>
                <span className="p-1 px-2.5 bg-emerald-100 text-emerald-805 border border-emerald-200 rounded block font-mono font-black text-xs">
                  AED {total}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-[9.5px] text-slate-500 italic pt-1 text-center">
              * marked free/charge waived under parent institutional contract agreements.
            </p>
          )}
        </div>

        {/* ================= SIGNATURE PADS SECTION ================= */}
        <div className="border border-slate-800 bg-white p-2.5 mb-4 space-y-2">
          <span className="block text-[10.5px] font-black uppercase text-slate-950 border-b border-dashed pb-1">
            {language === "bn" ? "অনুমোদিত ডিজিটাল স্বাক্ষরসমূহ (ঐচ্ছিক):" : "Authorized Digital Signatures (Optional):"}
          </span>
          <div className="flex flex-col md:flex-row gap-3">
            <SignaturePad id="client" title={language === "bn" ? "ক্লায়েন্ট সিগনেচার (ঐচ্ছিক)" : "Client Signature (Optional)"} subtitle="Click or swipe touch inside to draw" onSaveSignature={setClientSign} initialUrl={clientSign} />
            <SignaturePad id="attendant" title={language === "bn" ? "ইঞ্জিনিয়ার এবং টেকনিশিয়ান স্বাক্ষর (ঐচ্ছিক)" : "Engineer & Technician Signature (Optional)"} subtitle="Sign to confirm treatment details" onSaveSignature={setTechSign} initialUrl={techSign} />
          </div>
        </div>

        {/* ================= SUBMIT ACTION BAR ================= */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3 no-print">
          {createdReport && (
            <button
              id="report-print-draft-btn"
              type="button"
              onClick={handleDownloadPDF}
              className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-slate-100 font-extrabold rounded-lg text-xs uppercase tracking-wider border border-slate-700 cursor-pointer shadow active:scale-[0.99] transition-transform flex items-center justify-center gap-2 animate-fade-in"
            >
              📥 {language === "bn" ? "রিপোর্ট ডাউনলোড করুন / প্রিন্ট PDF" : "Download / Print Form PDF"}
            </button>
          )}

          <button
            id="report-submit-final-pad-btn"
            type="submit"
            className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-lg text-xs uppercase tracking-widest border border-slate-800 cursor-pointer shadow-lg active:scale-[0.99] transition-transform"
          >
            🚀 {editingReport ? (
              language === "bn" ? "রিপোর্ট সেভ ও আপডেট করুন" : "COMPILE & UPDATE REGISTERED DEVICE LOG"
            ) : (
              language === "bn" ? "রিপোর্ট সাবমিট ও রেজিস্টার করুন" : "COMPILE & REGISTER LOG TO LEDGER"
            )}
          </button>
        </div>

        {/* ================= PAPER FOOTER INFO ================= */}
        <div className="mt-4 border-t border-slate-300 pt-2 text-center text-[8.5px] text-slate-400 font-serif leading-relaxed">
          <p className="font-bold">Tel: 04-2959731, Fax: 04-2959732, P.O Box: 181244, Deira, Dubai - United Arab Emirates</p>
          <p>E-mail: pestcontrol@alwafagroupuae.com, wafastaruae@yahoo.com | Website: www.alwafagroupuae.com</p>
        </div>

      </form>

      {/* ================= DYNAMIC SUCCESS & DOWNLOAD PDF MODAL OVERLAY ================= */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md no-print-important">
          <div className="bg-[#FFFDF3] border-2 border-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-fade-in text-slate-900 border-t-8 border-t-emerald-500 font-sans">
            
            {/* Close 'X' Button in Top Right */}
            <button
              type="button"
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 bg-slate-100 hover:bg-slate-200 rounded-full transition cursor-pointer"
              title={language === "bn" ? "বন্ধ করুন" : "Close Overlay"}
            >
              <X className="w-4 h-4 text-slate-700" />
            </button>

            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-4xl mx-auto shadow-sm">
                🎉
              </div>
              <h3 className="text-lg font-black uppercase tracking-wider text-slate-1050 font-serif">
                {editingReport ? (
                  language === "bn" ? "রিপোর্ট সফলভাবে আপডেট হয়েছে!" : "Report Updated Successfully!"
                ) : (
                  language === "bn" ? "রিপোর্ট সফলভাবে রেজিস্টার হয়েছে!" : "Report Registered Successfully!"
                )}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-bold">
                {editingReport ? (
                  language === "bn" 
                    ? `ট্রিটমেন্ট অপারেশন লগ কার্ড SL No. ${slNo} সফলভাবে আপডেট এবং সেভ করা হয়েছে।`
                    : `Treatment Operation log SL No. ${slNo} has been successfully updated and saved into the central registry database.`
                ) : (
                  language === "bn" 
                    ? `ট্রিটমেন্ট অপারেশন লগ কার্ড SL No. ${slNo} ডিজিটাল ক্লাউড লেজার ডাটাবেসে সফলভাবে সংরক্ষিত হয়েছে।`
                    : `Treatment Operation log SL No. ${slNo} has been successfully compiled and saved into the central registry database.`
                )}
              </p>

              <div className="p-3.5 bg-slate-100 rounded-xl border border-slate-200 text-left space-y-1.5 font-mono text-[10.5px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Log ID:</span>
                  <span className="font-bold text-slate-800">{createdReport?.id || `REP-${slNo}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Client / Facility:</span>
                  <span className="font-bold text-slate-800 truncate max-w-[200px]">{facilityName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Operation Date:</span>
                  <span className="font-bold text-slate-800">{dateOfOperation}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-lg text-xs uppercase tracking-widest cursor-pointer transition active:scale-95 shadow-md flex items-center justify-center gap-2"
                >
                  📥 {language === "bn" ? "রিপোর্ট ডাউনলোড করুন / প্রিন্ট PDF" : "Download & Print PDF Report"}
                </button>
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSuccessModal(false);
                      setTab("completed_registry");
                    }}
                    className="py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold rounded-lg text-xs uppercase tracking-wide cursor-pointer transition text-center"
                  >
                    📂 {language === "bn" ? "রেজিস্ট্রি দেখুন" : "View Registry"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSuccessModal(false);
                      setTab("dashboard");
                    }}
                    className="py-2.5 bg-slate-200 hover:bg-[#E2DECD] text-slate-700 font-bold rounded-lg text-xs uppercase tracking-wide cursor-pointer transition text-center border border-slate-350"
                  >
                    🏠 {language === "bn" ? "ড্যাশবোর্ড ফিরে যান" : "Dashboard"}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full py-2.5 bg-[#FFFDF3] hover:bg-slate-100 text-slate-700 font-bold border border-slate-350 rounded-lg text-xs uppercase tracking-wide cursor-pointer transition text-center"
                >
                  ✍️ {language === "bn" ? "ফর্মে ফিরে যান (এডিট / নতুন রিপোর্ট)" : "Close & Stay on Form"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
