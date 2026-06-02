import { useEffect, useId } from "react";
import type { VisitedCountry } from "../../lib/profile";

export interface CountryBottomSheetProps {
  country: VisitedCountry;
  onClose: () => void;
}

export function CountryBottomSheet({ country, onClose }: CountryBottomSheetProps) {
  const titleId = useId();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      <div
        data-testid="country-sheet-scrim"
        className="country-sheet-scrim"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="country-sheet"
      >
        <header className="country-sheet__head">
          <h3 id={titleId} className="country-sheet__title">{country.name}</h3>
          <span className="country-sheet__years">{country.years}</span>
          <button
            type="button"
            className="country-sheet__close"
            aria-label="Close"
            onClick={onClose}
          >
            ✕
          </button>
        </header>
        <p className="country-sheet__cities">{country.cities.join(", ")}</p>
        <p className="country-sheet__summary">{country.summary}</p>
      </div>

      <style>{`
        .country-sheet-scrim {
          position: fixed; inset: 0;
          background: rgba(0, 0, 0, 0.25);
          z-index: 190;
        }
        .country-sheet {
          position: fixed;
          left: 0; right: 0; bottom: 0;
          z-index: 200;
          max-height: 60vh;
          overflow-y: auto;
          background: var(--bg-elev);
          border-top: 1px solid var(--border);
          border-top-left-radius: var(--radius-md);
          border-top-right-radius: var(--radius-md);
          padding: var(--space-4) var(--space-6) var(--space-6);
          box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.3);
          color: var(--fg);
        }
        .country-sheet__head {
          display: grid;
          grid-template-columns: 1fr auto auto;
          align-items: baseline;
          column-gap: var(--space-3);
          margin-bottom: var(--space-2);
        }
        .country-sheet__title {
          margin: 0;
          font-size: var(--type-lg);
          color: var(--accent);
          font-family: var(--font-mono);
        }
        .country-sheet__years {
          font-family: var(--font-mono);
          font-size: var(--type-sm);
          color: var(--fg-muted);
        }
        .country-sheet__close {
          color: var(--fg-muted);
          padding: 0 var(--space-2);
          border-radius: var(--radius-sm);
          line-height: 1;
        }
        .country-sheet__close:hover {
          color: var(--accent);
          background: var(--accent-soft);
        }
        .country-sheet__cities {
          margin: 0 0 var(--space-3);
          font-family: var(--font-mono);
          font-size: var(--type-sm);
          color: var(--fg-muted);
        }
        .country-sheet__summary { margin: 0; line-height: 1.55; }
      `}</style>
    </>
  );
}

export default CountryBottomSheet;