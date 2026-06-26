import { useState, useEffect, useRef } from "react";
import { 
  Menu, 
  X, 
  Globe, 
  User, 
  TrendingUp, 
  HelpCircle, 
  ShieldCheck, 
  Award,
  BookOpen,
  Briefcase,
  Layers,
  Activity
} from "lucide-react";

import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import CompletedRegistry from "./components/CompletedRegistry";
import ClientDirectory from "./components/ClientDirectory";
import MasterForm from "./components/MasterForm";
import EngineeringReport from "./components/EngineeringReport";
import ChemicalInventory from "./components/ChemicalInventory";
import Technicians from "./components/Technicians";
import AIPestDetection from "./components/AIPestDetection";
import ClientPortalView from "./components/ClientPortalView";
import AdminSettings from "./components/AdminSettings";
import LocationsRegistry, { INITIAL_LOCATIONS_REGISTRY } from "./components/LocationsRegistry";
import SupervisorsRegistry from "./components/SupervisorsRegistry";
import LoginScreen from "./components/LoginScreen";
import AlWafaLogo from "./components/AlWafaLogo";
import ProjectScheduler from "./components/ProjectScheduler";
import CustomServiceModule from "./components/CustomServiceModule";
import TimesheetPayroll from "./components/TimesheetPayroll";

import { AppLanguage, UserRole, ReportItem, DICTIONARY, AppUser, LocationRegistryItem, SupervisorRegistryItem } from "./types";
import { INITIAL_SUPERVISORS_REGISTRY } from "./initialSupervisors";
import { 
  getDocuments, 
  saveDocument, 
  deleteDocument, 
  getBrandingData, 
  saveBrandingData,
  subscribeCollection,
  subscribeBrandingData
} from "./localDatabase";


