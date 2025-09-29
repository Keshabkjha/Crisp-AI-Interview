export interface Message {
  sender: 'user' | 'bot' | 'system';
  text: string;
  timestamp: number;
}

export interface InterviewConfig {
  jobDescription: string;
  resumeText: string;
}

// FIX: Added QuestionSource enum
export enum QuestionSource {
    RESUME = 'RESUME',
    TOPICS = 'TOPICS',
    BOTH = 'BOTH'
}

// FIX: Added InterviewSettings interface
export interface InterviewSettings {
    difficultyDistribution: {
        easy: number;
        medium: number;
        hard: number;
    };
    questionSource: QuestionSource;
    topics: string[];
    timeLimits: {
        easy: number;
        medium: number;
        hard: number;
    };
}

// FIX: Added CandidateProfile interface
export interface CandidateProfile {
    name?: string;
    email?: string;
    phone?: string;
    yearsOfExperience?: string;
    keyProjects?: string[];
    technologies?: string[];
}

// FIX: Updated Question interface with new properties
export interface Question {
  id: string;
  text: string;
  difficulty: string;
  isFollowup?: boolean;
  timeLimit?: number;
}

// FIX: Added Answer interface
export interface Answer {
    questionId: string;
    questionText: string;
    answerText: string;
    score: number;
    feedback: string;
    timeToAnswer: number;
}

// FIX: Added Candidate interface
export interface Candidate {
    id: string;
    profile: CandidateProfile;
    interviewStatus: 'NotStarted' | 'InProgress' | 'Completed';
    interviewDate: number;
    finalScore: number | null;
    finalFeedback: string | null;
    answers: Answer[];
}
