# Travel Map Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the placeholder `/travel` page with an interactive world map. Visited countries are filled in the active theme accent and clickable; clicking opens a popover (desktop) or bottom sheet (mobile) containing country name, year(s), cities, and a short summary. Pan + zoom enabled. A keyboard-accessible visited-country list lives below the map as a no-JS fallback.

**Architecture:** Astro page composes a static hero, a server-rendered visited-country list, and a React island (`WorldMap`) that owns map rendering and selection state. The island uses `@vnedyalk0v/react19-simple-maps` (React 19 fork of `react-simple-maps`) with `world-atlas` 110m TopoJSON. Pure logic lives in `src/lib/travel.ts` and `src/lib/use-media-query.ts` with co-located Vitest tests. Country content lives in `src/lib/profile.ts` as a single source of truth.

**Tech Stack:** Astro 5, React 19, TypeScript, `@vnedyalk0v/react19-simple-maps`, `world-atlas` 110m TopoJSON, Vitest, @testing-library/react, jsdom.

**Source spec:** [`docs/superpowers/specs/2026-06-02-travel-map-design.md`](../specs/2026-06-02-travel-map-design.md)

---

## File Structure

Files this plan creates or modifies (under the project root):

```
.
├── package.json                                ← + @vnedyalk0v/react19-simple-maps dep
├── public/
│   └── data/
│       └── world-110m.json                    ← Natural Earth 110m TopoJSON (downloaded)
├── src/
│   ├── lib/
│   │   ├── profile.ts                         ← + VisitedCountry interface + VISITED list
│   │   ├── travel.ts                          ← pure helpers: lookupById, isVisited
│   │   ├── travel.test.ts
│   │   ├── use-media-query.ts                 ← matchMedia hook
│   │   └── use-media-query.test.ts
│   ├── components/
│   │   └── travel/
│   │       ├── VisitedList.tsx                ← server-rendered list of visited countries
│   │       ├── VisitedList.test.tsx
│   │       ├── CountryPopover.tsx             ← desktop popover
│   │       ├── CountryPopover.test.tsx
│   │       ├── CountryBottomSheet.tsx         ← mobile bottom sheet
│   │       ├── CountryBottomSheet.test.tsx
│   │       ├── WorldMap.tsx                   ← React island: orchestrates everything
│   │       └── WorldMap.test.tsx
│   └── pages/
│       └── travel.astro                       ← replace placeholder with hero + WorldMap + list
```

**Boundaries:**
- `src/lib/*.ts` = pure logic. No JSX, no library imports beyond standard browser APIs (guarded for SSR).
- `src/components/travel/*.tsx` = React UI. Delegate logic to `lib/`.
- Tests live next to the file they test.

---

## Conventions (read once, apply throughout)

- **Working dir:** every command runs in the project root. Always pass it as the Bash tool's `cwd` parameter — never `cd` into it.
- **Shell:** PowerShell. Quote paths with spaces. The repo lives inside OneDrive, so the path contains spaces — quoting matters.
- **Tests:** every file under `src/lib/` ships with a `.test.ts`. Every component under `src/components/travel/` ships with a `.test.tsx`. Astro files are not unit-tested; they're verified by `npm run build` and a manual smoke check.
- **Mock pattern for the map library:** the React 19 fork of `react-simple-maps` parses TopoJSON and renders SVG via `d3-geo`, which jsdom handles poorly. `WorldMap.test.tsx` uses `vi.mock('@vnedyalk0v/react19-simple-maps', ...)` to replace `ComposableMap`, `Geographies`, `Geography`, and `ZoomableGroup` with simple stubs that render `data-testid`-d elements and forward `onClick` handlers. This lets us test selection logic without booting d3.
- **Vitest setup** ([`vitest.setup.ts`](../../vitest.setup.ts)) already clears `localStorage`, `sessionStorage`, and the `data-theme` attribute between tests; nothing extra needed.
- **Commits:** after each task ends with all checks passing, commit using the message in that task's final step.
- **CRLF warning:** git on Windows will show `LF will be replaced by CRLF` for new files. This is expected and safe.

---

## Task 1: Install map dependency + ship TopoJSON data

**Files:**
- Modify: `package.json` (via `npm install`)
- Create: `public/data/world-110m.json`

- [ ] **Step 1.1: Install the React 19 map library**

```powershell
npm install @vnedyalk0v/react19-simple-maps@^2.0.7
```

Expected: dependency added under `dependencies` in `package.json`, no peer-dep warnings about React 19.

- [ ] **Step 1.2: Create the public data directory**

```powershell
New-Item -ItemType Directory -Path "public\data" -Force | Out-Null
```

- [ ] **Step 1.3: Download the world TopoJSON**

```powershell
Invoke-WebRequest -Uri "https://unpkg.com/world-atlas@2.0.2/countries-110m.json" -OutFile "public\data\world-110m.json"
```

Verify:

```powershell
(Get-Item "public\data\world-110m.json").Length
```

Expected: roughly 95000–105000 bytes.

- [ ] **Step 1.4: Confirm the file shape**

