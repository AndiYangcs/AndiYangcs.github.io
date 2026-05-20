import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Terminal } from './Terminal';

beforeEach(() => {
  sessionStorage.clear();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

function flushAnimation() {
  // Advance well past the maximum animation duration.
  act(() => {
    vi.advanceTimersByTime(20_000);
  });
}

describe('Terminal', () => {
  it('renders prompt and choice buttons after animation', () => {
    render(<Terminal playIntro={true} />);
    flushAnimation();
    expect(
      screen.getByRole('link', { name: /professional andi/i }),
    ).toHaveAttribute('href', '/professional');
    expect(
      screen.getByRole('link', { name: /real andi/i }),
    ).toHaveAttribute('href', '/real');
  });

  it('shows end state immediately when playIntro=false', () => {
    render(<Terminal playIntro={false} />);
    expect(screen.getByText(/Andi Yang/i)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /professional andi/i }),
    ).toBeInTheDocument();
  });

  it('answers any input with the canned response', async () => {
    vi.useRealTimers(); // userEvent needs real timers
    const user = userEvent.setup();
    render(<Terminal playIntro={false} />);
    const input = screen.getByRole('textbox', { name: /prompt/i });
    await user.type(input, 'hi there{Enter}');
    expect(screen.getByText(/wow! that sounds amazing/i)).toBeInTheDocument();
  });

  it('replay button restarts animation', async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    render(<Terminal playIntro={false} />);
    const replay = screen.getByRole('button', { name: /replay/i });
    await user.click(replay);
    // After replay, the typed-out region is reset; we assert
    // the visible text starts as just the prompt char.
    expect(screen.getByTestId('typed-region').textContent).toBe('$ ');
  });

  it('sets internal-nav flag when a choice button is clicked', async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    render(<Terminal playIntro={false} />);
    await user.click(screen.getByRole('link', { name: /professional andi/i }));
    expect(sessionStorage.getItem('internal-nav')).toBe('1');
  });
});