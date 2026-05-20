import { useEffect, useRef, useState, type FormEvent } from 'react';
import { markInternalNav, shouldPlayLandingIntro, type NavType } from '../lib/nav-flag';
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
    Array<{ input: string; response: string }>
  >([]);
  const [input, setInput] = useState('');
  const [replayCounter, setReplayCounter] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

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
      if (charIdx < line.length) {
        buf += line[charIdx];
        charIdx++;
        setTyped(buf);
        setTimeout(step, CHAR_DELAY_MS);
      } else {
        buf += '\n';
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
    const result = handleTerminalInput(input);
    if (result.kind === 'text') {
      setHistory((h) => [...h, { input: input.trim(), response: result.text }]);
    }
    setInput('');
  };

  const onChoice = () => markInternalNav();

  return (
    <section className="terminal" aria-label="Landing terminal">
      <pre
        className={
          'terminal__screen' + (!done ? ' terminal__screen--typing' : '')
        }
        data-testid="typed-region"
      >
        {typed}
      </pre>

      {done && (
        <>
          <div className="terminal__choices" role="group" aria-label="Choose a persona">
            <a
              className="terminal__choice"
              href="/professional"
              onClick={onChoice}
              aria-label="Professional Andi"
            >
              <span>┌─────────────────┐</span>
              <span>│  Professional   │</span>
              <span>│      Andi       │</span>
              <span>└─────────────────┘</span>
            </a>
            <a
              className="terminal__choice"
              href="/real"
              onClick={onChoice}
              aria-label="Real Andi"
            >
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
        .terminal__screen--typing::after {
          content: '█';
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