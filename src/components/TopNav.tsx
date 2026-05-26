import { useEffect, useRef, useState } from 'react';
import { THEMES, applyTheme, loadSavedTheme, type ThemeId } from '../lib/theme';
import { markInternalNav } from '../lib/nav-flag';

type Persona = 'professional' | 'personal';

export function TopNav({ persona }: { persona: Persona }) {
  const [open, setOpen] = useState(false);
  const [themesOpen, setThemesOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeId>(loadSavedTheme());
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Esc closes the side panel.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  // Lock body scroll while side panel is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const onTogglePersona = (target: Persona) => {
    if (target === persona) return;
    markInternalNav();
    window.location.href = target === 'professional' ? '/professional' : '/personal';
  };

  return (
    <>
      <header className="topnav">
        <button
          type="button"
          className="topnav__hamburger"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="side-panel"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="topnav__hamburger-bar" />
          <span className="topnav__hamburger-bar" />
          <span className="topnav__hamburger-bar" />
        </button>

        <div className="topnav__persona" role="group" aria-label="Persona">
          <button
            type="button"
            className={
              'topnav__pill' +
              (persona === 'professional' ? ' topnav__pill--active' : '')
            }
            aria-pressed={persona === 'professional'}
            onClick={() => onTogglePersona('professional')}
          >
            Professional
          </button>
          <button
            type="button"
            className={
              'topnav__pill' +
              (persona === 'personal' ? ' topnav__pill--active' : '')
            }
            aria-pressed={persona === 'personal'}
            onClick={() => onTogglePersona('personal')}
          >
            Personal
          </button>
        </div>
      </header>

      {/* Backdrop */}
      <div
        className={'side-panel-backdrop' + (open ? ' is-open' : '')}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Slide-in side panel */}
      <aside
        id="side-panel"
        ref={panelRef}
        className={'side-panel' + (open ? ' is-open' : '')}
        aria-hidden={!open}
      >
        <div className="side-panel__header">
          <span className="side-panel__title">Menu</span>
          <button
            type="button"
            className="side-panel__close"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          >
            ✕
          </button>
        </div>

        <nav className="side-panel__nav" aria-label="Side menu">
          <a
            href="/"
            className="side-panel__row side-panel__row--link"
            onClick={() => markInternalNav()}
          >
            <span>Home</span>
            <span aria-hidden="true" className="side-panel__chevron">↩</span>
          </a>

          <div
            className={
              'side-panel__item side-panel__item--expandable' +
              (themesOpen ? ' is-open' : '')
            }
          >
            <button
              type="button"
              className="side-panel__row"
              aria-expanded={themesOpen}
              onClick={() => setThemesOpen((v) => !v)}
            >
              <span>Themes</span>
              <span aria-hidden="true" className="side-panel__chevron">
                {themesOpen ? '▾' : '▸'}
              </span>
            </button>
            {themesOpen && (
              <ul className="side-panel__sublist" role="menu">
                {THEMES.map((t) => (
                  <li key={t.id} role="none">
                    <button
                      type="button"
                      role="menuitemradio"
                      aria-checked={t.id === theme}
                      className={
                        'side-panel__theme' +
                        (t.id === theme ? ' is-current' : '')
                      }
                      onClick={() => setTheme(t.id)}
                    >
                      <span
                        aria-hidden="true"
                        className={
                          'side-panel__dot' +
                          (t.id === theme ? ' side-panel__dot--on' : '')
                        }
                      />
                      {t.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </nav>
      </aside>

      <style>{`
        .topnav {
          position: fixed; top: 0; left: 0; right: 0;
          display: flex; justify-content: space-between; align-items: center;
          padding: var(--space-3) var(--space-6);
          background: color-mix(in srgb, var(--bg) 85%, transparent);
          backdrop-filter: blur(8px);
          border-bottom: 1px solid var(--border);
          z-index: 80;
        }
        .topnav__hamburger {
          display: inline-flex; flex-direction: column; gap: 4px;
          padding: var(--space-2);
          border-radius: var(--radius-sm);
        }
        .topnav__hamburger:hover { background: var(--accent-soft); }
        .topnav__hamburger-bar {
          width: 22px; height: 2px; background: var(--fg);
          border-radius: 1px; transition: background 200ms;
        }
        .topnav__hamburger:hover .topnav__hamburger-bar { background: var(--accent); }

        .topnav__persona {
          display: inline-flex; gap: var(--space-1);
          padding: 4px; border: 1px solid var(--border);
          border-radius: var(--radius-pill);
          background: var(--bg-elev);
        }
        .topnav__pill {
          padding: var(--space-1) var(--space-4);
          border-radius: var(--radius-pill);
          font-family: var(--font-mono);
          font-size: var(--type-sm);
          color: var(--fg-muted);
          transition: background 200ms, color 200ms;
        }
        .topnav__pill:hover { color: var(--fg); }
        .topnav__pill--active {
          background: var(--accent-soft);
          color: var(--accent);
        }

        /* Backdrop */
        .side-panel-backdrop {
          position: fixed; inset: 0;
          background: rgba(0, 0, 0, 0.5);
          opacity: 0; pointer-events: none;
          transition: opacity 250ms ease;
          z-index: 90;
        }
        .side-panel-backdrop.is-open {
          opacity: 1; pointer-events: auto;
        }

        /* Slide-in panel */
        .side-panel {
          position: fixed; top: 0; left: 0; bottom: 0;
          width: min(320px, 85vw);
          background: var(--bg-elev);
          border-right: 1px solid var(--border);
          transform: translateX(-100%);
          transition: transform 250ms ease;
          z-index: 100;
          display: flex; flex-direction: column;
          box-shadow: 4px 0 24px rgba(0, 0, 0, 0.3);
        }
        .side-panel.is-open { transform: translateX(0); }

        .side-panel__header {
          display: flex; justify-content: space-between; align-items: center;
          padding: var(--space-4) var(--space-6);
          border-bottom: 1px solid var(--border);
        }
        .side-panel__title {
          font-family: var(--font-mono);
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-size: var(--type-sm);
          color: var(--accent);
        }
        .side-panel__close {
          color: var(--fg-muted);
          padding: var(--space-1) var(--space-2);
          border-radius: var(--radius-sm);
        }
        .side-panel__close:hover { color: var(--accent); background: var(--accent-soft); }

        .side-panel__nav {
          padding: var(--space-4) var(--space-3);
          flex: 1;
        }
        .side-panel__row {
          display: flex; justify-content: space-between; align-items: center;
          width: 100%; text-align: left;
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-md);
          color: var(--fg);
          font-size: var(--type-base);
        }
        .side-panel__row:hover { background: var(--accent-soft); color: var(--accent); }
        .side-panel__row--link { text-decoration: none; }
        .side-panel__row--link:hover { text-decoration: none; }
        .side-panel__chevron {
          font-family: var(--font-mono);
          color: var(--fg-muted);
        }

        .side-panel__sublist {
          list-style: none; padding: var(--space-2) 0 var(--space-2) var(--space-4);
          margin: 0;
          display: flex; flex-direction: column; gap: var(--space-1);
        }
        .side-panel__theme {
          display: flex; align-items: center; gap: var(--space-3);
          width: 100%; text-align: left;
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-sm);
          font-size: var(--type-sm);
          color: var(--fg-muted);
        }
        .side-panel__theme:hover { background: var(--accent-soft); color: var(--fg); }
        .side-panel__theme.is-current { color: var(--accent); }
        .side-panel__dot {
          display: inline-block;
          width: 0.7em; height: 0.7em;
          border-radius: 50%;
          border: 1.5px solid currentColor;
          background: transparent;
          flex-shrink: 0;
        }
        .side-panel__dot--on { background: currentColor; }
      `}</style>
    </>
  );
}

export default TopNav;
