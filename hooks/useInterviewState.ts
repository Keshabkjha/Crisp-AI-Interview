
import {
  useReducer,
  useEffect,
  useCallback,
  createElement,
  createContext,
  useContext,
} from 'react';
import type { ReactNode } from 'react';
import {
  View,
  Candidate,
  InterviewSettings,
  Question,
  Answer,
} from '../types';
import {
  LOCAL_STORAGE_KEY,
  ONBOARDING_TOUR_KEY,
  DEFAULT_INTERVIEW_SETTINGS,
} from '../constants';

interface AppState {
  currentView: View;
  candidates: Candidate[];
  activeCandidateId: string | null;
  hasCompletedOnboarding: boolean;
  isOnline: boolean;
  // FIX: Add global interview settings to the state.
  interviewSettings: InterviewSettings;
}

type Action =
  | { type: 'SET_CURRENT_VIEW'; payload: View }
  | { type: 'COMPLETE_ONBOARDING' }
  | { type: 'ADD_CANDIDATE'; payload: Candidate }
  | { type: 'SET_ACTIVE_CANDIDATE'; payload: string | null }
  | { type: 'UPDATE_CANDIDATE'; payload: Partial<Candidate> }
  | { type: 'DELETE_CANDIDATE'; payload: string }
  | { type: 'DELETE_ALL_CANDIDATES' }
  | { type: 'RESET_CANDIDATE_INTERVIEW'; payload: string }
  | { type: 'START_NEW_INTERVIEW' }
  | { type: 'SET_ONLINE_STATUS'; payload: boolean }
  // FIX: Add action type for updating settings.
  | { type: 'UPDATE_INTERVIEW_SETTINGS'; payload: InterviewSettings };

const initialState: AppState = {
  currentView: 'interviewee',
  candidates: [],
  activeCandidateId: null,
  hasCompletedOnboarding: false,
  isOnline: navigator.onLine,
  // FIX: Initialize interview settings in the initial state.
  interviewSettings: DEFAULT_INTERVIEW_SETTINGS,
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_CURRENT_VIEW':
      return { ...state, currentView: action.payload };
    case 'COMPLETE_ONBOARDING':
      return { ...state, hasCompletedOnboarding: true };
    case 'ADD_CANDIDATE':
      return {
        ...state,
        candidates: [...state.candidates, action.payload],
        activeCandidateId: action.payload.id,
      };
    case 'SET_ACTIVE_CANDIDATE':
      return { ...state, activeCandidateId: action.payload };
    case 'UPDATE_CANDIDATE':
      if (!state.activeCandidateId) return state;
      return {
        ...state,
        candidates: state.candidates.map((c) =>
          c.id === state.activeCandidateId
            ? { ...c, ...action.payload }
            : c
        ),
      };
    case 'DELETE_CANDIDATE':
      return {
        ...state,
        candidates: state.candidates.filter((c) => c.id !== action.payload),
        activeCandidateId:
          state.activeCandidateId === action.payload
            ? null
            : state.activeCandidateId,
      };
    case 'DELETE_ALL_CANDIDATES':
      return { ...state, candidates: [], activeCandidateId: null };
    case 'RESET_CANDIDATE_INTERVIEW':
       return {
        ...state,
        candidates: state.candidates.map((c) =>
          c.id === action.payload
            ? {
                ...c,
                interviewStatus: 'not-started',
                questions: [],
                answers: [],
                currentQuestionIndex: -1,
                currentQuestionStartTime: null,
                finalScore: null,
                finalFeedback: null,
                consecutiveNoAnswers: 0,
              }
            : c
        ),
      };
    case 'START_NEW_INTERVIEW': {
      const inProgressInterview = state.candidates.find(
        (c) => c.interviewStatus === 'in-progress'
      );
      if (inProgressInterview) {
        return {
          ...state,
          candidates: state.candidates.filter(
            (c) => c.id !== inProgressInterview.id
          ),
          activeCandidateId: null,
          currentView: 'interviewee',
        };
      }
      return { ...state, activeCandidateId: null, currentView: 'interviewee' };
    }
     case 'SET_ONLINE_STATUS':
      return { ...state, isOnline: action.payload };
    // FIX: Add reducer case for updating settings.
    case 'UPDATE_INTERVIEW_SETTINGS':
      return { ...state, interviewSettings: action.payload };
    default:
      return state;
  }
}

