import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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

const rateLimitError = Object.assign(new Error('Rate limit exceeded'), { status: 429 });

describe('extractRankedSkills', () => {
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

  it('falls back to gemini-3-flash when rate limited', async () => {
    generateContent
      .mockRejectedValueOnce(rateLimitError)
      .mockResolvedValueOnce({
        text: JSON.stringify({
          skills: [{ name: 'React', confidence: 90, level: 'Primary' }],
        }),
      });

    const { extractRankedSkills } = await import('../services/geminiSkillRanking');

    const skills = await extractRankedSkills('React developer');

    expect(skills).toHaveLength(1);
    expect(generateContent).toHaveBeenCalledTimes(2);
    expect(generateContent.mock.calls[0][0].model).toBe('gemini-2.5-flash');
    expect(generateContent.mock.calls[1][0].model).toBe('gemini-3-flash');
  });

  it('returns empty when all fallback models are rate limited', async () => {
    generateContent.mockRejectedValue(rateLimitError);

    const { extractRankedSkills } = await import('../services/geminiSkillRanking');

    const skills = await extractRankedSkills('React developer');

    expect(skills).toEqual([]);
    expect(generateContent).toHaveBeenCalledTimes(3);
    expect(generateContent.mock.calls.map((call) => call[0].model)).toEqual([
      'gemini-2.5-flash',
      'gemini-3-flash',
      'gemini-2.5-flash-lite',
    ]);
  });
});
