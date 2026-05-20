# Personal Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy `https://andiyangcs.github.io` — a terminal-themed landing page that lets visitors choose between a "Professional Andi" interactive CV and a "Real Andi" personal page, with shared theme + persona switching.

**Architecture:** Astro static site with React "islands" for interactive bits (terminal, theme switcher, pro/real toggle). CSS custom properties drive a 5-palette runtime theme system. Single `BaseLayout` handles theme bootstrap to avoid FOUC; `PageLayout` adds the floating persona toggle + theme picker for the two content pages. Vitest + React Testing Library cover the React island logic; the Astro pages are verified through build + manual smoke checks (Playwright introduces too much overhead for v1). Deployment is Astro's official GitHub Actions workflow to GitHub Pages.

**Tech Stack:** Astro 5, React 19, TypeScript, Vitest, @testing-library/react, jsdom, CSS custom properties, GitHub Actions.

**Source spec:** [`docs/superpowers/specs/2026-05-20-personal-website-design.md`](../specs/2026-05-20-personal-website-design.md)

---

## File Structure

Files this plan creates (under `C:\Users\M066128\code\personal-website\`):

```
.
├── .github/workflows/deploy.yml          ← CI: build + deploy to Pages
├── astro.config.mjs                      ← site URL, React integration
├── package.json                          ← deps + scripts
├── tsconfig.json                         ← strict TS
├── vitest.config.ts                      ← jsdom env, RTL setup
├── vitest.setup.ts                       ← @testing-library/jest-dom hooks
├── public/favicon.svg
├── src/
│   ├── lib/
│   │   ├── theme.ts                      ← theme list + apply/persist logic
│   │   ├── theme.test.ts
│   │   ├── nav-flag.ts                   ← sessionStorage internal-nav flag
│   │   ├── nav-flag.test.ts
│   │   ├── terminal-input.ts             ← input → response map (v1: canned)
│   │   └── terminal-input.test.ts
│   ├── styles/
│   │   ├── tokens.css                    ← spacing, font, type scale
│   │   ├── themes.css                    ← :root + [data-theme="..."] vars
│   │   └── global.css                    ← reset + base
│   ├── components/
│   │   ├── ThemeSwitcher.tsx             ← React island, dropdown
│   │   ├── ThemeSwitcher.test.tsx
│   │   ├── ProToggle.tsx                 ← React island, pill toggle
│   │   ├── ProToggle.test.tsx
│   │   ├── Terminal.tsx                  ← React island, typewriter + prompt
│   │   ├── Terminal.test.tsx
│   │   ├── ResumeSidebar.astro           ← left fixed sidebar (pro page)
│   │   ├── ResumeSection.astro           ← section wrapper w/ id + heading
│   │   └── ProjectCard.astro             ← project card markup
│   ├── layouts/
│   │   ├── BaseLayout.astro              ← <html>, theme bootstrap script
│   │   └── PageLayout.astro              ← wraps BaseLayout + persona/theme UI
│   └── pages/
│       ├── index.astro                   ← /            (landing, no toggle)
│       ├── professional.astro            ← /professional
│       └── real.astro                    ← /real
```

**Boundaries:**
- `src/lib/*` = pure TS modules. No DOM imports beyond `window/document`/`localStorage` guarded for SSR. **All logic worth testing lives here.**
- `src/components/*.tsx` = React islands; they delegate logic to `src/lib/*` and focus on rendering + events.
- `src/components/*.astro` = static structure only.
- `src/layouts/*.astro` = shell + theme bootstrap.
- `src/pages/*.astro` = page composition; no logic.

---

## Conventions (read once, apply throughout)

- **Working dir:** all `npm`, `git`, and `npx` commands run inside `C:\Users\M066128\code\personal-website`.
- **Shell:** PowerShell. Use forward-quoted strings; never assume bash-isms. The Bash tool's `cwd` parameter is mandatory for every command — never `cd` then run.
- **Testing:** every `src/lib/*.ts` module ships with a `*.test.ts`. React components ship with `*.test.tsx`. Astro files are not unit-tested; they're verified via `npm run build` and a smoke check.
- **Commits:** after each task ends green, commit with the message shown in that task's final step.
- **GitHub remote:** `git push` works (PAT already wired up in the previous session). If a push fails, fall back to `mcp__github__push_files` against `AndiYangcs/AndiYangcs.github.io`, branch `main`.
- **No placeholders left in code.** Every section gets real (placeholder-but-plausible) copy.

---

## Task 1: Scaffold Astro + React + TypeScript

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/env.d.ts`, `public/favicon.svg`, `README.md` (overwrite existing minimal one).

- [ ] **Step 1.1: Initialise package.json**

Create `package.json`:

```json
{
  "name": "andiyangcs-website",
  "type": "module",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@astrojs/react": "^4.2.0",
    "astro": "^5.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.0",
    "@testing-library/react": "^16.1.0",
    "@testing-library/user-event": "^14.5.2",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "jsdom": "^25.0.0",
    "typescript": "^5.7.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 1.2: Add astro.config.mjs**

Create `astro.config.mjs`:

```js
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://andiyangcs.github.io',
  integrations: [react()],
  vite: {
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./vitest.setup.ts'],
    },
  },
});
```

- [ ] **Step 1.3: Add tsconfig.json**

Create `tsconfig.json`:

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*", "vitest.setup.ts"],
  "exclude": ["dist"],
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  }
}
```

- [ ] **Step 1.4: Add src/env.d.ts**

Create `src/env.d.ts`:

```ts
/// <reference types="astro/client" />
```

- [ ] **Step 1.5: Add favicon**

Create `public/favicon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="12" fill="#1e1e1e"/>
  <text x="32" y="42" text-anchor="middle" font-family="ui-monospace, Menlo, monospace" font-size="34" fill="#79c0ff">A</text>
</svg>
```

- [ ] **Step 1.6: Overwrite README.md**

Create `README.md`:

````markdown
# AndiYangcs.github.io

Personal site for Andi Yang. Built with Astro + React, deployed to GitHub Pages.

## Local dev

```powershell
npm install
npm run dev      # http://localhost:4321
npm test         # run unit tests
npm run build    # produce dist/
```

## Deployment

Pushes to `main` trigger `.github/workflows/deploy.yml`, which builds and publishes to GitHub Pages.

Specs live in `docs/superpowers/specs/`, plans in `docs/superpowers/plans/`.
````

- [ ] **Step 1.7: Install dependencies**

Run (cwd `C:\Users\M066128\code\personal-website`):

```powershell
npm install
```

Expected: lockfile written, `node_modules/` created, no audit errors that fail the install.

- [ ] **Step 1.8: Verify a do-nothing build succeeds**

Astro requires at least one page to build. Create a temporary placeholder `src/pages/index.astro`:

```astro
---
---
<html><body>placeholder</body></html>
```

Run:

```powershell
npm run build
```

Expected: `dist/index.html` exists, exit code 0. (The placeholder will be replaced in Task 8.)

- [ ] **Step 1.9: Commit**

```powershell
git add .
git commit -m "chore: scaffold Astro + React + TypeScript project"
```

---

## Task 2: Vitest setup + first passing test

**Files:**
- Create: `vitest.setup.ts`, `src/lib/sanity.test.ts` (deleted at end of task).

- [ ] **Step 2.1: Add vitest.setup.ts**

Create `vitest.setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
  document.documentElement.removeAttribute('data-theme');
});
```

- [ ] **Step 2.2: Write a sanity test that should fail first**

Create `src/lib/sanity.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

describe('vitest wiring', () => {
  it('runs jsdom + jest-dom matchers', () => {
    const el = document.createElement('div');
    el.textContent = 'hello';
    document.body.appendChild(el);
    expect(el).toHaveTextContent('hello');
  });
});
```

- [ ] **Step 2.3: Run tests**

```powershell
npm test
```

Expected: 1 passed.

- [ ] **Step 2.4: Delete the sanity test**

```powershell
Remove-Item src/lib/sanity.test.ts
```

- [ ] **Step 2.5: Commit**

```powershell
git add vitest.setup.ts package.json astro.config.mjs
git commit -m "test: wire up vitest + testing-library with jsdom"
```

---

## Task 3: Theme system — pure logic + CSS variables

**Files:**
- Create: `src/lib/theme.ts`, `src/lib/theme.test.ts`, `src/styles/tokens.css`, `src/styles/themes.css`, `src/styles/global.css`.

- [ ] **Step 3.1: Write failing test for theme module**

Create `src/lib/theme.test.ts`:

```ts
import { beforeEach, describe, expect, it } from 'vitest';
import {
  THEMES,
  DEFAULT_THEME_ID,
  applyTheme,
  loadSavedTheme,
  isThemeId,
} from './theme';

describe('theme', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('exposes all 5 themes with github as default', () => {
    expect(THEMES.map((t) => t.id)).toEqual([
      'github',
      'green',
      'navy',
      'amber',
      'purple',
    ]);
    expect(DEFAULT_THEME_ID).toBe('github');
  });

  it('validates known theme ids', () => {
    expect(isThemeId('navy')).toBe(true);
    expect(isThemeId('mauve')).toBe(false);
  });

  it('applyTheme sets data-theme and persists', () => {
    applyTheme('navy');
    expect(document.documentElement.dataset.theme).toBe('navy');
    expect(localStorage.getItem('theme')).toBe('navy');
  });

  it('loadSavedTheme returns saved value or default', () => {
    expect(loadSavedTheme()).toBe('github');
    localStorage.setItem('theme', 'amber');
    expect(loadSavedTheme()).toBe('amber');
  });

  it('loadSavedTheme falls back to default on garbage', () => {
    localStorage.setItem('theme', 'bogus');
    expect(loadSavedTheme()).toBe('github');
  });
});
```

- [ ] **Step 3.2: Run — expect fail**

```powershell
npm test -- theme
```

Expected: module not found.

- [ ] **Step 3.3: Implement theme module**

Create `src/lib/theme.ts`:

```ts
export type ThemeId = 'github' | 'green' | 'navy' | 'amber' | 'purple';

export interface Theme {
  id: ThemeId;
  label: string;
}

export const THEMES: readonly Theme[] = [
  { id: 'github', label: 'GitHub Dark' },
  { id: 'green', label: 'Classic Terminal' },
  { id: 'navy', label: 'Navy + Mint' },
  { id: 'amber', label: 'Warm Amber' },
  { id: 'purple', label: 'Night Owl' },
] as const;

export const DEFAULT_THEME_ID: ThemeId = 'github';
const STORAGE_KEY = 'theme';

const validIds = new Set<string>(THEMES.map((t) => t.id));

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === 'string' && validIds.has(value);
}

export function applyTheme(id: ThemeId): void {
  document.documentElement.dataset.theme = id;
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* storage disabled — ignore */
  }
}

