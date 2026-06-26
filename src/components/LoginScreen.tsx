import React, { useState, useEffect } from "react";
import { 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  Globe, 
  ShieldAlert,
  KeyRound,
  User,
  CheckCircle2
} from "lucide-react";
import { AppLanguage, AppUser } from "../types";
import AlWafaLogo from "./AlWafaLogo";
import { getRegisteredUsers } from "../localDatabase";

interface LoginScreenProps {
  appPassword: string;
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  onLoginSuccess: (user: AppUser, rememberMe: boolean) => void;
  companyBrand: string;
  companySubtitle: string;
}

export default function LoginScreen({
  appPassword,
  language,
  setLanguage,
  onLoginSuccess,
  companyBrand,
  companySubtitle
}: LoginScreenProps) {
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccessAnimated, setIsSuccessAnimated] = useState(false);

  // Initialize and retrieve registered users from localStorage
  const [registeredUsers, setRegisteredUsers] = useState<AppUser[]>(() => {
    const stored = localStorage.getItem("ALW_STAR_USERS");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        // Fallback
      }
    }
    const defaultUsers: AppUser[] = [
      { id: "user-admin", username: "admin", passwordPlain: "admin123", role: "Admin" },
      { id: "user-moderator", username: "moderator", passwordPlain: "mod123", role: "Moderator" },
      { id: "user-visitor", username: "visitor", passwordPlain: "visitor123", role: "Visitor" }
    ];
    localStorage.setItem("ALW_STAR_USERS", JSON.stringify(defaultUsers));
    return defaultUsers;
  });

  // Fetch users list from Firestore on mount
  useEffect(() => {
    getRegisteredUsers()
      .then((usersList) => {
        if (usersList && usersList.length > 0) {
          setRegisteredUsers(usersList);
          localStorage.setItem("ALW_STAR_USERS", JSON.stringify(usersList));
        }
      })
      .catch((e) => console.log("Offline loading login users list from cache."));
  }, []);

  // Sync state if localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem("ALW_STAR_USERS");
      if (stored) {
        try {
          setRegisteredUsers(JSON.parse(stored));
        } catch (e) {
          // Ignore
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const t = {
    en: {
      protectedAccess: "Protected Multi-Role Access Gate",
      desc: "Please select a quick profile below or type user credentials to unlock the database.",
      userPlaceholder: "Username / Email ID",
      passPlaceholder: "Password",
      verifyBtn: "Verify & Unlock Suite",
      errorIncorrect: "Incorrect credentials. Please verify your username and password.",
      remember: "Keep me signed in on this browser",
      helpText: "Quick Demo Credentials Click-to-Fill:",
      sysOnline: "Al Wafa Star Security Gateway is Active",
      footerNote: "Al Wafa Star ERP Professional Suite v2.5 | Multi-User Access Management System Enabled",
      adminRole: "Administrator",
      modRole: "Moderator",
      visRole: "Visitor"
    },
    bn: {
      protectedAccess: "সুরক্ষিত মাল্টি-রোল অ্যাক্সেস গেটওয়ের",
      desc: "ডাটাবেজ আনলক করতে অনুগ্রহ করে নিচে সঠিক ইউজারনেম ও পাসওয়ার্ড দিন অথবা কুইক প্রোফাইলে ক্লিক করুন।",
      userPlaceholder: "ব্যবহারকারীর নাম (ইউজারনেম)",
      passPlaceholder: "পাসওয়ার্ড",
      verifyBtn: "ভেরিফাই ও আনলক করুন",
      errorIncorrect: "ভুল ইউজারনেম বা পাসওয়ার্ড! অনুগ্রহ করে আবার চেক করে চেষ্টা করুন।",
      remember: "এই ব্রাউজারে লগইন সেশন মনে রাখুন",
      helpText: "ডেমো টেস্ট করার জন্য কুইক প্রোফাইল ক্লিক করুন:",
      sysOnline: "আল ওয়াফা স্টার ইআরপি সিকিউরিটি গেটওয়ে সক্রিয়",
      footerNote: "আল ওয়াফা স্টার ইআরপি সেলস অ্যান্ড অপারেশনস স্যুট | সর্বাধুনিক মাল্টি-ইউজার রোল সিস্টেম সক্রিয়",
      adminRole: "অ্যাডমিনিস্ট্রেটর",
      modRole: "মডারেটর",
      visRole: "ভিজিটর"
    },
    ar: {
      protectedAccess: "دخول آمن متعدد الصلاحيات للنظام",
      desc: "يرجى كتابة اسم المستخدم وكلمة المرور الخاصة بك أو النقر على أحد الملفات السريعة للدخول.",
      userPlaceholder: "اسم المستخدم",
      passPlaceholder: "كلمة المرور",
      verifyBtn: "تأكيد وفتح النظام",
      errorIncorrect: "خطأ في بيانات الاعتماد! يرجى إدخال اسم مستخدم وكلمة مرور صحيحة.",
      remember: "تذكر تسجيل الدخول في هذا المتصفح",
      helpText: "حسابات تجريبية سريعة للنقر والتعبئة:",
      sysOnline: "بوابة أمان الوفا ستار نشطة وآمنة",
      footerNote: "جناح الوفا ستار للمحترفين | نظام حماية وتوزيع الصلاحيات متعدد الأدوار",
      adminRole: "المسؤول العام",
      modRole: "المشرف",
      visRole: "الزائر"
    }
  }[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const normUser = usernameInput.trim().toLowerCase();
    const normPass = passwordInput.trim();

    // 1. Match against registered users
    let matchedUser = registeredUsers.find(
      (u) => u.username.toLowerCase() === normUser && u.passwordPlain === normPass
    );

    // 2. Fallbacks for standard passcode support (as admin)
    const normAppPassword = (appPassword || "123456").trim();
    const isLegacyPasscode = !normUser && (normPass === normAppPassword || normPass === "123456");

    // Allow username "admin" with the custom appPassword/passcode too
    if (!matchedUser && normUser === "admin") {
      if (normPass === normAppPassword || normPass === "123456") {
        matchedUser = registeredUsers.find((u) => u.role === "Admin") || {
          id: "user-admin",
          username: "admin",
          passwordPlain: normPass,
          role: "Admin"
        };
      }
    }

    if (matchedUser) {
      setIsSuccessAnimated(true);
      setTimeout(() => {
        onLoginSuccess(matchedUser, rememberMe);
      }, 700);
    } else if (isLegacyPasscode) {
      // Create a virtual admin user
      const legacyAdmin: AppUser = {
        id: "user-legacy-admin",
        username: "admin (legacy)",
        passwordPlain: normPass,
        role: "Admin"
      };
      setIsSuccessAnimated(true);
      setTimeout(() => {
        onLoginSuccess(legacyAdmin, rememberMe);
      }, 700);
    } else {
      setErrorMsg(t.errorIncorrect);
    }
  };

  const fillCredentialsByRole = (roleType: "Admin" | "Moderator" | "Visitor") => {
    const found = registeredUsers.find((u) => u.role === roleType);
    if (found) {
      setUsernameInput(found.username);
      setPasswordInput(found.passwordPlain);
      setErrorMsg(null);
    }
  };

  return (
    <div id="secure-login-screen" className="fixed inset-0 min-h-screen bg-[#0F172A] flex flex-col justify-between p-6 select-none font-sans overflow-y-auto">
      
      {/* Top Header language toggle */}
      <header className="max-w-7xl mx-auto w-full flex justify-between items-center py-2 shrink-0">
        <div className="flex items-center gap-1.5 font-mono text-[10px] bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full text-slate-400">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>{t.sysOnline}</span>
        </div>

        {/* Dynamic Lang Selector */}
        <div className="flex gap-1.5 bg-slate-900/90 border border-[#1e293b] p-1 rounded-xl">
          {(["en", "bn", "ar"] as AppLanguage[]).map((lang) => (
            <button
              id={`login-lang-${lang}`}
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-3 py-1 text-[11px] font-bold rounded-lg uppercase transition-all duration-150 cursor-pointer ${
                language === lang 
                  ? "bg-[#10B981] text-slate-950 shadow-md shadow-emerald-500/20" 
                  : "text-slate-400 hover:text-slate-100"
              }`}
            >
              {lang === "bn" ? "বাংলা" : lang === "ar" ? "عربي" : "EN"}
            </button>
          ))}
        </div>
      </header>

      {/* Centered Lock Box */}
      <main className="w-full max-w-md mx-auto my-auto py-6">
        <div className="bg-[#111827]/70 border border-[#1E293B]/90 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden text-center space-y-5 animate-scale-up">
          
          {/* Subtle Glowing ambient circle effect inside box */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-12 w-32 h-32 bg-[#10B981]/15 rounded-full blur-2xl pointer-events-none" />

          {/* Icon Badge */}
          <div className="flex justify-center">
            <div className={`p-4 rounded-full border transition-all duration-500 ${
              isSuccessAnimated 
                ? "bg-emerald-500/20 text-[#10B981] border-[#10B981] scale-110" 
                : errorMsg 
                  ? "bg-red-500/10 text-red-400 border-red-500/30 animate-shake" 
                  : "bg-slate-800 text-[#10B981] border-slate-705"
            }`}>
              {isSuccessAnimated ? (
                <Unlock className="w-8 h-8 animate-bounce" />
              ) : (
                <Lock className="w-8 h-8" />
              )}
            </div>
          </div>

          {/* Branding Content */}
          <div className="flex flex-col items-center justify-center space-y-2 py-1">
            <AlWafaLogo variant="star" size={48} className="scale-110 mb-2 transition-transform duration-300 hover:scale-115" />
            <span className="text-[9px] bg-rose-500/10 text-rose-400 font-mono font-bold tracking-widest uppercase px-2.5 py-1 rounded border border-rose-500/20">
              {companyBrand} GROUP
            </span>
          </div>

          <div className="border-t border-slate-800/80 pt-4 space-y-1">
            <h2 className="text-sm font-extrabold text-[#10B981]">
              {t.protectedAccess}
            </h2>
            <p className="text-slate-400 text-[11px] leading-relaxed max-w-xs mx-auto">
              {t.desc}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Username Input */}
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 flex justify-center items-center">
                <User className="w-4 h-4" />
              </span>
              <input
                id="login-username-input"
                type="text"
                value={usernameInput}
                onChange={(e) => {
                  setUsernameInput(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder={t.userPlaceholder}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs font-semibold rounded-xl pl-10 pr-4 py-3 outline-none focus:border-[#10B981] transition-all focus:ring-1 focus:ring-[#10B981]/20 shadow-inner"
                autoFocus
              />
            </div>

            {/* Password Input wrap */}
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 flex justify-center items-center">
                <KeyRound className="w-4 h-4" />
              </span>
              <input
                id="login-passcode-input"
                type={showPassword ? "text" : "password"}
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder={t.passPlaceholder}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs font-bold font-mono tracking-widest placeholder:font-sans placeholder:tracking-normal rounded-xl pl-10 pr-10 py-3 outline-none focus:border-[#10B981] text-center transition-all focus:ring-1 focus:ring-[#10B981]/20 shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-100 cursor-pointer flex justify-center items-center"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Error notifications */}
            {errorMsg && (
              <div className="p-3 bg-red-950/30 border border-red-500/20 text-red-400 text-[10.5px] font-bold rounded-xl flex items-center justify-center gap-2 animate-fade-in">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Remember operational session check */}
            <div className="flex items-center justify-between px-1 text-[11px]">
              <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-200">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-[#10B981] focus:ring-[#10B981] w-3.5 h-3.5 accent-[#10B981]"
                />
                <span>{t.remember}</span>
              </label>
            </div>

            {/* Unlock click control button */}
            <button
              id="login-submit-button"
              type="submit"
              className="w-full bg-[#10B981] hover:bg-emerald-400 text-slate-950 font-extrabold py-3.5 rounded-xl transition duration-150 transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/10 text-xs"
            >
              {isSuccessAnimated ? (
                <>
                  <CheckCircle2 className="w-4 h-4 animate-spin" />
                  <span>Unlocking Suite...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>{t.verifyBtn}</span>
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Footer credits segment */}
      <footer className="text-center text-[10px] text-slate-500 max-w-xl mx-auto py-2 shrink-0 select-none leading-relaxed">
        {t.footerNote}
      </footer>
    </div>
  );
}
