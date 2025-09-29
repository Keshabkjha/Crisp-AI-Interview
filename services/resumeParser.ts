import { GoogleGenAI, Type } from '@google/genai';
import { ResumeData } from '../types';

// The API key MUST be obtained exclusively from the environment variable `process.env.API_KEY`.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const resumeSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: "Candidate's full name." },
    summary: {
      type: Type.STRING,
      description: 'A brief professional summary.',
    },
    experience: {
      type: Type.ARRAY,
      description: 'List of professional experiences.',
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: 'Job title.' },
          company: { type: Type.STRING, description: 'Company name.' },
          duration: {
            type: Type.STRING,
            description: "e.g., 'Jan 2020 - Present'",
          },
          responsibilities: {
            type: Type.ARRAY,
            description: 'List of key responsibilities or achievements.',
            items: { type: Type.STRING },
          },
        },
        required: ['title', 'company', 'duration', 'responsibilities'],
      },
    },
    education: {
      type: Type.ARRAY,
      description: 'List of educational qualifications.',
      items: {
        type: Type.OBJECT,
        properties: {
          degree: { type: Type.STRING },
          school: { type: Type.STRING },
          year: { type: Type.STRING, description: 'Year of graduation.' },
        },
        required: ['degree', 'school', 'year'],
      },
    },
    skills: {
      type: Type.ARRAY,
      description: 'List of technical and soft skills.',
      items: { type: Type.STRING },
    },
  },
  required: ['name', 'experience', 'education', 'skills'],
};

export async function parseResume(
  resumeText: string
): Promise<ResumeData | null> {
  const prompt = `Parse the following resume text and extract the key information into a structured JSON format.
  
  Resume Text:
  ${resumeText}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: resumeSchema,
      },
    });

    const jsonText = response.text.trim();
    const parsedData: ResumeData = JSON.parse(jsonText);
    return parsedData;
  } catch (error) {
    console.error('Error parsing resume:', error);
    return null;
  }
}
