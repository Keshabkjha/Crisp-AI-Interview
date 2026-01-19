import { GoogleGenAI, Type } from '@google/genai';
import { extractRankedSkills } from './geminiSkillRanking';

import { InterviewSettings, CandidateProfile, Question, QuestionDifficulty, Answer } from '../types';
import { validateInterviewSettings } from '../schemas/interviewSettings';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.warn('VITE_GEMINI_API_KEY is not set. AI features will be disabled.');
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

const geminiFallbackModels = [
  'gemini-2.5-flash',
  'gemini-3-flash',
  'gemini-2.5-flash-lite',
] as const;

type GeminiGenerateContentParams = Parameters<
  NonNullable<typeof ai>['models']['generateContent']
>[0];

type GeminiGenerateContentResponse = Awaited<
  ReturnType<NonNullable<typeof ai>['models']['generateContent']>
>;

let offlineFallbackNotice = false;

export function consumeOfflineFallbackNotice(): boolean {
  const notice = offlineFallbackNotice;
  offlineFallbackNotice = false;
  return notice;
}

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

async function generateContentWithFallback(
  request: Omit<GeminiGenerateContentParams, 'model'>,
  options?: { trackOfflineFallback?: boolean }
): Promise<GeminiGenerateContentResponse> {
  if (!ai) {
    throw new Error('Gemini client unavailable');
  }
  let lastError: unknown;

  for (let index = 0; index < geminiFallbackModels.length; index += 1) {
    const model = geminiFallbackModels[index];
    try {
      return await ai.models.generateContent({ ...request, model });
    } catch (error) {
      lastError = error;
    }
  }

  if (options?.trackOfflineFallback) {
    offlineFallbackNotice = true;
  }

  throw lastError ?? new Error('Gemini request failed');
}

const infoExtractionSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: "Candidate's full name." },
    email: { type: Type.STRING, description: "Candidate's email address." },
    phone: { type: Type.STRING, description: "Candidate's phone number." },
    skills: {
      type: Type.ARRAY,
      description: 'A list of top 5-10 technical and soft skills.',
      items: { type: Type.STRING },
    },
     yearsOfExperience: { type: Type.NUMBER, description: "Total years of professional experience, as a number." },
    keyProjects: {
      type: Type.ARRAY,
      description: "A list of 2-3 key projects mentioned.",
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "The project's title or a short name." },
          description: { type: Type.STRING, description: "A 1-2 sentence description of the project." },
        },
      },
    },
     technologies: {
      type: Type.ARRAY,
      description: "A list of key technologies, frameworks, and languages mentioned.",
      items: { type: Type.STRING },
    },
  },
};


