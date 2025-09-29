import React, { createContext, useReducer, useContext, useEffect, ReactNode } from 'react';
import { Candidate, InterviewSettings, InterviewStatus, Question, Answer, CandidateProfile } from '../types';
import { DEFAULT_INTERVIEW_SETTINGS, LOCAL_STORAGE_KEY, STATIC_INTRO_QUESTION } from '../constants';

interface AppState {
  candidates: Candidate[];
  selectedCandidateId: string | null;
  interviewSettings: InterviewSettings;
  isOffline: boolean;
  hasCompletedOnboarding: boolean;
}

type Action =
  | { type: 'CREATE_AND_START_INTERVIEW'; payload: { profile: CandidateProfile } }
  | { type: 'SELECT_CANDIDATE'; payload: string | null }
  | { type: 'DELETE_CANDIDATE'; payload: string }
  | { type: 'DELETE_ALL_CANDIDATES' }
  | { type: 'RESET_CANDIDATE_INTERVIEW'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: InterviewSettings }
  | { type: 'UPDATE_EVALUATION'; payload: { candidateId: string; questionId: string; score: number; feedback: string } }
  | { type: 'SUBMIT_ANSWER'; payload: { candidateId: string; questionId: string; answerText: string } }
  | { type: 'ADVANCE_QUESTION'; payload: { candidateId: string } }
  | { type: 'COMPLETE_INTERVIEW'; payload: { candidateId: string; finalScore: number | null; finalFeedback: string } }
  | { type: 'SET_OFFLINE_STATUS'; payload: boolean }
  | { type: 'ADD_QUESTIONS_TO_QUEUE'; payload: { candidateId: string; questions: Omit<Question, 'id'>[] } }
  | { type: 'INSERT_FOLLOW_UP_QUESTION'; payload: { candidateId: string; question: Omit<Question, 'id'> } }
  | { type: 'COMPLETE_ONBOARDING' };


