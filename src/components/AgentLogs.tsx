import React, { useState, useEffect, useRef } from "react";
import { Terminal, Trash2, Shield, Search, RefreshCw, Layers, CheckSquare } from "lucide-react";
import { LogEntry } from "../types";

interface AgentLogsProps {
  logs: LogEntry[];
  onClearLogs: () => Promise<boolean>;
  onAddToast: (msg: string, type: "success" | "info" | "error") => void;
}

export default function AgentLogs({ logs, onClearLogs, onAddToast }: AgentLogsProps) {
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll terminal on logs loader updates
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  // Handle Clear
  const handleClearTrigger = async () => {
    if (confirm("Clear all logs data from server? This is irreversible.")) {
      const success = await onClearLogs();
      if (success) {
        onAddToast("Agent logs storage cleared successfully.", "success");
      }
    }
  };

  // Filter logs elements
  const filteredLogs = logs.filter((log) => {
    const matchesLevel = levelFilter === "all" || log.level === levelFilter;
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  return (
    <div id="logs-tab" className="space-y-6 animate-fade-in text-sans text-[#042C53]">
      
      {/* Header controls top bar */}
      <div className="bg-white/40 backdrop-blur-md p-5 rounded-2xl border border-white/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left level filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 grow max-w-2xl text-xs">
          <div className="relative grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#042C53]/45 h-4 w-4" />
            <input
              type="text"
              placeholder="Search logs message context..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-white/60 focus:border-[#1A6FD4] focus:ring-1 focus:ring-[#1A6FD4] rounded-xl pl-9 pr-4 py-1.5 outline-hidden text-[#042C53] bg-white/45 font-bold"
            />
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {[
              { id: "all", label: "All Logs" },
              { id: "info", label: "Info Trace" },
              { id: "success", label: "Success" },
              { id: "error", label: "Errors" }
            ].map((lvl) => (
              <button
                key={lvl.id}
                type="button"
                onClick={() => setLevelFilter(lvl.id)}
                className={`py-1.5 px-3 border rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  levelFilter === lvl.id 
                    ? "bg-[#1A6FD4] border-[#1A6FD4] text-white shadow-xs" 
                    : "bg-white/40 border-white/60 text-[#042C53]/80 hover:bg-white/60"
                }`}
              >
                {lvl.label}
              </button>
            ))}
          </div>
        </div>

        {/* Console actions */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            id="logs-clear-btn"
            onClick={handleClearTrigger}
            className="border border-red-300/40 hover:bg-red-200/50 bg-red-100/40 text-red-750 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Trash2 className="h-4 w-4 text-red-600" /> Clear Logs
          </button>
        </div>
      </div>

      {/* Main Terminal Shell console widget */}
      <div className="bg-[#042C53]/95 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg p-5 overflow-hidden flex flex-col justify-between min-h-[500px]">
        {/* Terminal Header Info */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4 text-white/70 font-mono text-[11px] font-bold">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 block"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 block"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 block"></span>
            </div>
            <span className="text-white/20">|</span>
            <span className="flex items-center gap-1"><Terminal className="h-3.5 w-3.5 text-blue-400" /> AutoAISearch Core-Node STDOUT</span>
          </div>
          <div className="flex items-center gap-3 text-white/50">
            <span className="font-mono">HOST: CLOUD-CONTAINER-0</span>
            <span className="flex items-center gap-1 text-green-400 font-extrabold"><span className="h-1.5 w-1.5 bg-green-400 rounded-full animate-pulse inline-block"></span> TERMINAL ACTIVE</span>
          </div>
        </div>

        {/* Real-time scrolling stdout log streams */}
        <div className="grow overflow-y-auto max-h-[420px] font-mono text-xs space-y-2 pr-1 select-text scrollbar-thin">
          {filteredLogs.length === 0 ? (
            <div className="text-white/50 py-24 text-center">
              <CheckSquare className="h-10 w-10 text-white/30 mx-auto mb-2" />
              <p className="font-semibold text-white/70">No matching log traces identified.</p>
              <p className="text-[11px] text-white/50 mt-1">Change levels or launch manual scanning.</p>
            </div>
          ) : (
            filteredLogs.map((log) => {
              // Extract hours text block
              const localTime = new Date(log.timestamp).toLocaleTimeString();
              const levelColor = log.level === "success" ? "text-green-400" : log.level === "error" ? "text-red-400 font-bold" : "text-sky-305 font-bold";
              const levelLabel = log.level.toUpperCase();
              
              return (
                <div key={log.id} className="leading-relaxed hover:bg-white/10 p-1.5 rounded-sm flex items-start gap-3 border-l-2 border-transparent hover:border-[#1A6FD4] transition-all">
                  <span className="text-white/40 shrink-0 font-medium select-none">[{localTime}]</span>
                  <span className={`${levelColor} shrink-0 uppercase tracking-wider font-extrabold text-[10px]`}>[{levelLabel}]</span>
                  <p className="text-white/90 font-medium">{log.message}</p>
                </div>
              );
            })
          )}
          <div ref={terminalEndRef}></div>
        </div>

        {/* Console actions base warnings */}
        <div className="border-t border-white/10 pt-4 mt-4 flex justify-between items-center text-white/50 font-mono text-[10px] uppercase font-bold tracking-wider">
          <span className="flex items-center gap-1.5 text-[11px] text-[#E6F1FB]"><Shield className="h-4 w-4 text-[#1A6FD4]" /> SECURE TRACE CONTEXT • COMPLIABILITY PROTOCOL IN FORCE</span>
          <span>Buffer: {filteredLogs.length} items logged currently</span>
        </div>
      </div>

    </div>
  );
}
