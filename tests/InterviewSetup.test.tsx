import { render, screen } from '@testing-library/react';
import { forwardRef } from 'react';
import { vi } from 'vitest';

vi.mock('react-webcam', () => ({
  default: forwardRef<HTMLDivElement>((_props, ref) => (
    <div data-testid="webcam" ref={ref} />
  )),
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