export function loadSavedTheme(): ThemeId {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return isThemeId(raw) ? raw : DEFAULT_THEME_ID;
  } catch {
    return DEFAULT_THEME_ID;
  }
}
```

- [ ] **Step 3.4: Run — expect pass**

```powershell
npm test -- theme
```

Expected: 5 passed.

- [ ] **Step 3.5: Add design tokens CSS**

Create `src/styles/tokens.css`:

```css
:root {
  --font-mono: ui-monospace, "JetBrains Mono", "Fira Code", Menlo, Consolas, monospace;
  --font-sans: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;

  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;
  --space-16: 4rem;

  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-pill: 9999px;

  --type-sm: 0.875rem;
  --type-base: 1rem;
  --type-lg: 1.125rem;
  --type-xl: 1.5rem;
  --type-2xl: 2rem;
  --type-3xl: 2.75rem;

  --max-content-w: 56rem;
  --sidebar-w: 22rem;
}
```

- [ ] **Step 3.6: Add palette CSS**

Create `src/styles/themes.css`:

```css
/* Default = github */
:root,
:root[data-theme="github"] {
  --bg: #1e1e1e;
  --bg-elev: #252526;
  --fg: #c9d1d9;
  --fg-muted: #8b949e;
  --accent: #79c0ff;
  --accent-soft: rgba(121, 192, 255, 0.12);
  --border: #30363d;
  --success: #56d364;
  --danger: #f85149;
}

:root[data-theme="green"] {
  --bg: #0a0e0a;
  --bg-elev: #111811;
  --fg: #cdeacd;
  --fg-muted: #6f8f6f;
  --accent: #5cff5c;
  --accent-soft: rgba(92, 255, 92, 0.12);
  --border: #1f2a1f;
  --success: #5cff5c;
  --danger: #ff6b6b;
}

:root[data-theme="navy"] {
  --bg: #0a192f;
  --bg-elev: #112240;
  --fg: #ccd6f6;
  --fg-muted: #8892b0;
  --accent: #64ffda;
  --accent-soft: rgba(100, 255, 218, 0.1);
  --border: #233554;
  --success: #64ffda;
  --danger: #ff6b6b;
}

:root[data-theme="amber"] {
  --bg: #18120c;
  --bg-elev: #221a11;
  --fg: #f3d9a4;
  --fg-muted: #b39264;
  --accent: #ffb454;
  --accent-soft: rgba(255, 180, 84, 0.12);
  --border: #3a2d1c;
  --success: #b8e986;
  --danger: #ff6b6b;
}

:root[data-theme="purple"] {
  --bg: #13111c;
  --bg-elev: #1b1830;
  --fg: #d6deeb;
  --fg-muted: #8696b0;
  --accent: #c792ea;
  --accent-soft: rgba(199, 146, 234, 0.12);
  --border: #2a2640;
  --success: #addb67;
  --danger: #ef5350;
}
```

- [ ] **Step 3.7: Add base + reset CSS**

Create `src/styles/global.css`:

```css
@import "./tokens.css";
@import "./themes.css";

*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  background: var(--bg);
  color: var(--fg);
  font-family: var(--font-sans);
  font-size: var(--type-base);
  line-height: 1.6;
  min-height: 100%;
}

body {
  transition: background-color 200ms ease, color 200ms ease;
}

a {
  color: var(--accent);
  text-decoration: none;
}
a:hover,
a:focus-visible {
  text-decoration: underline;
}

button {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  cursor: pointer;
}

:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

::selection {
  background: var(--accent-soft);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}
