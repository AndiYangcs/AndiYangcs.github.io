import { useEffect, useRef, useState } from 'react';
import {
  THEMES,
  applyTheme,
  loadSavedTheme,
  type ThemeId,
} from '../lib/theme';

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<ThemeId>(loadSavedTheme());
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const current = THEMES.find((t) => t.id === theme) ?? THEMES[0];

  return (
    <div ref={rootRef} className="theme-switcher">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Theme: ${current.label}. Change theme.`}
        onClick={() => setOpen((v) => !v)}
        className="theme-switcher__trigger"
      >
        🎨 <span>{current.label}</span>
      </button>
      {open && (
        <ul role="menu" className="theme-switcher__menu">
          {THEMES.map((t) => (
            <li key={t.id} role="none">
              <button
                type="button"
                role="menuitemradio"
                aria-checked={t.id === theme}
                onClick={() => {
                  setTheme(t.id);
                  setOpen(false);
                }}
                className="theme-switcher__item"
              >
                <span
                  aria-hidden="true"
                  className={
                    'theme-switcher__dot' +
                    (t.id === theme ? ' theme-switcher__dot--on' : '')
                  }
                />{' '}
                {t.label}
              </button>
            </li>
          ))}
        </ul>
      )}
      <style>{`
        .theme-switcher { position: relative; }
        .theme-switcher__trigger {
          display: inline-flex; align-items: center; gap: var(--space-2);
          padding: var(--space-2) var(--space-3);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          background: var(--bg-elev);
          color: var(--fg);
          font-size: var(--type-sm);
        }
        .theme-switcher__menu {
          position: absolute; left: 0; top: calc(100% + var(--space-2));
          list-style: none; margin: 0; padding: var(--space-2);
          background: var(--bg-elev);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          min-width: 12rem;
          z-index: 50;
        }
        .theme-switcher__item {
          display: flex; align-items: center; gap: var(--space-2);
          width: 100%; text-align: left;
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-sm);
          font-size: var(--type-sm);
        }
        .theme-switcher__item:hover { background: var(--accent-soft); }
        .theme-switcher__dot {
          display: inline-block;
          width: 0.7em;
          height: 0.7em;
          border-radius: 50%;
          border: 1.5px solid currentColor;
          background: transparent;
          flex-shrink: 0;
        }
        .theme-switcher__dot--on {
          background: currentColor;
        }
      `}</style>
    </div>
  );
}

export default ThemeSwitcher;
