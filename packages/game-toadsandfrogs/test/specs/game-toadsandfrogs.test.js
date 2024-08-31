import { describe, expect, expectTypeOf, test } from 'vitest';
import { TestSpectator } from '@ludorum/core';
import { ToadsAndFrogs } from '../../src/index';

const MATCH_COUNT = 15;

describe('ToadsAndFrogs', () => {
  test('has the expected definitions', () => {
    expectTypeOf(ToadsAndFrogs).toBeFunction();
  });

  test('ToadsAndFrogs works like a game', async () => {
    await TestSpectator.testGame({
      expect,
      game: new ToadsAndFrogs(),
      matchCount: MATCH_COUNT,
    });
  });
}); // describe 'ToadsAndFrogs' 
