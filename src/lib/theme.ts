export type ThemeId = 'github' | 'green' | 'navy' | 'amber' | 'purple';

export interface Theme {
  id: ThemeId;
  label: string;
}

export const THEMES: readonly Theme[] = [
  { id: 'github', label: 'GitHub Dark' },
  { id: 'green', label: 'Classic Terminal' },
  { id: 'navy', label: 'Navy + Mint' },
  { id: 'amber', label: 'Warm Amber' },
  { id: 'purple', label: 'Night Owl' },
] as const;

export const DEFAULT_THEME_ID: ThemeId = 'github';
const STORAGE_KEY = 'theme';

const validIds = new Set<string>(THEMES.map((t) => t.id));

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === 'string' && validIds.has(value);
}

export function applyTheme(id: ThemeId): void {
  document.documentElement.dataset.theme = id;
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* storage disabled — ignore */
  }
}

export function loadSavedTheme(): ThemeId {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return isThemeId(raw) ? raw : DEFAULT_THEME_ID;
  } catch {
    return DEFAULT_THEME_ID;
  }
}