The map matches countries by feature `id` (a 3-digit numeric ISO 3166-1 code as a string). Sanity-check that:

```powershell
$j = Get-Content -Raw "public\data\world-110m.json" | ConvertFrom-Json
$norway = $j.objects.countries.geometries | Where-Object { $_.id -eq "578" }
$norway.properties.name
```

Expected: `Norway`.

- [ ] **Step 1.5: Verify the existing build still passes**

```powershell
npm run build
```

Expected: exit code 0.

- [ ] **Step 1.6: Commit**

```powershell
git add package.json package-lock.json public\data\world-110m.json
git commit -m "feat(travel): add map library + world TopoJSON data"
```

---
## Task 2: Extend profile.ts with VisitedCountry data model

**Files:**
- Modify: `src/lib/profile.ts`

- [ ] **Step 2.1: Add the `VisitedCountry` interface**

Open `src/lib/profile.ts` and add the following interface immediately after the existing `FavouriteCategory` interface (around line 67), before `interface AboutHighlight`:

```ts
export interface VisitedCountry {
  /**
   * Numeric ISO 3166-1 code as a 3-character string, e.g. "578" for Norway.
   * Matched against the `id` field on each feature in
   * `public/data/world-110m.json` (world-atlas 110m TopoJSON).
   * Lookup table: https://en.wikipedia.org/wiki/ISO_3166-1_numeric
   */
  id: string;
  /** Human-readable display name shown in the popover/list. */
  name: string;
  /** Year(s) visited as a free-form string, e.g. "2024" or "2019, 2023" or "2000–". */
  years: string;
  /** Ordered list of cities/regions visited. */
  cities: string[];
  /** 1–3 sentence personal note. Plain text; no markdown. */
  summary: string;
}
```

- [ ] **Step 2.2: Add `visited` to the `Profile` interface**

In the `Profile` interface block, add this line just below the existing `favourites: FavouriteCategory[];` line:

```ts
  visited: VisitedCountry[];
```

- [ ] **Step 2.3: Add the seed `VISITED` list to the `PROFILE` constant**

At the bottom of the `PROFILE` object literal — directly after the closing `]` of the `favourites:` block and before the final `}` of the object — add:

```ts
  /**
   * Countries Andi has visited. The map on /travel reads this list to
   * highlight visited countries and to render the side list of trips.
   * IDs are numeric ISO 3166-1 codes; find yours here:
   * https://en.wikipedia.org/wiki/ISO_3166-1_numeric
   */
  visited: [
    {
      id: "036",
      name: "Australia",
      years: "2000–",
      cities: ["Sydney", "Melbourne", "Brisbane"],
      summary:
        "Home base. Born somewhere else, but everything that matters " +
        "I learned here.",
    },
    {
      id: "156",
      name: "China",
      years: "1998",
      cities: ["Shenzhen"],
      summary:
        "Where I was born. Visits since then have been short, but the " +
        "food and the pace still feel familiar in a way I can't shake.",
    },
    {
      id: "392",
      name: "Japan",
      years: "2019, 2023",
      cities: ["Tokyo", "Kyoto", "Osaka"],
      summary:
        "Comfortably my favourite country to walk around in. Two trips " +
        "in, still nowhere near done.",
    },
    {
      id: "578",
      name: "Norway",
      years: "2024",
      cities: ["Oslo", "Bergen", "Tromsø"],
      summary:
        "Currently my favourite trip. Fjords, the Arctic Circle, and a " +
        "level of quiet I didn't know cities could have.",
    },
    {
      id: "410",
      name: "South Korea",
      years: "2019",
      cities: ["Seoul"],
      summary:
        "A long stopover that turned into one of the best food weeks of " +
        "my life.",
    },
    {
      id: "702",
      name: "Singapore",
      years: "2018, 2024",
      cities: ["Singapore"],
      summary:
        "A reliable layover that I always end up extending. Hawker " +
        "centres are the main draw.",
    },
    {
      id: "764",
      name: "Thailand",
      years: "2022",
      cities: ["Bangkok", "Chiang Mai"],
      summary:
        "First proper trip after the world reopened. Spent more on mango " +
        "sticky rice than I'm willing to admit.",
    },
    {
      id: "458",
      name: "Malaysia",
      years: "2022",
      cities: ["Kuala Lumpur"],
      summary:
        "A quick add-on to the Thailand trip. KL nights and roti canai " +
        "breakfasts.",
    },
    {
      id: "826",
      name: "United Kingdom",
      years: "2017",
      cities: ["London"],
      summary:
        "Family trip. Museums, the Tube, and the realisation that " +
        "Australian coffee really is better.",
    },
    {
      id: "250",
      name: "France",
      years: "2017",
      cities: ["Paris"],
      summary:
        "Same trip as the UK, different vibe. Croissants peaked here " +
        "and have been a disappointment everywhere else since.",
    },
    {
      id: "380",
      name: "Italy",
      years: "2017",
      cities: ["Rome", "Florence", "Venice"],
      summary:
        "Standard European tour stop. Lived on pasta and gelato for ten " +
        "days. Recommended.",
    },
  ],
```

