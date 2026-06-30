/**
 * Random "fortune" picker for the Fortune Cookie fun-facts widget.
 *
 * Yields indices 0..count-1 in a random order, only reshuffling once every
 * index has been shown ("no repeats until you've seen them all"), and never
 * repeating the same index across the seam between two shuffles.
 */

export type Rng = () => number;

export function createFortunePicker(count: number, rng: Rng = Math.random) {
  let queue: number[] = [];
  let last = -1;

  function shuffle(): number[] {
    const a = Array.from({ length: count }, (_, i) => i);
    // Fisher–Yates
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    // We pop() from the end, so a[length-1] is the next item. If it matches the
    // last one shown, swap it to the front to avoid an immediate repeat.
    if (count > 1 && a[a.length - 1] === last) {
      [a[0], a[a.length - 1]] = [a[a.length - 1], a[0]];
    }
    return a;
  }

  return function next(): number {
    if (count <= 0) return -1;
    if (queue.length === 0) queue = shuffle();
    last = queue.pop() as number;
    return last;
  };
}