```

- [ ] **Step 3.8: Commit**

```powershell
git add src/lib/theme.ts src/lib/theme.test.ts src/styles/
git commit -m "feat(theme): add 5-palette CSS variables + persistence module"
```

---

## Task 4: Internal-nav flag (sessionStorage helper)

**Files:**
- Create: `src/lib/nav-flag.ts`, `src/lib/nav-flag.test.ts`.

- [ ] **Step 4.1: Write failing test**

Create `src/lib/nav-flag.test.ts`:

```ts
import { beforeEach, describe, expect, it } from 'vitest';
import {
  markInternalNav,
  consumeInternalNav,
  shouldPlayLandingIntro,
} from './nav-flag';

describe('nav-flag', () => {
  beforeEach(() => sessionStorage.clear());

  it('marks and consumes the internal-nav flag', () => {
    markInternalNav();
    expect(consumeInternalNav()).toBe(true);
    expect(consumeInternalNav()).toBe(false);
  });

  it('shouldPlayLandingIntro skips animation when flag is set', () => {
    markInternalNav();
    expect(shouldPlayLandingIntro({ navType: 'back_forward' })).toBe(false);
  });

  it('plays on direct navigation', () => {
    expect(shouldPlayLandingIntro({ navType: 'navigate' })).toBe(true);
  });

  it('plays on reload', () => {
    expect(shouldPlayLandingIntro({ navType: 'reload' })).toBe(true);
  });

  it('skips on back/forward without flag', () => {
    expect(shouldPlayLandingIntro({ navType: 'back_forward' })).toBe(false);
  });
});
```

- [ ] **Step 4.2: Run — expect fail**

```powershell
npm test -- nav-flag
```

- [ ] **Step 4.3: Implement**

Create `src/lib/nav-flag.ts`:

```ts
const KEY = 'internal-nav';

export function markInternalNav(): void {
  try {
    sessionStorage.setItem(KEY, '1');
  } catch {
    /* ignore */
  }
}

export function consumeInternalNav(): boolean {
  try {
    const had = sessionStorage.getItem(KEY) === '1';
    sessionStorage.removeItem(KEY);
    return had;
  } catch {
    return false;
  }
}

export type NavType = 'navigate' | 'reload' | 'back_forward' | 'prerender';

export function shouldPlayLandingIntro(opts: { navType: NavType }): boolean {
  if (consumeInternalNav()) return false;
  return opts.navType === 'navigate' || opts.navType === 'reload';
}
```

- [ ] **Step 4.4: Run — expect pass**

```powershell
npm test -- nav-flag
```

Expected: 5 passed.

- [ ] **Step 4.5: Commit**

```powershell
git add src/lib/nav-flag.ts src/lib/nav-flag.test.ts
git commit -m "feat(nav): add internal-nav sessionStorage helper"
```

---

## Task 5: Terminal input handler (pure)

**Files:**
- Create: `src/lib/terminal-input.ts`, `src/lib/terminal-input.test.ts`.

- [ ] **Step 5.1: Write failing test**

Create `src/lib/terminal-input.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { handleTerminalInput } from './terminal-input';

describe('handleTerminalInput', () => {
  it('returns canned response for any non-empty input', () => {
    expect(handleTerminalInput('hello')).toEqual({
      kind: 'text',
      text: 'Wow! That sounds amazing',
    });
  });

  it('trims input before evaluating', () => {
    expect(handleTerminalInput('   hi   ').kind).toBe('text');
  });

  it('ignores empty input', () => {
    expect(handleTerminalInput('')).toEqual({ kind: 'noop' });
    expect(handleTerminalInput('   ')).toEqual({ kind: 'noop' });
  });
});
```

- [ ] **Step 5.2: Run — expect fail**

```powershell
npm test -- terminal-input
```

- [ ] **Step 5.3: Implement**

Create `src/lib/terminal-input.ts`:

```ts
export type TerminalResponse =
  | { kind: 'text'; text: string }
  | { kind: 'noop' };

/**
 * v1: any non-empty input returns the canned line.
 * Future commands (help, socials, theme <name>, ...) can be added as
 * additional branches before the default fallthrough.
 */
export function handleTerminalInput(raw: string): TerminalResponse {
  const input = raw.trim();
  if (input.length === 0) return { kind: 'noop' };
  return { kind: 'text', text: 'Wow! That sounds amazing' };
}
```

- [ ] **Step 5.4: Run — expect pass**

```powershell
npm test -- terminal-input
```

Expected: 3 passed.

- [ ] **Step 5.5: Commit**

```powershell
git add src/lib/terminal-input.ts src/lib/terminal-input.test.ts
git commit -m "feat(terminal): add input handler with canned v1 response"
```

---

## Task 6: ThemeSwitcher React component

**Files:**
- Create: `src/components/ThemeSwitcher.tsx`, `src/components/ThemeSwitcher.test.tsx`.

- [ ] **Step 6.1: Write failing test**

Create `src/components/ThemeSwitcher.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ThemeSwitcher } from './ThemeSwitcher';

describe('ThemeSwitcher', () => {
  it('renders a button labelled with the current theme', () => {
    render(<ThemeSwitcher />);
    expect(
      screen.getByRole('button', { name: /theme/i }),
    ).toBeInTheDocument();
  });

  it('opens the menu and lists all 5 themes', async () => {
    const user = userEvent.setup();
    render(<ThemeSwitcher />);
    await user.click(screen.getByRole('button', { name: /theme/i }));
    const items = screen.getAllByRole('menuitemradio');
    expect(items).toHaveLength(5);
  });

  it('applies the chosen theme to document and storage', async () => {
    const user = userEvent.setup();
    render(<ThemeSwitcher />);
    await user.click(screen.getByRole('button', { name: /theme/i }));
    await user.click(screen.getByRole('menuitemradio', { name: /navy/i }));
    expect(document.documentElement.dataset.theme).toBe('navy');
    expect(localStorage.getItem('theme')).toBe('navy');
  });
});
```

- [ ] **Step 6.2: Run — expect fail**

```powershell
npm test -- ThemeSwitcher
```

- [ ] **Step 6.3: Implement**

Create `src/components/ThemeSwitcher.tsx`:

```tsx
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
                <span aria-hidden="true">{t.id === theme ? '●' : '○'}</span>{' '}
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
          position: absolute; right: 0; top: calc(100% + var(--space-2));
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
      `}</style>
    </div>
  );
}

export default ThemeSwitcher;
```

- [ ] **Step 6.4: Run — expect pass**

```powershell
npm test -- ThemeSwitcher
```

Expected: 3 passed.

- [ ] **Step 6.5: Commit**

```powershell
git add src/components/ThemeSwitcher.tsx src/components/ThemeSwitcher.test.tsx
git commit -m "feat(theme): add ThemeSwitcher React island"
```

---

## Task 7: ProToggle React component

**Files:**
- Create: `src/components/ProToggle.tsx`, `src/components/ProToggle.test.tsx`.

- [ ] **Step 7.1: Write failing test**