(Andi will freely edit content here later — only the `id` field is structural.)

- [ ] **Step 2.4: Verify TypeScript still compiles**

```powershell
npm run build
```

Expected: exit code 0.

- [ ] **Step 2.5: Commit**

```powershell
git add src\lib\profile.ts
git commit -m "feat(travel): add VisitedCountry data model with seed list"
```

---

## Task 3: travel.ts pure helpers (TDD)

**Files:**
- Create: `src/lib/travel.ts`
- Create: `src/lib/travel.test.ts`

- [ ] **Step 3.1: Write the failing test**

Create `src/lib/travel.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { lookupById, isVisited, sortedVisited } from "./travel";
import type { VisitedCountry } from "./profile";

const FIXTURE: VisitedCountry[] = [
  { id: "578", name: "Norway", years: "2024", cities: ["Oslo"], summary: "fjords" },
  { id: "036", name: "Australia", years: "2000–", cities: ["Sydney"], summary: "home" },
  { id: "392", name: "Japan", years: "2019", cities: ["Tokyo"], summary: "food" },
];

describe("lookupById", () => {
  it("returns the matching country", () => {
    expect(lookupById(FIXTURE, "578")?.name).toBe("Norway");
  });
  it("returns undefined for unknown ids", () => {
    expect(lookupById(FIXTURE, "999")).toBeUndefined();
  });
  it("returns undefined for empty id", () => {
    expect(lookupById(FIXTURE, "")).toBeUndefined();
  });
});

describe("isVisited", () => {
  it("returns true for visited ids", () => {
    expect(isVisited(FIXTURE, "036")).toBe(true);
  });
  it("returns false for unvisited ids", () => {
    expect(isVisited(FIXTURE, "999")).toBe(false);
  });
});

describe("sortedVisited", () => {
  it("returns countries alphabetised by name", () => {
    const names = sortedVisited(FIXTURE).map((c) => c.name);
    expect(names).toEqual(["Australia", "Japan", "Norway"]);
  });
  it("does not mutate the input array", () => {
    const before = FIXTURE.map((c) => c.id);
    sortedVisited(FIXTURE);
    expect(FIXTURE.map((c) => c.id)).toEqual(before);
  });
});
```

- [ ] **Step 3.2: Run the test to confirm it fails**

```powershell
npm test -- src/lib/travel.test.ts
```

Expected: failure complaining `./travel` cannot be resolved.

- [ ] **Step 3.3: Implement the helpers**

Create `src/lib/travel.ts`:

```ts
/**
 * Pure helpers for the travel map. No DOM, no React.
 * Tested in travel.test.ts.
 */

import type { VisitedCountry } from "./profile";

export function lookupById(
  countries: readonly VisitedCountry[],
  id: string,
): VisitedCountry | undefined {
  if (!id) return undefined;
  return countries.find((c) => c.id === id);
}

export function isVisited(
  countries: readonly VisitedCountry[],
  id: string,
): boolean {
  return lookupById(countries, id) !== undefined;
}

export function sortedVisited(
  countries: readonly VisitedCountry[],
): VisitedCountry[] {
  return [...countries].sort((a, b) => a.name.localeCompare(b.name));
}
```

- [ ] **Step 3.4: Run the test to confirm it passes**

```powershell
npm test -- src/lib/travel.test.ts
```

Expected: all 7 tests pass.

- [ ] **Step 3.5: Commit**

```powershell
git add src\lib\travel.ts src\lib\travel.test.ts
git commit -m "feat(travel): add pure helpers + tests for visited-country lookups"
```

---
## Task 4: `useMediaQuery` hook (TDD)

**Files:**
- Create: `src/lib/use-media-query.ts`
- Create: `src/lib/use-media-query.test.ts`

This hook backs the desktop-popover vs. mobile-bottom-sheet switch in `WorldMap`.

- [ ] **Step 4.1: Write the failing test**

Create `src/lib/use-media-query.test.ts`:

```ts
import { renderHook, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useMediaQuery } from "./use-media-query";

type Listener = (ev: { matches: boolean }) => void;

interface FakeMediaQueryList {
  matches: boolean;
  addEventListener: (type: "change", listener: Listener) => void;
  removeEventListener: (type: "change", listener: Listener) => void;
  _fire: (matches: boolean) => void;
}

function makeMql(initial: boolean): FakeMediaQueryList {
  const listeners = new Set<Listener>();
  const mql: FakeMediaQueryList = {
    matches: initial,
    addEventListener: (_type, l) => { listeners.add(l); },
    removeEventListener: (_type, l) => { listeners.delete(l); },
    _fire: (matches) => {
      mql.matches = matches;
      listeners.forEach((l) => l({ matches }));
    },
  };
  return mql;
}

describe("useMediaQuery", () => {
  let mql: FakeMediaQueryList;

  beforeEach(() => {
    mql = makeMql(true);
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn().mockReturnValue(mql),
    });
  });

  it("returns the initial match value", () => {
    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));
    expect(result.current).toBe(true);
  });

  it("updates when the media query state changes", () => {
    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));
    act(() => mql._fire(false));
    expect(result.current).toBe(false);
  });

  it("returns false when matchMedia is unavailable", async () => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: undefined,
    });
    const mod = await import("./use-media-query");
    const { result } = renderHook(() => mod.useMediaQuery("(min-width: 768px)"));
    expect(result.current).toBe(false);
  });
});
```

