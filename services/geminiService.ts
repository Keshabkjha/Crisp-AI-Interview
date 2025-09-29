
import { GoogleGenAI, Type } from "@google/genai";
// FIX: Updated imports to include new and corrected types.
import { InterviewSettings, Question, CandidateProfile, QuestionSource } from "../types";

const GEMINI_MODEL = 'gemini-2.5-flash';
// FIX: Using process.env.API_KEY as per guidelines. VITE_GEMINI_API_KEY is not standard.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // FIX: Using process.env.API_KEY as per guidelines. VITE_GEMINI_API_KEY is not standard.
  console.error("Gemini API key not found. Please set API_KEY in your environment.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY! });

export async function extractInfoFromResume(resumeText: string): Promise<Partial<CandidateProfile>> {
  if (!API_KEY) return { name: '', email: '', phone: '' };

  const prompt = `Extract the full name, email address, and phone number from the following resume text. Additionally, extract the candidate's total years of professional experience, a brief summary of 2-3 key projects mentioned, and a list of key technologies/skills. Ensure the output is a clean JSON object. If a field is not found, return an empty string or array for it.

Resume Text:
---
${resumeText}
---`;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            email: { type: Type.STRING },
            phone: { type: Type.STRING },
            yearsOfExperience: { type: Type.STRING },
            keyProjects: { type: Type.ARRAY, items: { type: Type.STRING } },
            technologies: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
        },
      },
    });

    if (!response.text) {
        throw new Error("Empty response from AI");
    }
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error extracting info from resume:", error);
    return { name: '', email: '', phone: '', yearsOfExperience: '', keyProjects: [], technologies: [] };
  }
}

export async function generateInterviewQuestions(settings: InterviewSettings, resumeText?: string, skills?: string[]): Promise<Question[]> {
  if (!API_KEY) return [];

  const { difficultyDistribution, questionSource, topics } = settings;
  const totalQuestions = difficultyDistribution.easy + difficultyDistribution.medium + difficultyDistribution.hard;

  let prompt = `You are a senior technical interviewer. Generate a list of ${totalQuestions} interview questions for a job candidate.
// FIX: Corrected typo from difficulty_distribution to difficultyDistribution.
The question distribution must be: ${difficultyDistribution.easy} easy, ${difficultyDistribution.medium} medium, and ${difficultyDistribution.hard} hard.
Return the questions as a single JSON array of objects, where each object has "text" and "difficulty" ("Easy", "Medium", or "Hard") properties. Do not include any other text or formatting.`;

  switch(questionSource) {
    case QuestionSource.RESUME:
        prompt += `\nBase the questions on the following resume:\n---\n${resumeText}\n---`;
        break;
    case QuestionSource.TOPICS:
        prompt += `\nBase the questions on the following topics: ${topics.join(', ')}.`;
        break;
    case QuestionSource.BOTH:
        prompt += `\nBase the questions on the following topics: ${topics.join(', ')} and the following resume:\n---\n${resumeText}\n---`;
        break;
  }
  
  if (skills && skills.length > 0) {
    prompt += `\nThe candidate claims to have the following skills, so you can tailor some questions to these: ${skills.join(', ')}.`;
  }

  try {
    const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        text: { type: Type.STRING },
                        difficulty: { type: Type.STRING },
                    }
                }
            }
        }
    });

    if (!response.text) {
        throw new Error("Empty response from AI");
    }
    const questions = JSON.parse(response.text);
    return questions.map((q: any, i: number) => ({...q, id: `ai-q-${i}`})) as Question[];
  } catch (error) {
    console.error("Error generating interview questions:", error);
    return [];
  }
}

// FIX: Removed `settings` from function signature as it's not available where this function is called.
export async function evaluateAnswer(question: Question, answer: string, transcript: string): Promise<{score: number; feedback: string; followup?: Question}> {
    if (!API_KEY) return { score: 0, feedback: "Evaluation is offline." };

    const isFollowup = question.isFollowup;

    const prompt = `You are a senior technical interviewer evaluating a candidate's answer.
    The interview transcript so far is:
    ---
    ${transcript}
    ---
    
    Current Question (Difficulty: ${question.difficulty}): "${question.text}"
    Candidate's Answer: "${answer}"

    1.  **Score the answer:** Provide a score from 0 to 10 based on technical accuracy, clarity, and completeness.
    2.  **Provide Feedback:** Write a concise, professional feedback paragraph explaining the score.
    3.  **Follow-up (Optional):** ${isFollowup ? 'Do NOT ask another follow-up question.' : 'If the answer is vague, incomplete, or could be expanded upon, generate ONE brief, clarifying follow-up question. If the answer is sufficient, do not generate a follow-up.'}
    
    Return a single JSON object with "score" (number), "feedback" (string), and an optional "followup" (string) property.`;

    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        score: { type: Type.NUMBER },
                        feedback: { type: Type.STRING },
                        followup: { type: Type.STRING },
                    }
                }
            }
        });
        
        if (!response.text) {
            throw new Error("Empty response from AI");
        }
        const result = JSON.parse(response.text);

        let followupQuestion: Question | undefined = undefined;
        if(result.followup) {
            followupQuestion = {
                id: `${question.id}-f1`,
                text: result.followup,
                difficulty: question.difficulty, // Follow-ups inherit difficulty
                isFollowup: true,
                // FIX: Removed this line as `settings` is not available. The `timeLimit` property is optional.
            }
        }

        return {
            score: result.score,
            feedback: result.feedback,
            followup: followupQuestion
        };

    } catch (error) {
        console.error("Error evaluating answer:", error);
        return { score: 0, feedback: "Could not evaluate answer due to an AI error." };
    }
}


export async function generateFinalFeedback(transcript: string): Promise<{finalScore: number; finalFeedback: string}> {
    if (!API_KEY) return { finalScore: 0, finalFeedback: "Final summary is unavailable in offline mode." };

    const prompt = `You are a senior hiring manager reviewing a completed interview transcript.
    Based on the full transcript provided below, provide a final score out of 100 and a professional, narrative summary of the candidate's performance.
    Consider their strengths, weaknesses, and overall suitability for the role based on their answers.
    Return a single JSON object with "finalScore" (number) and "finalFeedback" (string).

    Transcript:
    ---
    ${transcript}
    ---`;

    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        finalScore: { type: Type.NUMBER },
                        finalFeedback: { type: Type.STRING },
                    }
                }
            }
        });
        
        if (!response.text) {
            throw new Error("Empty response from AI");
        }
        const result = JSON.parse(response.text);
        return result;

    } catch (error) {
        console.error("Error generating final feedback:", error);
        return { finalScore: 0, finalFeedback: "Could not generate final summary due to an AI error." };
    }
}
