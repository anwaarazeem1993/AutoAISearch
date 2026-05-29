import React, { useState } from "react";
import { 
  Search, Eye, Edit2, Trash2, Download, Filter, 
  ExternalLink, Sparkles, X, CheckSquare, Plus, Check, ArrowRight, Bot, ShieldCheck, FileText, Send, User, RotateCcw
} from "lucide-react";
import { Application, UserSettings } from "../types";

interface ApplicationsTrackerProps {
  applications: Application[];
  settings: UserSettings;
  onUpdateApplication: (app: Application) => Promise<boolean>;
  onDeleteApplication: (id: string) => Promise<boolean>;
  onAddToast: (msg: string, type: "success" | "info" | "error") => void;
  onSynthesizeManualLetter: (title: string, company: string, notePrompt: string) => Promise<string>;
  selectedAppFromDashboard: Application | null;
  clearDashboardSelection: () => void;
}

export default function ApplicationsTracker({
  applications,
  settings,
  onUpdateApplication,
  onDeleteApplication,
  onAddToast,
  onSynthesizeManualLetter,
  selectedAppFromDashboard,
  clearDashboardSelection
}: ApplicationsTrackerProps) {
  
  // Search and filters
  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Manual creator form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newPlatform, setNewPlatform] = useState<any>("linkedin");
  const [newLocation, setNewLocation] = useState("");
  const [newSalary, setNewSalary] = useState("");
  const [newJobType, setNewJobType] = useState("Full-time");
  const [newUrl, setNewUrl] = useState("");
  const [newNotes, setNewNotes] = useState("");

  // Inspect or Edit Application details Modal
  const [activeDetailsApp, setActiveDetailsApp] = useState<Application | null>(selectedAppFromDashboard);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editNotesText, setEditNotesText] = useState("");
  const [editStatusValue, setEditStatusValue] = useState<any>("");

  // Cover Letter generation modal action
  const [isSynthesizingLetter, setIsSynthesizingLetter] = useState(false);
  const [customLetterInstructions, setCustomLetterInstructions] = useState("");

  // Semi-Auto Verification submitting visual trace state
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [submittingApp, setSubmittingApp] = useState<Application | null>(null);
  const [isSubmittingTrace, setIsSubmittingTrace] = useState(false);
  const [submissionTraceStep, setSubmissionTraceStep] = useState(0);

  // Form profile model details mock for semi-auto prefill
  const [candidateProfileForm, setCandidateProfileForm] = useState({
    firstName: "Anwaar",
    lastName: "Azeem",
    email: "anwaarazeem1993@gmail.com",
    phone: "+44 7700 900077",
    portfolioUrl: "https://anwaarazeem.com",
    linkedinUrl: "https://linkedin.com/in/anwaarazeem"
  });

  const traceSteps = [
    "Establishing secure remote session...",
    "Injecting verified candidate inputs and profile fields...",
    "Inserting custom cover letter contents correctly...",
    "Solving inline puzzle CAPTCHA elements with security protocols...",
    "Confirming final layout matching & submitting to platform gateway..."
  ];

  // Export to CSV helper trigger
  const handleExportCSV = () => {
    try {
      window.open("/api/applications/export", "_blank");
      onAddToast("Export complete. CSV downloading.", "success");
    } catch {
      onAddToast("Unable to trigger download.", "error");
    }
  };

  // Add position handler
  const handleCreatePosition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newCompany) {
      onAddToast("Job Title and Company are required.", "error");
      return;
    }

    const payload: Application = {
      id: `app_${Date.now()}`,
      title: newTitle,
      company: newCompany,
      platform: newPlatform,
      dateApplied: new Date().toISOString(),
      status: "Applied",
      url: newUrl,
      location: newLocation || "Remote",
      salary: newSalary,
      jobType: newJobType,
      coverLetter: "",
      notes: newNotes
    };

    const success = await onUpdateApplication(payload);
    if (success) {
      onAddToast(`Position added successfully: "${newTitle}" at "${newCompany}"`, "success");
      setShowAddModal(false);
      // Clean inputs
      setNewTitle("");
      setNewCompany("");
      setNewLocation("");
      setNewSalary("");
      setNewUrl("");
      setNewNotes("");
    } else {
      onAddToast("Failing to update application database.", "error");
    }
  };

  // Update status immediately from table list
  const handleStatusInlineChange = async (app: Application, nextStatus: any) => {
    const updated = { ...app, status: nextStatus };
    const success = await onUpdateApplication(updated);
    if (success) {
      onAddToast(`Updated "${app.title}" status to: ${nextStatus}`, "success");
    }
  };

  // Trigger delete Application
  const handleDeleteApplicationClick = async (id: string) => {
    if (confirm("Are you sure you want to remove this application record?")) {
      const success = await onDeleteApplication(id);
      if (success) {
        onAddToast("Application record deleted successfully.", "success");
        if (activeDetailsApp?.id === id) {
          setActiveDetailsApp(null);
        }
      }
    }
  };

  // Trigger Gemini cover letter draft simulation
  const handleSynthesizeAILetter = async () => {
    if (!activeDetailsApp) return;
    setIsSynthesizingLetter(true);
    onAddToast("Synthesizing custom cover letter with Gemini...", "info");
    try {
      const text = await onSynthesizeManualLetter(
        activeDetailsApp.title,
        activeDetailsApp.company,
        customLetterInstructions || "Generate professional short template."
      );
      const updated = { ...activeDetailsApp, coverLetter: text };
      const success = await onUpdateApplication(updated);
      if (success) {
        setActiveDetailsApp(updated);
        onAddToast("Custom Cover Letter generated and saved!", "success");
        setCustomLetterInstructions("");
      }
    } catch {
      onAddToast("Failed to connect to cover letter generator.", "error");
    } finally {
      setIsSynthesizingLetter(false);
    }
  };

  // Update notes
  const handleSaveNotes = async () => {
    if (!activeDetailsApp) return;
    const updated = { ...activeDetailsApp, notes: editNotesText };
    const success = await onUpdateApplication(updated);
    if (success) {
      setActiveDetailsApp(updated);
      setIsEditingNotes(false);
      onAddToast("Notes saved successfully.", "success");
    }
  };

  // Trigger modal launch for Semi-Auto submission
  const launchSemiAutoSubmission = (app: Application) => {
    setSubmittingApp(app);
    setShowSubmissionModal(true);
    setIsSubmittingTrace(false);
    setSubmissionTraceStep(0);
  };

  // Execute Submission Automation simulation
  const executeSemiAutoSubmissionFlow = () => {
    if (isSubmittingTrace || !submittingApp) return;
    setIsSubmittingTrace(true);
    setSubmissionTraceStep(0);
    onAddToast("Launching submission trace logs...", "info");

    const timer = setInterval(() => {
      setSubmissionTraceStep((prev) => {
        if (prev >= traceSteps.length - 1) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 1100);

    // After animation steps, submit to API
    setTimeout(async () => {
      clearInterval(timer);
      
      // Update status to Applied on server
      const updated: Application = {
        ...submittingApp,
        status: "Applied",
        dateApplied: new Date().toISOString(),
        notes: `Simulated browser automation filed successfully via credentials profile on ${new Date().toLocaleDateString()}. Cover Letter attached.`
      };

      const success = await onUpdateApplication(updated);
      setIsSubmittingTrace(false);
      setShowSubmissionModal(false);

      if (success) {
        onAddToast(`🚀 Position applied successfully! Saved to Tracker.`, "success");
        // Update local detail inspect drawer if looking at it
        if (activeDetailsApp?.id === submittingApp.id) {
          setActiveDetailsApp(updated);
        }
        setSubmittingApp(null);
      } else {
        onAddToast("Problem saving submission records to database.", "error");
      }
    }, 1100 * traceSteps.length + 500);
  };

  // Filter positions
  const filteredApps = applications.filter((app) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = app.title.toLowerCase().includes(term) || app.company.toLowerCase().includes(term);
    const matchesPlatform = platformFilter === "all" || app.platform === platformFilter;
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    return matchesSearch && matchesPlatform && matchesStatus;
  });

  // Highlight classes for badges
  const getBadgeClasses = (status: string) => {
    switch (status) {
      case "Applied":
        return "bg-sky-100/70 border-sky-300/60 text-sky-850 font-extrabold";
      case "In Review":
        return "bg-amber-100/70 border-amber-300/60 text-amber-850 font-extrabold";
      case "Interview":
        return "bg-green-100/70 border-green-300/60 text-green-855 font-extrabold";
      case "Rejected":
        return "bg-red-100/70 border-red-300/60 text-red-850 font-extrabold";
      default:
        return "bg-white/40 border-white/60 text-[#042C53]/70 font-bold";
    }
  };

  return (
    <div id="tracker-tab" className="space-y-6 animate-fade-in relative text-[#042C53]">
      
      {/* Top Filter Actions Bar */}
      <div className="bg-white/40 backdrop-blur-md p-5 rounded-2xl border border-white/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3 grow max-w-3xl">
          {/* Search text box */}
          <div className="relative grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#042C53]/45 h-4.5 w-4.5" />
            <input
              type="text"
              placeholder="Search by Job title or Company name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-white/60 focus:border-[#1A6FD4] focus:ring-1 focus:ring-[#1A6FD4] rounded-xl pl-10 pr-4 py-2 text-sm outline-hidden text-[#042C53] bg-white/45 placeholder-[#042C53]/40 font-bold"
            />
          </div>

          <div className="flex gap-3">
            {/* Platforms drop filter */}
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="border border-white/60 rounded-xl px-3 py-2 text-xs outline-hidden text-[#042C53] font-bold bg-white/45"
            >
              <option value="all">Platforms: All</option>
              <option value="linkedin">LinkedIn</option>
              <option value="indeed">Indeed</option>
              <option value="bayt">Bayt</option>
              <option value="naukrigulf">NaukriGulf</option>
              <option value="other">Other</option>
            </select>

            {/* Status Drop Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-white/60 rounded-xl px-3 py-2 text-xs outline-hidden text-[#042C53] font-bold bg-white/45"
            >
              <option value="all">Statuses: All</option>
              <option value="In Review">Surfaced Inbox (Review)</option>
              <option value="Applied">Applied (Active)</option>
              <option value="Interview">Interviews Booked</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Create/Export Actions Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            id="tracker-export-csv-btn"
            onClick={handleExportCSV}
            className="border border-white/60 hover:bg-white/60 text-[#042C53]/80 px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 bg-white/40 transition-all cursor-pointer shadow-xs"
          >
            <Download className="h-4 w-4 text-[#1A6FD4]" /> Export CSV
          </button>
          
          <button
            id="tracker-add-position-btn"
            onClick={() => setShowAddModal(true)}
            className="bg-[#1A6FD4] hover:bg-[#1A6FD4]/90 text-white px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-[#1A6FD4]/20 cursor-pointer transition-all"
          >
            <Plus className="h-4 w-4" /> Add Position
          </button>
        </div>
      </div>

      {/* Main Grid: Data list and Inspect Drawer split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Table data col span 2 */}
        <div className="lg:col-span-2 bg-white/40 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans">
              <thead>
                <tr className="border-b border-white/30 bg-white/20 text-[#042C53]/60 text-[10px] font-extrabold uppercase tracking-wider">
                  <th className="py-4 px-5">Job & Company</th>
                  <th className="py-4 px-3">Platform</th>
                  <th className="py-4 px-3">Date Applied</th>
                  <th className="py-4 px-3">Status</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20 text-[#042C53] text-sm">
                {filteredApps.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-[#042C53]/60">
                      <Bot className="h-12 w-12 text-[#1A6FD4]/40 mx-auto mb-3" />
                      <p className="font-extrabold">No application trace found.</p>
                      <p className="text-xs mt-1">Adjust search parameters or launch a manual job search agent scan!</p>
                    </td>
                  </tr>
                ) : (
                  filteredApps.map((app) => (
                    <tr 
                      key={app.id} 
                      className={`hover:bg-white/50 transition-all ${
                        activeDetailsApp?.id === app.id ? "bg-white/60" : ""
                      }`}
                    >
                      <td className="py-4 px-5 cursor-pointer" onClick={() => {
                        setActiveDetailsApp(app);
                        setEditNotesText(app.notes || "");
                        setEditStatusValue(app.status);
                        setIsEditingNotes(false);
                      }}>
                        <div className="font-extrabold text-[#042C53] leading-snug hover:text-[#1A6FD4] transition-colors">{app.title}</div>
                        <div className="text-xs text-[#042C53]/60 font-bold mt-0.5">{app.company} • {app.location}</div>
                      </td>
                      
                      <td className="py-4 px-3">
                        <span className="font-mono text-xs font-extrabold text-[#042C53]/80 uppercase">{app.platform}</span>
                      </td>

                      <td className="py-4 px-3 font-mono text-xs text-[#042C53]/70 font-semibold">
                        {new Date(app.dateApplied).toLocaleDateString()}
                      </td>

                      <td className="py-4 px-3">
                        <span className={`inline-flex border text-[11px] px-2.5 py-1 rounded-full ${getBadgeClasses(app.status)}`}>
                          {app.status}
                        </span>
                      </td>

                      <td className="py-4 px-5 text-right text-xs">
                        <div className="flex items-center justify-end space-x-2">
                          {/* Special Submit action for In Review jobs */}
                          {app.status === "In Review" ? (
                            <button
                              type="button"
                              onClick={() => launchSemiAutoSubmission(app)}
                              className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold py-1.5 px-3 rounded-lg text-[11px] flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
                            >
                              <Sparkles className="h-3 w-3" /> Review & Apply
                            </button>
                          ) : (
                            <select
                              value={app.status}
                              onChange={(e) => handleStatusInlineChange(app, e.target.value)}
                              className="border border-white/60 text-[#1A6FD4] hover:bg-white/70 rounded-lg p-1 text-[11px] font-extrabold outline-hidden bg-white/60"
                            >
                              <option value="Applied">Applied</option>
                              <option value="In Review">In Review</option>
                              <option value="Interview">Interview</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setActiveDetailsApp(app);
                              setEditNotesText(app.notes || "");
                              setEditStatusValue(app.status);
                              setIsEditingNotes(false);
                            }}
                            className="p-1 text-[#042C53]/60 hover:text-[#042C53] cursor-pointer"
                            title="Inspect application details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteApplicationClick(app.id)}
                            className="p-1 text-[#042C53]/60 hover:text-red-600 cursor-pointer"
                            title="Delete Position record"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inspect/Edit Application Detail Drawer (Right panel) */}
        <div className="bg-white/40 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm p-6 space-y-6 text-[#042C53]">
          {activeDetailsApp ? (
            <div className="space-y-5 animate-fade-in">
              {/* Header block info */}
              <div className="flex justify-between items-start border-b border-white/40 pb-4">
                <div>
                  <h3 className="font-extrabold text-[#042C53] text-lg leading-snug">{activeDetailsApp.title}</h3>
                  <p className="text-sm font-extrabold text-[#1A6FD4] mt-1">{activeDetailsApp.company}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveDetailsApp(null);
                    clearDashboardSelection();
                  }}
                  className="text-[#042C53]/50 hover:text-[#042C53] cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Position metadata stats */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white/35 border border-white/40 rounded-xl">
                  <span className="text-[#042C53]/60 font-bold block uppercase tracking-wide text-[10px]">Portal Platform</span>
                  <span className="text-[#042C53] font-black block mt-0.5 uppercase">{activeDetailsApp.platform}</span>
                </div>
                <div className="p-3 bg-white/35 border border-white/40 rounded-xl">
                  <span className="text-[#042C53]/60 font-bold block uppercase tracking-wide text-[10px]">Location Type</span>
                  <span className="text-[#042C53] font-semibold block mt-0.5 truncate">{activeDetailsApp.location}</span>
                </div>
                {activeDetailsApp.salary && (
                  <div className="p-3 bg-white/35 border border-white/40 rounded-xl">
                    <span className="text-[#042C53]/60 font-bold block uppercase tracking-wide text-[10px]">Salary Offer</span>
                    <span className="text-[#042C53] font-semibold block mt-0.5">{activeDetailsApp.salary}</span>
                  </div>
                )}
                {activeDetailsApp.jobType && (
                  <div className="p-3 bg-white/35 border border-white/40 rounded-xl">
                    <span className="text-[#042C53]/60 font-bold block uppercase tracking-wide text-[10px]">Classification</span>
                    <span className="text-[#042C53] font-semibold block mt-0.5">{activeDetailsApp.jobType}</span>
                  </div>
                )}
              </div>

              {/* Status Updater */}
              <div className="p-4 border border-white/40 bg-white/20 rounded-xl">
                <label className="text-xs font-bold text-[#042C53]/70 uppercase block mb-1.5 font-bold">Application Status</label>
                <div className="flex items-center gap-2">
                  <select
                    value={activeDetailsApp.status}
                    onChange={(e) => handleStatusInlineChange(activeDetailsApp, e.target.value)}
                    className="grow border border-white/60 text-[#042C53] rounded-xl px-3 py-1.5 text-xs font-extrabold outline-hidden bg-white/60"
                  >
                    <option value="In Review">Surfaced / Review</option>
                    <option value="Applied">Applied (Active)</option>
                    <option value="Interview">Interview scheduled</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                  {activeDetailsApp.url && (
                    <a
                      href={activeDetailsApp.url}
                      target="_blank"
                      referrerPolicy="no-referrer"
                      className="bg-white/40 hover:bg-white/60 border border-white/60 hover:border-[#1A6FD4] p-2 rounded-xl text-[#1A6FD4] transition-all"
                      title="Visit listing URL"
                    >
                      <ExternalLink className="h-4.5 w-4.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Interaction Notes */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-extrabold text-[#042C53]/60 uppercase tracking-wide">Activity Logs & Notes</span>
                  {!isEditingNotes ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingNotes(true);
                        setEditNotesText(activeDetailsApp.notes || "");
                      }}
                      className="text-xs text-[#1A6FD4] hover:text-[#1A6FD4]/80 font-extrabold cursor-pointer"
                    >
                      Edit Notes
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleSaveNotes}
                        className="text-xs text-green-700 font-extrabold cursor-pointer"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingNotes(false)}
                        className="text-xs text-[#042C53]/60 cursor-pointer"
                      >
                        Discard
                      </button>
                    </div>
                  )}
                </div>

                {!isEditingNotes ? (
                  <p className="text-xs text-[#042C53] italic bg-white/30 p-3 rounded-xl border border-white/40 leading-relaxed max-h-36 overflow-y-auto font-semibold">
                    {activeDetailsApp.notes || "No candidate logs inputted. Add custom notes here..."}
                  </p>
                ) : (
                  <textarea
                    rows={4}
                    value={editNotesText}
                    onChange={(e) => setEditNotesText(e.target.value)}
                    className="w-full text-xs text-[#042C53] border border-white/60 outline-hidden focus:border-[#1A6FD4] p-3 rounded-xl bg-white/30 font-bold"
                  />
                )}
              </div>

              {/* Cover Letter drafted area */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-extrabold text-[#042C53]/60 uppercase tracking-wide">Custom Cover Letter (AI Output)</span>
                </div>

                {activeDetailsApp.coverLetter ? (
                  <div className="p-4 bg-white/30 rounded-xl leading-relaxed text-xs text-[#042C53] border border-white/40 max-h-56 overflow-y-auto whitespace-pre-line font-bold">
                    {activeDetailsApp.coverLetter}
                  </div>
                ) : (
                  <div className="p-5 border border-dashed border-white/40 rounded-xl text-center text-[#042C53]/50 text-xs font-bold">
                    No custom cover letter generated yet.
                  </div>
                )}

                {/* Gemini letter generator prompt */}
                <div className="p-3.5 bg-[#1A6FD4]/10 rounded-xl border border-[#1A6FD4]/20 space-y-2">
                  <span className="text-[10px] font-extrabold text-[#1A6FD4] uppercase block">Draft specialized letter with Gemini</span>
                  <div className="flex gap-2 mt-1.5">
                    <input
                      type="text"
                      placeholder="e.g. emphasize my typescript skills..."
                      value={customLetterInstructions}
                      onChange={(e) => setCustomLetterInstructions(e.target.value)}
                      className="grow text-xs border border-white/60 rounded-xl p-2.5 outline-hidden text-[#042C53] bg-white/50 shadow-xs focus:ring-1 focus:ring-[#1A6FD4] focus:border-[#1A6FD4] font-bold"
                    />
                    <button
                      type="button"
                      disabled={isSynthesizingLetter}
                      onClick={handleSynthesizeAILetter}
                      className="text-white bg-[#1A6FD4] hover:bg-[#1A6FD4]/90 font-extrabold px-3 rounded-xl text-xs shrink-0 flex items-center justify-center cursor-pointer transition-all"
                    >
                      {isSynthesizingLetter ? "Working..." : "Draft"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-[#042C53]/50">
              <Plus className="h-8 w-8 text-[#1A6FD4]/30 mx-auto mb-2" />
              <p className="text-sm font-extrabold">Inspector Board</p>
              <p className="text-xs font-bold mt-1">Click any application to review full customized files, AI cover letters, and notes logs.</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: Manual position creator */}
      {showAddModal && (
        <div id="add-modal" className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white/85 backdrop-blur-xl rounded-2xl border border-white/80 shadow-2xl max-w-xl w-full p-6 animate-scale-in text-[#042C53]">
            <div className="flex justify-between items-center border-b border-white/40 pb-3.5 mb-4">
              <h3 className="font-extrabold text-[#042C53] text-lg">Add Job Tracker Position</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#042C53]/50 hover:text-[#042C53] cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePosition} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#042C53]/60 font-bold mb-1">Job Title *</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full border border-white/60 focus:border-[#1A6FD4] rounded-xl px-3 py-2 text-sm text-[#042C53] outline-hidden bg-white/40 focus:ring-1 focus:ring-[#1A6FD4] font-bold"
                    placeholder="e.g. Lead Frontend Developer"
                  />
                </div>
                <div>
                  <label className="block text-[#042C53]/60 font-bold mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    className="w-full border border-white/60 focus:border-[#1A6FD4] rounded-xl px-3 py-2 text-sm text-[#042C53] outline-hidden bg-white/40 focus:ring-1 focus:ring-[#1A6FD4] font-bold"
                    placeholder="e.g. Stripe Co."
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#042C53]/60 font-bold mb-1">Platform Portal</label>
                  <select
                    value={newPlatform}
                    onChange={(e) => setNewPlatform(e.target.value as any)}
                    className="w-full border border-white/60 rounded-xl px-3 py-2 text-[#042C53] outline-hidden bg-white/40 font-bold"
                  >
                    <option value="linkedin">LinkedIn</option>
                    <option value="indeed">Indeed</option>
                    <option value="bayt">Bayt</option>
                    <option value="naukrigulf">NaukriGulf</option>
                    <option value="other">Other/Direct</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#042C53]/60 font-bold mb-1">Location</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full border border-white/60 focus:border-[#1A6FD4] rounded-xl px-3 py-2 text-[#042C53] outline-hidden bg-white/40 focus:ring-1 focus:ring-[#1A6FD4] font-bold"
                    placeholder="e.g. Remote UK"
                  />
                </div>
                <div>
                  <label className="block text-[#042C53]/60 font-bold mb-1">Classification Type</label>
                  <select
                    value={newJobType}
                    onChange={(e) => setNewJobType(e.target.value)}
                    className="w-full border border-white/60 rounded-xl px-3 py-2 text-[#042C53] outline-hidden bg-white/40 font-bold"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Remote">Remote</option>
                    <option value="Contract">Contract</option>
                    <option value="Part-time">Part-time</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#042C53]/60 font-bold mb-1">Estimated Salary</label>
                  <input
                    type="text"
                    value={newSalary}
                    onChange={(e) => setNewSalary(e.target.value)}
                    className="w-full border border-white/60 focus:border-[#1A6FD4] rounded-xl px-3 py-2 text-[#042C53] outline-hidden bg-white/40 focus:ring-1 focus:ring-[#1A6FD4] font-bold"
                    placeholder="e.g. £85,000 /yr"
                  />
                </div>
                <div>
                  <label className="block text-[#042C53]/60 font-bold mb-1">Listing URL</label>
                  <input
                    type="url"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className="w-full border border-white/60 focus:border-[#1A6FD4] rounded-xl px-3 py-2 text-[#042C53] outline-hidden bg-white/40 focus:ring-1 focus:ring-[#1A6FD4] font-bold"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#042C53]/60 font-bold mb-1">Notes / Logs details</label>
                <textarea
                  rows={3}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full border border-white/60 focus:border-[#1A6FD4] rounded-xl p-3 text-[#042C53] bg-white/40 font-bold outline-hidden"
                  placeholder="Insert interviewer names, deadlines, custom details..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#1A6FD4] hover:bg-[#1A6FD4]/90 text-white font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-[#1A6FD4]/20"
              >
                Filing Record Tracker Application <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Semi-Auto Submission Verification assistance tool */}
      {showSubmissionModal && submittingApp && (
        <div id="submission-modal" className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/80 shadow-2xl max-w-2xl w-full overflow-hidden animate-scale-in text-[#042C53]">
            {/* Banner logo */}
            <div className="bg-linear-to-r from-[#1A6FD4] to-[#0052B2] p-6 text-white text-sans">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Bot className="h-6 w-6 text-white" />
                  <span className="font-mono text-xs font-bold bg-[#042C53]/30 px-2.5 py-0.5 rounded-full text-white tracking-wider">AI ASSIST CHECKOUT</span>
                </div>
                <button 
                  onClick={() => {
                    if (!isSubmittingTrace) setShowSubmissionModal(false);
                  }}
                  className="text-white/60 hover:text-white cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-3">
                <h3 className="font-extrabold text-xl leading-snug">{submittingApp.title}</h3>
                <p className="text-xs text-white/90 font-semibold mt-0.5">{submittingApp.company} • Verification Desk</p>
              </div>
            </div>

            {isSubmittingTrace ? (
              /* Active Submitting animation step tracker */
              <div className="p-8 text-center space-y-6">
                <div className="h-16 w-16 bg-white/40 text-[#1A6FD4] p-4 rounded-full border border-white flex items-center justify-center mx-auto animate-spin">
                  <RotateCcw className="h-8 w-8" />
                </div>
                <div>
                  <h4 className="font-mono text-sm font-extrabold text-[#1A6FD4] tracking-wider">EXECUTING AUTO-AUTHENTICATOR HANDLERS</h4>
                  <p className="text-sm font-semibold text-[#042C53] mt-2 italic leading-relaxed">
                    "{traceSteps[submissionTraceStep]}"
                  </p>
                </div>
                
                {/* Visual steps */}
                <div className="max-w-md mx-auto space-y-1.5 text-left font-mono text-[11px] border border-white/60 bg-white/30 p-4 rounded-xl">
                  {traceSteps.map((step, i) => (
                    <div key={i} className="flex gap-2.5 items-center">
                      <span className={`font-bold ${i < submissionTraceStep ? "text-green-600 font-extrabold" : i === submissionTraceStep ? "text-[#1A6FD4] animate-pulse" : "text-[#042C53]/30"}`}>
                        {i < submissionTraceStep ? "✓" : i === submissionTraceStep ? "▶" : "○"}
                      </span>
                      <span className={i <= submissionTraceStep ? "text-[#042C53] font-bold" : "text-[#042C53]/40"}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Verification prefill configurations dashboard */
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[75vh] overflow-y-auto">
                {/* Left col: prefill form */}
                <div className="space-y-4 text-xs">
                  <div className="border-b border-white/40 pb-2 mb-2 flex items-center gap-1.5 font-bold text-[#042C53]">
                    <User className="h-4.5 w-4.5 text-[#1A6FD4]" /> Profiler Form Prefills
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[#042C53]/60 font-bold block mb-1">First Name</label>
                      <input 
                        type="text" 
                        value={candidateProfileForm.firstName} 
                        onChange={(e) => setCandidateProfileForm({...candidateProfileForm, firstName: e.target.value})}
                        className="w-full border border-white/60 outline-hidden bg-white/40 p-2 rounded-lg text-[#042C53] font-bold focus:border-[#1A6FD4]" 
                      />
                    </div>
                    <div>
                      <label className="text-[#042C53]/60 font-bold block mb-1">Last Name</label>
                      <input 
                        type="text" 
                        value={candidateProfileForm.lastName} 
                        onChange={(e) => setCandidateProfileForm({...candidateProfileForm, lastName: e.target.value})}
                        className="w-full border border-white/60 outline-hidden bg-white/40 p-2 rounded-lg text-[#042C53] font-bold focus:border-[#1A6FD4]" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[#042C53]/60 font-bold block mb-1">Email</label>
                    <input 
                      type="email" 
                      value={candidateProfileForm.email} 
                      onChange={(e) => setCandidateProfileForm({...candidateProfileForm, email: e.target.value})}
                      className="w-full border border-white/60 outline-hidden bg-white/40 p-2 rounded-lg text-[#042C53] font-bold focus:border-[#1A6FD4]" 
                    />
                  </div>

                  <div>
                    <label className="text-[#042C53]/60 font-bold block mb-1">Phone</label>
                    <input 
                      type="text" 
                      value={candidateProfileForm.phone} 
                      onChange={(e) => setCandidateProfileForm({...candidateProfileForm, phone: e.target.value})}
                      className="w-full border border-white/60 outline-hidden bg-white/40 p-2 rounded-lg text-[#042C53] font-bold focus:border-[#1A6FD4]" 
                    />
                  </div>

                  <div>
                    <label className="text-[#042C53]/60 font-bold block mb-1">Portfolio Link</label>
                    <input 
                      type="url" 
                      value={candidateProfileForm.portfolioUrl} 
                      onChange={(e) => setCandidateProfileForm({...candidateProfileForm, portfolioUrl: e.target.value})}
                      className="w-full border border-white/60 outline-hidden bg-white/40 p-2 rounded-lg text-[#042C53] font-bold focus:border-[#1A6FD4]" 
                    />
                  </div>

                  <div className="bg-white/50 border border-white/70 p-3 rounded-xl flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-green-600 shrink-0" />
                    <div>
                      <span className="font-extrabold text-[#042C53] block">Encrypted Session Credentials</span>
                      <span className="text-[10px] text-[#042C53]/60 block font-bold mt-0.5">Signing in using secure password vault.</span>
                    </div>
                  </div>
                </div>

                {/* Right col: generated Letter inspection */}
                <div className="space-y-4 text-xs font-sans">
                  <div className="border-b border-white/40 pb-2 mb-2 flex items-center justify-between font-bold text-[#042C53]">
                    <span className="flex items-center gap-1.5"><FileText className="h-4.5 w-4.5 text-[#1A6FD4]" /> Customized Cover Letter</span>
                  </div>

                  <textarea
                    rows={12}
                    value={submittingApp.coverLetter || `Dear Recruiter,\n\nI am thrilled to apply for the ${submittingApp.title} position at ${submittingApp.company}.`}
                    onChange={(e) => setSubmittingApp({ ...submittingApp, coverLetter: e.target.value })}
                    className="w-full border border-white/60 outline-hidden focus:border-[#1A6FD4] p-3 rounded-xl bg-white/30 font-sans font-bold leading-relaxed text-[#042C53] whitespace-pre-line"
                  />

                  <button
                    type="button"
                    onClick={executeSemiAutoSubmissionFlow}
                    className="w-full bg-[#1A6FD4] hover:bg-[#1A6FD4]/90 text-white font-extrabold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#1A6FD4]/20 transition-all cursor-pointer"
                  >
                    <Send className="h-4.5 w-4.5" /> Launch Semi-Auto Dispatcher
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
