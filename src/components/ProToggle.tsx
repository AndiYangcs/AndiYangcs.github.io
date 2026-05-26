import { markInternalNav } from '../lib/nav-flag';

export type Persona = 'professional' | 'personal';

const PATHS: Record<Persona, string> = {
  professional: '/professional',
  personal: '/personal',
};

const LABELS: Record<Persona, string> = {
  professional: 'Professional',
  personal: 'Personal',
};

export function ProToggle({ current }: { current: Persona }) {
  return (
    <nav className="pro-toggle" aria-label="Persona switcher">
      <span
        className="pro-toggle__indicator"
        data-side={current}
        aria-hidden="true"
      />
      {(['professional', 'personal'] as const).map((p) => (
        <a
          key={p}
          href={PATHS[p]}
          aria-current={p === current ? 'page' : undefined}
          onClick={(e) => {
            if (p === current) {
              e.preventDefault();
              return;
            }
            markInternalNav();
          }}
          className="pro-toggle__item"
        >
          {LABELS[p]}
        </a>
      ))}
      <style>{`
        .pro-toggle {
          position: fixed; top: var(--space-4); right: var(--space-4);
          display: inline-flex; align-items: center;
          padding: 4px;
          background: var(--bg-elev);
          border: 1px solid var(--border);
          border-radius: var(--radius-pill);
          z-index: 100;
          font-family: var(--font-mono);
          font-size: var(--type-sm);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
        }
        .pro-toggle__item {
          position: relative;
          padding: var(--space-2) var(--space-4);
          border-radius: var(--radius-pill);
          color: var(--fg-muted);
          transition: color 200ms ease;
          z-index: 1;
        }
        .pro-toggle__item[aria-current="page"] { color: var(--bg); }
        .pro-toggle__item:hover { text-decoration: none; color: var(--fg); }
        .pro-toggle__item[aria-current="page"]:hover { color: var(--bg); }
        .pro-toggle__indicator {
          position: absolute; top: 4px; bottom: 4px;
          width: calc(50% - 4px);
          background: var(--accent);
          border-radius: var(--radius-pill);
          transition: transform 250ms ease;
        }
        .pro-toggle__indicator[data-side="professional"] { left: 4px; transform: translateX(0); }
        .pro-toggle__indicator[data-side="personal"]     { left: 4px; transform: translateX(100%); }
      `}</style>
    </nav>
  );
}

export default ProToggle;