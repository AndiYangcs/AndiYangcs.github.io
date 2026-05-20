import { beforeEach, describe, expect, it } from 'vitest';
import {
  THEMES,
  DEFAULT_THEME_ID,
  applyTheme,
  loadSavedTheme,
  isThemeId,
} from './theme';

describe('theme', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('exposes all 5 themes with github as default', () => {
    expect(THEMES.map((t) => t.id)).toEqual([
      'github',
      'green',
      'navy',
      'amber',
      'purple',
    ]);
    expect(DEFAULT_THEME_ID).toBe('github');
  });

  it('validates known theme ids', () => {
    expect(isThemeId('navy')).toBe(true);
    expect(isThemeId('mauve')).toBe(false);
  });

  it('applyTheme sets data-theme and persists', () => {
    applyTheme('navy');
    expect(document.documentElement.dataset.theme).toBe('navy');
    expect(localStorage.getItem('theme')).toBe('navy');
  });

  it('loadSavedTheme returns saved value or default', () => {
    expect(loadSavedTheme()).toBe('github');
    localStorage.setItem('theme', 'amber');
    expect(loadSavedTheme()).toBe('amber');
  });

  it('loadSavedTheme falls back to default on garbage', () => {
    localStorage.setItem('theme', 'bogus');
    expect(loadSavedTheme()).toBe('github');
  });
});
