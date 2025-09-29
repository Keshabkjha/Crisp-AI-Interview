import React, { useState } from 'react';
import { BrainCircuitIcon, UsersIcon, AnalyticsIcon, WifiOffIcon } from './icons';

interface OnboardingTourProps {
  onFinish: () => void;
}

const tourSteps = [
  {
    title: 'Welcome to Crisp AI Interview!',
    content: "Let's take a quick tour to show you how to get the most out of your AI-powered interview assistant.",
  },
  {
    title: '1. The Interview Tab',
    content: "This is where the magic happens. Start a new interview by uploading a candidate's resume. The candidate will then interact with the AI in a real-time, timed chat.",
  },
  {
    title: '2. The Dashboard Tab',
    content: 'After an interview is complete, you can review everything here. See a list of all candidates, their final scores, and click to view detailed transcripts and AI feedback.',
    icon: <UsersIcon className="w-12 h-12 text-slate-400" />,
  },
  {
    title: '3. The Analytics Tab',
    content: 'Get a high-level overview of candidate performance. See score distributions and analyze average performance based on question difficulty.',
    icon: <AnalyticsIcon className="w-12 h-12 text-slate-400" />,
  },
  {
    title: '4. The Settings Tab',
    content: "Customize the interview to fit your needs. Control the number of questions, their difficulty, time limits, and even how the AI generates questions—based on topics, the resume, or both!",
  },
  {
    title: '5. Works Offline!',
    content: 'If your internet connection drops, the app seamlessly switches to Offline Mode and uses a built-in question bank to continue the interview. Never lose progress!',
    icon: <WifiOffIcon className="w-12 h-12 text-slate-400" />,
  },
  {
    title: "You're all set!",
    content: 'Ready to find your next great hire? Click "Finish" to begin.',
    icon: <BrainCircuitIcon className="w-12 h-12 text-cyan-400" />,
  },
];

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ onFinish }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const step = tourSteps[currentStep];

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onFinish();
    }
  };
  
  const handlePrev = () => {
      if (currentStep > 0) {
          setCurrentStep(currentStep - 1);
      }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100]" aria-modal="true" role="dialog">
      <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-w-lg w-full text-center animate-fade-in">
        <div className="p-8">
            {step.icon && <div className="mx-auto mb-4">{step.icon}</div>}
            <h2 className="text-2xl font-bold text-cyan-400 mb-2">{step.title}</h2>
            <p className="text-slate-300 mb-6 min-h-[60px]">{step.content}</p>

            <div className="flex justify-center items-center mb-4">
                {tourSteps.map((_, index) => (
                    <div
                        key={index}
                        className={`w-2 h-2 rounded-full mx-1 transition-colors ${
                            index === currentStep ? 'bg-cyan-400' : 'bg-slate-600'
                        }`}
                    />
                ))}
            </div>
        </div>

        <div className="p-4 bg-slate-900/50 border-t border-slate-700 flex justify-between items-center">
            {currentStep > 0 ? (
                 <button
                    onClick={handlePrev}
                    className="bg-slate-600 hover:bg-slate-700 text-slate-200 font-bold py-2 px-4 rounded-lg transition-colors"
                  >
                    Previous
                  </button>
            ) : (
                 <button
                    onClick={onFinish}
                    className="bg-slate-600 hover:bg-slate-700 text-slate-200 font-bold py-2 px-4 rounded-lg transition-colors"
                  >
                    Skip Tour
                  </button>
            )}

          <button
            onClick={handleNext}
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg transition-colors min-w-[90px]"
          >
            {currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};