const initialState: AppState = {
  candidates: [],
  selectedCandidateId: null,
  interviewSettings: DEFAULT_INTERVIEW_SETTINGS,
  isOffline: typeof navigator !== 'undefined' ? !navigator.onLine : true,
  hasCompletedOnboarding: false,
};

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'CREATE_AND_START_INTERVIEW': {
      const { profile } = action.payload;
      const introQuestion: Question = { ...STATIC_INTRO_QUESTION, id: 'q_0' };
      const newCandidate: Candidate = {
        id: `candidate_${Date.now()}`,
        profile,
        interviewStatus: InterviewStatus.InProgress,
        questions: [introQuestion],
        answers: [],
        currentQuestionIndex: -1,
        currentQuestionStartTime: null,
        consecutiveNoAnswers: 0,
        finalScore: null,
        finalFeedback: null,
      };
      return {
        ...state,
        candidates: [...state.candidates, newCandidate],
        selectedCandidateId: newCandidate.id,
      };
    }
    case 'SELECT_CANDIDATE':
      return { ...state, selectedCandidateId: action.payload };
    case 'DELETE_CANDIDATE':
      return {
        ...state,
        candidates: state.candidates.filter(c => c.id !== action.payload),
        selectedCandidateId: state.selectedCandidateId === action.payload ? null : state.selectedCandidateId,
      };
    case 'DELETE_ALL_CANDIDATES':
        return {
            ...state,
            candidates: [],
            selectedCandidateId: null,
        };
    case 'RESET_CANDIDATE_INTERVIEW':
        return {
            ...state,
            candidates: state.candidates.map(c => 
                c.id === action.payload 
                ? { ...c, interviewStatus: InterviewStatus.NotStarted, questions: [], answers: [], currentQuestionIndex: -1, currentQuestionStartTime: null, finalScore: null, finalFeedback: null, consecutiveNoAnswers: 0 }
                : c
            )
        };
    case 'UPDATE_SETTINGS':
      return { ...state, interviewSettings: action.payload };
    case 'SUBMIT_ANSWER': {
        const { candidateId, questionId, answerText } = action.payload;
        const isNoAnswer = answerText.startsWith('(No answer provided');
        
        return {
            ...state,
            candidates: state.candidates.map(c => {
                if (c.id !== candidateId) return c;

                const newConsecutiveNoAnswers = isNoAnswer ? c.consecutiveNoAnswers + 1 : 0;
                const newAnswer: Answer = { questionId, answerText, score: null, feedback: null, timestamp: new Date().toISOString() };
                
                return { 
                    ...c, 
                    interviewStatus: InterviewStatus.FollowUp, 
                    answers: [...c.answers.filter(a => a.questionId !== questionId), newAnswer], 
                    currentQuestionStartTime: null,
                    consecutiveNoAnswers: newConsecutiveNoAnswers
                };
            })
        };
    }
    case 'UPDATE_EVALUATION': {
        const { candidateId, questionId, score, feedback } = action.payload;
        return {
            ...state,
            candidates: state.candidates.map(c => 
                c.id === candidateId
                ? { ...c, answers: c.answers.map(a => a.questionId === questionId ? {...a, score, feedback} : a) }
                : c
            )
        };
    }
    case 'ADVANCE_QUESTION': {
        return {
            ...state,
            candidates: state.candidates.map(c => 
                c.id === action.payload.candidateId
                ? { ...c, interviewStatus: InterviewStatus.InProgress, currentQuestionIndex: c.currentQuestionIndex + 1, currentQuestionStartTime: Date.now() }
                : c
            )
        };
    }
    case 'COMPLETE_INTERVIEW': {
        const { candidateId, finalScore, finalFeedback } = action.payload;
        return {
            ...state,
            candidates: state.candidates.map(c =>
                c.id === candidateId
                ? { ...c, interviewStatus: InterviewStatus.Completed, finalScore, finalFeedback }
                : c
            )
        };
    }
     case 'ADD_QUESTIONS_TO_QUEUE': {
        const { candidateId, questions } = action.payload;
        return {
            ...state,
            candidates: state.candidates.map(c => {
                if (c.id !== candidateId) return c;
                const nextId = c.questions.length;
                const newQuestions = questions.map((q, i) => ({ ...q, id: `q_${nextId + i}` }));
                return { ...c, questions: [...c.questions, ...newQuestions] };
            })
        };
    }
    case 'INSERT_FOLLOW_UP_QUESTION': {
        const { candidateId, question } = action.payload;
        return {
            ...state,
            candidates: state.candidates.map(c => {
                if (c.id !== candidateId) return c;
                const newQuestion: Question = { ...question, id: `q_${c.questions.length}` };
                const newQuestions = [...c.questions];
                newQuestions.splice(c.currentQuestionIndex + 1, 0, newQuestion);
                return { ...c, questions: newQuestions };
            })
        }
    }
    case 'SET_OFFLINE_STATUS':
        return { ...state, isOffline: action.payload };
    case 'COMPLETE_ONBOARDING':
        return { ...state, hasCompletedOnboarding: true };
    default:
      return state;
  }
};

const AppStateContext = createContext<AppState>(initialState);
const AppDispatchContext = createContext<React.Dispatch<Action>>(() => null);

export const AppStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState, (initial) => {
    try {
      const storedState = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedState) {
        const parsed = JSON.parse(storedState);
        // Migration check for old settings format. Reset to new defaults if detected.
        if (parsed.interviewSettings && ('questionCount' in parsed.interviewSettings || 'flow' in parsed.interviewSettings)) {
            parsed.interviewSettings = DEFAULT_INTERVIEW_SETTINGS;
        }
        return { ...initial, ...parsed, isOffline: typeof navigator !== 'undefined' ? !navigator.onLine : true };
      }
    } catch (error) {
      console.error("Failed to parse state from localStorage", error);
    }
    return initial;
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save state to localStorage", error);
    }
  }, [state]);

  return React.createElement(
    AppStateContext.Provider,
    { value: state },
    React.createElement(
      AppDispatchContext.Provider,
      { value: dispatch },
      children
    )
  );
};

export const useInterviewState = () => useContext(AppStateContext);
export const useInterviewDispatch = () => useContext(AppDispatchContext);