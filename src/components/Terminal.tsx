import { useEffect, useRef, useState, type FormEvent } from 'react';
import { markInternalNav, shouldPlayLandingIntro, type NavType } from '../lib/nav-flag';
import { handleTerminalInput } from '../lib/terminal-input';
import { PROFILE } from '../lib/profile';
import { applyTheme } from '../lib/theme';

// Marker line that renders as the interactive Professional/Real choice
// boxes instead of as typed text.
const CHOICES_MARKER = '__CHOICES__';

const INTRO_LINES = [
  '$ whoami',
  `> Name:     ${PROFILE.name}`,
  `> Title:    ${PROFILE.title}`,
  `> Location: ${PROFILE.location}`,
  '',
  '$ ls',
  '> Which Andi would you like to explore?',
  '',
  CHOICES_MARKER,
  '',
  "> (or type 'help' for more commands)",
];

const CHAR_DELAY_MS = 28;
const LINE_DELAY_MS = 180;

function buildEndState(): string {
  return INTRO_LINES.join('\n');
}

// Render a single terminal line with appropriate token coloring.
// - "$ <cmd>"        → green prompt + bright command
// - "> Label: value" → muted arrow + accent label + bright value
// - "> <text>"       → muted arrow + default output text
// - ""               → blank spacer line
// `outClass` lets callers tint the output (e.g. red for errors).
function renderLine(
  line: string,
  key: string | number,
  opts: { cursor?: boolean; outClass?: string } = {},
) {
  const cls = 't-line' + (opts.cursor ? ' t-line--cursor' : '');
  const outClass = opts.outClass ?? 't-out';

  if (line.startsWith('$ ')) {
    return (
      <div key={key} className={cls}>
        <span className="t-prompt">$ </span>
        <span className="t-cmd">{line.slice(2)}</span>
      </div>
    );
  }
  if (line.startsWith('> ')) {
    const rest = line.slice(2);
    // Only tokenize "Label: value" pairs for non-error lines, and only when
    // the label looks like a single capitalized word/phrase (not arbitrary
    // sentences that happen to contain a colon, like "command not found: x").
    const m =
      outClass === 't-out'
        ? rest.match(/^([A-Z][A-Za-z]*):(\s+)(.*)$/)
        : null;
    if (m) {
      return (
        <div key={key} className={cls}>
          <span className="t-arrow">&gt; </span>
          <span className="t-key">{m[1]}:</span>
          <span>{m[2]}</span>
          <span className="t-val">{m[3]}</span>
        </div>
      );
    }
    return (
      <div key={key} className={cls}>
        <span className="t-arrow">&gt; </span>
        <span className={outClass}>{rest}</span>
      </div>
    );
  }
  // Empty / unknown line: keep height with nbsp so blanks stay visible.
  return (
    <div key={key} className={cls}>
      {line || '\u00A0'}
    </div>
  );
}

