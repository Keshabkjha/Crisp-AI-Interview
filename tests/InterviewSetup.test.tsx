import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import WebcamMock from './mocks/react-webcam';

vi.mock('react-webcam', () => ({
  default: WebcamMock,
}));

describe('InterviewSetup', () => {
  it('renders the interview heading', async () => {
    const { InterviewSetup } = await import('../components/InterviewSetup');

    render(<InterviewSetup />);

    expect(
      screen.getByRole('heading', { name: /prepare for your ai interview/i })
    ).toBeInTheDocument();
  });
});