export async function extractInfoFromResume(
  resumeText: string
): Promise<Partial<CandidateProfile>> {
  if (!ai) return {};

  try {
    // Existing extraction (UNCHANGED)
    const response = await generateContentWithFallback({
      contents: `Extract candidate information from the resume:\n${resumeText}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: infoExtractionSchema,
      },
    });

    if (!response.text) return {};

    const baseProfile = JSON.parse(response.text.trim());

    // ⭐ NEW: ranked skills
    const rankedSkills = await extractRankedSkills(resumeText);

    return {
      ...baseProfile,

      // ✅ KEEP OLD CONTRACT
      skills: Array.isArray(baseProfile.skills)
        ? baseProfile.skills
        : [],

      // ⭐ ADD NEW DATA
      rankedSkills: rankedSkills.length > 0
        ? rankedSkills
        : undefined,
    };
  } catch (error) {
    if (isRateLimitError(error)) {
      console.warn(
        'Gemini service is temporarily unavailable. Resume details may be incomplete.'
      );
      return {};
    }
    console.error('Error extracting info from resume:', error);
    return {};
  }
}


const questionGenerationSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      question: { type: Type.STRING },
      difficulty: { type: Type.STRING, enum: ['Easy', 'Medium', 'Hard'] },
    },
    required: ['question', 'difficulty'],
  },
};

export async function generateInterviewQuestions(
  settings: InterviewSettings,
  profile: CandidateProfile
): Promise<Question[]> {
  if (!ai) return [];
  offlineFallbackNotice = false;

  const validatedSettings = validateInterviewSettings(settings);
  const { difficultyDistribution, topics, questionSource } = validatedSettings;
  const totalQuestions =
    difficultyDistribution.easy +
    difficultyDistribution.medium +
    difficultyDistribution.hard;

  let sourceInfo = '';
  switch (questionSource) {
    case 'Resume Only':
      sourceInfo = `Candidate's Resume:\n${profile.resumeText}`;
      break;
    case 'Topics Only':
      sourceInfo = `Job Topics:\n${topics.join(', ')}`;
      break;
    case 'Resume & Topics':
    default:
      sourceInfo = `Job Topics:\n${topics.join(
        ', '
      )}\n\nCandidate's Resume:\n${profile.resumeText}`;
      break;
  }

  const prompt = `You are an expert technical interviewer. Generate ${totalQuestions} interview questions based on the provided information.
  
  Question distribution requirements:
  - Easy: ${difficultyDistribution.easy}
  - Medium: ${difficultyDistribution.medium}
  - Hard: ${difficultyDistribution.hard}
  
  Source Information:
  ${sourceInfo}
  
  Return the questions as a JSON array. Each object in the array should have a "question" (string) and a "difficulty" (string: 'Easy', 'Medium', or 'Hard').`;

  try {
    const response = await generateContentWithFallback(
      {
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: questionGenerationSchema,
        },
      },
      { trackOfflineFallback: true }
    );

    if (!response.text) {
      throw new Error("Empty response from API");
    }

    const result: { question: string; difficulty: QuestionDifficulty }[] =
      JSON.parse(response.text.trim());
    return result.map((q, i) => ({
      id: `q-${Date.now()}-${i}`,
      text: q.question,
      difficulty: q.difficulty || 'Medium',
      isFollowUp: false,
    }));
  } catch (error) {
    console.error('Error generating interview questions:', error);
    return []; // Return empty array on error to trigger offline fallback
  }
}

const answerEvaluationSchema = {
    type: Type.OBJECT,
    properties: {
        score: { type: Type.NUMBER, description: 'A score from 0 (poor) to 10 (excellent).' },
        feedback: { type: Type.STRING, description: 'Concise, constructive feedback (2-3 sentences).' },
        askFollowUp: { type: Type.BOOLEAN, description: 'True if a clarifying follow-up is needed.' },
        followUpQuestion: { type: Type.STRING, description: 'A specific follow-up question, if needed.' },
    },
    required: ['score', 'feedback', 'askFollowUp'],
};

export async function evaluateAnswer(
  question: Question,
  answer: string
): Promise<{ score: number; feedback: string; followUp?: Question } | null> {
  if (!ai) return null;

  const prompt = `As an expert interviewer, evaluate the following answer. Provide a score (0-10), concise feedback, and decide if a follow-up question is necessary (e.g., if the answer is vague, incomplete, or a good opportunity to probe deeper).
  
  Question: "${question.text}" (Difficulty: ${question.difficulty})
  Answer: "${answer}"
  
  ${question.isFollowUp ? "This is a follow-up question. Do not ask another follow-up." : ""}
  
  Return a JSON object with your evaluation.`;

  try {
    const response = await generateContentWithFallback({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: answerEvaluationSchema,
      },
    });

    if (!response.text) {
      throw new Error("Empty response from API");
    }

    const result = JSON.parse(response.text.trim());
    
    let followUp: Question | undefined = undefined;
    if (result.askFollowUp && result.followUpQuestion && !question.isFollowUp) {
        followUp = {
            id: `fq-${Date.now()}`,
            text: result.followUpQuestion,
            difficulty: question.difficulty,
            isFollowUp: true,
            followUpFor: question.id,
        }
    }

    return {
      score: result.score,
      feedback: result.feedback,
      followUp,
    };
  } catch (error) {
    console.error('Error evaluating answer:', error);
    return null;
  }
}

const finalFeedbackSchema = {
    type: Type.OBJECT,
    properties: {
        finalScore: { type: Type.NUMBER, description: 'An overall score from 0 to 100.' },
        summary: { type: Type.STRING, description: 'A professional summary for a hiring manager (3-5 sentences).' },
    },
    required: ['finalScore', 'summary'],
};


export async function generateFinalFeedback(
  profile: CandidateProfile,
  questions: Question[],
  answers: Answer[]
): Promise<{ finalScore: number; summary: string } | null> {
  if (!ai) return null;

  const transcript = questions
    .map((q) => {
      const answer = answers.find((a) => a.questionId === q.id);
      return `Q: ${q.text} (Difficulty: ${q.difficulty})\nA: ${
        answer?.text || '(No answer provided)'
      }\nScore: ${answer?.score || 'N/A'}\nFeedback: ${
        answer?.feedback || 'N/A'
      }`;
    })
    .join('\n\n');

  const prompt = `You are a senior hiring manager. Based on the candidate's profile and the full interview transcript, provide a final overall score (0-100) and a professional hiring summary.
  
  Candidate Profile:
  - Name: ${profile.name}
  - Skills: ${profile.skills.join(', ')}
  - Resume Summary: ${profile.resumeText.substring(0, 300)}...
  
  Interview Transcript:
  ${transcript}
  
  Return your analysis as a JSON object.`;

  try {
    const response = await generateContentWithFallback({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: finalFeedbackSchema,
      },
    });

    if (!response.text) {
      throw new Error("Empty response from API");
    }
    
    const result = JSON.parse(response.text.trim());
    return {
      finalScore: result.finalScore,
      summary: result.summary,
    };
// FIX: Corrected syntax error in catch block (replaced `_` with `{`).
  } catch (error) {
    console.error('Error generating final feedback:', error);
    return null;
  }
}
