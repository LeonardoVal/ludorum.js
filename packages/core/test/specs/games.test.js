import { describe, expect, test } from 'vitest';
import {
  Bet, Choose2Win, Game, Predefined,
} from '../../src/games';
import { TestSpectator } from '../../src/matches/TestSpectator';

describe('games', () => {
  test('expected definitions', () => {
    [Bet, Choose2Win, Game, Predefined].forEach((def) => {
      expect(typeof def).toBe('function');
    });
  });

  test('Predefined works like a game', async () => {
    await TestSpectator.testGame({ expect, game: new Predefined() });
  });

  test('Choose2Win works like a game', async () => {
    await TestSpectator.testGame({ expect, game: new Choose2Win() });
  });

  test('Bet works like a game', async () => {
    await TestSpectator.testGame({ expect, game: new Bet() });
  });
}); // describe 'games'
