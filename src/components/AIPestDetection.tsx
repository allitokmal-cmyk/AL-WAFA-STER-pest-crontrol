import React, { useState } from "react";
import { 
  Sparkles, 
  Camera, 
  HelpCircle, 
  AlertTriangle, 
  CheckCircle, 
  FileText, 
  FileSpreadsheet,
  RefreshCw,
  Search,
  ShieldAlert,
  Info
} from "lucide-react";

interface AIPestDetectionProps {
  language: "en" | "ar" | "bn";
}

export default function AIPestDetection({ language }: AIPestDetectionProps) {
  const [imageBase64, setImageBase64] = useState<string>("");
  const [keyword, setKeyword] = useState<string>("German Cockroach");
  const [userPrompt, setUserPrompt] = useState<string>("Identify this insect found near clinical beds. Suggest medical-grade chemicals from Al Wafa Star's inventory.");
  const [loading, setLoading] = useState(false);
  const [apiSource, setApiSource] = useState<string>("");
  const [result, setResult] = useState<any>(null);

  // Ready To Test Sample Emojis / Base64 presets for testing!
  const samples = [
    { title: "German Cockroach", key: "cockroach", emoji: "🪳", prompt: "Spotted in hospital kitchen backsplash. Check for clinical food prep contagion hazards." },
    { title: "Bed Bug", key: "bedbug", emoji: "🪲", prompt: "Spotted in clinical patient ward bunk beds. Suggest Safe non-toxic spraying blocks." },
    { title: "Drain Fly", key: "fly", emoji: "🪰", prompt: "Drainage backflows in dentistry sinks. Recommend trap sanitizers." },
    { title: "Roof Rat / Mouse", key: "rodent", emoji: "🐀", prompt: "Surgical storage warehouse cabinets. Assess equipment gnawing risk." }
  ];

  const triggerAnalyze = async (sampleKey?: string, customPrompt?: string) => {
    setLoading(true);
    setResult(null);

    const activeKey = sampleKey || keyword;
    const activePrompt = customPrompt || userPrompt;

    // Build a mock base64 placeholder if no file loaded to satisfy Gemini multimodality
    const activeBase64 = imageBase64 || `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23111827"/><text x="50" y="50" text-anchor="middle" font-size="20">Insect ${activeKey}</text></svg>`;

    try {
      const resp = await fetch("/api/gemini/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: activeBase64,
          keyword: activeKey,
          userPrompt: activePrompt
        })
      });
      const data = await resp.json();
      if (data.success) {
        setResult(data.data);
        setApiSource(data.source);
      } else {
        alert("Pest diagnostics failed: " + data.error);
      }
    } catch (e: any) {
      console.error(e);
      alert("Error contacting Al Wafa Diagnostic servers.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
        setKeyword(file.name.split(".")[0]);
      };
      reader.readAsDataURL(file);
    }
  };

  const selectPreset = (sample: any) => {
    setKeyword(sample.title);
    setUserPrompt(sample.prompt);
    // Setting simulated base64 representation
    setImageBase64(`data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"><rect width="100%" height="100%" fill="%230F172A"/><text x="50%" y="50%" font-size="40" text-anchor="middle" dominant-baseline="middle">${sample.emoji}</text></svg>`);
    triggerAnalyze(sample.key, sample.prompt);
  };

  return (
    <div id="erp-ai-pest-view" className="space-y-6">
      
      {/* Title */}
      <div className="bg-[#111827] text-white p-6 rounded-3xl border border-[#334155] shadow-md flex justify-between items-center">
        <div>
          <span className="text-[10px] bg-purple-500/15 text-purple-300 font-mono font-bold tracking-widest uppercase px-3 py-1 rounded-full border border-purple-500/25">
             🚀 GEMINI 3.5 FLASH AUDITOR
          </span>
          <h2 className="text-xl font-bold tracking-tight mt-2 flex items-center gap-2">
            <Sparkles className="text-purple-400 w-5 h-5" />
            <span>AI Pest Diagnostics & Clinical Risk Assessment</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Instantly audit vector species hazards, recommend pharmaceutical dosages, and retrieve medical safety parameters
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Presets and Upload Input column */}
        <div className="bg-[#F8FAFC] border border-[#CBD5E1] p-6 rounded-2xl shadow-sm lg:col-span-1 space-y-6">
          
          {/* Presets buttons */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">Ready-To-Test Preset Species</label>
            <div className="grid grid-cols-2 gap-2">
              {samples.map((s) => (
                <button
                  id={`preset-btn-${s.key}`}
                  key={s.key}
                  type="button"
                  onClick={() => selectPreset(s)}
                  className="p-3 bg-white border border-slate-200 hover:border-purple-300 rounded-xl text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:shadow-sm"
                >
                  <span className="text-2xl">{s.emoji}</span>
                  <span className="text-[11px] font-bold text-slate-800 leading-tight">{s.title}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4 space-y-4">
            <label className="text-xs font-bold text-slate-700 block">Or upload real specimen photo</label>
            
            <div className="border border-dashed border-slate-350 bg-slate-50 rounded-xl p-4 text-center space-y-3">
              <Camera className="w-8 h-8 text-slate-400 mx-auto" />
              <input
                id="ai-file-uploader"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                id="trigger-file-click"
                type="button"
                onClick={() => document.getElementById("ai-file-uploader")?.click()}
                className="px-3 py-1.5 bg-[#2563EB]/10 text-[#2563EB] hover:bg-[#2563EB]/20 border border-blue-200/50 rounded-lg text-xs font-bold cursor-pointer"
              >
                Upload Photo
              </button>
              <span className="text-[10px] text-slate-400 block">Accepts JPEGs, PNGs up to 10MB</span>
            </div>

            {imageBase64 && (
              <div className="space-y-1.5 p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-extrabold uppercase">Attached</span>
                  <span className="text-[11px] font-mono text-slate-600 truncate block mt-0.5">{keyword}</span>
                </div>
                <button
                  id="remove-attached-btn"
                  onClick={() => setImageBase64("")}
                  className="text-xs text-red-500 hover:text-red-700 font-bold px-2 py-1 cursor-pointer bg-red-50 hover:bg-red-100 rounded"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 pt-4 space-y-3 text-xs font-semibold">
            <div className="space-y-1">
              <label className="text-slate-700 block">Medical Safety Query Prompt</label>
              <textarea
                id="ai-prompt-input"
                rows={3}
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-purple-400 outline-none"
              />
            </div>

            <button
              id="ai-diagnose-btn"
              onClick={() => triggerAnalyze()}
              disabled={loading}
              className="w-full py-3 bg-slate-900 border border-purple-500 hover:border-purple-400 text-[#10B981] font-black rounded-xl text-xs uppercase cursor-pointer flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>{loading ? "Analyzing..." : "TRANSMIT DIAGNOSTICS"}</span>
            </button>
          </div>

        </div>

        {/* Real-time Diagnostics Output Panel */}
        <div className="lg:col-span-2 bg-[#F8FAFC] border border-[#CBD5E1] p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Diagnosis Clinical Audit</h3>
                <p className="text-[10px] text-slate-500">Structured telemetry generated via Al Wafa Star ERP</p>
              </div>
              {apiSource && (
                <span className={`text-[10px] font-mono font-bold uppercase rounded-full px-3 py-1 border ${
                  apiSource === "gemini-api" 
                    ? "bg-purple-50 text-purple-700 border-purple-100 animate-pulse" 
                    : "bg-blue-50 text-[#2563EB] border-blue-100"
                }`}>
                  Model Engine: {apiSource}
                </span>
              )}
            </div>

            {loading ? (
              <div className="py-24 text-center space-y-4">
                <RefreshCw className="w-12 h-12 text-[#10B981] animate-spin mx-auto" />
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-700 block">Gemini 3.5 is analyzing the vector morphology...</span>
                  <span className="text-[10px] text-slate-400 font-mono">Comparing biological indices with Al Wafa regulatory databases</span>
                </div>
              </div>
            ) : result ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in text-xs font-semibold">
                {/* Left diagnostic */}
                <div className="space-y-4">
                  <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1">
                    <span className="text-[9px] text-[#2563EB] font-mono uppercase block">Identified Pest Species</span>
                    <h4 className="text-base font-extrabold text-slate-900">{result.pest}</h4>
                    <p className="text-[10px] text-slate-500">Confidence Score: <b>{result.confidence}</b></p>
                  </div>

                  <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1.5">
                    <span className="text-[9px] text-[#2563EB] font-mono uppercase block">Audit Analysis & Risk Quotient</span>
                    <p className="text-[11px] text-slate-700 leading-relaxed font-medium">{result.description}</p>
                    <div className="flex items-center gap-1.5 pt-2 border-t">
                      <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
                      <span className="text-[11px] font-bold text-red-600 uppercase">Risk Level: {result.level} Hazard</span>
                    </div>
                  </div>
                </div>

                {/* Right suggested treatment */}
                <div className="space-y-4">
                  <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1.5">
                    <span className="text-[9px] text-emerald-600 font-mono uppercase block">SOP Treatment Protocol (Al Wafa ERP)</span>
                    <p className="text-[11px] text-slate-800"><span className="font-extrabold text-[#555]">Methodology:</span> {result.treatmentMethod}</p>
                    <p className="text-[11px] text-slate-800"><span className="font-extrabold text-[#555]">Dosage Suggested:</span> {result.chemicalSuggested}</p>
                    <p className="text-[11px] text-slate-800"><span className="font-extrabold text-[#555]">Dilution Rate:</span> <span className="font-mono bg-slate-100 rounded px-1">{result.dilutionRate}</span></p>
                  </div>

                  <div className="p-4 bg-[#10B981]/5 border border-[#10B981]/20 rounded-xl space-y-1">
                    <span className="text-[9px] text-emerald-700 font-mono uppercase block">Pro-active Exclusions & Proofing</span>
                    <p className="text-[11px] text-emerald-800 leading-relaxed">{result.proofingAdvice}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-24 text-center space-y-3">
                <Sparkles className="w-10 h-10 text-purple-400 mx-auto animate-pulse" />
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Diagnostics Center Dormant</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Please press on one of our ready-to-test sample bugs or attach a custom file to generate telemetry.</p>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 pt-4 mt-6">
            <p className="text-[10px] text-slate-500 flex items-center gap-1.5 leading-snug">
              <Info className="w-4 h-4 text-[#2563EB] shrink-0" />
              <span>All diagnostics automatically synchronize with Al Wafa's smart reminder engine to schedule mandatory 14-day re-inspection blocks if High risk levels identified.</span>
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
