import { z } from 'zod';
import { InterviewSettings } from '../types';

export const DEFAULT_INTERVIEW_SETTINGS: InterviewSettings = {
  topics: ['React', 'Node.js', 'JavaScript', 'TypeScript', 'System Design'],
  difficultyDistribution: {
    easy: 2,
    medium: 3,
    hard: 1,
  },
  timeLimits: {
    easy: 90,
    medium: 180,
    hard: 300,
  },
  questionSource: 'Resume & Topics',
};

const questionSourceOptions = [
  'Resume Only',
  'Topics Only',
  'Resume & Topics',
] as const;
const questionSourceSchema = z.enum(questionSourceOptions);

export const interviewSettingsSchema = z.object({
  topics: z.array(z.string().min(1)),
  difficultyDistribution: z.object({
    easy: z.number().int().min(0),
    medium: z.number().int().min(0),
    hard: z.number().int().min(0),
  }),
  timeLimits: z.object({
    easy: z.number().int().min(10),
    medium: z.number().int().min(10),
    hard: z.number().int().min(10),
  }),
  questionSource: questionSourceSchema,
});

export function validateInterviewSettings(
  settings: InterviewSettings
): InterviewSettings {
  const result = interviewSettingsSchema.safeParse(settings);
  if (result.success) {
    return result.data;
  }
  return DEFAULT_INTERVIEW_SETTINGS;
}
