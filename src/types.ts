export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: "user" | "admin";
  plan: "free" | "pro";
  streakCount: number;
  lastActiveAt: string;
  createdAt: string;
}

export interface BookmarkRecord {
  id: string;
  userId: string;
  title: string;
  category: string;
  itemKey: string;
  createdAt: string;
}

export interface ProgressRecord {
  id: string;
  userId: string;
  category: string;
  activityName: string;
  score?: number;
  total?: number;
  completedAt: string;
}

export interface Formula {
  id: string;
  name: string;
  formula: string;
  meaning: string;
  category: "algebra" | "geometry" | "trigonometry";
  example: string;
  explanation: string;
}

export interface SolverStep {
  title: string;
  explanation: string;
  equation: string;
}

export interface SolverResult {
  problem: string;
  topic: string;
  steps: SolverStep[];
  finalAnswer: string;
  confidenceLevel: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  stepByStepHint: string;
  conceptExplanation: string;
}

export interface ChatTurn {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
}
