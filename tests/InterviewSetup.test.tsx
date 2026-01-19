import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import WebcamMock from './mocks/react-webcam';
import { InterviewSetup } from '../components/InterviewSetup';

vi.mock('react-webcam', () => ({
  default: WebcamMock,
}));

describe('InterviewSetup', () => {
  it('renders the interview heading', () => {
    render(<InterviewSetup />);

    expect(
      screen.getByRole('heading', { name: /prepare for your ai interview/i })
    ).toBeInTheDocument();
  });
});
