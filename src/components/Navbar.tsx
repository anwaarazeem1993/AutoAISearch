import React from "react";
import { Briefcase, Settings, FileText, Terminal, Activity, ToggleLeft, ToggleRight, Sparkles } from "lucide-react";
import { AgentStatus } from "../types";

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  status: AgentStatus;
  onToggleAgent: () => void;
}

export default function Navbar({ currentTab, setCurrentTab, status, onToggleAgent }: NavbarProps) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Activity },
    { id: "settings", label: "Agent Settings", icon: Settings },
    { id: "tracker", label: "Applications", icon: Briefcase },
    { id: "logs", label: "Agent Logs", icon: Terminal },
  ];

  return (
    <header id="app-header" className="sticky top-0 z-50 w-full bg-white/40 backdrop-blur-xl border-b border-white/40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab("dashboard")}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1A6FD4] text-white shadow-lg shadow-[#1A6FD4]/20">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <span className="font-sans font-bold text-xl tracking-tight text-[#042C53]">
                Auto<span className="text-[#1A6FD4]">AI</span>Search
              </span>
              <span className="block text-[10px] font-mono tracking-wider text-[#1A6FD4] uppercase font-bold">Job Agent Hub</span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center space-x-2" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                    isActive
                      ? "bg-white/60 text-[#1A6FD4] border-[#1A6FD4]/20 shadow-xs"
                      : "text-[#042C53]/60 hover:text-[#042C53] hover:bg-white/30 border-transparent"
                  }`}
                >
                  <Icon className={`h-4.5 w-4.5 ${isActive ? "text-[#1A6FD4]" : "text-[#042C53]/40 group-hover:text-[#1A6FD4]"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick Stats / Active Toggle */}
          <div className="flex items-center space-x-4">
            {/* Status Pill */}
            <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-md border border-white/80 px-3 py-1.5 rounded-full shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status.active ? "bg-green-400" : "bg-amber-400"}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${status.active ? "bg-green-500" : "bg-amber-500"}`}></span>
              </span>
              <span className="text-xs font-bold text-[#042C53]">
                {status.active ? "Agent Active" : "Agent Paused"}
              </span>
            </div>

            {/* Quick Switch */}
            <button
              id="header-toggle-agent-btn"
              onClick={onToggleAgent}
              title={status.active ? "Pause Agent" : "Activate Agent"}
              className={`p-1.5 rounded-xl transition-transform hover:scale-105 duration-200 bg-white/40 border border-white/60 shadow-xs ${
                status.active ? "text-[#1A6FD4]" : "text-[#042C53]/40"
              }`}
            >
              {status.active ? (
                <ToggleRight className="h-8 w-8 text-[#1A6FD4]" />
              ) : (
                <ToggleLeft className="h-8 w-8 text-[#042C53]/40" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav indicator bar */}
      <div className="md:hidden flex space-x-1 px-4 py-2 bg-white/45 backdrop-blur-md border-t border-white/40 items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex flex-col items-center p-2 rounded-lg text-[10px] font-bold tracking-wide transition-colors ${
                isActive ? "text-[#1A6FD4]" : "text-[#042C53]/60"
              }`}
            >
              <Icon className="h-4.5 w-4.5 mb-1" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
