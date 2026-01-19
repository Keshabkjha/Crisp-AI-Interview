// services/geminiSkillRanking.ts
import { GoogleGenAI, Type } from '@google/genai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

const geminiSkillRankingModels = [
  'gemini-2.5-flash',
  'gemini-3-flash',
  'gemini-2.5-flash-lite',
] as const;

function isRateLimitError(error: unknown): boolean {
  if (!error) return false;
  const errorObject = error as { status?: number; code?: number; message?: string };
  if (
    errorObject.status === 429 ||
    errorObject.code === 429 ||
    errorObject.status === 503 ||
    errorObject.code === 503
  ) {
    return true;
  }
  const message =
    errorObject.message ?? (error instanceof Error ? error.message : String(error));
  const normalizedMessage = message.toLowerCase();
  return (
    normalizedMessage.includes('rate limit') ||
    normalizedMessage.includes('resource_exhausted') ||
    normalizedMessage.includes('429') ||
    normalizedMessage.includes('503') ||
    normalizedMessage.includes('overloaded') ||
    normalizedMessage.includes('unavailable')
  );
}

export interface RankedSkill {
  name: string;
  confidence: number; // 0–100
  level: 'Primary' | 'Secondary' | 'Basic';
}

const skillRankingSchema = {
  type: Type.OBJECT,
  properties: {
    skills: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
          level: {
            type: Type.STRING,
            enum: ['Primary', 'Secondary', 'Basic'],
          },
        },
        required: ['name', 'confidence', 'level'],
      },
    },
  },
};

export async function extractRankedSkills(
  resumeText: string
): Promise<RankedSkill[]> {
  if (!ai) return [];

  const prompt = `
You are a senior technical recruiter.

From the resume below:
- Identify professional skills
- Rank them by importance
- Assign confidence (0–100)
- Classify each as Primary / Secondary / Basic

Return ONLY JSON.

Resume:
"""
${resumeText}
"""
`;

  let rateLimitTriggered = false;
  let lastError: unknown;

  for (let index = 0; index < geminiSkillRankingModels.length; index += 1) {
    const model = geminiSkillRankingModels[index];
    if (index > 0 && !rateLimitTriggered) {
      break;
    }
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: skillRankingSchema,
        },
      });

      if (!response.text) return [];
      return JSON.parse(response.text).skills;
    } catch (err) {
      lastError = err;
      if (!rateLimitTriggered && isRateLimitError(err)) {
        rateLimitTriggered = true;
        continue;
      }
      if (rateLimitTriggered) {
        continue;
      }
      break;
    }
  }

  console.error('Skill ranking failed:', lastError);
  return [];
}
