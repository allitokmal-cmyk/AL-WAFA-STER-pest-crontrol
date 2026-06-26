import { useState, useEffect, Dispatch, SetStateAction, useRef, ChangeEvent, KeyboardEvent } from "react";
import { 
  Users, 
  Plus, 
  Trash2, 
  MapPin, 
  Phone, 
  Mail, 
  Shield, 
  Building, 
  User, 
  Image as ImageIcon,
  Check,
  Search,
  BookOpen,
  Upload,
  Camera,
  Star,
  Sparkles
} from "lucide-react";
import { LocationRegistryItem, SupervisorRegistryItem } from "../types";

interface SupervisorsRegistryProps {
  language: "en" | "ar" | "bn";
  locations: LocationRegistryItem[];
  supervisors: SupervisorRegistryItem[];
  setSupervisors: Dispatch<SetStateAction<SupervisorRegistryItem[]>>;
}

const PRESET_EMOJIS = ["🧑‍⚕️", "👷", "👨‍💼", "👩‍💼", "🕵️", "👨‍✈️", "👮", "👩‍⚕️", "👨‍💻", "👩‍💻", "🦸‍♂️", "💼", "🛡️"];

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150", 
  "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=150", 
  "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150", 
  "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=150", 
  "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=150", 
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
];

export default function SupervisorsRegistry({
  language,
  locations,
  supervisors,
  setSupervisors
}: SupervisorsRegistryProps) {
  const [selectedEmirate, setSelectedEmirate] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingAvatarId, setEditingAvatarId] = useState<string | null>(null);
  const [customImageUrl, setCustomImageUrl] = useState("");
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const EMIRATE_TABS = ["ALL", "Dubai", "Ajman", "Sharjah", "Umm Al Quwain"];

  // Handle cell text adjustments
  const handleUpdateField = (id: string, field: keyof SupervisorRegistryItem, value: string) => {
    setSupervisors(prev => prev.map(sup => {
      if (sup.id === id) {
        return { ...sup, [field]: value };
      }
      return sup;
    }));
  };

  // Gallery local file upload handler to Base64
  const handleLocalImageUpload = (id: string, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert(language === "bn" ? "দয়া করে ৩ এমবি-র চেয়ে ছোট ছবি সিলেক্ট করুন।" : "Please choose an image size under 3 MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSupervisors(prev => prev.map(s => {
          if (s.id === id) {
            return { ...s, avatarUrl: reader.result as string, avatarEmoji: undefined };
          }
          return s;
        }));
        setSaveStatus(language === "bn" ? "প্রোফাইল ছবি গ্যালারি থেকে লোড করা হয়েছে! 🖼️" : "Profile picture loaded from gallery! 🖼️");
        setTimeout(() => setSaveStatus(null), 2500);
        setEditingAvatarId(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Add a new handwritten-style supervisor card
  const handleAddNewSupervisor = (emirate: string) => {
    const targetState = emirate === "ALL" ? "Dubai" : emirate;
    const code = targetState.substring(0, 3).toUpperCase();
    const newId = `SUP-${code}-${Math.floor(100 + Math.random() * 900)}`;

    // Pick first matching center of this emirate to prefill
    const matchingLoc = locations.find(l => (l.emirate || "").toLowerCase() === (targetState || "").toLowerCase());
    const initialCenter = matchingLoc ? matchingLoc.name : "Al Kuwait Hospital";

    const newSup: SupervisorRegistryItem = {
      id: newId,
      name: language === "bn" ? "নতুন কর্মকর্তা" : "New Officer",
      role: "EHS Officer",
      phone: "+971 50 ",
      email: "",
      facilityName: initialCenter,
      emirate: targetState,
      avatarEmoji: "🧑‍⚕️"
    };

    setSupervisors(prev => [...prev, newSup]);
    setSaveStatus(language === "bn" ? "নতুন সুপারভাইজার ডায়েরি সফলভাবে যুক্ত হয়েছে!" : "Registered new supervisor directory card!");
    setTimeout(() => setSaveStatus(null), 2500);
  };

  // Delete a supervisor profile card
  const handleDeleteSupervisor = (id: string) => {
    setSupervisors(prev => prev.filter(s => s.id !== id));
    setSaveStatus(language === "bn" ? "সুপারভাইজার সফলভাবে মুছে ফেলা হয়েছে!" : "Supervisor profile deleted!");
    if (deletingId === id) {
      setDeletingId(null);
    }
    setTimeout(() => setSaveStatus(null), 2500);
  };

  // Toggle/Select preset avatar emoji
  const handleSelectEmoji = (id: string, emoji: string) => {
    setSupervisors(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, avatarEmoji: emoji, avatarUrl: undefined };
      }
      return s;
    }));
    setEditingAvatarId(null);
  };

  // Set Custom photo via URL
  const handleSetCustomAvatarUrl = (id: string) => {
    if (customImageUrl.trim()) {
      setSupervisors(prev => prev.map(s => {
        if (s.id === id) {
          return { ...s, avatarUrl: customImageUrl.trim(), avatarEmoji: undefined };
        }
        return s;
      }));
      setCustomImageUrl("");
      setEditingAvatarId(null);
      setSaveStatus(language === "bn" ? "ছবি ইউআরএল সফলভাবে আপডেট হয়েছে!" : "Photo URL updated successfully!");
      setTimeout(() => setSaveStatus(null), 2500);
    }
  };

  // Filter EHS supervisors based on state-tab and search input
  const filteredSupervisors = supervisors.filter(sup => {
    // Emirate matching
    const matchesEmirate = selectedEmirate === "ALL" || (sup.emirate || "").toLowerCase() === (selectedEmirate || "").toLowerCase();
    
    // Search query matching
    const q = searchQuery.toLowerCase();
    const nameMatch = (sup.name || "").toLowerCase().includes(q);
    const roleMatch = (sup.role || "").toLowerCase().includes(q);
    const idMatch = (sup.id || "").toLowerCase().includes(q);
    const phoneMatch = (sup.phone || "").toLowerCase().includes(q);
    const emailMatch = (sup.email || "").toLowerCase().includes(q);
    const facilityMatch = (sup.facilityName || "").toLowerCase().includes(q);

    return matchesEmirate && (nameMatch || roleMatch || idMatch || phoneMatch || emailMatch || facilityMatch);
  });

  return (
    <div id="supervisors-registry-view" className="space-y-6 font-sans text-slate-100 pb-16">
      
      {/* Top Professional Header Panel */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-2 border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1 text-[10px] bg-amber-50/15 text-amber-500 font-mono font-black uppercase rounded-full px-3 py-1 tracking-wider border border-amber-500/30">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              {language === "bn" ? "EHS সুপারভাইজার কন্ট্রোল প্যানেল" : "EHS Supervisor Command Center"}
            </span>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Users className="text-amber-500 w-6 h-6" />
              <span>
                {language === "bn" ? "ফিল্ড অফিসার ও সুপারভাইজার ডিরেক্টরি" : "Field Duty Supervisors Ledger"}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-2xl">
              {language === "bn" 
                ? "এখানে প্রতিটি রাজ্য (দুবাই, আজমান, শারজাহ ইত্যাদি) অনুযায়ী অফিসারদের দেখতে পারবেন। নতুন অফিসার এড করতে পারবেন, মোবাইল ও ইমেইল (ঐচ্ছিক) এডিটর সহ যেকোনো ফিল্ড এডিট করতে পারবেন, এবং মোবাইল গ্যালারি/ক্যামেরা থেকে সরাসরি ছবি আপলোড করতে পারবেন।"
                : "Handcrafted supervisor listings grouped by Emirate states. Fully customizable cards supporting instant inline data changes, optional emails, and real image uploads directly from your gallery."}
            </p>
          </div>

          <button
            onClick={() => handleAddNewSupervisor(selectedEmirate)}
            className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl transition-all cursor-pointer shadow-lg shadow-amber-500/10 flex items-center gap-2 shrink-0 self-stretch md:self-auto justify-center"
          >
            <Plus className="w-5 h-5 stroke-[3px]" />
            <span>{language === "bn" ? "নতুন সুপারভাইজার যোগ করুন 👤" : "Register Supervisor 👤"}</span>
          </button>
        </div>
      </div>

      {/* Save Notification alert toast */}
      {saveStatus && (
        <div className="p-3 bg-amber-500/15 border border-amber-500/40 text-amber-400 rounded-2xl flex items-center gap-2 font-bold animate-pulse text-[11.5px] shadow-sm">
          <Sparkles className="w-4.5 h-4.5 text-amber-500 animate-spin" />
          <span>{saveStatus}</span>
        </div>
      )}

      {/* State Switcher Slots and Interactive Filter */}
      <div className="flex flex-col xl:flex-row gap-4 items-center justify-between">
        
        {/* Custom Tab selectors for Dubai, Ajman, Sharjah, Umm Al Quwain */}
        <div className="flex flex-wrap gap-2.5 w-full xl:w-auto">
          {EMIRATE_TABS.map((em) => {
            const count = supervisors.filter(s => em === "ALL" || (s.emirate || "").toLowerCase() === (em || "").toLowerCase()).length;
            const isActive = (selectedEmirate || "").toLowerCase() === (em || "").toLowerCase();
            return (
              <button
                key={em}
                onClick={() => setSelectedEmirate(em)}
                className={`px-4 py-2.5 rounded-xl text-xs font-black tracking-wide transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 scale-102"
                    : "bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-slate-950" : "bg-amber-500 animate-pulse"}`} />
                <span>
                  {em === "ALL" 
                    ? (language === "bn" ? "সব রাজ্য" : "All Regions")
                    : em === "Dubai" 
                      ? (language === "bn" ? "দুবাই" : "Dubai")
                      : em === "Ajman"
                        ? (language === "bn" ? "আজমান" : "Ajman")
                        : em === "Sharjah"
                          ? (language === "bn" ? "শারজাহ" : "Sharjah")
                          : (language === "bn" ? "উম্ম আল কুয়াইন" : em)
                  }
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isActive ? "bg-slate-950/20 text-slate-950" : "bg-slate-950 text-slate-300 font-mono"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Live Search Input Bar */}
        <div className="relative w-full xl:w-80 shrink-0">
          <input
            type="text"
            placeholder={language === "bn" ? "নাম, আইডি বা মেডিকেল অনুযায়ী খুঁজুন..." : "Search by name, ID or station..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 text-slate-100 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:ring-2 focus:ring-amber-500 outline-none placeholder-slate-500 font-semibold"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
        </div>
      </div>

      {/* Compact High-End Professional Cards Grid */}
      {filteredSupervisors.length === 0 ? (
        <div className="bg-slate-900/40 border-2 border-dashed border-slate-800 rounded-3xl p-16 text-center text-slate-500">
          <BookOpen className="w-10 h-10 text-slate-700 mx-auto mb-3" />
          <p className="text-xs font-black">
            {language === "bn" ? "কোন নথি বা কর্মকর্তা পাওয়া যায়নি।" : "No supervisor records match the selection."}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {language === "bn" ? "নতুন কোনো কর্মকর্তা বা সুপারভাইজার যুক্ত করতে উপরের প্লাস বাটনে ক্লিক করুন।" : "Click the button in the header to add a new supervisor."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSupervisors.map((sup, idx) => (
            <SupervisorCard
              key={sup.id || `sup-idx-${idx}`}
              sup={sup}
              idx={idx}
              language={language}
              locations={locations}
              editingAvatarId={editingAvatarId}
              setEditingAvatarId={setEditingAvatarId}
              deletingId={deletingId}
              setDeletingId={setDeletingId}
              handleDeleteSupervisor={handleDeleteSupervisor}
              handleLocalImageUpload={handleLocalImageUpload}
              setSupervisors={setSupervisors}
              setSaveStatus={setSaveStatus}
              handleUpdateField={handleUpdateField}
            />
          ))}
        </div>
      )}

    </div>
  );
}

interface SupervisorCardProps {
  key?: string | number;
  sup: SupervisorRegistryItem;
  idx: number;
  language: "en" | "ar" | "bn";
  locations: LocationRegistryItem[];
  editingAvatarId: string | null;
  setEditingAvatarId: Dispatch<SetStateAction<string | null>>;
  deletingId: string | null;
  setDeletingId: Dispatch<SetStateAction<string | null>>;
  handleDeleteSupervisor: (id: string) => void;
  handleLocalImageUpload: (id: string, e: ChangeEvent<HTMLInputElement>) => void;
  setSupervisors: Dispatch<SetStateAction<SupervisorRegistryItem[]>>;
  setSaveStatus: Dispatch<SetStateAction<string | null>>;
  handleUpdateField: (id: string, field: keyof SupervisorRegistryItem, value: string) => void;
}

function SupervisorCard({
  sup,
  idx,
  language,
  locations,
  editingAvatarId,
  setEditingAvatarId,
  deletingId,
  setDeletingId,
  handleDeleteSupervisor,
  handleLocalImageUpload,
  setSupervisors,
  setSaveStatus,
  handleUpdateField
}: SupervisorCardProps) {
  const [name, setName] = useState(sup.name || "");
  const [id, setId] = useState(sup.id || "");
  const [phone, setPhone] = useState(sup.phone || "");
  const [email, setEmail] = useState(sup.email || "");
  const [customImageUrl, setCustomImageUrl] = useState("");

  useEffect(() => {
    setName(sup.name || "");
  }, [sup.name]);

  useEffect(() => {
    setId(sup.id || "");
  }, [sup.id]);

  useEffect(() => {
    setPhone(sup.phone || "");
  }, [sup.phone]);

  useEffect(() => {
    setEmail(sup.email || "");
  }, [sup.email]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  };

  const handleSelectEmoji = (targetId: string, emoji: string) => {
    setSupervisors(prev => prev.map(s => {
      if (s.id === targetId) {
        return { ...s, avatarEmoji: emoji, avatarUrl: undefined };
      }
      return s;
    }));
    setEditingAvatarId(null);
  };

  const handleSetCustomAvatarUrl = (targetId: string) => {
    if (customImageUrl.trim()) {
      setSupervisors(prev => prev.map(s => {
        if (s.id === targetId) {
          return { ...s, avatarUrl: customImageUrl.trim(), avatarEmoji: undefined };
        }
        return s;
      }));
      setCustomImageUrl("");
      setEditingAvatarId(null);
      setSaveStatus(language === "bn" ? "ছবি ইউআরএল সফলভাবে আপডেট হয়েছে!" : "Photo URL updated successfully!");
      setTimeout(() => setSaveStatus(null), 2500);
    }
  };

  const isAvatarPickerOpen = editingAvatarId === sup.id;
  const supEmiratedLower = (sup.emirate || "").toLowerCase();
  const ribbonBg = supEmiratedLower === "dubai" 
    ? "bg-blue-600 text-white" 
    : supEmiratedLower === "ajman"
      ? "bg-emerald-600 text-white"
      : supEmiratedLower === "sharjah"
        ? "bg-purple-600 text-white"
        : "bg-amber-600 text-slate-950";
  const cardAccent = supEmiratedLower === "dubai"
    ? "border-blue-500/20 hover:border-blue-500"
    : supEmiratedLower === "ajman"
      ? "border-emerald-500/20 hover:border-emerald-500"
      : supEmiratedLower === "sharjah"
        ? "border-purple-500/20 hover:border-purple-500"
        : "border-amber-500/20 hover:border-amber-500";

  return (
    <div 
      className={`bg-white text-slate-900 border-2 ${cardAccent} rounded-2xl p-4 shadow-md hover:shadow-xl transition-all duration-200 flex flex-col space-y-3 relative group animate-fadeIn w-full ${isAvatarPickerOpen ? 'z-50 ring-4 ring-amber-500 shadow-2xl scale-[1.03]' : 'z-10'}`}
    >
      {/* Header Section: Ribbon badge (eg: DUBAI) & Delete Button */}
      <div className="flex items-center justify-between pb-1.5 border-b border-dashed border-slate-200 select-none">
        {/* Emirate Region Badging */}
        <span className={`text-[9px] tracking-wider font-mono uppercase ${ribbonBg} font-black px-2.5 py-0.5 rounded shadow-xs`}>
          {sup.emirate}
        </span>
        
        {/* Delete controls */}
        {deletingId === sup.id ? (
          <div className="flex items-center gap-1 bg-rose-600 text-white rounded px-2 py-0.5 transition-all text-[8.5px] font-black animate-pulse shadow-xs shrink-0 z-35">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDeleteSupervisor(sup.id);
              }}
              className="hover:text-amber-200 flex items-center gap-0.5 cursor-pointer font-black"
              title="Click to confirm delete"
            >
              <Trash2 className="w-2.5 h-2.5" />
              <span>{language === "bn" ? "মুছুন" : "Confirm"}</span>
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDeletingId(null);
              }}
              className="hover:text-amber-100 font-black ml-1 text-[8.5px] cursor-pointer"
              title="Cancel"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDeletingId(sup.id);
            }}
            className="p-1 rounded-full text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer"
            title="Remove this supervisor card"
          >
            <Trash2 className="w-3.5 h-3.5 stroke-[2px]" />
          </button>
        )}
      </div>

      {/* Full-Width Dedicated Area for Hospital/Facility Select Box */}
      <div className="flex items-center gap-2 bg-white border-2 border-slate-200 hover:border-slate-350 hover:bg-slate-50/50 px-3 py-2 rounded-xl text-xs transition-colors w-full shadow-2xs">
        <Building className="w-4 h-4 text-sky-600 shrink-0" />
        <select
          value={sup.facilityName}
          onChange={(e) => handleUpdateField(sup.id, "facilityName", e.target.value)}
          className="bg-transparent text-slate-900 font-black text-[11.5px] outline-none cursor-pointer w-full text-ellipsis overflow-hidden"
        >
          <option value="" className="text-slate-900">-- {language === "bn" ? "হাসপাতাল নির্বাচন করুন" : "Select Hospital"} --</option>
          {locations
            .filter(l => (l.emirate || "").toLowerCase() === (sup.emirate || "").toLowerCase())
            .map(l => (
              <option key={l.id} value={l.name} className="text-slate-900 font-bold">{l.name}</option>
            ))
          }
        </select>
      </div>

      {/* Primary Card Body: Avatar on Left and Stacked details on Right */}
      <div className="flex items-start gap-3.5 relative">
        
        {/* Photo container / click to change */}
        <div className="relative shrink-0 mt-0.5">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setEditingAvatarId(isAvatarPickerOpen ? null : sup.id);
            }}
            className="w-12 h-12 bg-slate-100 hover:bg-amber-50 border-2 border-slate-300 rounded-full flex items-center justify-center font-bold text-xl select-none hover:scale-105 transition-all shadow-md cursor-pointer overflow-hidden relative group/avatar z-20"
            title="Click to Choose Avatar photo"
          >
            {sup.avatarUrl ? (
              <img 
                src={sup.avatarUrl} 
                alt="Supervisor avatar" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover" 
              />
            ) : (
              <span className="text-2xl">{sup.avatarEmoji || "🧑‍⚕️"}</span>
            )}
            
            {/* Overlay camera icon indicator on hover */}
            <div className="absolute inset-0 bg-slate-950/70 text-white rounded-full flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
              <Camera className="w-4 h-4 text-white" />
            </div>
          </button>
        </div>

        {/* Details Stack Column - Highly dynamic inputs & Ultra solid contrasting labels */}
        <div className="flex-1 min-w-0 space-y-2 pb-1">
          {/* Compact Name Input */}
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => {
              if (name !== sup.name) handleUpdateField(sup.id, "name", name);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Supervisor Name"
            className="w-full bg-white border-2 border-slate-200 text-xs font-black text-slate-950 px-2.5 py-1.5 rounded-lg outline-none hover:border-slate-350 focus:border-amber-500 transition-all placeholder:text-slate-400"
          />

          {/* New Side-by-Side row containing ID & Phone together to make the card much LESS high & MORE horizontal */}
          <div className="grid grid-cols-2 gap-1.5">
            {/* ID Field */}
            <div className="flex items-center gap-1.5 bg-white border-2 border-slate-200 px-1.5 py-1 rounded-lg text-[9px] max-w-full focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-sky-100 transition-all shadow-xs">
              <Shield className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="text-[9px] font-black text-slate-900 uppercase shrink-0">ID:</span>
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                onBlur={() => {
                  if (id !== sup.id) handleUpdateField(sup.id, "id", id);
                }}
                onKeyDown={handleKeyDown}
                placeholder="ID"
                className="bg-transparent font-black text-slate-900 text-[10.5px] font-mono outline-none w-full placeholder:text-slate-400 focus:outline-none focus:ring-0"
              />
            </div>

            {/* Phone Field */}
            <div className="flex items-center gap-1.5 bg-white border-2 border-slate-200 px-1.5 py-1 rounded-lg text-[9px] max-w-full focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-100 transition-all shadow-xs">
              <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="text-[9px] font-black text-slate-900 uppercase shrink-0">{language === "bn" ? "ফোন:" : "PH:"}</span>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onBlur={() => {
                  if (phone !== sup.phone) handleUpdateField(sup.id, "phone", phone);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Phone"
                className="bg-transparent font-black text-slate-900 text-[10.5px] font-mono outline-none w-full placeholder:text-slate-400 focus:outline-none focus:ring-0"
              />
            </div>
          </div>

          {/* Optional Email directly below ID & Phone Row */}
          <div className="flex items-center gap-1.5 bg-white border-2 border-slate-200 px-2 py-1.5 rounded-lg text-[9px] max-w-full focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-50 transition-all shadow-xs">
            <Mail className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest shrink-0">EMAIL:</span>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => {
                if (email !== sup.email) handleUpdateField(sup.id, "email", email);
              }}
              onKeyDown={handleKeyDown}
              placeholder={language === "bn" ? "[ইমেইল ঐচ্ছিক]" : "Enter Email (Optional)"}
              className="bg-transparent font-black text-slate-900 text-[10.5px] outline-none w-full text-ellipsis overflow-hidden placeholder:text-slate-400 focus:outline-none focus:ring-0"
            />
          </div>
        </div>

        {/* GALLERY UPLOAD & PHOTO SELECTOR POPUP DIALOG - Centered and floated above beautifully */}
        {isAvatarPickerOpen && (
          <div className="absolute left-1 right-1 top-14 bg-white border-2 border-slate-950 p-3.5 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.5)] z-[100] space-y-4 select-none animate-fadeIn text-slate-900 border-t-8 border-t-amber-500">
            
            {/* Close button inside popover */}
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="block text-[9.5px] font-black uppercase tracking-wider text-amber-600 flex items-center gap-1">
                <Plus className="w-3 h-3 shrink-0" />
                <span>{language === "bn" ? "প্রোফাইল ফটো এডিটর" : "PROFILES EDITOR"}</span>
              </span>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setEditingAvatarId(null);
                }}
                className="text-[9px] bg-slate-100 hover:bg-rose-500 hover:text-white text-slate-900 px-2.5 py-1 rounded-lg font-black cursor-pointer transition-colors"
              >
                ✕ Close
              </button>
            </div>

            {/* 1. GALLERY PHOTO UPLOADER OPTION */}
            <div className="space-y-1.5 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200">
              <span className="block text-[8.5px] font-black text-amber-950 flex items-center gap-1">
                <Upload className="w-3 h-3 text-amber-700" />
                <span>{language === "bn" ? "১. গ্যালারি / ক্যামেরা থেকে নিজের ছবি দিন" : "1. Load Image from Device / Gallery"}</span>
              </span>
              
              <label className="flex items-center justify-center gap-2 py-2 px-3 bg-slate-950 hover:bg-slate-800 text-white font-black text-[9.5px] rounded-lg cursor-pointer transition shadow-xs">
                <Upload className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === "bn" ? "গ্যালারি খুলুন 📁" : "Browse Photos 📁"}</span>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handleLocalImageUpload(sup.id, e)}
                  className="hidden"
                />
              </label>
            </div>

            {/* 2. CHOOSE PRESET PROFESSIONAL PHOTO OR PORTRAITS */}
            <div className="space-y-1.5 bg-blue-50/70 p-2.5 rounded-xl border border-blue-200">
              <span className="block text-[8.5px] font-black text-blue-950 flex items-center gap-1">
                <ImageIcon className="w-3 h-3 text-blue-700" />
                <span>{language === "bn" ? "২. সিস্টেমের প্রফেশনাল ছবি ব্যবহার করুন" : "2. Select Professional Portrait"}</span>
              </span>
              <div className="grid grid-cols-6 gap-1.5 pt-0.5">
                {PRESET_AVATARS.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSupervisors(prev => prev.map(s => {
                        if (s.id === sup.id) {
                          return { ...s, avatarUrl: url, avatarEmoji: undefined };
                        }
                        return s;
                      }));
                      setSaveStatus(language === "bn" ? "অফিসার ছবি সফলভাবে আপডেট হয়েছে!" : "Officer photo updated successfully!");
                      setTimeout(() => setSaveStatus(null), 2500);
                      setEditingAvatarId(null);
                    }}
                    className="w-8 h-8 rounded-full border-2 border-slate-350 hover:border-amber-400 overflow-hidden shrink-0 transition-all hover:scale-115 cursor-pointer shadow-xs object-cover"
                    title={`Portrait ${idx + 1}`}
                  >
                    <img src={url} alt={`Preset Portrait ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Emoji Selector Option */}
            <div className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="block text-[8.5px] font-black text-slate-700 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-600" />
                <span>{language === "bn" ? "৩. ইমোজি কার্টুন বেছে নিন" : "3. Choose Fast Emoji Cartoon"}</span>
              </span>
              <div className="grid grid-cols-6 gap-1 pt-0.5 animate-fadeIn">
                {PRESET_EMOJIS.map((emo) => (
                  <button
                    key={emo}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSelectEmoji(sup.id, emo);
                    }}
                    className="w-7.5 h-7.5 hover:bg-slate-200 hover:scale-115 rounded text-sm flex items-center justify-center transition cursor-pointer border border-transparent hover:border-slate-300"
                  >
                    {emo}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Image URL override input */}
            <div className="space-y-1.5 pt-1.5 border-t border-slate-200">
              <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest">
                {language === "bn" ? "৪. কোনো ছবির ওয়েব লিংক (URL) দিন:" : "4. Or Paste Custom Photo URL:"}
              </span>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="https://example.com/officer.jpg"
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  className="flex-1 text-[8.5px] p-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-950 font-bold outline-none focus:border-amber-500 focus:bg-white"
                />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSetCustomAvatarUrl(sup.id);
                  }}
                  className="px-3 bg-slate-950 text-white rounded-lg text-[9px] font-black cursor-pointer hover:bg-slate-800 transition-colors"
                >
                  Set
                </button>
              </div>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
