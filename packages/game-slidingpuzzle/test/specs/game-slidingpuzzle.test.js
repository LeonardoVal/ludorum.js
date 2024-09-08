import { describe, expect, expectTypeOf, test } from 'vitest';
import { TestSpectator } from '@ludorum/core';
import { SlidingPuzzle } from '../../src/index';

const MATCH_COUNT = 15;

describe('SlidingPuzzle', () => {
  test('has the expected definitions', () => {
    expectTypeOf(SlidingPuzzle).toBeFunction();
  });

  test('SlidingPuzzle works like a game', async () => {
    await TestSpectator.testGame({
      expect,
      game: new SlidingPuzzle(),
      matchCount: MATCH_COUNT,
    });
  });
}); // describe 'SlidingPuzzle' 
