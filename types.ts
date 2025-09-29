export interface Message {
  sender: 'user' | 'bot' | 'system';
  text: string;
  timestamp: number;
}

export interface InterviewConfig {
  jobDescription: string;
  resumeText: string;
}

export interface Question {
  id: string;
  text: string;
}

export interface Analysis {
  clarity: number;
  relevance: number;
  sentiment: string;
  keyPoints: string[];
}
