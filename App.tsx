import React, { useState, useEffect, useRef } from 'react';
import { AppStateProvider, useInterviewDispatch, useInterviewState } from './hooks/useInterviewState';
import { InterviewStatus, View } from './types';
import { IntervieweeView } from './components/IntervieweeView';
import { InterviewerDashboard } from './components/InterviewerDashboard';
import { SettingsView } from './components/SettingsView';
import { AnalyticsView } from './components/AnalyticsView';
import { InterviewSetup } from './components/InterviewSetup';
import { WelcomeBackModal } from './components/WelcomeBackModal';
import { OnboardingTour } from './components/OnboardingTour';
import { Logo } from './components/Logo';
import { Footer } from './components/Footer';
import { WifiOffIcon } from './components/icons';

const App: React.FC = () => {
  return (
    <AppStateProvider>
      <Main />
    </AppStateProvider>
  );
};

const Main: React.FC = () => {
    const [activeTab, setActiveTab] = useState<View>('interviewee');
    const { candidates, selectedCandidateId, isOffline, hasCompletedOnboarding } = useInterviewState();
    const dispatch = useInterviewDispatch();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const setOnline = () => dispatch({ type: 'SET_OFFLINE_STATUS', payload: false });
        const setOffline = () => dispatch({ type: 'SET_OFFLINE_STATUS', payload: true });

        window.addEventListener('online', setOnline);
        window.addEventListener('offline', setOffline);

        // Close dropdown if clicking outside
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);


        return () => {
            window.removeEventListener('online', setOnline);
            window.removeEventListener('offline', setOffline);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dispatch]);

    const inProgressCandidate = candidates.find(c => c.interviewStatus === InterviewStatus.InProgress || c.interviewStatus === InterviewStatus.FollowUp);
    const [showWelcomeBack, setShowWelcomeBack] = useState(!!inProgressCandidate);

    const handleContinue = () => {
        if(inProgressCandidate) {
            dispatch({ type: 'SELECT_CANDIDATE', payload: inProgressCandidate.id });
            setActiveTab('interviewee');
        }
        setShowWelcomeBack(false);
    }
    
    const handleStartNew = () => {
        if(inProgressCandidate) {
            dispatch({ type: 'DELETE_CANDIDATE', payload: inProgressCandidate.id });
        }
        dispatch({ type: 'SELECT_CANDIDATE', payload: null });
        setActiveTab('interviewee');
        setShowWelcomeBack(false);
    }
    
    const renderContent = () => {
        const selectedCandidate = candidates.find(c => c.id === selectedCandidateId);
        
        switch (activeTab) {
            case 'interviewee':
                return (selectedCandidate && selectedCandidate.interviewStatus !== InterviewStatus.Completed) 
                    ? <IntervieweeView setView={setActiveTab} /> 
                    : <InterviewSetup />;
            case 'dashboard':
                return <InterviewerDashboard />;
            case 'analytics':
                return <AnalyticsView />;
            case 'settings':
                return <SettingsView />;
            default:
                return null;
        }
    }
    
    const handleOnboardingFinish = () => {
        dispatch({ type: 'COMPLETE_ONBOARDING' });
    }

    const isInterviewerTabActive = ['dashboard', 'analytics', 'settings'].includes(activeTab);

    return (
        <div className="bg-slate-900 text-slate-300 min-h-screen font-sans flex flex-col">
            {!hasCompletedOnboarding && <OnboardingTour onFinish={handleOnboardingFinish} />}
            
            {showWelcomeBack && inProgressCandidate && (
                <WelcomeBackModal 
                    candidateName={inProgressCandidate.profile.name}
                    onContinue={handleContinue}
                    onRestart={handleStartNew}
                />
            )}
            <header className="bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10 border-b border-slate-800">
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center gap-3">
                            <Logo className="text-cyan-400" />
                            <h1 className="text-2xl font-bold text-white">Crisp AI Interview</h1>
                            {isOffline && (
                                <div className="flex items-center gap-2 text-sm text-yellow-400 bg-yellow-900/50 px-3 py-1 rounded-full ml-2">
                                    <WifiOffIcon className="w-4 h-4" />
                                    <span>Offline Mode</span>
                                </div>
                            )}
                        </div>
                         <div className="flex space-x-1 sm:space-x-4">
                            <button
                                onClick={() => setActiveTab('interviewee')}
                                className={`capitalize px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                    activeTab === 'interviewee' 
                                    ? 'bg-cyan-600 text-white' 
                                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                                }`}
                            >
                                Interviewee
                            </button>

                            <div className="relative" ref={menuRef}>
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className={`capitalize px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                                        isInterviewerTabActive
                                        ? 'bg-cyan-600 text-white' 
                                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                                    }`}
                                >
                                    Interviewer
                                    <svg className={`w-4 h-4 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </button>
                                {isMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-md shadow-lg z-20 animate-fade-in py-1">
                                        {(['dashboard', 'analytics', 'settings'] as View[]).map(tab => (
                                            <button
                                                key={tab}
                                                onClick={() => {
                                                    setActiveTab(tab);
                                                    setIsMenuOpen(false);
                                                }}
                                                className={`w-full text-left capitalize px-4 py-2 text-sm transition-colors ${
                                                    activeTab === tab
                                                    ? 'bg-slate-700 text-cyan-400'
                                                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                                                }`}
                                            >
                                                {tab}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>
            </header>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow">
               <div className="animate-fade-in">
                 {renderContent()}
               </div>
            </main>
            <Footer />
        </div>
    );
};

export default App;