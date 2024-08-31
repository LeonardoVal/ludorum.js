import { describe, expect, expectTypeOf, test } from 'vitest';
import { TestSpectator } from '@ludorum/core';
import { Pig } from '../../src/index';

const MATCH_COUNT = 15;

describe('Pig', () => {
  test('has the expected definitions', () => {
    expectTypeOf(Pig).toBeFunction();
  });

  test('Pig works like a game', async () => {
    await TestSpectator.testGame({
      expect,
      game: new Pig(),
      matchCount: MATCH_COUNT,
    });
  });
}); // describe 'Pig' 