- [ ] **Step 4.2: Run the test to confirm it fails**

```powershell
npm test -- src/lib/use-media-query.test.ts
```

Expected: failure complaining `./use-media-query` cannot be resolved.

- [ ] **Step 4.3: Implement the hook**

Create `src/lib/use-media-query.ts`:

```ts
import { useEffect, useState } from "react";

/**
 * Returns whether the given CSS media query currently matches.
 * Safe to call during SSR or when matchMedia is unavailable — returns
 * false in those cases.
 */
export function useMediaQuery(query: string): boolean {
  const get = (): boolean => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia(query).matches;
  };

  const [matches, setMatches] = useState<boolean>(get);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia(query);
    const onChange = (ev: MediaQueryListEvent | { matches: boolean }) => {
      setMatches(ev.matches);
    };
    setMatches(mql.matches);
    mql.addEventListener("change", onChange as (ev: MediaQueryListEvent) => void);
    return () => {
      mql.removeEventListener("change", onChange as (ev: MediaQueryListEvent) => void);
    };
  }, [query]);

  return matches;
}
```

- [ ] **Step 4.4: Run the test to confirm it passes**

```powershell
npm test -- src/lib/use-media-query.test.ts
```

Expected: all 3 tests pass.

- [ ] **Step 4.5: Commit**

```powershell
git add src\lib\use-media-query.ts src\lib\use-media-query.test.ts
git commit -m "feat(travel): add useMediaQuery hook for desktop/mobile renderer switch"
```

---

## Task 5: VisitedList component (TDD)

**Files:**
- Create: `src/components/travel/VisitedList.tsx`
- Create: `src/components/travel/VisitedList.test.tsx`

This component renders the keyboard-accessible list below the map and is the no-JS fallback.

- [ ] **Step 5.1: Write the failing test**

Create `src/components/travel/VisitedList.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { VisitedList } from "./VisitedList";
import type { VisitedCountry } from "../../lib/profile";

const FIXTURE: VisitedCountry[] = [
  { id: "578", name: "Norway", years: "2024", cities: ["Oslo"], summary: "fjords" },
  { id: "036", name: "Australia", years: "2000–", cities: ["Sydney", "Melbourne"], summary: "home" },
];

describe("VisitedList", () => {
  it("renders countries alphabetised by name", () => {
    render(<VisitedList countries={FIXTURE} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons[0].textContent).toContain("Australia");
    expect(buttons[1].textContent).toContain("Norway");
  });

  it("shows year(s) and cities for each country", () => {
    render(<VisitedList countries={FIXTURE} />);
    const norway = screen.getByRole("button", { name: /norway/i });
    expect(norway).toHaveTextContent("2024");
    expect(norway).toHaveTextContent("Oslo");
  });

  it("calls onSelect with the country id when a button is activated", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<VisitedList countries={FIXTURE} onSelect={onSelect} />);
    await user.click(screen.getByRole("button", { name: /norway/i }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0][0]).toBe("578");
  });

  it("renders nothing when the list is empty", () => {
    const { container } = render(<VisitedList countries={[]} />);
    expect(container.querySelector("ul")).toBeNull();
  });
});
```

- [ ] **Step 5.2: Run the test to confirm it fails**

```powershell
npm test -- src/components/travel/VisitedList.test.tsx
```

Expected: failure complaining `./VisitedList` cannot be resolved.

- [ ] **Step 5.3: Implement the component**

Create `src/components/travel/VisitedList.tsx`:

```tsx
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
```

- [ ] **Step 5.4: Run the test to confirm it passes**

```powershell
npm test -- src/components/travel/VisitedList.test.tsx
```

Expected: all 4 tests pass.

- [ ] **Step 5.5: Commit**

```powershell
git add src\components\travel\VisitedList.tsx src\components\travel\VisitedList.test.tsx
git commit -m "feat(travel): add VisitedList component with tests"
```

---
## Task 6: CountryPopover component (TDD)

**Files:**
- Create: `src/components/travel/CountryPopover.tsx`
- Create: `src/components/travel/CountryPopover.test.tsx`

Desktop popover, positioned absolutely against viewport coords passed in via the `anchor` prop. Auto-clamps inside the viewport.

- [ ] **Step 6.1: Write the failing test**

