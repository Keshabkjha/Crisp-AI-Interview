import React from 'react';

interface Props {
    onContinue: () => void;
    onStartNew: () => void;
}

const WelcomeBackModal: React.FC<Props> = ({ onContinue, onStartNew }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold mb-4">Welcome Back!</h2>
        <p className="text-gray-300 mb-6">
          It looks like you have a session in progress. Would you like to
          continue or start a new interview?
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onStartNew}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg"
          >
            Start New
          </button>
          <button
            onClick={onContinue}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            Continue Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBackModal;
