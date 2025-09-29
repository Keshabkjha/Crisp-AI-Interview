import { GoogleGenAI, Type } from "@google/genai";
import { InterviewSettings, Question, Candidate, CandidateProfile, QuestionDifficulty, QuestionOrigin, QuestionSource } from '../types';
import { GEMINI_MODEL } from '../constants';

// Fix: Use process.env.API_KEY as per the coding guidelines. This resolves the TypeScript error with import.meta.env.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const extractInfoFromResume = async (resumeText: string): Promise<Omit<CandidateProfile, 'photoDataUrl' | 'resumeText'>> => {
    const prompt = `Perform a detailed analysis of the following resume text. Extract the following information:
- Full name
- Email address
- Phone number
- A comma-separated list of key technical skills (e.g., React, Node.js, Python).
- Total years of professional experience as a string (e.g., "5 years", "10+ years").
- A list of key technologies mentioned (programming languages, frameworks, databases, tools).
- Up to 3 key projects, including their name and a brief description of the candidate's role and accomplishments.

If a field is not present, return a null or empty value for it.

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
                        skills: { type: Type.STRING, description: "Comma-separated list of technical skills." },
                        yearsOfExperience: { type: Type.STRING, description: "Total years of professional experience as a string." },
                        technologies: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "A list of key technologies (languages, frameworks, tools)."
                        },
                        keyProjects: {
                            type: Type.ARRAY,
                            description: "An array of up to 3 key projects.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING, description: "The project's name." },
                                    description: { type: Type.STRING, description: "A brief summary of the project." }
                                },
                                required: ['name', 'description']
                            }
                        }
                    }
                }
            }
        });
        
        const parsed = JSON.parse(response.text);
        return {
            name: parsed.name || '',
            email: parsed.email || '',
            phone: parsed.phone || '',
            skills: parsed.skills || '',
            yearsOfExperience: parsed.yearsOfExperience || null,
            technologies: parsed.technologies && parsed.technologies.length > 0 ? parsed.technologies : null,
            keyProjects: parsed.keyProjects && parsed.keyProjects.length > 0 ? parsed.keyProjects : null,
        }
    } catch (error) {
        console.error("Error extracting info from resume:", error);
        throw new Error("AI failed to extract information from the resume.");
    }
};

export const generateIntroFollowUp = async (introduction: string): Promise<string> => {
    const prompt = `Based on the candidate's following introduction, ask one insightful follow-up question that delves deeper into something interesting they mentioned (a project, a passion, a specific experience).

Introduction: "${introduction}"

Generate one question.`;
    try {
        const response = await ai.models.generateContent({ model: GEMINI_MODEL, contents: prompt });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating intro follow-up:", error);
        throw new Error("Failed to generate introduction follow-up.");
    }
};

export const generateInterviewQuestions = async (
  profile: CandidateProfile,
  settings: InterviewSettings
): Promise<Array<{ text: string; difficulty: QuestionDifficulty }>> => {
  const { resumeText, skills } = profile;
  const { topics, difficultyDistribution, questionSource } = settings;

  const questionCount = Object.values(difficultyDistribution).reduce((sum, count) => sum + count, 0);

  if (questionCount === 0) {
    return [];
  }
  
  const { 
      [QuestionDifficulty.Easy]: easyCount, 
      [QuestionDifficulty.Medium]: mediumCount, 
      [QuestionDifficulty.Hard]: hardCount 
  } = difficultyDistribution;
  
  // --- BUG FIX: Dynamically build prompt context based on questionSource setting ---
  let contextPrompt = '';
  switch(questionSource) {
      case QuestionSource.TopicsOnly:
          contextPrompt = `The questions should be general to the role's topics. Do not use the candidate's resume.`;
          break;
      case QuestionSource.ResumeOnly:
          if (!resumeText) throw new Error("A resume is required for 'Resume Only' question source.");
          contextPrompt = `All questions MUST be derived directly from the candidate's resume provided below.
Resume Text:\n---\n${resumeText}\n---`;
          break;
      case QuestionSource.TopicsAndResume:
      default:
           contextPrompt = `Use their resume and listed skills to make the questions more specific and insightful where possible.
${skills ? `Candidate's Listed Skills: ${skills}` : ''}
${resumeText ? `Resume Text:\n---\n${resumeText}\n---` : ''}`;
          break;
  }
  // --- END BUG FIX ---

  const prompt = `You are a technical interviewer for a "${topics}" role.
Based on the candidate's profile and the context below, generate a structured interview with exactly ${questionCount} questions in total: ${easyCount} easy, ${mediumCount} medium, and ${hardCount} hard.
The questions should test their knowledge and experience relevant to the job.