Create `src/components/travel/CountryPopover.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CountryPopover } from "./CountryPopover";
import type { VisitedCountry } from "../../lib/profile";

const NORWAY: VisitedCountry = {
  id: "578",
  name: "Norway",
  years: "2024",
  cities: ["Oslo", "Bergen", "Tromsø"],
  summary: "Fjords, fjords, fjords.",
};

describe("CountryPopover", () => {
  it("renders country name, years, cities, and summary", () => {
    render(<CountryPopover country={NORWAY} anchor={{ x: 100, y: 100 }} onClose={() => {}} />);
    expect(screen.getByRole("heading", { name: /norway/i })).toBeInTheDocument();
    expect(screen.getByText("2024")).toBeInTheDocument();
    expect(screen.getByText(/Oslo.*Bergen.*Tromsø/)).toBeInTheDocument();
    expect(screen.getByText(/Fjords, fjords, fjords\./)).toBeInTheDocument();
  });

  it("uses role=dialog with the country name as the accessible name", () => {
    render(<CountryPopover country={NORWAY} anchor={{ x: 100, y: 100 }} onClose={() => {}} />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAccessibleName(/norway/i);
  });

  it("fires onClose when the close button is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<CountryPopover country={NORWAY} anchor={{ x: 100, y: 100 }} onClose={onClose} />);
    await user.click(screen.getByRole("button", { name: /close/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("fires onClose when Escape is pressed", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<CountryPopover country={NORWAY} anchor={{ x: 100, y: 100 }} onClose={onClose} />);
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("positions itself near the anchor point", () => {
    render(<CountryPopover country={NORWAY} anchor={{ x: 150, y: 200 }} onClose={() => {}} />);
    const dialog = screen.getByRole("dialog");
    expect(dialog.style.left).toMatch(/^\d+px$/);
    expect(dialog.style.top).toMatch(/^\d+px$/);
  });
});
```

- [ ] **Step 6.2: Run the test to confirm it fails**

```powershell
npm test -- src/components/travel/CountryPopover.test.tsx
```

Expected: failure complaining `./CountryPopover` cannot be resolved.

- [ ] **Step 6.3: Implement the component**

Create `src/components/travel/CountryPopover.tsx`:

```tsx
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
```

- [ ] **Step 6.4: Run the test to confirm it passes**

```powershell
npm test -- src/components/travel/CountryPopover.test.tsx
```

Expected: all 5 tests pass.

- [ ] **Step 6.5: Commit**

```powershell
git add src\components\travel\CountryPopover.tsx src\components\travel\CountryPopover.test.tsx
git commit -m "feat(travel): add CountryPopover component with tests"
```

---

## Task 7: CountryBottomSheet component (TDD)

**Files:**
- Create: `src/components/travel/CountryBottomSheet.tsx`
- Create: `src/components/travel/CountryBottomSheet.test.tsx`

Mobile-style sheet anchored to the bottom edge, with a scrim backdrop.

- [ ] **Step 7.1: Write the failing test**

Create `src/components/travel/CountryBottomSheet.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CountryBottomSheet } from "./CountryBottomSheet";
import type { VisitedCountry } from "../../lib/profile";

const NORWAY: VisitedCountry = {
  id: "578",
  name: "Norway",
  years: "2024",
  cities: ["Oslo", "Bergen"],
  summary: "Cold and quiet.",
};

describe("CountryBottomSheet", () => {
  it("renders country data inside a dialog", () => {
    render(<CountryBottomSheet country={NORWAY} onClose={() => {}} />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAccessibleName(/norway/i);
    expect(dialog).toHaveTextContent("2024");
    expect(dialog).toHaveTextContent("Oslo, Bergen");
    expect(dialog).toHaveTextContent("Cold and quiet.");
  });

  it("fires onClose when the close button is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<CountryBottomSheet country={NORWAY} onClose={onClose} />);
    await user.click(screen.getByRole("button", { name: /close/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("fires onClose when the scrim is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<CountryBottomSheet country={NORWAY} onClose={onClose} />);
    await user.click(screen.getByTestId("country-sheet-scrim"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("fires onClose when Escape is pressed", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<CountryBottomSheet country={NORWAY} onClose={onClose} />);
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 7.2: Run the test to confirm it fails**

```powershell
npm test -- src/components/travel/CountryBottomSheet.test.tsx
```

Expected: failure complaining `./CountryBottomSheet` cannot be resolved.

- [ ] **Step 7.3: Implement the component**

Create `src/components/travel/CountryBottomSheet.tsx`:

```tsx
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
```

- [ ] **Step 7.4: Run the test to confirm it passes**

```powershell
npm test -- src/components/travel/CountryBottomSheet.test.tsx
```

Expected: all 4 tests pass.

- [ ] **Step 7.5: Commit**

```powershell
git add src\components\travel\CountryBottomSheet.tsx src\components\travel\CountryBottomSheet.test.tsx
git commit -m "feat(travel): add CountryBottomSheet component with tests"
```

---
## Task 8: WorldMap orchestrator component (TDD with mocked map library)

**Files:**
- Create: `src/components/travel/WorldMap.tsx`
- Create: `src/components/travel/WorldMap.test.tsx`

This is the React island. It owns the `Selection` state, renders the map + zoom controls + visited list, and swaps between popover and bottom sheet based on viewport width.

The map library is mocked in tests so we can drive `onClick` handlers from country stubs without booting d3.

- [ ] **Step 8.1: Write the failing test**

Create `src/components/travel/WorldMap.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import type { ReactNode, MouseEvent as RMouseEvent } from "react";
import type { VisitedCountry } from "../../lib/profile";

