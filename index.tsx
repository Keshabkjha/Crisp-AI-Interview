
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { InterviewStateProvider } from './hooks/useInterviewState';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <InterviewStateProvider>
      <App />
    </InterviewStateProvider>
  </React.StrictMode>
);
