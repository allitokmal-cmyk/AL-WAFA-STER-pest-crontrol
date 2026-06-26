import React, { useState, useEffect } from "react";
import { 
  Building2, 
  Plus, 
  Trash2, 
  Calendar, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Layers, 
  Search, 
  Briefcase, 
  Sparkles,
  Info,
  CalendarDays,
  User,
  CheckCircle,
  AlertTriangle,
  Edit,
  X,
  Eye,
  EyeOff,
  Settings2,
  ListTodo,
  Check,
  ChevronDown
} from "lucide-react";
import { AppLanguage } from "../types";
import { getStoreValue, saveStoreValue } from "../localDatabase";

export interface HospitalProject {
  id: string;
  name: string;
  location: string;
  phone: string;
  isLargeSite: boolean;
}

export interface GroupTask {
  id: string;
  projectId: string;
  sectionServiced: string;
  notes: string;
  status: "pending" | "in_progress" | "completed";
}

export interface DutyGroup {
  id: string;
  name: string;
  dateStr: string; // YYYY-MM-DD
  assignedTeam: string;
  notes: string;
  tasks: GroupTask[];
}

interface ProjectSchedulerProps {
  language: AppLanguage;
  isDark: boolean;
  defaultViewTab?: string;
}

export default function ProjectScheduler({ language, isDark }: ProjectSchedulerProps) {
  // Navigation tabs: 'diary' (New Diary sketch layout), 'calendar' (Traditional calendar), or 'projects' (List of hospitals)
  const [activeTab, setActiveTab] = useState<'diary' | 'calendar' | 'projects'>('diary');

  // Calendar states (Default June 2026 for simulation/preview accuracy)
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 5, 1)); 
  const [selectedDateStr, setSelectedDateStr] = useState<string>("2026-06-13");

  // Core registries
  const [projectsList, setProjectsList] = useState<HospitalProject[]>([]);
  const [groupsList, setGroupsList] = useState<DutyGroup[]>([]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddProjectFormOpen, setIsAddProjectFormOpen] = useState(false);

  // Form states for creating custom project
  const [newClientName, setNewClientName] = useState("");
  const [newClientLoc, setNewClientLoc] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientIsLarge, setNewClientIsLarge] = useState<boolean>(false);

  // Form states for creating a new Route Group
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupTeam, setNewGroupTeam] = useState("");
  const [newGroupNotes, setNewGroupNotes] = useState("");
  const [newGroupDateStr, setNewGroupDateStr] = useState("2026-06-13");

  // Expanded details toggles map to hide/show advanced rows per group
  const [expandedDetailsMap, setExpandedDetailsMap] = useState<Record<string, boolean>>({});

  // Active adding dropdown map (tracking which groups have their "+ Add" select field expanded)
  const [addingToGroupMap, setAddingToGroupMap] = useState<Record<string, boolean>>({});

  // Toast notifications
  const [toast, setToast] = useState<string | null>(null);

  // Active popover identifier for individual clinic's special note details
  const [activePopoverTaskId, setActivePopoverTaskId] = useState<string | null>(null);

  // Custom swap dropdown picker and custom add dropdown tracking states to prevent native select crop bugs
  const [activeSwapTaskId, setActiveSwapTaskId] = useState<string | null>(null);
  const [swapSearchQuery, setSwapSearchQuery] = useState("");
  const [activeAddDropdownGroupId, setActiveAddDropdownGroupId] = useState<string | null>(null);
  const [addSearchQuery, setAddSearchQuery] = useState("");
  const [addCustomLocation, setAddCustomLocation] = useState("");

  // Custom persistent confirmation dialog
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    message: string;
    onCallback: () => void;
  } | null>(null);

  // Load from LocalStorage and Server on mount
  useEffect(() => {
    const savedProjects = localStorage.getItem("ALW_MONTHLY_PROJECTS_DB");
    const savedGroups = localStorage.getItem("ALW_MONTHLY_GROUPS_LIST_v2");

    let currentProjects: HospitalProject[] = [];

    if (savedProjects) {
      try {
        currentProjects = JSON.parse(savedProjects);
        setProjectsList(currentProjects);
      } catch (err) {}
    } else {
      const seeded = generateDefaultHospitals();
      setProjectsList(seeded);
      currentProjects = seeded;
      localStorage.setItem("ALW_MONTHLY_PROJECTS_DB", JSON.stringify(seeded));
    }

    if (savedGroups) {
      try {
        setGroupsList(JSON.parse(savedGroups));
      } catch (err) {}
    } else {
      const initialGroups = generateDefaultGroups(currentProjects);
      setGroupsList(initialGroups);
      localStorage.setItem("ALW_MONTHLY_GROUPS_LIST_v2", JSON.stringify(initialGroups));
    }

    // Remote sync
    getStoreValue<HospitalProject[]>("monthly_projects_db", []).then((projectsVal) => {
      if (projectsVal && projectsVal.length > 0) {
        setProjectsList(projectsVal);
        localStorage.setItem("ALW_MONTHLY_PROJECTS_DB", JSON.stringify(projectsVal));
        currentProjects = projectsVal;
      }

      getStoreValue<DutyGroup[]>("monthly_groups_list", []).then((groupsVal) => {
        if (groupsVal && groupsVal.length > 0) {
          setGroupsList(groupsVal);
          localStorage.setItem("ALW_MONTHLY_GROUPS_LIST_v2", JSON.stringify(groupsVal));
        }
      }).catch((err) => console.log("Firestore groups fetch failed", err));
    }).catch((err) => console.log("Firestore sync failed:", err));
  }, []);

  // Save utilities
  const saveProjects = (list: HospitalProject[]) => {
    setProjectsList(list);
    localStorage.setItem("ALW_MONTHLY_PROJECTS_DB", JSON.stringify(list));
    saveStoreValue("monthly_projects_db", list).catch((err) => console.log("Sync projects error", err));
  };

  const saveGroups = (list: DutyGroup[]) => {
    setGroupsList(list);
    localStorage.setItem("ALW_MONTHLY_GROUPS_LIST_v2", JSON.stringify(list));
    saveStoreValue("monthly_groups_list", list).catch((err) => console.log("Sync groups error", err));
  };

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Seeding initial directory of 85 healthcare centers
  const handleSeedDemographics = () => {
    const freshSeeded = generateDefaultHospitals();
    saveProjects(freshSeeded);
    triggerToast("Loaded 85 healthcare institutions successfully!");
  };

  // Reset/Clear everything back to default seeded settings
  const handleResetToDefaults = () => {
    setConfirmConfig({
      title: "Reset Database Settings?",
      message: "Are you sure you want to restore the initial 85 hospitals and default groups? Your custom-made entries and modifications will be overwritten.",
      onCallback: () => {
        const freshSeeded = generateDefaultHospitals();
        const freshGroups = generateDefaultGroups(freshSeeded);
        saveProjects(freshSeeded);
        saveGroups(freshGroups);
        triggerToast("System reset back to factory seeded template!");
      }
    });
  };

  // Creating a new general hospital profile
  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;

    const fresh: HospitalProject = {
      id: "p_custom_" + Date.now() + Math.floor(Math.random() * 1000),
      name: newClientName.trim(),
      location: newClientLoc.trim() || "United Arab Emirates",
      phone: newClientPhone.trim() || "N/A",
      isLargeSite: newClientIsLarge
    };

    const nextList = [fresh, ...projectsList];
    saveProjects(nextList);
    setNewClientName("");
    setNewClientLoc("");
    setNewClientPhone("");
    setNewClientIsLarge(false);
    setIsAddProjectFormOpen(false);
    triggerToast(`Successfully registered "${fresh.name}" in the directory!`);
  };

  // Deleting hospital profile
  const handleDeleteProject = (projId: string) => {
    setConfirmConfig({
      title: "Delete Hospital Registration?",
      message: "Are you sure you want to delete this hospital location? This will completely remove it from the directory and revert any corresponding scheduled tasks.",
      onCallback: () => {
        const nextList = projectsList.filter(p => p.id !== projId);
        saveProjects(nextList);

        // Filter out group tasks corresponding to this deleted clinic
        const updatedGroups = groupsList.map(g => ({
          ...g,
          tasks: g.tasks.filter(t => t.projectId !== projId)
        }));
        saveGroups(updatedGroups);
        triggerToast("Hospital registration and assignments deleted.");
      }
    });
  };

  // Creating a new empty Route Group (Group 1, Group 2...) on the specified date
  const handleCreateRouteGroup = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Sort existing groups to determine sequential counting: "Group 1", "Group 2", etc.
    const groupSeq = groupsList.filter(g => g.name.toLowerCase().startsWith("group")).length + 1;
    const groupNameStr = newGroupName.trim() || `Group ${groupSeq}`;
    
    const freshGroup: DutyGroup = {
      id: "group_" + Date.now() + Math.floor(Math.random() * 100),
      name: groupNameStr,
      dateStr: newGroupDateStr,
      assignedTeam: newGroupTeam.trim() || "Primary Sanitation Crew",
      notes: newGroupNotes.trim() || "Routine scheduled visit",
      tasks: []
    };

    const updated = [...groupsList, freshGroup];
    saveGroups(updated);

    // Reset fields
    setNewGroupName("");
    setNewGroupTeam("");
    setNewGroupNotes("");
    setIsCreateGroupOpen(false);
    triggerToast(`Group "${groupNameStr}" created under date ${newGroupDateStr}!`);
  };

  // Deleting an entire route group
  const handleDeleteGroup = (groupId: string) => {
    const updated = groupsList.filter(g => g.id !== groupId);
    saveGroups(updated);
    triggerToast("Group deleted successfully.");
  };

  // Changing scheduled date of an entire Route Group
  const handleRescheduleGroupDate = (groupId: string, newDate: string) => {
    if (!newDate) return;
    const updated = groupsList.map(g => {
      if (g.id === groupId) {
        return { ...g, dateStr: newDate };
      }
      return g;
    });
    saveGroups(updated);
    triggerToast(`Shifted group date schedule to ${newDate}!`);
  };

  // Add hospital project to a specific group's tasklist (Increase hospital count)
  const handleAddHospitalToGroup = (groupId: string, projectId: string) => {
    if (!projectId) return;
    
    const group = groupsList.find(g => g.id === groupId);
    if (!group) return;

    // Avoid duplicates
    if (group.tasks.some(t => t.projectId === projectId)) {
      triggerToast("This hospital/clinic is already allocated inside this group!");
      return;
    }

    const newTask: GroupTask = {
      id: "gt_" + Date.now() + Math.floor(Math.random() * 100),
      projectId,
      sectionServiced: "All Facility Areas",
      notes: "Pest monitoring & gel treatments",
      status: "pending"
    };

    const updated = groupsList.map(g => {
      if (g.id === groupId) {
        return { ...g, tasks: [...g.tasks, newTask] };
      }
      return g;
    });

    saveGroups(updated);
    
    // Close adds drop-down
    setAddingToGroupMap(prev => ({ ...prev, [groupId]: false }));
    
    const projName = projectsList.find(p => p.id === projectId)?.name || "Clinic";
    triggerToast(`Added "${projName}" to ${group.name}!`);
  };

  // Create a new customized hospital on-the-fly and automatically add to route sequence group
  const handleCreateAndAddCustomClinic = (groupId: string) => {
    if (!addSearchQuery.trim()) {
      triggerToast("Please provide a valid clinic name!");
      return;
    }
    const cleanName = addSearchQuery.trim();
    const cleanLoc = addCustomLocation.trim() || "UAE Medical Center";

    const newProjId = "proj_custom_" + Date.now();
    const newProjObj: HospitalProject = {
      id: newProjId,
      name: cleanName,
      location: cleanLoc,
      phone: "N/A",
      isLargeSite: false
    };

    // Save to master projects list
    const updatedProjects = [...projectsList, newProjObj];
    saveProjects(updatedProjects);

    // Allocate to selected group
    const group = groupsList.find(g => g.id === groupId);
    if (!group) return;

    const newTask: GroupTask = {
      id: "gt_" + Date.now() + Math.floor(Math.random() * 100),
      projectId: newProjId,
      sectionServiced: "All Facility Areas",
      notes: "Pest monitoring & gel treatments",
      status: "pending"
    };

    const updatedGroups = groupsList.map(g => {
      if (g.id === groupId) {
        return { ...g, tasks: [...g.tasks, newTask] };
      }
      return g;
    });

    saveGroups(updatedGroups);

    // Close adds dropdown & reset typing buffer inputs
    setAddingToGroupMap(prev => ({ ...prev, [groupId]: false }));
    setAddSearchQuery("");
    setAddCustomLocation("");
    setActiveAddDropdownGroupId(null);

    triggerToast(`Added customized "${cleanName}" to ${group.name}!`);
  };

  // Remove hospital from a specific group (Decrease hospital count / Subtract)
  const handleRemoveHospitalFromGroup = (groupId: string, taskId: string) => {
    const updated = groupsList.map(g => {
      if (g.id === groupId) {
        return { ...g, tasks: g.tasks.filter(t => t.id !== taskId) };
      }
      return g;
    });
    saveGroups(updated);
    triggerToast("Deleted clinic from group.");
  };

  // Toggle status inside dynamic group tasks
  const handleToggleTaskStatus = (groupId: string, taskId: string, currentStatus: "pending" | "in_progress" | "completed") => {
    const orderMap: Record<string, "pending" | "in_progress" | "completed"> = {
      pending: "in_progress",
      in_progress: "completed",
      completed: "pending"
    };
    const nextSt = orderMap[currentStatus];

    const updated = groupsList.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          tasks: g.tasks.map(t => t.id === taskId ? { ...t, status: nextSt } : t)
        };
      }
      return g;
    });

    saveGroups(updated);
    triggerToast(`Status changed to ${nextSt.toUpperCase().replace("_", " ")}`);
  };

  // Edit sub-task properties inline (Section served or Notes)
  const handleUpdateTaskDetails = (groupId: string, taskId: string, section: string, notesStr: string) => {
    const updated = groupsList.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          tasks: g.tasks.map(t => t.id === taskId ? { ...t, sectionServiced: section, notes: notesStr } : t)
        };
      }
      return g;
    });
    saveGroups(updated);
  };

  // Toggle expanded hide/show configurations state per group card
  const toggleExpandedDetails = (groupId: string) => {
    setExpandedDetailsMap(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  // Toggle dynamic picker modal view state per group card
  const toggleAddingDropdownMode = (groupId: string) => {
    const isNowActive = activeAddDropdownGroupId !== groupId;
    setActiveAddDropdownGroupId(isNowActive ? groupId : null);
    setAddingToGroupMap(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
    // Reset typing buffer inputs
    setAddSearchQuery("");
    setAddCustomLocation("");
  };

  // Automatic distribution of all 85+ clinics into daily routing groups (skipping Sundays)
  const handleAutoDistributeAll = () => {
    if (projectsList.length === 0) {
      triggerToast("Clinic Directory is empty. Click 'Seed 85 Clinics' first!");
      return;
    }
    
    setConfirmConfig({
      title: "Run Auto-Group Dispatcher?",
      message: "Are you sure you want to run the Auto Group Dispatcher? This will clear dry-run mockups, group all 85+ hospitals into sequential batches of 3-4 per day, and automatically map calendar dates (except Sundays).",
      onCallback: () => {
        const workingDays: string[] = [];
        const yearVal = currentDate.getFullYear();
        const monthVal = currentDate.getMonth();

        const daysInMonthCount = new Date(yearVal, monthVal + 1, 0).getDate();

        // Map workdays
        for (let day = 1; day <= daysInMonthCount; day++) {
          const formattedDate = `${yearVal}-${String(monthVal + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayOfWeek = new Date(yearVal, monthVal, day).getDay();
          
          if (dayOfWeek !== 0) { // Skip Sundays
            workingDays.push(formattedDate);
          }
        }

        if (workingDays.length === 0) return;

        // Distribute projects among working days
        const generatedGroups: DutyGroup[] = [];
        let projectIdx = 0;

        // Shuffle projects list for organic assignment distributions
        const shuffledProjects = [...projectsList].sort(() => 0.5 - Math.random());

        const teams = [
          "Team Falcon (Ali & Jasim)", 
          "Team Tiger (Sameer & Yusuf)", 
          "Eagle Crew (Mohammad & Imran)", 
          "Squad Panther (Firoz & Karim)"
        ];

        workingDays.forEach((dateStr, dayIndex) => {
          // Pick 3 to 4 projects for each day
          const dailyBatchCount = (dayIndex % 3 === 0) ? 4 : 3;
          const dayProjects: HospitalProject[] = [];

          for (let i = 0; i < dailyBatchCount; i++) {
            if (projectIdx < shuffledProjects.length) {
              dayProjects.push(shuffledProjects[projectIdx]);
              projectIdx++;
            }
          }

          if (dayProjects.length > 0) {
            const teamAssigned = teams[dayIndex % teams.length];
            const groupNumber = generatedGroups.length + 1;
            
            generatedGroups.push({
              id: `grouped_auto_${dateStr}_${dayIndex}`,
              name: `Group ${groupNumber}`,
              dateStr: dateStr,
              assignedTeam: teamAssigned,
              notes: "Scheduled automatically by AI auto-distributor.",
              tasks: dayProjects.map((p, idx) => ({
                id: `gt_auto_${dateStr}_${p.id}_${idx}`,
                projectId: p.id,
                sectionServiced: p.isLargeSite ? "Fumigation & ICU Sections" : "Standard Treatment Areas",
                notes: "Routine quarterly checks",
                status: "pending"
              }))
            });
          }
        });

        // If we have remaining leftover medical clinics, append them to the first working day groups
        let leftIndex = 0;
        while (projectIdx < shuffledProjects.length) {
          const targetGroup = generatedGroups[leftIndex % generatedGroups.length];
          const leftoverProj = shuffledProjects[projectIdx];
          
          targetGroup.tasks.push({
            id: `gt_auto_leftover_${targetGroup.dateStr}_${leftoverProj.id}`,
            projectId: leftoverProj.id,
            sectionServiced: "Main Entrance Backyards",
            notes: "Leftover rotation checkup",
            status: "pending"
          });

          projectIdx++;
          leftIndex++;
        }

        saveGroups(generatedGroups);
        triggerToast("Auto-grouped 85 hospitals into daily batches (skipped Sundays)!");
      }
    });
  };

  // Calendar variables
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const navigateMonth = (direction: 'prev' | 'next') => {
    const multiplier = direction === 'prev' ? -1 : 1;
    setCurrentDate(new Date(year, month + multiplier, 1));
  };

  // Filter project database by search query
  const filteredProjects = projectsList.filter(p => {
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.location.toLowerCase().includes(q);
  });

  // Calendar days grid generator
  const calendarDays = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dateObj = new Date(year, month, day);
    const isSunday = dateObj.getDay() === 0;
    const dayGroups = groupsList.filter(g => g.dateStr === dayStr);

    calendarDays.push({
      dayNum: day,
      dateStr: dayStr,
      isSunday,
      groups: dayGroups
    });
  }

  const isSelectedDateSunday = new Date(selectedDateStr).getDay() === 0;
  const groupsOnSelectedDate = groupsList.filter(g => g.dateStr === selectedDateStr);

  return (
    <div className={`p-4 md:p-6 rounded-3xl border shadow-xl flex flex-col space-y-6 transition-all text-left ${
      isDark ? "bg-[#1E293B] border-slate-705 border-slate-700 text-white" : "bg-white border-slate-200 text-slate-900"
    }`}>
      
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 p-4 rounded-2xl shadow-2xl animate-fade-in backdrop-blur-md bg-slate-900/95 border border-emerald-500 text-emerald-400 font-bold text-xs">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Main Header Banner */}
      <div className={`p-5 rounded-2xl border flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
        isDark ? "bg-slate-900/40 border-slate-850" : "bg-emerald-500/5 border-emerald-100"
      }`}>
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-[#10B981] rounded-2xl text-white shadow-md shadow-emerald-500/10 shrink-0">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-black tracking-tight font-sans text-slate-900 dark:text-white flex items-center gap-2">
              <span>Dynamic Dispatch & Groups Operations Manager</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded">English Only</span>
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
              Organize medical clinics into operational route groups. Scale clinic list sizes, subtract/add clinics, and dispatch schedules.
            </p>
          </div>
        </div>

        {/* Global Action & Seed Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleAutoDistributeAll}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] uppercase tracking-wider rounded-xl transition-all shadow flex items-center gap-1.5 cursor-pointer"
            title="Auto-distribute all hospitals"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
            <span>Auto-Group dispatcher</span>
          </button>

          <button
            type="button"
            onClick={handleResetToDefaults}
            className={`px-3 py-2 border rounded-xl text-[11px] uppercase tracking-wider font-bold transition-all ${
              isDark ? "border-slate-700 hover:bg-slate-800 text-slate-300" : "border-slate-300 hover:bg-slate-100 text-slate-700 bg-white shadow-sm"
            }`}
          >
            Reset DB
          </button>
        </div>
      </div>

      {/* Main Mode Switcher Tabs */}
      <div className="flex p-1 bg-slate-100 dark:bg-slate-950/40 rounded-2xl gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('diary')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'diary'
              ? "bg-[#10B981] text-white shadow-md"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <ListTodo className="w-4 h-4" />
          <span>📖 Diary Notepad Grid</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('calendar')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'calendar'
              ? "bg-[#10B981] text-white shadow-md"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>📅 Date & Monthly Calendar Plan</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('projects')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'projects'
              ? "bg-[#10B981] text-white shadow-md"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>🏢 Healthcare clinic Register (85+ Sites)</span>
        </button>
      </div>

      {/* TAB 1: NEW DIARY NOTEPAD GRID (MATCHES HAND-DRAWN SPECIFICATION EXACTLY) */}
      {activeTab === 'diary' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-2 border-b border-slate-200/50 dark:border-slate-800/50">
            <div>
              <h3 className="font-extrabold text-[13.5px] md:text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <span>📖 Operational Groups Ledger</span>
                <span className="font-sans normal-case font-bold text-slate-400 text-xs">(Notebook Layout View)</span>
              </h3>
              <p className="text-[11px] text-slate-400 font-semibold pt-0.5">
                Each card below represents an isolated group batch. Change dates, subtract or add clinics dynamically inside each workspace.
              </p>
            </div>

            {/* Quick group creation trigger */}
            <button
              type="button"
              onClick={() => setIsCreateGroupOpen(true)}
              className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-black uppercase tracking-wider rounded-xl flex items-center gap-1.5 cursor-pointer shadow"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Create New Group Card</span>
            </button>
          </div>

          {/* Inline Create Group Modal Form */}
          {isCreateGroupOpen && (
            <div className={`p-5 rounded-2xl border space-y-4 animate-fade-in ${
              isDark ? "bg-slate-900 border-slate-700" : "bg-emerald-50 bg-[#F9FBF9] border-emerald-200"
            }`}>
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/10 dark:border-slate-800">
                <span className="text-xs font-black uppercase text-indigo-400 tracking-wider flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-indigo-500" /> Let's Add a New Clean Group
                </span>
                <button type="button" onClick={() => setIsCreateGroupOpen(false)}>
                  <X className="w-4 h-4 text-slate-400 hover:text-slate-900 dark:hover:text-white" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[9px] block font-extrabold text-slate-400 uppercase">Group name / label</label>
                  <input
                    type="text"
                    placeholder="e.g. Group 4"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className={`w-full text-xs p-2.5 rounded-xl border font-bold ${
                      isDark ? "bg-slate-955 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] block font-extrabold text-slate-400 uppercase">Operation target Date</label>
                  <input
                    type="date"
                    required
                    value={newGroupDateStr}
                    onChange={(e) => setNewGroupDateStr(e.target.value)}
                    className={`w-full text-xs p-2.5 rounded-xl border font-mono font-bold ${
                      isDark ? "bg-slate-955 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] block font-extrabold text-slate-400 uppercase">Assigned Service Crew</label>
                  <input
                    type="text"
                    placeholder="e.g. Squad Falcon"
                    value={newGroupTeam}
                    onChange={(e) => setNewGroupTeam(e.target.value)}
                    className={`w-full text-xs p-2.5 rounded-xl border font-bold ${
                      isDark ? "bg-slate-955 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] block font-extrabold text-slate-400 uppercase">Pest directive notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Routine gel baiting check"
                    value={newGroupNotes}
                    onChange={(e) => setNewGroupNotes(e.target.value)}
                    className={`w-full text-xs p-2.5 rounded-xl border font-bold ${
                      isDark ? "bg-slate-955 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
                    }`}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateGroupOpen(false)}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-lg ${
                    isDark ? "bg-slate-800 hover:bg-slate-700" : "bg-white border border-slate-300 text-slate-700"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateRouteGroup}
                  className="px-4 py-1.5 bg-[#10B981] hover:bg-emerald-600 text-white text-xs font-black uppercase rounded-lg"
                >
                  Create Card
                </button>
              </div>
            </div>
          )}

          {/* GROUPS RESPONSIVE GRID - 1 column on mobile, 2 on tablet, 3 on desktop, 4 on wide desktop */}
          {groupsList.length === 0 ? (
            <div className={`p-12 text-center rounded-3xl border border-dashed text-slate-400 space-y-3 ${
              isDark ? "border-slate-800 bg-slate-900/10" : "border-slate-300 bg-slate-50"
            }`}>
              <Layers className="w-12 h-12 opacity-15 mx-auto animate-pulse" />
              <h4 className="text-xs font-extrabold uppercase tracking-wide">Ledger Empty</h4>
              <p className="text-xs italic leading-relaxed">
                No dispatch groups exist. Use the green "Auto-group dispatcher" button in the header to dispatch the 85+ hospitals instantly, or click "Create New Group Card" to write one yourself!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {groupsList.map((group) => {
                const isExpanded = expandedDetailsMap[group.id] || false;
                const isAddingActive = addingToGroupMap[group.id] || false;

                // Let's filter out hospitals already allocated inside this specific card
                const nonAllocatedProjects = projectsList.filter(
                  p => !group.tasks.some(t => t.projectId === p.id)
                );

                return (
                  <div
                    key={group.id}
                    className={`rounded-2xl border shadow-md transition-all flex flex-col justify-between relative group duration-200 hover:shadow-lg ${
                      isDark 
                        ? "bg-[#131B2D]/95 border-slate-800 hover:border-slate-700 hover:scale-[1.01]" 
                        : "bg-[#FFFDF6] border-[#E8DDCD] hover:border-[#D4C3A9] hover:scale-[1.01] text-slate-900 border-l-[6px] border-b-[3px] border-l-stone-400"
                    }`}
                  >
                    
                    {/* Notebook Clip Header Accent */}
                    <div className="absolute top-0 inset-x-0 h-1.5 bg-slate-350 bg-slate-300 dark:bg-slate-800 pointer-events-none opacity-40" />

                    <div className="p-4 space-y-3.5 flex-1 select-none">
                      
                      {/* Card Title Header with Sequence Name & Delete icon */}
                      <div className="flex items-center justify-between gap-1 pb-2 border-b border-dashed border-slate-300/65 dark:border-slate-800">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Layers className="w-4 h-4 text-indigo-400 shrink-0" />
                          <h4 className="text-[13.5px] font-black tracking-tight font-sans text-stone-850 dark:text-sky-300 uppercase truncate">
                            {group.name}
                          </h4>
                        </div>

                        {/* Right tools side: contains date option and delete button */}
                        <div className="flex items-center gap-2 shrink-0">
                          {/* Interactive Inline Date Changer */}
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-[#10B981] dark:text-sky-400 shrink-0" />
                            <input
                              type="date"
                              value={group.dateStr}
                              onChange={(e) => handleRescheduleGroupDate(group.id, e.target.value)}
                              className={`p-1 px-2 border-2 font-mono text-[11px] font-black rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10B981] shadow-md cursor-pointer transition-all ${
                                isDark 
                                  ? "bg-slate-950 border-slate-700 text-teal-400 hover:border-slate-500" 
                                  : "bg-stone-50 border-stone-400 text-stone-900 hover:bg-stone-100 hover:border-stone-600 focus:bg-white"
                              }`}
                              title="Modify operating schedule date for this entire group"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteGroup(group.id)}
                            className="p-1 px-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all border-none bg-transparent cursor-pointer"
                            title="Delete entire group"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Numbered Clinics List Display */}
                      <div className="space-y-2">
                        {group.tasks.length === 0 ? (
                          <div className="py-8 text-center border border-dashed border-stone-200 dark:border-slate-800 rounded-xl bg-stone-100/35 dark:bg-slate-950/20 text-[11.5px] italic text-slate-400">
                            No clinics assigned. Make it packed by selecting hospitals using the "+" button below!
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-[250px] overflow-y-auto pr-0.5">
                            {group.tasks.map((task, index) => {
                              const pInfo = projectsList.find(p => p.id === task.projectId);
                              const isLarge = pInfo?.isLargeSite || false;

                              return (
                                <div key={task.id} className="flex items-center gap-1.5 relative group">
                                  {/* Rounded Task card block */}
                                  <div
                                    className={`p-2 rounded-xl border flex-1 min-w-0 transition-all text-xs font-semibold relative ${
                                      task.status === "completed"
                                        ? (isDark ? "bg-emerald-500/5 border-emerald-950 text-emerald-400" : "bg-emerald-50/75 border-emerald-150 text-emerald-900")
                                        : task.status === "in_progress"
                                        ? (isDark ? "bg-amber-500/5 border-amber-950 text-amber-500" : "bg-amber-50/70 border-amber-150 text-amber-900")
                                        : (isDark ? "bg-slate-950/40 border-slate-800 text-slate-100" : "bg-white border-stone-200 text-stone-850")
                                    }`}
                                  >
                                    {/* List Row: Index + Hospital Name + Checkmark edit clinic select dropdown */}
                                    <div className="flex items-start justify-between gap-1.5">
                                      <div className="flex-1 flex items-start gap-1 min-w-0">
                                        <span className="font-mono text-[11px] font-extrabold text-slate-400 shrink-0 mt-[2px]">
                                          {index + 1}.
                                        </span>
                                        <div 
                                          onClick={() => setActiveSwapTaskId(task.id)}
                                          className="space-y-0.5 min-w-0 flex-1 cursor-pointer hover:underline border-b border-dashed border-slate-200 dark:border-slate-800 pb-0.5 hover:border-slate-400 dark:hover:border-slate-600 transition-all"
                                          title="Click to swap/change clinic"
                                        >
                                          <p className="font-extrabold leading-tight text-[11px] break-words">
                                            {pInfo?.name || "Deleted register Clinic"}
                                          </p>
                                          <p className="text-[9.5px] text-slate-400 leading-none truncate mt-0.5">
                                            {pInfo?.location}
                                          </p>
                                        </div>
                                      </div>

                                      {/* Static display of Check icon and Notepad message indicator */}
                                      <div className="relative shrink-0 mt-1 mr-1 pr-0.5">
                                        <div className="w-5 h-5 flex items-center justify-center relative">
                                          <Check className={`w-3.5 h-3.5 stroke-[2.5] ${
                                            task.status === "completed"
                                              ? "text-[#10B981]"
                                              : task.status === "in_progress"
                                              ? "text-amber-550 dark:text-amber-500"
                                              : "text-slate-400 dark:text-slate-500"
                                          }`} />

                                          {/* Tiny notepad badge of active custom messages */}
                                          {task.notes && task.notes.trim().length > 0 && (
                                            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-blue-500 dark:bg-sky-400 rounded-full animate-pulse" />
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Collapsible Config State for Detail configuration (fallback sync) */}
                                    {isExpanded && (
                                      <div className="mt-1.5 pt-1.5 border-t border-dashed border-slate-200/40 dark:border-slate-800 space-y-2 animate-fade-in text-[10px] text-left">
                                        {/* Service Section */}
                                        <div>
                                          <span className="text-[8.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Building Section / Floor</span>
                                          <input
                                            type="text"
                                            placeholder="e.g. ICU, Basement 1"
                                            value={task.sectionServiced}
                                            onChange={(e) => handleUpdateTaskDetails(group.id, task.id, e.target.value, task.notes)}
                                            className={`w-full p-1 border-none text-[10px] rounded focus:ring-1 focus:ring-[#10B981] ${
                                              isDark ? "bg-slate-950 text-white" : "bg-stone-150 text-stone-900"
                                            }`}
                                          />
                                        </div>

                                        {/* Pest Notes */}
                                        <div>
                                          <span className="text-[8.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Special Directives</span>
                                          <input
                                            type="text"
                                            placeholder="e.g. Bait checkups"
                                            value={task.notes}
                                            onChange={(e) => handleUpdateTaskDetails(group.id, task.id, task.sectionServiced, e.target.value)}
                                            className={`w-full p-1 border-none text-[10px] rounded focus:ring-1 focus:ring-[#10B981] ${
                                              isDark ? "bg-slate-950 text-white" : "bg-stone-150 text-stone-900"
                                            }`}
                                          />
                                        </div>
                                      </div>
                                    )}

                                  </div>

                                  {/* Subtraction Delete Button (X) - Relocated to the outside of the card row with custom styles */}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveHospitalFromGroup(group.id, task.id)}
                                    className="p-1 hover:bg-rose-500/15 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 rounded-lg transition-all shrink-0 cursor-pointer self-start mt-2.5"
                                    title="Subtract from group"
                                  >
                                    <X className="w-4 h-4 stroke-[2]" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Header Group Meta (Team / Notes) - Show/Hide config when toggled */}
                      {isExpanded && (
                        <div className={`p-2.5 rounded-xl text-[10px] space-y-1.5 border border-dashed text-slate-500 leading-relaxed font-bold ${
                          isDark ? "bg-slate-950/40 border-slate-800" : "bg-stone-50 border-stone-200"
                        }`}>
                          <div className="flex items-center gap-1 text-[10.5px] text-[#10B981]">
                            <User className="w-3.5 h-3.5 shrink-0" />
                            <span>Team: {group.assignedTeam || "N/A"}</span>
                          </div>
                          <div className="text-[10px] italic text-slate-400 leading-normal pl-4">
                            Directive: {group.notes || "No special instructions written details"}
                          </div>
                        </div>
                      )}

                    </div>

                    {/* Bottom Utility Bar - Houses addition menu dropdown and settings expander */}
                    <div className="p-3 bg-stone-100/60 dark:bg-slate-950/30 border-t border-stone-200/50 dark:border-slate-850 flex flex-col space-y-2">
                      
                      {/* Active picker field expansion */}
                      {isAddingActive && (
                        <div className="relative animate-fade-in space-y-1 pt-1.5 text-left">
                          <label className="text-[9px] font-black uppercase text-slate-400 block pb-0.5">Allocate hospital clinic:</label>
                          
                          {/* Custom Styled Select Trigger Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveAddDropdownGroupId(activeAddDropdownGroupId === group.id ? null : group.id);
                            }}
                            className={`w-full text-[10.5px] p-2 rounded-xl border text-left flex items-center justify-between font-extrabold focus:outline-none focus:ring-1 focus:ring-[#10B981] transition-all cursor-pointer ${
                              isDark 
                                ? "bg-slate-950 border-slate-800 text-slate-350 hover:text-white" 
                                : "bg-white border-stone-300 text-stone-800 hover:text-slate-900"
                            }`}
                          >
                            <span className="truncate">-- Choose Clinic from List --</span>
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          </button>

                          {/* Custom Scrollable Addition Dropdown List */}
                          {activeAddDropdownGroupId === group.id && (() => {
                            const filteredNonAllocated = nonAllocatedProjects.filter(p => {
                              const s = addSearchQuery.toLowerCase();
                              return p.name.toLowerCase().includes(s) || p.location.toLowerCase().includes(s);
                            });

                            return (
                              <div className={`absolute left-0 right-0 top-full mt-1 z-[210] max-h-80 overflow-y-auto rounded-2xl border p-2.5 shadow-2xl animate-fade-in ${
                                isDark 
                                  ? "bg-[#1E293B] border-slate-700 text-white shadow-black/90" 
                                  : "bg-white border-stone-250 text-stone-900 shadow-stone-300/60"
                              }`}>
                                {/* Interactive Search Input Area */}
                                <div className="relative mb-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                                  <input
                                    type="text"
                                    placeholder="Type hospital name to search/add..."
                                    value={addSearchQuery}
                                    onChange={(e) => setAddSearchQuery(e.target.value)}
                                    className={`w-full pl-8 pr-3 py-1.5 text-[11px] font-bold rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#10B981] transition-all ${
                                      isDark 
                                        ? "bg-slate-950 border-slate-800 text-white placeholder-slate-500" 
                                        : "bg-stone-50 border-stone-250 text-stone-900 placeholder-stone-400"
                                    }`}
                                  />
                                </div>

                                {/* Custom quick add panel if user typed something */}
                                {addSearchQuery.trim() !== "" && (
                                  <div className="mb-2.5 p-2 rounded-xl bg-[#10B981]/10 border border-[#10B981]/25 space-y-1.5 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center justify-between">
                                      <span className="text-[9px] font-black uppercase text-[#10B981] tracking-wider font-mono">
                                        ➕ Create & Add Custom Clinic
                                      </span>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-[10px] font-extrabold text-slate-700 dark:text-slate-350 truncate">
                                        Name: <span className="text-[#10B981]">{addSearchQuery}</span>
                                      </p>
                                      <input
                                        type="text"
                                        placeholder="Location (e.g. Rolla, Sharjah)"
                                        value={addCustomLocation}
                                        onChange={(e) => setAddCustomLocation(e.target.value)}
                                        className={`w-full px-2 py-1 text-[10px] font-bold rounded-lg border focus:outline-none focus:ring-1 focus:ring-[#10B981] ${
                                          isDark 
                                            ? "bg-slate-900 border-slate-850 text-white placeholder-slate-600" 
                                            : "bg-white border-stone-200 text-stone-900 placeholder-stone-400"
                                        }`}
                                      />
                                    </div>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCreateAndAddCustomClinic(group.id);
                                      }}
                                      className="w-full py-1 bg-[#10B981] hover:bg-emerald-600 text-white text-[10px] font-extrabold rounded-lg transition-all border-none cursor-pointer text-center"
                                    >
                                      Register & Allocate Custom Clinic
                                    </button>
                                  </div>
                                )}

                                {/* Matching scroll list */}
                                <div className="space-y-0.5 max-h-[140px] overflow-y-auto pr-0.5">
                                  {filteredNonAllocated.length === 0 ? (
                                    <p className="text-center text-[10px] py-3 text-slate-400 italic">No remaining matching clinics</p>
                                  ) : (
                                    filteredNonAllocated.map(p => (
                                      <button
                                        key={p.id}
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleAddHospitalToGroup(group.id, p.id);
                                          setActiveAddDropdownGroupId(null);
                                        }}
                                        className={`w-full text-left p-2 rounded-xl text-[10.5px] transition-all flex flex-col font-semibold leading-tight border-none ${
                                          isDark 
                                            ? "hover:bg-slate-800 text-slate-202 text-slate-200 bg-transparent cursor-pointer" 
                                            : "hover:bg-stone-50 text-stone-850 bg-transparent cursor-pointer"
                                        }`}
                                      >
                                        <span className="font-extrabold truncate">{p.name}</span>
                                        <span className="text-[8.5px] text-slate-400 dark:text-slate-500 truncate mt-0.5">{p.location}</span>
                                      </button>
                                    ))
                                  )}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}

                      {/* Toggle commands: Toggle "+ Add" and Toggle Advanced settings */}
                      <div className="flex items-center justify-between gap-1 text-[10.5px]">
                        
                        {/* ⚙️ Toggle settings (হাইড করা চিহ্ন) */}
                        <button
                          type="button"
                          onClick={() => toggleExpandedDetails(group.id)}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-extrabold transition-all hover:bg-slate-500/10 ${
                            isExpanded ? "text-indigo-400" : "text-slate-400"
                          }`}
                        >
                          <Settings2 className="w-3.5 h-3.5" />
                          <span>{isExpanded ? "Hide Settings" : "Configure"}</span>
                        </button>

                        {/* + Add clinic button exactly matching layout sketch representation */}
                        <button
                          type="button"
                          onClick={() => toggleAddingDropdownMode(group.id)}
                          className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all uppercase flex items-center gap-1 cursor-pointer ${
                            isAddingActive
                              ? "bg-rose-500 text-white"
                              : "bg-[#10B981] hover:bg-emerald-600 text-white"
                          }`}
                        >
                          <Plus className="w-3.5 h-3.5 shrink-0" />
                          <span>{isAddingActive ? "Close" : "+ Add Clinic"}</span>
                        </button>

                      </div>

                    </div>

                  </div>
                );
              })}

              {/* Dotted helper placeholder mimicking "Group 3 and Group 4 empty box" in paper diary sketch */}
              <div
                onClick={() => setIsCreateGroupOpen(true)}
                className={`p-6 rounded-2xl border border-dashed flex flex-col items-center justify-center text-center space-y-2.5 cursor-pointer select-none transition-all duration-200 hover:scale-[1.01] ${
                  isDark 
                    ? "border-slate-800 bg-slate-950/10 hover:border-slate-700 text-slate-400 hover:text-white"
                    : "border-stone-300 bg-stone-50/30 hover:border-stone-400 text-stone-500 hover:text-stone-800"
                }`}
              >
                <Plus className="w-9 h-9 opacity-30 animate-pulse text-emerald-500" />
                <div className="space-y-1">
                  <h4 className="text-[12.5px] font-black uppercase tracking-wider">Group empty placeholder</h4>
                  <p className="text-[10px] leading-relaxed max-w-[210px] mx-auto text-slate-400 font-bold">
                    Click here to write and instantiate a new empty group card, just like in your hand-drawn sketch checklist!
                  </p>
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* TAB 2: INTERACTIVE CALENDAR VIEW */}
      {activeTab === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Calendar visual month (7 columns) */}
          <div className="lg:col-span-7 col-span-1 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl bg-white dark:bg-slate-900/30 shadow-sm space-y-4">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-850">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-[#10B981]" />
                <h3 className="text-sm font-extrabold tracking-tight capitalize font-sans text-slate-800 dark:text-slate-100">
                  {monthName} {year}
                </h3>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigateMonth('prev')}
                  className="p-1 px-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500 hover:text-slate-800 dark:text-slate-400"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => navigateMonth('next')}
                  className="p-1 px-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500 hover:text-slate-800 dark:text-slate-400"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Weekday indicator */}
            <div className="grid grid-cols-7 gap-1 text-center font-mono text-[9px] font-black uppercase text-slate-400 py-1 tracking-wider">
              <div className="text-rose-500">Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            {/* Calendar Cells */}
            <div className="grid grid-cols-7 gap-1.5">
              {calendarDays.map((dayItem, index) => {
                if (!dayItem) {
                  return <div key={`empty-${index}`} className="aspect-square bg-transparent rounded-lg" />;
                }

                const isSelected = selectedDateStr === dayItem.dateStr;
                const groupsCount = dayItem.groups.length;

                let containerClass = "aspect-square rounded-xl flex flex-col justify-between p-1.5 md:p-2 border relative cursor-pointer select-none transition-all hover:scale-105 ";
                if (dayItem.isSunday) {
                  containerClass += "bg-rose-500/5 hover:bg-rose-500/10 border-rose-500/10 dark:border-rose-500/5 text-rose-500 ";
                } else if (isSelected) {
                  containerClass += "bg-[#10B981] text-white border-emerald-500 shadow-md scale-105 ring-2 ring-emerald-400 ring-offset-2 ring-offset-[#1E293B] ";
                } else {
                  containerClass += "bg-slate-100/50 hover:bg-slate-100 dark:bg-slate-900/40 dark:hover:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 ";
                }

                return (
                  <div
                    key={dayItem.dateStr}
                    onClick={() => setSelectedDateStr(dayItem.dateStr)}
                    className={containerClass}
                  >
                    <span className="text-[11px] md:text-sm font-black font-mono">
                      {dayItem.dayNum}
                    </span>

                    {dayItem.isSunday ? (
                      <span className="text-[8px] font-black tracking-tighter block text-center uppercase opacity-80">
                        Closed
                      </span>
                    ) : groupsCount > 0 ? (
                      <div className="flex flex-col items-center justify-center gap-0.5 pointer-events-none">
                        <span className={`px-1.5 rounded text-[8.5px] font-extrabold pb-0.5 leading-tight ${
                          isSelected ? "bg-white text-[#10B981]" : "bg-sky-500 text-white"
                        }`}>
                          {groupsCount} Group{groupsCount > 1 ? 's' : ''}
                        </span>
                      </div>
                    ) : (
                      <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto opacity-20" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quick Informational Tip */}
            <div className={`p-3 rounded-xl border text-[11px] font-semibold flex items-start gap-2 ${
              isDark ? "bg-slate-900/60 border-slate-800 text-slate-400" : "bg-slate-50 border-slate-150 text-slate-600"
            }`}>
              <Info className="w-4 h-4 text-[#10B981] shrink-0" />
              <span>
                <strong>Workspace Quicktips:</strong> Click any date above to inspect assigned groups immediately under the right side panel display.
              </span>
            </div>

          </div>

          {/* Side panel displaying selected date groupings configurations (5 columns) */}
          <div className="lg:col-span-5 col-span-1 space-y-4">
            
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 space-y-1 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[8.5px] uppercase font-mono tracking-widest text-[#10B981] font-black block">
                  Focused Calendar Date
                </span>
                <h3 className="text-sm font-black text-slate-850 dark:text-white flex items-center gap-2">
                  <Calendar className="w-4.5 h-4.5 text-sky-400 shrink-0" />
                  <span className="font-mono">{selectedDateStr}</span>
                </h3>
              </div>

              {isSelectedDateSunday ? (
                <span className="px-2 py-1 bg-rose-500/10 text-rose-500 text-[10px] uppercase font-black tracking-wider rounded-lg">
                  Closed
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setNewGroupDateStr(selectedDateStr);
                    setIsCreateGroupOpen(true);
                  }}
                  className="px-3 py-1.5 bg-[#10B981] hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-1 cursor-pointer shadow"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Group</span>
                </button>
              )}
            </div>

            {/* Sunday Alert visualizer */}
            {isSelectedDateSunday ? (
              <div className={`p-6 rounded-2xl border text-center space-y-2.5 ${
                isDark ? "bg-rose-500/5 border-rose-500/10" : "bg-rose-50 border-rose-150"
              }`}>
                <AlertTriangle className="w-10 h-10 mx-auto text-rose-500 opacity-60" />
                <h4 className="text-xs font-black uppercase text-rose-500 tracking-wider">
                  Closed Sunday
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                  This date is marked as the weekly rest day. No sanitations can be registered.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {groupsOnSelectedDate.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/20 text-slate-400">
                    <Briefcase className="w-8 h-8 opacity-20 mx-auto mb-2" />
                    <p className="text-xs italic">No route groups scheduled for this date.</p>
                  </div>
                ) : (
                  groupsOnSelectedDate.map(g => (
                    <div 
                      key={g.id}
                      className={`p-4 rounded-xl border relative space-y-2.5 ${
                        isDark ? "bg-[#131B2D] border-slate-800 hover:border-slate-700" : "bg-white border-slate-200"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-extrabold text-sm text-[#10B981]">{g.name}</h4>
                          <span className="text-[10px] text-slate-400 font-bold">Crew: {g.assignedTeam}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('diary');
                            setExpandedDetailsMap(prev => ({ ...prev, [g.id]: true }));
                          }}
                          className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 dark:bg-slate-800 dark:hover:bg-slate-755 rounded text-[9.5px] font-black uppercase text-slate-500 hover:text-slate-700 dark:text-slate-300"
                        >
                          Show Details in Diary Mode
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[9px] uppercase font-mono text-slate-400 font-extrabold">Clinics inside ({g.tasks.length}):</span>
                        <div className="text-[11px] font-bold text-slate-650 bg-stone-50 dark:bg-slate-950/40 p-2.5 rounded-lg space-y-1">
                          {g.tasks.length === 0 ? (
                            <span className="text-slate-400 italic">No hospitals loaded in list.</span>
                          ) : (
                            g.tasks.map((t, idx) => {
                              const p = projectsList.find(x => x.id === t.projectId);
                              return (
                                <div key={t.id} className="flex items-center justify-between text-slate-700 dark:text-slate-200">
                                  <span>{idx + 1}. {p?.name}</span>
                                  <span className="text-[9px] opacity-70">({t.sectionServiced})</span>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>

                    </div>
                  ))
                )}
              </div>
            )}

          </div>

        </div>
      )}

      {/* TAB 3: REGISTERED CLINIC REGISTER (WHOLE DATABASE VIEW) */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5">
            {/* Search Input bar */}
            <div className="flex items-center gap-2 flex-1 max-w-md relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
              <input
                type="text"
                placeholder="Search clinics or hospitals by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#10B981] ${
                  isDark 
                    ? "bg-slate-900 border-slate-750 text-white placeholder-slate-400" 
                    : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 shadow-sm"
                }`}
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSeedDemographics}
                className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-all shadow cursor-pointer animate-pulse"
              >
                <Sparkles className="w-4 h-4 text-violet-200" />
                <span>Seed 85 Clinics</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAddProjectFormOpen(!isAddProjectFormOpen)}
                className="px-3.5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-all shadow cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Custom Clinic</span>
              </button>
            </div>
          </div>

          {/* New Project Registration Form */}
          {isAddProjectFormOpen && (
            <form onSubmit={handleCreateProject} className={`p-5 rounded-2xl border space-y-4 animate-fade-in ${
              isDark ? "bg-slate-900 border-slate-755 animate-fade-in" : "bg-slate-50 border-slate-200"
            }`}>
              <h3 className="text-xs font-black uppercase tracking-wider text-sky-500">Register New Client Hospital Clinic</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] block font-bold text-slate-400 uppercase tracking-widest">Clinic / Hospital Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cleveland Clinic Sharjah"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    className={`w-full text-xs p-2.5 rounded-xl border ${
                      isDark ? "bg-slate-955 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] block font-bold text-slate-400 uppercase tracking-widest">Address / Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rollah Square, Sharjah"
                    value={newClientLoc}
                    onChange={(e) => setNewClientLoc(e.target.value)}
                    className={`w-full text-xs p-2.5 rounded-xl border ${
                      isDark ? "bg-slate-955 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] block font-bold text-slate-400 uppercase tracking-widest">Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. +971-6-5633333"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    className={`w-full text-xs p-2.5 rounded-xl border ${
                      isDark ? "bg-slate-955 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] block font-bold text-slate-400 uppercase tracking-widest">Requires Rotational Weekly Visits?</label>
                  <div className="flex gap-2 p-1 bg-slate-955 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setNewClientIsLarge(true)}
                      className={`flex-1 py-1.5 text-xs font-extrabold rounded-lg transition-all ${
                        newClientIsLarge ? "bg-[#10B981] text-white animate-pulse" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Yes (Rotational Site)
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewClientIsLarge(false)}
                      className={`flex-1 py-1.5 text-xs font-extrabold rounded-lg transition-all ${
                        !newClientIsLarge ? "bg-slate-750 text-white" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      No (Standard Site)
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1 border-t border-slate-800/10">
                <button
                  type="button"
                  onClick={() => setIsAddProjectFormOpen(false)}
                  className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all ${
                    isDark ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-white border-slate-300"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-650 bg-sky-600 hover:bg-sky-750 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  Save Clinic File
                </button>
              </div>
            </form>
          )}

          {/* Directory Listings Grid (Fits 85+ easily) */}
          {filteredProjects.length === 0 ? (
            <div className={`p-12 text-center rounded-2xl border border-dashed ${isDark ? "border-slate-800 bg-slate-950/15" : "border-slate-205 border-slate-200 bg-slate-50"}`}>
              <Building2 className="w-12 h-12 mx-auto text-slate-500 opacity-20 mb-2 animate-pulse" />
              <p className="text-slate-400 text-xs italic">No clinics match your current search directory queries.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[580px] overflow-y-auto pr-1">
              {filteredProjects.map((proj) => {
                // Determine how many times this specific project is assigned across all route groups
                const occurrences = groupsList.filter(g => g.tasks.some(task => task.projectId === proj.id)).length;

                return (
                  <div
                    key={proj.id}
                    className={`p-3.5 rounded-2xl border transition-all hover:scale-[1.01] relative ${
                      isDark 
                        ? "bg-[#111A2E]/60 border-slate-800 hover:border-slate-700" 
                        : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {proj.isLargeSite ? (
                            <span className="px-2 py-0.5 text-[8px] uppercase font-black tracking-widest bg-emerald-500/10 text-emerald-400 rounded-lg">
                              Rotational
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-[8px] uppercase font-black tracking-widest bg-sky-500/10 text-sky-400 rounded-lg">
                              Standard
                            </span>
                          )}

                          <span className="px-2 py-0.5 text-[8.5px] uppercase font-mono bg-slate-500/10 text-slate-400 rounded-lg font-bold">
                            📅 Assigned in {occurrences} Groups
                          </span>
                        </div>

                        <h4 className="font-extrabold text-[12.5px] md:text-[13px] leading-tight text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-[#10B981] shrink-0" />
                          <span>{proj.name}</span>
                        </h4>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteProject(proj.id)}
                        className="p-1 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                        title="Remove clinic from directory register"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="mt-3.5 space-y-1 text-[11px] text-slate-500 dark:text-slate-400 font-bold border-t border-slate-200/40 dark:border-slate-850 pt-2.5">
                      <p className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{proj.location}</span>
                      </p>
                      <p className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{proj.phone}</span>
                      </p>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}



      {/* GLOBAL MODAL OVERLAY: SWAP CLINIC FOR SLOT */}
      {activeSwapTaskId && (() => {
        let activeTaskGroup: DutyGroup | undefined;
        let activeTask: GroupTask | undefined;

        for (const g of groupsList) {
          const t = g.tasks.find(tk => tk.id === activeSwapTaskId);
          if (t) {
            activeTaskGroup = g;
            activeTask = t;
            break;
          }
        }

        if (!activeTask || !activeTaskGroup) return null;
        const currentClinic = projectsList.find(p => p.id === activeTask!.projectId);

        // Filter projects with swapSearchQuery
        const filteredProjectsForSwap = projectsList.filter(p => {
          const s = swapSearchQuery.toLowerCase();
          return p.name.toLowerCase().includes(s) || p.location.toLowerCase().includes(s);
        });

        return (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs select-none animate-fade-in">
            {/* Backdrop click to close */}
            <div 
              className="absolute inset-0 cursor-default" 
              onClick={() => {
                setActiveSwapTaskId(null);
                setSwapSearchQuery("");
              }} 
            />

            {/* Modal Body */}
            <div className={`relative w-full max-w-sm p-6 rounded-3xl border shadow-2xl space-y-4 transform transition-all duration-200 scale-100 ${
              isDark 
                ? "bg-[#1E293B] border-slate-700 text-white shadow-black/90" 
                : "bg-white border-stone-200 text-stone-900 shadow-stone-400/30"
            }`}>
              
              {/* Close button */}
              <button
                type="button"
                onClick={() => {
                  setActiveSwapTaskId(null);
                  setSwapSearchQuery("");
                }}
                className="absolute top-4 right-4 p-2 rounded-xl transition-all hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer border-none bg-transparent"
              >
                <X className="w-4 h-4 focus:outline-none" />
              </button>

              {/* Header */}
              <div className="space-y-1 pr-6 text-left font-semibold">
                <span className="text-[9.5px] font-black uppercase text-[#10B981] tracking-widest block font-mono">
                  🔄 Swap Clinic Match
                </span>
                <h3 className="text-sm md:text-base font-black font-sans leading-tight tracking-tight text-slate-950 dark:text-white">
                  Swap Allocated Hospital Clinic
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-400 leading-normal">
                  Currently assigned: <span className="font-extrabold text-amber-550 dark:text-amber-400">{currentClinic?.name}</span>
                </p>
              </div>

              {/* Search field */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search 85+ UAE clinics..."
                  value={swapSearchQuery}
                  onChange={(e) => setSwapSearchQuery(e.target.value)}
                  className={`w-full pl-8 pr-4 py-2 text-xs font-bold rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#10B981] transition-all ${
                    isDark 
                      ? "bg-slate-955 border-slate-800 text-white placeholder-slate-500" 
                      : "bg-stone-50 border-stone-250 text-stone-900 placeholder-stone-400"
                  }`}
                />
              </div>

              {/* Scrollable list */}
              <div className="space-y-0.5 max-h-[180px] overflow-y-auto pr-0.5 text-left">
                {filteredProjectsForSwap.length === 0 ? (
                  <div className="p-3 text-[10.5px] font-bold text-center text-slate-400 italic">
                    No clinics match your filter
                  </div>
                ) : (
                  filteredProjectsForSwap.map(p => {
                    const isSelected = p.id === activeTask!.projectId;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          const updated = groupsList.map(g => {
                            if (g.id === activeTaskGroup!.id) {
                              return {
                                ...g,
                                tasks: g.tasks.map(t => t.id === activeTask!.id ? { ...t, projectId: p.id } : t)
                              };
                            }
                            return g;
                          });
                          saveGroups(updated);
                          triggerToast(`Swapped clinic to: ${p.name}`);
                          setActiveSwapTaskId(null);
                          setSwapSearchQuery("");
                        }}
                        className={`w-full text-left p-2 rounded-xl text-[10.5px] transition-all flex flex-col font-semibold leading-tight border-none ${
                          isSelected
                            ? "bg-[#10B981]/15 text-[#10B981]"
                            : isDark 
                              ? "hover:bg-slate-800 text-slate-200 bg-transparent cursor-pointer" 
                              : "hover:bg-stone-50 text-stone-850 bg-transparent cursor-pointer"
                        }`}
                      >
                        <span className="font-extrabold truncate">{p.name}</span>
                        <span className="text-[8.5px] text-slate-400 dark:text-slate-500 truncate mt-0.5">{p.location}</span>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Close Button / Close Footer */}
              <div className="flex justify-end pt-2 border-t border-slate-200/30">
                <button
                  type="button"
                  onClick={() => {
                    setActiveSwapTaskId(null);
                    setSwapSearchQuery("");
                  }}
                  className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isDark ? "bg-slate-800 border-slate-700 text-slate-300 hover:text-white" : "bg-white border-slate-300"
                  }`}
                >
                  Cancel
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* GLOBAL MODAL OVERLAY: CUSTOM CONFIRMATION DIALOG */}
      {confirmConfig && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs select-none animate-fade-in">
          <div 
            className="absolute inset-0 cursor-default" 
            onClick={() => setConfirmConfig(null)} 
          />
          <div className={`relative w-full max-w-sm p-6 rounded-3xl border shadow-2xl space-y-4 transform transition-all duration-200 scale-100 ${
            isDark 
              ? "bg-[#1E293B] border-slate-700 text-white shadow-black/95" 
              : "bg-white border-stone-200 text-stone-900 shadow-stone-400/45"
          }`}>
            <div className="space-y-1.5 text-left font-semibold">
              <span className="text-[9.5px] font-black uppercase text-rose-500 tracking-widest block font-mono">
                ⚠️ Action Required
              </span>
              <h3 className="text-sm md:text-base font-black font-sans leading-tight tracking-tight text-slate-950 dark:text-white">
                {confirmConfig.title}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-300 leading-normal font-bold">
                {confirmConfig.message}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200/40 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setConfirmConfig(null)}
                className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isDark ? "bg-slate-800 border-slate-750 text-slate-300 hover:text-white border-none" : "bg-white border-stone-250 text-stone-700 hover:bg-stone-50"
                }`}
              >
                No, Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmConfig.onCallback();
                  setConfirmConfig(null);
                }}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-extrabold rounded-xl transition-all shadow-md cursor-pointer border-none"
              >
                Yes, Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Seed array of 85 medical clinics in UAE
 */
function generateDefaultHospitals(): HospitalProject[] {
  const list: HospitalProject[] = [
    { id: "p_1", name: "Al Zahra Private Hospital", location: "Near Rolla, Sharjah", phone: "+971-6-5619999", isLargeSite: true },
    { id: "p_2", name: "Dubai General Hospital", location: "Al Baraha, Deira, Dubai", phone: "+971-4-2714444", isLargeSite: true },
    { id: "p_3", name: "Aster Specialized Medical Centre", location: "Al Qusais 2, Dubai", phone: "+971-4-2678888", isLargeSite: false },
    { id: "p_4", name: "Prime Medical Center Shj Block B", location: "Al Nahda, Sharjah", phone: "+971-6-5250011", isLargeSite: false },
    { id: "p_5", name: "Zulekha Hospital Pediatric Center", location: "Nasserya, Sharjah", phone: "+971-6-5069222", isLargeSite: true },
    { id: "p_6", name: "Saif Dental Clinic & Care Clinic", location: "Muhaisnah 4, Industrial Area", phone: "+971-55-9001122", isLargeSite: false },
    { id: "p_7", name: "Burjeel Specialty Hospital", location: "Fayha Community, Sharjah", phone: "+971-6-5011111", isLargeSite: true },
    { id: "p_8", name: "Dr Sunny Medical Centre Rollah", location: "Rolla Street, Sharjah", phone: "+971-6-5625444", isLargeSite: false },
    { id: "p_9", name: "MOH APEX Vaccination Lab Complex", location: "Al Noof 3, Sharjah Center", phone: "+971-6-5381155", isLargeSite: true },
    { id: "p_10", name: "Access Clinical Laboratory Hub", location: "Abu Shagara, Sharjah", phone: "+971-6-5591144", isLargeSite: false },
    { id: "p_11", name: "NMC Royal Hospital Al Zahra", location: "Al Zahra street, Sharjah", phone: "+971-6-5614444", isLargeSite: true },
    { id: "p_12", name: "Aster Day Care Surgical Clinic", location: "Abu Hail, Deira, Dubai", phone: "+971-4-2735500", isLargeSite: false },
    { id: "p_13", name: "Welcare Mediclinic City Hospital", location: "Dubai Healthcare City", phone: "+971-4-4359900", isLargeSite: true },
    { id: "p_14", name: "Universal Medical Center Al Khan", location: "Al Khan Waterfront, Sharjah", phone: "+971-6-5561111", isLargeSite: false },
    { id: "p_15", name: "Thumbay Hospital & Lab Complex", location: "Al Nuaimiah, Ajman", phone: "+971-6-7463333", isLargeSite: true }
  ];

  const uaeAreas = ["Deira Dubai", "Bur Dubai", "Rolla Sharjah", "Al Majaz Shj", "Nasserya Shj", "Al Khan Shj", "Al Qusais Dubai", "Al Nahda Dubai", "Karama Dubai", "Ajman City Center"];
  const brandNames = ["Aster Clinic", "Prime Care Lab", "Kaya Skin Clinic", "Life Pharmacy Medical Suite", "Medcare Diagnostics", "NMC Outpatient Unit", "Cleveland Satellite Clinic", "Mayo Specialist Care", "Thumbay Clinic", "Saudi German Emergency Center"];

  for (let idx = 16; idx <= 85; idx++) {
    const brand = brandNames[idx % brandNames.length];
    const area = uaeAreas[idx % uaeAreas.length];
    const isLarge = idx % 6 === 0; 
    
    list.push({
      id: `p_${idx}`,
      name: `${brand} - Site #${idx}`,
      location: `${area}, United Arab Emirates`,
      phone: `+971-55-${Math.floor(1000000 + Math.random() * 9000000)}`,
      isLargeSite: isLarge
    });
  }

  return list;
}

/**
 * Generate 3 beautiful default groups for June 13 & 15 so card registry has realistic data.
 */
function generateDefaultGroups(projects: HospitalProject[]): DutyGroup[] {
  return [
    {
      id: "g_default_1",
      name: "Group 1",
      dateStr: "2026-06-13",
      assignedTeam: "Team Falcon (Ali & Jasim)",
      notes: "Prioritize ICU sanitation and high-grade safe chemical spraying.",
      tasks: [
        { id: "gt_def_1", projectId: "p_1", sectionServiced: "Ground Floor & Kitchens", notes: "Use non-scented gel baits", status: "completed" },
        { id: "gt_def_2", projectId: "p_8", sectionServiced: "Rolla Dental Suites Complex", notes: "Check rodent bait stations", status: "in_progress" },
        { id: "gt_def_3", projectId: "p_4", sectionServiced: "Pharmacy Office Block C", notes: "Routine spray checks", status: "pending" },
        { id: "gt_def_4", projectId: "p_14", sectionServiced: "Water Tank Surrounding Area", notes: "Mosquito larviculture checks", status: "pending" }
      ]
    },
    {
      id: "g_default_2",
      name: "Group 2",
      dateStr: "2026-06-14",
      assignedTeam: "Technician Imran Hossain",
      notes: "Carry out DHA medical audit compliant check-ups.",
      tasks: [
        { id: "gt_def_5", projectId: "p_2", sectionServiced: "Operation Theaters ICU Wings", notes: "Sanitize ventilation ducts", status: "completed" },
        { id: "gt_def_6", projectId: "p_12", sectionServiced: "Day Care Surgical Ward B", notes: "Inspect cockroach traps", status: "pending" },
        { id: "gt_def_7", projectId: "p_6", sectionServiced: "Outpatient Waiting Lounge", notes: "Mist treatment", status: "pending" }
      ]
    },
    {
      id: "g_default_3",
      name: "Group 3",
      dateStr: "2026-06-15",
      assignedTeam: "Team Tiger (Sameer & Yusuf)",
      notes: "Do not leave chemical aroma behind.",
      tasks: [
        { id: "gt_def_8", projectId: "p_13", sectionServiced: "Pathology Labs Zone 1", notes: "Gel baiting non-chemical", status: "pending" },
        { id: "gt_def_9", projectId: "p_10", sectionServiced: "Vaccination Lab Complex", notes: "Audit check-ins", status: "pending" }
      ]
    }
  ];
}
