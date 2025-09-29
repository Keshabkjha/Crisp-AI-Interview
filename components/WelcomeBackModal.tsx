import React, { useEffect, useRef } from 'react';

interface WelcomeBackModalProps {
  candidateName: string;
  onContinue: () => void;
  onRestart: () => void;
}

export const WelcomeBackModal: React.FC<WelcomeBackModalProps> = ({ candidateName, onContinue, onRestart }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const continueButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onContinue(); // Default to continuing
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    const modalElement = modalRef.current;
    if (!modalElement) return;

    const focusableElements = modalElement.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    continueButtonRef.current?.focus();

    const trapFocus = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) { // Shift+Tab
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else { // Tab
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };
    
    modalElement.addEventListener('keydown', trapFocus);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      modalElement.removeEventListener('keydown', trapFocus);
    };
  }, [onContinue]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div 
        ref={modalRef} 
        className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-w-md w-full p-8 text-center animate-fade-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-back-title"
      >
        <h2 id="welcome-back-title" className="text-2xl font-bold text-cyan-400 mb-2">Welcome Back!</h2>
        <p className="text-slate-300 mb-6">
          It looks like you have an interview in progress for <span className="font-semibold text-white">{candidateName}</span>.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            ref={continueButtonRef}
            onClick={onContinue}
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-lg transition-colors w-full sm:w-auto"
          >
            Continue Interview
          </button>
          <button
            onClick={onRestart}
            className="bg-slate-600 hover:bg-slate-700 text-slate-200 font-bold py-2 px-6 rounded-lg transition-colors w-full sm:w-auto"
          >
            Start New
          </button>
        </div>
      </div>
    </div>
  );
};