import React from 'react';
import ChatWindow from './ChatWindow';
import Timer from './Timer';
import { Message, Question } from '../types';

interface Props {
  messages: Message[];
  currentQuestion: Question;
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

const IntervieweeView: React.FC<Props> = ({
  messages,
  currentQuestion,
  onSendMessage,
  isLoading,
}) => {
  return (
    <div className="flex-grow flex h-full p-4 gap-4">
      <div className="w-2/3 flex flex-col gap-4">
        <div className="flex-grow bg-black rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Camera Feed Placeholder</p>
        </div>
        <div className="h-1/3 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-2 text-gray-300">Current Question:</h2>
          <p className="text-lg">{isLoading && !currentQuestion ? 'Loading next question...' : currentQuestion?.text}</p>
        </div>
      </div>
      <div className="w-1/3 flex flex-col">
        <div className="flex justify-between items-center mb-4 px-2">
          <h2 className="text-2xl font-bold">Transcript</h2>
          <Timer />
        </div>
        <ChatWindow messages={messages} onSendMessage={onSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default IntervieweeView;
