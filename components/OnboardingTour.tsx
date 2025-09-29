import React from 'react';

interface OnboardingTourProps {
  onComplete: () => void;
}
export function OnboardingTour({ onComplete }: OnboardingTourProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full">
        <h2 className="text-xl font-bold mb-4">Welcome to AI Interviewer!</h2>
        <p className="text-gray-600 mb-6">
          This is a quick tour to get you started on your practice interview.
        </p>
        <button
          onClick={onComplete}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}
