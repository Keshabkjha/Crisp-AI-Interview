import { InterviewSettings, QuestionSource, Question, QuestionDifficulty } from './types';

export const DEFAULT_INTERVIEW_SETTINGS: InterviewSettings = {
  topics: 'full-stack React/Node.js developer role',
  questionSource: QuestionSource.TopicsAndResume,
  difficultyDistribution: {
    [QuestionDifficulty.Easy]: 2,
    [QuestionDifficulty.Medium]: 3,
    [QuestionDifficulty.Hard]: 1,
  },
  timeLimits: {
    [QuestionDifficulty.Easy]: 120, // 2 minutes
    [QuestionDifficulty.Medium]: 180, // 3 minutes
    [QuestionDifficulty.Hard]: 300, // 5 minutes
  },
};

export const STATIC_INTRO_QUESTION: Omit<Question, 'id'> = {
  text: "To start, please introduce yourself. Tell me about your background, interests, and what you're passionate about in technology.",
  difficulty: QuestionDifficulty.Easy,
  timeLimit: 120,
  source: 'intro',
};

export const LOCAL_STORAGE_KEY = 'crisp-interview-assistant-state';
export const GEMINI_MODEL = 'gemini-2.5-flash';