Create `src/components/ProToggle.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ProToggle } from './ProToggle';

const originalLocation = window.location;

beforeEach(() => {
  sessionStorage.clear();
  // jsdom: replace location with a mutable href setter
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { ...originalLocation, href: 'http://localhost/professional', assign: vi.fn() },
  });
});

describe('ProToggle', () => {
  it('marks active = professional on /professional', () => {
    render(<ProToggle current="professional" />);
    expect(
      screen.getByRole('link', { name: /professional/i }),
    ).toHaveAttribute('aria-current', 'page');
    expect(
      screen.getByRole('link', { name: /real/i }),
    ).not.toHaveAttribute('aria-current');
  });

  it('marks active = real on /real', () => {
    render(<ProToggle current="real" />);
    expect(screen.getByRole('link', { name: /real/i })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('sets internal-nav flag when clicking the other side', async () => {
    const user = userEvent.setup();
    render(<ProToggle current="professional" />);
    await user.click(screen.getByRole('link', { name: /real/i }));
    expect(sessionStorage.getItem('internal-nav')).toBe('1');
  });
});
```

- [ ] **Step 7.2: Run — expect fail**

```powershell
npm test -- ProToggle
```

- [ ] **Step 7.3: Implement**

Create `src/components/ProToggle.tsx`:

```tsx
import { markInternalNav } from '../lib/nav-flag';

export type Persona = 'professional' | 'real';

const PATHS: Record<Persona, string> = {
  professional: '/professional',
  real: '/real',
};

const LABELS: Record<Persona, string> = {
  professional: 'Professional',
  real: 'Real',
};

export function ProToggle({ current }: { current: Persona }) {
  return (
    <nav className="pro-toggle" aria-label="Persona switcher">
      <span
        className="pro-toggle__indicator"
        data-side={current}
        aria-hidden="true"
      />
      {(['professional', 'real'] as const).map((p) => (
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
        .pro-toggle__indicator[data-side="real"]         { left: 4px; transform: translateX(100%); }
      `}</style>
    </nav>
  );
}

export default ProToggle;
```

- [ ] **Step 7.4: Run — expect pass**

```powershell
npm test -- ProToggle
```

Expected: 3 passed.

- [ ] **Step 7.5: Commit**

```powershell
git add src/components/ProToggle.tsx src/components/ProToggle.test.tsx
git commit -m "feat(nav): add ProToggle pill component"
```

---

## Task 8: Terminal React component (typewriter + interactive prompt)

**Files:**
- Create: `src/components/Terminal.tsx`, `src/components/Terminal.test.tsx`.

- [ ] **Step 8.1: Write failing test**

Create `src/components/Terminal.test.tsx`:

```tsx
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Terminal } from './Terminal';

beforeEach(() => {
  sessionStorage.clear();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

function flushAnimation() {
  // Advance well past the maximum animation duration.
  act(() => {
    vi.advanceTimersByTime(20_000);
  });
}

describe('Terminal', () => {
  it('renders prompt and choice buttons after animation', () => {
    render(<Terminal playIntro={true} />);
    flushAnimation();
    expect(
      screen.getByRole('link', { name: /professional andi/i }),
    ).toHaveAttribute('href', '/professional');
    expect(
      screen.getByRole('link', { name: /real andi/i }),
    ).toHaveAttribute('href', '/real');
  });

  it('shows end state immediately when playIntro=false', () => {
    render(<Terminal playIntro={false} />);
    expect(screen.getByText(/Andi Yang/i)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /professional andi/i }),
    ).toBeInTheDocument();
  });

  it('answers any input with the canned response', async () => {
    vi.useRealTimers(); // userEvent needs real timers
    const user = userEvent.setup();
    render(<Terminal playIntro={false} />);
    const input = screen.getByRole('textbox', { name: /prompt/i });
    await user.type(input, 'hi there{Enter}');
    expect(screen.getByText(/wow! that sounds amazing/i)).toBeInTheDocument();
  });

  it('replay button restarts animation', async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    render(<Terminal playIntro={false} />);
    const replay = screen.getByRole('button', { name: /replay/i });
    await user.click(replay);
    // After replay, the typed-out region is reset; we assert
    // the visible text starts as just the prompt char.
    expect(screen.getByTestId('typed-region').textContent).toBe('$ ');
  });

  it('sets internal-nav flag when a choice button is clicked', async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    render(<Terminal playIntro={false} />);
    await user.click(screen.getByRole('link', { name: /professional andi/i }));
    expect(sessionStorage.getItem('internal-nav')).toBe('1');
  });
});
```

- [ ] **Step 8.2: Run — expect fail**

```powershell
npm test -- Terminal
```

- [ ] **Step 8.3: Implement**

Create `src/components/Terminal.tsx`:

```tsx
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { markInternalNav } from '../lib/nav-flag';
import { handleTerminalInput } from '../lib/terminal-input';

const INTRO_LINES = [
  '$ whoami',
  '> Andi Yang',
  '> Software Engineer',
  '> Sydney, Australia 🇦🇺',
  '',
  '$ ls ./',
  '> Two versions of me are available:',
  '',
];

const CHAR_DELAY_MS = 28;
const LINE_DELAY_MS = 180;

function buildEndState(): string {
  return INTRO_LINES.join('\n') + '\n';
}

