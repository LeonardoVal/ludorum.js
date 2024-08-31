import { describe, expect, expectTypeOf, test } from 'vitest';
import { TestSpectator } from '@ludorum/core';
import { OddsAndEvens } from '../../src/index';

const MATCH_COUNT = 15;

describe('OddsAndEvens', () => {
  test('has the expected definitions', () => {
    expectTypeOf(OddsAndEvens).toBeFunction();
  });

  test('OddsAndEvens works like a game', async () => {
    await TestSpectator.testGame({
      expect,
      game: new OddsAndEvens(),
      matchCount: MATCH_COUNT,
    });
  });
}); // describe 'OddsAndEvens' 
