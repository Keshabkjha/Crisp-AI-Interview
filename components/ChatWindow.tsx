import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { SendIcon, MicIcon, UserIcon, BotIcon, LoadingIcon } from './icons';
import { getFeedbackOnAnswer } from '../services/geminiService';

interface ChatWindowProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  currentQuestion: string;
  onNextQuestion: () => void;
  isLastQuestion: boolean;
  onEndInterview: () => void;
}

export function ChatWindow({
  messages,
  onSendMessage,
  isLoading,
  currentQuestion,
  onNextQuestion,
  isLastQuestion,
  onEndInterview,
}: ChatWindowProps) {
  const [inputText, setInputText] = useState('');
  const [isGettingFeedback, setIsGettingFeedback] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (inputText.trim() && !isLoading) {
      onSendMessage(inputText);
      setInputText('');

      setIsGettingFeedback(true);
      const answerFeedback = await getFeedbackOnAnswer(
        currentQuestion,
        inputText
      );
      setFeedback(answerFeedback);
      setIsGettingFeedback(false);
    }
  };

  const handleNext = () => {
    setFeedback(null);
    onNextQuestion();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 rounded-lg shadow-md">
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 my-4 ${
              msg.sender === 'interviewee' ? 'justify-end' : ''
            }`}
          >
            {msg.sender !== 'interviewee' && (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                {msg.sender === 'interviewer' ? (
                  <BotIcon className="w-5 h-5 text-gray-600" />
                ) : null}
              </div>
            )}
            <div
              className={`p-3 rounded-lg max-w-lg ${
                msg.sender === 'interviewee'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              <p className="text-sm">{msg.text}</p>
            </div>
            {msg.sender === 'interviewee' && (
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                <UserIcon className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-3 my-4">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <BotIcon className="w-5 h-5 text-gray-600" />
            </div>
            <div className="p-3 rounded-lg bg-gray-200">
              <LoadingIcon className="w-5 h-5 text-gray-600" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {feedback && (
        <div className="p-4 border-t border-gray-200 bg-yellow-50">
          <h4 className="font-semibold text-sm text-yellow-800">
            Feedback on your answer:
          </h4>
          <p className="text-sm text-yellow-700 mt-1">{feedback}</p>
          <div className="mt-2">
            {isLastQuestion ? (
              <button
                onClick={onEndInterview}
                className="px-4 py-2 bg-green-500 text-white rounded-md text-sm hover:bg-green-600"
              >
                Finish & Get Report
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
              >
                Next Question
              </button>
            )}
          </div>
        </div>
      )}

      {isGettingFeedback && (
        <div className="p-4 border-t border-gray-200 bg-yellow-50 text-sm text-yellow-700 flex items-center gap-2">
          <LoadingIcon className="w-4 h-4" />
          Generating feedback...
        </div>
      )}

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your answer here..."
            className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
            rows={2}
            disabled={isLoading || !!feedback}
          />
          <button
            className="p-2 rounded-full hover:bg-gray-200"
            disabled={isLoading}
          >
            <MicIcon className="w-6 h-6 text-gray-600" />
          </button>
          <button
            onClick={handleSend}
            disabled={isLoading || !inputText.trim() || !!feedback}
            className="p-2 bg-blue-500 text-white rounded-full disabled:bg-gray-300"
          >
            <SendIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