export default function App() {

  // ERP Passcode authentication state
  const [appPassword, setAppPassword] = useState<string>(() => {
    return localStorage.getItem("ALW_STAR_APP_PASSWORD") || "123456";
  });

  // App theme customizer properties
  const [themeMode, setThemeMode] = useState<"dark" | "light">(() => {
    return (localStorage.getItem("ALW_THEME_MODE") as "dark" | "light") || "dark";
  });
  const [themeColor, setThemeColor] = useState<string>(() => {
    return localStorage.getItem("ALW_THEME_COLOR") || "emerald";
  });

  const handleSetThemeMode = (mode: "dark" | "light") => {
    setThemeMode(mode);
    localStorage.setItem("ALW_THEME_MODE", mode);
  };

  const handleSetThemeColor = (color: string) => {
    setThemeColor(color);
    localStorage.setItem("ALW_THEME_COLOR", color);
  };

  // Generate dynamic CSS variables to perfectly override classes globally
  useEffect(() => {
    const accents: Record<string, { hex: string; hover: string; light: string }> = {
      emerald: { hex: "#2DD4BF", hover: "#14B8A6", light: "rgba(45, 212, 191, 0.15)" }, // Soft Teal/Mint
      amber: { hex: "#FBBF24", hover: "#F59E0B", light: "rgba(251, 191, 36, 0.15)" }, // Soft Amber/Peach
      sky: { hex: "#38BDF8", hover: "#0EA5E9", light: "rgba(56, 189, 248, 0.15)" }, // Soft Sky
      rose: { hex: "#FB7185", hover: "#F43F5E", light: "rgba(251, 113, 133, 0.15)" }, // Soft Rose/Blush
      crimson: { hex: "#F43F5E", hover: "#E11D48", light: "rgba(244, 63, 94, 0.15)" }, // Soft Crimson
      indigo: { hex: "#818CF8", hover: "#6366F1", light: "rgba(129, 140, 248, 0.15)" }, // Soft Indigo
      violet: { hex: "#A78BFA", hover: "#8B5CF6", light: "rgba(167, 139, 250, 0.15)" }, // Soft Lavender
      orange: { hex: "#FB923C", hover: "#F97316", light: "rgba(251, 146, 60, 0.15)" }, // Sunset Orange
      gold: { hex: "#FACC15", hover: "#EAB308", light: "rgba(250, 204, 21, 0.15)" }, // Luxury Gold
      fuchsia: { hex: "#E879F9", hover: "#D946EF", light: "rgba(232, 121, 249, 0.15)" }, // Electric Fuchsia
      turquoise: { hex: "#22D3EE", hover: "#06B6D4", light: "rgba(34, 211, 238, 0.15)" }, // Ocean Turquoise
      lime: { hex: "#A3E635", hover: "#84CC16", light: "rgba(163, 230, 53, 0.15)" }, // Electric Lime
      sapphire: { hex: "#60A5FA", hover: "#3B82F6", light: "rgba(96, 165, 250, 0.15)" }, // Royal Sapphire
      magenta: { hex: "#F472B6", hover: "#EC4899", light: "rgba(244, 114, 182, 0.15)" }, // Hot Pink
      forest: { hex: "#4ADE80", hover: "#22C55E", light: "rgba(74, 222, 128, 0.15)" }, // Forest Green
    };

    const choice = accents[themeColor] || accents.emerald;
    let styles = "";

    const accentOverrides = `
      /* Accent Color Overrides globally for both themes */
      .bg-\\[\\#10B981\\], .bg-emerald-500 { background-color: var(--color-accent) !important; color: #FFFFFF !important; }
      .hover\\:bg-emerald-400:hover, .hover\\:bg-\\[\\#059669\\]:hover { background-color: var(--color-accent-hover) !important; }
      .hover\\:bg-\\[\\#10B981\\]\\/10:hover, .hover\\:bg-\\[\\#10B981\\]\\/20:hover { background-color: var(--color-accent-light) !important; }
      .text-\\[\\#10B981\\], .text-emerald-500, .text-emerald-400 { color: var(--color-accent) !important; }
      .hover\\:text-\\[\\#10B981\\]:hover, .group:hover .group-hover\\:text-\\[\\#10B981\\] { color: var(--color-accent) !important; }
      .border-\\[\\#10B981\\], .border-emerald-500, .border-emerald-400 { border-color: var(--color-accent) !important; }
      .hover\\:border-\\[\\#10B981\\]:hover, .hover\\:border-emerald-500:hover { border-color: var(--color-accent) !important; }
      .hover\\:border-\\[\\#10B981\\]\\/50:hover { border-color: var(--color-accent) !important; opacity: 0.8; }
      .bg-\\[\\#10B981\\]\\/10, .bg-\\[\\#10B981\\]\\/15, .bg-\\[\\#10B981\\]\\/20, .bg-emerald-500\\/10, .bg-emerald-500\\/20 { background-color: var(--color-accent-light) !important; }
      .text-white.bg-\\[\\#10B981\\] { color: #FFFFFF !important; }
      .focus\\:border-\\[\\#10B981\\]:focus { border-color: var(--color-accent) !important; }
      .from-\\[\\#10B981\\]\\/20 { --tw-gradient-from: var(--color-accent-light) !important; }
      .from-emerald-500 { --tw-gradient-from: var(--color-accent) !important; }
      .to-emerald-500\\/5 { --tw-gradient-to: transparent !important; }
      .ring-emerald-500 { --tw-ring-color: var(--color-accent) !important; }
      .shadow-emerald-500\\/20 { --tw-shadow-color: var(--color-accent-light) !important; --tw-shadow: var(--tw-shadow-colored) !important; }
    `;

    if (themeMode === "light") {
      styles = `
        :root {
          --color-bg-primary: #F8FAFC !important;
          --color-bg-secondary: #FFFFFF !important;
          --color-bg-sidebar: #0F172A !important;
          --color-bg-pane: #FFFFFF !important;
          --color-bg-input: #FFFFFF !important;
          --color-text-primary: #0F172A !important;
          --color-text-secondary: #334155 !important;
          --color-text-muted: #64748B !important;
          --color-border-primary: #E2E8F0 !important;
          --color-border-secondary: #F1F5F9 !important;
          --color-accent: ${choice.hex} !important;
          --color-accent-hover: ${choice.hover} !important;
          --color-accent-light: ${choice.light} !important;
        }
        body, html, #root {
          background-color: #F8FAFC !important;
          color: #0F172A !important;
        }
        
        /* 
           Aggressively remap hardcoded dark theme utility classes to light mode equivalents 
           when light mode is active. This avoids having to rewrite thousands of lines of UI components.
        */
        
        /* Backgrounds */
        .bg-\\[\\#0F172A\\], .bg-slate-900, .bg-\\[\\#111827\\], .bg-\\[\\#0B1121\\], .bg-slate-950, .bg-slate-850 {
          background-color: #F8FAFC !important;
        }
        .bg-\\[\\#1E293B\\], .bg-slate-800, .bg-\\[\\#1F2937\\] {
          background-color: #FFFFFF !important;
        }
        .bg-\\[\\#0B0F19\\], .bg-slate-950 {
          background-color: #FFFFFF !important;
        }
        .bg-\\[\\#1E293B\\]\\/40, .bg-\\[\\#1E293B\\]\\/50, .bg-\\[\\#1E293B\\]\\/60, .bg-slate-800\\/50, .bg-\\[\\#1e293b\\]\\/50, .bg-slate-900\\/40, .bg-slate-900\\/60, .bg-slate-950\\/40, .bg-\\[\\#090D16\\] {
          background-color: rgba(255, 255, 255, 0.8) !important;
        }
        .hover\\:bg-slate-800:hover, .hover\\:bg-slate-700:hover, .hover\\:bg-slate-900:hover, .hover\\:bg-slate-850:hover {
          background-color: #F1F5F9 !important;
        }
        
        /* Text Colors */
        .text-slate-100, .text-slate-200 {
          color: #0F172A !important;
        }
        .text-slate-300, .text-slate-350, .text-slate-400 {
          color: #334155 !important;
        }
        .text-slate-450, .text-slate-500, .text-slate-600 {
          color: #64748B !important;
        }
        
        /* Handles dark badges that had text-white */
        .bg-slate-900.text-white, .bg-slate-950.text-white, .bg-\\[\\#0F172A\\].text-white, .bg-\\[\\#111827\\].text-white, .bg-\\[\\#0B1121\\].text-white, .bg-\\[\\#1E293B\\].text-white, .bg-slate-800.text-white {
          color: #0F172A !important;
        }
        .hover\\:text-white:hover {
          color: #000000 !important;
        }
        
        /* Borders */
        .border-slate-800, .border-slate-700, .border-slate-600, .border-\\[\\#334155\\] {
          border-color: #E2E8F0 !important;
        }
        .border-slate-800\\/50, .border-slate-700\\/50, .border-\\[\\#334155\\]\\/50 {
          border-color: rgba(226, 232, 240, 0.5) !important;
        }

        /* Form Controls */
        input::placeholder, textarea::placeholder {
          color: #94A3B8 !important;
        }
        
        /* Modals & Dropdowns - Explicit handling to keep them legible */
        .fixed .bg-slate-900, .fixed .bg-\\[\\#111827\\] {
           background-color: #FFFFFF !important;
           border-color: #E2E8F0 !important;
           box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
        }
        
        /* Keep specific branding elements intact, do NOT invert them */
        .text-\\[\\#10B981\\], .bg-\\[\\#10B981\\], .text-white.bg-\\[\\#10B981\\] {
           /* No inversion for accent colors */
        }
      `;
    } else {
      styles = `
        :root {
          --color-bg-primary: #0F172A !important;
          --color-bg-secondary: #111827 !important;
          --color-bg-sidebar: #0B0F19 !important;
          --color-bg-pane: #1E293B !important;
          --color-bg-input: #090D16 !important;
          --color-text-primary: #F1F5F9 !important;
          --color-text-secondary: #E2E8F0 !important;
          --color-text-muted: #94A3B8 !important;
          --color-border-primary: #1E293B !important;
          --color-border-secondary: #334155 !important;
          --color-accent: ${choice.hex} !important;
          --color-accent-hover: ${choice.hover} !important;
          --color-accent-light: ${choice.light} !important;
        }
        body, html, #root {
          background-color: #0F172A !important;
          color: #F1F5F9 !important;
        }
      `;
    }

    styles += accentOverrides;

    // Wrap the entire dynamic style block in @media screen so they never leak into print/PDF engines!
    const screenStyles = `@media screen {\n${styles}\n}`;

    // Dynamic style block injector
    let styleTag = document.getElementById("dynamic-theme-style");
    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.id = "dynamic-theme-style";
      document.head.appendChild(styleTag);
    }
    styleTag.innerHTML = screenStyles;
  }, [themeMode, themeColor]);

  // User auth state
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    const s = localStorage.getItem("ALW_STAR_LOGGED_IN_USER") || sessionStorage.getItem("ALW_STAR_LOGGED_IN_USER");
    if (s) {
      try {
        return JSON.parse(s);
      } catch (e) {}
    }
    return null;
  });

  const isAuthenticated = currentUser !== null;

  // Navigation & Shell variables
  const [currentTab, rawSetTab] = useState<string>("dashboard");
  const [editingReport, setEditingReport] = useState<ReportItem | null>(null);

  const setTab = (tab: string) => {
    if (tab !== "master_form") {
      setEditingReport(null);
      setPrefilledClient(null);
    }
    rawSetTab(tab);
  };

  const [language, setLanguage] = useState<AppLanguage>("en");
  const [role, setRole] = useState<UserRole>(() => {
    const s = localStorage.getItem("ALW_STAR_LOGGED_IN_USER") || sessionStorage.getItem("ALW_STAR_LOGGED_IN_USER");
    if (s) {
      try {
        const u = JSON.parse(s) as AppUser;
        if (u.role === "Admin") return "Super Admin";
        if (u.role === "Moderator") return "Admin / Manager";
        if (u.role === "Visitor") return "Guest Admin";
      } catch (e) {}
    }
    return "Super Admin";
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Dynamic editable profile brand states synced to localStorage!
  const [companyBrand, setCompanyBrand] = useState<string>(() => {
    return localStorage.getItem("ALW_STAR_COMPANY_BRAND") || "AL WAFA STAR";
  });
  const [companySubtitle, setCompanySubtitle] = useState<string>(() => {
    return localStorage.getItem("ALW_STAR_COMPANY_SUBTITLE") || "ERP Smart Control v2.5";
  });
  const [profileUser, setProfileUser] = useState<string>(() => {
    return localStorage.getItem("ALW_STAR_PROFILE_USER") || "Superintendent Hamdy";
  });
  const [profileEmail, setProfileEmail] = useState<string>(() => {
    return localStorage.getItem("ALW_STAR_PROFILE_EMAIL") || "allitokmal@gmail.com";
  });
  const [profileAvatarUrl, setProfileAvatarUrl] = useState<string>(() => {
    return localStorage.getItem("ALW_STAR_PROFILE_AVATAR") || "";
  });
  const [showProfileEditor, setShowProfileEditor] = useState<boolean>(false);

  // Core Reports list state synced to localStorage for session persistence!
  const [reports, setReports] = useState<ReportItem[]>(() => {
    const saved = localStorage.getItem("ALW_STARE_ERP_REPORTS");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {}
    }
    return [];
  });

  // Dynamic Locations list state synced to localStorage and shared across Dashboard & LocationsRegistry
  const [locations, setLocations] = useState<LocationRegistryItem[]>(() => {
    const saved = localStorage.getItem("ALW_LOCATIONS_REGISTRY");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {}
    }
    return INITIAL_LOCATIONS_REGISTRY;
  });

  useEffect(() => {
    localStorage.setItem("ALW_LOCATIONS_REGISTRY", JSON.stringify(locations));
    for (const loc of locations) {
      if (loc.id) {
        saveDocument("locations", loc.id, loc).catch((e) => console.warn(e));
      }
    }
  }, [locations]);

  // Supervisors registry persistent state
  const [supervisors, setSupervisors] = useState<SupervisorRegistryItem[]>(() => {
    const saved = localStorage.getItem("ALW_SUPERVISORS_REGISTRY");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {}
    }
    return INITIAL_SUPERVISORS_REGISTRY;
  });

  useEffect(() => {
    localStorage.setItem("ALW_SUPERVISORS_REGISTRY", JSON.stringify(supervisors));
    for (const sup of supervisors) {
      if (sup.id) {
        saveDocument("supervisors", sup.id, sup).catch((e) => console.warn(e));
      }
    }
  }, [supervisors]);
  
  // Temporary client auto prefill linkage
  const [prefilledClient, setPrefilledClient] = useState<any>(null);

  // Connection & PWA Installation tracker
  const [isOnline, setIsOnline] = useState<boolean>(typeof window !== 'undefined' ? window.navigator.onLine : true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>((window as any).deferredPWAInstallPrompt || null);
  const [isAppInstalled, setIsAppInstalled] = useState<boolean>(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);
  const [showPwaWelcomeOverlay, setShowPwaWelcomeOverlay] = useState<boolean>(() => {
    return typeof window !== "undefined" && window.location.search.includes("pwa-install=true");
  });

  // Install dropdown menu references & state
  const installDropdownRef = useRef<HTMLDivElement>(null);
  const [isInstallDropdownOpen, setIsInstallDropdownOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (installDropdownRef.current && !installDropdownRef.current.contains(event.target as Node)) {
        setIsInstallDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // Display mode full screen layout state
  const [isFullscreenLayout, setIsFullscreenLayout] = useState<boolean>(() => {
    return localStorage.getItem("ALW_STAR_FULL_LAYOUT") === "true";
  });

  const handleSetFullscreenLayout = (val: boolean) => {
    setIsFullscreenLayout(val);
    localStorage.setItem("ALW_STAR_FULL_LAYOUT", val ? "true" : "false");
    
    // Attemp standard HTML5 native full screen request 
    try {
      if (val) {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(err => {
            console.log("Browser blocked native fullscreen (common if inside an iframe). Software layout fallback active.", err);
          });
        }
      } else {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(err => {
            console.log("Error exiting browser native fullscreen:", err);
          });
        }
      }
    } catch (e) {
      console.log("Native Fullscreen API not supported or disabled in container.", e);
    }
  };

  // Sync state if user manual exits native fullscreen (e.g. by pressing Escape key)
  useEffect(() => {
    const handleFsChange = () => {
      const isFs = !!document.fullscreenElement;
      if (!isFs && isFullscreenLayout) {
        setIsFullscreenLayout(false);
        localStorage.setItem("ALW_STAR_FULL_LAYOUT", "false");
      }
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    document.addEventListener("webkitfullscreenchange", handleFsChange);
    document.addEventListener("mozfullscreenchange", handleFsChange);
    document.addEventListener("MSFullscreenChange", handleFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFsChange);
      document.removeEventListener("webkitfullscreenchange", handleFsChange);
      document.removeEventListener("mozfullscreenchange", handleFsChange);
      document.removeEventListener("MSFullscreenChange", handleFsChange);
    };
  }, [isFullscreenLayout]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    const checkAndTriggerPendingPrompt = (e: any) => {
      const hasPending = typeof window !== "undefined" && (
        window.location.search.includes("pwa-install=true") ||
        sessionStorage.getItem("pwa_install_pending") === "true"
      );
      
      if (hasPending && e && typeof e.prompt === 'function') {
        try {
          e.prompt();
          e.userChoice.then((choiceResult: { outcome: string }) => {
            if (choiceResult.outcome === "accepted") {
              setIsAppInstalled(true);
              setIsInstallModalOpen(false);
            }
            try {
              sessionStorage.removeItem("pwa_install_pending");
            } catch (err) {}
          });
        } catch (err) {
          console.warn("Prompt failed", err);
        }
      }
    };

    // If it was already caught by index.html script before React mounted
    if ((window as any).deferredPWAInstallPrompt) {
      checkAndTriggerPendingPrompt((window as any).deferredPWAInstallPrompt);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      (window as any).deferredPWAInstallPrompt = e;
      checkAndTriggerPendingPrompt(e);
    };
    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      setDeferredPrompt(null);
      (window as any).deferredPWAInstallPrompt = null;
      try {
        sessionStorage.removeItem("pwa_install_pending");
      } catch (err) {}
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // Check if running in standalone PWA mode
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsAppInstalled(true);
    }

    // Auto-detect PWA installation intent from parameter and activate dedicated installation helper
    if (typeof window !== "undefined" && window.location.search.includes("pwa-install=true")) {
      try {
        sessionStorage.setItem("pwa_install_pending", "true");
      } catch (err) {}
      setShowPwaWelcomeOverlay(true);
      
      // Clean up URL query param silently
      try {
        const cleanUrl = window.location.origin + window.location.pathname + window.location.hash;
        window.history.replaceState({ path: cleanUrl }, "", cleanUrl);
      } catch (e) {
        console.warn("Could not clean URL params:", e);
      }
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const triggerPwaInstall = () => {
    // Check if we are running inside an iframe (like the AI Studio sandboxed preview)
    const isIframe = typeof window !== "undefined" && window.self !== window.top;
    if (isIframe) {
      // Instantly open a new standalone tab with the installer parameter
      const directUrl = window.location.origin + window.location.pathname + "?pwa-install=true" + window.location.hash;
      window.open(directUrl, "_blank");
      return;
    }

    const promptEvent = deferredPrompt || (window as any).deferredPWAInstallPrompt;
    if (promptEvent) {
      promptEvent.prompt();
      promptEvent.userChoice.then((choiceResult: { outcome: string }) => {
        if (choiceResult.outcome === "accepted") {
          console.log("User accepted the install prompt");
          setIsAppInstalled(true);
        }
        setDeferredPrompt(null);
        (window as any).deferredPWAInstallPrompt = null;
      });
    } else {
      setIsInstallModalOpen(true);
    }
  };

  // Fetch latest reports, locations, supervisors, and branding on startup in real-time
  useEffect(() => {
    // 1. Synchronize Pest Reports via Firestore in real-time
    const unsubscribeReports = subscribeCollection<ReportItem>("serviceReports", (list) => {
      if (list && list.length > 0) {
        setReports(list);
        localStorage.setItem("ALW_STARE_ERP_REPORTS", JSON.stringify(list));
      } else {
        // Fallback: seed from local storage if standard list is empty
        const saved = localStorage.getItem("ALW_STARE_ERP_REPORTS");
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setReports(parsed);
              for (const r of parsed) {
                if (r.id) saveDocument("serviceReports", r.id, r);
              }
            }
          } catch (e) {}
        }
      }
    });

    // 2. Synchronize Locations Registry in real-time
    const unsubscribeLocations = subscribeCollection<LocationRegistryItem>("locations", (list) => {
      if (list && list.length > 0) {
        setLocations(list);
        localStorage.setItem("ALW_LOCATIONS_REGISTRY", JSON.stringify(list));
      } else {
        setLocations(INITIAL_LOCATIONS_REGISTRY);
        localStorage.setItem("ALW_LOCATIONS_REGISTRY", JSON.stringify(INITIAL_LOCATIONS_REGISTRY));
        for (const loc of INITIAL_LOCATIONS_REGISTRY) {
          if (loc.id) saveDocument("locations", loc.id, loc).catch(e => console.error(e));
        }
      }
    });

    // 3. Synchronize Supervisors Registry in real-time
    const unsubscribeSupervisors = subscribeCollection<SupervisorRegistryItem>("supervisors", (list) => {
      if (list && list.length > 0) {
        setSupervisors(list);
        localStorage.setItem("ALW_SUPERVISORS_REGISTRY", JSON.stringify(list));
      } else {
        setSupervisors(INITIAL_SUPERVISORS_REGISTRY);
        localStorage.setItem("ALW_SUPERVISORS_REGISTRY", JSON.stringify(INITIAL_SUPERVISORS_REGISTRY));
        for (const sup of INITIAL_SUPERVISORS_REGISTRY) {
          if (sup.id) saveDocument("supervisors", sup.id, sup).catch(e => console.error(e));
        }
      }
    });

    // 4. Synchronize Branding & Security Passwords in real-time
    const unsubscribeBranding = subscribeBrandingData((b) => {
      if (b.companyBrand) {
        setCompanyBrand(b.companyBrand);
        localStorage.setItem("ALW_STAR_COMPANY_BRAND", b.companyBrand);
      }
      if (b.companySubtitle) {
        setCompanySubtitle(b.companySubtitle);
        localStorage.setItem("ALW_STAR_COMPANY_SUBTITLE", b.companySubtitle);
      }
      if (b.profileUser) {
        setProfileUser(b.profileUser);
        localStorage.setItem("ALW_STAR_PROFILE_USER", b.profileUser);
      }
      if (b.profileEmail) {
        setProfileEmail(b.profileEmail);
        localStorage.setItem("ALW_STAR_PROFILE_EMAIL", b.profileEmail);
      }
      if (b.profileAvatarUrl) {
        setProfileAvatarUrl(b.profileAvatarUrl);
        localStorage.setItem("ALW_STAR_PROFILE_AVATAR", b.profileAvatarUrl);
      }
      if (b.appPassword) {
        setAppPassword(b.appPassword);
        localStorage.setItem("ALW_STAR_APP_PASSWORD", b.appPassword);
      }
    });

    return () => {
      unsubscribeReports();
      unsubscribeLocations();
      unsubscribeSupervisors();
      unsubscribeBranding();
    };
  }, []);

  // Keep Firestore branding parameters updated
  useEffect(() => {
    const payload = {
      companyBrand,
      companySubtitle,
      profileUser,
      profileEmail,
      profileAvatarUrl,
      appPassword
    };
    saveBrandingData(payload).catch(e => console.warn(e));
  }, [companyBrand, companySubtitle, profileUser, profileEmail, profileAvatarUrl, appPassword]);

  // Update localStorage and server reports in the background
  const saveReports = (newReports: ReportItem[]) => {
    // We only update local state here; Firestore listener (onSnapshot) syncs changes globally.
    setReports(newReports);
    localStorage.setItem("ALW_STARE_ERP_REPORTS", JSON.stringify(newReports));
  };

  const handleAddReport = async (newReport: ReportItem) => {
    // Offline-First: update local state instantly so user never loses entry
    const updated = [newReport, ...reports];
    setReports(updated);
    localStorage.setItem("ALW_STARE_ERP_REPORTS", JSON.stringify(updated));

    try {
      if (newReport.id) {
        await saveDocument("serviceReports", newReport.id, newReport);
      }
    } catch (e) {
      console.warn("Failed to add report to Firestore, saved locally:", e);
    }
  };

  const handleUpdateReport = async (updatedReport: ReportItem) => {
    // Offline-First: update local state instantly
    const updated = reports.map(r => r.id === updatedReport.id ? updatedReport : r);
    setReports(updated);
    localStorage.setItem("ALW_STARE_ERP_REPORTS", JSON.stringify(updated));
    setEditingReport(null);

    try {
      if (updatedReport.id) {
        await saveDocument("serviceReports", updatedReport.id, updatedReport);
      }
    } catch (e) {
      console.warn("Failed to update report on Firestore, saved locally:", e);
    }
  };

  const handleDeleteReport = async (id: string) => {
    // Offline-First: update local state instantly
    const updated = reports.filter(r => r.id !== id);
    setReports(updated);
    localStorage.setItem("ALW_STARE_ERP_REPORTS", JSON.stringify(updated));

    try {
      await deleteDocument("serviceReports", id);
    } catch (e) {
      console.warn("Failed to delete report from Firestore, removed locally:", e);
    }
  };

  const handleEditReport = (report: ReportItem) => {
    setEditingReport(report);
    setTab("master_form");
  };

  // Redirect and prefill from location directory to master web form
  const handleSelectClientToPrefill = (client: any) => {
    setPrefilledClient(client);
    setTab("master_form");
  };

  // On selecting a report card in dashboard, prefill values, view in Client Portal or open details
  const handleSelectReport = (report: ReportItem) => {
    setPrefilledClient({
      id: report.clientId,
      name: report.facilityName,
      contract: report.contractNo,
      emirate: report.emirate,
      type: report.facilityType,
      contact: report.contactPerson,
      email: report.email,
    });
    setTab("master_form");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("ALW_STAR_LOGGED_IN_USER");
    sessionStorage.removeItem("ALW_STAR_LOGGED_IN_USER");
    localStorage.removeItem("ALW_STAR_AUTH_SESSION");
    sessionStorage.removeItem("ALW_STAR_AUTH_SESSION");
  };

  // Translation helpers
  const translations = DICTIONARY[language];

  if (showPwaWelcomeOverlay) {
    const activePrompt = deferredPrompt || (window as any).deferredPWAInstallPrompt;

    const handlePwaDirectTrigger = () => {
      if (activePrompt) {
        activePrompt.prompt();
        activePrompt.userChoice.then((choiceResult: { outcome: string }) => {
          if (choiceResult.outcome === "accepted") {
            setIsAppInstalled(true);
            setShowPwaWelcomeOverlay(false);
          }
        });
      } else {
        // Fallback: alert/advise standard installation pathways
        setIsInstallModalOpen(true);
      }
    };

    return (
      <div className="min-h-screen bg-[#090d16] text-slate-100 flex items-center justify-center p-4 sm:p-6 font-sans antialiased selection:bg-emerald-500 selection:text-slate-950">
        <div className="w-full max-w-3xl bg-slate-900/90 border border-slate-700/60 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col space-y-6 relative overflow-hidden backdrop-blur-md">
          {/* Decorative glows */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Header Controls */}
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl sm:text-4xl">📲</span>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-50 tracking-tight leading-none uppercase">
                  {companyBrand} SMART ERP
                </h1>
                <p className="text-[10px] sm:text-xs text-sky-400 font-bold font-mono tracking-wider mt-1.5 flex items-center gap-1.5 uppercase">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                  PWA INSTANT STAGE INTERACTIVE
                </p>
              </div>
            </div>

            {/* Language Selection Switch for convenience */}
            <button
              type="button"
              onClick={() => setLanguage(language === "bn" ? "en" : "bn")}
              className="px-3.5 py-1.5 bg-slate-850 hover:bg-slate-800 border border-slate-700/60 rounded-xl text-xs font-black tracking-wider text-[#10B981] transition cursor-pointer flex items-center gap-1.5"
            >
              <span>🌐</span>
              <span>{language === "bn" ? "English" : "বাংলা"}</span>
            </button>
          </div>

          {/* Quick Intro & Core Value Props */}
          <div className="space-y-4">
            <div className="text-center sm:text-left py-2">
              <h2 className="text-base sm:text-lg font-extrabold text-[#10B981]">
                {language === "bn"
                  ? "সরাসরি আপনার ডিভাইস বা হোম স্ক্রিনে অ্যাপটি ডাউনলোড করুন"
                  : "Download & Install the App Immediately on your device"}
              </h2>
              <p className="text-xs text-slate-400 mt-1 font-medium leading-relaxed">
                {language === "bn"
                  ? "ব্রাউজার ছাড়াই যেকোনো সময় অফলাইন সাপোর্ট এবং হাই-স্পিড ডাটাবেজ এক্সেস নিশ্চিত করতে এখনই ইনস্টল করুন।"
                  : "Fully escape the browser viewport limit to unleash full-screen native performance with built-in robust offline data persistence."}
              </p>
            </div>

            {/* Core PWA Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="bg-slate-850/70 p-4 border border-slate-800/80 rounded-2xl space-y-1.5 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-black text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <span className="text-base">📁</span>
                    {language === "bn" ? "১০০% অফলাইন ডাটা সেভ" : "100% Offline Operations"}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium leading-relaxed mt-1">
                    {language === "bn"
                      ? "মরুভূমি বা ইন্টারনেট সংযোগবিহীন লো-সিগন্যাল এলাকাতেও অনায়াসে নতুন ড্রাফট সার্ভিস রিপোর্ট সেভ ও প্রিন্ট করুন।"
                      : "Draft, view, and save forensic report records completely offline. Syncs instantly when signal returns!"}
                  </p>
                </div>
              </div>

              <div className="bg-slate-850/70 p-4 border border-slate-800/80 rounded-2xl space-y-1.5 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-black text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <span className="text-base">⚡</span>
                    {language === "bn" ? "ডেডিকেটেড ডেস্কটপ/মোবাইল অ্যাপ" : "Native System Speeds"}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium leading-relaxed mt-1">
                    {language === "bn"
                      ? "সম্পূর্ণ নতুন উইন্ডোতে স্বতন্ত্র অ্যাপ আইকন দিয়ে ওপেন করুন। ব্রাউজারের অযথা এড্রেস ইন্টারফেস ছাড়াই রিয়েল-টাইম স্পিড পান।"
                      : "Installs directly to your device home screen or Windows start menu. Launches in a clean system frame."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Golden One-Click Direct PWA Trigger Button */}
          <div className="bg-slate-850 p-5 rounded-2xl border border-dashed border-[#10B981]/35 flex flex-col items-center justify-center text-center space-y-4 shadow-xl">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/25 rounded-full text-[10px] font-bold text-[#10B981] uppercase tracking-widest leading-none font-mono">
                {language === "bn" ? "১-ক্লিকে সরাসরি ইন্সটল" : "Recommended Installation Pathway"}
              </div>
              <h3 className="text-sm font-black text-slate-50">
                {language === "bn"
                  ? "নিচের বাটনে ক্লিক করামাত্রই আপনার ফোনে বা কম্পিউটারে ডাউনলোড শুরু হবে"
                  : "Tap below to immediately activate your browser's system downloader"}
              </h3>
            </div>

            <button
              type="button"
              onClick={handlePwaDirectTrigger}
              className="relative overflow-hidden w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm uppercase tracking-wider rounded-2xl active:scale-98 transition-all cursor-pointer shadow-lg shadow-emerald-500/15 duration-150 flex items-center justify-center gap-2 group"
            >
              <span className="text-lg group-hover:scale-110 transition-transform">📥</span>
              <span>
                {language === "bn"
                  ? "📲 এখনই অ্যাপটি ইনস্টল করুন"
                  : "📲 Install Standalone PWA Now"}
              </span>
              <span className="absolute inset-0 w-full h-full bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
            </button>

            {!activePrompt && (
              <p className="text-[10px] text-amber-400 font-semibold leading-relaxed">
                ℹ️ {language === "bn"
                  ? "ব্রাউজার স্বয়ংক্রিয় প্রম্পট লোড করতে কয়েক সেকেন্ড সময় নিতে পারে। অথবা আপনি নিচে দেওয়া সহজ নিয়মাবলি ব্যবহার করেও ডাউনলোড করে নিতে পারেন।"
                  : "If your browser does not immediately open the native prompt, please utilize the simple device steps described below."}
              </p>
            )}
          </div>

          {/* Quick Installation Steps Per Platform */}
          <div className="space-y-3.5 pt-2">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#10B981] border-l-4 border-[#10B981] pl-2.5">
              📌 {language === "bn" ? "সহজে ডাউনলোড করার নিয়মাবলী" : "Platform-Specific Support Steps"}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Android Chrome */}
              <div className="bg-slate-850 p-4 border border-slate-800 rounded-2xl space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base">🤖</span>
                    <span className="font-extrabold text-xs text-slate-100 uppercase tracking-wide">
                      Android / Chrome
                    </span>
                  </div>
                  <ol className="list-decimal pl-4.5 text-[11px] text-slate-400 space-y-1.5 mt-2.5 leading-relaxed font-sans font-medium">
                    <li>{language === "bn" ? "ডানদিকের ৩-ডট মেনু বাটন ট্যাপ করুন" : "Tap the browser's 3-dot settings icon."}</li>
                    <li>{language === "bn" ? "'Install App' বা 'Add to Home Screen' চাপুন" : "Choose 'Install App' or 'Add to Home Screen'."}</li>
                    <li>{language === "bn" ? "কনফার্ম করুন এবং অফলাইন অ্যাপটি ব্যবহার করুন!" : "Accept confirmation and deploy natively on spring board."}</li>
                  </ol>
                </div>
              </div>

              {/* iOS iPhone / iPad Safari */}
              <div className="bg-slate-850 p-4 border border-slate-800 rounded-2xl space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base">🍎</span>
                    <span className="font-extrabold text-xs text-slate-100 uppercase tracking-wide">
                      iPhone iPad / Safari
                    </span>
                  </div>
                  <ol className="list-decimal pl-4.5 text-[11px] text-slate-400 space-y-1.5 mt-2.5 leading-relaxed font-sans font-medium">
                    <li>{language === "bn" ? "সাফারি ব্রাউজারের নিচে থাকা শেয়ার (📥) আইকন চাপুন" : "Tap Safari's bottom Share button (📤)."}</li>
                    <li>{language === "bn" ? "লিংকটি স্ক্রল করে 'Add to Home Screen' চাপুন" : "Select 'Add to Home Screen' from the tray options."}</li>
                    <li>{language === "bn" ? "উপরে 'Add' বাটনে চাপ দিয়ে চিরকালের মত অ্যাপ নামান" : "Tap 'Add' on top right. Launch directly from springboard!"}</li>
                  </ol>
                </div>
              </div>

              {/* Desktop / Computer */}
              <div className="bg-slate-850 p-4 border border-slate-800 rounded-2xl space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base">💻</span>
                    <span className="font-extrabold text-xs text-slate-100 uppercase tracking-wide">
                      Desktop PC / Laptop
                    </span>
                  </div>
                  <ol className="list-decimal pl-4.5 text-[11px] text-slate-400 space-y-1.5 mt-2.5 leading-relaxed font-sans font-medium">
                    <li>{language === "bn" ? "ব্রাউজার এড্রেস বারের ডানে মনিটর বা ইন্সটল ([+]) বাটন চাপুন" : "Click the monitor icon or [+] icon inside URL bar."}</li>
                    <li>{language === "bn" ? "অথবা ক্রোম মেনু থেকে 'Save & Share' ➔ 'Install Page' এ চাপুন" : "Or open settings -> 'Save and Share' -> 'Install Page'."}</li>
                    <li>{language === "bn" ? "এটি সাথে সাথে ডেস্কটপ অ্যাপ আইকন হিসেবে যোগ হবে!" : "Launches clean speed windows inside taskbar instantly."}</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          {/* Proceed Options Box */}
          <div className="border-t border-slate-800 pt-5 flex flex-col sm:flex-row gap-3.5 items-center justify-between">
            <p className="text-[10px] text-slate-500 font-mono font-medium max-w-sm leading-relaxed text-center sm:text-left">
              * AL WAFA STAR Smart ERP employs offline state cache storage to allow safe continuous forensic reporting.
            </p>
            <button
              type="button"
              onClick={() => setShowPwaWelcomeOverlay(false)}
              className="shrink-0 font-black text-xs text-slate-350 hover:text-white px-5 py-2.5 bg-slate-850 hover:bg-slate-800 rounded-xl cursor-pointer transition flex items-center gap-1.5"
            >
              <span>🌐</span>
              <span>
                {language === "bn"
                  ? "ইন্সটল ছাড়া ওয়েবসাইটে এগিয়ে যান"
                  : "Proceed on Web without Installing"}
              </span>
              <span>➔</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <LoginScreen 
        appPassword={appPassword}
        language={language}
        setLanguage={setLanguage}
        onLoginSuccess={(user, rememberMe) => {
          setCurrentUser(user);
          if (user.role === "Admin") {
            setRole("Super Admin");
          } else if (user.role === "Moderator") {
            setRole("Admin / Manager");
          } else {
            setRole("Guest Admin");
          }
          const userStr = JSON.stringify(user);
          if (rememberMe) {
            localStorage.setItem("ALW_STAR_LOGGED_IN_USER", userStr);
            localStorage.setItem("ALW_STAR_AUTH_SESSION", "true");
          } else {
            sessionStorage.setItem("ALW_STAR_LOGGED_IN_USER", userStr);
            sessionStorage.setItem("ALW_STAR_AUTH_SESSION", "true");
          }
        }}
        companyBrand={companyBrand}
        companySubtitle={companySubtitle}
      />
    );
  }

  return (
    <div id="app-shell-root-container" className="flex h-screen bg-[#0F172A] text-slate-100 overflow-hidden font-sans select-none antialiased">
      
      {/* Desktop Sidebar Panel */}
      <div className="hidden lg:flex shrink-0">
        <Sidebar 
          currentTab={currentTab} 
          setTab={setTab} 
          language={language} 
          setLanguage={setLanguage}
          role={role}
          setRole={setRole}
          companyBrand={companyBrand}
          companySubtitle={companySubtitle}
          profileUser={profileUser}
          profileEmail={profileEmail}
          profileAvatarUrl={profileAvatarUrl}
          onOpenProfileEditor={() => setShowProfileEditor(true)}
          onLogout={handleLogout}
          themeMode={themeMode}
          onSetThemeMode={handleSetThemeMode}
          isFullscreenLayout={isFullscreenLayout}
          onSetFullscreenLayout={handleSetFullscreenLayout}
        />
      </div>

      {/* Mobile Sidebar overlay Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-black/50 backdrop-blur-sm">
          <div className="relative w-80 shrink-0 h-full animate-slide-right flex">
            <Sidebar 
              currentTab={currentTab} 
              setTab={(tab) => { setTab(tab); setSidebarOpen(false); }}
              language={language} 
              setLanguage={(lang) => { setLanguage(lang); setSidebarOpen(false); }}
              role={role}
              setRole={(r) => { setRole(r); setSidebarOpen(false); }}
              companyBrand={companyBrand}
              companySubtitle={companySubtitle}
              profileUser={profileUser}
              profileEmail={profileEmail}
              profileAvatarUrl={profileAvatarUrl}
              onOpenProfileEditor={() => { setShowProfileEditor(true); setSidebarOpen(false); }}
              onLogout={handleLogout}
              themeMode={themeMode}
              onSetThemeMode={handleSetThemeMode}
              isFullscreenLayout={isFullscreenLayout}
              onSetFullscreenLayout={handleSetFullscreenLayout}
            />
            {/* Close touch overlay */}
            <button
              id="sidebar-overlay-close-btn"
              onClick={() => setSidebarOpen(false)}
              className="absolute left-[330px] top-6 p-2.5 bg-slate-900 border text-slate-100 rounded-full cursor-pointer hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Primary Workspace Space */}
      <div id="app-workspace-content-shell" className="flex-1 flex flex-col min-w-0 bg-[#0F172A] h-screen overflow-hidden">
        
        {/* Top Header navbar with system indicators */}
        <header className="border-b border-[#1E293B] bg-[#111827] px-4 sm:px-6 py-3 flex justify-between items-center z-40 shrink-0">
            <div className="flex items-center gap-4 min-w-0">
              <button
                id="mobile-hamburger-nav"
                onClick={() => setSidebarOpen(true)}
                className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 block lg:hidden cursor-pointer"
              >
                <Menu className="w-5 h-5 text-slate-100" />
              </button>

              {/* Title segment */}
              <div className="flex items-center gap-2 min-w-0 overflow-visible select-none">
                {/* Small Red Star indicator inside the box position */}
                <div className="shrink-0 flex items-center justify-center">
                  <svg 
                    viewBox="0 0 512 512" 
                    fill="none" 
                    className="w-3.5 h-3.5 text-[#ED1C24] drop-shadow-[0_1px_3px_rgba(237,28,36,0.3)] animate-pulse"
                    style={{ filter: "drop-shadow(0 0 3px #ED1C24)" }}
                  >
                    <polygon 
                      points="256,40 327,184 486,207 371,319 398,477 256,403 114,477 141,319 26,207 185,184" 
                      fill="#ED1C24" 
                    />
                  </svg>
                </div>

                {/* Shifted text container with small, clean text elements */}
                <div className="flex flex-col text-left justify-center pl-1.5">
                  <div className="flex items-center gap-1.5 leading-none">
                    <span className="text-[11px] sm:text-xs font-black tracking-wider text-slate-100 font-mono uppercase">
                      AL WAFA STAR
                    </span>
                    <span className="text-[9px] sm:text-[9.5px] font-black text-[#ED1C24] font-mono whitespace-nowrap">
                      ERP v2.5
                    </span>
                  </div>
                  <span className="text-[8px] sm:text-[8.5px] font-black tracking-widest text-emerald-500 uppercase leading-none mt-1 font-mono">
                    PEST CONTROL SERVICES
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
              {/* Live Connection / Offline Database Mode Badge */}
              <div className="flex items-center">
                {isOnline ? (
                  <span className="flex items-center gap-1.5 bg-emerald-500/10 text-[#10B981] border border-emerald-500/20 px-2 py-1 rounded-xl text-[10px] font-black tracking-wider uppercase font-mono">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    {language === "bn" ? "অনলাইন" : "ONLINE"}
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-1 rounded-xl text-[10px] font-black tracking-wider uppercase font-mono animate-pulse">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                    {language === "bn" ? "অফলাইন ডাটাবেজ" : "OFFLINE STORAGE"}
                  </span>
                )}
              </div>

              {/* Install PWA Application on Device Button */}
              {!isAppInstalled && (
                <div className="relative" ref={installDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsInstallDropdownOpen(!isInstallDropdownOpen)}
                    className="bg-sky-600 hover:bg-sky-500 hover:shadow-sky-500/10 active:scale-95 transition-all text-white border border-sky-500/40 font-extrabold text-[10px] sm:text-xs rounded-xl py-1.5 px-3 flex items-center gap-1.5 cursor-pointer shadow-md shadow-sky-600/5 select-none"
                    title={language === "bn" ? "ফোনে বা কম্পিউটারে ডাউনলোড ও ব্রাউজার অপশন" : "Download App & Website Standalone Options"}
                  >
                    <span>📲</span>
                    <span className="hidden sm:inline">{language === "bn" ? "অ্যাপ ডাউনলোড" : "Install App"}</span>
                    <span className="sm:hidden">{language === "bn" ? "ডাউনলোড" : "Install"}</span>
                    <span className="text-[9px] opacity-70 ml-0.5">▼</span>
                  </button>

                  {isInstallDropdownOpen && (
                    <div className="absolute right-0 mt-2.5 w-76 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 p-3.5 space-y-3 animate-fade-in text-slate-100">
                      <div className="border-b border-slate-800 pb-2">
                        <p className="text-xs font-black text-slate-200">
                          {language === "bn" ? "ডাউনলোড ও ব্রাউজার অপশন" : "Download & Browser Options"}
                        </p>
                        <p className="text-[9px] text-slate-400 font-mono font-medium">
                          {language === "bn" ? "মোবাইল, ল্যাপটপ এবং ট্যাবের জন্য" : "For mobile, laptop & tablet devices"}
                        </p>
                      </div>

                      {/* Option 1: Direct App Download */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsInstallDropdownOpen(false);
                          triggerPwaInstall();
                        }}
                        className="w-full text-left bg-gradient-to-r from-sky-600 to-sky-750 hover:from-sky-500 hover:to-sky-650 p-2.5 rounded-xl transition duration-150 flex items-start gap-2.5 cursor-pointer border border-sky-500/20 group hover:shadow-lg hover:shadow-sky-500/15"
                      >
                        <span className="text-xl bg-slate-950 p-1.5 rounded-lg shrink-0 text-sky-400">📥</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-black text-white group-hover:text-yellow-300 transition-colors">
                            {language === "bn" ? "📲 সরাসরি অ্যাপ ডাউনলোড করুন" : "📲 Direct App Download"}
                          </p>
                          <p className="text-[9px] text-sky-100/85 mt-0.5 leading-normal font-sans">
                            {language === "bn"
                              ? "মোবাইল, ল্যাপটপ বা ট্যাবে সরাসরি অফলাইন ব্যাকআপ সহ অ্যাপ ব্যবহার করুন"
                              : "Install directly on device Home Screen with full offline background support"}
                          </p>
                        </div>
                      </button>

                      {/* Option 2: Go to standard website */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsInstallDropdownOpen(false);
                          const directUrl = window.location.origin + window.location.pathname + window.location.hash;
                          window.open(directUrl, "_blank");
                        }}
                        className="w-full text-left bg-slate-850 hover:bg-slate-800 p-2.5 rounded-xl transition duration-150 flex items-start gap-2.5 cursor-pointer border border-slate-700/60 group hover:border-[#10B981]/50"
                      >
                        <span className="text-xl bg-slate-950 p-1.5 rounded-lg shrink-0 text-emerald-400 font-sans">🌐</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-black text-slate-200 group-hover:text-[#10B981] transition-colors">
                            {language === "bn" ? "💻 সরাসরি ওয়েবসাইটে যান" : "💻 Go to Website Standalone"}
                          </p>
                          <p className="text-[9px] text-slate-400 mt-0.5 leading-normal font-sans">
                            {language === "bn"
                              ? "আইফ্রেম বা লিমিটেশন ফ্রেম ছাড়া সরাসরি লাইভ ব্রাউজার ট্যাবে ওপেন হবে"
                              : "Open full-screen web view bypass Google preview limits in clean tab"}
                          </p>
                        </div>
                      </button>

                      <div className="text-[8px] text-slate-500 text-center pt-1.5 border-t border-slate-800 flex items-center justify-center gap-1 font-mono font-bold">
                        <span>⚡</span>
                        <span>
                          {language === "bn"
                            ? "রিমোট এরিয়াতে অফলাইনে কাজ করার জন্য উপযোগী"
                            : "Perfect companion for remote offline operations"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* User credentials identifier / Avatar */}
              <div 
                onClick={() => setShowProfileEditor(true)}
                className="w-9 h-9 bg-slate-850 rounded-full flex items-center justify-center font-bold text-xs border border-slate-700 text-[#10B981] hover:border-[#10B981] transition-all cursor-pointer overflow-hidden shadow-sm shrink-0" 
                title="Click to Configure Profile & Brand"
              >
                {profileAvatarUrl ? (
                  <img src={profileAvatarUrl} className="w-full h-full object-cover" alt="Profile" />
                ) : (
                  <User className="w-5 h-5 text-slate-400" />
                )}
              </div>
            </div>
          </header>

        {currentUser?.role === "Visitor" && (
          <div className="bg-amber-550/15 border-b border-amber-500/20 px-4 sm:px-6 py-2.5 flex items-center justify-between text-amber-400 text-xs font-semibold select-none animate-pulse shrink-0">
            <span className="flex items-center gap-2 min-w-0">
              <span className="shrink-0">👁️</span>
              <span className="truncate">
                {language === "bn" 
                  ? "ভিজিটর (লিমিটেড ভিউয়ার) মোড সক্রিয় - আপনি কোনো প্রকার তথ্য যোগ, রূপান্তর, সেটিংস পরিবর্তন বা ডিলিট করতে পারবেন না।" 
                  : "READ-ONLY COMPANION MODE ACTIVE - You are viewing this dashboard as a guest and do not have edit/write permissions."}
              </span>
            </span>
            <span className="shrink-0 text-[10px] bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded font-mono uppercase tracking-wider text-amber-300">
              {language === "bn" ? "শুধুমাত্র পড়ার জন্য" : "Read-Only"}
            </span>
          </div>
        )}

        {/* Dynamic Workspace Container */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-8 space-y-4 md:space-y-6 bg-gradient-to-lg from-[#0F172A] via-[#111827] to-[#0F172A]">
          
          {/* Render Active View Tab */}
          {currentTab === "dashboard" && (
            <Dashboard 
              reports={reports} 
              language={language} 
              setTab={setTab} 
              onSelectReport={handleSelectReport}
              onUpdateReports={saveReports}
              locations={locations}
              supervisors={supervisors}
              themeMode={themeMode}
              onSetThemeMode={handleSetThemeMode}
              isFullscreenLayout={isFullscreenLayout}
              onSetFullscreenLayout={handleSetFullscreenLayout}
            />
          )}

          {currentTab === "completed_registry" && (
            <CompletedRegistry 
              reports={reports} 
              language={language} 
              setTab={setTab} 
              onSelectReport={handleSelectReport}
              onUpdateReports={saveReports}
              supervisors={supervisors}
              onEditReport={(report) => {
                setEditingReport(report);
                rawSetTab("master_form"); // use rawSetTab directly to prevent resetting editingReport inside the setTab wrapper
              }}
            />
          )}

          {currentTab === "locations" && (
            <LocationsRegistry 
              language={language}
              locations={locations}
              setLocations={setLocations}
            />
          )}

          {currentTab === "supervisors_directory" && (
            <SupervisorsRegistry 
              language={language}
              locations={locations}
              supervisors={supervisors}
              setSupervisors={setSupervisors}
            />
          )}

          {currentTab === "directory" && (
            <ClientDirectory 
              onSelectClientToPrefill={handleSelectClientToPrefill} 
              language={language}
              reports={reports}
              onUpdateReports={saveReports}
            />
          )}

          {currentTab === "engineering_report" && (
            <EngineeringReport 
              language={language}
              companyBrand={companyBrand}
              profileUser={profileUser}
              locations={locations}
            />
          )}

          {currentTab === "master_form" && (
            <MasterForm 
              onAddReport={handleAddReport} 
              editingReport={editingReport}
              onUpdateReport={handleUpdateReport}
              prefilledClient={prefilledClient} 
              language={language}
              setTab={setTab}
              locations={locations}
              setLocations={setLocations}
              reports={reports}
              onCancelEdit={() => {
                setEditingReport(null);
                setTab("completed_registry");
              }}
            />
          )}

          {currentTab === "inventory" && (
            <ChemicalInventory 
              language={language}
              themeMode={themeMode}
            />
          )}

          {currentTab === "technicians" && (
            <TimesheetPayroll 
              language={language}
              isDark={themeMode === "dark"}
              supervisors={supervisors}
            />
          )}

          {currentTab === "ai_pest" && (
            <AIPestDetection 
              language={language}
            />
          )}

          {currentTab === "client_portal" && (
            <ClientPortalView 
              reports={reports}
            />
          )}

          {currentTab === "custom_option_1" && (
            <ProjectScheduler 
              language={language}
              isDark={themeMode === "dark"}
              defaultViewTab="projects"
            />
          )}

          {currentTab === "custom_option_2" && (
            <CustomServiceModule 
              language={language} 
              isDark={themeMode === "dark"} 
              reports={reports} 
              onEditReport={handleEditReport}
              onDeleteReport={handleDeleteReport}
            />
          )}

          {currentTab === "custom_option_3" && (
            <Technicians 
              language={language}
              locations={locations}
              supervisors={supervisors}
              reports={reports}
              onUpdateReports={saveReports}
              onSelectClientToPrefill={handleSelectClientToPrefill}
            />
          )}

          {currentTab === "admin_settings" && (
            <AdminSettings 
              language={language}
              companyBrand={companyBrand}
              setCompanyBrand={setCompanyBrand}
              companySubtitle={companySubtitle}
              setCompanySubtitle={setCompanySubtitle}
              profileUser={profileUser}
              setProfileUser={setProfileUser}
              profileEmail={profileEmail}
              setProfileEmail={setProfileEmail}
              profileAvatarUrl={profileAvatarUrl}
              setProfileAvatarUrl={setProfileAvatarUrl}
              reports={reports}
              onUpdateReports={saveReports}
              appPassword={appPassword}
              setAppPassword={setAppPassword}
              themeMode={themeMode}
              setThemeMode={handleSetThemeMode}
              themeColor={themeColor}
              setThemeColor={handleSetThemeColor}
              isFullscreenLayout={isFullscreenLayout}
              onSetFullscreenLayout={handleSetFullscreenLayout}
              onLogout={handleLogout}
              role={role}
              setRole={setRole}
              loggedInUser={currentUser}
            />
          )}

        </main>

        {/* Global Footer */}
        <footer className="h-10 border-t border-[#1E293B] bg-[#0B0F19] px-6 flex justify-between items-center z-10 text-[10px] text-slate-500 shrink-0 select-none">
          <span>{translations.allRightsReserved}</span>
          <span className="hidden sm:inline font-mono">Al Wafa Star ERP Professional Suite v2.5 | Dubai, Sharjah, Ajman</span>
        </footer>

      </div>

      {/* Dynamic Profile & Brand Editor Modal (পছন্দমত ব্র্যান্ড পরিবর্তন) */}
      {showProfileEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in font-sans">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-6 text-slate-100 animate-scale-up">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚙️</span>
                <h3 className="text-md font-bold text-slate-50">
                  {language === "bn" ? "ব্র্যান্ড ও প্রোফাইল কাস্টমাইজ" : "Brand & Operational Profile Customizer"}
                </h3>
              </div>
              <button
                onClick={() => setShowProfileEditor(false)}
                className="p-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-4 text-xs font-semibold">
              {/* Field 1: Brand Title */}
              <div className="space-y-1">
                <label className="text-slate-300 block">
                  {language === "bn" ? "কোম্পানি বা ব্র্যান্ডের নাম" : "Company / Brand Name"}
                </label>
                <input
                  type="text"
                  value={companyBrand}
                  onChange={(e) => {
                    setCompanyBrand(e.target.value);
                    localStorage.setItem("ALW_STAR_COMPANY_BRAND", e.target.value);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl py-2.5 px-3 text-xs outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]"
                />
              </div>

              {/* Field 2: Subtitle */}
              <div className="space-y-1">
                <label className="text-slate-300 block">
                  {language === "bn" ? "স্লোগান বা উপশিরোনাম" : "ERP Subtitle & Tagline"}
                </label>
                <input
                  type="text"
                  value={companySubtitle}
                  onChange={(e) => {
                    setCompanySubtitle(e.target.value);
                    localStorage.setItem("ALW_STAR_COMPANY_SUBTITLE", e.target.value);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl py-2.5 px-3 text-xs outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]"
                />
              </div>

              {/* Field 3: Superintendent Name */}
              <div className="space-y-1">
                <label className="text-slate-300 block">
                  {language === "bn" ? "অপারেশনাল ম্যানেজারের নাম" : "Supervisor / Operator Name"}
                </label>
                <input
                  type="text"
                  value={profileUser}
                  onChange={(e) => {
                    setProfileUser(e.target.value);
                    localStorage.setItem("ALW_STAR_PROFILE_USER", e.target.value);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl py-2.5 px-3 text-xs outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]"
                />
              </div>

              {/* Field 4: Superintendent Email */}
              <div className="space-y-1">
                <label className="text-slate-300 block">
                  {language === "bn" ? "অফিসিয়াল ইমেইল এড্রেস" : "Admin Email Address"}
                </label>
                <input
                  type="email"
                  value={profileEmail}
                  onChange={(e) => {
                    setProfileEmail(e.target.value);
                    localStorage.setItem("ALW_STAR_PROFILE_EMAIL", e.target.value);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl py-2.5 px-3 text-xs outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]"
                />
              </div>

              {/* Field 5: Profile picture conversion */}
              <div className="space-y-2 pt-2 border-t border-slate-850">
                <label className="text-slate-300 block">
                  {language === "bn" ? "প্রোফাইল পিকচার পরিবর্তন করুন" : "Change Profile Photo"}
                </label>
                <div className="flex items-center gap-4">
                  {profileAvatarUrl ? (
                    <img
                      src={profileAvatarUrl}
                      alt="Avatar Preview"
                      className="w-12 h-12 rounded-full border border-[#10B981] bg-slate-950 object-cover"
                    />
                  ) : (
                    <AlWafaLogo variant="avatar" size={48} />
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setProfileAvatarUrl(reader.result as string);
                            localStorage.setItem("ALW_STAR_PROFILE_AVATAR", reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-semibold file:bg-slate-800 file:text-[#10B981] hover:file:bg-slate-700 transition cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Accepts PNG, JPG, WebP. Updates persistently on the fly.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2 text-xs font-bold border-t border-slate-800">
              <button
                onClick={() => {
                  setCompanyBrand("AL WAFA STAR");
                  setCompanySubtitle("ERP Smart Control v2.5");
                  setProfileUser("Superintendent Hamdy");
                  setProfileEmail("allitokmal@gmail.com");
                  setProfileAvatarUrl("");
                  localStorage.removeItem("ALW_STAR_COMPANY_BRAND");
                  localStorage.removeItem("ALW_STAR_COMPANY_SUBTITLE");
                  localStorage.removeItem("ALW_STAR_PROFILE_USER");
                  localStorage.removeItem("ALW_STAR_PROFILE_EMAIL");
                  localStorage.removeItem("ALW_STAR_PROFILE_AVATAR");
                }}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
              >
                Reset Default
              </button>
              <button
                onClick={() => setShowProfileEditor(false)}
                className="px-5 py-2.5 bg-[#10B981] hover:bg-emerald-400 text-slate-950 rounded-xl transition shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PWA App Installation Tutorial Modal (ইন্সটল অ্যাপ উইন্ডো) */}
      {isInstallModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in font-sans">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl text-slate-100 flex flex-col max-h-[90vh] overflow-hidden">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">📲</span>
                <div>
                  <h3 className="text-base font-extrabold text-slate-50 leading-tight">
                    {language === "bn" ? "অ্যাপ ডাউনলোড ও ইনস্টল গাইড" : "Install & Download App Guide"}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium font-mono">
                    {language === "bn" ? "মোবাইল, ট্যাবলেট এবং ল্যাপটপে সরাসরি ব্যবহারের নির্দেশিকা" : "Full offline standalone setup for Android, iOS & PC"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsInstallModalOpen(false)}
                className="p-1 px-3 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs font-bold"
              >
                ✕ {language === "bn" ? "বন্ধ করুন" : "Close"}
              </button>
            </div>

            {/* Content Body - Scrollable */}
            <div className="flex-1 overflow-y-auto pr-1 py-4 space-y-5 text-slate-300 text-xs font-sans leading-relaxed">
              
              {/* Standalone Link Recommendation Area */}
              <div className="p-4 bg-amber-500/10 border border-amber-500/25 rounded-2xl text-amber-200">
                <span className="font-bold flex items-center gap-1 text-sm mb-1">
                  ⚠️ {language === "bn" ? "নতুন ট্যাবে ওপেন করতে হবে" : "Open in Standalone Browser Window"}
                </span>
                <p className="text-[11px] font-medium leading-relaxed text-slate-300">
                  {language === "bn" 
                    ? "আপনি বর্তমানে প্রিওভিউ ইন্টিগ্রেশন আইফ্রেম (iFrame) বা শেয়ার করা উইন্ডো থেকে এটি দেখছেন। ব্রাউজার সিকিউরিটি পলিসি অনুযায়ী কোনো শেয়ার্ড আইফ্রেম উইন্ডো থেকে সরাসরি অ্যাপ ব্যাকগ্রাউন্ড ইন্সটলেশন প্রম্পট কার্যকর হয় না। অ্যাপটি সরাসরি আপনার ডিভাইসে ডিকন ট্যাপ বা হোম স্ক্রিনে ডাউনলোড করতে হলে নিচে দেওয়া বাটনটি চাপ দিয়ে সম্পূর্ণ নতুন এবং ফ্রেশ ব্রাউজার উইন্ডোতে ওপেন করুন, এবং তারপর খুব সহজেই যেকোনো নোটিফিকেশন ছাড়া ইন্সটল করে নিন।"
                    : "You are currently running inside an embedded iFrame preview. For strict browser sandboxing security, native installation prompts do not register from within iframes. Please click below to open the application in a standalone, dedicated browser tab to instantly download on any phone, tablet, or desktop PC."}
                </p>
                <div className="mt-3 text-left">
                  <a 
                    href={window.location.href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-sky-500 hover:bg-sky-450 active:scale-95 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-sky-500/20 hover:shadow-sky-500/30 font-sans"
                    style={{ textDecoration: 'none' }}
                  >
                    🚀 {language === "bn" ? "অ্যাপটি নতুন ট্যাবে ওপেন করুন" : "Open App in New Tab"}
                  </a>
                </div>
              </div>

              {/* Direct Prompt if user escaped iframe and prompt fired */}
              {deferredPrompt && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-200 space-y-2">
                  <span className="font-extrabold flex items-center gap-1.5 text-sm">
                    ✨ {language === "bn" ? "১-ক্লিকে ইনস্টল করুন" : "Instantly Install in 1-Click!"}
                  </span>
                  <p className="text-[11px] font-medium text-slate-300">
                    {language === "bn" 
                      ? "আপনার ব্রাউজার সরাসরি এই অ্যাপটিকে ডিভাইসে সেভ ও শর্টকাট আইকন তৈরি করতে প্রস্তুত। নিচের বাটনে চাপ দিয়ে ইন্সটল কনফার্ম করুন!"
                      : "Good news! Your device is running in a compatible native viewport. Tap below to immediately initiate desktop/home-screen application integration."}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      deferredPrompt.prompt();
                      deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
                        if (choiceResult.outcome === "accepted") {
                          console.log("User accepted the install prompt");
                          setIsAppInstalled(true);
                        }
                        setDeferredPrompt(null);
                        setIsInstallModalOpen(false);
                      });
                    }}
                    className="px-4 py-2.5 bg-[#25D366] hover:bg-emerald-500 text-slate-950 font-black rounded-lg text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all cursor-pointer inline-flex items-center justify-center gap-1.5"
                  >
                    📥 {language === "bn" ? "সরাসরি অ্যাপ ইন্সটল করুন" : "Install Locally Now"}
                  </button>
                </div>
              )}

              {/* Steps per device platform */}
              <div className="space-y-4 pt-1">
                <h4 className="text-slate-100 font-bold uppercase tracking-wider text-[11.5px] border-l-4 border-emerald-500 pl-2">
                  📌 {language === "bn" ? "ডিভাইস ভিত্তিক সহজ গাইড" : "Manual Step-by-Step Device Support Guides"}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  
                  {/* Android Chrome */}
                  <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800/80 space-y-2.5 flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🤖</span>
                      <span className="font-extrabold text-slate-100 text-[12px]">
                        {language === "bn" ? "অ্যান্ড্রয়েড ফোন (Chrome/Edge)" : "Android Phones (Chrome / Edge)"}
                      </span>
                    </div>
                    <ol className="list-decimal pl-4.5 text-[11px] text-slate-400 space-y-1.5 flex-1 font-medium leading-relaxed">
                      <li>{language === "bn" ? "প্রথমে পেজটি সাফ বা ব্যাকগ্রাউন্ড আইফ্রেমের বাইরে ক্রোম ব্রাউজারে খুলুন।" : "Open Al Wafa inside standard Android Google Chrome."}</li>
                      <li>{language === "bn" ? "উপরে ডানদিকের ৩টি ডট মেনু বাটনে প্রেস করুন।" : "Tap the three vertical dots (Browser settings menu) in top right."}</li>
                      <li>{language === "bn" ? "তালিকা থেকে 'Install App' বা 'Add to Home Screen' চাপ দিন।" : "Select 'Install App' or 'Add to Home Screen' from popup options."}</li>
                      <li>{language === "bn" ? "হোমস্ক্রিনে চিরতরে অ্যাপ আইকন যুক্ত হয়ে সাইলেন্টলি অফলাইনে ওপেন হবে!" : "Confirm popup, and find your native App sitting inside your phone application drawer!"}</li>
                    </ol>
                  </div>

                  {/* iPhone/iPad Apple Safari */}
                  <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800/80 space-y-2.5 flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🍎</span>
                      <span className="font-extrabold text-slate-100 text-[12px]">
                        {language === "bn" ? "আইফোন বা আইপ্যাড (Safari Browser)" : "iOS iPhone & iPad (Safari)"}
                      </span>
                    </div>
                    <ol className="list-decimal pl-4.5 text-[11px] text-slate-400 space-y-1.5 flex-1 font-medium leading-relaxed">
                      <li>{language === "bn" ? "সাফারি ব্রাউজারে অ্যাপলিকেশনটি খুলুন।" : "Open the Al Wafa site inside Apple's native Safari browser."}</li>
                      <li>{language === "bn" ? "নিচে থাকা শেয়ার (Share Box 📤) আইকনটি ট্যাপ করুন।" : "Tap the share button (square box with upward arrow) at Safari's bottom bar."}</li>
                      <li>{language === "bn" ? "একটু নিচে স্ক্রল করে 'Add to Home Screen' (➕) চাপুন।" : "Scroll and tap 'Add to Home Screen' from options."}</li>
                      <li>{language === "bn" ? "উপরে ডানদিকের 'Add' বাটনে ক্লিক করা মাত্র হোম স্ক্রিনে সেট হয়ে যাবে।" : "Tap 'Add' to instantly transform and launch on your Apple Springboard!"}</li>
                    </ol>
                  </div>

                  {/* Laptop/Desktop PC */}
                  <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800/80 space-y-2.5 flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">💻</span>
                      <span className="font-extrabold text-slate-100 text-[12px]">
                        {language === "bn" ? "ল্যাপটপ বা কম্পিউটার (PC/Desktop)" : "Laptops & Desktops (Mac/Win)"}
                      </span>
                    </div>
                    <ol className="list-decimal pl-4.5 text-[11px] text-slate-400 space-y-1.5 flex-1 font-medium leading-relaxed">
                      <li>{language === "bn" ? "কম্পিউটার থেকে গুগল ক্রোম বা এজ ব্রাউজারে সাইটটি ভিজিট করুন।" : "Visit the platform using PC Google Chrome or Edge."}</li>
                      <li>{language === "bn" ? "ব্রাউজার এড্রেস বারের ডানপাশে (ডাউনলোড বা পিসি চিহ্ন আইকন 🖥️) চাপুন।" : "Look inside the URL address input bar for a prompt showing device monitor to install."}</li>
                      <li>{language === "bn" ? "অথবা ব্রাউজার অপশন থেকে 'Install Page as App' এ ক্লিক করুন।" : "Or open Chrome's top settings menu and select 'Save and Share' ➔ 'Install Page'."}</li>
                      <li>{language === "bn" ? "এটি সম্পূর্ণ রিয়েল এবং ডেডিকেটেড অফলাইন অটো সেভ ডেক্সটপ উইন্ডো হিসেবে কাজ করবে!" : "It works as a dedicated standalone system window directly from your start menu with native app speed."}</li>
                    </ol>
                  </div>

                </div>

              </div>

              {/* Utility Information Card */}
              <div className="p-3 bg-slate-850 rounded-2xl text-slate-400 text-[10px] border border-slate-800 leading-relaxed font-mono">
                💡 {language === "bn" ? "অফলাইন ডাটাবেজ সুবিধা: একবার অ্যাপটি ডিভাইসে ডাউনলোড বা ইন্সটল হয়ে গেলে, মরুভূমি বা রিমোট সেন্টারের মত অফলাইন লোকেশনেও কোনো সিগন্যাল ছাড়াই আপনি নতুন বিল-ভাউচার বা সার্ভিস রিপোর্ট তৈরি করতে এবং সেভ করতে পারবেন। পুনরায় ইন্টারনেট সংযোগ পাওয়া মাত্রই ডাটা কেন্দ্রীয় সার্ভারে জমা হয়ে যাবে!" : "Robust Offline Database Engine: This Progressive Web Application stores active logs in client-side HTML5 indexedDB / localStorage when cellular network is unavailable. You can draft complex forensic treatment sheets anywhere, which will continuously sync background pipelines the literal moment your device connects to the internet."}
              </div>

            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2 text-xs font-bold shrink-0">
              <button
                type="button"
                onClick={() => setIsInstallModalOpen(false)}
                className="px-5 py-2.5 bg-[#10B981] hover:bg-emerald-400 text-slate-950 rounded-xl transition cursor-pointer"
              >
                {language === "bn" ? "বুঝেছি, ধন্যবাদ" : "Got it! Continue"}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
