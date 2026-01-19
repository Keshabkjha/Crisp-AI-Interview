import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, vi } from 'vitest';
import type { Candidate, InterviewSettings } from '../types';
import { InterviewerDashboard } from '../components/InterviewerDashboard';

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
      email: 'test@example.com',
      phone: '555-0100',
      resumeText: 'Resume text',
      resumeFileName: 'resume.pdf',
      resumeFileType: 'application/pdf',
      resumeFileData: 'data:application/pdf;base64,AAA',
      photo: null,
      skills: [],
      yearsOfExperience: 0,
      keyProjects: [],
      technologies: [],
    },
    interviewSettings,
    interviewStatus: 'completed',
    questions: [],
    answers: [],
    currentQuestionIndex: -1,
    currentQuestionStartTime: null,
    finalScore: 85,
    finalFeedback: 'Great work.',
    consecutiveNoAnswers: 0,
    createdAt: 1700000000000,
  };

  const actions = {
    deleteCandidate: vi.fn(),
    deleteAllCandidates: vi.fn(),
    resetCandidateInterview: vi.fn(),
    setActiveCandidate: vi.fn(),
  };

  return {
    candidate,
    interviewSettings,
    actions,
    state: {
      candidates: [candidate],
    },
  };
});

vi.mock('../hooks/useInterviewState', () => ({
  useInterviewState: () => ({
    state: mockState.state,
    actions: mockState.actions,
  }),
}));

describe('InterviewerDashboard', () => {
  beforeEach(() => {
    mockState.actions.deleteCandidate.mockClear();
    mockState.actions.deleteAllCandidates.mockClear();
    mockState.actions.resetCandidateInterview.mockClear();
    mockState.actions.setActiveCandidate.mockClear();
  });

  it('shows resume file view and download links for uploaded resumes', async () => {
    const user = userEvent.setup();
    render(<InterviewerDashboard />);

    await user.click(screen.getByText('Test Candidate'));

    expect(screen.getByText('Uploaded file: resume.pdf')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View' })).toHaveAttribute(
      'href',
      'data:application/pdf;base64,AAA'
    );
    expect(screen.getByRole('link', { name: 'View' })).toHaveAttribute(
      'target',
      '_blank'
    );
    expect(screen.getByRole('link', { name: 'Download' })).toHaveAttribute(
      'href',
      'data:application/pdf;base64,AAA'
    );
    expect(screen.getByRole('link', { name: 'Download' })).toHaveAttribute(
      'download',
      'resume.pdf'
    );
  });
});
