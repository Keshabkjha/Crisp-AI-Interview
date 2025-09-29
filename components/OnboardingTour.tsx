import React, { useState } from 'react';

const steps = [
  {
    target: '#job-description-input',
    content: 'First, paste the job description here.',
  },
  {
    target: '#resume-input',
    content: 'Next, add your resume to tailor the questions.',
  },
  {
    target: '#start-button',
    content: 'Click here to begin your mock interview!',
  },
];

const OnboardingTour: React.FC = () => {
  const [stepIndex, setStepIndex] = useState(0);

  if (stepIndex >= steps.length) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-800 p-6 rounded-lg">
        <p className="mb-4">{steps[stepIndex].content}</p>
        <button
          onClick={() => setStepIndex(stepIndex + 1)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
        >
          {stepIndex === steps.length - 1 ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default OnboardingTour;
