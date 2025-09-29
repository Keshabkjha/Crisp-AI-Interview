import { useState, useCallback } from 'react';
// FIX: Updated imports for types and services.
import { Message, InterviewConfig, Question, InterviewSettings, QuestionSource } from '../types';
import { generateInterviewQuestions, evaluateAnswer } from '../services/geminiService';
import { OFFLINE_QUESTIONS } from '../services/offlineQuestions';

export const useInterviewState = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isInterviewStarted, setInterviewStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const startInterview = useCallback(async (config: InterviewConfig) => {
    setIsLoading(true);
    setMessages([
      {
        sender: 'system',
        text: 'Interview setup complete. Generating questions...',
        timestamp: Date.now(),
      },
    ]);

    try {
      // FIX: Create default settings to pass to the service function.
      const settings: InterviewSettings = {
        difficultyDistribution: { easy: 2, medium: 2, hard: 1 },
        questionSource: config.resumeText ? QuestionSource.BOTH : QuestionSource.TOPICS,
        topics: ['General questions', 'Behavioral questions'],
        timeLimits: { easy: 60, medium: 120, hard: 180 },
      };

      const generatedQuestions = await generateInterviewQuestions(settings, config.resumeText);
      
      // FIX: Handle Question[] return type and map OFFLINE_QUESTIONS to Question[]
      const questionObjects: Question[] = (
        generatedQuestions.length > 0
          ? generatedQuestions
          : OFFLINE_QUESTIONS.map((q) => ({ text: q, difficulty: 'Easy', id: '' }))
      ).map((q, i) => ({ ...q, id: `q-${i}` }));


      setQuestions(questionObjects);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'system',
          text: 'Questions generated. The interview will now begin.',
          timestamp: Date.now(),
        },
        {
          sender: 'bot',
          text: questionObjects[0].text,
          timestamp: Date.now(),
        },
      ]);
      setCurrentQuestionIndex(0);
      setInterviewStarted(true);
    } catch (error) {
      console.error('Failed to start interview, using offline questions', error);
      // FIX: Map offline questions to Question objects
      const offlineQuestionObjects: Question[] = OFFLINE_QUESTIONS.map((q, i) => ({
        id: `offline-q-${i}`,
        text: q,
        difficulty: 'Easy',
      }));
      setQuestions(offlineQuestionObjects);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'system',
          text: 'Could not connect to the AI. Using pre-defined questions.',
          timestamp: Date.now(),
        },
        {
          sender: 'bot',
          text: offlineQuestionObjects[0].text,
          timestamp: Date.now(),
        },
      ]);
      setCurrentQuestionIndex(0);
      setInterviewStarted(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addUserMessage = useCallback(async (text: string) => {
    const userMessage: Message = { sender: 'user', text, timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    const currentQuestion = questions[currentQuestionIndex];
    const transcript = [...messages, userMessage].map(m => `${m.sender}: ${m.text}`).join('\n');

    // FIX: Replaced analyzeAnswer with evaluateAnswer
    const evaluation = await evaluateAnswer(currentQuestion, text, transcript);
    if (evaluation) {
        // FIX: Updated system message to show evaluation score and feedback
        const evaluationMessage: Message = {
            sender: 'system',
            text: `Score: ${evaluation.score}/10. Feedback: ${evaluation.feedback}`,
            timestamp: Date.now()
        };
        setMessages(prev => [...prev, evaluationMessage]);
    }

    // TODO: Handle followup questions from `evaluation.followup`

    // Determine next step
    if (currentQuestionIndex < questions.length - 1) {
        const nextIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIndex);
        const nextQuestionMessage: Message = {
            sender: 'bot',
            text: questions[nextIndex].text,
            timestamp: Date.now()
        };
        setMessages(prev => [...prev, nextQuestionMessage]);
    } else {
        const endMessage: Message = {
            sender: 'bot',
            text: "That's all the questions I have. Thank you for your time!",
            timestamp: Date.now()
        };
        setMessages(prev => [...prev, endMessage]);
    }

    setIsLoading(false);
  }, [currentQuestionIndex, questions, messages]);

  return {
    messages,
    currentQuestion: questions[currentQuestionIndex],
    isInterviewStarted,
    isLoading,
    startInterview,
    addUserMessage,
  };
};

// FIX: Added dummy hook to resolve import error in InterviewerDashboard.
export const useInterviewContext = () => {
    return {
        state: { candidates: [] },
        dispatch: (action: any) => { console.log('dispatch called', action) }
    }
}
