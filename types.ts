// types.ts

export enum QuestionDifficulty {
  Easy = 'Easy',
  Medium = 'Medium',
  Hard = 'Hard',
}

export enum InterviewStatus {
  NotStarted = 'NotStarted',
  InProgress = 'InProgress',
  // A question is asked, waiting for answer.
  FollowUp = 'FollowUp',
  Completed = 'Completed',
}

export enum QuestionSource {
  TopicsOnly = 'TopicsOnly',
  ResumeOnly = 'ResumeOnly',
  TopicsAndResume = 'TopicsAndResume',
}

// Updated interview flow for more granular control
export interface InterviewSettings {
  topics: string;
  questionSource: QuestionSource;
  difficultyDistribution: {
    [QuestionDifficulty.Easy]: number;
    [QuestionDifficulty.Medium]: number;
    [QuestionDifficulty.Hard]: number;
  };
  timeLimits: {
    [QuestionDifficulty.Easy]: number; // in seconds
    [QuestionDifficulty.Medium]: number; // in seconds
    [QuestionDifficulty.Hard]: number; // in seconds
  };
}

export type QuestionOrigin = 'intro' | 'intro-followup' | 'resume' | 'skills' | 'clarification-followup';

export interface Question {
  id: string; // e.g., 'q_1'
  text: string;
  difficulty: QuestionDifficulty;
  timeLimit: number;
  isFollowUp?: boolean; // To identify in-answer follow-ups
  source: QuestionOrigin;
}

export interface Answer {
  questionId: string;
  answerText: string;
  feedback: string | null;
  score: number | null; // score out of 10
  timestamp?: string;
  followUpTimestamp?: string;
}

export interface CandidateProfile {
    name: string;
    email: string;
    phone: string;
    skills: string;
    photoDataUrl: string | null;
    resumeText: string | null;
    yearsOfExperience: string | null;
    keyProjects: Array<{ name: string; description: string; }> | null;
    technologies: string[] | null;
}

export interface Candidate {
  id: string; // e.g., 'candidate_1678886400000'
  profile: CandidateProfile;
  interviewStatus: InterviewStatus;
  questions: Question[];
  answers: Answer[];
  currentQuestionIndex: number;
  currentQuestionStartTime: number | null;
  consecutiveNoAnswers: number;
  finalScore: number | null; // score out of 100
  finalFeedback: string | null;
}

export type View = 'interviewee' | 'dashboard' | 'analytics' | 'settings';