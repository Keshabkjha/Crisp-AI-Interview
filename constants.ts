
import { InterviewSettings } from './types';

export const LOCAL_STORAGE_KEY = 'crisp-ai-interview-state';
export const ONBOARDING_TOUR_KEY = 'crisp-ai-onboarding-complete';

export const DEFAULT_INTERVIEW_SETTINGS: InterviewSettings = {
  topics: ['React', 'Node.js', 'JavaScript', 'TypeScript', 'System Design'],
  difficultyDistribution: {
    easy: 2,
    medium: 3,
    hard: 1,
  },
  timeLimits: {
    easy: 90, // 1.5 minutes
    medium: 180, // 3 minutes
    hard: 300, // 5 minutes
  },
  questionSource: 'Resume & Topics',
};

export const MAX_FOLLOW_UPS = 1;
export const MAX_CONSECUTIVE_NO_ANSWERS = 2;
