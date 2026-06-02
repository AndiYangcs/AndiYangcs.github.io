# Travel Map — Design Spec

**Date:** 2026-06-02
**Owner:** Andi Yang (`AndiYangcs`)
**Repo:** [`AndiYangcs/AndiYangcs.github.io`](https://github.com/AndiYangcs/andiyangcs.github.io)
**Target page:** `/travel`
**Source page (current):** [`src/pages/travel.astro`](../../../src/pages/travel.astro)

---

## 1. Purpose

Replace the placeholder content on `/travel` with an interactive 2D world map that highlights every country Andi has visited. Clicking a visited country opens a small popover with:

- Country name
- Year(s) visited
- A short personal summary (1–3 sentences)
- A list of cities visited

The map is a personal "places I've been" milestone, not a travel blog. No photos in v1 — purely text, in keeping with the rest of the site's minimalist tone.

---

## 2. User Experience

```diagram
╭─────────────────────────────────────────────────╮
│  ✈️ Travelling                                  │
│  ─────────                                      │
│  11 countries and counting.                     │
│                                                 │
│  ╭───────────────────────────────────────────╮  │
│  │             [ WORLD MAP SVG ]             │  │
│  │   visited → filled in --accent            │  │
│  │   others  → outline only, muted           │  │
│  │   hover   → subtle glow on visited        │  │
│  │   click   → popover anchored to country   │  │
│  │                                           │  │
│  │   [ + ] [ − ] [ ⟲ ]   ← zoom controls     │  │
│  ╰───────────────────────────────────────────╯  │
│                                                 │
│  Countries visited                              │
│   • Australia (2000–) — Sydney, Melbourne...    │
│   • Norway   (2024)   — Oslo, Bergen, Tromsø    │
│   • ...                                         │
╰─────────────────────────────────────────────────╯
```

### 2.1 Map states

| State | Visited country | Unvisited country |
|---|---|---|
| Default | Filled `--accent` | Filled `--bg-elev`, stroked `--border` |
| Hover (desktop) | Soft glow halo + slight brightness lift | No change (not clickable) |
| Focused (keyboard via list) | Same glow as hover + outline ring | n/a |
| Selected (popover open) | Same glow + outline ring | n/a |

The background of the map container is transparent — country shapes sit directly on the page background. Oceans/sea = page background.

### 2.2 Pan & zoom

- Scroll-to-zoom (desktop) and pinch-to-zoom (mobile) handled by `react-simple-maps`' `ZoomableGroup`.
- Drag-to-pan with the mouse / touch.
- On-screen control cluster, anchored bottom-right of the map: `[ + ]  [ − ]  [ ⟲ Reset ]`.
- Zoom range: `1×` (default fit) to `8×`. Reset returns to `1×` and centres on `[0, 20]` (slight northward bias so most landmass is in view).

### 2.3 Click → popover (desktop, ≥ 768px)

- Anchored to the centroid of the clicked country, offset 12px above by default.
- Auto-flip / shift so it never crosses the viewport edge.
- Width `clamp(240px, 24rem, 320px)`. Height grows with content.
- Tail/arrow points at the country (purely decorative; can be omitted if positioning logic gets fiddly).
- Dismissed by:
  - Click outside the popover (anywhere, including another country — which opens that country's popover)
  - `Esc` key
  - A close affordance is not required on desktop (click-out is enough), but the popover heading row will include a small `×` for clarity.

### 2.4 Click → bottom sheet (mobile, < 768px)

- Slides up from the bottom edge, full width, max-height `60vh`.
- Same content as the popover.
- Dismissed by:
  - Tap outside the sheet
  - `Esc` key (for users with a keyboard attached)
  - An explicit close button (`×`) in the top-right of the sheet
- A subtle scrim (`rgba(0,0,0,0.25)`) appears behind the sheet to disambiguate the tap-out target. The map itself stays visible and is not dimmed beyond this scrim.

### 2.5 Accessible country list (below the map)

Rendered as a static `<ul>` of visited countries, alphabetised. Each item is a button:

```
• Australia (2000–) — Sydney, Melbourne, Brisbane
• Norway   (2024)   — Oslo, Bergen, Tromsø
```

- Clicking / activating a list item opens the same popover (anchored to that country on the map; the map auto-zooms to fit if the country is currently outside the visible region).
- Items are keyboard-focusable, in tab order, with the same hover/focus visual treatment as countries on the map.
- This list is rendered server-side as plain markup so it works with JavaScript disabled — visitors without JS see all the same information as a text-only fallback.

### 2.6 Empty state

If `VISITED` is empty (won''t happen for Andi, but guarded for correctness), the map renders with no countries highlighted and the list section is hidden. The hero copy falls back to a neutral line.

---

## 3. Tech Stack

| Concern | Choice | Rationale |
|---|---|---|
| Map library | [`react-simple-maps`](https://www.react-simple-maps.io/) | Declarative, ~50 KB gzipped, built on `d3-geo`. Handles projection, zoom, click, hover out of the box. |
| Geo data | [Natural Earth 110m countries](https://github.com/nvkelso/natural-earth-vector) as TopoJSON, served from `public/data/world-110m.json` | ~100 KB gzipped, sufficient resolution for a world-fit view zoomed up to 8×. Self-hosted so no CDN dependency or rate-limit risk. |
| Projection | `geoEqualEarth` | Modern equal-area projection, low distortion, doesn''t oversize Norway/Greenland the way Mercator does. |
| Country matching | ISO 3166-1 alpha-3 codes (e.g. `NOR`, `AUS`) — already present in Natural Earth as the `ISO_A3` property | Stable, unambiguous, no name-matching fragility. |
| Component model | React island via `client:load`, loaded only on `/travel` | Matches existing pattern (`Terminal`, `TopNav`, `ThemeSwitcher`). |
| Styling | Existing CSS custom properties from `themes.css` / `tokens.css` | Map auto-themes with the 5 palettes; no new colour tokens introduced. |

**No new top-level dependencies beyond `react-simple-maps`.** It pulls in `d3-geo` and `topojson-client` as transitive deps.

---

## 4. Data Model

A new exported interface and list added to [`src/lib/profile.ts`](../../../src/lib/profile.ts):

```ts
export interface VisitedCountry {
  /** ISO 3166-1 alpha-3 code, e.g. "NOR". Matched against ISO_A3 in TopoJSON. */
  code: string;
  /** Display name. Free-form; doesn''t need to match the geo file. */
  name: string;
  /** Year(s) visited as a free-form string, e.g. "2024" or "2019, 2023" or "2000–". */
  years: string;
  /** Ordered list of cities/regions visited. */
  cities: string[];
  /** 1–3 sentence personal note. Plain text; no markdown. */
  summary: string;
}

export const VISITED: VisitedCountry[] = [
  // Placeholder seed list — Andi populates the real entries.
  {
    code: 'NOR',
    name: 'Norway',
    years: '2024',
    cities: ['Oslo', 'Bergen', 'Tromsø'],
    summary:
      'Currently my favourite trip. Fjords, the Arctic Circle, and a ' +
      'level of quiet I didn\'t know cities could have.',
  },
  // ...10 more entries Andi will fill in
];
```

The map component looks each entry up by `code`. Unknown codes (typo, country renamed) are silently ignored on render and logged once to `console.warn` in development for diagnosability.

The total count shown in the hero (`"11 countries and counting"`) is derived from `VISITED.length` so it stays in sync automatically.

---

## 5. Component Architecture

```
src/
├── components/
│   └── travel/
│       ├── WorldMap.tsx          ← the React island; orchestrates map + popover/sheet
│       ├── CountryPopover.tsx    ← desktop popover (positioned content)
│       ├── CountryBottomSheet.tsx ← mobile sheet
│       └── VisitedList.tsx       ← keyboard-accessible list rendered below the map
├── lib/
│   ├── profile.ts                ← + VisitedCountry interface, VISITED list
│   └── travel.ts                 ← pure helpers: lookupByCode, centroidFor, etc.
└── pages/
    └── travel.astro              ← composes the hero + <WorldMap client:load />
public/
└── data/
    └── world-110m.json           ← Natural Earth TopoJSON
```

**Boundaries:**

- `lib/travel.ts` is pure TypeScript — no React, no DOM. Unit-tested with Vitest.
- `WorldMap.tsx` owns the active-country state, renders the map + list + popover/sheet, and delegates all lookups to `lib/travel.ts`.
- `CountryPopover.tsx` and `CountryBottomSheet.tsx` are dumb presentational components — they receive a `VisitedCountry` and `onClose` callback. The container picks which one to render based on a `matchMedia('(min-width: 768px)')` hook.
- `VisitedList.tsx` is rendered server-side from `VISITED` directly (it doesn''t need the TopoJSON), so the no-JS fallback list is in the HTML at first paint.

---

## 6. Interaction Logic (state machine)

A single piece of state in `WorldMap.tsx`:

```ts
type Selection =
  | { kind: 'none' }
  | { kind: 'country'; code: string; anchor: { x: number; y: number } };
```

Transitions:

| Event | New state |
|---|---|
| Click a visited country | `{ kind: 'country', code, anchor: <country centroid in screen space> }` |
| Click an unvisited country | unchanged (countries with no `VISITED` entry are non-interactive) |
| Click a list item | `{ kind: 'country', code, anchor: <country centroid in screen space> }` + map pans/zooms to ensure visibility |
| Click outside / `Esc` / close button | `{ kind: 'none' }` |
| Resize crosses the 768px breakpoint | unchanged state; the renderer just swaps between popover and bottom sheet |

The `anchor` is recomputed on zoom/pan so the popover stays glued to the country shape while the map moves.

---

## 7. Styling Details

All values via existing custom properties:

```css
.country--unvisited { fill: var(--bg-elev); stroke: var(--border); stroke-width: 0.5; }
.country--visited   { fill: var(--accent); stroke: var(--bg);     stroke-width: 0.5; cursor: pointer; }
.country--visited:hover,
.country--visited:focus-visible,
.country--visited.is-selected {
  filter: drop-shadow(0 0 8px var(--accent-soft));
}
```

The popover and bottom sheet reuse the same surface treatment as the existing contact cards on `/professional`: `--bg-elev` background, `--border` border, `--radius-md` corners, subtle shadow.

Hover and focus rings are identical, so keyboard users get the same affordance mouse users get.

---

## 8. Performance

- The TopoJSON file (~100 KB gzipped) ships from `public/`, fetched once on first visit to `/travel`, cached by the browser thereafter.
- `react-simple-maps` renders ~250 `<path>` elements. No perf concern at this scale.
- The map island is `client:load` — loads after the page is interactive, not during initial render.
- No SSR data fetching, no external API calls, no images. The page works offline after the first visit.

Target: `/travel` should still hit Lighthouse Performance ≥ 90 after this feature lands.

---

## 9. Accessibility

- Every visited country `<path>` has `role="button"`, `tabindex="0"`, and an `aria-label` of the form `"Australia, visited 2000–. Click for trip details."`.
- `Enter` and `Space` activate the same handler as click.
- The popover / bottom sheet uses `role="dialog"` and `aria-labelledby` pointing at the country name heading. Focus moves into it on open and returns to the triggering element on close.
- The static visited list below the map is the canonical access path for screen readers; the map is a visual enhancement.
- All hover-driven information also appears on focus.
- Colour contrast: `--accent` against `--bg` already passes WCAG AA across all 5 themes (verified during the original theme palette design).

---

## 10. Testing

| Layer | What''s tested | Tool |
|---|---|---|
| `lib/travel.ts` helpers (`lookupByCode`, edge cases for unknown codes, etc.) | Unit | Vitest |
| `WorldMap` selection state transitions (click country → popover; ESC → close; list-item click → popover with same data) | Component | Vitest + React Testing Library + jsdom |
| `CountryPopover` and `CountryBottomSheet` rendering of `VisitedCountry` data | Component | Vitest + RTL |
| Mobile vs desktop renderer switch | Component | Vitest + RTL with `matchMedia` mocked |
| Full page render | Manual smoke check | `npm run build` + `npm run preview` |

Geographic rendering (does Norway end up in the right shape on screen?) is **not** unit-tested — it''s a property of `react-simple-maps` + the TopoJSON file, both of which are stable upstream.

---

## 11. Out of Scope (for v1)

| Item | Reason | Future option |
|---|---|---|
| Photo galleries per country | Decided against (no good photos for most countries; text-only suits the site''s tone) | Add an optional `photos: string[]` field to `VisitedCountry` and a gallery component later |
| Trip dates more precise than year | Year is enough storytelling for this scope | Extend `years` to a structured `{ start, end }` |
| Filtering / sorting (by year, region) | 11 countries doesn''t need it | Easy to add when the list grows |
| Map clustering / multiple trips per country shown as separate pins | Country-level granularity is the chosen scope | Pin overlay layer can be added without changing data model |
| Stats panel ("X continents, Y countries, Z cities") | Scope creep | One small component reading from `VISITED` later |
| Sharing a specific country via URL (e.g. `/travel#NOR`) | Nice-to-have, not core | Wire up via hash routing in a follow-up |
| Animation on zoom / popover entry | Want to ship the static behaviour first; animations are easy to layer on | Add `framer-motion` later if it earns its bundle cost |

---

## 12. Success Criteria

A v1 build is "done" when:

1. ✅ `/travel` shows an interactive world map with every country Andi has visited filled in the active theme''s accent colour.
2. ✅ Hovering a visited country (desktop) shows a glow; unvisited countries don''t react.
3. ✅ Clicking a visited country opens a popover (desktop) or bottom sheet (mobile) with name, year(s), cities, and summary.
4. ✅ Click-outside / `Esc` / the close button dismisses the popover/sheet.
5. ✅ The map can be panned with drag and zoomed with scroll/pinch; on-screen `+ / − / Reset` controls work for touch users.
6. ✅ A static, keyboard-accessible list of visited countries is rendered below the map and activates the same popover.
7. ✅ Page works with JavaScript disabled — list and content remain readable.
8. ✅ Theme switcher cycles all 5 palettes and the map recolours instantly.
9. ✅ All new unit and component tests pass; `npm run build` succeeds.
10. ✅ Lighthouse Performance ≥ 90 on `/travel` after deploy.
