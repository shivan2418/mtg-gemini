import { test, describe } from 'node:test';
import assert from 'node:assert';
import {
  createSeededRandom,
  getRandomOffset,
} from '../src/lib/seeded-random.js';

void describe('Seeded Random Functions', () => {
  void describe('createSeededRandom', () => {
    void test('should produce consistent results for the same seed', () => {
      const seed = 12345;
      const rng1 = createSeededRandom(seed);
      const rng2 = createSeededRandom(seed);

      // Generate several random numbers from each RNG
      const sequence1 = Array.from({ length: 10 }, () => rng1());
      const sequence2 = Array.from({ length: 10 }, () => rng2());

      assert.deepStrictEqual(sequence1, sequence2);
    });

    void test('should produce different results for different seeds', () => {
      const rng1 = createSeededRandom(12345);
      const rng2 = createSeededRandom(54321);

      const sequence1 = Array.from({ length: 10 }, () => rng1());
      const sequence2 = Array.from({ length: 10 }, () => rng2());

      assert.notDeepStrictEqual(sequence1, sequence2);
    });

    void test('should produce values between 0 and 1', () => {
      const rng = createSeededRandom(12345);

      for (let i = 0; i < 100; i++) {
        const value = rng();
        assert.ok(value >= 0);
        assert.ok(value < 1);
      }
    });
  });

  void describe('getRandomOffset', () => {
    void test('should produce consistent offsets for the same seed', () => {
      const seed = 12345;
      const totalCards = 1000;
      const actualCardCount = 10;

      const offset1 = getRandomOffset(seed, totalCards, actualCardCount);
      const offset2 = getRandomOffset(seed, totalCards, actualCardCount);

      assert.strictEqual(offset1, offset2);
    });

    void test('should produce different offsets for different seeds', () => {
      const totalCards = 1000;
      const actualCardCount = 10;

      const offset1 = getRandomOffset(12345, totalCards, actualCardCount);
      const offset2 = getRandomOffset(54321, totalCards, actualCardCount);

      assert.notStrictEqual(offset1, offset2);
    });

    void test('should handle undefined/null seed by using non-deterministic random', () => {
      const totalCards = 1000;
      const actualCardCount = 10;

      const offset1 = getRandomOffset(null, totalCards, actualCardCount);
      const offset2 = getRandomOffset(undefined, totalCards, actualCardCount);

      // These should be valid offsets
      assert.ok(offset1 >= 0);
      assert.ok(offset1 <= totalCards - actualCardCount);
      assert.ok(offset2 >= 0);
      assert.ok(offset2 <= totalCards - actualCardCount);
    });

    void test('should return 0 when totalCards equals actualCardCount', () => {
      const seed = 12345;
      const totalCards = 10;
      const actualCardCount = 10;

      const offset = getRandomOffset(seed, totalCards, actualCardCount);

      assert.strictEqual(offset, 0);
    });

    void test('should return 0 when actualCardCount exceeds totalCards', () => {
      const seed = 12345;
      const totalCards = 5;
      const actualCardCount = 10;

      const offset = getRandomOffset(seed, totalCards, actualCardCount);

      assert.strictEqual(offset, 0);
    });
  });
});