// --- Mock the map library so jsdom can render the component without d3. ---
vi.mock("@vnedyalk0v/react19-simple-maps", () => {
  const FAKE_GEOS = [
    { id: "578" }, // Norway (visited)
    { id: "036" }, // Australia (visited)
    { id: "999" }, // Unknown (unvisited)
  ];
  return {
    ComposableMap: ({ children }: { children: ReactNode }) => (
      <div data-testid="composable-map">{children}</div>
    ),
    ZoomableGroup: ({
      children,
      onMoveStart,
    }: {
      children: ReactNode;
      onMoveStart?: () => void;
    }) => (
      <div data-testid="zoomable-group" onMouseDown={() => onMoveStart?.()}>
        {children}
      </div>
    ),
    Geographies: ({
      children,
    }: {
      children: (args: { geographies: { rsmKey: string; id: string }[] }) => ReactNode;
    }) =>
      children({
        geographies: FAKE_GEOS.map((g) => ({ rsmKey: `geo-${g.id}`, id: g.id })),
      }),
    Geography: ({
      geography,
      onClick,
      className,
    }: {
      geography: { id: string };
      onClick?: (e: RMouseEvent) => void;
      className?: string;
    }) => (
      <button
        type="button"
        data-testid={`geo-${geography.id}`}
        className={className}
        onClick={onClick}
      >
        country-{geography.id}
      </button>
    ),
  };
});

import { WorldMap } from "./WorldMap";

const FIXTURE: VisitedCountry[] = [
  { id: "578", name: "Norway", years: "2024", cities: ["Oslo"], summary: "fjords" },
  { id: "036", name: "Australia", years: "2000–", cities: ["Sydney"], summary: "home" },
];

beforeEach(() => {
  // Force desktop viewport (matchMedia true → popover, not sheet).
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  });
});