export function Terminal({ playIntro }: { playIntro: boolean }) {
  const [typed, setTyped] = useState<string>(playIntro ? '' : buildEndState());
  const [done, setDone] = useState<boolean>(!playIntro);
  const [history, setHistory] = useState<
    Array<{ input: string; response: string }>
  >([]);
  const [input, setInput] = useState('');
  const [replayCounter, setReplayCounter] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!playIntro && replayCounter === 0) return;

    let cancelled = false;
    setTyped('');
    setDone(false);
    setHistory([]);

    const run = async () => {
      let buf = '';
      for (const line of INTRO_LINES) {
        for (const ch of line) {
          if (cancelled) return;
          buf += ch;
          setTyped(buf);
          await new Promise((r) => setTimeout(r, CHAR_DELAY_MS));
        }
        buf += '\n';
        setTyped(buf);
        await new Promise((r) => setTimeout(r, LINE_DELAY_MS));
      }
      if (!cancelled) setDone(true);
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [playIntro, replayCounter]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const result = handleTerminalInput(input);
    if (result.kind === 'text') {
      setHistory((h) => [...h, { input: input.trim(), response: result.text }]);
    }
    setInput('');
  };

  const onChoice = () => markInternalNav();

  return (
    <section className="terminal" aria-label="Landing terminal">
      <pre className="terminal__screen" data-testid="typed-region">
        {typed}
        {!done && <span className="terminal__cursor" aria-hidden="true">█</span>}
      </pre>

      {done && (
        <>
          <div className="terminal__choices" role="group" aria-label="Choose a persona">
            <a className="terminal__choice" href="/professional" onClick={onChoice}>
              <span>┌─────────────────┐</span>
              <span>│  Professional   │</span>
              <span>│      Andi       │</span>
              <span>└─────────────────┘</span>
            </a>
            <a className="terminal__choice" href="/real" onClick={onChoice}>
              <span>┌─────────────────┐</span>
              <span>│      Real       │</span>
              <span>│      Andi       │</span>
              <span>└─────────────────┘</span>
            </a>
          </div>

          <ul className="terminal__history" aria-live="polite">
            {history.map((h, i) => (
              <li key={i}>
                <div>$ {h.input}</div>
                <div>&gt; {h.response}</div>
              </li>
            ))}
          </ul>

          <form className="terminal__prompt" onSubmit={onSubmit}>
            <label htmlFor="terminal-input" className="terminal__label">
              $
            </label>
            <input
              id="terminal-input"
              ref={inputRef}
              type="text"
              autoComplete="off"
              aria-label="prompt"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="terminal__input"
            />
          </form>

          <button
            type="button"
            className="terminal__replay"
            onClick={() => setReplayCounter((n) => n + 1)}
            aria-label="Replay intro animation"
          >
            ↻ replay
          </button>
        </>
      )}

      <style>{`
        .terminal {
          font-family: var(--font-mono);
          max-width: var(--max-content-w);
          margin: 0 auto;
          padding: var(--space-12) var(--space-4);
          color: var(--fg);
        }
        .terminal__screen {
          font-family: var(--font-mono);
          white-space: pre-wrap;
          margin: 0 0 var(--space-6);
          font-size: var(--type-lg);
          min-height: 12em;
        }
        .terminal__cursor {
          display: inline-block;
          width: 0.6em;
          animation: blink 1s steps(1) infinite;
          color: var(--accent);
        }
        @keyframes blink { 50% { opacity: 0; } }

        .terminal__choices {
          display: flex; gap: var(--space-6); flex-wrap: wrap;
          margin-bottom: var(--space-6);
        }
        .terminal__choice {
          display: flex; flex-direction: column;
          color: var(--accent);
          padding: var(--space-2);
          border-radius: var(--radius-md);
          transition: background 200ms ease, transform 200ms ease;
        }
        .terminal__choice:hover {
          background: var(--accent-soft);
          transform: translateY(-2px);
          text-decoration: none;
        }
        .terminal__history {
          list-style: none; padding: 0; margin: 0 0 var(--space-4);
        }
        .terminal__prompt {
          display: flex; gap: var(--space-2); align-items: center;
          border-top: 1px dashed var(--border);
          padding-top: var(--space-3);
        }
        .terminal__label { color: var(--accent); }
        .terminal__input {
          flex: 1; background: transparent; border: none; outline: none;
          color: var(--fg); font: inherit;
        }
        .terminal__replay {
          margin-top: var(--space-6);
          color: var(--fg-muted);
          font-size: var(--type-sm);
          padding: var(--space-1) var(--space-2);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
        }
        .terminal__replay:hover { color: var(--accent); border-color: var(--accent); }
      `}</style>
    </section>
  );
}

export default Terminal;
```

- [ ] **Step 8.4: Run — expect pass**

```powershell
npm test -- Terminal
```

Expected: 5 passed. If timer-driven assertions are flaky, increase `flushAnimation` advance to 60_000 ms and re-run.

- [ ] **Step 8.5: Commit**

```powershell
git add src/components/Terminal.tsx src/components/Terminal.test.tsx
git commit -m "feat(terminal): typewriter intro + interactive prompt"
```

---

## Task 9: Layouts (BaseLayout + PageLayout)

**Files:**
- Create: `src/layouts/BaseLayout.astro`, `src/layouts/PageLayout.astro`.

- [ ] **Step 9.1: Create BaseLayout.astro**

Create `src/layouts/BaseLayout.astro`:

```astro
---
import '../styles/global.css';
interface Props {
  title: string;
  description?: string;
}
const { title, description = 'Andi Yang — personal site.' } = Astro.props;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content={description} />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <title>{title}</title>
    <script is:inline>
      // Apply saved theme before first paint to avoid FOUC.
      (function () {
        try {
          var saved = localStorage.getItem('theme');
          var allowed = ['github', 'green', 'navy', 'amber', 'purple'];
          var theme = allowed.indexOf(saved) >= 0 ? saved : 'github';
          document.documentElement.setAttribute('data-theme', theme);
        } catch (e) {
          document.documentElement.setAttribute('data-theme', 'github');
        }
      })();
    </script>
  </head>
  <body>
    <slot />
  </body>
</html>
```

- [ ] **Step 9.2: Create PageLayout.astro**

Create `src/layouts/PageLayout.astro`:

```astro
---
import BaseLayout from './BaseLayout.astro';
import { ProToggle } from '../components/ProToggle';
import { ThemeSwitcher } from '../components/ThemeSwitcher';

interface Props {
  title: string;
  persona: 'professional' | 'real';
  description?: string;
}
const { title, persona, description } = Astro.props;
---
<BaseLayout title={title} description={description}>
  <div class="page-chrome">
    <div class="page-chrome__theme">
      <ThemeSwitcher client:load />
    </div>
    <ProToggle current={persona} client:load />
  </div>
  <main class="page-main">
    <slot />
  </main>

  <style>
    .page-chrome {
      position: fixed; top: var(--space-4); left: var(--space-4); right: var(--space-4);
      display: flex; justify-content: space-between; align-items: flex-start;
      pointer-events: none;
      z-index: 90;
    }
    .page-chrome > * { pointer-events: auto; }
    .page-chrome__theme { /* sits at top-left */ }
    .page-main {
      max-width: var(--max-content-w);
      margin: 0 auto;
      padding: var(--space-16) var(--space-4) var(--space-12);
    }
  </style>
</BaseLayout>
```

- [ ] **Step 9.3: Verify build still passes**

```powershell
npm run build
```

Expected: build succeeds (placeholder `index.astro` from Task 1 is still in place).

- [ ] **Step 9.4: Commit**

```powershell
git add src/layouts/
git commit -m "feat(layout): add BaseLayout (theme bootstrap) + PageLayout"
```

---

## Task 10: Landing page (`/`)

**Files:**
- Modify: `src/pages/index.astro` (overwrite the placeholder).

- [ ] **Step 10.1: Replace index.astro**

Overwrite `src/pages/index.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { Terminal } from '../components/Terminal';

// Decide on the server whether to *initially* render the end-state or animated.
// True runtime decision (history.type + sessionStorage) is also handled
// client-side inside the island via a re-mount; for first paint we default to
// animating, and the island can fast-forward if the nav flag exists.
---
<BaseLayout
  title="Andi Yang"
  description="Which Andi would you like to see? Terminal-style choice between Professional and Real."
>
  <Terminal client:load playIntro={true} />
  <script is:inline>
    // If we're navigating internally (back from /professional or /real with
    // the flag set), skip the intro by reloading the island with playIntro=false.
    // Simpler approach: detect on the client and set a CSS class that the
    // island reads. Implementation: the island already plays only when
    // playIntro is true at first mount; for back/forward + flag the user
    // requested an instant end-state. We rely on the island's behaviour:
    // - direct/reload: playIntro=true (default)
    // - back/forward: navType check below
    var nav = performance.getEntriesByType('navigation')[0];
    var type = nav && nav.type;
    var hadFlag = sessionStorage.getItem('internal-nav') === '1';
    if (hadFlag || type === 'back_forward') {
      sessionStorage.removeItem('internal-nav');
      document.documentElement.dataset.landingSkip = '1';
    }
  </script>
  <style is:global>
    html[data-landing-skip="1"] .terminal__screen { display: none; }
    /* The island still renders; we just hide the animating region on
       the very first frame. The island's internal state will catch up
       and surface the choice buttons normally. */
  </style>
