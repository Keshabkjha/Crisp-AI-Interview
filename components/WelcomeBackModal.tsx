import React from 'react';

interface WelcomeBackModalProps {
  onContinue: () => void;
  onRestart: () => void;
}

export function WelcomeBackModal({
  onContinue,
  onRestart,
}: WelcomeBackModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full">
        <h2 className="text-xl font-bold mb-4">Welcome Back!</h2>
        <p className="text-gray-600 mb-6">
          You have an interview in progress. Would you like to continue where
          you left off or start a new one?
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onRestart}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Start New
          </button>
          <button
            onClick={onContinue}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
