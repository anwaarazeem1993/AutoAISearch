export interface UserSettings {
  keywords: string[];
  platforms: {
    linkedin: { enabled: boolean; username: string };
    indeed: { enabled: boolean; username: string };
    bayt: { enabled: boolean; username: string };
    naukrigulf: { enabled: boolean; username: string };
  };
  filters: {
    location: string;
    country: string;
    jobType: string[]; // "Full-time" | "Remote" | "Contract" | "Part-time"
    experienceLevel: string[]; // "Entry" | "Mid-Level" | "Senior" | "Lead"
    salaryRange: [number, number];
  };
  scanFrequency: string; // "1h" | "2h" | "6h" | "24h"
  autoApply: boolean;
  maxApplicationsPerDay: number;
  coverLetterPrompt: string;
  resumeFileName?: string;
  resumeText?: string;
}

export interface Application {
  id: string;
  title: string;
  company: string;
  platform: 'linkedin' | 'indeed' | 'bayt' | 'naukrigulf' | 'other';
  dateApplied: string;
  status: 'Applied' | 'In Review' | 'Interview' | 'Rejected';
  url: string;
  location: string;
  salary?: string;
  jobType?: string;
  coverLetter?: string;
  notes?: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'success' | 'error';
  message: string;
}

export interface AgentStatus {
  active: boolean;
  lastRun?: string;
  nextRun?: string;
  totalAppliedToday: number;
  totalAppliedThisWeek: number;
}

export interface DatabaseSchema {
  settings: UserSettings;
  applications: Application[];
  logs: LogEntry[];
  agentStatus: AgentStatus;
}
