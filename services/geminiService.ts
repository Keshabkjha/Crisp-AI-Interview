import { GoogleGenAI, GenerateContentResponse, Type } from '@google/genai';
import { Message } from '../types';
import { offlineQuestions } from './offlineQuestions';

// The API key MUST be obtained exclusively from the environment variable `process.env.API_KEY`.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateInterviewQuestions(
  jobDescription: string,
  resumeText: string
): Promise<string[]> {
  const prompt = `Based on the following job description and resume, generate 5 relevant interview questions.
  
  Job Description:
  ${jobDescription}
  
  Resume:
  ${resumeText}
  
  The questions should be tailored to assess the candidate's suitability for the role described.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              description: 'A list of 5 interview questions.',
              items: { type: Type.STRING },
            },
          },
          required: ['questions'],
        },
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    return result.questions || offlineQuestions;
  } catch (error) {
    console.error('Error generating interview questions:', error);
    return offlineQuestions;
  }
}

export async function getFeedbackOnAnswer(
  question: string,
  answer: string
): Promise<string> {
  const prompt = `As an expert interviewer, provide concise feedback on the following answer to the interview question.
    
    Question: "${question}"
    
    Answer: "${answer}"
    
    Provide constructive feedback focusing on clarity, relevance, and structure (like STAR method). Keep it to 2-3 sentences.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error('Error getting feedback:', error);
    return 'Sorry, I was unable to process that answer for feedback.';
  }
}

export async function generateOverallFeedback(
  chatHistory: Message[]
): Promise<string> {
  const transcript = chatHistory
    .filter((m) => m.sender !== 'system')
    .map((m) => `${m.sender === 'interviewer' ? 'Q:' : 'A:'} ${m.text}`)
    .join('\n');

  const prompt = `Based on this interview transcript, provide overall feedback for the candidate. Summarize their strengths and areas for improvement.
    
    Transcript:
    ${transcript}
    
    Keep the feedback concise and actionable.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error('Error generating overall feedback:', error);
    return 'Sorry, I was unable to generate overall feedback.';
  }
}
