import React, { useState } from "react";
import { 
  Plus, X, Lock, Unlock, Eye, EyeOff, Save, CheckCircle2, 
  Upload, Sparkles, SlidersHorizontal, ShieldCheck, FileText, ChevronDown, ChevronUp, RefreshCw
} from "lucide-react";
import { UserSettings } from "../types";

interface AgentSettingsProps {
  settings: UserSettings;
  onSaveSettings: (settings: UserSettings) => Promise<boolean>;
  onSaveCredentials: (platform: string, username: string, secret: string) => Promise<boolean>;
  onAddToast: (msg: string, type: "success" | "info" | "error") => void;
  onGenerateCoverLetterTemplate: (prompt: string) => Promise<string>;
}

export default function AgentSettings({
  settings,
  onSaveSettings,
  onSaveCredentials,
  onAddToast,
  onGenerateCoverLetterTemplate
}: AgentSettingsProps) {
  // Local states
  const [localSettings, setLocalSettings] = useState<UserSettings>({ ...settings });
  
  // Keyword tags adding local
  const [keywordInput, setKeywordInput] = useState("");

  // Platform collapse triggers
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null);

  // Platform credentials inputs
  const [credLinkedinUser, setCredLinkedinUser] = useState(settings.platforms.linkedin.username || "");
  const [credLinkedinPass, setCredLinkedinPass] = useState("••••••••••••");
  const [showLinkedinPass, setShowLinkedinPass] = useState(false);

  const [credIndeedUser, setCredIndeedUser] = useState(settings.platforms.indeed.username || "anwaarazeem@enigneer.com");
  const [credIndeedPass, setCredIndeedPass] = useState("*ANWaar3169501#");
  const [showIndeedPass, setShowIndeedPass] = useState(false);

  const [credBaytUser, setCredBaytUser] = useState(settings.platforms.bayt.username || "anwaarazeem@enigneer.com");
  const [credBaytPass, setCredBaytPass] = useState("*ANWaar3169501#");
  const [showBaytPass, setShowBaytPass] = useState(false);

  const [credNaukriUser, setCredNaukriUser] = useState(settings.platforms.naukrigulf.username || "anwaarazeem@enigneer.com");
  const [credNaukriPass, setCredNaukriPass] = useState("*ANWaar3169501#");
  const [showNaukriPass, setShowNaukriPass] = useState(false);

  // Resume state simulator
  const [isUploading, setIsUploading] = useState(false);

  // AI loading prompt template modifier
  const [isAILoading, setIsAILoading] = useState(false);

  // Add keyword tag
  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = keywordInput.trim();
    if (clean && !localSettings.keywords.includes(clean)) {
      const updated = { ...localSettings, keywords: [...localSettings.keywords, clean] };
      setLocalSettings(updated);
      setKeywordInput("");
    }
  };

  // Remove keyword tag
  const handleRemoveKeyword = (tag: string) => {
    const updated = { ...localSettings, keywords: localSettings.keywords.filter((k) => k !== tag) };
    setLocalSettings(updated);
  };

  // Toggle platform enabled
  const handlePlatformToggle = (platform: keyof typeof localSettings.platforms) => {
    const updated = {
      ...localSettings,
      platforms: {
        ...localSettings.platforms,
        [platform]: {
          ...localSettings.platforms[platform],
          enabled: !localSettings.platforms[platform].enabled
        }
      }
    };
    setLocalSettings(updated);
  };

  // Filter lists toggles
  const handleJobTypeToggle = (type: string) => {
    const arr = [...localSettings.filters.jobType];
    const idx = arr.indexOf(type);
    if (idx > -1) arr.splice(idx, 1);
    else arr.push(type);
    setLocalSettings({
      ...localSettings,
      filters: { ...localSettings.filters, jobType: arr }
    });
  };

  const handleExpToggle = (lvl: string) => {
    const arr = [...localSettings.filters.experienceLevel];
    const idx = arr.indexOf(lvl);
    if (idx > -1) arr.splice(idx, 1);
    else arr.push(lvl);
    setLocalSettings({
      ...localSettings,
      filters: { ...localSettings.filters, experienceLevel: arr }
    });
  };

  // Save Credentials button
  const handleSavePlatformCredentials = async (platform: string, user: string, pass: string) => {
    if (!user || !pass) {
      onAddToast("Credential fields must not be blank.", "error");
      return;
    }
    const success = await onSaveCredentials(platform, user, pass);
    if (success) {
      onAddToast(`Securely updated & encrypted ${platform.toUpperCase()} credential sets.`, "success");
      setExpandedPlatform(null);
    } else {
      onAddToast("Error registering secure credentials.", "error");
    }
  };

  // Trigger global settings persistence
  const handleSaveAllSettings = async () => {
    if (localSettings.keywords.length === 0) {
      onAddToast("Please provide at least one job keyword.", "error");
      return;
    }
    const success = await onSaveSettings(localSettings);
    if (success) {
      onAddToast("Agent system parameters update saved successfully.", "success");
    } else {
      onAddToast("Failed updating settings on server.", "error");
    }
  };

  // AI Letter prompt drafted on Gemini
  const handleHelpDraftTemplatePrompt = async () => {
    setIsAILoading(true);
    try {
      const generated = await onGenerateCoverLetterTemplate(localSettings.resumeText || "");
      setLocalSettings({
        ...localSettings,
        coverLetterPrompt: generated
      });
      onAddToast("AI draft instructions created beautifully using Gemini!", "success");
    } catch {
      onAddToast("AI draft engine timed out.", "error");
    } finally {
      setIsAILoading(false);
    }
  };

  // Simulated CV File Upload Drag Handlers
  const handleFileDropSimulate = (e: React.DragEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setLocalSettings({
        ...localSettings,
        resumeFileName: "Anwaar_Azeem_QC_Inspector_CV.pdf",
        resumeText: `ANWAAR AZEEM
Email: anwaarazeem1993@gmail.com | Phone: +44 7700 900077 | London, UK

PROFESSIONAL SUMMARY:
Highly precise and detail-oriented Quality Control (QC) Inspector with over 5 years of hands-on experience in manufacturing, industrial assembly, and technical product inspections. Proven expertise in implementing rigorous QA/QC inspection regimes, ensuring absolute compliance with ISO 9001, AWS, and ASTM standards. Skilled in blueprint reading, precision measurement, and non-destructive testing (NDT). Strong track record of drafting detailed Non-Conformance Reports (NCR) and collaborating with engineering teams to minimize defects and optimize yield.

CORE COMPETENCIES:
- Quality Assurance & Quality Control (QA/QC) Processes
- Technical Blueprint & CAD Drawing Interpretation
- Technical Dimension Inspection (Calipers, Micrometers, Gauges)
- Standard compliance: ISO 9001, ASME, ASTM, AWS D1.1
- Non-Destructive Testing (NDT) (Liquid Penetrant Level I/II)
- Defect Analysis, NCR Logging, and CAPA Root Cause Resolution
- Calibration of Precision Instrumentation
- Technical Quality Report Generation & Audit Support

PROFESSIONAL EXPERIENCE:
Senior QC Inspector | Apex Industrial Solutions, London, UK | 2023 - Present
- Conduct thorough dimensional and visual inspections of mechanical components and structural fabrications checking alignment, tolerances, and weld safety in compliance with ASTM and AWS standards.
- Reduced manufacturing defect rates by 18% through the implementation of a real-time statistical process control (SPC) analysis dashboard.
- Authored, logged, and resolved over 250 NCRs (Non-Conformance Reports), conducting root-cause reviews under ISO 9001 protocols.
- Coordinated closely with production managers to conduct pre-shipment inspections, securing 100% on-time product dispatch compliance.

Quality Control Inspector | Vanguard Engineering, Manchester, UK | 2021 - 2023
- Executed component inspections utilizing laser trackers, optical comparators, micrometers, and ultrasonic thickness gauges.
- Review and verified incoming supplier material certifications, ensuring conformance with client contract specifications.
- Assisted in internal quality system audits, preparing quality trackers and verifying gage calibration schedules.
- Trained 4 new technicians on technical inspection procedures, safety compliance, and documentation frameworks.

EDUCATION & CREDENTIALS:
- Bachelor of Science in Mechanical/Industrial Engineering (or equivalent technical diploma)
- ASQ Certified Quality Inspector (CQI)
- AWS Certified Welding Inspector (CWI) - Candidate/Preparation
- Trained in ISO 9001 Quality Management Systems`
      });
      onAddToast("Resume parsed. Profile text and metadata initialized.", "success");
    }, 1200);
  };

  return (
    <div id="settings-tab" className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in text-[#042C53]">
      {/* Column 1 & 2: Primary Controls Form */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Keywords & Base Target Platforms */}
        <div className="bg-white/40 backdrop-blur-md p-6 rounded-2xl border border-white/60 shadow-sm">
          <div className="flex items-center space-x-2 border-b border-white/40 pb-3 mb-4">
            <SlidersHorizontal className="h-5 w-5 text-[#1A6FD4]" />
            <h2 className="text-lg font-extrabold text-[#042C53]">Job Crawl & Targets Matching</h2>
          </div>

          <div className="space-y-4">
            {/* Keywords Tag Manager */}
            <div>
              <label className="block text-xs font-bold text-[#042C53]/60 uppercase tracking-wide">Job Search Keywords</label>
              <form onSubmit={handleAddKeyword} className="flex mt-1.5 gap-2">
                <input
                  type="text"
                  placeholder="e.g. React Developer, Frontend Engineer..."
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  className="grow border border-white/60 focus:border-[#1A6FD4] focus:ring-1 focus:ring-[#1A6FD4] rounded-xl px-4 py-2 text-sm outline-hidden text-[#042C53] bg-white/45 placeholder-[#042C53]/40 font-bold"
                />
                <button
                  type="submit"
                  className="bg-[#1A6FD4] hover:bg-[#1A6FD4]/90 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#1A6FD4]/20 transition-all"
                >
                  <Plus className="h-4 w-4" /> Add Tag
                </button>
              </form>

              {/* Tag box */}
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {localSettings.keywords.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 bg-white/60 border border-white/80 text-[#1A6FD4] text-xs font-bold px-3 py-1 rounded-full shadow-xs"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(tag)}
                      className="text-[#1A6FD4]/60 hover:text-[#1A6FD4] cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Target Platforms Swappers */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-[#042C53]/60 uppercase tracking-wide mb-3">Target Platforms Toggle</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { key: "linkedin", label: "LinkedIn" },
                  { key: "indeed", label: "Indeed" },
                  { key: "bayt", label: "Bayt" },
                  { key: "naukrigulf", label: "NaukriGulf" }
                ].map((plat) => {
                  const isEnabled = localSettings.platforms[plat.key as keyof typeof localSettings.platforms]?.enabled;
                  return (
                    <button
                      key={plat.key}
                      type="button"
                      onClick={() => handlePlatformToggle(plat.key as keyof typeof localSettings.platforms)}
                      className={`py-3 px-4 rounded-xl border text-sm font-extrabold transition-all duration-200 flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                        isEnabled 
                          ? "bg-white/75 border-[#1A6FD4]/40 text-[#1A6FD4] shadow-xs" 
                          : "bg-white/30 border-white/40 text-[#042C53]/40 hover:bg-white/50"
                      }`}
                    >
                      <span className="block">{plat.label}</span>
                      <span className={`text-[10px] font-bold uppercase ${isEnabled ? "text-[#1A6FD4]" : "text-[#042C53]/40"}`}>
                        {isEnabled ? "Enabled" : "Disabled"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Secure Credentials Expanders */}
        <div className="bg-white/40 backdrop-blur-md p-6 rounded-2xl border border-white/60 shadow-sm">
          <div className="flex items-center space-x-2 border-b border-white/40 pb-3 mb-4">
            <Lock className="h-5 w-5 text-[#1A6FD4]" />
            <div>
              <h2 className="text-lg font-extrabold text-[#042C53]">Secure Platform Credentials</h2>
              <p className="text-xs text-[#042C53]/60 mt-0.5 font-bold">Stored using AES-256 simulation key encryption</p>
            </div>
          </div>

          <div className="space-y-3">
            {/* LinkedIn Expandable */}
            <div className="border border-white/50 rounded-xl overflow-hidden bg-white/20">
              <button
                type="button"
                onClick={() => setExpandedPlatform(expandedPlatform === "linkedin" ? null : "linkedin")}
                className="w-full flex items-center justify-between p-4 font-bold text-sm text-[#042C53] cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${localSettings.platforms.linkedin.enabled ? "bg-green-500 animate-pulse" : "bg-white/60"}`} />
                  LinkedIn Credentials Setup
                </span>
                {expandedPlatform === "linkedin" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {expandedPlatform === "linkedin" && (
                <div className="p-4 border-t border-white/40 bg-white/40 space-y-3 font-sans">
                  <div>
                    <label className="block text-xs font-bold text-[#042C53]/60">Username / Client Email</label>
                    <input
                      type="text"
                      value={credLinkedinUser}
                      onChange={(e) => setCredLinkedinUser(e.target.value)}
                      className="w-full border border-white/60 focus:border-[#1A6FD4] rounded-lg px-3 py-1.5 mt-1 text-sm text-[#042C53] outline-hidden bg-white/45"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#042C53]/60">Account Password</label>
                    <div className="relative mt-1">
                      <input
                        type={showLinkedinPass ? "text" : "password"}
                        value={credLinkedinPass}
                        onChange={(e) => setCredLinkedinPass(e.target.value)}
                        className="w-full border border-white/60 focus:border-[#1A6FD4] rounded-lg pl-3 pr-10 py-1.5 text-sm text-[#042C53] outline-hidden bg-white/45"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLinkedinPass(!showLinkedinPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#042C53]/40 hover:text-[#042C53]"
                      >
                        {showLinkedinPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSavePlatformCredentials("linkedin", credLinkedinUser, credLinkedinPass)}
                    className="w-full bg-[#1A6FD4] hover:bg-[#1A6FD4]/90 text-white text-xs font-bold py-2 rounded-lg cursor-pointer"
                  >
                    Encapsulate & Save
                  </button>
                </div>
              )}
            </div>

            {/* Indeed Expandable */}
            <div className="border border-white/50 rounded-xl overflow-hidden bg-white/20">
              <button
                type="button"
                onClick={() => setExpandedPlatform(expandedPlatform === "indeed" ? null : "indeed")}
                className="w-full flex items-center justify-between p-4 font-bold text-sm text-[#042C53] cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${localSettings.platforms.indeed.enabled ? "bg-green-500 animate-pulse" : "bg-white/60"}`} />
                  Indeed Credentials Setup
                </span>
                {expandedPlatform === "indeed" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {expandedPlatform === "indeed" && (
                <div className="p-4 border-t border-white/40 bg-white/40 space-y-3 font-sans">
                  <div>
                    <label className="block text-xs font-bold text-[#042C53]/60">Username / Client Email</label>
                    <input
                      type="text"
                      value={credIndeedUser}
                      onChange={(e) => setCredIndeedUser(e.target.value)}
                      className="w-full border border-white/60 focus:border-[#1A6FD4] rounded-lg px-3 py-1.5 mt-1 text-sm text-[#042C53] outline-hidden bg-white/45"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#042C53]/60">Account Password</label>
                    <div className="relative mt-1">
                      <input
                        type={showIndeedPass ? "text" : "password"}
                        value={credIndeedPass}
                        onChange={(e) => setCredIndeedPass(e.target.value)}
                        className="w-full border border-white/60 focus:border-[#1A6FD4] rounded-lg pl-3 pr-10 py-1.5 text-sm text-[#042C53] outline-hidden bg-white/45"
                      />
                      <button
                        type="button"
                        onClick={() => setShowIndeedPass(!showIndeedPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#042C53]/40 hover:text-[#042C53]"
                      >
                        {showIndeedPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSavePlatformCredentials("indeed", credIndeedUser, credIndeedPass)}
                    className="w-full bg-[#1A6FD4] hover:bg-[#1A6FD4]/90 text-white text-xs font-bold py-2 rounded-lg cursor-pointer"
                  >
                    Encapsulate & Save
                  </button>
                </div>
              )}
            </div>

            {/* Bayt Setup */}
            <div className="border border-white/50 rounded-xl overflow-hidden bg-white/20">
              <button
                type="button"
                onClick={() => setExpandedPlatform(expandedPlatform === "bayt" ? null : "bayt")}
                className="w-full flex items-center justify-between p-4 font-bold text-sm text-[#042C53] cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${localSettings.platforms.bayt.enabled ? "bg-green-500 animate-pulse" : "bg-white/60"}`} />
                  Bayt Credentials Setup
                </span>
                {expandedPlatform === "bayt" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {expandedPlatform === "bayt" && (
                <div className="p-4 border-t border-white/40 bg-white/40 space-y-3 font-sans">
                  <div>
                    <label className="block text-xs font-bold text-[#042C53]/60">Username / Client Email</label>
                    <input
                      type="text"
                      value={credBaytUser}
                      onChange={(e) => setCredBaytUser(e.target.value)}
                      className="w-full border border-white/60 focus:border-[#1A6FD4] rounded-lg px-3 py-1.5 mt-1 text-sm text-[#042C53] outline-hidden bg-white/45"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#042C53]/60">Account Password</label>
                    <div className="relative mt-1">
                      <input
                        type={showBaytPass ? "text" : "password"}
                        value={credBaytPass}
                        onChange={(e) => setCredBaytPass(e.target.value)}
                        className="w-full border border-white/60 focus:border-[#1A6FD4] rounded-lg pl-3 pr-10 py-1.5 text-sm text-[#042C53] outline-hidden bg-white/45"
                      />
                      <button
                        type="button"
                        onClick={() => setShowBaytPass(!showBaytPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#042C53]/40 hover:text-[#042C53]"
                      >
                        {showBaytPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSavePlatformCredentials("bayt", credBaytUser, credBaytPass)}
                    className="w-full bg-[#1A6FD4] hover:bg-[#1A6FD4]/90 text-white text-xs font-bold py-2 rounded-lg cursor-pointer"
                  >
                    Encapsulate & Save
                  </button>
                </div>
              )}
            </div>

            {/* Naukri Setup */}
            <div className="border border-white/50 rounded-xl overflow-hidden bg-white/20">
              <button
                type="button"
                onClick={() => setExpandedPlatform(expandedPlatform === "naukri" ? null : "naukri")}
                className="w-full flex items-center justify-between p-4 font-bold text-sm text-[#042C53] cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${localSettings.platforms.naukrigulf.enabled ? "bg-green-500 animate-pulse" : "bg-white/60"}`} />
                  NaukriGulf Credentials Setup
                </span>
                {expandedPlatform === "naukri" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {expandedPlatform === "naukri" && (
                <div className="p-4 border-t border-white/40 bg-white/40 space-y-3 font-sans">
                  <div>
                    <label className="block text-xs font-bold text-[#042C53]/60">Username / Client Email</label>
                    <input
                      type="text"
                      value={credNaukriUser}
                      onChange={(e) => setCredNaukriUser(e.target.value)}
                      className="w-full border border-white/60 focus:border-[#1A6FD4] rounded-lg px-3 py-1.5 mt-1 text-sm text-[#042C53] outline-hidden bg-white/45"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#042C53]/60">Account Password</label>
                    <div className="relative mt-1">
                      <input
                        type={showNaukriPass ? "text" : "password"}
                        value={credNaukriPass}
                        onChange={(e) => setCredNaukriPass(e.target.value)}
                        className="w-full border border-white/60 focus:border-[#1A6FD4] rounded-lg pl-3 pr-10 py-1.5 text-sm text-[#042C53] outline-hidden bg-white/45"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNaukriPass(!showNaukriPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#042C53]/40 hover:text-[#042C53]"
                      >
                        {showNaukriPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSavePlatformCredentials("naukrigulf", credNaukriUser, credNaukriPass)}
                    className="w-full bg-[#1A6FD4] hover:bg-[#1A6FD4]/90 text-white text-xs font-bold py-2 rounded-lg cursor-pointer"
                  >
                    Encapsulate & Save
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Global Search Filters */}
        <div className="bg-white/40 backdrop-blur-md p-6 rounded-2xl border border-white/60 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 border-b border-white/40 pb-3">
            <SlidersHorizontal className="h-5 w-5 text-[#1A6FD4]" />
            <h2 className="text-lg font-extrabold text-[#042C53]">Advanced Crawler Filters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#042C53]/60 uppercase tracking-wide">Target City / State</label>
              <input
                type="text"
                value={localSettings.filters.location}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  filters: { ...localSettings.filters, location: e.target.value }
                })}
                className="w-full border border-white/60 focus:border-[#1A6FD4] rounded-xl px-4 py-2 text-sm outline-hidden text-[#042C53] bg-white/45 mt-1.5 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#042C53]/60 uppercase tracking-wide">Target Country</label>
              <select
                value={
                  ["United Kingdom", "United Arab Emirates", "Saudi Arabia", "Qatar", "Kuwait", "Oman", "Bahrain", "United States", "Canada"].includes(localSettings.filters.country || "")
                    ? (localSettings.filters.country || "United Kingdom")
                    : "Other"
                }
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "Other") {
                    setLocalSettings({
                      ...localSettings,
                      filters: { ...localSettings.filters, country: "" }
                    });
                  } else {
                    setLocalSettings({
                      ...localSettings,
                      filters: { ...localSettings.filters, country: val }
                    });
                  }
                }}
                className="w-full border border-white/60 focus:border-[#1A6FD4] rounded-xl px-3 py-2 text-sm outline-hidden text-[#042C53] bg-white/45 mt-1.5 font-bold cursor-pointer"
              >
                <option value="United Kingdom">🇬🇧 United Kingdom</option>
                <option value="United Arab Emirates">🇦🇪 United Arab Emirates</option>
                <option value="Saudi Arabia">🇸🇦 Saudi Arabia</option>
                <option value="Qatar">🇶🇦 Qatar</option>
                <option value="Kuwait">🇰🇼 Kuwait</option>
                <option value="Oman">🇴🇲 Oman</option>
                <option value="Bahrain">🇧🇭 Bahrain</option>
                <option value="United States">🇺🇸 United States</option>
                <option value="Canada">🇨🇦 Canada</option>
                <option value="Other">Other / Custom Country...</option>
              </select>
              
              {!["United Kingdom", "United Arab Emirates", "Saudi Arabia", "Qatar", "Kuwait", "Oman", "Bahrain", "United States", "Canada"].includes(localSettings.filters.country || "") && (
                <input
                  type="text"
                  placeholder="Enter country name..."
                  value={localSettings.filters.country || ""}
                  onChange={(e) => setLocalSettings({
                    ...localSettings,
                    filters: { ...localSettings.filters, country: e.target.value }
                  })}
                  className="w-full border border-white/60 focus:border-[#1A6FD4] rounded-xl px-4 py-2 text-sm outline-hidden text-[#042C53] bg-white/45 mt-2 font-bold focus:ring-1 focus:ring-[#1A6FD4] placeholder-[#042C53]/50 animate-fade-in"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#042C53]/60 uppercase tracking-wide">Scan Interval</label>
              <select
                value={localSettings.scanFrequency}
                onChange={(e) => setLocalSettings({ ...localSettings, scanFrequency: e.target.value })}
                className="w-full border border-white/60 focus:border-[#1A6FD4] rounded-xl px-3 py-2 text-sm outline-hidden text-[#042C53] bg-white/45 mt-1.5 font-bold cursor-pointer"
              >
                <option value="1h">Every 1 Hour</option>
                <option value="2h">Every 2 Hours</option>
                <option value="6h">Every 6 Hours</option>
                <option value="24h">Daily Scan</option>
              </select>
            </div>
          </div>

          {/* Job Type checklist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div>
              <span className="block text-xs font-bold text-[#042C53]/60 uppercase tracking-wide mb-2">Job Type</span>
              <div className="flex flex-wrap gap-2">
                {["Full-time", "Remote", "Contract", "Part-time"].map((t) => {
                  const check = localSettings.filters.jobType.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleJobTypeToggle(t)}
                      className={`px-3 py-1.5 border rounded-lg text-xs font-bold cursor-pointer transition-all ${
                        check ? "bg-[#1A6FD4] border-[#1A6FD4] text-white" : "bg-white/40 border-white/60 text-[#042C53]"
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <span className="block text-xs font-bold text-[#042C53]/60 uppercase tracking-wide mb-2">Experience Level</span>
              <div className="flex flex-wrap gap-2">
                {["Entry", "Mid-Level", "Senior", "Lead"].map((lvl) => {
                  const check = localSettings.filters.experienceLevel.includes(lvl);
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => handleExpToggle(lvl)}
                      className={`px-3 py-1.5 border rounded-lg text-xs font-bold cursor-pointer transition-all ${
                        check ? "bg-[#1A6FD4] border-[#1A6FD4] text-white" : "bg-white/40 border-white/60 text-[#042C53]"
                      }`}
                    >
                      {lvl}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Column 3: Side actions (Resume, Auto settings, cover template) */}
      <div className="space-y-6">
        
        {/* Auto Apply parameters card */}
        <div className="bg-white/40 backdrop-blur-md p-6 rounded-2xl border border-white/60 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 border-b border-white/40 pb-3">
            <ShieldCheck className="h-5 w-5 text-[#1A6FD4]" />
            <h2 className="text-lg font-extrabold text-[#042C53]">Auto-Apply Gateways</h2>
          </div>

          <div className="flex items-center justify-between bg-white/40 p-4 rounded-xl border border-white/40">
            <div>
              <span className="text-xs font-extrabold text-[#042C53] block">Autonomous Submission</span>
              <span className="text-[11px] text-[#042C53]/60 block mt-0.5">Let the agent apply directly</span>
            </div>
            <button
              id="settings-auto-apply-toggle"
              type="button"
              onClick={() => setLocalSettings({ ...localSettings, autoApply: !localSettings.autoApply })}
              className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition-all border cursor-pointer ${
                localSettings.autoApply 
                  ? "bg-green-100/80 text-green-800 border-green-300" 
                  : "bg-amber-100/80 text-amber-800 border-amber-200"
              }`}
            >
              {localSettings.autoApply ? "AUTO ON" : "SEMI-AUTO"}
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#042C53]/60 uppercase tracking-wide">Daily Submission Limit</label>
            <div className="flex items-center gap-3 mt-1.5">
              <input
                type="range"
                min="1"
                max="20"
                value={localSettings.maxApplicationsPerDay}
                onChange={(e) => setLocalSettings({ ...localSettings, maxApplicationsPerDay: parseInt(e.target.value) })}
                className="grow cursor-pointer accent-[#1A6FD4]"
              />
              <span className="text-sm font-extrabold text-[#1A6FD4] bg-white hover:bg-white/80 border border-white/80 px-3 py-1 rounded-md shrink-0 shadow-xs">
                {localSettings.maxApplicationsPerDay} / day
              </span>
            </div>
            <span className="text-[10px] text-[#042C53]/50 mt-1 block leading-tight font-bold">Prevents accounts flagdowns/rate limiting by spreading browser executions.</span>
          </div>
        </div>

        {/* CV Upload Container */}
        <div className="bg-white/40 backdrop-blur-md p-6 rounded-2xl border border-white/60 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 border-b border-white/40 pb-3">
            <FileText className="h-5 w-5 text-[#1A6FD4]" />
            <h2 className="text-lg font-extrabold text-[#042C53]">Candidate Profiler (CV)</h2>
          </div>

          {/* Dnd Box */}
          <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDropSimulate}
            className="border-2 border-dashed border-white/65 hover:border-[#1A6FD4] p-6 rounded-xl text-center cursor-pointer transition-all bg-white/30 hover:bg-white/50 flex flex-col items-center justify-center min-h-36"
          >
            {isUploading ? (
              <div className="flex flex-col items-center space-y-2">
                <RefreshCw className="h-7 w-7 text-[#1A6FD4] animate-spin" />
                <span className="text-xs font-bold text-[#042C53]/75">Extracting CV metadata...</span>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Upload className="h-7 w-7 text-[#042C53]/40 mx-auto" />
                <p className="text-xs font-bold text-[#042C53]">Drag & drop your Resume PDF</p>
                <p className="text-[10px] text-[#042C53]/60 font-semibold">or click to browse from device</p>
              </div>
            )}
          </div>

          {localSettings.resumeFileName && (
            <div className="p-3 bg-white/60 border border-white/80 rounded-xl space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-[#1A6FD4] truncate">{localSettings.resumeFileName}</span>
                <span className="text-[10px] bg-green-100/80 text-green-800 px-2 font-bold rounded-full border border-green-200">ACTIVE</span>
              </div>
              <p className="text-[11px] font-mono text-[#042C53]/70 leading-snug line-clamp-4 bg-white/40 p-2 rounded-md border border-white/20">
                {localSettings.resumeText}
              </p>
            </div>
          )}
        </div>

        {/* Cover Letter Prompt Builder (AI driven) */}
        <div className="bg-white/40 backdrop-blur-md p-6 rounded-2xl border border-white/60 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-white/40 pb-2">
            <span className="text-[#042C53] font-extrabold block text-sm">Cover Letter AI Prompt Base</span>
            <button
              id="settings-help-draft-instructions-btn"
              type="button"
              disabled={isAILoading}
              onClick={handleHelpDraftTemplatePrompt}
              className="text-[10px] bg-white/60 text-[#1A6FD4] border border-white/80 font-extrabold rounded-md px-2 py-1 flex items-center gap-1 hover:bg-white/90 transition-all cursor-pointer shadow-xs"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#1A6FD4]" />
              {isAILoading ? "Drafting..." : "Synthesize Draft"}
            </button>
          </div>

          <div>
            <textarea
              rows={5}
              value={localSettings.coverLetterPrompt}
              onChange={(e) => setLocalSettings({ ...localSettings, coverLetterPrompt: e.target.value })}
              className="w-full border border-white/60 focus:border-[#1A6FD4] rounded-lg p-3 text-xs outline-hidden text-[#042C53] bg-white/40 font-bold"
              placeholder="Provide instructions to the AI regarding tone, details to feature, and parameters..."
            />
            <span className="text-[10px] text-[#042C53]/50 mt-1 block leading-tight font-bold">These instructions will guide the Gemini model when writing each individualized job cover letter.</span>
          </div>
        </div>

        {/* Save Changes Float Trigger */}
        <button
          id="settings-save-all-btn"
          type="button"
          onClick={handleSaveAllSettings}
          className="w-full bg-[#1A6FD4] hover:bg-[#1A6FD4]/90 text-white font-extrabold py-3 px-4 rounded-xl flex items-center justify-center gap-2 border border-transparent shadow-lg shadow-[#1A6FD4]/10 transition-all cursor-pointer"
        >
          <Save className="h-5 w-5" /> Save Configuration Settings
        </button>

      </div>
    </div>
  );
}
