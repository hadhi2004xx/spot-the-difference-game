// A tiny seeded random source (mulberry32). Scenes scatter stars, bubbles and grass from a
// fixed seed so the left and right panels are drawn from identical scatter — the only things
// that differ between the panels are the scene's declared differences, never the noise.

/** Hash a short string seed into a 32-bit integer. */
export function hashSeed(text) {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** Return a function giving the next pseudo-random number in [0, 1) for `seed`. */
export function makeRandom(seed) {
  let state = hashSeed(seed) >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/** A random number in [min, max) from a makeRandom function. */
export function between(next, min, max) {
  return min + next() * (max - min);
}
