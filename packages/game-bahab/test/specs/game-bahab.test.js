import { describe, expect, expectTypeOf, test } from 'vitest';
import { TestSpectator } from '@ludorum/core';
import { Bahab } from '../../src/index';

const MATCH_COUNT = 15;

describe('Bahab', () => {
  test('has the expected definitions', () => {
    expectTypeOf(Bahab).toBeFunction();
  });

  test('Bahab works like a game', async () => {
    await TestSpectator.testGame({
      expect,
      game: new Bahab(),
      matchCount: MATCH_COUNT,
    });
  });
}); // describe 'Bahab' 
