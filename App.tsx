
// FIX: Import `React` to make the `JSX` namespace available for type definitions.
import React, { useState, useEffect } from 'react';
import { useInterviewState } from './hooks/useInterviewState';
import { InterviewSetup } from './components/InterviewSetup';
import { IntervieweeView } from './components/IntervieweeView';
import { InterviewerDashboard } from './components/InterviewerDashboard';
import { AnalyticsView } from './components/AnalyticsView';
import { SettingsView } from './components/SettingsView';
import { WelcomeBackModal } from './components/WelcomeBackModal';
import { OnboardingTour } from './components/OnboardingTour';
import { Logo } from './components/Logo';
import { Footer } from './components/Footer';
import { View } from './types';
import {
  AnalyticsIcon,
  DashboardIcon,
  IntervieweeIcon,
  InterviewerIcon,
  SettingsIcon,
  ChevronDownIcon,
} from './components/icons';

function App() {
  const { state, actions } = useInterviewState();
  // FIX: Destructure only existing properties from state. `interviewStatus` is on a candidate, not the global state.
  const { currentView, hasCompletedOnboarding } = state;
  const { setCurrentView, completeOnboarding, startNewInterview, setActiveCandidate } = actions;
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [isInterviewerMenuOpen, setIsInterviewerMenuOpen] = useState(false);

  useEffect(() => {
    // FIX: Check for an in-progress interview from the candidates list.
    const inProgressInterview = state.candidates.find(
      (c) => c.interviewStatus === 'in-progress'
    );
    if (inProgressInterview) {
      setShowWelcomeBack(true);
    }
  }, [state.candidates]);

  const handleContinue = () => {
    // FIX: Ensure the in-progress interview is set as active when continuing.
    const inProgressInterview = state.candidates.find(
      (c) => c.interviewStatus === 'in-progress'
    );
    if (inProgressInterview) {
      setActiveCandidate(inProgressInterview.id);
    }
    setCurrentView('interviewee');
    setShowWelcomeBack(false);
  };

  const handleStartNewFromModal = () => {
    startNewInterview();
    setShowWelcomeBack(false);
    setCurrentView('interviewee');
  };

  // FIX: Add explicit type to prevent `view` from being inferred as `string`.
  const navItems: { name: string; view: View; icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element; }[] = [
    { name: 'Interviewee', view: 'interviewee', icon: IntervieweeIcon },
  ];

  // FIX: Add explicit type to prevent `view` from being inferred as `string`.
  const interviewerNavItems: { name: string; view: View; icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element; }[] = [
    { name: 'Dashboard', view: 'dashboard', icon: DashboardIcon },
    { name: 'Analytics', view: 'analytics', icon: AnalyticsIcon },
    { name: 'Settings', view: 'settings', icon: SettingsIcon },
  ];

  const isInterviewerSubView = ['dashboard', 'analytics', 'settings'].includes(
    currentView
  );

  const renderContent = () => {
    switch (currentView) {
      case 'interviewee':
        if (state.activeCandidateId === null || state.candidates.find(c => c.id === state.activeCandidateId)?.interviewStatus === 'not-started') return <InterviewSetup />;
        return <IntervieweeView />;
      case 'dashboard':
        return <InterviewerDashboard />;
      case 'analytics':
        return <AnalyticsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <InterviewSetup />;
    }
  };

  if (!hasCompletedOnboarding) {
    return <OnboardingTour onComplete={completeOnboarding} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col">
      {showWelcomeBack && (
        <WelcomeBackModal
          onContinue={handleContinue}
          onRestart={handleStartNewFromModal}
        />
      )}
      <header className="bg-slate-900/70 backdrop-blur-lg sticky top-0 z-40 border-b border-slate-700">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Logo />
            <h1 className="text-xl font-bold text-slate-200 hidden sm:block">
              Crisp AI Interview
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {navItems.map(({ name, view, icon: Icon }) => (
              <button
                key={view}
                onClick={() => setCurrentView(view)}
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${
                  currentView === view
                    ? 'bg-cyan-500/10 text-cyan-400'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="hidden md:inline">{name}</span>
              </button>
            ))}

            <div
              className="relative"
              onMouseEnter={() => setIsInterviewerMenuOpen(true)}
              onMouseLeave={() => setIsInterviewerMenuOpen(false)}
            >
              <button
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${
                  isInterviewerSubView
                    ? 'bg-cyan-500/10 text-cyan-400'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <InterviewerIcon className="w-5 h-5" />
                <span className="hidden md:inline">Interviewer</span>
                <ChevronDownIcon
                  className={`w-4 h-4 transition-transform ${
                    isInterviewerMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {isInterviewerMenuOpen && (
                <div className="absolute right-0 top-full pt-2 z-50">
                  <div className="w-48 bg-slate-800 border border-slate-700 rounded-md shadow-lg py-1">
                    {interviewerNavItems.map(({ name, view, icon: Icon }) => (
                      <a
                        key={view}
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentView(view);
                          setIsInterviewerMenuOpen(false);
                        }}
                        className={`flex items-center gap-3 px-4 py-2 text-sm ${
                          currentView === view
                            ? 'bg-cyan-500/10 text-cyan-400'
                            : 'text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {name}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>
      </header>
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
}

export default App;
