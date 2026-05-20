# Personal Website — Design Spec

**Date:** 2026-05-20
**Owner:** Andi Yang (`AndiYangcs`)
**Repo:** [`AndiYangcs/AndiYangcs.github.io`](https://github.com/AndiYangcs/AndiYangcs.github.io)
**Live URL (target):** https://andiyangcs.github.io

---

## 1. Purpose & Audience

A personal website that serves a dual purpose:

1. **Online CV / portfolio** for recruiters, hiring managers, and engineering interviewers
2. **Project showcase** for technical projects (linked from the same site)

The tone should be **professional but enjoyable** — polished enough for recruiters, with enough personality to feel human. The audience spans non-technical scanners (recruiters) through engineering peers.

---

## 2. High-Level Concept

The site is built around a single conceit: **"Which Andi would you like to see?"** — visitors land on a terminal-styled choice page and pick between two facets:

```diagram
                  ╭──────────────────────────────╮
                  │   / (landing)                │
                  │   Terminal aesthetic         │
                  │   Typewriter intro + prompt  │
                  │                              │
                  │   [Professional]   [Real]    │
                  ╰──────┬──────────────┬────────╯
                         │              │
              ╭──────────▼─────╮  ╭─────▼──────────╮
              │ /professional  │  │ /real          │
              │ Interactive    │  │ Hobbies,       │
              │ CV / resume    │  │ personality,   │
              │                │  │ favorites      │
              ╰────────────────╯  ╰────────────────╯
                         ▲              ▲
                         ╰──────┬───────╯
                                │
                Floating pill toggle (top-right)
                navigates directly between the two,
                never returning to /
```

---

## 3. Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | **Astro** | Built for content sites; static-by-default with "islands" of interactivity; allows React components where needed |
| Interactive components | **React** (as Astro islands) | Andi has React experience; only used for genuinely interactive bits |
| Styling | **CSS custom properties + scoped styles** | Enables runtime theme switching with one attribute change |
| Hosting | **GitHub Pages** | Free for public repos with the `<username>.github.io` naming convention |
| Deployment | **GitHub Actions** (Astro's official deploy workflow) | Builds on push to `main`, publishes to `gh-pages` |
| Language | **TypeScript** | Standard for Astro projects; better DX |

**Build output:** Pre-rendered static HTML/CSS/JS files. Fast first paint, SEO-friendly, no server required.

**Important:** "Static" here means pre-built files — it does **not** mean non-interactive. All client-side interactivity (animations, theme switching, terminal input, 3D, scroll effects, etc.) works perfectly.

---

## 4. Pages

### 4.1 Landing — `/`

**Aesthetic:** Terminal / hacker. Monospace typography, dark background, syntax-highlighted snippets.

**Content:** A typewriter animation reveals:

```
$ whoami
> Andi Yang
> Software Engineer
> Sydney, Australia 🇦🇺

$ ls ./
> Two versions of me are available:

  ┌─────────────────┐  ┌─────────────────┐
  │  Professional   │  │      Real       │
  │     Andi        │  │      Andi       │
  └─────────────────┘  └─────────────────┘

$ █
```

The two boxes are **clickable buttons** that navigate to `/professional` and `/real` respectively.

**Interactive prompt:** Below the buttons is a live terminal prompt that accepts typed input. For v1, **any input** returns a hard-coded response:

```
> Wow! That sounds amazing
```

This is intentionally simple — the input handler is structured so real commands (`help`, `socials`, `theme <name>`, etc.) can be wired in later by adding cases to a single function.

**Animation behavior:**

| Navigation source | Animate? |
|---|---|
| Direct URL / bookmark (fresh load) | ✅ Yes |
| Browser refresh (F5 / Ctrl-R) | ✅ Yes |
| Click on the floating Pro/Real toggle | N/A (toggle doesn't return to `/`) |
| Manual back-button from `/professional` or `/real` | ❌ No — show end state instantly |
| Click an explicit **↻ replay** button on the landing | ✅ Yes (replay on demand) |

Detection uses `performance.getEntriesByType('navigation')[0].type` combined with a `sessionStorage` flag set when an internal link is clicked.

**No floating Pro/Real toggle** appears on this page (the landing IS the choice).

---

### 4.2 Professional Andi — `/professional`

**Aesthetic:** brittanychiang.com-inspired *vibe* — not a direct copy. Dark theme, fixed left sidebar with name/role/intro/social links, scrolling content panel on the right with scroll-spy navigation. Designed as an "interactive resume."

**Sections (placeholder content for v1):**

1. **About** — short bio paragraph
2. **Skills** — categorized tech-stack list (Languages, Frameworks, Tools, etc.)
3. **Experience** — reverse-chronological work history with role, company, dates, bullets, tech tags
4. **Education** — degrees, institutions, dates, key coursework
5. **Projects** — featured project cards (links to repos / live demos)
6. **Contact** — email + social links

**Interactivity highlights:**
- Scroll-spy nav: active section highlights as you scroll
- Smooth scroll on nav click
- Hover effects on project cards
- Subtle scroll-triggered fade-in on section reveal

---

### 4.3 Real Andi — `/real`

**Aesthetic:** Same dark theme, same palette, same toggle — **not** a visually distinct site. Just looser content. Layout can be more relaxed (grid, cards, galleries) but visual language stays unified.

**Sections (placeholder content for v1):**

1. **About me beyond work** — personal bio paragraph
2. **Hobbies & interests** — icon/card grid (music, gaming, sports, cooking, etc.)
3. **Currently** — "now page": what I'm reading / watching / learning / listening to
4. **Photo gallery** — travel pics, pets, food (placeholder images for v1)
5. **Fun facts** — bullet list of quirky tidbits
6. **Favorites** — top albums, films, books, games

---

## 5. Shared UI Components

### 5.1 Theme Switcher

**Default palette:** GitHub Dark / VS Code (`#1e1e1e` bg, `#79c0ff` accent, `#c9d1d9` text).

**Available themes (5 total):**

| ID | Name | Background | Accent |
|---|---|---|---|
| `github` (default) | GitHub Dark | `#1e1e1e` | `#79c0ff` |
| `green` | Classic Terminal | `#0a0e0a` | `#5cff5c` |
| `navy` | Navy + Mint Teal | `#0a192f` | `#64ffda` |
| `amber` | Warm Amber on Black | `#18120c` | `#ffb454` |
| `purple` | Night Owl Purple | `#13111c` | `#c792ea` |

**Implementation:**

```css
:root { /* defaults / github */ }
[data-theme="green"]  { --bg: #0a0e0a; --accent: #5cff5c; ... }
[data-theme="navy"]   { --bg: #0a192f; --accent: #64ffda; ... }
/* ...etc */
```

JavaScript toggles `document.documentElement.dataset.theme` and persists the choice in `localStorage`. On page load, the saved theme is applied **before** first paint to avoid a flash.

**Controls:**
- A small **theme picker UI** (icon or dropdown) accessible from every page except landing
- A **terminal command** on the landing prompt: `theme <name>` (e.g., `theme navy`) — switches and persists

### 5.2 Professional ↔ Real Toggle

**Style:** Floating pill toggle, fixed position top-right, always visible while scrolling.

**Behavior:**
- Pill shows both labels with a sliding indicator showing the current page: `[ ● Professional | Real ]`
- Clicking the inactive label navigates directly to that page
- **Never** returns the user to `/`
- Sets a `sessionStorage` flag (`internal-nav: true`) so subsequent landing-page loads skip the typewriter animation

**Hidden on:** `/` (landing)

---

## 6. Architecture (file/folder layout)

```
AndiYangcs.github.io/
├── .github/
│   └── workflows/
│       └── deploy.yml          ← GitHub Actions: build + deploy on push
├── docs/
│   └── superpowers/specs/      ← Design specs (this file)
├── public/                     ← Static assets served as-is
│   └── (favicons, images)
├── src/
│   ├── components/             ← Astro + React components
│   │   ├── ProToggle.astro     ← Floating Pro/Real pill (client island)
│   │   ├── ThemeSwitcher.astro ← Theme picker (client island)
│   │   ├── Terminal.tsx        ← Landing terminal (React island)
│   │   ├── ResumeSidebar.astro ← Professional fixed sidebar
│   │   └── (section components)
│   ├── layouts/
│   │   ├── BaseLayout.astro    ← <html>, theme bootstrap, shared head
│   │   └── PageLayout.astro    ← Adds ProToggle + ThemeSwitcher
│   ├── pages/
│   │   ├── index.astro         ← / (landing — no toggle)
│   │   ├── professional.astro  ← /professional
│   │   └── real.astro          ← /real
│   ├── styles/
│   │   ├── global.css          ← CSS resets, base, fonts
│   │   ├── themes.css          ← :root + [data-theme] variables
│   │   └── tokens.css          ← Spacing, type scale, etc.
│   └── content/                ← Markdown/MDX for sections (placeholder for v1)
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── .gitignore
└── README.md
```

**Why this split:**
- Astro components for non-interactive structure (layouts, sidebars, section markup)
- React components only for genuinely interactive bits (the terminal, the toggle, the theme switcher)
- Content separated from presentation so swapping placeholder content for real CV later is a one-file change per section

---

## 7. Deployment

GitHub Actions workflow at `.github/workflows/deploy.yml` uses Astro's official Pages action:

1. On push to `main`: checkout → install → `astro build` → upload `dist/`
2. Deploy job publishes to GitHub Pages
3. Settings: Pages source = "GitHub Actions" (configured once manually in repo settings)

**Result:** every commit to `main` rebuilds and republishes to `https://andiyangcs.github.io` within ~1 minute.

---

## 8. Out of Scope (for v1)

| Item | Reason | Future option |
|---|---|---|
| Real CV / project content | Use placeholders; Andi will replace later | Update markdown/MDX content files |
| Custom domain | Default `andiyangcs.github.io` is fine | Add `CNAME` file + DNS records later |
| Guestbook | Requires backend (Giscus or similar) | Add as a v2 feature |
| Live API widgets (Spotify, latest commit) | Adds dependencies and rate-limit handling | Add selectively as v2 |
| Real terminal command system (`help`, `cd`, etc.) | Scope creep — placeholder response is enough to feel interactive | Handler is structured for easy extension |
| Internationalization | Single audience for now | Astro has i18n primitives if needed |
| Analytics | Privacy + scope | Plausible / Umami can be added in `<head>` later |

---

## 9. Success Criteria

A v1 build is "done" when:

1. ✅ `https://andiyangcs.github.io` loads the terminal landing with the typewriter animation
2. ✅ Both choice buttons navigate to their target pages with placeholder content
3. ✅ The interactive prompt accepts typed input and shows the canned response
4. ✅ The floating Pro/Real toggle appears on `/professional` and `/real` and switches between them without returning to `/`
5. ✅ The theme switcher cycles through all 5 palettes; choice persists across reloads
6. ✅ Landing animation is skipped when arriving via internal toggle, played on direct load + refresh
7. ✅ A "↻ replay" button on landing re-triggers the animation
8. ✅ Site is fully responsive (works on mobile)
9. ✅ Lighthouse scores ≥ 90 on Performance, Accessibility, Best Practices, SEO
10. ✅ GitHub Actions deploys successfully on push to `main`
