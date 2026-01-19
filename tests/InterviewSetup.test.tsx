import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, beforeEach, vi } from 'vitest';
import WebcamMock from './mocks/react-webcam';
import { extractTextFromFile } from '../services/resumeParser';
import { extractInfoFromResume } from '../services/geminiService';
import { InterviewSetup } from '../components/InterviewSetup';

vi.mock('react-webcam', () => ({
  default: WebcamMock,
}));

vi.mock('../services/resumeParser', () => ({
  extractTextFromFile: vi.fn(),
}));

vi.mock('../services/geminiService', () => ({
  extractInfoFromResume: vi.fn(),
}));

describe('InterviewSetup', () => {
  const createObjectURLMock = vi.fn(() => 'blob:resume-preview');
  const revokeObjectURLMock = vi.fn();
  const mockedExtractTextFromFile = vi.mocked(extractTextFromFile);
  const mockedExtractInfoFromResume = vi.mocked(extractInfoFromResume);

  beforeAll(() => {
    Object.defineProperty(URL, 'createObjectURL', {
      value: createObjectURLMock,
      writable: true,
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      value: revokeObjectURLMock,
      writable: true,
    });
  });

  beforeEach(() => {
    createObjectURLMock.mockClear();
    revokeObjectURLMock.mockClear();
    mockedExtractTextFromFile.mockReset();
    mockedExtractInfoFromResume.mockReset();
  });

  it('renders the interview heading', () => {
    render(<InterviewSetup />);

    expect(
      screen.getByRole('heading', { name: /prepare for your ai interview/i })
    ).toBeInTheDocument();
  });

  it('shows extracted contact details and a pdf preview after upload', async () => {
    const user = userEvent.setup();
    mockedExtractTextFromFile.mockResolvedValue('Resume text');
    mockedExtractInfoFromResume.mockResolvedValue({
      name: 'Taylor Lee',
      email: 'taylor@example.com',
      phone: '555-0100',
      skills: ['React', 'TypeScript'],
      technologies: ['Node.js', 'GraphQL'],
      yearsOfExperience: 6,
      keyProjects: [
        {
          title: 'AI Platform',
          description: 'Built a delivery pipeline.',
        },
      ],
      rankedSkills: [
        {
          name: 'React',
          confidence: 0.9,
          level: 'Primary',
        },
      ],
    });

    render(<InterviewSetup />);

    const fileInput = screen.getByLabelText(/upload resume/i);
    const file = new File(['%PDF-1.4'], 'resume.pdf', {
      type: 'application/pdf',
    });

    await user.upload(fileInput, file);

    expect(await screen.findByTestId('resume-pdf-preview')).toBeInTheDocument();
    expect(screen.getByText('Taylor Lee')).toBeInTheDocument();
    expect(screen.getByText('taylor@example.com')).toBeInTheDocument();
    expect(screen.getByText('555-0100')).toBeInTheDocument();
    expect(screen.queryByText('React, TypeScript')).not.toBeInTheDocument();
    expect(screen.queryByText('Node.js, GraphQL')).not.toBeInTheDocument();
    expect(screen.queryByText('6 years')).not.toBeInTheDocument();
    expect(
      screen.queryByText('AI Platform: Built a delivery pipeline.')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('React (Primary, 90%)')
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /paste manually/i }));

    expect(
      screen.getByRole('textbox', { name: /paste resume text/i })
    ).toHaveValue('Resume text');
  });
});
