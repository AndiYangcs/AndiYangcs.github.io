import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ProToggle } from './ProToggle';

const originalLocation = window.location;

beforeEach(() => {
  sessionStorage.clear();
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { ...originalLocation, href: 'http://localhost/professional', assign: vi.fn() },
  });
});

describe('ProToggle', () => {
  it('marks active = professional on /professional', () => {
    render(<ProToggle current="professional" />);
    expect(
      screen.getByRole('link', { name: /professional/i }),
    ).toHaveAttribute('aria-current', 'page');
    expect(
      screen.getByRole('link', { name: /real/i }),
    ).not.toHaveAttribute('aria-current');
  });

  it('marks active = real on /real', () => {
    render(<ProToggle current="real" />);
    expect(screen.getByRole('link', { name: /real/i })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('sets internal-nav flag when clicking the other side', async () => {
    const user = userEvent.setup();
    render(<ProToggle current="professional" />);
    await user.click(screen.getByRole('link', { name: /real/i }));
    expect(sessionStorage.getItem('internal-nav')).toBe('1');
  });
});