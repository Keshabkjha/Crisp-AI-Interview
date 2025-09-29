// Fix: Import GoogleGenAI and Type from @google/genai as per guidelines.
import { GoogleGenAI, Type } from "@google/genai";
import { GEMINI_MODEL } from "../constants";

// Fix: Initialize GoogleGenAI with a named apiKey parameter from process.env.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function parseResume(resumeText: string): Promise<any> {
  const prompt = `
    Parse the following resume text and extract key information like name, contact info,
    work experience, education, and skills. Return it as a structured JSON object.

    Resume Text:
    ${resumeText}
  `;

  try {
    // Fix: Use ai.models.generateContent to call the Gemini API.
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            contact: {
              type: Type.OBJECT,
              properties: {
                email: { type: Type.STRING },
                phone: { type: Type.STRING },
              },
            },
            experience: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  company: { type: Type.STRING },
                  role: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
              },
            },
            education: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  institution: { type: Type.STRING },
                  degree: { type: Type.STRING },
                  year: { type: Type.STRING },
                },
              },
            },
            skills: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
      },
    });

    // Fix: Access the generated text directly via the response.text property.
    const responseText = response.text;
    return JSON.parse(responseText);
  } catch (error) {
    console.error("Error parsing resume:", error);
    return null;
  }
}
