import { PROFILE } from './profile';
import { PAGES } from './pages';
import { THEMES, isThemeId, type ThemeId } from './theme';

/**
 * All possible reactions the Terminal component can take after the user
 * submits a line. Pure data — no side effects here.
 */
export type TerminalResponse =
  | { kind: 'text'; lines: string[] }
  | { kind: 'error'; lines: string[] }
  | { kind: 'clear' }
  | { kind: 'theme'; theme: ThemeId }
  | { kind: 'navigate'; href: string; label: string }
  | { kind: 'noop' };

interface Command {
  name: string;
  usage?: string;
  description: string;
  run: (args: string[]) => TerminalResponse;
}

const pad = (s: string, n: number) => s + ' '.repeat(Math.max(0, n - s.length));

const whoami: Command = {
  name: 'whoami',
  description: 'Display name, title, and location',
  run: () => ({
    kind: 'text',
    lines: [
      `Name:     ${PROFILE.name}`,
      `Title:    ${PROFILE.title}`,
      `Location: ${PROFILE.location}`,
    ],
  }),
};

const about: Command = {
  name: 'about',
  description: 'Print a short bio',
  run: () => ({
    kind: 'text',
    lines: PROFILE.about.flatMap((p, i) => (i === 0 ? [p] : ['', p])),
  }),
};

const skills: Command = {
  name: 'skills',
  description: 'List technical skills by category',
  run: () => ({
    kind: 'text',
    lines: PROFILE.skills.map(
      (g) => `${pad(g.category + ':', 12)} ${g.items.join(', ')}`,
    ),
  }),
};

const experience: Command = {
  name: 'experience',
  description: 'Show work experience',
  run: () => {
    const out: string[] = [];
    PROFILE.experience.forEach((r, i) => {
      if (i > 0) out.push('');
      out.push(`${r.role} @ ${r.company}  (${r.period})`);
      r.bullets.forEach((b) => out.push(`  - ${b}`));
      if (r.tags.length) out.push(`  [${r.tags.join(', ')}]`);
    });
    return { kind: 'text', lines: out };
  },
};

const education: Command = {
  name: 'education',
  description: 'Show education background',
  run: () => {
    const out: string[] = [];
    PROFILE.education.forEach((e, i) => {
      if (i > 0) out.push('');
      out.push(`${e.degree} @ ${e.institution}  (${e.period})`);
      if (e.detail) out.push(`  ${e.detail}`);
    });
    return { kind: 'text', lines: out };
  },
};

const projects: Command = {
  name: 'projects',
  description: 'List portfolio projects',
  run: () => {
    const out: string[] = [];
    PROFILE.projects.forEach((p, i) => {
      if (i > 0) out.push('');
      out.push(`${p.title}  [${p.tags.join(', ')}]`);
      out.push(`  ${p.description}`);
      if (p.href && p.href !== '#') out.push(`  → ${p.href}`);
    });
    return { kind: 'text', lines: out };
  },
};

const socials: Command = {
  name: 'socials',
  description: 'Display email, GitHub, and LinkedIn',
  run: () => ({
    kind: 'text',
    lines: [
      `Email:    ${PROFILE.socials.email}`,
      `GitHub:   ${PROFILE.socials.github}`,
      `LinkedIn: ${PROFILE.socials.linkedin}`,
    ],
  }),
};

const ls: Command = {
  name: 'ls',
  description: 'List available pages',
  run: () => ({
    kind: 'text',
    lines: PAGES.map(
      (p) =>
        `${pad(p.id + '/', 16)} ${p.label}` +
        (p.description ? ` — ${p.description}` : ''),
    ),
  }),
};

const cd: Command = {
  name: 'cd',
  usage: 'cd <page>',
  description: 'Change into a page (navigate)',
  run: (args) => {
    // Strip trailing slash so `cd professional/` works too.
    const target = args[0]?.toLowerCase().replace(/\/$/, '');

    // Home-ish shortcuts → no-op since the terminal lives on /.
    if (!target || target === '.' || target === '~' || target === '/' || target === '..') {
      return { kind: 'text', lines: ['already at home (/)'] };
    }

    const page = PAGES.find((p) => p.id === target);
    if (!page) {
      return {
        kind: 'error',
        lines: [
          `cd: no such page: ${args[0]}`,
          "Type 'ls' to see available pages.",
        ],
      };
    }
    return { kind: 'navigate', href: `/${page.id}`, label: page.label };
  },
};

const themeCmd: Command = {
  name: 'theme',
  usage: 'theme <id>',
  description: `Switch theme (${THEMES.map((t) => t.id).join(', ')})`,
  run: (args) => {
    const id = args[0]?.toLowerCase();
    if (!id) {
      return {
        kind: 'error',
        lines: ['usage: theme <' + THEMES.map((t) => t.id).join('|') + '>'],
      };
    }
    if (!isThemeId(id)) {
      return {
        kind: 'error',
        lines: [
          `theme: unknown theme '${id}'`,
          'available: ' + THEMES.map((t) => t.id).join(', '),
        ],
      };
    }
    return { kind: 'theme', theme: id };
  },
};

const themesCmd: Command = {
  name: 'themes',
  description: 'List available themes',
  run: () => ({
    kind: 'text',
    lines: THEMES.map((t) => `${pad(t.id, 10)} ${t.label}`),
  }),
};

const clear: Command = {
  name: 'clear',
  description: 'Clear the terminal and replay intro',
  run: () => ({ kind: 'clear' }),
};

const date: Command = {
  name: 'date',
  description: 'Show current date and time',
  run: () => ({ kind: 'text', lines: [new Date().toString()] }),
};

const echo: Command = {
  name: 'echo',
  usage: 'echo <text>',
  description: 'Print the given text',
  run: (args) => ({ kind: 'text', lines: [args.join(' ')] }),
};

const sudo: Command = {
  name: 'sudo',
  usage: 'sudo <command>',
  description: 'Pretend to elevate privileges',
  run: () => ({
    kind: 'error',
    lines: ['Permission denied: nice try 😏'],
  }),
};

const help: Command = {
  name: 'help',
  description: 'Show this list of commands',
  run: () => {
    const rows = COMMANDS.map((c) => {
      const usage = c.usage ?? c.name;
      return `  ${pad(usage, 20)} ${c.description}`;
    });
    return {
      kind: 'text',
      lines: ['Available commands:', '', ...rows],
    };
  },
};

const COMMANDS: Command[] = [
  help,
  whoami,
  about,
  skills,
  experience,
  education,
  projects,
  socials,
  ls,
  cd,
  themeCmd,
  themesCmd,
  clear,
  date,
  echo,
  sudo,
];

const REGISTRY: Map<string, Command> = new Map(
  COMMANDS.map((c) => [c.name, c]),
);

export function handleTerminalInput(raw: string): TerminalResponse {
  const input = raw.trim();
  if (input.length === 0) return { kind: 'noop' };

  const parts = input.split(/\s+/);
  const name = parts[0].toLowerCase();
  const args = parts.slice(1);

  const cmd = REGISTRY.get(name);
  if (!cmd) {
    return {
      kind: 'error',
      lines: [
        `command not found: ${name}`,
        "Type 'help' to see available commands.",
      ],
    };
  }

  return cmd.run(args);
}

export const COMMAND_NAMES = COMMANDS.map((c) => c.name);
