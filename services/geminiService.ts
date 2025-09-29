// Fix: Import GoogleGenAI and Type from @google/genai as per guidelines.
import { GoogleGenAI, Type } from "@google/genai";
import { InterviewConfig } from "../types";
import { GEMINI_MODEL } from "../constants";

// Fix: Initialize GoogleGenAI with a named apiKey parameter from process.env.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateInitialQuestions(config: InterviewConfig): Promise<string[]> {
  const prompt = `
    Based on the following job description and resume, generate 5 relevant interview questions for a candidate.
    Return the questions as a JSON object with a "questions" key containing an array of strings.

    Job Description:
    ${config.jobDescription}

    Resume:
    ${config.resumeText}
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
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
            },
          },
          required: ["questions"],
        },
      },
    });

    // Fix: Access the generated text directly via the response.text property.
    const responseText = response.text;
    const result = JSON.parse(responseText);
    return result.questions || [];
  } catch (error) {
    console.error("Error generating initial questions:", error);
    return [];
  }
}


export async function analyzeAnswer(answer: string, question: string): Promise<any> {
    const prompt = `
        Analyze the following answer to the interview question. Provide feedback on clarity, relevance, and key points.
        Return a JSON object with scores for clarity and relevance (1-10), a feedback string, and an array of key points.

        Question: ${question}
        Answer: ${answer}
    `;

    try {
        // Fix: Use ai.models.generateContent for API calls.
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        clarity: { type: Type.NUMBER, description: "A score from 1-10 on clarity."},
                        relevance: { type: Type.NUMBER, description: "A score from 1-10 on relevance."},
                        feedback: { type: Type.STRING },
                        keyPoints: { type: Type.ARRAY, items: {type: Type.STRING}},
                    }
                }
            }
        });
        // Fix: Access the generated text directly via the response.text property.
        const responseText = response.text;
        return JSON.parse(responseText);
    } catch (error) {
        console.error("Error analyzing answer:", error);
        return null;
    }
}

export async function generateFollowUpQuestion(chatHistory: string): Promise<string> {
  const prompt = `
    Based on the following conversation history, ask one relevant follow-up question.
    
    History:
    ${chatHistory}
  `;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });
    // Fix: Access the generated text directly via the response.text property.
    return response.text;
  } catch (error) {
    console.error("Error generating follow-up question:", error);
    return "Let's move on to the next topic.";
  }
}
