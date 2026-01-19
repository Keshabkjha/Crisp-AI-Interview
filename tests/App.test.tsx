import { render, screen } from '@testing-library/react';
import { beforeEach, vi } from 'vitest';
import type { Candidate, InterviewSettings } from '../types';
import App from '../App';

const mockState = vi.hoisted(() => {
  const interviewSettings: InterviewSettings = {
    topics: ['React'],
    difficultyDistribution: { easy: 1, medium: 1, hard: 1 },
    timeLimits: { easy: 60, medium: 60, hard: 60 },
    questionSource: 'Resume & Topics',
  };

  const candidate: Candidate = {
    id: 'cand-1',
    profile: {
      name: 'Test Candidate',
      email: '',
      phone: '',
      resumeText: 'Resume text',
      photo: null,
      skills: [],
      yearsOfExperience: 0,
      keyProjects: [],
      technologies: [],
    },
    interviewSettings,
    interviewStatus: 'not-started',
    questions: [],
    answers: [],
    currentQuestionIndex: -1,
    currentQuestionStartTime: null,
    finalScore: null,
    finalFeedback: null,
    consecutiveNoAnswers: 0,
    createdAt: 1700000000000,
  };

  const actions = {
    setCurrentView: vi.fn(),
    completeOnboarding: vi.fn(),
    startNewInterview: vi.fn(),
    setActiveCandidate: vi.fn(),
  };

  let state = {
    currentView: 'interviewee',
    candidates: [candidate],
    activeCandidateId: candidate.id,
    hasCompletedOnboarding: true,
    isOnline: true,
    interviewSettings,
  };
  let activeCandidate = candidate;

  return {
    candidate,
    interviewSettings,
    actions,
    getState: () => state,
    setState: (nextState: typeof state) => {
      state = nextState;
    },
    getActiveCandidate: () => activeCandidate,
    setActiveCandidate: (nextCandidate: Candidate) => {
      activeCandidate = nextCandidate;
    },
  };
});

vi.mock('../components/InterviewSetup', () => ({
  InterviewSetup: () => <div>Interview Setup View</div>,
}));

vi.mock('../components/IntervieweeView', () => ({
  IntervieweeView: () => <div>Interviewee View</div>,
}));

vi.mock('../components/InterviewerDashboard', () => ({
  InterviewerDashboard: () => <div>Dashboard View</div>,
}));

vi.mock('../components/AnalyticsView', () => ({
  AnalyticsView: () => <div>Analytics View</div>,
}));

vi.mock('../components/SettingsView', () => ({
  SettingsView: () => <div>Settings View</div>,
}));

vi.mock('../hooks/useInterviewState', () => ({
  useInterviewState: () => ({
    state: mockState.getState(),
    activeCandidate: mockState.getActiveCandidate(),
    actions: mockState.actions,
  }),
}));

describe('App', () => {
  beforeEach(() => {
    mockState.actions.setCurrentView.mockClear();
    mockState.actions.completeOnboarding.mockClear();
    mockState.actions.startNewInterview.mockClear();
    mockState.actions.setActiveCandidate.mockClear();
    sessionStorage.clear();
  });

  it('shows the interview view when a candidate is ready to start', () => {
    mockState.setState({
      currentView: 'interviewee',
      candidates: [mockState.candidate],
      activeCandidateId: mockState.candidate.id,
      hasCompletedOnboarding: true,
      isOnline: true,
      interviewSettings: mockState.interviewSettings,
    });
    mockState.setActiveCandidate(mockState.candidate);

    render(<App />);

    expect(screen.getByText('Interviewee View')).toBeInTheDocument();
    expect(
      screen.queryByText('Interview Setup View')
    ).not.toBeInTheDocument();
  });

  it('does not show the welcome back modal when answers update on the interviewee tab', () => {
    sessionStorage.setItem('crisp-ai-interview-session', 'true');
    const inProgressCandidate: Candidate = {
      ...mockState.candidate,
      interviewStatus: 'in-progress',
      currentQuestionIndex: 0,
    };
    mockState.setState({
      currentView: 'interviewee',
      candidates: [inProgressCandidate],
      activeCandidateId: inProgressCandidate.id,
      hasCompletedOnboarding: true,
      isOnline: true,
      interviewSettings: mockState.interviewSettings,
    });
    mockState.setActiveCandidate(inProgressCandidate);

    const { rerender } = render(<App />);

    expect(screen.queryByText('Welcome Back!')).not.toBeInTheDocument();

    const updatedCandidate: Candidate = {
      ...inProgressCandidate,
      answers: [
        {
          questionId: 'q-1',
          text: 'Answer',
          timestamp: 1700000001000,
        },
      ],
    };
    mockState.setState({
      currentView: 'interviewee',
      candidates: [updatedCandidate],
      activeCandidateId: updatedCandidate.id,
      hasCompletedOnboarding: true,
      isOnline: true,
      interviewSettings: mockState.interviewSettings,
    });
    mockState.setActiveCandidate(updatedCandidate);

    rerender(<App />);

    expect(screen.queryByText('Welcome Back!')).not.toBeInTheDocument();
  });

  it('shows the welcome back modal when returning to the interviewee tab', () => {
    sessionStorage.setItem('crisp-ai-interview-session', 'true');
    const inProgressCandidate: Candidate = {
      ...mockState.candidate,
      interviewStatus: 'in-progress',
      currentQuestionIndex: 0,
    };
    mockState.setState({
      currentView: 'dashboard',
      candidates: [inProgressCandidate],
      activeCandidateId: inProgressCandidate.id,
      hasCompletedOnboarding: true,
      isOnline: true,
      interviewSettings: mockState.interviewSettings,
    });
    mockState.setActiveCandidate(inProgressCandidate);

    const { rerender } = render(<App />);

    expect(screen.queryByText('Welcome Back!')).not.toBeInTheDocument();

    mockState.setState({
      currentView: 'interviewee',
      candidates: [inProgressCandidate],
      activeCandidateId: inProgressCandidate.id,
      hasCompletedOnboarding: true,
      isOnline: true,
      interviewSettings: mockState.interviewSettings,
    });

    rerender(<App />);

    expect(screen.getByText('Welcome Back!')).toBeInTheDocument();
  });

  it('shows the welcome back modal after a refresh during an interview', () => {
    const inProgressCandidate: Candidate = {
      ...mockState.candidate,
      interviewStatus: 'in-progress',
      currentQuestionIndex: 0,
    };
    mockState.setState({
      currentView: 'interviewee',
      candidates: [inProgressCandidate],
      activeCandidateId: inProgressCandidate.id,
      hasCompletedOnboarding: true,
      isOnline: true,
      interviewSettings: mockState.interviewSettings,
    });
    mockState.setActiveCandidate(inProgressCandidate);

    render(<App />);

    expect(screen.getByText('Welcome Back!')).toBeInTheDocument();
  });
});