describe("WorldMap", () => {
  it("renders the map, visited list, and zoom controls", () => {
    render(<WorldMap countries={FIXTURE} />);
    expect(screen.getByTestId("composable-map")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /zoom in/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /zoom out/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reset/i })).toBeInTheDocument();
    expect(screen.getByLabelText("Countries visited")).toBeInTheDocument();
  });

  it("opens a popover when a visited country is clicked", async () => {
    const user = userEvent.setup();
    render(<WorldMap countries={FIXTURE} />);
    await user.click(screen.getByTestId("geo-578"));
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveAccessibleName(/norway/i);
  });

  it("does NOT open a popover when an unvisited country is clicked", async () => {
    const user = userEvent.setup();
    render(<WorldMap countries={FIXTURE} />);
    await user.click(screen.getByTestId("geo-999"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes the popover on Escape", async () => {
    const user = userEvent.setup();
    render(<WorldMap countries={FIXTURE} />);
    await user.click(screen.getByTestId("geo-578"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens the popover when a list item is activated", async () => {
    const user = userEvent.setup();
    render(<WorldMap countries={FIXTURE} />);
    await user.click(screen.getByRole("button", { name: /australia/i }));
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveAccessibleName(/australia/i);
  });

  it("closes the popover when the map starts panning/zooming", async () => {
    const user = userEvent.setup();
    render(<WorldMap countries={FIXTURE} />);
    await user.click(screen.getByTestId("geo-578"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    const zg = screen.getByTestId("zoomable-group");
    await user.pointer({ keys: "[MouseLeft>]", target: zg });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders the bottom sheet instead of the popover when matchMedia reports mobile", async () => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    });
    const user = userEvent.setup();
    render(<WorldMap countries={FIXTURE} />);
    await user.click(screen.getByTestId("geo-578"));
    expect(await screen.findByTestId("country-sheet-scrim")).toBeInTheDocument();
  });
});
```

- [ ] **Step 8.2: Run the test to confirm it fails**

```powershell
npm test -- src/components/travel/WorldMap.test.tsx
```

Expected: failure complaining `./WorldMap` cannot be resolved.

- [ ] **Step 8.3: Implement the component**

Create `src/components/travel/WorldMap.tsx`:

```tsx
import { useState, useCallback } from "react";
import type { MouseEvent } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "@vnedyalk0v/react19-simple-maps";
import type { VisitedCountry } from "../../lib/profile";
import { lookupById, isVisited } from "../../lib/travel";
import { useMediaQuery } from "../../lib/use-media-query";
import { CountryPopover } from "./CountryPopover";
import { CountryBottomSheet } from "./CountryBottomSheet";
import { VisitedList } from "./VisitedList";

export interface WorldMapProps {
  countries: readonly VisitedCountry[];
}

type Selection =
  | { kind: "none" }
  | { kind: "country"; id: string; anchor: { x: number; y: number } };

const GEO_URL = "/data/world-110m.json";

const ZOOM_MIN = 1;
const ZOOM_MAX = 8;
const ZOOM_STEP = 1.5;

interface GeoFeature {
  rsmKey: string;
  id: string;
}

export function WorldMap({ countries }: WorldMapProps) {
  const [selection, setSelection] = useState<Selection>({ kind: "none" });
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([0, 20]);

  const isDesktop = useMediaQuery("(min-width: 768px)");

  const close = useCallback(() => setSelection({ kind: "none" }), []);

  const openFor = useCallback(
    (id: string, anchor: { x: number; y: number }) => {
      if (!isVisited(countries, id)) return;
      setSelection({ kind: "country", id, anchor });
    },
    [countries],
  );

  const onCountryClick = (id: string, e: MouseEvent) => {
    openFor(id, { x: e.clientX, y: e.clientY });
  };

  const onListSelect = (id: string, e: MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    openFor(id, { x: rect.left + 16, y: rect.bottom });
  };

  const zoomIn = () => setZoom((z) => Math.min(ZOOM_MAX, z * ZOOM_STEP));
  const zoomOut = () => setZoom((z) => Math.max(ZOOM_MIN, z / ZOOM_STEP));
  const reset = () => {
    setZoom(1);
    setCenter([0, 20]);
    close();
  };

  const onMoveStart = () => close();
  const onMoveEnd = (position: { coordinates: [number, number]; zoom: number }) => {
    setCenter(position.coordinates);
    setZoom(position.zoom);
  };

  const selected =
    selection.kind === "country" ? lookupById(countries, selection.id) : undefined;

  return (
    <div className="world-map">
      <div className="world-map__svg-wrap">
        <ComposableMap
          projection="geoEqualEarth"
          projectionConfig={{ scale: 155 }}
          width={800}
          height={420}
          style={{ width: "100%", height: "auto" }}
        >
          <ZoomableGroup
            zoom={zoom}
            center={center}
            minZoom={ZOOM_MIN}
            maxZoom={ZOOM_MAX}
            onMoveStart={onMoveStart}
            onMoveEnd={onMoveEnd}
          >
            <Geographies geography={GEO_URL}>
              {({ geographies }: { geographies: GeoFeature[] }) =>
                geographies.map((geo) => {
                  const visited = isVisited(countries, geo.id);
                  const isSelected =
                    selection.kind === "country" && selection.id === geo.id;
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      className={
                        "country" +
                        (visited ? " country--visited" : " country--unvisited") +
                        (isSelected ? " is-selected" : "")
                      }
                      tabIndex={visited ? 0 : -1}
                      aria-label={
                        visited
                          ? `${lookupById(countries, geo.id)?.name}, visited. Click for trip details.`
                          : undefined
                      }
                      onClick={(e: MouseEvent) => {
                        if (visited) onCountryClick(geo.id, e);
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>

        <div className="world-map__controls" role="group" aria-label="Map zoom">
          <button type="button" onClick={zoomIn} aria-label="Zoom in">+</button>
          <button type="button" onClick={zoomOut} aria-label="Zoom out">−</button>
          <button type="button" onClick={reset} aria-label="Reset zoom">⟲</button>
        </div>
      </div>

      <VisitedList countries={countries} onSelect={onListSelect} />

      {selected && isDesktop && (
        <CountryPopover
          country={selected}
          anchor={selection.kind === "country" ? selection.anchor : { x: 0, y: 0 }}
          onClose={close}
        />
      )}
      {selected && !isDesktop && (
        <CountryBottomSheet country={selected} onClose={close} />
      )}

      <style>{`
        .world-map { display: block; }
        .world-map__svg-wrap {
          position: relative;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: var(--space-3);
          overflow: hidden;
        }
        .country--unvisited {
          fill: var(--bg-elev);
          stroke: var(--border);
          stroke-width: 0.5;
          outline: none;
        }
        .country--visited {
          fill: var(--accent);
          stroke: var(--bg);
          stroke-width: 0.5;
          cursor: pointer;
          outline: none;
          transition: filter 200ms ease;
        }
        .country--visited:hover,
        .country--visited:focus-visible,
        .country--visited.is-selected {
          filter: drop-shadow(0 0 8px var(--accent-soft));
        }
        .world-map__controls {
          position: absolute;
          right: var(--space-3);
          bottom: var(--space-3);
          display: flex;
          flex-direction: column;
          gap: 4px;
          background: var(--bg-elev);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 4px;
        }
        .world-map__controls button {
          width: 32px; height: 32px;
          font-family: var(--font-mono);
          color: var(--fg);
          border-radius: var(--radius-sm);
        }
        .world-map__controls button:hover {
          color: var(--accent);
          background: var(--accent-soft);
        }
      `}</style>
    </div>
  );
}

export default WorldMap;
```

- [ ] **Step 8.4: Run the test to confirm it passes**

```powershell
npm test -- src/components/travel/WorldMap.test.tsx
```

Expected: all 7 tests pass.

- [ ] **Step 8.5: Commit**

```powershell
git add src\components\travel\WorldMap.tsx src\components\travel\WorldMap.test.tsx
git commit -m "feat(travel): add WorldMap island with selection state + zoom controls"
```

---
## Task 9: Wire WorldMap into travel.astro

**Files:**
- Modify: `src/pages/travel.astro`

- [ ] **Step 9.1: Replace the page contents**

Open `src/pages/travel.astro` and replace its full contents with:

```astro
---
import PageLayout from "../layouts/PageLayout.astro";
import "../styles/hobby-fonts.css";
import { PROFILE } from "../lib/profile";
import { WorldMap } from "../components/travel/WorldMap";
---
<PageLayout title="Travelling" persona="personal">
  <header class="sub-hero">
    <h1>
      <span class="sub-hero__emoji" aria-hidden="true">✈️</span>
      <span class="sub-hero__title hobby-font--travel">Travelling</span>
    </h1>
    <p>{PROFILE.visited.length} countries and counting. Click one to see what I got up to.</p>
    <p class="back"><a href="/personal">← Back to Personal</a></p>
  </header>

  <section class="travel-map-section" aria-label="World map of visited countries">
    <WorldMap countries={PROFILE.visited} client:load />
  </section>

  <style>
    .sub-hero { padding: var(--space-8) 0 var(--space-6); }
    .sub-hero h1 {
      margin: 0 0 var(--space-2);
      color: var(--accent);
      display: flex; align-items: baseline; gap: var(--space-3);
      flex-wrap: wrap;
    }
    .sub-hero__emoji { font-size: 2.5rem; line-height: 1; }
    .sub-hero__title { font-size: 4rem; line-height: 1.05; }
    .sub-hero p { color: var(--fg-muted); margin: 0 0 var(--space-4); }
    .sub-hero .back a {
      font-family: var(--font-mono);
      font-size: var(--type-sm);
      color: var(--accent);
    }
    .sub-hero .back a:hover { text-decoration: underline; }

    .travel-map-section { margin-top: var(--space-6); }
  </style>
</PageLayout>
```

- [ ] **Step 9.2: Build the site to confirm there are no TS / build errors**

```powershell
npm run build
```

Expected: exit code 0; `dist/travel/index.html` exists.

Verify:

```powershell
Get-Item "dist\travel\index.html" | Select-Object FullName, Length
```

- [ ] **Step 9.3: Commit**

```powershell
git add src\pages\travel.astro
git commit -m "feat(travel): replace placeholder /travel page with interactive map"
```

---

## Task 10: Final verification

**Files:** none new.

- [ ] **Step 10.1: Run the full test suite**

```powershell
npm test
```

Expected: all tests pass — both the existing suites (`theme`, `nav-flag`, `terminal-input`, `ThemeSwitcher`, `ProToggle`, `Terminal`) AND the new ones (`travel`, `use-media-query`, `VisitedList`, `CountryPopover`, `CountryBottomSheet`, `WorldMap`).

Approximate new test count: 7 (travel) + 3 (use-media-query) + 4 (VisitedList) + 5 (CountryPopover) + 4 (CountryBottomSheet) + 7 (WorldMap) = **30 new passing tests**.

- [ ] **Step 10.2: Produce a clean production build**

```powershell
npm run build
```

Expected: exit code 0. Verify the key outputs exist:

```powershell
Get-Item "dist\index.html","dist\professional\index.html","dist\personal\index.html","dist\travel\index.html","dist\data\world-110m.json" | Select-Object FullName, Length
```

All five should be present.

- [ ] **Step 10.3: Smoke-test the built site**

```powershell
npm run preview -- --port 4322
```

In a browser visit `http://localhost:4322/travel`. Check by eye:

1. The map renders. Visited countries appear filled in the active theme accent; unvisited countries are muted outlines.
2. Hovering a visited country glows. Hovering an unvisited country does nothing.
3. Clicking a visited country opens a popover with name + years + cities + summary.
4. Clicking outside the popover, pressing Escape, or clicking the ✕ closes it.
5. Pan/zoom works (scroll wheel, drag). Popover closes when you start panning.
6. The + / − / ⟲ controls bottom-right of the map work.
7. The visited-country list below the map renders; clicking an item opens its popover.
8. Switch theme via the burger menu → map recolours instantly.
9. Resize the browser narrow (< 768px wide) → click a country → bottom sheet appears instead of popover.
10. With JS disabled (DevTools → Network conditions → Disable JavaScript), reload `/travel` → at minimum the hero, intro paragraph, and back link still render.

Stop the preview server (Ctrl+C).

- [ ] **Step 10.4: Commit any stragglers (if needed)**

```powershell
git status
```

If anything is uncommitted (lockfile updates, etc.):

```powershell
git add .
git commit -m "chore(travel): post-verification cleanup"
```

- [ ] **Step 10.5: Push to main**

```powershell
git push origin main
```

The existing GitHub Actions workflow ([`.github/workflows/deploy.yml`](../../.github/workflows/deploy.yml)) will rebuild and republish `https://andiyangcs.github.io` within ~1 minute.

If `git push` fails on auth, fall back to `mcp__github__push_files` against `AndiYangcs/andiyangcs.github.io`, branch `main`.

---

## Done criteria

- All 30 new tests + all existing tests pass.
- `npm run build` exits 0.
- Manual smoke test passes all 10 checks in Step 10.3.
- `https://andiyangcs.github.io/travel` (after deploy) shows the interactive map with all visited countries highlighted.