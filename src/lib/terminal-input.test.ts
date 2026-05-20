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