</BaseLayout>
```

> Note: this is a pragmatic v1. If after running it the back/forward UX feels jumpy, we adjust by hoisting `playIntro` decision into a small inline script that mutates a `window.__playIntro` global the island reads on mount. Tracked as a follow-up.

- [ ] **Step 10.2: Smoke-test the dev server**

```powershell
npm run dev -- --port 4321
```

Open `http://localhost:4321/`. Verify:
- Typewriter animation runs once on first load.
- Two boxed buttons appear after animation.
- Typing `hello` + Enter shows "> Wow! That sounds amazing".
- `↻ replay` restarts animation.
- No floating pill is visible (correct — only on the two content pages).

Stop the dev server (Ctrl+C).

- [ ] **Step 10.3: Commit**

```powershell
git add src/pages/index.astro
git commit -m "feat(landing): replace placeholder with terminal landing page"
```

---

## Task 11: Professional page (`/professional`)

**Files:**
- Create: `src/components/ResumeSidebar.astro`, `src/components/ResumeSection.astro`, `src/components/ProjectCard.astro`, `src/pages/professional.astro`.

- [ ] **Step 11.1: Create ResumeSidebar.astro**

Create `src/components/ResumeSidebar.astro`:

```astro
---
const sections = [
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Experience' },
  { id: 'education', label: 'Education' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Contact' },
];
---
<aside class="resume-sidebar">
  <div>
    <h1>Andi Yang</h1>
    <p class="resume-sidebar__role">Software Engineer</p>
    <p class="resume-sidebar__bio">
      Building reliable web platforms and developer tooling in Sydney.
    </p>
  </div>

  <nav aria-label="Section navigation" class="resume-sidebar__nav">
    <ul>
      {sections.map((s) => (
        <li>
          <a href={`#${s.id}`} data-nav-id={s.id}>
            <span class="resume-sidebar__bar" aria-hidden="true"></span>
            {s.label}
          </a>
        </li>
      ))}
    </ul>
  </nav>

  <ul class="resume-sidebar__socials" aria-label="Social links">
    <li><a href="https://github.com/AndiYangcs" rel="noopener">GitHub</a></li>
    <li><a href="https://www.linkedin.com/" rel="noopener">LinkedIn</a></li>
    <li><a href="mailto:hello@example.com">Email</a></li>
  </ul>
</aside>

<script>
  // Scroll-spy: highlight the section currently in view.
  const links = document.querySelectorAll<HTMLAnchorElement>('[data-nav-id]');
  const idToLink = new Map<string, HTMLAnchorElement>();
  links.forEach((a) => idToLink.set(a.dataset.navId!, a));

  const obs = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const link = idToLink.get(e.target.id);
        if (!link) continue;
        if (e.isIntersecting) {
          links.forEach((l) => l.removeAttribute('aria-current'));
          link.setAttribute('aria-current', 'true');
        }
      }
    },
    { rootMargin: '-40% 0px -55% 0px' },
  );
  document.querySelectorAll<HTMLElement>('main section[id]').forEach((s) => obs.observe(s));
</script>

<style>
  .resume-sidebar {
    position: sticky; top: var(--space-12);
    display: flex; flex-direction: column; gap: var(--space-8);
    min-height: calc(100vh - var(--space-16));
    padding-right: var(--space-6);
  }
  .resume-sidebar h1 {
    margin: 0 0 var(--space-2);
    font-size: var(--type-3xl);
    color: var(--fg);
  }
  .resume-sidebar__role {
    margin: 0; color: var(--accent); font-family: var(--font-mono);
  }
  .resume-sidebar__bio { color: var(--fg-muted); margin-top: var(--space-4); }
  .resume-sidebar__nav ul {
    list-style: none; padding: 0; margin: 0;
    display: flex; flex-direction: column; gap: var(--space-3);
  }
  .resume-sidebar__nav a {
    display: inline-flex; align-items: center; gap: var(--space-3);
    color: var(--fg-muted); font-family: var(--font-mono);
    font-size: var(--type-sm); text-transform: uppercase; letter-spacing: 0.08em;
  }
  .resume-sidebar__nav a:hover { color: var(--fg); text-decoration: none; }
  .resume-sidebar__bar {
    display: inline-block; width: 1.5rem; height: 1px; background: var(--fg-muted);
    transition: width 200ms ease, background 200ms ease;
  }
  .resume-sidebar__nav a[aria-current="true"] { color: var(--accent); }
  .resume-sidebar__nav a[aria-current="true"] .resume-sidebar__bar {
    width: 3rem; background: var(--accent);
  }
  .resume-sidebar__socials {
    list-style: none; padding: 0; margin: 0;
    display: flex; gap: var(--space-4);
    font-family: var(--font-mono); font-size: var(--type-sm);
  }
  @media (max-width: 900px) {
    .resume-sidebar { position: static; min-height: 0; padding-right: 0; }
  }
</style>
```

- [ ] **Step 11.2: Create ResumeSection.astro**

Create `src/components/ResumeSection.astro`:

```astro
---
interface Props { id: string; title: string; }
const { id, title } = Astro.props;
---
<section id={id} class="resume-section">
  <h2>{title}</h2>
  <div class="resume-section__body">
    <slot />
  </div>
</section>
<style>
  .resume-section { padding: var(--space-12) 0; scroll-margin-top: var(--space-12); }
  .resume-section h2 {
    font-family: var(--font-mono); font-size: var(--type-sm);
    text-transform: uppercase; letter-spacing: 0.12em;
    color: var(--accent); margin: 0 0 var(--space-6);
  }
  .resume-section__body { color: var(--fg); }
</style>
```

- [ ] **Step 11.3: Create ProjectCard.astro**

Create `src/components/ProjectCard.astro`:

```astro
---
interface Props { title: string; href?: string; tags: string[]; }
const { title, href = '#', tags } = Astro.props;
---
<a class="project-card" href={href} rel="noopener">
  <h3>{title}</h3>
  <p><slot /></p>
  <ul class="project-card__tags">
    {tags.map((t) => <li>{t}</li>)}
  </ul>
</a>
<style>
  .project-card {
    display: flex; flex-direction: column; gap: var(--space-3);
    padding: var(--space-6);
    background: var(--bg-elev);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    color: var(--fg);
    transition: transform 200ms ease, border-color 200ms ease, background 200ms ease;
  }
  .project-card:hover {
    transform: translateY(-3px);
    border-color: var(--accent);
    text-decoration: none;
  }
  .project-card h3 { margin: 0; color: var(--accent); font-size: var(--type-lg); }
  .project-card__tags {
    list-style: none; padding: 0; margin: 0;
    display: flex; flex-wrap: wrap; gap: var(--space-2);
  }
  .project-card__tags li {
    padding: 2px var(--space-2);
    border: 1px solid var(--border);
    border-radius: var(--radius-pill);
    font-family: var(--font-mono); font-size: 0.75rem;
    color: var(--fg-muted);
  }
