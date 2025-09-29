import React from 'react';
import { InterviewState } from '../types';

interface InterviewerDashboardProps {
  state: InterviewState;
}

export function InterviewerDashboard({ state }: InterviewerDashboardProps) {
  return (
    <div className="bg-white p-4 shadow-lg rounded-lg h-full">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">
        Interview Dashboard
      </h2>
      <div className="space-y-4">
        <div>
          <h3 className="font-medium text-sm text-gray-500 uppercase tracking-wider">
            Candidate
          </h3>
          <p className="text-gray-800 font-semibold">{state.intervieweeName}</p>
        </div>
        <div>
          <h3 className="font-medium text-sm text-gray-500 uppercase tracking-wider">
            Job Description Focus
          </h3>
          <p className="text-gray-700 text-sm line-clamp-3">
            {state.jobDescription}
          </p>
        </div>
        <div>
          <h3 className="font-medium text-sm text-gray-500 uppercase tracking-wider">
            Current Question ({state.currentQuestionIndex + 1} /{' '}
            {state.questions.length})
          </h3>
          <p className="text-gray-800">
            {state.questions[state.currentQuestionIndex]}
          </p>
        </div>
        {state.questions.length > state.currentQuestionIndex + 1 && (
          <div>
            <h3 className="font-medium text-sm text-gray-500 uppercase tracking-wider">
              Upcoming Questions
            </h3>
            <ul className="list-decimal list-inside text-gray-600 text-sm space-y-1 mt-1">
              {state.questions
                .slice(state.currentQuestionIndex + 1, state.currentQuestionIndex + 3)
                .map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
