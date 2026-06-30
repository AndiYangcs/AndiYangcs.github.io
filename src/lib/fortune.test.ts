import { describe, it, expect } from 'vitest';
import { createFortunePicker } from './fortune';

/** Deterministic RNG: cycles through the given values. */
function seededRng(values: number[]): () => number {
  let i = 0;
  return () => values[i++ % values.length];
}

describe('createFortunePicker', () => {
  it('returns -1 when there are no facts', () => {
    const next = createFortunePicker(0);
    expect(next()).toBe(-1);
  });

  it('always returns 0 for a single fact', () => {
    const next = createFortunePicker(1);
    expect([next(), next(), next()]).toEqual([0, 0, 0]);
  });

  it('shows every index once before repeating any', () => {
    const next = createFortunePicker(5);
    const cycle = [next(), next(), next(), next(), next()];
    expect([...cycle].sort()).toEqual([0, 1, 2, 3, 4]);
  });

  it('never repeats the same index back-to-back across a reshuffle', () => {
    const next = createFortunePicker(4);
    let prev = next();
    for (let i = 0; i < 200; i++) {
      const cur = next();
      expect(cur).not.toBe(prev);
      prev = cur;
    }
  });

  it('is deterministic given a fixed rng', () => {
    const a = createFortunePicker(3, seededRng([0.1, 0.6, 0.3, 0.9]));
    const b = createFortunePicker(3, seededRng([0.1, 0.6, 0.3, 0.9]));
    const seqA = Array.from({ length: 6 }, () => a());
    const seqB = Array.from({ length: 6 }, () => b());
    expect(seqA).toEqual(seqB);
  });

  it('stays within range', () => {
    const next = createFortunePicker(7);
    for (let i = 0; i < 100; i++) {
      const v = next();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(7);
    }
  });
});