</style>
```

- [ ] **Step 11.4: Create professional.astro**

Create `src/pages/professional.astro`:

```astro
---
import PageLayout from '../layouts/PageLayout.astro';
import ResumeSidebar from '../components/ResumeSidebar.astro';
import ResumeSection from '../components/ResumeSection.astro';
import ProjectCard from '../components/ProjectCard.astro';
---
<PageLayout title="Professional Andi" persona="professional">
  <div class="resume-grid">
    <ResumeSidebar />

    <main class="resume-content">
      <ResumeSection id="about" title="About">
        <p>
          I'm an engineer who enjoys turning messy product problems into
          systems that are pleasant to operate. Most recently I've been
          working on developer platforms — internal tools, build pipelines,
          and the unglamorous glue that makes engineering teams faster.
        </p>
      </ResumeSection>

      <ResumeSection id="skills" title="Skills">
        <ul class="skills">
          <li><strong>Languages:</strong> TypeScript, Python, Go, SQL</li>
          <li><strong>Frameworks:</strong> React, Astro, Node.js, FastAPI</li>
          <li><strong>Cloud:</strong> AWS, GitHub Actions, Docker</li>
          <li><strong>Practices:</strong> TDD, code review, observability, DX</li>
        </ul>
      </ResumeSection>

      <ResumeSection id="experience" title="Experience">
        <article class="role">
          <header>
            <h3>Software Engineer · Westpac</h3>
            <span>2023 — Present</span>
          </header>
          <ul>
            <li>Built internal tooling that reduced deploy time for a critical service.</li>
            <li>Owned the developer experience for a multi-team platform.</li>
          </ul>
          <ul class="tags">
            <li>TypeScript</li><li>AWS</li><li>GitHub Actions</li>
          </ul>
        </article>

        <article class="role">
          <header>
            <h3>Previous Role · Earlier Company</h3>
            <span>2021 — 2023</span>
          </header>
          <ul>
            <li>Shipped customer-facing features in a React + Node stack.</li>
            <li>Mentored junior engineers through code review and pairing.</li>
          </ul>
          <ul class="tags">
            <li>React</li><li>Node.js</li><li>PostgreSQL</li>
          </ul>
        </article>
      </ResumeSection>

      <ResumeSection id="education" title="Education">
        <article class="role">
          <header>
            <h3>BSc Computer Science · University</h3>
            <span>2017 — 2020</span>
          </header>
          <p>Coursework: algorithms, distributed systems, compilers.</p>
        </article>
      </ResumeSection>

      <ResumeSection id="projects" title="Projects">
        <div class="project-grid">
          <ProjectCard
            title="AndiYangcs.github.io"
            href="https://github.com/AndiYangcs/AndiYangcs.github.io"
            tags={["Astro","React","TypeScript"]}
          >
            This site. Astro + React islands, deployed to GitHub Pages.
          </ProjectCard>
          <ProjectCard
            title="Sample Project"
            href="#"
            tags={["TypeScript","Node.js"]}
          >
            Placeholder card — will be replaced with real projects.
          </ProjectCard>
        </div>
      </ResumeSection>

      <ResumeSection id="contact" title="Contact">
        <p>
          Easiest way to reach me is via
          <a href="mailto:hello@example.com">email</a> or
          <a href="https://www.linkedin.com/" rel="noopener">LinkedIn</a>.
        </p>
      </ResumeSection>
    </main>
  </div>

  <style>
    .resume-grid {
      display: grid;
      grid-template-columns: var(--sidebar-w) minmax(0, 1fr);
      gap: var(--space-12);
    }
    @media (max-width: 900px) {
      .resume-grid { grid-template-columns: 1fr; gap: var(--space-6); }
    }
    .skills { list-style: none; padding: 0; margin: 0; display: grid; gap: var(--space-2); }
    .role { padding: var(--space-4) 0; border-top: 1px solid var(--border); }
    .role:first-of-type { border-top: 0; padding-top: 0; }
    .role header { display: flex; justify-content: space-between; gap: var(--space-4); flex-wrap: wrap; }
    .role h3 { margin: 0 0 var(--space-2); font-size: var(--type-lg); color: var(--fg); }
    .role header span { color: var(--fg-muted); font-family: var(--font-mono); font-size: var(--type-sm); }
    .role ul { margin: var(--space-2) 0; padding-left: var(--space-6); }
    .tags { list-style: none; padding: 0; display: flex; flex-wrap: wrap; gap: var(--space-2); }
    .tags li {
      padding: 2px var(--space-2);
      border: 1px solid var(--border);
      border-radius: var(--radius-pill);
      font-family: var(--font-mono); font-size: 0.75rem;
      color: var(--fg-muted);
    }
    .project-grid {
      display: grid; gap: var(--space-4);
      grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
    }
  </style>
</PageLayout>
```

- [ ] **Step 11.5: Smoke-test**

```powershell
npm run dev -- --port 4321
```

Visit `http://localhost:4321/professional`. Verify:
- Sidebar visible on the left with name, role, nav links, socials.
- Scrolling highlights the active nav entry (scroll-spy).
- Theme switcher (top-left) and pro/real pill (top-right) both visible.
- Switching to "Real" pill navigates to `/real` (which currently 404s — fixed in Task 12).

Stop dev server.

- [ ] **Step 11.6: Commit**

```powershell
git add src/components/ResumeSidebar.astro src/components/ResumeSection.astro src/components/ProjectCard.astro src/pages/professional.astro
git commit -m "feat(pro): add Professional Andi resume page"
```

---

## Task 12: Real page (`/real`)

**Files:**
- Create: `src/pages/real.astro`.

- [ ] **Step 12.1: Create real.astro**

Create `src/pages/real.astro`:

