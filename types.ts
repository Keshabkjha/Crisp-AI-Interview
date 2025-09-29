export type Role = 'interviewer' | 'interviewee' | 'system';

export interface Message {
  id: string;
  text: string;
  sender: Role;
  timestamp: number;
}

export interface InterviewState {
  status: 'idle' | 'setting-up' | 'in-progress' | 'finished';
  intervieweeName: string;
  jobDescription: string;
  resumeText: string;
  questions: string[];
  currentQuestionIndex: number;
  chatHistory: Message[];
  feedback: string;
  analysis: Record<string, any>; // For future analytics features
}

export interface ResumeData {
  name: string;
  summary: string;
  experience: {
    title: string;
    company: string;
    duration: string;
    responsibilities: string[];
  }[];
  education: {
    degree: string;
    school: string;
    year: string;
  }[];
  skills: string[];
}
