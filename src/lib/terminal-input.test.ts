import { describe, expect, it } from 'vitest';
import { handleTerminalInput } from './terminal-input';
import { PROFILE } from './profile';

describe('handleTerminalInput', () => {
  it('ignores empty input', () => {
    expect(handleTerminalInput('')).toEqual({ kind: 'noop' });
    expect(handleTerminalInput('   ')).toEqual({ kind: 'noop' });
  });

  it('returns error for unknown command', () => {
    const r = handleTerminalInput('foo');
    expect(r.kind).toBe('error');
    if (r.kind === 'error') {
      expect(r.lines[0]).toMatch(/command not found: foo/);
    }
  });

  it('runs whoami and includes profile name', () => {
    const r = handleTerminalInput('whoami');
    expect(r.kind).toBe('text');
    if (r.kind === 'text') {
      expect(r.lines.join('\n')).toContain(PROFILE.name);
    }
  });

  it('help lists every command name', () => {
    const r = handleTerminalInput('help');
    expect(r.kind).toBe('text');
    if (r.kind === 'text') {
      const text = r.lines.join('\n');
      ['help', 'whoami', 'about', 'skills', 'experience', 'projects',
        'socials', 'ls', 'cd', 'theme', 'clear', 'sudo'].forEach((name) => {
          expect(text).toContain(name);
        });
    }
  });

  it('ls lists all pages', () => {
    const r = handleTerminalInput('ls');
    expect(r.kind).toBe('text');
    if (r.kind === 'text') {
      const text = r.lines.join('\n');
      expect(text).toContain('professional');
      expect(text).toContain('real');
    }
  });

  it('cd with valid page returns navigate', () => {
    expect(handleTerminalInput('cd professional')).toMatchObject({
      kind: 'navigate',
      href: '/professional',
    });
  });

  it('cd with trailing slash still works', () => {
    expect(handleTerminalInput('cd real/')).toMatchObject({
      kind: 'navigate',
      href: '/real',
    });
  });

  it('cd with unknown page returns error', () => {
    const r = handleTerminalInput('cd nowhere');
    expect(r.kind).toBe('error');
  });

  it('cd with no args is a no-op text response', () => {
    const r = handleTerminalInput('cd');
    expect(r.kind).toBe('text');
  });

  it('clear returns clear kind', () => {
    expect(handleTerminalInput('clear')).toEqual({ kind: 'clear' });
  });

  it('theme with valid id returns theme response', () => {
    expect(handleTerminalInput('theme navy')).toEqual({
      kind: 'theme',
      theme: 'navy',
    });
  });

  it('theme with invalid id returns error', () => {
    const r = handleTerminalInput('theme rainbow');
    expect(r.kind).toBe('error');
  });

  it('sudo always denies', () => {
    const r = handleTerminalInput('sudo rm -rf /');
    expect(r.kind).toBe('error');
  });

  it('command name is case-insensitive', () => {
    expect(handleTerminalInput('HELP').kind).toBe('text');
  });
});