```astro
---
import PageLayout from '../layouts/PageLayout.astro';
---
<PageLayout title="Real Andi" persona="real">
  <header class="real-hero">
    <h1>Real Andi</h1>
    <p>Stuff I do when I'm not at a terminal.</p>
  </header>

  <section class="real-section">
    <h2>About me beyond work</h2>
    <p>
      I grew up in Sydney, drink probably too much coffee, and spend weekends
      either outside or buried in a hobby project that wasn't planned.
    </p>
  </section>

  <section class="real-section">
    <h2>Hobbies &amp; interests</h2>
    <ul class="card-grid">
      <li>🎧 Music — discovering, not making</li>
      <li>🎮 Games — mostly slow, strategy-heavy stuff</li>
      <li>🏃 Running — chasing a sub-50 10k</li>
      <li>🍳 Cooking — a long-running side quest</li>
      <li>📷 Photography — film when I can, phone when I can't</li>
      <li>📚 Reading — sci-fi and engineering bios</li>
    </ul>
  </section>

  <section class="real-section">
    <h2>Currently</h2>
    <ul class="now-list">
      <li><strong>Reading:</strong> "The Pragmatic Programmer"</li>
      <li><strong>Watching:</strong> back-catalogue of "Severance"</li>
      <li><strong>Learning:</strong> Rust, slowly</li>
      <li><strong>Listening:</strong> a lot of Bonobo</li>
    </ul>
  </section>

  <section class="real-section">
    <h2>Photo gallery</h2>
    <div class="gallery">
      <div class="gallery__tile" aria-label="Placeholder photo 1"></div>
      <div class="gallery__tile" aria-label="Placeholder photo 2"></div>
      <div class="gallery__tile" aria-label="Placeholder photo 3"></div>
      <div class="gallery__tile" aria-label="Placeholder photo 4"></div>
      <div class="gallery__tile" aria-label="Placeholder photo 5"></div>
      <div class="gallery__tile" aria-label="Placeholder photo 6"></div>
    </div>
  </section>

  <section class="real-section">
    <h2>Fun facts</h2>
    <ul>
      <li>I once debugged a production outage from a mountain.</li>
      <li>My text editor configuration is older than my CV.</li>
      <li>I will sort a deck of cards for fun.</li>
    </ul>
  </section>

  <section class="real-section">
    <h2>Favorites</h2>
    <div class="favorites">
      <div>
        <h3>Albums</h3>
        <ul><li>Bonobo — Migration</li><li>Bon Iver — 22, A Million</li></ul>
      </div>
      <div>
        <h3>Films</h3>
        <ul><li>Arrival</li><li>The Social Network</li></ul>
      </div>
      <div>
        <h3>Books</h3>
        <ul><li>Project Hail Mary</li><li>The Soul of a New Machine</li></ul>
      </div>
      <div>
        <h3>Games</h3>
        <ul><li>Outer Wilds</li><li>Slay the Spire</li></ul>
      </div>
    </div>
  </section>

  <style>
    .real-hero { padding: var(--space-8) 0 var(--space-6); }
    .real-hero h1 { font-size: var(--type-3xl); margin: 0 0 var(--space-2); color: var(--accent); font-family: var(--font-mono); }
    .real-hero p { color: var(--fg-muted); margin: 0; }
    .real-section { padding: var(--space-8) 0; border-top: 1px solid var(--border); }
    .real-section h2 {
      font-family: var(--font-mono); font-size: var(--type-sm);
      text-transform: uppercase; letter-spacing: 0.12em;
      color: var(--accent); margin: 0 0 var(--space-4);
    }
    .card-grid {
      list-style: none; padding: 0; margin: 0;
      display: grid; gap: var(--space-4);
      grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
    }
    .card-grid li {
      padding: var(--space-4);
      background: var(--bg-elev);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
    }
    .now-list { list-style: none; padding: 0; display: grid; gap: var(--space-2); }
    .gallery {
      display: grid; gap: var(--space-3);
      grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
    }
    .gallery__tile {
      aspect-ratio: 1 / 1;
      background:
        linear-gradient(135deg, var(--accent-soft) 0%, transparent 70%),
        var(--bg-elev);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
    }
    .favorites {
      display: grid; gap: var(--space-6);
      grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
    }
    .favorites h3 { margin: 0 0 var(--space-2); font-size: var(--type-base); color: var(--fg); }
    .favorites ul { margin: 0; padding-left: var(--space-6); color: var(--fg-muted); }
  </style>
</PageLayout>
```

- [ ] **Step 12.2: Smoke-test**

```powershell
npm run dev -- --port 4321
```

Visit `http://localhost:4321/real`. Verify:
- All 6 sections render.
- Pill toggle in top-right shows "Real" active; clicking "Professional" navigates back.
- Theme switcher cycles palettes; refresh preserves selection.
- `/` still shows the landing animation (skips it if you arrived via the pill).

Stop dev server.

- [ ] **Step 12.3: Commit**

```powershell
git add src/pages/real.astro
git commit -m "feat(real): add Real Andi personal page"
```

---

## Task 13: Final test + build verification

**Files:** none new.

- [ ] **Step 13.1: Run the full test suite**

```powershell
npm test
```

Expected: all tests green across `theme`, `nav-flag`, `terminal-input`, `ThemeSwitcher`, `ProToggle`, `Terminal` (≥ 24 passing tests).

- [ ] **Step 13.2: Produce a production build**

```powershell
npm run build
```

Expected: `dist/` contains `index.html`, `professional/index.html`, `real/index.html`, plus hashed JS/CSS assets. Exit code 0.

- [ ] **Step 13.3: Preview the build**

```powershell
npm run preview -- --port 4322
```

Open `http://localhost:4322/`, click through all three pages, switch themes, click the pill toggle. Verify no console errors. Stop the preview.

- [ ] **Step 13.4: Commit any stragglers (if needed)**

```powershell
git status
```

If anything is uncommitted (lockfile updates, etc.):

```powershell
git add .
git commit -m "chore: lockfile + build verification"
```

---

## Task 14: GitHub Actions deploy workflow

**Files:**
- Create: `.github/workflows/deploy.yml`.

- [ ] **Step 14.1: Create the workflow**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm test
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 14.2: Commit**

```powershell
git add .github/workflows/deploy.yml
git commit -m "ci: add GitHub Pages deploy workflow"
```

- [ ] **Step 14.3: Push to main**

```powershell
git push origin main
```

If `git push` fails (auth), use the GitHub MCP fallback: push each new file via `mcp__github__push_files` to repo `AndiYangcs/AndiYangcs.github.io`, branch `main`, in a single multi-file commit per task batch.

- [ ] **Step 14.4: Configure Pages source (one-time, manual)**

Tell the user:

> In GitHub → repository **AndiYangcs/AndiYangcs.github.io** → **Settings → Pages**, set **Source = "GitHub Actions"**. (No branch selection needed.) Then re-run the workflow if it failed once for that reason.

- [ ] **Step 14.5: Verify deployment**

After the workflow completes, open `https://andiyangcs.github.io` and walk through the success criteria in Section 9 of the spec:

1. Terminal landing with typewriter animation ✅
2. Choice buttons → `/professional`, `/real` ✅
3. Prompt accepts input, shows canned response ✅
4. Pro/Real pill switches between the two without returning to `/` ✅
5. Theme switcher cycles all 5 palettes; persists across reloads ✅
6. Landing animation skipped on internal nav, played on direct load + refresh ✅
7. `↻ replay` re-triggers the animation ✅
8. Site is fully responsive (DevTools mobile preview) ✅
9. Lighthouse scores ≥ 90 on Performance / A11y / Best Practices / SEO ✅
10. GitHub Actions deploys on push to `main` ✅

If Lighthouse flags issues, address them inline (typical fixes: `<meta name="description">` length, color-contrast on `--fg-muted`, missing `lang`/`alt` attributes).

---

## Self-Review Notes

- **Spec coverage:** All 9 success criteria map to tasks 10–14. The 5 themes (Section 5.1) are encoded in `src/styles/themes.css` (Task 3); persistence + no-FOUC bootstrap in `BaseLayout.astro` (Task 9). Persona toggle behaviour (Section 5.2) including the sessionStorage flag is in `ProToggle.tsx` + `nav-flag.ts`. Landing animation matrix (Section 4.1) is handled by `Terminal.tsx` props + the inline script in `index.astro`.
- **Out-of-scope items** from Section 8 are explicitly not implemented (real CV content, custom domain, guestbook, live APIs, analytics, real terminal commands, i18n) — placeholders cover what's needed for v1.
- **No placeholder steps** — every code block is complete.
- **Type consistency:** `ThemeId`, `Persona`, `NavType`, and `TerminalResponse` are defined once in `src/lib/*` and re-used by their consumers.
- **Known fragility:** the landing-page intro-skip currently hides the typed region via a CSS attribute rather than passing a prop into the island. If this feels janky in the smoke test (Step 10.2), the follow-up is to expose `playIntro` to the island via `window.__playIntro` set before island hydration and read inside `useEffect`. Tracked in Task 10's note.
