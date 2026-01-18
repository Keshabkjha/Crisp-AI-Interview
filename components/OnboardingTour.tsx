
import { useState } from 'react';

interface OnboardingTourProps {
  onComplete: () => void;
}

const tourSteps = [
  {
    title: 'Welcome to Crisp AI Interview!',
    content: "This quick tour will guide you through the app's key features.",
  },
  {
    title: 'The Interviewee Tab',
    content: 'This is where the magic happens. Candidates can upload their resume and start their AI-powered interview.',
  },
  {
    title: 'The Interviewer Hub',
    content: 'Use the "Interviewer" dropdown to access your Dashboard, view Analytics, and configure interview Settings.',
  },
  {
    title: 'Powerful Settings',
    content: 'In the Settings tab, you can customize question counts, timing, topics, and the source for question generation (resume, topics, or both!).',
  },
   {
    title: 'Robust Offline Mode',
    content: "Don't worry about losing connection. If you go offline, the interview will seamlessly continue with a standard set of questions.",
  },
  {
    title: "You're All Set!",
    content: 'You are now ready to start conducting professional, AI-enhanced interviews. Good luck!',
  },
];

export function OnboardingTour({ onComplete }: OnboardingTourProps) {
  const [step, setStep] = useState(0);
  const isLastStep = step === tourSteps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 p-8 rounded-lg shadow-2xl max-w-md w-full border border-slate-700">
        <h2 className="text-2xl font-bold mb-4 text-cyan-400">
          {tourSteps[step].title}
        </h2>
        <p className="text-slate-300 mb-8">{tourSteps[step].content}</p>

        <div className="flex justify-between items-center">
            <div>
                {step > 0 && (
                    <button onClick={handlePrev} className="px-4 py-2 text-sm text-slate-400 hover:text-white">
                        Back
                    </button>
                )}
            </div>
            <button
                onClick={handleNext}
                className="px-6 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700"
            >
                {isLastStep ? 'Get Started' : 'Next'}
            </button>
        </div>
      </div>
    </div>
  );
}
