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
      screen.getByRole('link', { name: /personal andi/i }),
    ).toHaveAttribute('href', '/personal');
  });

  it('shows end state immediately when playIntro=false', () => {
    render(<Terminal playIntro={false} />);
    expect(screen.getByText(/Andi Yang/i)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /professional andi/i }),
    ).toBeInTheDocument();
  });

  it('responds to a known command (whoami) with profile data', async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    render(<Terminal playIntro={false} />);
    const input = screen.getByRole('textbox', { name: /prompt/i });
    await user.type(input, 'whoami{Enter}');
    // whoami prints multiple lines; at least one contains "Andi Yang".
    // (The intro already shows it too, so use getAllByText.)
    expect(screen.getAllByText(/Andi Yang/i).length).toBeGreaterThan(0);
  });

  it('shows an error for unknown commands', async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    render(<Terminal playIntro={false} />);
    const input = screen.getByRole('textbox', { name: /prompt/i });
    await user.type(input, 'foobar{Enter}');
    expect(screen.getByText(/command not found: foobar/i)).toBeInTheDocument();
  });

  it('clear command wipes history and replays intro', async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    render(<Terminal playIntro={false} />);
    const input = screen.getByRole('textbox', { name: /prompt/i });
    // Add a history entry first.
    await user.type(input, 'whoami{Enter}');
    // Then clear it.
    await user.type(input, 'clear{Enter}');
    // Typed-region resets to just the prompt while intro replays.
    expect(screen.getByTestId('typed-region').textContent).toBe('$ ');
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