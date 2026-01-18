
export type View =
  | 'interviewee'
  | 'dashboard'
  | 'analytics'
  | 'settings';

export type Role = 'system' | 'interviewer' | 'interviewee' | 'ai-feedback';

export type QuestionDifficulty = 'Easy' | 'Medium' | 'Hard';

export type QuestionSource = 'Resume Only' | 'Topics Only' | 'Resume & Topics';

export interface Question {
  id: string;
  text: string;
  difficulty: QuestionDifficulty;
  isFollowUp: boolean;
  followUpFor?: string; // id of the main question
}

export interface Answer {
  questionId: string;
  text: string;
  timestamp: number;
  score?: number;
  feedback?: string;
}
export interface RankedSkill {
  name: string;
  confidence: number;
  level: 'Primary' | 'Secondary' | 'Basic';
}
export interface Candidate {
  id: string;
  profile: CandidateProfile;
  interviewSettings: InterviewSettings;
  interviewStatus: 'not-started' | 'in-progress' | 'completed';
  questions: Question[];
  answers: Answer[];
  currentQuestionIndex: number;
  currentQuestionStartTime: number | null;
  finalScore: number | null;
  finalFeedback: string | null;
  consecutiveNoAnswers: number;
  createdAt: number;
}

export interface CandidateProfile {
  name: string;
  email: string;
  phone: string;
  resumeText: string;
  photo: string | null;
  skills: string[]| RankedSkill[];
  yearsOfExperience?: number;
  keyProjects?: { title: string; description: string }[];
  technologies?: string[];
}

export interface InterviewSettings {
  topics: string[];
  difficultyDistribution: {
    easy: number;
    medium: number;
    hard: number;
  };
  timeLimits: {
    easy: number;
    medium: number;
    hard: number;
  };
  questionSource: QuestionSource;
}