// Custom hook for state management
function useInterviewStateStore() {
  const [state, dispatch] = useReducer(appReducer, initialState, (init) => {
    try {
      const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
      const hasCompletedOnboarding =
        localStorage.getItem(ONBOARDING_TOUR_KEY) === 'true';

      if (savedState) {
        const parsedState: AppState = JSON.parse(savedState);
         // Migration logic for old settings format
        if (!parsedState.interviewSettings) {
            parsedState.interviewSettings = DEFAULT_INTERVIEW_SETTINGS;
        }
        parsedState.candidates.forEach(candidate => {
            if (!candidate.interviewSettings || (candidate.interviewSettings as any).questionCount) {
                candidate.interviewSettings = DEFAULT_INTERVIEW_SETTINGS;
            }
        });
        const activeCandidate = parsedState.candidates.find(
          (c) => c.id === parsedState.activeCandidateId
        );
        // If there's an in-progress interview, set the view correctly
        if (activeCandidate?.interviewStatus === 'in-progress') {
          parsedState.currentView = 'interviewee';
        }

        return { ...parsedState, hasCompletedOnboarding };
      }
      return { ...init, hasCompletedOnboarding };
    } catch (error) {
      console.error('Could not load state:', error);
      return { ...init, hasCompletedOnboarding: false };
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
      localStorage.setItem(
        ONBOARDING_TOUR_KEY,
        String(state.hasCompletedOnboarding)
      );
    } catch (error) {
      console.error('Could not save state:', error);
    }
  }, [state]);

   useEffect(() => {
    const goOnline = () => dispatch({ type: 'SET_ONLINE_STATUS', payload: true });
    const goOffline = () => dispatch({ type: 'SET_ONLINE_STATUS', payload: false });

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);


  const activeCandidate =
    state.candidates.find((c) => c.id === state.activeCandidateId) || null;

  const actions = {
    setCurrentView: useCallback(
      (view: View) => dispatch({ type: 'SET_CURRENT_VIEW', payload: view }),
      []
    ),
    completeOnboarding: useCallback(
      () => dispatch({ type: 'COMPLETE_ONBOARDING' }),
      []
    ),
    addCandidate: useCallback((profile: Candidate['profile'], settings: InterviewSettings) => {
      const newCandidate: Candidate = {
        id: `cand-${Date.now()}`,
        profile,
        interviewSettings: settings,
        interviewStatus: 'not-started',
        questions: [],
        answers: [],
        currentQuestionIndex: -1,
        currentQuestionStartTime: null,
        finalScore: null,
        finalFeedback: null,
        consecutiveNoAnswers: 0,
        createdAt: Date.now(),
      };
      dispatch({ type: 'ADD_CANDIDATE', payload: newCandidate });
    }, []),
    setActiveCandidate: useCallback(
      (id: string | null) =>
        dispatch({ type: 'SET_ACTIVE_CANDIDATE', payload: id }),
      []
    ),
    startInterview: useCallback((questions: Question[]) => {
       const sortedQuestions = questions.sort((a, b) => {
        const difficultyOrder = { Easy: 1, Medium: 2, Hard: 3 };
        return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
      });
      dispatch({
        type: 'UPDATE_CANDIDATE',
        payload: {
          interviewStatus: 'in-progress',
          questions: sortedQuestions,
          currentQuestionIndex: 0,
          currentQuestionStartTime: Date.now(),
        },
      });
    }, []),
    submitAnswer: useCallback((answer: Answer) => {
      if (!activeCandidate) return;
      const updatedAnswers = [...activeCandidate.answers, answer];
      const isLastQuestion =
        activeCandidate.currentQuestionIndex >=
        activeCandidate.questions.length - 1;

      dispatch({
        type: 'UPDATE_CANDIDATE',
        payload: {
          answers: updatedAnswers,
          interviewStatus: isLastQuestion ? 'completed' : 'in-progress',
          currentQuestionIndex: isLastQuestion
            ? activeCandidate.currentQuestionIndex
            : activeCandidate.currentQuestionIndex + 1,
          currentQuestionStartTime: isLastQuestion ? null : Date.now(),
          consecutiveNoAnswers: answer.text.trim() === '' ? activeCandidate.consecutiveNoAnswers + 1 : 0,
        },
      });
    }, [activeCandidate]),
     addFollowUpQuestion: useCallback((question: Question) => {
      if (!activeCandidate) return;
      const insertIndex = activeCandidate.currentQuestionIndex + 1;
      const newQuestions = [...activeCandidate.questions];
      newQuestions.splice(insertIndex, 0, question);
      dispatch({ type: 'UPDATE_CANDIDATE', payload: { questions: newQuestions } });
    }, [activeCandidate]),
    updateAnswerWithFeedback: useCallback((questionId: string, score: number, feedback: string) => {
        if (!activeCandidate) return;
        const updatedAnswers = activeCandidate.answers.map(ans => 
            ans.questionId === questionId ? { ...ans, score, feedback } : ans
        );
        dispatch({ type: 'UPDATE_CANDIDATE', payload: { answers: updatedAnswers } });
    }, [activeCandidate]),
    endInterview: useCallback((finalScore: number, finalFeedback: string) => {
      dispatch({
        type: 'UPDATE_CANDIDATE',
        payload: {
          interviewStatus: 'completed',
          finalScore,
          finalFeedback,
          currentQuestionStartTime: null,
        },
      });
    }, []),
    // FIX: Add action for updating settings.
    updateInterviewSettings: useCallback(
      (settings: InterviewSettings) =>
        dispatch({ type: 'UPDATE_INTERVIEW_SETTINGS', payload: settings }),
      []
    ),
    deleteCandidate: useCallback(
      (id: string) => dispatch({ type: 'DELETE_CANDIDATE', payload: id }),
      []
    ),
     deleteAllCandidates: useCallback(
      () => dispatch({ type: 'DELETE_ALL_CANDIDATES' }),
      []
    ),
    resetCandidateInterview: useCallback(
      (id: string) => dispatch({ type: 'RESET_CANDIDATE_INTERVIEW', payload: id }),
      []
    ),
    startNewInterview: useCallback(() => dispatch({ type: 'START_NEW_INTERVIEW' }), []),
  };

  return { state, activeCandidate, actions };
}

type InterviewStateContextValue = ReturnType<typeof useInterviewStateStore>;

const InterviewStateContext = createContext<InterviewStateContextValue | null>(
  null
);

export function InterviewStateProvider({ children }: { children: ReactNode }) {
  const value = useInterviewStateStore();
  return createElement(InterviewStateContext.Provider, { value }, children);
}

export function useInterviewState() {
  const context = useContext(InterviewStateContext);
  if (!context) {
    throw new Error(
      'useInterviewState must be used within InterviewStateProvider'
    );
  }
  return context;
}
