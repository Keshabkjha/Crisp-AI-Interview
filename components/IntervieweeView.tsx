import React from 'react';
import { ChatWindow } from './ChatWindow';
import { Timer } from './Timer';
import { InterviewerDashboard } from './InterviewerDashboard';
import { InterviewState, Message } from '../types';
import { INTERVIEW_DURATION_MS } from '../constants';
import { generateOverallFeedback } from '../services/geminiService';

interface IntervieweeViewProps {
  state: InterviewState;
  actions: {
    addMessage: (message: Message) => void;
    nextQuestion: () => void;
    endInterview: (payload: {
      feedback: string;
      analysis: Record<string, any>;
    }) => void;
  };
}

export function IntervieweeView({ state, actions }: IntervieweeViewProps) {
  const [isFinishing, setIsFinishing] = React.useState(false);

  const handleSendMessage = (text: string) => {
    actions.addMessage({
      id: `ans-${state.currentQuestionIndex}`,
      text,
      sender: 'interviewee',
      timestamp: Date.now(),
    });
  };

  const handleEndInterview = React.useCallback(async () => {
    setIsFinishing(true);
    const feedback = await generateOverallFeedback(state.chatHistory);
    actions.endInterview({ feedback, analysis: {} }); // analysis can be implemented later
    setIsFinishing(false);
  }, [actions, state.chatHistory]);

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <div className="flex-1 p-4 flex flex-col gap-4">
        <header className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm">
          <h1 className="text-xl font-bold text-gray-800">
            AI Interview Practice
          </h1>
          <Timer duration={INTERVIEW_DURATION_MS} onComplete={handleEndInterview} />
        </header>
        <main className="flex-1">
          <ChatWindow
            messages={state.chatHistory}
            onSendMessage={handleSendMessage}
            isLoading={isFinishing}
            currentQuestion={state.questions[state.currentQuestionIndex]}
            onNextQuestion={actions.nextQuestion}
            isLastQuestion={
              state.currentQuestionIndex >= state.questions.length - 1
            }
            onEndInterview={handleEndInterview}
          />
        </main>
      </div>
      <div className="w-96 bg-gray-50 p-4">
        <InterviewerDashboard state={state} />
      </div>
    </div>
  );
}
