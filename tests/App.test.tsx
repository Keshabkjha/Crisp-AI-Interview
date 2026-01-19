import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../App';

const mockState = vi.hoisted(() => {
  const interviewSettings = {
    topics: ['React'],
    difficultyDistribution: { easy: 1, medium: 1, hard: 1 },
    timeLimits: { easy: 60, medium: 60, hard: 60 },
    questionSource: 'Resume & Topics',
  } as const;

  const candidate = {
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
  } as const;

  return { candidate, interviewSettings };
});

vi.mock('../components/InterviewSetup', () => ({
  InterviewSetup: () => <div>Interview Setup View</div>,
}));

vi.mock('../components/IntervieweeView', () => ({
  IntervieweeView: () => <div>Interviewee View</div>,
}));

vi.mock('../hooks/useInterviewState', () => ({
  useInterviewState: () => ({
    state: {
      currentView: 'interviewee',
      candidates: [mockState.candidate],
      activeCandidateId: mockState.candidate.id,
      hasCompletedOnboarding: true,
      isOnline: true,
      interviewSettings: mockState.interviewSettings,
    },
    activeCandidate: mockState.candidate,
    actions: {
      setCurrentView: vi.fn(),
      completeOnboarding: vi.fn(),
      startNewInterview: vi.fn(),
      setActiveCandidate: vi.fn(),
    },
  }),
}));

describe('App', () => {
  it('shows the interview view when a candidate is ready to start', () => {
    render(<App />);

    expect(screen.getByText('Interviewee View')).toBeInTheDocument();
    expect(
      screen.queryByText('Interview Setup View')
    ).not.toBeInTheDocument();
  });
});
