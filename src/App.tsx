import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import AgentSettings from "./components/AgentSettings";
import ApplicationsTracker from "./components/ApplicationsTracker";
import AgentLogs from "./components/AgentLogs";
import { UserSettings, Application, LogEntry, AgentStatus } from "./types";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

interface Toast {
  id: string;
  message: string;
  type: "success" | "info" | "error";
}

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>("dashboard");
  const [loading, setLoading] = useState<boolean>(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // State maps
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [agentStatus, setAgentStatus] = useState<AgentStatus | null>(null);

  // Focus selection state for dashboard cross-communication click tracing
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  // Hydrate initial state
  const fetchState = async () => {
    try {
      const res = await fetch("/api/data");
      if (res.ok) {
        const db = await res.json();
        setSettings(db.settings);
        setApplications(db.applications);
        setLogs(db.logs);
        setAgentStatus(db.agentStatus);
      } else {
        addToast("Error contacting backend database endpoints.", "error");
      }
    } catch {
      addToast("Server offline. Booting simulated sandbox backup.", "info");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchState();
  }, []);

  // Dismiss Toast helper
  const addToast = (message: string, type: "success" | "info" | "error" = "info") => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Toggle active crawler loops on server
  const handleToggleAgent = async () => {
    try {
      const res = await fetch("/api/agent/toggle", { method: "POST" });
      if (res.ok) {
        const body = await res.json();
        if (body.success) {
          setAgentStatus(body.agentStatus);
          addToast(body.agentStatus.active ? "Agent searching loops initiated!" : "Scheduled search timers stopped.", "success");
          fetchState(); // Hydrate refreshed logs
        }
      }
    } catch {
      addToast("Unable to control agent background timers.", "error");
    }
  };

  // Run instant search
  const handleRunNow = async () => {
    try {
      const res = await fetch("/api/agent/run-now", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          await fetchState(); // Hydrate matching applied rows & logs
          return data;
        } else {
          addToast(data.error || "Problem executing scanner parameters.", "error");
        }
      }
    } catch (err) {
      addToast("Error dispatching manual agent queries.", "error");
    }
    return { success: false, processed: 0 };
  };

  // Save Settings
  const handleSaveSettings = async (nextSettings: UserSettings) => {
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextSettings),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSettings(data.settings);
          await fetchState();
          return true;
        }
      }
    } catch {
      addToast("Failed updating config elements on server.", "error");
    }
    return false;
  };

  // Update platform credentials
  const handleSaveCredentials = async (platform: string, user: string, secret: string) => {
    try {
      const res = await fetch("/api/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, username: user, password: secret }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          await fetchState();
          return true;
        }
      }
    } catch {
      addToast("Credential registry endpoint failed.", "error");
    }
    return false;
  };

  // Create or Update Application
  const handleUpdateApplication = async (app: Application) => {
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(app),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          await fetchState();
          return true;
        }
      }
    } catch {
      addToast("Problem filing tracker records.", "error");
    }
    return false;
  };

  // Delete Application
  const handleDeleteApplication = async (id: string) => {
    try {
      const res = await fetch(`/api/applications/${id}`, { method: "DELETE" });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          await fetchState();
          return true;
        }
      }
    } catch {
      addToast("Failed removing application track record.", "error");
    }
    return false;
  };

  // Generate specialized customized manuals Cover letter using Gemini
  const handleSynthesizeLetterManual = async (title: string, company: string, notePrompt: string) => {
    try {
      const res = await fetch("/api/cover-letter/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, company, description: notePrompt }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.coverLetter || "";
      }
    } catch (err) {
      addToast("Gemini synthesis backend failed.", "error");
    }
    return "";
  };

  // Clear Logs
  const handleClearLogs = async () => {
    try {
      const res = await fetch("/api/logs/clear", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          await fetchState();
          return true;
        }
      }
    } catch {
      addToast("Error clearing logs storage.", "error");
    }
    return false;
  };

  // Generate Prompt template instructions
  const handleGenerateTemplatePromptInstructions = async (resumeText: string) => {
    try {
      const res = await fetch("/api/cover-letter/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Prompt Draft Expert",
          company: "AutoAISearch Core Settings",
          description: `Analyze my resume and write a concise, custom prompt instruction setup that highlights what I do best. Resume details: ${resumeText}`
        })
      });
      if (res.ok) {
        const data = await res.json();
        return data.coverLetter || "";
      }
    } catch {
      addToast("Unable to communicate with prompt helper.", "error");
    }
    return "Highlight my core competencies and structure with high professionalism.";
  };

  if (loading || !settings || !agentStatus) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-50 font-sans">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent shadow-xs"></div>
          <p className="text-sm font-semibold text-slate-600">Initializing AutoAISearch System Services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans text-slate-800 antialiased pb-12">
      {/* Navigation bar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        status={agentStatus}
        onToggleAgent={handleToggleAgent}
      />

      {/* Primary body component viewport */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8 grow">
        {currentTab === "dashboard" && (
          <Dashboard
            status={agentStatus}
            applications={applications}
            logs={logs}
            settings={settings}
            onToggleAgent={handleToggleAgent}
            onRunNow={handleRunNow}
            onAddToast={addToast}
            setCurrentTab={setCurrentTab}
            onSelectApplication={(app) => {
              setSelectedApp(app);
              setCurrentTab("tracker");
            }}
          />
        )}

        {currentTab === "settings" && (
          <AgentSettings
            settings={settings}
            onSaveSettings={handleSaveSettings}
            onSaveCredentials={handleSaveCredentials}
            onAddToast={addToast}
            onGenerateCoverLetterTemplate={handleGenerateTemplatePromptInstructions}
          />
        )}

        {currentTab === "tracker" && (
          <ApplicationsTracker
            applications={applications}
            settings={settings}
            onUpdateApplication={handleUpdateApplication}
            onDeleteApplication={handleDeleteApplication}
            onAddToast={addToast}
            onSynthesizeManualLetter={handleSynthesizeLetterManual}
            selectedAppFromDashboard={selectedApp}
            clearDashboardSelection={() => setSelectedApp(null)}
          />
        )}

        {currentTab === "logs" && (
          <AgentLogs
            logs={logs}
            onClearLogs={handleClearLogs}
            onAddToast={addToast}
          />
        )}
      </main>

      {/* Floating dynamic toast alert notifications portal */}
      <div id="toast-portal" className="fixed bottom-6 right-6 z-55 space-y-3.5 max-w-sm w-full pointer-events-none md:max-w-md">
        {toasts.map((toast) => {
          const ToastIcon = toast.type === "success" ? CheckCircle2 : toast.type === "error" ? AlertCircle : Info;
          const statusBg = toast.type === "success" ? "bg-green-50 border-green-200 text-green-800" :
                           toast.type === "error" ? "bg-red-50 border-red-200 text-red-800" : "bg-blue-50 border-blue-200 text-blue-800";
          return (
            <div
              key={toast.id}
              className={`p-4 border-2 rounded-2xl flex items-start gap-3 shadow-xl transition-all duration-300 transform translate-y-0 scale-100 opacity-100 pointer-events-auto ${statusBg}`}
            >
              <ToastIcon className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="grow">
                <p className="text-xs font-bold leading-normal leading-tight font-sans select-none">{toast.message}</p>
              </div>
              <button
                type="button"
                onClick={() => handleDismissToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
