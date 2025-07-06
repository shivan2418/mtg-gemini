/**
 * Simple seeded random number generator using Linear Congruential Generator (LCG)
 * This ensures reproducible random sequences for a given seed
 */
export function createSeededRandom(seed: number) {
  let value = seed;
  return function () {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

/**
 * Generate a random offset for card selection based on seed
 * Handles the case where seed is undefined by using Math.random()
 */
export function getRandomOffset(
  seed: number | null | undefined,
  totalCards: number,
  actualCardCount: number,
): number {
  if (seed == null) {
    // Fallback to regular random if no seed is provided
    return Math.floor(
      Math.random() * Math.max(0, totalCards - actualCardCount),
    );
  }

  const rng = createSeededRandom(seed);
  return Math.floor(rng() * Math.max(0, totalCards - actualCardCount));
}