Context for question generation:
---
${contextPrompt}
---

Return the questions as a JSON array.`;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              description:
                `An array of exactly ${questionCount} questions: ${easyCount} easy, ${mediumCount} medium, and ${hardCount} hard.`,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: {
                    type: Type.STRING,
                    description: 'The interview question text.',
                  },
                  difficulty: {
                    type: Type.STRING,
                    enum: ['Easy', 'Medium', 'Hard'],
                    description: 'The difficulty of the question.',
                  },
                },
                required: ['text', 'difficulty'],
              },
            },
          },
        },
      },
    });
    const result = JSON.parse(response.text);
    return result.questions || [];
  } catch (error) {
    console.error('Error generating interview questions:', error);
    throw new Error('Failed to generate the interview questions.');
  }
};

export const evaluateAnswer = async (question: Question, answer: string, topics: string): Promise<{ score: number; feedback: string; needsFollowUp: boolean; followUpQuestionText?: string; }> => {
    // --- BUG FIX: Prevent follow-up loops. If the question is already a follow-up, do not generate another one. ---
    const isAlreadyFollowUp = question.isFollowUp;

    const prompt = `As an expert technical interviewer for a "${topics}" role, evaluate the following answer.

Question: "${question.text}"
Candidate's Answer: "${answer}"

First, decide if the answer is unsatisfactory, vague, or incomplete enough to warrant a clarifying follow-up question. ${isAlreadyFollowUp ? "Do NOT ask a follow-up, as this question is already a follow-up." : ""}
Then, provide a score (0-10) and constructive feedback.
If a follow-up is needed, also provide the text for that follow-up question. The follow-up should be a direct clarification of their answer.
`;

    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        score: { type: Type.NUMBER, description: "A numerical score from 0 to 10." },
                        feedback: { type: Type.STRING, description: "Constructive feedback for the candidate." },
                        needsFollowUp: { type: Type.BOOLEAN, description: isAlreadyFollowUp ? "Must be false, as this is already a follow-up." : "True if a follow-up question is necessary."},
                        followUpQuestionText: { type: Type.STRING, description: "The text of the follow-up question, if needed."}
                    }
                }
            }
        });
        const result = JSON.parse(response.text);
        
        // Ensure followUpQuestionText is only present if needsFollowUp is true, and enforce no-follow-up rule
        if (isAlreadyFollowUp || !result.needsFollowUp) {
            result.needsFollowUp = false;
            delete result.followUpQuestionText;
        }

        return result;
    } catch (error) {
        console.error("Error evaluating answer:", error);
        throw new Error("Failed to evaluate the answer.");
    }
};

export const generateFinalFeedback = async (candidate: Candidate): Promise<{ finalScore: number; finalFeedback: string }> => {
    const interviewTranscript = candidate.questions
    .filter(q => q.source !== 'intro' && q.source !== 'intro-followup') // Exclude intro and intro follow-ups from scoring
    .map((q, i) => {
        const answer = candidate.answers.find(a => a.questionId === q.id);
        return `
Question ${i + 1} (${q.difficulty}): ${q.text}
Score: ${answer?.score}/10
Feedback: ${answer?.feedback}
`;
    }).join('\n');

    const prompt = `You are a senior hiring manager providing a final evaluation for a candidate named ${candidate.profile.name}.
Based on the following interview transcript, provide a final score (0-100) and a comprehensive summary of their performance.
The summary should be encouraging and professional. Synthesize the feedback into an overall narrative.

Interview Transcript:
---
${interviewTranscript}
---
`;

    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        finalScore: { type: Type.NUMBER, description: "Overall score from 0 to 100." },
                        finalFeedback: { type: Type.STRING, description: "A comprehensive summary of the candidate's performance." }
                    }
                }
            }
        });
        
        // --- BUG FIX: Add robust parsing and validation ---
        let parsed;
        try {
            parsed = JSON.parse(response.text);
        } catch (parseError) {
            console.error("Failed to parse JSON from final feedback AI response:", response.text);
            throw new Error("AI returned invalid data for the final summary.");
        }

        if (typeof parsed.finalScore !== 'number' || typeof parsed.finalFeedback !== 'string') {
            console.error("Final feedback from AI is missing required fields:", parsed);
            throw new Error("AI summary is incomplete. Please try again.");
        }

        return parsed;

    } catch (error) {
        console.error("Error generating final feedback:", error);
        // Re-throw the original error if it's already specific, otherwise throw the generic one
        if (error instanceof Error) throw error;
        throw new Error("Failed to generate final feedback.");
    }
};