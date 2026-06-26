import { useState, Dispatch, SetStateAction } from "react";
import { 
  Plus, 
  Trash2, 
  MapPin, 
  Undo, 
  Search, 
  ExternalLink,
  FileSpreadsheet,
  Sparkles
} from "lucide-react";
import { LocationRegistryItem } from "../types";
import { deleteDocument } from "../localDatabase";

export const INITIAL_LOCATIONS_REGISTRY: LocationRegistryItem[] = [
  // ABU DHABI
  { id: "LOC-AUH-01", name: "GENETIC AND NEONATAL SCREENING DIAGNOSTIC CENTER.", emirate: "Abu Dhabi", mapUrl: "" },

  // AJMAN
  { id: "LOC-AJ-01", name: "AL MADINA HEALTH CENTER -AJMAN", emirate: "Ajman", mapUrl: "" },
  { id: "LOC-AJ-02", name: "AL MANAMA HEALTH CENTER -AJMAN", emirate: "Ajman", mapUrl: "" },
  { id: "LOC-AJ-03", name: "MUZEIRAH HEALTH CENTER -AJMAN", emirate: "Ajman", mapUrl: "" },
  { id: "LOC-AJ-04", name: "AL HAMIDIYA CLINIC-AJMAN", emirate: "Ajman", mapUrl: "" },
  { id: "LOC-AJ-05", name: "PUBLIC HEALTH CENTER-AJMAN", emirate: "Ajman", mapUrl: "" },
  { id: "LOC-AJ-06", name: "DENTAL CLINIC-AJMAN", emirate: "Ajman", mapUrl: "" },
  { id: "LOC-AJ-07", name: "AL MUSHEIRIF HEALTH CENTER -AJMAN", emirate: "Ajman", mapUrl: "" },
  { id: "LOC-AJ-08", name: "MEDICAL STORE -AJMAN", emirate: "Ajman", mapUrl: "" },
  { id: "LOC-AJ-09", name: "MAPLE CLINIC - AL JURF", emirate: "Ajman", mapUrl: "" },
  { id: "LOC-AJ-10", name: "MAPLE CLINIC - AL RAWDAH", emirate: "Ajman", mapUrl: "" },
  { id: "LOC-AJ-11", name: "MAPLE RED PHARMACY - AL RAWDAH", emirate: "Ajman", mapUrl: "" },
  { id: "LOC-AJ-12", name: "MAPLE RED PHARMACY - AL NUAMIA", emirate: "Ajman", mapUrl: "" },
  { id: "LOC-AJ-13", name: "MAPLE RED PHARMACY - G+", emirate: "Ajman", mapUrl: "" },

  // DUBAI
  { id: "LOC-DXB-01", name: "AL KUWAIT HOSPITAL", emirate: "Dubai", mapUrl: "" },
  { id: "LOC-DXB-02", name: "AL AMAL PSYCHIATRIC HOSPITAL", emirate: "Dubai", mapUrl: "" },
  { id: "LOC-DXB-03", name: "DTC", emirate: "Dubai", mapUrl: "" },
  { id: "LOC-DXB-04", name: "EMARAT HEALTH SERVICE(SILICON)", emirate: "Dubai", mapUrl: "" },
  { id: "LOC-DXB-05", name: "ERADA CENTER", emirate: "Dubai", mapUrl: "" },
  { id: "LOC-DXB-06", name: "AL AWIR HEALTH CENTER", emirate: "Dubai", mapUrl: "" },
  { id: "LOC-DXB-07", name: "AL ITTIHAD HEALTH CENTER", emirate: "Dubai", mapUrl: "" },
  { id: "LOC-DXB-08", name: "DUBAI DENTAL SPECIALISED CENTER", emirate: "Dubai", mapUrl: "" },
  { id: "LOC-DXB-09", name: "HOR AL ANZ HEALTH CENTER", emirate: "Dubai", mapUrl: "" },
  { id: "LOC-DXB-10", name: "AL MUHAISNA HEALTH CENTER", emirate: "Dubai", mapUrl: "" },
  { id: "LOC-DXB-11", name: "CENTRAL MEDICAL STORE", emirate: "Dubai", mapUrl: "" },
  { id: "LOC-DXB-12", name: "NATIONAL RADIATION PROTECTION CENTER .", emirate: "Dubai", mapUrl: "" },
  { id: "LOC-DXB-13", name: "PREVENTIVE MEDICINE(AL BARAHA)", emirate: "Dubai", mapUrl: "" },
  { id: "LOC-DXB-14", name: "SMART SALEEM CITY WALK", emirate: "Dubai", mapUrl: "" },
  { id: "LOC-DXB-15", name: "SMART SALEEM KNOWLADGE VILLAGE", emirate: "Dubai", mapUrl: "" },
  { id: "LOC-DXB-16", name: "SMART SALEEM INDEX MALL", emirate: "Dubai", mapUrl: "" },
  { id: "LOC-DXB-17", name: "ENOCK SALEEM MFC", emirate: "Dubai", mapUrl: "" },
  { id: "LOC-DXB-18", name: "EMIRATES DRUG ESTABLISHMENT (LAB)", emirate: "Dubai", mapUrl: "" },
  { id: "LOC-DXB-19", name: "MBRHE", emirate: "Dubai", mapUrl: "" },
  { id: "LOC-DXB-20", name: "BUS WASH", emirate: "Dubai", mapUrl: "" },

  // FUJAIRAH
  { id: "LOC-FJ-01", name: "FUJAIRAH HOSPITAL", emirate: "Fujairah", mapUrl: "" },
  { id: "LOC-FJ-02", name: "FUJAIRAH MEDICAL STORE", emirate: "Fujairah", mapUrl: "" },
  { id: "LOC-FJ-03", name: "FUJAIRAH PUBLIC HEALTH CENTER", emirate: "Fujairah", mapUrl: "" },

  // RAS AL KHAIMAH
  { id: "LOC-RAK-01", name: "ABDULLAH BIN OMRAN HOSPITAL", emirate: "Ras Al Khaimah", mapUrl: "" },
  { id: "LOC-RAK-02", name: "SAQR HOSPITAL", emirate: "Ras Al Khaimah", mapUrl: "" },
  { id: "LOC-RAK-03", name: "SHA'AM HOSPITAL", emirate: "Ras Al Khaimah", mapUrl: "" },
  { id: "LOC-RAK-04", name: "AL MAERID HEALTH CENTER", emirate: "Ras Al Khaimah", mapUrl: "" },
  { id: "LOC-RAK-05", name: "AL JEER HEALTH CENTER", emirate: "Ras Al Khaimah", mapUrl: "" },
  { id: "LOC-RAK-06", name: "ABDULLAH BIN ALI AL HARHAN HEALTH CENTER", emirate: "Ras Al Khaimah", mapUrl: "" },
  { id: "LOC-RAK-07", name: "AL JAZEERA AL HAMRAH HEALTH CENTER", emirate: "Ras Al Khaimah", mapUrl: "" },
  { id: "LOC-RAK-08", name: "RAS AL KHAIMAH HEALTH CENTER", emirate: "Ras Al Khaimah", mapUrl: "" },
  { id: "LOC-RAK-09", name: "AL NAKHEEL HEALTH CENTER", emirate: "Ras Al Khaimah", mapUrl: "" },
  { id: "LOC-RAK-10", name: "EHS MEDICAL STORE - RAK", emirate: "Ras Al Khaimah", mapUrl: "" },
  { id: "LOC-RAK-11", name: "EHS OFFICES - RAK", emirate: "Ras Al Khaimah", mapUrl: "" },
  { id: "LOC-RAK-12", name: "PHYSIOTHERAPY & SPORTS CENTER", emirate: "Ras Al Khaimah", mapUrl: "" },

  // SHARJAH
  { id: "LOC-SH-01", name: "RAK SPECIALIZED DENTAL CENTER", emirate: "Sharjah", mapUrl: "" },
  { id: "LOC-SH-02", name: "KHORFAKKAN HOSPITAL", emirate: "Sharjah", mapUrl: "" },
  { id: "LOC-SH-03", name: "KHORFAKKAN DENTAL CLINIC", emirate: "Sharjah", mapUrl: "" },
  { id: "LOC-SH-04", name: "KALBA PUBLIC HEALTH", emirate: "Sharjah", mapUrl: "" },
  { id: "LOC-SH-05", name: "KALBA DENTAL CENTER", emirate: "Sharjah", mapUrl: "" },
  { id: "LOC-SH-06", name: "DIBBA PUBLIC HEALTH", emirate: "Sharjah", mapUrl: "" },
  { id: "LOC-SH-07", name: "AL NAHWA HEALTH CENTER", emirate: "Sharjah", mapUrl: "" },
  { id: "LOC-SH-08", name: "KUWAIT HOSPITAL- SHARJAH", emirate: "Sharjah", mapUrl: "" },
  { id: "LOC-SH-09", name: "FAMILY HEALTH CENTER - SHARJAH", emirate: "Sharjah", mapUrl: "" },
  { id: "LOC-SH-10", name: "BLOOD TRANSFUSION AND RESEARCH CENTER", emirate: "Sharjah", mapUrl: "" },
  { id: "LOC-SH-11", name: "PUBLIC HEALTH CENTER", emirate: "Sharjah", mapUrl: "" },
  { id: "LOC-SH-12", name: "NATIONAL MALARIA CLINIC", emirate: "Sharjah", mapUrl: "" },
  { id: "LOC-SH-13", name: "EHS OFFICE", emirate: "Sharjah", mapUrl: "" },
  { id: "LOC-SH-14", name: "AL DHAID HEALTH CENTER", emirate: "Sharjah", mapUrl: "" },
  { id: "LOC-SH-15", name: "AL DHAIDPUBLIC HEALTH CENTER", emirate: "Sharjah", mapUrl: "" },
  { id: "LOC-SH-16", name: "AL MALIHA HEALTH CENTER", emirate: "Sharjah", mapUrl: "" },
  { id: "LOC-SH-17", name: "AL THAMEED HEALTH CENTER", emirate: "Sharjah", mapUrl: "" },
  { id: "LOC-SH-18", name: "AL MADAM HEALTH CENTER", emirate: "Sharjah", mapUrl: "" },
  { id: "LOC-SH-19", name: "NAZWA HEALTH CENTER", emirate: "Sharjah", mapUrl: "" },

  // UMM AL QUWAIN
  { id: "LOC-UAQ-01", name: "UMM AL QUWAIN HOSPITAL", emirate: "Umm Al Quwain", mapUrl: "" },
  { id: "LOC-UAQ-02", name: "KHAZAN HEALTH CENTER-UAQ", emirate: "Umm Al Quwain", mapUrl: "" },
  { id: "LOC-UAQ-03", name: "DENTAL CLINIC -UAQ", emirate: "Umm Al Quwain", mapUrl: "" },
  { id: "LOC-UAQ-04", name: "PUBLIC HEALTH CENTER -UAQ", emirate: "Umm Al Quwain", mapUrl: "" },
  { id: "LOC-UAQ-05", name: "SALAMA HEALTH CENTER -UAQ", emirate: "Umm Al Quwain", mapUrl: "" },
  { id: "LOC-UAQ-06", name: "FALAJ AL MUALLA HEALTH CENTER -UAQ", emirate: "Umm Al Quwain", mapUrl: "" },
  { id: "LOC-UAQ-07", name: "RAFA HEALTH CENTER -UAQ", emirate: "Umm Al Quwain", mapUrl: "" }
];

