# Saved Idea — Achievement Badges (for the Travel page)

**Status:** Parked / not yet scheduled. Captured 2026-06-30.
**Where it will be used:** Travel page (`/travel`) — to display countries visited as unlockable achievements.
**Origin:** Came out of the "Fun Facts" brainstorm; chosen to be repurposed for travel rather than fun facts.

## Concept

Each visited country becomes a Steam/Xbox-style **achievement badge**: a bold title, an
icon (flag/emoji), a one-line caption, and a **rarity tag** (how unusual the destination is).
Countries not yet visited can render as **locked** badges to create a "collection to complete"
feel that pairs naturally with the existing world map.

Ideas to consider when we build it:
- Rarity tiers driven by data (e.g. common / rare / epic / legendary) — could map to how
  off-the-beaten-path a country is, or to personal milestones.
- A subtle diagonal "shine sweep" animation across each badge.
- Tie selection/hover to the world map: hovering a badge highlights the country on the map.
- A progress meter: "11 / N countries unlocked".

## Visual reference (mockup CSS used during brainstorm)

```html
<div class="ach2">
  <div class="ic">🥪</div>
  <div class="m">
    <b>SANDWICH COMPLETIONIST</b>
    <span>Tried every sub on the Subway menu</span>
  </div>
  <span class="rare">rare</span>
</div>
```

```css
.ach2 {
  display: flex; align-items: center; gap: 12px;
  background: linear-gradient(90deg, #1d1a10, #1c1c28);
  border: 1px solid #5a4a1a; border-radius: 12px;
  padding: 10px 12px; position: relative; overflow: hidden;
}
.ach2::before {                 /* shine sweep */
  content: ""; position: absolute; inset: 0;
  background: linear-gradient(120deg, transparent 40%, #fde68a22 50%, transparent 60%);
}
.ach2 .ic {
  width: 42px; height: 42px; border-radius: 10px;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.3rem; flex: 0 0 auto; box-shadow: 0 0 14px #f59e0b66;
}
.ach2 .m b   { display: block; font-size: .82rem; color: #fde68a; letter-spacing: .02em; }
.ach2 .m span{ font-size: .66rem; color: #9aa; }
.ach2 .rare  { margin-left: auto; font-size: .55rem; color: #fbbf24;
               border: 1px solid #fbbf2455; border-radius: 20px; padding: 2px 8px; }
```

> When building for real, replace hardcoded hex with the site's CSS custom properties
> (`--accent`, `--bg-elev`, `--border`, etc.) for theme consistency.

## Next step (when ready)

Brainstorm how the achievement data model integrates with the existing travel data
(`src/lib/travel.ts`, `src/lib/profile.ts`) and the world map components, then write a
full design + plan.
