import { useReducer, useCallback, useEffect } from 'react';
import { InterviewState, Message } from '../types';
import { LOCAL_STORAGE_KEY } from '../constants';

type Action =
  | { type: 'START_SETUP' }
  | {
      type: 'SUBMIT_SETUP';
      payload: {
        intervieweeName: string;
        jobDescription: string;
        resumeText: string;
        questions: string[];
      };
    }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'NEXT_QUESTION' }
  | {
      type: 'END_INTERVIEW';
      payload: { feedback: string; analysis: Record<string, any> };
    }
  | { type: 'RESTART' }
  | { type: 'LOAD_STATE'; payload: InterviewState };

const initialState: InterviewState = {
  status: 'idle',
  intervieweeName: '',
  jobDescription: '',
  resumeText: '',
  questions: [],
  currentQuestionIndex: -1,
  chatHistory: [],
  feedback: '',
  analysis: {},
};

function interviewReducer(
  state: InterviewState,
  action: Action
): InterviewState {
  switch (action.type) {
    case 'START_SETUP':
      return { ...initialState, status: 'setting-up' };
    case 'SUBMIT_SETUP':
      return {
        ...state,
        status: 'in-progress',
        ...action.payload,
        currentQuestionIndex: 0,
        chatHistory: [
          {
            id: 'start',
            text: "Welcome to your AI-powered interview practice. Let's begin with your first question.",
            sender: 'system',
            timestamp: Date.now(),
          },
          {
            id: 'q-0',
            text: action.payload.questions[0],
            sender: 'interviewer',
            timestamp: Date.now(),
          },
        ],
      };
    case 'ADD_MESSAGE':
      return { ...state, chatHistory: [...state.chatHistory, action.payload] };
    case 'NEXT_QUESTION':
      if (state.currentQuestionIndex >= state.questions.length - 1) {
        return { ...state }; // Should trigger end of interview flow from component
      }
      const nextIndex = state.currentQuestionIndex + 1;
      const nextQuestion = state.questions[nextIndex];
      const newQuestionMessage: Message = {
        id: `q-${nextIndex}`,
        text: nextQuestion,
        sender: 'interviewer',
        timestamp: Date.now(),
      };
      return {
        ...state,
        currentQuestionIndex: nextIndex,
        chatHistory: [...state.chatHistory, newQuestionMessage],
      };
    case 'END_INTERVIEW':
      return { ...state, status: 'finished', ...action.payload };
    case 'RESTART':
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      return initialState;
    case 'LOAD_STATE':
      return action.payload;
    default:
      return state;
  }
}

export function useInterviewState() {
  const [state, dispatch] = useReducer(interviewReducer, initialState);

  useEffect(() => {
    try {
      const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedState) {
        const parsedState: InterviewState = JSON.parse(savedState);
        if (parsedState.status === 'in-progress') {
          dispatch({ type: 'LOAD_STATE', payload: parsedState });
        }
      }
    } catch (error) {
      console.error('Could not load state from local storage', error);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (state.status !== 'idle') {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
      } catch (error) {
        console.error('Could not save state to local storage', error);
      }
    }
  }, [state]);

  const startSetup = useCallback(() => dispatch({ type: 'START_SETUP' }), []);

  const submitSetup = useCallback(
    (payload: {
      intervieweeName: string;
      jobDescription: string;
      resumeText: string;
      questions: string[];
    }) => {
      dispatch({ type: 'SUBMIT_SETUP', payload });
    },
    []
  );

  const addMessage = useCallback(
    (message: Message) => dispatch({ type: 'ADD_MESSAGE', payload: message }),
    []
  );

  const nextQuestion = useCallback(() => dispatch({ type: 'NEXT_QUESTION' }), []);

  const endInterview = useCallback(
    (payload: { feedback: string; analysis: Record<string, any> }) => {
      dispatch({ type: 'END_INTERVIEW', payload });
    },
    []
  );

  const restart = useCallback(() => dispatch({ type: 'RESTART' }), []);

  return {
    state,
    actions: {
      startSetup,
      submitSetup,
      addMessage,
      nextQuestion,
      endInterview,
      restart,
    },
  };
}
