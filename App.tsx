import React, { useState, useEffect } from 'react';
import InterviewSetup from './components/InterviewSetup';
import IntervieweeView from './components/IntervieweeView';
import { useInterviewState } from './hooks/useInterviewState';
import { InterviewConfig } from './types';
import Logo from './components/Logo';
import Footer from './components/Footer';

type View = 'setup' | 'interviewee';

function App() {
  const [view, setView] = useState<View>('setup');
  const {
    messages,
    currentQuestion,
    isInterviewStarted,
    isLoading,
    startInterview,
    addUserMessage,
  } = useInterviewState();

  const handleStart = (config: InterviewConfig) => {
    startInterview(config);
  };

  useEffect(() => {
    if (isInterviewStarted) {
      setView('interviewee');
    }
  }, [isInterviewStarted]);

  const renderView = () => {
    switch (view) {
      case 'interviewee':
        return (
          <IntervieweeView
            messages={messages}
            currentQuestion={currentQuestion}
            onSendMessage={addUserMessage}
            isLoading={isLoading}
          />
        );
      case 'setup':
      default:
        return <InterviewSetup onStart={handleStart} isLoading={isLoading} />;
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans flex flex-col">
      <header className="p-4 border-b border-gray-700">
        <Logo />
      </header>
      <main className="flex-grow flex flex-col">
        {renderView()}
      </main>
      <Footer />
    </div>
  );
}

export default App;
