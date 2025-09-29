import { useState, useCallback } from 'react';
import { Message, InterviewConfig, Question } from '../types';
import { generateInitialQuestions, analyzeAnswer, generateFollowUpQuestion } from '../services/geminiService';
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
      const generatedQuestions = await generateInitialQuestions(config);
      const questionObjects = (
        generatedQuestions.length > 0 ? generatedQuestions : OFFLINE_QUESTIONS
      ).map((q, i) => ({ id: `q-${i}`, text: q }));

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
      const offlineQuestionObjects = OFFLINE_QUESTIONS.map((q, i) => ({
        id: `offline-q-${i}`,
        text: q,
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

    // Analyze answer
    const analysis = await analyzeAnswer(text, questions[currentQuestionIndex].text);
    if (analysis) {
        const analysisMessage: Message = {
            sender: 'system',
            text: `Analysis: Clarity ${analysis.clarity}/10, Relevance ${analysis.relevance}/10. Feedback: ${analysis.feedback}`,
            timestamp: Date.now()
        };
        setMessages(prev => [...prev, analysisMessage]);
    }

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
  }, [currentQuestionIndex, questions]);

  return {
    messages,
    currentQuestion: questions[currentQuestionIndex],
    isInterviewStarted,
    isLoading,
    startInterview,
    addUserMessage,
  };
};
