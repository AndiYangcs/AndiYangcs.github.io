import type { MouseEvent } from "react";
import type { VisitedCountry } from "../../lib/profile";
import { sortedVisited } from "../../lib/travel";

export interface VisitedListProps {
  countries: readonly VisitedCountry[];
  /**
   * Called with the country id and the activating event when a list item
   * is clicked. Optional so the component can render as a static text
   * fallback when no handler is supplied.
   */
  onSelect?: (id: string, event: MouseEvent<HTMLButtonElement>) => void;
}

export function VisitedList({ countries, onSelect }: VisitedListProps) {
  if (countries.length === 0) return null;
  const items = sortedVisited(countries);

  return (
    <ul className="visited-list" aria-label="Countries visited">
      {items.map((c) => (
        <li key={c.id}>
          <button
            type="button"
            className="visited-list__row"
            onClick={(e) => onSelect?.(c.id, e)}
          >
            <span className="visited-list__name">{c.name}</span>
            <span className="visited-list__years">{c.years}</span>
            <span className="visited-list__cities">{c.cities.join(", ")}</span>
          </button>
        </li>
      ))}
      <style>{`
        .visited-list {
          list-style: none;
          padding: 0;
          margin: var(--space-6) 0 0;
          display: grid;
          gap: var(--space-2);
        }
        .visited-list__row {
          display: grid;
          grid-template-columns: minmax(8rem, 1fr) auto;
          grid-template-areas:
            "name years"
            "cities cities";
          column-gap: var(--space-4);
          row-gap: 2px;
          width: 100%;
          text-align: left;
          padding: var(--space-3) var(--space-4);
          background: var(--bg-elev);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          color: var(--fg);
          transition: border-color 200ms ease, background 200ms ease;
        }
        .visited-list__row:hover,
        .visited-list__row:focus-visible {
          border-color: var(--accent);
          background: var(--accent-soft);
        }
        .visited-list__name { grid-area: name; font-weight: 600; }
        .visited-list__years {
          grid-area: years;
          font-family: var(--font-mono);
          font-size: var(--type-sm);
          color: var(--fg-muted);
        }
        .visited-list__cities {
          grid-area: cities;
          font-family: var(--font-mono);
          font-size: var(--type-sm);
          color: var(--fg-muted);
        }
      `}</style>
    </ul>
  );
}

export default VisitedList;