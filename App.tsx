import React from 'react';
import { useInterviewState } from './hooks/useInterviewState';
import { InterviewSetup } from './components/InterviewSetup';
import { IntervieweeView } from './components/IntervieweeView';
import { AnalyticsView } from './components/AnalyticsView';
import { Logo } from './components/Logo';
import { Footer } from './components/Footer';

function App() {
  const { state, actions } = useInterviewState();

  const renderContent = () => {
    switch (state.status) {
      case 'idle':
      case 'setting-up':
        return <InterviewSetup onSubmit={actions.submitSetup} />;
      case 'in-progress':
        return <IntervieweeView state={state} actions={actions} />;
      case 'finished':
        return <AnalyticsView state={state} onRestart={actions.restart} />;
      default:
        return <div>Something went wrong. Please refresh the page.</div>;
    }
  };

  return (
    <div className="font-sans">
      {state.status === 'idle' && (
        <div className="absolute top-4 left-4">
          <Logo />
        </div>
      )}
      {renderContent()}
      {state.status === 'idle' && <Footer />}
    </div>
  );
}

export default App;
