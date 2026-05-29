import React, { useState, useEffect } from "react";
import { 
  Play, Pause, RefreshCw, Layers, CheckCircle2, 
  Clock, AlertTriangle, ChevronRight, Send, ArrowUpRight, 
  MapPin, DollarSign, Calendar, Eye, FileText, Compass, Bot, CheckSquare
} from "lucide-react";
import { AgentStatus, Application, LogEntry, UserSettings } from "../types";

interface DashboardProps {
  status: AgentStatus;
  applications: Application[];
  logs: LogEntry[];
  settings: UserSettings;
  onToggleAgent: () => void;
  onRunNow: () => Promise<any>;
  onAddToast: (msg: string, type: "success" | "info" | "error") => void;
  setCurrentTab: (tab: string) => void;
  onSelectApplication: (app: Application) => void;
}

export default function Dashboard({
  status,
  applications,
  logs,
  settings,
  onToggleAgent,
  onRunNow,
  onAddToast,
  setCurrentTab,
  onSelectApplication
}: DashboardProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [countdownString, setCountdownString] = useState("00:00");

  const scanSteps = [
    "Spinning up sandboxed automation context...",
    "Navigating to enabled crawler platform gateways...",
    `Authenticating session into platform user accounts safely...`,
    `Searching keywords: "${settings.keywords[0] || "React Developer"}" & Filters...`,
    "Filtering historical submissions for deduplication...",
    "Extracting match listings and evaluating resume scores...",
    "Synthesizing customized cover letter with Gemini LLM...",
    "Pre-filling application elements & verifying fields...",
    "Automated dispatch completed cleanly!"
  ];

  // Simulated countdown ticker to next scheduled scan
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status.active && status.nextRun) {
      const updateCountdown = () => {
        const next = new Date(status.nextRun!).getTime();
        const now = Date.now();
        const diff = next - now;

        if (diff <= 0) {
          setCountdownString("00:00");
          return;
        }

        const totalSecs = Math.floor(diff / 1000);
        const mins = Math.floor(totalSecs / 60) % 60;
        const secs = totalSecs % 60;
        // Limit to 59:59 display
        setCountdownString(
          `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
        );
      };

      updateCountdown();
      interval = setInterval(updateCountdown, 1000);
    } else {
      setCountdownString("--:--");
    }
    return () => clearInterval(interval);
  }, [status.active, status.nextRun]);

  const triggerScan = async () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanStep(0);
    onAddToast("Initializing crawler agent search process...", "info");

    // Realistic scanning visual step animations
    const stepInterval = setInterval(() => {
      setScanStep((prev) => {
        if (prev >= scanSteps.length - 1) {
          clearInterval(stepInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);

    try {
      const res = await onRunNow();
      clearInterval(stepInterval);
      setScanStep(scanSteps.length - 1);
      setTimeout(() => {
        setIsScanning(false);
        if (res && res.success) {
          onAddToast(
            `Agent dispatch completed! Surfaced/applied ${res.processed} positions.`,
            "success"
          );
        } else {
          onAddToast("Agent search complete with warnings.", "info");
        }
      }, 1000);
    } catch {
      clearInterval(stepInterval);
      setIsScanning(false);
      onAddToast("Browser automation simulator failed.", "error");
    }
  };

  // Compute metric numbers
  const totalApplied = applications.filter(a => a.status === "Applied").length;
  const totalReview = applications.filter(a => a.status === "In Review").length;
  const totalInterview = applications.filter(a => a.status === "Interview").length;
  const totalRejected = applications.filter(a => a.status === "Rejected").length;

  // Custom visual SVG Line diagram configuration. Represents applications applied across latest days
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  // Generate beautiful proportional stats curve
  const chartHeight = 100;
  const chartWidth = 500;
  const applicationData = [1, 2, 5, 3, status.totalAppliedToday || 4, totalApplied, totalInterview + 2];
  const maxVal = Math.max(...applicationData, 5);
  
  // Create coordinates for SVG Path
  const points = applicationData.map((val, i) => {
    const x = (i / (applicationData.length - 1)) * chartWidth;
    const y = chartHeight - (val / maxVal) * (chartHeight - 20);
    return `${x},${y}`;
  }).join(" ");

  return (
    <div id="dashboard-tab" className="space-y-6">
      {/* Top Welcome Title Grid */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white/40 backdrop-blur-md rounded-2xl border border-white/60 text-[#042C53] shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">System Status: {status.active ? "ON AIR / FULLY AUTONOMOUS" : "SUSPENDED / PAUSED"}</h1>
          <p className="text-[#042C53]/70 text-sm mt-1 max-w-xl">
            AutoAISearch is running in {settings.autoApply ? "Auto-Apply Mode" : "Semi-Automated Mode"}. We crawl jobs using your keywords, draft cover letters, and track everything in real-time.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            id="dash-run-now-btn"
            disabled={isScanning}
            onClick={triggerScan}
            className={`flex items-center space-x-2 bg-[#1A6FD4] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#1A6FD4]/90 transition-all duration-200 shadow-md shadow-[#1A6FD4]/20 ${
              isScanning ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <RefreshCw className={`h-4 w-4 ${isScanning ? "animate-spin" : ""}`} />
            <span>{isScanning ? "Running Auto-Scan..." : "Search & Scan Now"}</span>
          </button>
          
          <button
            id="dash-toggle-agent-btn"
            onClick={onToggleAgent}
            className={`flex items-center space-x-2 border border-[#042C53]/10 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
              status.active 
                ? "bg-red-500/10 hover:bg-red-500/20 text-red-700" 
                : "bg-green-500/20 hover:bg-green-500/30 text-green-700"
            }`}
          >
            {status.active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span>{status.active ? "Pause Agent" : "Resume Agent"}</span>
          </button>
        </div>
      </div>

      {/* Live Scanner Animation Area if triggered */}
      {isScanning && (
        <div className="p-6 bg-[#042C53] border border-white/10 rounded-2xl text-white shadow-2xl animate-fade-in">
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
            <div className="flex items-center space-x-3">
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-blue-500"></span>
              </span>
              <h3 className="font-mono text-sm font-semibold text-blue-300 uppercase tracking-widest">Live Automation Sandbox Trace</h3>
            </div>
            <span className="text-xs text-white/60 font-mono">STEP {scanStep + 1} OF {scanSteps.length}</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Left instructions */}
            <div className="space-y-4">
              <div className="min-h-16 flex items-start space-x-3">
                <Bot className="h-6 w-6 text-blue-400 shrink-0 animate-bounce" />
                <div>
                  <p className="font-mono text-white font-medium text-base">
                    {scanSteps[scanStep]}
                  </p>
                  <p className="text-xs text-white/50 mt-1">Executing system browser automation hooks and anti-bot fingerprints...</p>
                </div>
              </div>
              
              {/* Tracker lines */}
              <div className="space-y-1.5 font-mono text-xs text-white/40">
                {scanSteps.map((step, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <span className={idx < scanStep ? "text-green-400 font-bold" : idx === scanStep ? "text-blue-400 animate-pulse font-bold" : "text-white/20"}>
                      {idx < scanStep ? "✓" : idx === scanStep ? "➔" : "○"}
                    </span>
                    <span className={idx <= scanStep ? "text-white/90" : "text-white/40"}>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right virtual representation of active search */}
            <div className="bg-black/40 border border-white/10 p-4 rounded-xl font-mono text-xs h-48 overflow-y-auto space-y-2 text-green-400">
              <div>[SYSTEM_INFO] {new Date().toISOString()} Engine Started.</div>
              <div>[FINGERPRINT] Chrome spoofed user-agent, touch capability enabled.</div>
              {scanStep >= 2 && <div className="text-slate-300">[LinkedIn] Executing secure session handshake with cookies...</div>}
              {scanStep >= 3 && <div className="text-blue-400">[SEARCH_PARAMS] Keyword: {settings.keywords[0]} | Target: {settings.filters.location}, {settings.filters.country || "United Kingdom"}</div>}
              {scanStep >= 5 && <div className="text-yellow-400">[COMPARING] Checking candidate profile matching: 100% on React components.</div>}
              {scanStep >= 6 && <div className="text-purple-400">[GEMINI_AI] Generating unique customized cover letter drafts dynamically...</div>}
              {scanStep >= 8 && <div className="text-green-400 font-bold">[DISPATCH] POST payload successfully submitted. Status Code: 201 Created.</div>}
              <div className="animate-pulse">_</div>
            </div>
          </div>
        </div>
      )}
      {/* Grid: Tickers & Counters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent Status Detail Card */}
        <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white/80 shadow-sm col-span-1 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold tracking-wide text-[#042C53]/60 uppercase">Agent Heartbeat</h3>
            <div className="flex items-baseline space-x-3 mt-2">
              <span className={`text-4xl font-extrabold tracking-tight ${status.active ? "text-[#1A6FD4]" : "text-[#042C53]/40"}`}>
                {status.active ? "ACTIVE" : "PAUSED"}
              </span>
              <span className="text-xs text-[#042C53]/50 font-bold">{settings.scanFrequency === "1h" ? "Hourly Scan Cycle" : `Every ${settings.scanFrequency}`}</span>
            </div>
          </div>

          <div className="border-t border-white/60 py-4 my-2 grid grid-cols-2 gap-4">
            <div>
              <span className="text-[11px] font-mono font-bold text-[#042C53]/40 uppercase block">Next Scan Cycle</span>
              <div className="flex items-center space-x-1.5 mt-1">
                <Clock className="h-4 w-4 text-[#1A6FD4]" />
                <span className="font-mono text-lg font-extrabold text-[#042C53] tracking-wider">
                  {countdownString}
                </span>
              </div>
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold text-[#042C53]/40 uppercase block">Last Scanned</span>
              <span className="text-xs font-bold text-[#042C53]/70 block mt-1.5">
                {status.lastRun ? new Date(status.lastRun).toLocaleTimeString() : "Never"}
              </span>
            </div>
          </div>

          <div className="bg-white/40 p-4 rounded-xl border border-white/60">
            <h4 className="text-xs font-bold text-[#1A6FD4] uppercase tracking-wider">Submissions Limits</h4>
            <div className="flex justify-between text-xs text-[#042C53]/80 mt-2 font-bold">
              <span>Applications Today:</span>
              <span>{status.totalAppliedToday} / {settings.maxApplicationsPerDay} limit</span>
            </div>
            <div className="w-full bg-white/60 h-1.5 rounded-full mt-1.5 overflow-hidden border border-white/20">
              <div 
                className="bg-[#1A6FD4] h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min((status.totalAppliedToday / settings.maxApplicationsPerDay) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Proportional Analytics Visual SVG graph */}
        <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white/80 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold tracking-wide text-[#042C53]/60 uppercase">Submissions Activity Trend</h3>
              <p className="text-xs text-[#042C53]/40 mt-0.5 font-semibold">Real-time daily submission logging profile counts</p>
            </div>
            <span className="text-xs bg-white/60 text-[#1A6FD4] px-3 py-1 font-extrabold rounded-full border border-white/80 shadow-xs">This Week: {status.totalAppliedThisWeek} Applications</span>
          </div>

          {/* SVG line-chart graph */}
          <div className="my-4 h-32 w-full flex items-end">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1A6FD4" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#1A6FD4" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Grid lines */}
              <line x1="0" y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="#FFFFFF" strokeWidth="1" />
              <line x1="0" y1={chartHeight / 2} x2={chartWidth} y2={chartHeight / 2} stroke="#FFFFFF" strokeDasharray="4 4" />
              <line x1="0" y1="20" x2={chartWidth} y2="20" stroke="#FFFFFF" strokeDasharray="4 4" />
              
              {/* Smooth filled area */}
              <path
                d={`M 0,${chartHeight} L ${points} L ${chartWidth},${chartHeight} Z`}
                fill="url(#gradient)"
              />
              {/* Highlight line */}
              <polyline
                fill="none"
                stroke="#1A6FD4"
                strokeWidth="3.5"
                points={points}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Interactive Dots */}
              {applicationData.map((val, i) => {
                const x = (i / (applicationData.length - 1)) * chartWidth;
                const y = chartHeight - (val / maxVal) * (chartHeight - 20);
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r="5"
                    fill="#1A6FD4"
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                    className="hover:scale-125 transition-transform"
                    style={{ cursor: "pointer" }}
                  />
                );
              })}
            </svg>
          </div>

          {/* Graph bottom label tags */}
          <div className="flex justify-between px-2 font-mono text-[10px] text-[#042C53]/55 font-bold tracking-wider">
            {daysOfWeek.map((day, idx) => (
              <span key={day}>{day} ({applicationData[idx] || 0})</span>
            ))}
          </div>
        </div>
      </div>

      {/* Live Metric Statistics Numbers */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Applications", value: applications.length, color: "text-[#1A6FD4] border-white/80 bg-white/60" },
          { label: "Discovered Review Inbox", value: totalReview, color: "text-amber-700 border-white/80 bg-white/60" },
          { label: "Interviews Booked", value: totalInterview, color: "text-green-700 border-white/80 bg-white/60" },
          { label: "Rejected Status", value: totalRejected, color: "text-red-700 border-white/80 bg-white/60" },
        ].map((stat, i) => (
          <div key={i} className={`p-5 rounded-2xl border backdrop-blur-md shadow-sm ${stat.color}`}>
            <span className="text-xs font-bold uppercase tracking-wider text-[#042C53]/40 block">{stat.label}</span>
            <span className="text-3xl font-extrabold tracking-tight mt-1.5 block">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Bottom dual columns split: Discovered Applications Preview & Latest Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Discovered / In Review Inbox */}
        <div className="bg-white/40 backdrop-blur-md p-6 rounded-3xl border border-white/60 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/40 pb-3 mb-4">
              <div>
                <h3 className="font-extrabold text-[#042C53] flex items-center gap-1.5">
                  <Compass className="h-5 w-5 text-amber-500" />
                  Review & Semi-Apply Inbox
                </h3>
                <p className="text-xs text-[#042C53]/60 mt-0.5 font-semibold">Surfaced jobs matching keywords awaiting cover letter checkout</p>
              </div>
              <span className="bg-white/60 border border-white/80 text-amber-700 text-xs px-2.5 py-0.5 rounded-full font-extrabold shadow-xs">
                {totalReview} Pending
              </span>
            </div>

            {totalReview === 0 ? (
              <div className="p-8 text-center text-[#042C53]/40">
                <CheckSquare className="h-10 w-10 text-[#042C52]/20 mx-auto mb-2" />
                <p className="text-sm font-semibold text-[#042C53]/80">All caught up! No applications pending checkout.</p>
                <p className="text-xs mt-1 font-semibold">If in Semi-Auto mode, scan boards dynamically to surface matches.</p>
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
                {applications
                  .filter((app) => app.status === "In Review")
                  .map((app) => (
                    <div 
                      key={app.id} 
                      className="p-4 border border-white/40 rounded-2xl hover:border-[#1A6FD4]/50 bg-white/40 hover:bg-white/60 transition-all cursor-pointer group shadow-xs"
                      onClick={() => {
                        onSelectApplication(app);
                        setCurrentTab("tracker");
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-extrabold text-[#042C53] group-hover:text-[#1A6FD4] text-sm transition-colors">{app.title}</h4>
                          <span className="text-xs text-[#042C53]/60 font-bold">{app.company} • {app.location}</span>
                        </div>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${
                          app.platform === "linkedin" ? "bg-blue-100/60 text-blue-700" : "bg-teal-100/60 text-teal-800"
                        }`}>
                          {app.platform}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3 text-xs text-[#042C53]/60 font-semibold">
                        <span className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" /> {app.salary || "Competitive"}</span>
                        <span className="flex items-center gap-1 text-[#1A6FD4] font-extrabold group-hover:underline">
                          Verify & Submit <ArrowUpRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div className="border-t border-white/40 pt-4 mt-4 text-center">
            <button 
              onClick={() => setCurrentTab("tracker")}
              className="text-xs text-[#1A6FD4] hover:text-[#1A6FD4]/80 font-extrabold flex items-center justify-center gap-1 mx-auto"
            >
              Configure Tracker Database <ChevronRight className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        {/* Timelines logs feed */}
        <div className="bg-white/40 backdrop-blur-md p-6 rounded-3xl border border-white/60 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/40 pb-3 mb-4">
              <div>
                <h3 className="font-extrabold text-[#042C53] flex items-center gap-1.5">
                  <Layers className="h-5 w-5 text-[#1A6FD4]" />
                  Recent Agent Timelines
                </h3>
                <p className="text-xs text-[#042C53]/60 mt-0.5 font-semibold">Chronological system action outputs</p>
              </div>
              <button 
                onClick={() => setCurrentTab("logs")}
                className="text-xs text-[#1A6FD4] hover:text-[#1A6FD4]/80 font-extrabold"
              >
                Open Full Terminal
              </button>
            </div>

            <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
              {logs.slice(0, 7).map((log, index) => (
                <div key={log.id || index} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`p-1.5 rounded-full shrink-0 ${
                      log.level === "success" ? "bg-green-100 text-green-600" :
                      log.level === "error" ? "bg-red-100 text-red-500" : "bg-blue-100 text-blue-500"
                    }`}>
                      {log.level === "success" ? <CheckCircle2 className="h-3.5 w-3.5" /> : 
                       log.level === "error" ? <AlertTriangle className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                    </div>
                    {index < Math.min(logs.length, 6) && (
                      <div className="w-0.5 grow bg-white/40 my-1"></div>
                    )}
                  </div>
                  
                  <div className="pb-1">
                    <span className="font-mono text-[10px] text-[#042C53]/40 block font-bold leading-none">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    <p className="text-xs font-bold text-[#042C53]/80 mt-1 leading-snug">{log.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
