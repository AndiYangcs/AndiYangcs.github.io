import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { VisitedCountry } from "../../lib/profile";

export interface CountryPopoverProps {
  country: VisitedCountry;
  anchor: { x: number; y: number };
  onClose: () => void;
}

const POPOVER_WIDTH = 320;
const POPOVER_OFFSET_Y = 12;
const VIEWPORT_PADDING = 8;

export function CountryPopover({ country, anchor, onClose }: CountryPopoverProps) {
  const titleId = useId();
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number }>({
    left: Math.max(VIEWPORT_PADDING, anchor.x - POPOVER_WIDTH / 2),
    top: Math.max(VIEWPORT_PADDING, anchor.y - POPOVER_OFFSET_Y),
  });

  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // After mount, measure and clamp inside the viewport.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    let left = anchor.x - rect.width / 2;
    let top = anchor.y - rect.height - POPOVER_OFFSET_Y;
    if (top < VIEWPORT_PADDING) {
      top = anchor.y + POPOVER_OFFSET_Y;
    }
    const maxLeft = window.innerWidth - rect.width - VIEWPORT_PADDING;
    left = Math.min(Math.max(VIEWPORT_PADDING, left), Math.max(VIEWPORT_PADDING, maxLeft));
    const maxTop = window.innerHeight - rect.height - VIEWPORT_PADDING;
    top = Math.min(Math.max(VIEWPORT_PADDING, top), Math.max(VIEWPORT_PADDING, maxTop));
    setPos({ left, top });
  }, [anchor.x, anchor.y, country.id]);

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      className="country-popover"
      style={{ left: `${pos.left}px`, top: `${pos.top}px`, width: `${POPOVER_WIDTH}px` }}
    >
      <header className="country-popover__head">
        <h3 id={titleId} className="country-popover__title">{country.name}</h3>
        <span className="country-popover__years">{country.years}</span>
        <button
          type="button"
          className="country-popover__close"
          aria-label="Close"
          onClick={onClose}
        >
          ✕
        </button>
      </header>
      <p className="country-popover__cities">{country.cities.join(", ")}</p>
      <p className="country-popover__summary">{country.summary}</p>

      <style>{`
        .country-popover {
          position: fixed;
          z-index: 200;
          background: var(--bg-elev);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: var(--space-4);
          box-shadow:
            0 4px 12px rgba(0, 0, 0, 0.3),
            0 12px 32px rgba(0, 0, 0, 0.25);
          color: var(--fg);
        }
        .country-popover__head {
          display: grid;
          grid-template-columns: 1fr auto auto;
          align-items: baseline;
          column-gap: var(--space-3);
          margin-bottom: var(--space-2);
        }
        .country-popover__title {
          margin: 0;
          font-size: var(--type-lg);
          color: var(--accent);
          font-family: var(--font-mono);
        }
        .country-popover__years {
          font-family: var(--font-mono);
          font-size: var(--type-sm);
          color: var(--fg-muted);
        }
        .country-popover__close {
          color: var(--fg-muted);
          padding: 0 var(--space-2);
          border-radius: var(--radius-sm);
          line-height: 1;
        }
        .country-popover__close:hover {
          color: var(--accent);
          background: var(--accent-soft);
        }
        .country-popover__cities {
          margin: 0 0 var(--space-3);
          font-family: var(--font-mono);
          font-size: var(--type-sm);
          color: var(--fg-muted);
        }
        .country-popover__summary { margin: 0; line-height: 1.55; }
      `}</style>
    </div>
  );
}

export default CountryPopover;