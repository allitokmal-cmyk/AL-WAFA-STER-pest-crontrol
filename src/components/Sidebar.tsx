import { useState } from "react";
import { 
  Home,
  Settings,
  LayoutDashboard, 
  MapPin, 
  ClipboardList, 
  FlaskConical, 
  Users, 
  User,
  ShieldCheck, 
  Sparkles, 
  Globe, 
  Smartphone,
  CheckCircle2,
  AlertCircle,
  FileText,
  Maximize,
  Minimize,
  Moon,
  Sun,
  Briefcase,
  Layers,
  Activity
} from "lucide-react";
import { AppLanguage, UserRole } from "../types";
import AlWafaLogo from "./AlWafaLogo";

interface SidebarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  role: UserRole;
  setRole: (role: UserRole) => void;
  companyBrand: string;
  companySubtitle: string;
  profileUser: string;
  profileEmail: string;
  profileAvatarUrl: string;
  onOpenProfileEditor: () => void;
  onLogout?: () => void;
  themeMode?: "dark" | "light";
  onSetThemeMode?: (mode: "dark" | "light") => void;
  isFullscreenLayout?: boolean;
  onSetFullscreenLayout?: (val: boolean) => void;
}

export default function Sidebar({
  currentTab,
  setTab,
  language,
  setLanguage,
  role,
  setRole,
  companyBrand,
  companySubtitle,
  profileUser,
  profileEmail,
  profileAvatarUrl,
  onOpenProfileEditor,
  onLogout,
  themeMode,
  onSetThemeMode,
  isFullscreenLayout,
  onSetFullscreenLayout,
}: SidebarProps) {
  const loggedInUserStr = localStorage.getItem("ALW_STAR_LOGGED_IN_USER") || sessionStorage.getItem("ALW_STAR_LOGGED_IN_USER");
  let loggedInUser = null;
  if (loggedInUserStr) {
    try {
      loggedInUser = JSON.parse(loggedInUserStr);
    } catch(e) {}
  }

  const menuItems = [
    { id: "dashboard", label: language === "ar" ? "الرئيسية لوحة التحكم" : language === "bn" ? "হোম ড্যাশবোর্ড" : "Dashboard Home", icon: Home },
    { id: "completed_registry", label: language === "ar" ? "الخدمات المنجزة" : language === "bn" ? "কমপ্লিট সার্ভিস" : "Completed Services", icon: CheckCircle2 },
    { id: "locations", label: language === "ar" ? "قائمة المواقع الجغرافية" : language === "bn" ? "লোকেশন ম্যাপস" : "Locations & Maps", icon: MapPin },
    { id: "supervisors_directory", label: language === "ar" ? "دليل المشرفين" : language === "bn" ? "সুপারভাইজার ডিরেক্টরি" : "Supervisors Directory", icon: ShieldCheck },
    { id: "directory", label: language === "ar" ? "إدارة العمليات والملفات" : language === "bn" ? "অপারেশনাল ফাইল ও লেজার" : "Operations Ledger", icon: ClipboardList },
    { id: "engineering_report", label: language === "ar" ? "التقرير الهندسي" : language === "bn" ? "ইঞ্জিনিয়ারিং রিপোর্ট" : "Engineering Report", icon: FileText },
    { id: "master_form", label: language === "ar" ? "اضافة تقرير معالجة" : language === "bn" ? "সার্ভিস রিপোর্ট ফর্ম" : "Service Report", icon: ClipboardList },
    { id: "inventory", label: language === "ar" ? "مخزون المواد الكيميائية" : language === "bn" ? "কেমিক্যাল ইনভেন্টরি" : "Chemical Inventory", icon: FlaskConical },
    { id: "technicians", label: language === "ar" ? "جدول كشوف المرتبات والحضور" : language === "bn" ? "টাইমশিট ও স্যালারি" : "Time & Attendance (Payroll)", icon: Users },
    { id: "ai_pest", label: language === "ar" ? "فحص الآفات بالذكاء الاصطناعي" : language === "bn" ? "AI পেস্ট এক্সপার্ট" : "AI Pest Expert (Gemini)", icon: Sparkles, highlight: true },
    { id: "client_portal", label: language === "ar" ? "خدمة مكافحة الآفات" : language === "bn" ? "Pest Control Service" : "Pest Control Service", icon: Smartphone },
    { id: "custom_option_1", label: language === "ar" ? "المشاريع والجدولة مخصصة" : language === "bn" ? "প্রজেক্ট ও শিডিউলার" : "Projects & Scheduler", icon: Briefcase },
    { id: "custom_option_2", label: language === "ar" ? "Rpt_Vault" : language === "bn" ? "Rpt_Vault" : "Rpt_Vault", icon: Layers },
    { id: "custom_option_3", label: language === "ar" ? "الخدمة الشاملة المخصصة" : language === "bn" ? "কাস্টম সার্ভিস অল" : "Custom Service All", icon: Activity },
    { id: "admin_settings", label: language === "ar" ? "إعدادات المسؤول" : language === "bn" ? "অ্যাডমিন সেটিংস" : "Admin Settings", icon: Settings }
  ];

  // Restrict tabs based on roles
  const filteredMenuItems = menuItems.filter(item => {
    const userRole = loggedInUser?.role || "Admin";
    if (userRole === "Visitor") {
      // Visitor: can NOT edit anything, cannot open master form, AI Expert (expensive Gemini calls), Team management, or admin settings
      return item.id !== "admin_settings" && item.id !== "master_form" && item.id !== "technicians" && item.id !== "ai_pest";
    }
    if (userRole === "Moderator") {
      // Moderator has access to view/edit but NOT configure settings
      return item.id !== "admin_settings";
    }

    if (role === "Guest Admin") {
      // Guest can preview dashboard, locations, directory, inventory
      return item.id !== "master_form" && item.id !== "technicians" && item.id !== "ai_pest" && item.id !== "admin_settings";
    }
    if (role === "Client Portal") {
      // Client only views their dashboard analytics & history & locations
      return item.id === "dashboard" || item.id === "client_portal" || item.id === "directory" || item.id === "locations" || item.id === "completed_registry" || item.id === "supervisors_directory" || item.id === "engineering_report";
    }
    return true;
  });

  return (
    <div 
      id="erp-sidebar" 
      className="w-80 bg-[#111827] text-slate-100 flex flex-col border-r border-[#1E293B] shrink-0 h-screen overflow-y-auto select-none"
    >
      {/* Brand Header */}
      <div className="p-5 border-b border-[#1E293B] flex flex-col gap-3.5 bg-[#0B0F19] group relative hover:bg-slate-900/40 transition-colors">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlWafaLogo variant="star" size={34} showSubtitle={false} />
          </div>
          <button
            onClick={onOpenProfileEditor}
            title="Edit Brand & Profile"
            className="p-1.5 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg border border-slate-700 text-[#10B981] transition-all cursor-pointer flex items-center justify-center shrink-0"
          >
            <span className="text-xs">⚙️</span>
          </button>
        </div>
      </div>

      {/* Language Quick Access */}
      <div className="p-4 mx-4 mt-6 bg-[#0F172A]/80 border border-slate-700/40 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-300 text-xs font-medium">
          <Globe className="w-4 h-4 text-emerald-400" />
          <span>Language:</span>
        </div>
        <div className="flex gap-1">
          {(["en", "ar", "bn"] as AppLanguage[]).map((lang) => (
            <button
              id={`lang-btn-${lang}`}
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-2 py-1 text-xs font-semibold rounded uppercase transition-all duration-150 ${
                language === lang 
                  ? "bg-[#10B981] text-slate-950 font-bold shadow-md shadow-emerald-500/20" 
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* System Display Controls (Added per request) */}
      <div className="px-6 mt-4">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/40 rounded-xl border border-slate-700/60 shadow-inner w-full justify-between overflow-hidden">
          <button 
            onClick={() => onSetFullscreenLayout?.(true)}
            className={`flex-1 p-2 rounded-lg transition-all duration-200 flex items-center justify-center hover:scale-105 active:scale-95 group ${isFullscreenLayout ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]" : "bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-transparent"}`}
            title={language === "bn" ? "ফুল স্ক্রিন ডিসপ্লে" : "Fullscreen Display"}
          >
            <Maximize className="w-3.5 h-3.5 group-hover:rotate-3 transition-transform" />
          </button>
          
          <button 
            onClick={() => onSetFullscreenLayout?.(false)}
            className={`flex-1 p-2 rounded-lg transition-all duration-200 flex items-center justify-center hover:scale-105 active:scale-95 group ${!isFullscreenLayout ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]" : "bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-transparent"}`}
            title={language === "bn" ? "মিনিমাইজ ডিসপ্লে" : "Minimize Display"}
          >
            <Minimize className="w-3.5 h-3.5 group-hover:-rotate-3 transition-transform" />
          </button>

          <div className="w-px h-5 bg-slate-600/50 mx-0.5"></div>
          
          <button 
            onClick={() => onSetThemeMode?.("dark")}
            className={`flex-1 p-2 rounded-lg transition-all duration-200 flex items-center justify-center hover:scale-105 active:scale-95 group ${themeMode === "dark" ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.2)]" : "bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-transparent"}`}
            title={language === "bn" ? "ডার্ক মোড" : "Dark Mode"}
          >
            <Moon className="w-3.5 h-3.5 group-hover:-rotate-6 transition-transform" />
          </button>

          <button 
            onClick={() => onSetThemeMode?.("light")}
            className={`flex-1 p-2 rounded-lg transition-all duration-200 flex items-center justify-center hover:scale-105 active:scale-95 group ${themeMode === "light" ? "bg-amber-500/20 text-amber-400 border border-amber-400/30 shadow-[0_0_10px_rgba(251,191,36,0.2)]" : "bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-transparent"}`}
            title={language === "bn" ? "লাইট মোড" : "Light Mode"}
          >
            <Sun className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform duration-500" />
          </button>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 p-4 mt-4 space-y-1 overflow-y-auto custom-scrollbar">
        <span className="block px-3 text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-3">
          ERP ARCHITECTURE
        </span>
        {filteredMenuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              id={`nav-tab-${item.id}`}
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all outline-none ${
                isActive 
                  ? "bg-gradient-to-r from-[#10B981]/20 to-emerald-500/5 text-[#10B981] border-l-4 border-[#10B981] shadow-inner" 
                  : item.highlight 
                    ? "text-purple-300 hover:text-white hover:bg-purple-900/10 border-l-4 border-purple-500/20"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-850"
              }`}
            >
              <IconComponent className={`w-4 h-4 ${
                isActive 
                  ? "text-[#10B981]" 
                  : item.highlight 
                    ? "text-purple-400 animate-pulse" 
                    : "text-slate-500"
              }`} />
              <span className="flex-1 text-left">{item.label}</span>
              {item.id === "ai_pest" && (
                <span className="text-[9px] scale-90 px-1 py-0.5 rounded bg-purple-500/20 border border-purple-500/40 text-purple-300 uppercase font-bold pr-1 pl-1">
                  Gemini
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
