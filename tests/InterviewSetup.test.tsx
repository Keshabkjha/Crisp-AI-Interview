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

  it('populates contact inputs and hides extracted details for interviewees', async () => {
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
    expect(screen.getByLabelText(/name/i)).toHaveValue('Taylor Lee');
    expect(screen.getByLabelText(/email/i)).toHaveValue('taylor@example.com');
    expect(screen.getByLabelText(/phone/i)).toHaveValue('555-0100');
    expect(
      screen.queryByRole('heading', { name: /extracted details/i })
    ).not.toBeInTheDocument();
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

    const resumeTextarea = screen.getByRole('textbox', {
      name: /paste resume text/i,
    });
    expect(resumeTextarea).toHaveValue('Resume text');
    expect(resumeTextarea).not.toHaveAttribute('maxLength');
  });

  it('keeps existing contact values when parsing misses fields', async () => {
    const user = userEvent.setup();
    mockedExtractTextFromFile.mockResolvedValue('Resume text');
    mockedExtractInfoFromResume.mockResolvedValue({
      email: 'taylor@example.com',
    });

    render(<InterviewSetup />);

    const nameInput = screen.getByLabelText(/name/i);
    const fileInput = screen.getByLabelText(/upload resume/i);
    const file = new File(['%PDF-1.4'], 'resume.pdf', {
      type: 'application/pdf',
    });

    await user.type(nameInput, 'Alex Smith');
    await user.upload(fileInput, file);

    expect(await screen.findByTestId('resume-pdf-preview')).toBeInTheDocument();
    expect(nameInput).toHaveValue('Alex Smith');
    expect(screen.getByLabelText(/email/i)).toHaveValue('taylor@example.com');

    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Name');

    expect(nameInput).toHaveValue('Updated Name');
  });
});
