import randomness from '@creatartis/randomness';
import Predefined from '../../src/games/Predefined';
import Match from '../../src/Match';
import {
  Player, RandomPlayer, TracePlayer, HeuristicPlayer,
} from '../../src/players';

const { Randomness } = randomness;
const RANDOM = Randomness.DEFAULT;
const MATCH_COUNT = 5;

describe('players', () => {
  it('expected definitions', () => {
    expect(Player).toBeOfType('function');
    expect(RandomPlayer).toBeOfType('function');
  });

  const testWithPredefined = async (newPlayer) => {
    const height = 5;
    const width = 6;
    for (let i = 0; i < MATCH_COUNT; i += 1) {
      const result = { First: (i % 3) - 1, Second: 1 - (i % 3) };
      const game = new Predefined({
        activeRole: i % 2, result, height, width,
      });
      const players = [0, 1].map((n) => newPlayer(n));
      const match = new Match({ game, players });
      for await (const entry of match.run()) {
        expect(entry.game).toBeOfType(Predefined);
      }
      const { current, history } = match;
      expect(current.game.result).toEqual(result);
      expect(history.length).toBe(height + 1);
    }
  };

  it('RandomPlayer with Predefined', async () => {
    await testWithPredefined(() => new RandomPlayer({
      random: RANDOM,
    }));
  });

  it('TracePlayer with Predefined', async () => {
    await testWithPredefined(() => new TracePlayer({
      random: RANDOM,
      trace: [1, 2, 3, 4, 5, 6].map((n) => ({ First: n, Second: n })),
    }));
  });

  it('HeuristicPlayer with Predefined', async () => {
    await testWithPredefined(() => new HeuristicPlayer({
      random: RANDOM,
    }));
  });
}); // describe 'players'
