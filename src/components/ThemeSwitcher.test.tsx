import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ThemeSwitcher } from './ThemeSwitcher';

describe('ThemeSwitcher', () => {
  it('renders a button labelled with the current theme', () => {
    render(<ThemeSwitcher />);
    expect(
      screen.getByRole('button', { name: /theme/i }),
    ).toBeInTheDocument();
  });

  it('opens the menu and lists all 5 themes', async () => {
    const user = userEvent.setup();
    render(<ThemeSwitcher />);
    await user.click(screen.getByRole('button', { name: /theme/i }));
    const items = screen.getAllByRole('menuitemradio');
    expect(items).toHaveLength(5);
  });

  it('applies the chosen theme to document and storage', async () => {
    const user = userEvent.setup();
    render(<ThemeSwitcher />);
    await user.click(screen.getByRole('button', { name: /theme/i }));
    await user.click(screen.getByRole('menuitemradio', { name: /navy/i }));
    expect(document.documentElement.dataset.theme).toBe('navy');
    expect(localStorage.getItem('theme')).toBe('navy');
  });
});