interface LocationsRegistryProps {
  language: "en" | "ar" | "bn";
  locations: LocationRegistryItem[];
  setLocations: Dispatch<SetStateAction<LocationRegistryItem[]>>;
}

export default function LocationsRegistry({ 
  language, 
  locations, 
  setLocations
}: LocationsRegistryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [emirateFilter, setEmirateFilter] = useState("ALL");
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const EMIRATE_LIST = [
    "ALL",
    "Abu Dhabi",
    "Ajman",
    "Sharjah",
    "Dubai",
    "Umm Al Quwain",
    "Ras Al Khaimah",
    "Fujairah"
  ];

  // Quick cell update handler
  const handleCellChange = (id: string, field: "name" | "mapUrl" | "emirate", value: string) => {
    setLocations(prev => prev.map(loc => {
      if (loc.id === id) {
        return { ...loc, [field]: value };
      }
      return loc;
    }));
  };

  // Add new row inside a specific emirate / state
  const handleAddRow = (emirate: string) => {
    const code = emirate.substring(0, 3).toUpperCase();
    const newId = `LOC-${code}-${Math.floor(100 + Math.random() * 900)}`;
    const newRow: LocationRegistryItem = {
      id: newId,
      name: "",
      emirate: emirate === "ALL" ? "Dubai" : emirate,
      mapUrl: ""
    };
    setLocations(prev => [...prev, newRow]);
    
    setSaveStatus(language === "bn" ? "নতুন লাইন যুক্ত হয়েছে!" : "New row added successfully!");
    setTimeout(() => setSaveStatus(null), 2000);
  };

  // Delete row
  const handleDeleteRow = (id: string) => {
    setLocations(prev => prev.filter(loc => loc.id !== id));
    deleteDocument("locations", id);
    setSaveStatus(language === "bn" ? "লোকেশন সফলভাবে মুছে ফেলা হয়েছে!" : "Location successfully deleted!");
    setTimeout(() => setSaveStatus(null), 2500);
  };

  // Reset to original factory sheet
  const handleResetToFactory = () => {
    setLocations(INITIAL_LOCATIONS_REGISTRY);
    setSaveStatus(language === "bn" ? "সিস্টেম ডিফল্ট সফলভাবে রিস্টোর করা হয়েছে!" : "Restored to system defaults successfully!");
    setTimeout(() => setSaveStatus(null), 2500);
  };

  // Filter Locations
  const filteredLocs = locations.filter((loc) => {
    const nameMatch = (loc.name || "").toLowerCase().includes((searchTerm || "").toLowerCase());
    const mapMatch = (loc.mapUrl || "").toLowerCase().includes((searchTerm || "").toLowerCase());
    const matchesSearch = nameMatch || mapMatch;
    
    const matchesEmirate = 
      emirateFilter === "ALL" || (loc.emirate || "").toLowerCase() === (emirateFilter || "").toLowerCase();
      
    return matchesSearch && matchesEmirate;
  });

  return (
    <div id="locations-registry-view" className="space-y-6 font-sans text-xs text-slate-150 pb-16">
      
      {/* Top Title Banner */}
      <div className="bg-[#1E293B]/60 border border-[#334155] rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-[#10B981]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-[10px] bg-emerald-500/15 text-[#10B981] font-mono font-black uppercase rounded-full px-3 py-1 tracking-wider border border-emerald-500/30">
              {language === "bn" ? "মেডিকেল লোকেশন ও ম্যাপ রেজিস্ট্রি" : "Medical Locations & Map Registry"}
            </span>
            <h2 className="text-lg font-black text-slate-100 tracking-tight flex items-center gap-2 mt-2">
              <FileSpreadsheet className="text-[#10B981] w-5.5 h-5.5" />
              <span>{language === "bn" ? "লোকেশন ও ম্যাপ নির্দেশিকা (Excel Style)" : "Active Locations Registry Ledger"}</span>
            </h2>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed max-w-2xl">
              {language === "bn" 
                ? "এখানে সরাসরি এক্সেল স্টাইলে হাসপাতাল ও ক্লিনিকের নাম এবং তাদের ম্যাপ লিংক এডিট, ডিলিট এবং নতুন লোকেশন যুক্ত করতে পারবেন। হসপিটালের নাম বা লিংকে ক্লিক করে সরাসরি পরিবর্তন করুন।"
                : "Edit health safety inspection locations and maps links inline. Changes are synchronized automatically."}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleResetToFactory}
              className="px-3.5 py-2 hover:bg-slate-800 text-slate-350 hover:text-white rounded-xl text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-700/60"
              title="Reset to default hospitals list"
            >
              <Undo className="w-4 h-4" />
              <span>{language === "bn" ? "ডিফল্ট তালিকা" : "Reset Standard"}</span>
            </button>
            
            <button
              onClick={() => {
                const targetState = emirateFilter === "ALL" ? "Dubai" : emirateFilter;
                handleAddRow(targetState);
              }}
              className="px-4 py-2 bg-[#10B981] hover:bg-emerald-400 text-slate-950 font-black rounded-xl transition cursor-pointer shadow-lg shadow-emerald-500/10 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[3px]" />
              <span>{language === "bn" ? "নতুন লোকেশন যোগ" : "Add Location"}</span>
            </button>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-705/40">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              id="registry-search-box-input"
              type="text"
              placeholder={language === "bn" ? "হসপিটাল বা ম্যাপ লিংক খুঁজুন..." : "Search hospital name or google maps url..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:ring-1 focus:ring-[#10B981] focus:border-[#10B981] outline-none placeholder-slate-500"
            />
          </div>

          <div>
            <select
              value={emirateFilter}
              onChange={(e) => setEmirateFilter(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 border border-slate-700 rounded-xl py-2.5 px-3.5 text-xs focus:ring-1 focus:ring-[#10B981] outline-none cursor-pointer"
            >
              {EMIRATE_LIST.map((em) => (
                <option key={em} value={em}>
                  {em === "ALL" 
                    ? (language === "bn" ? "সকল আমিরাত ফিল্টার" : "All Emirates / Regions") 
                    : em.toUpperCase() + " STATE"}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Save Notify */}
      {saveStatus && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-[#10B981] rounded-2xl flex items-center gap-2 font-bold animate-pulse text-[11px]">
          <Sparkles className="w-4 h-4 animate-spin text-[#10B981]" />
          <span>{saveStatus}</span>
        </div>
      )}

      {/* Grid Spreadsheet styled */}
      <div className="space-y-8">
        {EMIRATE_LIST.filter(em => em !== "ALL")
          .filter(em => emirateFilter === "ALL" || (emirateFilter || "").toLowerCase() === (em || "").toLowerCase())
          .map((emirateState) => {
            const emirateLocations = filteredLocs.filter(l => (l.emirate || "").toLowerCase() === (emirateState || "").toLowerCase());
            
            if (emirateLocations.length === 0 && emirateFilter === "ALL") return null;

            return (
              <div key={emirateState} className="bg-[#1E293B]/40 border border-[#334155] rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex justify-between items-center border-b border-slate-705/50 pb-2">
                  <h3 className="text-xs font-black text-emerald-400 tracking-wide flex items-center gap-1.5 uppercase font-mono">
                    <MapPin className="w-4 h-4 text-emerald-450" />
                    <span>{emirateState === "Dubai" ? "DUBAY / DUBAI" : emirateState === "Sharjah" ? "SHARJHA / SHARJAH" : emirateState} HOSPITAL DIRECTORY</span>
                    <span className="text-[9px] bg-slate-850 text-[#10B981] border border-emerald-500/20 py-0.5 px-2 rounded-full font-bold">
                      {emirateLocations.length} Registered
                    </span>
                  </h3>
                  <button
                    onClick={() => handleAddRow(emirateState)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-350 hover:text-white rounded-lg text-[9px] font-bold transition flex items-center gap-1 cursor-pointer border border-slate-700"
                  >
                    ➕ Add {emirateState} Row
                  </button>
                </div>

                {emirateLocations.length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic py-2 pl-2">No hospitals matching search in this Emirate.</p>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-800">
                    <table className="w-full text-slate-200 text-left border-collapse table-auto text-[11px] font-medium min-w-[700px]">
                      <thead>
                        <tr className="bg-slate-950 text-slate-400 font-mono text-[9px] uppercase tracking-wider border-b border-slate-800">
                          <th className="py-2 px-3 border-r border-slate-800 w-12 text-center">S.No</th>
                          <th className="py-2 px-3 border-r border-slate-800 w-64">{language === "bn" ? "হাসপাতাল / ক্লিনিক নাম (এডিট করতে ক্লিক করুন)" : "Hospital / Clinic Name (Click to edit)"}</th>
                          <th className="py-2 px-3 border-r border-slate-800">{language === "bn" ? "গুগল ম্যাপ লিংক / কুঅর্ডিনেট" : "Google Maps URL / Location Link"}</th>
                          <th className="py-2 px-3 text-center w-28">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {emirateLocations.map((loc, index) => (
                          <tr key={loc.id} className="hover:bg-slate-800/40 bg-slate-950/20 transition group">
                            
                            <td className="py-2 px-3 border-r border-slate-800 text-center font-bold text-slate-500 bg-slate-950/40 w-12 font-mono">
                              {index + 1}
                            </td>

                            <td className="py-1.5 px-2 border-r border-slate-800 w-64">
                              <input
                                type="text"
                                value={loc.name}
                                onChange={(e) => handleCellChange(loc.id, "name", e.target.value)}
                                placeholder="Type hospital / clinic name..."
                                className="w-full bg-slate-900 border border-slate-800 text-slate-100 font-bold rounded px-2 py-1 outline-none focus:border-[#10B981]"
                              />
                            </td>

                            <td className="py-1.5 px-2 border-r border-slate-800">
                              <div className="flex items-center gap-2">
                                <span className="text-slate-500 select-none">🗺️</span>
                                {loc.mapUrl && (
                                  <a 
                                    href={loc.mapUrl} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="p-1 px-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-550/20 rounded transition flex items-center gap-1 cursor-pointer font-bold text-[9px] shrink-0 font-sans"
                                    title="Open coordinates inside maps"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    <span>Open</span>
                                  </a>
                                )}
                                <input
                                  type="text"
                                  value={loc.mapUrl || ""}
                                  onChange={(e) => handleCellChange(loc.id, "mapUrl", e.target.value)}
                                  placeholder="Paste google maps link here..."
                                  className="w-full bg-slate-900 border border-slate-800 text-[#10B981] font-mono text-[10px] rounded px-2 py-1 outline-none focus:border-[#10B981]"
                                />
                              </div>
                            </td>

                            <td className="py-1.5 px-2 text-center w-28">
                              <button
                                onClick={() => handleDeleteRow(loc.id)}
                                className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded transition flex items-center justify-center gap-1 cursor-pointer text-[10px] font-bold mx-auto font-sans"
                                title="Delete location row"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>{language === "bn" ? "ডিলিট" : "Delete"}</span>
                              </button>
                            </td>

                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
      </div>

    </div>
  );
}
