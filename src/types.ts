export interface LogEntry {
  timestamp: Date;
  description: string;
  strudelCode: string;
  structuralNotes?: string;
}

export interface AgentState {
  isRunning: boolean;
  currentCode: string;
  prompt: string;
  logs: LogEntry[];
}

export interface AgentConfig {
  apiKey: string;
  model?: string;
  iterationDelay?: number;
}
