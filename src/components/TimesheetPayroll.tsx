import React, { useState, useEffect } from "react";
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Download, 
  Printer, 
  Plus, 
  Trash2, 
  Check, 
  FileText, 
  UserPlus, 
  Sliders, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle,
  HelpCircle,
  Info
} from "lucide-react";
import { SupervisorRegistryItem } from "../types";

interface TimesheetPayrollProps {
  language: "en" | "ar" | "bn";
  isDark?: boolean;
  supervisors?: SupervisorRegistryItem[];
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  phone?: string;
  baseSalaryType: "Monthly" | "Daily" | "Hourly";
  baseRate: number; // AED
  overtimeRate: number; // AED per hour
  allowances: number; // Housing/Transport/etc.
  deductions: number; // Cash advances or penalties
}

// Day attendance log inside timesheet
export interface DayLog {
  status: "P" | "A" | "O" | "H" | "SL" | "CL" | "OT"; // Present, Absent, Off, Half Day, Sick Leave, Casual Leave, Overtime
  otHours: number;
}

export interface MonthlyTimesheet {
  monthYear: string; // "YYYY-MM"
  staffLogs: Record<string, Record<number, DayLog>>; // staffId -> dayNumber -> DayLog
}

export default function TimesheetPayroll({
  language,
  isDark = false,
  supervisors = []
}: TimesheetPayrollProps) {

  const isBengali = language === "bn";
  const isArabic = language === "ar";

  const t = (en: string, bn: string, ar: string = en) => {
    if (isBengali) return bn;
    if (isArabic) return ar;
    return en;
  };

  // 1. Current Date state
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());
  
  const monthYearKey = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`;

  // 2. Active Mode Tab inside Timesheet

  const [activeSubTab, setActiveSubTab] = useState<"attendance" | "payroll" | "slips">("attendance");

  // 3. Staff Database State
  const [staffList, setStaffList] = useState<StaffMember[]>(() => {
    const saved = localStorage.getItem("ALW_TIMESHEET_STAFF");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }

    // Default seeded staff members
    const initialList: StaffMember[] = [
      { id: "STAFF-01", name: "Hussin Al-Masry", role: "Senior Technician", baseSalaryType: "Daily", baseRate: 150, overtimeRate: 20, allowances: 300, deductions: 0 },
      { id: "STAFF-02", name: "Ahmed Hammad", role: "Junior Technician", baseSalaryType: "Daily", baseRate: 120, overtimeRate: 15, allowances: 200, deductions: 50 },
      { id: "STAFF-03", name: "Aisha Ghaith", role: "Lead Quality Engineer", baseSalaryType: "Monthly", baseRate: 4500, overtimeRate: 35, allowances: 500, deductions: 0 },
      { id: "STAFF-04", name: "Sajid Mahmood", role: "Pest Technician", baseSalaryType: "Daily", baseRate: 110, overtimeRate: 15, allowances: 150, deductions: 0 },
      { id: "STAFF-05", name: "Kamal Hasan", role: "Thermal Fogging Specialist", baseSalaryType: "Daily", baseRate: 130, overtimeRate: 18, allowances: 250, deductions: 0 }
    ];

    // Merge in supervisor names if any are registered
    if (supervisors && supervisors.length > 0) {
      supervisors.forEach((s, idx) => {
        if (!initialList.find(item => item.name.toLowerCase() === s.name.toLowerCase())) {
          initialList.push({
            id: `SUP-${s.id || idx}`,
            name: s.name,
            role: "Supervisor",
            phone: s.phone,
            baseSalaryType: "Monthly",
            baseRate: 3500,
            overtimeRate: 25,
            allowances: 400,
            deductions: 0
          });
        }
      });
    }

    return initialList;
  });

  // 4. Monthly Attendance Logs Database state
  const [timesheets, setTimesheets] = useState<Record<string, Record<string, Record<number, DayLog>>>>(() => {
    const saved = localStorage.getItem("ALW_TIMESHEETS_DATA_V1");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") return parsed;
      } catch (e) {}
    }
    return {};
  });

  // Selected Employee for payingslip view
  const [selectedSlipStaffId, setSelectedSlipStaffId] = useState<string>("");

  // New Staff Modal / Inputs form State
  const [isAddingStaff, setIsAddingStaff] = useState<boolean>(false);
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffRole, setNewStaffRole] = useState("Technician");
  const [newStaffSalType, setNewStaffSalType] = useState<"Monthly" | "Daily" | "Hourly">("Daily");
  const [newStaffBaseRate, setNewStaffBaseRate] = useState<number>(120);
  const [newStaffOtRate, setNewStaffOtRate] = useState<number>(15);
  const [newStaffAllowances, setNewStaffAllowances] = useState<number>(200);

  // Edit individual staff allowances/deductions state
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [tempAllowances, setTempAllowances] = useState<number>(0);
  const [tempDeductions, setTempDeductions] = useState<number>(0);

  // Save changes to localStorage on states update
  useEffect(() => {
    localStorage.setItem("ALW_TIMESHEET_STAFF", JSON.stringify(staffList));
  }, [staffList]);

  useEffect(() => {
    localStorage.setItem("ALW_TIMESHEETS_DATA_V1", JSON.stringify(timesheets));
  }, [timesheets]);

  // Handle setting default staff for slip if empty
  useEffect(() => {
    if (staffList.length > 0 && !selectedSlipStaffId) {
      setSelectedSlipStaffId(staffList[0].id);
    }
  }, [staffList, selectedSlipStaffId]);

  // Helper: Get total days in currently selected Month & Year
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();

  useEffect(() => {
    if (selectedDay > daysInMonth) {
      setSelectedDay(daysInMonth);
    }
  }, [daysInMonth, selectedDay]);

  // Helper: Get list of dates to render

  const dateList = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Helper: Determine Day Name (Sat, Sun, Mon...)
  const getDayName = (dayNum: number) => {
    const d = new Date(selectedYear, selectedMonth - 1, dayNum);
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayNamesBn = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র", "শনি"];
    return isBengali ? dayNamesBn[d.getDay()] : dayNames[d.getDay()];
  };

  // Helper: check if weekend (Friday is standard off day in UAE/GCC)
  const isWeekendFriday = (dayNum: number) => {
    const d = new Date(selectedYear, selectedMonth - 1, dayNum);
    return d.getDay() === 5; // 5 is Friday
  };

  // Get active log or default log if none exists
  const getDayLog = (staffId: string, dayNum: number): DayLog => {
    const monthSheet = timesheets[monthYearKey] || {};
    const staffLogs = monthSheet[staffId] || {};
    
    if (staffLogs[dayNum]) {
      return staffLogs[dayNum];
    }

    // Default values if not set yet:
    const d = new Date(selectedYear, selectedMonth - 1, dayNum);
    const isFriday = d.getDay() === 5;

    return {
      status: isFriday ? "O" : "P", // "O" (Off) for Fridays, "P" (Present) for other days
      otHours: 0
    };
  };

  // Update specific day status or overtime hours
  const setDayLogValue = (staffId: string, dayNum: number, updates: Partial<DayLog>) => {
    setTimesheets(prev => {
      const currentMonthSheet = prev[monthYearKey] || {};
      const currentStaffLogs = currentMonthSheet[staffId] || {};
      const currentDayLog = currentStaffLogs[dayNum] || getDayLog(staffId, dayNum);

      const updatedDayLog = { ...currentDayLog, ...updates };

      return {
        ...prev,
        [monthYearKey]: {
          ...currentMonthSheet,
          [staffId]: {
            ...currentStaffLogs,
            [dayNum]: updatedDayLog
          }
        }
      };
    });
  };

  // Cycle day status on double/single click quickly
  const toggleDayStatus = (staffId: string, dayNum: number) => {
    const current = getDayLog(staffId, dayNum);
    const statuses: DayLog["status"][] = ["P", "OT", "O", "SL", "H", "A"];
    const currentIndex = statuses.indexOf(current.status);
    const nextIndex = (currentIndex + 1) % statuses.length;
    const nextStatus = statuses[nextIndex];

    setDayLogValue(staffId, dayNum, { 
      status: nextStatus,
      otHours: nextStatus === "OT" ? 2 : 0 // auto preset 2 hours OT if selected
    });
  };

  // Delete Staff member safely
  const handleDeleteStaff = (id: string) => {
    if (confirm(t("Are you sure you want to remove this staff member from timesheet calculations?", "আপনি কি নিশ্চিত যে এই কর্মকর্তাকে টাইমশিট তালিকা থেকে বাদ দিতে চান?"))) {
      setStaffList(prev => prev.filter(item => item.id !== id));
      if (selectedSlipStaffId === id) {
        setSelectedSlipStaffId("");
      }
    }
  };

  // Add custom new staff
  const handleAddStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim()) return;

    const newStaff: StaffMember = {
      id: "STAFF-" + Date.now(),
      name: newStaffName,
      role: newStaffRole,
      baseSalaryType: newStaffSalType,
      baseRate: Number(newStaffBaseRate),
      overtimeRate: Number(newStaffOtRate),
      allowances: Number(newStaffAllowances),
      deductions: 0
    };

    setStaffList(prev => [...prev, newStaff]);
    setIsAddingStaff(false);
    setNewStaffName("");
    setNewStaffRole("Technician");
    setNewStaffBaseRate(120);
    setNewStaffOtRate(15);
    setNewStaffAllowances(200);
  };

  // Calculate salary details for an employee for the current month
  const calculatePayroll = (staff: StaffMember) => {
    let presentCount = 0;
    let absentCount = 0;
    let offCount = 0;
    let halfDayCount = 0;
    let sickLeaveCount = 0;
    let otHoursSum = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const log = getDayLog(staff.id, d);
      if (log.status === "P") presentCount++;
      else if (log.status === "A") absentCount++;
      else if (log.status === "O") offCount++;
      else if (log.status === "H") halfDayCount++;
      else if (log.status === "SL" || log.status === "CL") sickLeaveCount++;
      else if (log.status === "OT") {
        presentCount++;
        otHoursSum += Number(log.otHours) || 0;
      }
    }

    // Calculation logic
    let basicEarnedPay = 0;

    if (staff.baseSalaryType === "Monthly") {
      // Monthly base is fixed. However, absent days deduct base/daysInMonth per day.
      const dailyEquivalent = staff.baseRate / daysInMonth;
      basicEarnedPay = staff.baseRate - (absentCount * dailyEquivalent) - (halfDayCount * 0.5 * dailyEquivalent);
    } else if (staff.baseSalaryType === "Daily") {
      // Paid for presents + standard paid offs/leaves + 0.5 for half days
      const paidDays = presentCount + sickLeaveCount + (halfDayCount * 0.5);
      basicEarnedPay = paidDays * staff.baseRate;
    } else { // Hourly
      // Calculated as default 8 hours work per Present day + 4 hours for half day
      const totalHours = (presentCount * 8) + (halfDayCount * 4);
      basicEarnedPay = totalHours * staff.baseRate;
    }

    const otPay = otHoursSum * staff.overtimeRate;
    const grossPay = basicEarnedPay + otPay + Number(staff.allowances || 0);
    const netPay = grossPay - Number(staff.deductions || 0);

    return {
      present: presentCount,
      absent: absentCount,
      off: offCount,
      halfDay: halfDayCount,
      leaves: sickLeaveCount,
      otHours: otHoursSum,
      basicEarnedPay: Math.round(basicEarnedPay * 100) / 100,
      otPay: Math.round(otPay * 100) / 100,
      gross: Math.round(grossPay * 100) / 100,
      net: Math.round(netPay * 100) / 100
    };
  };

  // Preset whole month for an employee as completely present with normal offs
  const presetWholeMonth = (staffId: string, type: "present" | "reset") => {
    setTimesheets(prev => {
      const currentMonthSheet = prev[monthYearKey] || {};
      const currentStaffLogs = { ...currentMonthSheet[staffId] };

      for (let d = 1; d <= daysInMonth; d++) {
        const dObj = new Date(selectedYear, selectedMonth - 1, d);
        const isFriday = dObj.getDay() === 5;
        if (type === "present") {
          currentStaffLogs[d] = {
            status: isFriday ? "O" : "P",
            otHours: 0
          };
        } else {
          delete currentStaffLogs[d];
        }
      }

      return {
        ...prev,
        [monthYearKey]: {
          ...currentMonthSheet,
          [staffId]: currentStaffLogs
        }
      };
    });
  };

  // Quick helper to increase/decrease month
  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(v => v - 1);
    } else {
      setSelectedMonth(v => v - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(v => v + 1);
    } else {
      setSelectedMonth(v => v + 1);
    }
  };

  const months = [
    { value: 1, name: "January", bn: "জানুয়ারি" },
    { value: 2, name: "February", bn: "ফেব্রুয়ারি" },
    { value: 3, name: "March", bn: "মার্চ" },
    { value: 4, name: "April", bn: "এপ্রিল" },
    { value: 5, name: "May", bn: "মে" },
    { value: 6, name: "June", bn: "জুন" },
    { value: 7, name: "July", bn: "জুলাই" },
    { value: 8, name: "August", bn: "আগস্ট" },
    { value: 9, name: "September", bn: "সেপ্টেম্বর" },
    { value: 10, name: "October", bn: "অক্টোবর" },
    { value: 11, name: "November", bn: "নভেম্বর" },
    { value: 12, name: "December", bn: "ডিসেম্বর" }
  ];

  // Print system for payslip
  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <div className={`p-4 md:p-6 lg:p-8 space-y-6 ${isDark ? "text-white" : "text-slate-800"}`}>
      
      {/* Header Info Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 p-6 md:p-8 rounded-3xl border border-slate-700/50 text-white shadow-xl">
        <div className="space-y-1.5">
          <span className="px-3 py-1 text-[10px] tracking-widest uppercase font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
            {t("FINANCIAL REVENUE & WORKFLOW", "আর্থিক পারিশ্রমিক ও কর্মপ্রবাহ")}
          </span>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2 font-sans">
            <Users className="w-8 h-8 text-emerald-400" />
            <span>{t("Salary Timesheet & Payroll Manager", "কর্মকর্তা টাইমশিট ও স্যালারি শীট")}</span>
          </h1>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            {t(
              "Comprehensive automated attendance, overtime tracker & payslip sheet generator mapped directly to professional UAE service standards.",
              "কর্মচারীদের দৈনিক হাজিরা, দৈনিক ওভারটাইম হিসাব ও প্রিন্টযোগ্য বেতন রসিদ তৈরি করার পূর্ণাঙ্গ স্যালারি শিট সিস্টেম।"
            )}
          </p>
        </div>

        {/* Global Month/Year Switcher Slider */}
        <div className="flex items-center gap-2 bg-slate-850 p-2 rounded-2xl border border-slate-700 shrink-0 shadow-lg">
          <button 
            type="button"
            onClick={handlePrevMonth}
            className="p-2 hover:bg-slate-700 text-[#10B981] rounded-xl active:scale-95 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex gap-1.5 items-center px-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-transparent text-white font-bold text-xs md:text-sm border-none outline-none cursor-pointer focus:ring-0 uppercase tracking-wider font-mono"
            >
              {months.map(m => (
                <option key={m.value} value={m.value} className="bg-slate-900 text-white font-sans font-semibold">
                  {isBengali ? m.bn : m.name}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent text-emerald-400 font-black text-xs md:text-sm border-none outline-none cursor-pointer focus:ring-0 font-mono"
            >
              {[2024, 2025, 2026, 2027, 2028].map(y => (
                <option key={y} value={y} className="bg-slate-900 text-white font-sans font-bold">
                  {y}
                </option>
              ))}
            </select>
          </div>

          <button 
            type="button"
            onClick={handleNextMonth}
            className="p-2 hover:bg-slate-700 text-[#10B981] rounded-xl active:scale-95 transition-all cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation Subtabs */}
      <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-250 dark:border-slate-700 max-w-2xl">
        <button
          onClick={() => setActiveSubTab("attendance")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeSubTab === "attendance"
              ? "bg-[#10B981] text-slate-950 font-bold shadow-md shadow-emerald-500/10"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>{t("Attendance Timesheet", "দৈনিক হাজিরা ও ওটি")}</span>
        </button>

        <button
          onClick={() => setActiveSubTab("payroll")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeSubTab === "payroll"
              ? "bg-[#10B981] text-slate-950 font-bold shadow-md shadow-emerald-500/10"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>{t("Payroll Calculation", "বেতন হিসাব শিট")}</span>
        </button>

        <button
          onClick={() => setActiveSubTab("slips")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeSubTab === "slips"
              ? "bg-[#10B981] text-slate-950 font-bold shadow-md shadow-emerald-500/10"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{t("Payslip Generator", "বেতন রসিদ স্লিপ")}</span>
        </button>
      </div>

      {/* QUICK INSTRUCTIONS BANNER */}
      <div className={`p-4 rounded-2xl border text-xs gap-3 flex items-start leading-relaxed ${
        isDark ? "bg-slate-900/60 border-slate-800 text-slate-300" : "bg-teal-50/50 border-teal-200/60 text-slate-700"
      }`}>
        <Info className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-slate-800 dark:text-white">
            {t("How to manage this Month's Timesheet:", "স্যালারি ও টাইমশিট সিস্টেম নির্দেশিকা:")}
          </p>
          {activeSubTab === "attendance" ? (
            <p>
              {t(
                "Select a day from the top date strip. Then click directly on the status buttons (P, A, H, OT, SL, O) for each employee to instantly set their daily log. Overtime input fields will appear when OT is selected.",
                "উপরের ক্যালেন্ডার স্ট্রিপ থেকে একটি দিন বেছে নিন। তারপর প্রত্যেক কর্মকর্তার নামের নিচে থাকা (P, A, OT) বাটনে ক্লিক করে সহজেই দৈনিক হাজিরা সেট করুন। OT নির্বাচন করলে ওভারটাইম ঘণ্টা লেখার অপশন আসবে।"
              )}
            </p>
          ) : activeSubTab === "payroll" ? (
            <p>
              {t(
                "Review automated calculations (Present Days * Base Rate, Overtime * OT Rate, Plus Allowances Minus Deductions). Simply click edit icon inline next to Allowance/Deductions to instantly override and tweak payments.",
                "প্রতিটি কর্মচারীর মোট হিসাব পর্যালোচনা করুন। অতিরিক্ত এলাউন্স বা জরিমানা বা ঋণ অগ্রিম কর্তন করতে চাইলে নামের পাশে এডিট বাটনে চাপ দিয়ে যেকোনো সময় এন্ট্রি করতে পারবেন ও ডাটা স্বয়ংক্রিয়ভাবে আপডেট হয়ে যাবে।"
              )}
            </p>
          ) : (
            <p>
              {t(
                "Select any employee from the quick dropdown list, review their formal printable pay slip with digital signature blocks & corporate company brand details, and hit the Print Slip button.",
                "যেকোনো কর্মকর্তার নাম নির্বাচন করুন, তার পূর্ণাঙ্গ বেতনের বিশদ বিবরণ ও কোম্পানির লোগো সহ প্রিন্ট উপযোগী বেতন স্লিপ তৈরি হবে যা সরাসরি ডাউনলোড বা প্রিন্ট করে সংরক্ষণ করতে পারবেন।"
              )}
            </p>
          )}
        </div>
      </div>

      {/* ======================= TAB 1: ATTENDANCE TIMESHEET GRID ======================= */}
      {activeSubTab === "attendance" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h3 className="text-base font-bold flex items-center gap-2 mb-2 sm:mb-0">
              <span>📅 {t("Daily Attendance Entry:", "দৈনিক হাজিরা এন্ট্রি:")}</span>
              <span className="text-xs bg-slate-100 dark:bg-slate-800 text-emerald-500 px-2 py-0.5 rounded border border-emerald-500/20 font-mono font-bold uppercase">
                {months.find(m => m.value === selectedMonth)?.name} {selectedYear}
              </span>
            </h3>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setIsAddingStaff(true)}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-extrabold text-[11px] uppercase tracking-wider rounded-xl border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{t("Add New Staff", "নতুন কর্মী যুক্ত করুন")}</span>
              </button>
            </div>
          </div>

          {/* Daily Selection Strip */}
          <div className="flex overflow-x-auto gap-2 py-2 mb-2 scrollbar-hide shrink-0 snap-x">
            {dateList.map(df => {
              const isSelected = selectedDay === df;
              const isFr = isWeekendFriday(df);
              return (
                <button
                  key={df}
                  onClick={() => setSelectedDay(df)}
                  className={`flex flex-col items-center justify-center min-w-[50px] p-2 rounded-xl transition-all cursor-pointer snap-center ${
                    isSelected 
                      ? "bg-emerald-500 text-slate-900 font-bold shadow-md shadow-emerald-500/20 transform scale-110"
                      : isFr
                        ? "bg-red-500/10 text-red-500 hover:bg-red-500/20 font-bold"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 font-medium"
                  }`}
                >
                  <span className="text-[10px] tracking-tighter opacity-80 mb-0.5">{getDayName(df)}</span>
                  <span className={`text-lg font-black ${isSelected ? "text-slate-900" : ""}`}>{String(df).padStart(2, "0")}</span>
                </button>
              );
            })}
          </div>

          {/* Daily Entries List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {staffList.map((st) => {
              const logObj = getDayLog(st.id, selectedDay);
              
              const statuses: { label: string, val: DayLog["status"], color: string }[] = [
                { label: "P", val: "P", color: "text-emerald-700 dark:text-emerald-400 bg-emerald-500/20 border-emerald-500/30 font-black" },
                { label: "A", val: "A", color: "text-rose-700 dark:text-rose-400 bg-rose-500/20 border-rose-500/30 font-black" },
                { label: "H", val: "H", color: "text-amber-700 dark:text-amber-400 bg-amber-500/20 border-amber-500/30 font-black" },
                { label: "OT", val: "OT", color: "text-yellow-700 dark:text-yellow-400 bg-yellow-500/20 border-yellow-400/50 font-black" },
                { label: "SL", val: "SL", color: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/20 border-indigo-500/30 font-bold" },
                { label: "O", val: "O", color: "text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/20 font-bold" }
              ];

              return (
                <div key={st.id} className={`p-4 rounded-2xl border transition-colors flex flex-col gap-3 ${isDark ? "border-slate-800 bg-slate-850" : "border-slate-200 bg-white"} shadow-sm`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-slate-900 dark:text-white capitalize text-sm">{st.name}</h4>
                      <div className="text-[10px] text-[#10B981] font-bold tracking-wide mt-0.5">{st.role}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-6 gap-1.5 mt-1">
                    {statuses.map(s => (
                      <button
                        key={s.val}
                        onClick={() => {
                          setDayLogValue(st.id, selectedDay, { 
                            status: s.val,
                            otHours: s.val === "OT" && !logObj.otHours ? 2 : logObj.otHours 
                          });
                        }}
                        className={`flex justify-center items-center py-2 rounded-lg text-[11px] border cursor-pointer active:scale-95 transition-all ${
                          logObj.status === s.val 
                            ? `${s.color} ring-2 ring-emerald-500/30 shadow-sm` 
                            : "bg-slate-50 dark:bg-slate-900/50 text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 font-medium"
                        }`}
                        title={s.label}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>

                  {logObj.status === "OT" && (
                    <div className="flex items-center justify-between gap-2 mt-1 bg-yellow-500/10 p-2.5 rounded-xl border border-yellow-500/10 animate-fade-in">
                      <span className="text-[11px] font-bold text-yellow-700 dark:text-yellow-400">
                        {t("Overtime Hours:", "ওভারটাইম ঘন্টা:")}
                      </span>
                      <input
                        type="number"
                        min="0"
                        max="24"
                        value={logObj.otHours || ""}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setDayLogValue(st.id, selectedDay, { otHours: val >= 0 ? val : 0 });
                        }}
                        className="w-20 p-1.5 text-xs font-bold text-center border border-yellow-400/50 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-yellow-400"
                        placeholder="0"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Grid Indicators Help Guide Label Legend */}
          <div className="flex flex-wrap gap-2 justify-center p-3.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800 text-[10px] md:text-xs">
            <span className="font-extrabold uppercase mr-2 text-slate-400 tracking-wider font-mono">{t("Legend:", "সংকেতসমূহ:")}</span>
            <div className="flex items-center gap-1.5 mr-3">
              <span className="w-5 h-5 bg-emerald-500/15 text-emerald-600 rounded flex items-center justify-center font-bold text-[10px]">P</span>
              <span className="font-medium text-slate-500">{t("Present (8 hrs)", "উপস্থিত")}</span>
            </div>
            <div className="flex items-center gap-1.5 mr-3">
              <span className="w-5 h-5 bg-yellow-500/20 text-yellow-600 rounded flex items-center justify-center font-bold text-[10px]">OT</span>
              <span className="font-medium text-slate-500">{t("Overtime Work Hours", "ওভারটাইম")}</span>
            </div>
            <div className="flex items-center gap-1.5 mr-3">
              <span className="w-5 h-5 bg-sky-500/10 text-sky-500 rounded flex items-center justify-center font-bold text-[10px]">O</span>
              <span className="font-medium text-slate-500">{t("Day Off", "সাপ্তাহিক ছুটি")}</span>
            </div>
            <div className="flex items-center gap-1.5 mr-3">
              <span className="w-5 h-5 bg-amber-500/15 text-amber-500 rounded flex items-center justify-center font-bold text-[10px]">H</span>
              <span className="font-medium text-slate-500">{t("Half-day Shift", "অর্ধ উপস্থিত")}</span>
            </div>
            <div className="flex items-center gap-1.5 mr-3">
              <span className="w-5 h-5 bg-indigo-500/15 text-indigo-500 rounded flex items-center justify-center font-bold text-[10px]">SL</span>
              <span className="font-medium text-slate-500">{t("Leave (Sick/Paid)", "অসুস্থতা/অনুমোদিত ছুটি")}</span>
            </div>
            <div className="flex items-center gap-1.5 mr-3">
              <span className="w-5 h-5 bg-rose-500/15 text-rose-500 rounded flex items-center justify-center font-bold text-[10px]">A</span>
              <span className="font-medium text-slate-500">{t("Absent (Unpaid)", "অনুপস্থিত")}</span>
            </div>
          </div>
        </div>
      )}

      {/* ======================= TAB 2: PAYROLL CALCULATIONS SHEET ======================= */}
      {activeSubTab === "payroll" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h3 className="text-base font-bold flex items-center gap-2">
              <span>💰 {t("Monthly Salary Payroll Calculation Sheet:", "মাসিক বেতনের হিসাব শিট ও ভাউচার:")}</span>
              <span className="text-xs bg-emerald-500/10 text-emerald-500 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-bold uppercase">
                {months.find(m => m.value === selectedMonth)?.name} {selectedYear}
              </span>
            </h3>

            {/* Print Payroll Button */}
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer select-none"
            >
              <Printer className="w-4 h-4" />
              <span>{t("Print Payroll Sheet", "সমগ্র শিট প্রিন্ট করুন")}</span>
            </button>
          </div>

          {/* Salary Grid Table */}
          <div className="w-full overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm bg-gradient-to-b from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-950">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-850 text-slate-500 text-[10px] uppercase font-mono">
                  <th className="p-4 font-bold">{t("EMPLOYEE DETAILS", "কর্মচারীর নাম ও বিবরণ")}</th>
                  <th className="p-4 text-center font-bold">{t("ATTENDANCE DAYS (P/A/H/L)", "হাজিরা বিবরণ")}</th>
                  <th className="p-4 text-center font-bold">{t("OVERTIME (HOURS/PAY)", "ওভারটাইম হিসাব")}</th>
                  <th className="p-4 text-emerald-600 dark:text-emerald-400 font-bold">{t("BASIC EARNED", "মূল অর্জিত বেতন")}</th>
                  <th className="p-4 text-blue-600 dark:text-blue-400 font-bold">{t("ALLOWANCES (AED)", "এলাউন্স সমূহ")}</th>
                  <th className="p-4 text-rose-600 dark:text-rose-450 font-bold">{t("DEDUCTIONS (AED)", "কর্তন বা অগ্রিম")}</th>
                  <th className="p-4 bg-emerald-500/10 text-slate-900 dark:text-white font-black text-right">{t("NET PAYABLE", "সর্বমোট প্রদেয়")}</th>
                  <th className="p-4 text-center font-bold">{t("ACTIONS", "অ্যাকশন")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 dark:divide-slate-800/80">
                {staffList.map((st) => {
                  const calc = calculatePayroll(st);
                  const isEditing = editingStaffId === st.id;

                  return (
                    <tr key={st.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/30 transition-colors text-[12.5px]">
                      
                      {/* Name & Rate Info */}
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-extrabold text-slate-900 dark:text-white">{st.name}</span>
                          <span className="text-[10px] text-slate-500 mt-0.5">{st.role} • {st.baseSalaryType === "Monthly" ? t("Fixed Mode", "মাসিক ফিক্সড") : t("Daily Wage Mode", "দৈনিক ক্যাটাগরি")}</span>
                          <span className="text-[10px] text-slate-400 mt-1 font-mono">Rate: {st.baseRate} AED / OT: {st.overtimeRate} AED</span>
                        </div>
                      </td>

                      {/* Attendance Summary */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 font-bold font-mono">
                          <span className="text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded" title={t("Present days", "উপস্থিত দিন")}>
                            {calc.present}P
                          </span>
                          <span className="text-rose-600 bg-rose-500/10 px-2 py-0.5 rounded" title={t("Absent days", "অনুপস্থিত দিন")}>
                            {calc.absent}A
                          </span>
                          <span className="text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded" title={t("Half Day count", "হাফ দিন")}>
                            {calc.halfDay}H
                          </span>
                          <span className="text-indigo-600 bg-indigo-500/10 px-1.5 py-0.5 rounded" title={t("Leaves", "ছুটি দিন")}>
                            {calc.leaves}L
                          </span>
                        </div>
                        <span className="block text-[8.5px] text-slate-400 mt-1 uppercase font-mono">{t("Total days: ", "সর্বমোট দিন: ") + (calc.present + calc.absent + calc.leaves + (calc.halfDay / 2)) + "/" + daysInMonth}</span>
                      </td>

                      {/* Overtime details */}
                      <td className="p-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className="font-extrabold font-mono text-yellow-600 dark:text-yellow-400">{calc.otHours} {t("hrs", "ঘণ্টা")}</span>
                          <span className="text-[10.5px] font-bold text-slate-400 font-mono mt-0.5">{calc.otPay} AED</span>
                        </div>
                      </td>

                      {/* Basic salary earned */}
                      <td className="p-4 font-black font-mono text-[#0F172A] dark:text-slate-100">
                        {calc.basicEarnedPay} {t("AED", "দিরহাম")}
                      </td>

                      {/* Allowances housing/trans Edit Slot */}
                      <td className="p-4">
                        {isEditing ? (
                          <div className="flex items-center gap-1 max-w-[100px]">
                            <input
                              type="number"
                              value={tempAllowances}
                              onChange={(e) => setTempAllowances(Number(e.target.value) || 0)}
                              className="w-16 p-1 text-xs font-bold border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                            />
                          </div>
                        ) : (
                          <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">
                            {st.allowances || 0} AED
                          </span>
                        )}
                      </td>

                      {/* Deductions Edit Slot */}
                      <td className="p-4">
                        {isEditing ? (
                          <div className="flex items-center gap-1 max-w-[100px]">
                            <input
                              type="number"
                              value={tempDeductions}
                              onChange={(e) => setTempDeductions(Number(e.target.value) || 0)}
                              className="w-16 p-1 text-xs font-bold border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                            />
                          </div>
                        ) : (
                          <span className="font-bold text-rose-500 font-mono">
                            {st.deductions || 0} AED
                          </span>
                        )}
                      </td>

                      {/* Final Net Payable */}
                      <td className="p-4 bg-emerald-500/5 text-right font-black font-mono text-[14px] text-emerald-600 dark:text-emerald-400">
                        {calc.net} AED/={""}
                      </td>

                      {/* Action Cell */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {isEditing ? (
                            <button
                              onClick={() => {
                                setStaffList(prev => prev.map(item => {
                                  if (item.id === st.id) {
                                    return {
                                      ...item,
                                      allowances: tempAllowances,
                                      deductions: tempDeductions
                                    };
                                  }
                                  return item;
                                }));
                                setEditingStaffId(null);
                              }}
                              className="p-1 px-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-lg text-[10px] font-black cursor-pointer uppercase transition-all flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              <span>{t("Save", "সেভ")}</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingStaffId(st.id);
                                setTempAllowances(st.allowances || 0);
                                setTempDeductions(st.deductions || 0);
                              }}
                              className="p-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-lg text-[11px] font-bold text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                              title={t("Edit adjustments", "সংশোধন")}
                            >
                              ⚙️ {t("Tweak Adjust", "সংশোধন")}
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedSlipStaffId(st.id);
                              setActiveSubTab("slips");
                            }}
                            className="p-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                            title={t("Generate Slip", "স্লিপ")}
                          >
                            📄 {t("Slip", "রসিদ")}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals Roll-Up Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-4">
              <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold">{t("Active Payroll Count", "মোট প্রদেয় কর্মকর্তা")}</div>
                <div className="text-xl font-black font-mono text-slate-800 dark:text-white mt-1">
                  {staffList.length} Staff members
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-amber-500/5 dark:bg-amber-500/2 rounded-2xl border border-amber-500/20 flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold">{t("Overtime Booked", "মোট ওটি সম্পন্ন")}</div>
                <div className="text-xl font-black font-mono text-amber-600 dark:text-amber-400 mt-1">
                  {staffList.reduce((acc, st) => acc + calculatePayroll(st).otHours, 0)} Hours
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/2 rounded-2xl border border-emerald-500/20 flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[10px] text-emerald-500 uppercase tracking-widest font-mono font-bold">{t("Total Outflow", "সর্বমোট মাসিক স্যালারি")}</div>
                <div className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                  AED {staffList.reduce((acc, st) => acc + calculatePayroll(st).net, 0).toLocaleString()} /=
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================= TAB 3: PAYSLIP COMPONENT ======================= */}
      {activeSubTab === "slips" && (
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Header configuration for printable slip */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider">{t("Select Staff For Pay Slip:", "কর্মকর্তার নাম নির্বাচন করুন:")}</label>
              <select
                value={selectedSlipStaffId}
                onChange={(e) => setSelectedSlipStaffId(e.target.value)}
                className="p-1 px-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold rounded-lg cursor-pointer max-w-xs focus:ring-1 focus:ring-emerald-400"
              >
                {staffList.map(st => (
                  <option key={st.id} value={st.id}>{st.name}</option>
                ))}
              </select>
            </div>

            {/* Print Slip Button */}
            <button
              onClick={handlePrintSlip}
              className="px-4 py-2 bg-[#10B981] hover:bg-emerald-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-500/10 active:scale-95 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{t("Print Current Slip", "বেতন রসিদ প্রিন্ট করুন")}</span>
            </button>
          </div>

          {/* PRINTABLE SLIP CONTENT BLOCK CARD */}
          {selectedSlipStaffId && staffList.find(st => st.id === selectedSlipStaffId) && (() => {
            const currentStaff = staffList.find(st => st.id === selectedSlipStaffId)!;
            const currentCalc = calculatePayroll(currentStaff);

            return (
              <div 
                id="printable-salary-receipt"
                className="bg-white text-slate-800 p-8 md:p-12 rounded-3xl border border-slate-300 shadow-xl space-y-8 font-sans max-w-3xl mx-auto relative overflow-hidden"
                style={{ direction: 'ltr' }} // Payroll is standard globally
              >
                {/* Visual Watermark Header Accent Bar */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-600 via-teal-500 to-indigo-600"></div>

                {/* Slip Header with Company Details */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-250 pb-6 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xl font-black text-slate-900 tracking-tighter">AL WAFA STAR</span>
                      <span className="text-emerald-500 text-lg">★</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">PEST CONTROL & SERVICES CO. L.L.C</p>
                    <p className="text-[9px] text-slate-400">Office 403, Prime Tower, Business Bay, Dubai, UAE</p>
                    <p className="text-[9px] text-slate-400">Contact: +971 4 235 6555 | finance@alwafastar.ae</p>
                  </div>

                  <div className="text-right space-y-1">
                    <span className="px-3.5 py-1 text-[9px] font-black tracking-widest uppercase bg-slate-100 text-slate-700 rounded border border-slate-200">
                      PAY SLIP / বেতন রসিদ
                    </span>
                    <p className="text-[10px] font-mono text-slate-500 mt-2">
                      Slip Ref: <span className="font-extrabold text-slate-700">AWS-PAY-{(selectedMonth + selectedYear)}-{currentStaff.id.split("-")[1] || "K"}</span>
                    </p>
                    <p className="text-[10px] font-mono text-slate-500">
                      Period: <span className="font-extrabold text-slate-800">{months.find(m => m.value === selectedMonth)?.name} - {selectedYear}</span>
                    </p>
                  </div>
                </div>

                {/* Staff Member Metadata Card Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest block font-bold">Employee Information</span>
                    <p className="text-sm font-black text-slate-900 capitalize">{currentStaff.name}</p>
                    <p className="text-xs text-slate-600 font-bold">{currentStaff.role}</p>
                    <p className="text-[10px] text-slate-500">ID: {currentStaff.id}</p>
                  </div>

                  <div className="space-y-1 text-left md:text-right">
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest block font-bold">Standard Wages Settings</span>
                    <p className="text-xs text-slate-800">
                      Base Salary Type: <span className="font-extrabold text-slate-900">{currentStaff.baseSalaryType}</span>
                    </p>
                    <p className="text-xs text-slate-800">
                      Standard Rate: <span className="font-extrabold text-slate-900">{currentStaff.baseRate} AED</span>
                    </p>
                    <p className="text-xs text-slate-800">
                      OT Hour Multiplier: <span className="font-extrabold text-slate-900">{currentStaff.overtimeRate} AED/h</span>
                    </p>
                  </div>
                </div>

                {/* Attendance Summary */}
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">Monthly Shift Summary</span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                      <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-bold">Presents</span>
                      <span className="text-sm font-black text-indigo-950 font-mono">{currentCalc.present} Days</span>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                      <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-bold">Absents</span>
                      <span className="text-sm font-black text-rose-600 font-mono">{currentCalc.absent} Days</span>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                      <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-bold">Sick/Paid Days</span>
                      <span className="text-sm font-black text-slate-700 font-mono">{currentCalc.leaves} Days</span>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                      <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-bold">Half-Days</span>
                      <span className="text-sm font-black text-amber-600 font-mono">{currentCalc.halfDay} Days</span>
                    </div>

                    <div className="p-3 bg-teal-50 border border-teal-100 rounded-xl text-center col-span-2 sm:col-span-1">
                      <span className="text-[9px] uppercase tracking-wider font-mono text-emerald-600 block font-bold">OT Workbooked</span>
                      <span className="text-sm font-black text-emerald-700 font-mono">{currentCalc.otHours} Hours</span>
                    </div>
                  </div>
                </div>

                {/* Earnings and Deductions Tabular Breakdown Ledger */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  
                  {/* Earnings */}
                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="bg-slate-50 border-b border-slate-200 p-3">
                      <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-slate-700">Gross Earnings</span>
                    </div>
                    <div className="divide-y divide-slate-150 p-3 space-y-2">
                      <div className="flex justify-between items-center text-xs text-slate-600 py-1">
                        <span>Basic Earned Pay:</span>
                        <span className="font-extrabold font-mono text-slate-900">{currentCalc.basicEarnedPay} AED</span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-slate-600 py-1">
                        <span>Overtime Pay ({currentCalc.otHours}h * {currentStaff.overtimeRate} AED):</span>
                        <span className="font-extrabold font-mono text-slate-900">{currentCalc.otPay} AED</span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-slate-600 py-1">
                        <span>Paid Allowances (Accomm/Trans):</span>
                        <span className="font-extrabold font-mono text-slate-900">{(currentStaff.allowances || 0)} AED</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-black text-slate-900 pt-2 border-t border-dashed border-slate-300">
                        <span>Gross Earnings Payout:</span>
                        <span className="font-mono text-slate-950">{currentCalc.gross} AED</span>
                      </div>
                    </div>
                  </div>

                  {/* Deductions */}
                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="bg-rose-50/50 border-b border-slate-200 p-3">
                      <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-rose-850">Deductions & Offsets</span>
                    </div>
                    <div className="divide-y divide-slate-150 p-3 space-y-2">
                      <div className="flex justify-between items-center text-xs text-slate-600 py-1">
                        <span>Cash Advances / Loan repayment:</span>
                        <span className="font-extrabold font-mono text-rose-650">{(currentStaff.deductions || 0)} AED</span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-slate-600 py-1">
                        <span>Absent Penalties (unpaid leaves):</span>
                        <span className="font-extrabold font-mono text-slate-700">0.00 AED</span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-slate-600 py-1">
                        <span>Other Offsets / Transport fine:</span>
                        <span className="font-extrabold font-mono text-slate-700">0.00 AED</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-black text-rose-700 pt-2 border-t border-dashed border-slate-300">
                        <span>Total Monthly Deductions:</span>
                        <span className="font-mono text-rose-800">{(currentStaff.deductions || 0)} AED</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Final Net Payable Statement Roll container */}
                <div className="bg-emerald-50 border border-emerald-250 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-3">
                  <div className="text-center sm:text-left">
                    <span className="text-[9px] uppercase tracking-widest block font-bold text-emerald-800">NET NET PAYABLE DIRECT TO EMPLOYEE</span>
                    <span className="text-[10px] text-slate-500 font-medium">In words: Dirhams {currentCalc.net.toLocaleString()} only</span>
                  </div>
                  <div className="text-xl font-black font-mono text-emerald-700">
                    AED {currentCalc.net.toLocaleString()} /=
                  </div>
                </div>

                {/* Corporate Signature Blocks */}
                <div className="grid grid-cols-2 gap-8 pt-10 border-t border-slate-200">
                  <div className="space-y-5">
                    <div className="h-10 border-b border-dashed border-slate-300"></div>
                    <div>
                      <p className="text-[11px] font-black text-slate-900">PREPARED & AUTHORIZED BY</p>
                      <p className="text-[9px] text-slate-400">Finance & Accounts • AL WAFA STAR</p>
                    </div>
                  </div>

                  <div className="space-y-5 text-right">
                    <div className="h-10 border-b border-dashed border-slate-300"></div>
                    <div className="text-right">
                      <p className="text-[11px] font-black text-slate-900">RECEIVER EMPLOYEE SIGNATURE</p>
                      <p className="text-[9px] text-slate-400">I acknowledge acceptance of the above amount</p>
                    </div>
                  </div>
                </div>

                {/* Footer credit branding */}
                <div className="text-center text-[8.5px] text-slate-400 font-mono uppercase tracking-widest pt-4">
                  AWS PEST CONTROL • SYSTEM AUTOMATED WORKBOOK V2
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ======================= MODAL: ADD NEW STAFF MEMBER ======================= */}
      {isAddingStaff && (
        <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h4 className="text-sm font-black flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-500" />
                <span>{t("Add New Staff Member", "নতুন স্টাফ সদস্য যোগ")}</span>
              </h4>
              <button
                onClick={() => setIsAddingStaff(false)}
                className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddStaffSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-500">{t("Employee Full Name:", "কর্মকারীর পুরো নাম:")}</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sajid Mahmud"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-500">{t("Designation / Role:", "পদবি:")}</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Thermal Fogger Specialist"
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-500">{t("Base Payment Type:", "ক্যাটাগরি:")}</label>
                <select
                  value={newStaffSalType}
                  onChange={(e) => setNewStaffSalType(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white cursor-pointer"
                >
                  <option value="Daily">{t("Daily Rate (Wage per day worked)", "প্রতি কর্মদিবসের মজুরি")}</option>
                  <option value="Monthly">{t("Monthly Fixed Salary", "মাসিক নির্দিষ্ট বেতন")}</option>
                  <option value="Hourly">{t("Hourly Rate (Hours worked)", "প্রতি ঘণ্টার মজুরি")}</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">{t("Standard Rate (AED):", "বেসিক রেট (AED):")}</label>
                  <input
                    type="number"
                    value={newStaffBaseRate}
                    onChange={(e) => setNewStaffBaseRate(Number(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-500">{t("OT Hour Rate (AED):", "ওটি প্রতি ঘণ্টা (AED):")}</label>
                  <input
                    type="number"
                    value={newStaffOtRate}
                    onChange={(e) => setNewStaffOtRate(Number(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-400">{t("Default Monthly Allowances (AED):", "ভাতা (বাসস্থান ও যাতায়াত):")}</label>
                <input
                  type="number"
                  value={newStaffAllowances}
                  onChange={(e) => setNewStaffAllowances(Number(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 mt-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                {t("Register Staff", "কর্মী যুক্ত করুন")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