export function Terminal({ playIntro }: { playIntro: boolean }) {
  // Resolve whether to actually animate on first mount. The parent passes
  // playIntro={true} for the landing page; we self-downgrade to false when
  // the user arrived via back/forward or via the internal-nav flag (set by
  // ProToggle / Terminal choice clicks). shouldPlayLandingIntro consumes
  // the flag so subsequent renders see a clean slate.
  const [animate] = useState<boolean>(() => {
    if (!playIntro) return false;
    if (typeof window === 'undefined') return true;
    const nav = performance.getEntriesByType('navigation')[0] as
      | (PerformanceNavigationTiming & { type: NavType })
      | undefined;
    const navType: NavType = nav?.type ?? 'navigate';
    return shouldPlayLandingIntro({ navType });
  });

  // Initial '$ ' (not '') matches the post-replay assertion in tests: the prompt
  // character is always visible, even before the typewriter starts.
  const [typed, setTyped] = useState<string>(animate ? '$ ' : buildEndState());
  const [done, setDone] = useState<boolean>(!animate);
  const [history, setHistory] = useState<
    Array<{ input: string; lines: string[]; isError?: boolean }>
  >([]);
  const [input, setInput] = useState('');
  const [replayCounter, setReplayCounter] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const [viewport, setViewport] = useState<{ w: number; h: number } | null>(
    () =>
      typeof window === 'undefined'
        ? null
        : { w: window.innerWidth, h: window.innerHeight },
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onResize = () =>
      setViewport({ w: window.innerWidth, h: window.innerHeight });
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!animate && replayCounter === 0) return;

    let cancelled = false;
    setTyped('$ ');
    setDone(false);
    setHistory([]);

    // Flat schedule of timer callbacks (callback-based, not async/await)
    // so vi.advanceTimersByTime can drive the whole animation synchronously.
    let buf = '';
    let lineIdx = 0;
    let charIdx = 0;

    const step = () => {
      if (cancelled) return;
      if (lineIdx >= INTRO_LINES.length) {
        setDone(true);
        return;
      }
      const line = INTRO_LINES[lineIdx];
      const isLastLine = lineIdx === INTRO_LINES.length - 1;
      // Markers (e.g. the choice boxes) emit whole, no char-by-char.
      if (line === CHOICES_MARKER) {
        buf += line + (isLastLine ? '' : '\n');
        setTyped(buf);
        lineIdx++;
        charIdx = 0;
        setTimeout(step, LINE_DELAY_MS * 2);
        return;
      }
      if (charIdx < line.length) {
        buf += line[charIdx];
        charIdx++;
        setTyped(buf);
        setTimeout(step, CHAR_DELAY_MS);
      } else {
        // Don't append a trailing newline after the final line.
        if (!isLastLine) buf += '\n';
        setTyped(buf);
        lineIdx++;
        charIdx = 0;
        setTimeout(step, LINE_DELAY_MS);
      }
    };

    setTimeout(step, CHAR_DELAY_MS);

    return () => {
      cancelled = true;
    };
  }, [animate, replayCounter]);

  useEffect(() => {
    if (done) inputRef.current?.focus();
  }, [done]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    const result = handleTerminalInput(input);
    setInput('');

    switch (result.kind) {
      case 'noop':
        return;
      case 'text':
        setHistory((h) => [...h, { input: trimmed, lines: result.lines }]);
        return;
      case 'error':
        setHistory((h) => [
          ...h,
          { input: trimmed, lines: result.lines, isError: true },
        ]);
        return;
      case 'clear':
        setHistory([]);
        setReplayCounter((n) => n + 1);
        return;
      case 'theme':
        applyTheme(result.theme);
        setHistory((h) => [
          ...h,
          { input: trimmed, lines: [`theme set to '${result.theme}'`] },
        ]);
        return;
      case 'navigate':
        markInternalNav();
        setHistory((h) => [
          ...h,
          { input: trimmed, lines: [`opening ${result.label}…`] },
        ]);
        if (typeof window !== 'undefined') {
          window.location.href = result.href;
        }
        return;
    }
  };

  const onChoice = () => markInternalNav();

  return (
    <section className="terminal" aria-label="Landing terminal">
      <div className="terminal__window">
        <div className="terminal__titlebar" aria-hidden="true">
          <div className="terminal__traffic">
            <span className="terminal__dot terminal__dot--close" />
            <span className="terminal__dot terminal__dot--min" />
            <span className="terminal__dot terminal__dot--max" />
          </div>
          <div className="terminal__title">
            andi@portfolio — bash — {viewport ? `${viewport.w}×${viewport.h}` : '80×24'}
          </div>
          <div className="terminal__traffic terminal__traffic--spacer" />
        </div>

        <div className="terminal__body">
          <div className="terminal__screen" data-testid="typed-region">
            {(() => {
              const lines = typed.split('\n');
              const typing = !done;
              return lines.map((line, i) => {
                const isLast = i === lines.length - 1;
                if (line === CHOICES_MARKER) {
                  return (
                    <div key={i} className="t-line t-line--choices">
                      <div
                        className="terminal__choices"
                        role="group"
                        aria-label="Choose a persona"
                      >
                        <a
                          className="terminal__choice"
                          href="/professional"
                          onClick={onChoice}
                          aria-label="Professional Andi"
                        >
                          <pre className="terminal__choice-art">{`───────────────────
|  Professional   |
|      Andi       |
───────────────────`}</pre>
                        </a>
                        <a
                          className="terminal__choice"
                          href="/real"
                          onClick={onChoice}
                          aria-label="Real Andi"
                        >
                          <pre className="terminal__choice-art">{`───────────────────
|      Real       |
|      Andi       |
───────────────────`}</pre>
                        </a>
                      </div>
                    </div>
                  );
                }
                return renderLine(line, i, { cursor: isLast && typing });
              });
            })()}
          </div>

          {done && (
            <>
              <ul className="terminal__history" aria-live="polite">
                {history.map((h, i) => (
                  <li key={i}>
                    {renderLine(`$ ${h.input}`, `${i}-in`)}
                    {h.lines.map((line, j) =>
                      renderLine(`> ${line}`, `${i}-${j}`, {
                        outClass: h.isError ? 't-err' : 't-out',
                      }),
                    )}
                  </li>
                ))}
              </ul>

              <form className="terminal__prompt" onSubmit={onSubmit}>
                <label htmlFor="terminal-input" className="terminal__label" aria-hidden="true">
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
        </div>
      </div>

      <style>{`
        .terminal {
          font-family: var(--font-mono);
          max-width: var(--max-content-w);
          margin: 0 auto;
          padding: var(--space-12) var(--space-4);
          color: var(--fg);
        }
        .terminal__window {
          border-radius: 12px;
          overflow: hidden;
          background: var(--bg-elev);
          border: 1px solid var(--border);
          box-shadow:
            0 30px 60px -20px rgba(0, 0, 0, 0.6),
            0 18px 36px -18px rgba(0, 0, 0, 0.5),
            0 0 0 1px rgba(255, 255, 255, 0.02) inset;
        }
        .terminal__titlebar {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          background: linear-gradient(
            to bottom,
            color-mix(in srgb, var(--bg-elev) 70%, #ffffff 6%),
            var(--bg-elev)
          );
          border-bottom: 1px solid var(--border);
          user-select: none;
        }
        .terminal__traffic {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .terminal__traffic--spacer { visibility: hidden; }
        .terminal__dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          display: inline-block;
          box-shadow: inset 0 0 0 0.5px rgba(0, 0, 0, 0.3);
        }
        .terminal__dot--close { background: #ff5f57; }
        .terminal__dot--min   { background: #febc2e; }
        .terminal__dot--max   { background: #28c840; }
        .terminal__title {
          font-family: var(--font-sans);
          font-size: var(--type-sm);
          color: var(--fg-muted);
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .terminal__body {
          background: var(--bg);
          padding: var(--space-6) var(--space-6) var(--space-8);
        }
        @media (max-width: 600px) {
          .terminal__title { font-size: 0.75rem; }
          .terminal__body { padding: var(--space-4); }
        }
        .terminal__screen {
          font-family: var(--font-mono);
          margin: 0 0 var(--space-6);
          font-size: var(--type-lg);
          min-height: 12em;
          color: var(--fg);
        }
        .t-line {
          font-family: var(--font-mono);
          white-space: pre-wrap;
          min-height: 1.55em;
          line-height: 1.55;
        }
        .t-prompt { color: var(--success); font-weight: 600; }
        .t-cmd    { color: var(--fg); }
        .t-arrow  { color: var(--fg-muted); }
        .t-key    { color: var(--accent); }
        .t-val    { color: var(--fg); font-weight: 500; }
        .t-out    { color: var(--fg); }
        .t-err    { color: var(--danger); }

        .t-line--cursor::after {
          content: '█';
          display: inline-block;
          width: 0.6em;
          margin-left: 1px;
          animation: blink 1s steps(1) infinite;
          color: var(--success);
          vertical-align: baseline;
        }
        @keyframes blink { 50% { opacity: 0; } }

        /* Inline inside the typed region; surrounding blank lines provide spacing. */
        .t-line--choices { min-height: 0; }
        .terminal__choices {
          display: flex; gap: var(--space-6); flex-wrap: wrap;
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
        .terminal__choice-art {
          font-family: var(--font-mono);
          margin: 0;
          line-height: 1.1;
          white-space: pre;
        }
        .terminal__history {
          list-style: none; padding: 0; margin: 0 0 var(--space-4);
        }
        .terminal__prompt {
          display: flex; gap: var(--space-2); align-items: center;
          border-top: 1px dashed var(--border);
          padding-top: var(--space-3);
        }
        .terminal__label { color: var(--success); font-weight: 600; }
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