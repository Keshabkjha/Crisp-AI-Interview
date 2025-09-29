import React from 'react';
import { InterviewState } from '../types';

interface AnalyticsViewProps {
  state: InterviewState;
  onRestart: () => void;
}

export function AnalyticsView({ state, onRestart }: AnalyticsViewProps) {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center mb-2">
          Interview Report
        </h1>
        <h2 className="text-xl text-center text-gray-600 mb-6">
          For: {state.intervieweeName}
        </h2>

        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-2 border-b pb-2">
            Overall Feedback
          </h3>
          <p className="text-gray-700 whitespace-pre-wrap">
            {state.feedback || 'No feedback generated.'}
          </p>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-2 border-b pb-2">
            Interview Transcript
          </h3>
          <div className="max-h-80 overflow-y-auto bg-gray-50 p-4 rounded-md space-y-4">
            {state.chatHistory
              .filter((msg) => msg.sender !== 'system')
              .map((msg) => (
                <div key={msg.id}>
                  <p
                    className={`font-semibold ${
                      msg.sender === 'interviewer'
                        ? 'text-blue-600'
                        : 'text-green-600'
                    }`}
                  >
                    {msg.sender === 'interviewer' ? 'Interviewer:' : 'You:'}
                  </p>
                  <p className="text-gray-800">{msg.text}</p>
                </div>
              ))}
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={onRestart}
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700"
          >
            Start New Interview
          </button>
        </div>
      </div>
    </div>
  );
}
