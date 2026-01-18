// services/geminiSkillRanking.ts
import { GoogleGenAI, Type } from '@google/genai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: API_KEY });

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
  if (!API_KEY) return [];

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

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: skillRankingSchema,
      },
    });

    if (!response.text) return [];
    return JSON.parse(response.text).skills;
  } catch (err) {
    console.error('Skill ranking failed:', err);
    return [];
  }
}
