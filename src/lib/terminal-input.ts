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
