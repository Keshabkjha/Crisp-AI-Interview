import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CandidateProfile, InterviewSettings } from '../types';

const generateContent = vi.fn();

vi.mock('@google/genai', () => ({
  GoogleGenAI: class {
    models = { generateContent };
    constructor() {}
  },
  Type: {
    OBJECT: 'object',
    ARRAY: 'array',
    STRING: 'string',
    NUMBER: 'number',
    BOOLEAN: 'boolean',
  },
}));

const settings: InterviewSettings = {
  topics: ['React'],
  difficultyDistribution: {
    easy: 1,
    medium: 0,
    hard: 0,
  },
  timeLimits: {
    easy: 60,
    medium: 60,
    hard: 60,
  },
  questionSource: 'Topics Only',
};

const profile: CandidateProfile = {
  name: 'Test Candidate',
  email: 'test@example.com',
  phone: '555-0100',
  resumeText: 'Experienced in React and TypeScript.',
  photo: null,
  skills: ['React', 'TypeScript'],
};

const rateLimitError = Object.assign(new Error('Rate limit exceeded'), { status: 429 });
const serviceUnavailableError = Object.assign(
  new Error('Service unavailable'),
  { status: 503 }
);

describe('generateInterviewQuestions', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.resetModules();
    generateContent.mockReset();
    Object.assign(import.meta.env, { VITE_GEMINI_API_KEY: 'test-key' });
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('falls back to gemini-3-flash when rate limited on gemini-2.5-flash', async () => {
    generateContent
      .mockRejectedValueOnce(rateLimitError)
      .mockResolvedValueOnce({
        text: JSON.stringify([{ question: 'What is React?', difficulty: 'Easy' }]),
      });

    const { consumeRateLimitFallbackNotice, generateInterviewQuestions } =
      await import('../services/geminiService');

    const questions = await generateInterviewQuestions(settings, profile);

    expect(questions).toHaveLength(1);
    expect(generateContent).toHaveBeenCalledTimes(2);
    expect(generateContent.mock.calls[0][0].model).toBe('gemini-2.5-flash');
    expect(generateContent.mock.calls[1][0].model).toBe('gemini-3-flash');
    expect(consumeRateLimitFallbackNotice()).toBe(false);
  });

  it('flags offline notice when all fallback models are rate limited', async () => {
    generateContent.mockRejectedValue(rateLimitError);

    const { consumeRateLimitFallbackNotice, generateInterviewQuestions } =
      await import('../services/geminiService');

    const questions = await generateInterviewQuestions(settings, profile);

    expect(questions).toEqual([]);
    expect(generateContent).toHaveBeenCalledTimes(3);
    expect(generateContent.mock.calls.map((call) => call[0].model)).toEqual([
      'gemini-2.5-flash',
      'gemini-3-flash',
      'gemini-2.5-flash-lite',
    ]);
    expect(consumeRateLimitFallbackNotice()).toBe(true);
  });

  it('falls back when the service is temporarily unavailable', async () => {
    generateContent
      .mockRejectedValueOnce(serviceUnavailableError)
      .mockResolvedValueOnce({
        text: JSON.stringify([{ question: 'What is React?', difficulty: 'Easy' }]),
      });

    const { consumeRateLimitFallbackNotice, generateInterviewQuestions } =
      await import('../services/geminiService');

    const questions = await generateInterviewQuestions(settings, profile);

    expect(questions).toHaveLength(1);
    expect(generateContent).toHaveBeenCalledTimes(2);
    expect(generateContent.mock.calls[0][0].model).toBe('gemini-2.5-flash');
    expect(generateContent.mock.calls[1][0].model).toBe('gemini-3-flash');
    expect(consumeRateLimitFallbackNotice()).toBe(false);
  });
});
