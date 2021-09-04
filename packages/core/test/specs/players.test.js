import { Randomness } from '@creatartis/randomness';
import {
  Player, RandomPlayer, TracePlayer, HeuristicPlayer,
  tests,
} from '../../src/players';

const RANDOM = Randomness.DEFAULT;

describe('players', () => {
  it('expected definitions', () => {
    expect(Player).toBeOfType('function');
    expect(RandomPlayer).toBeOfType('function');
  });

  it('RandomPlayer with Predefined', async () => {
    await tests.checkPlayerWithPredefined({
      playerBuilder: () => new RandomPlayer({
        random: RANDOM,
      }),
    });
  });

  it('TracePlayer with Predefined', async () => {
    await tests.checkPlayerWithPredefined({
      playerBuilder: () => new TracePlayer({
        random: RANDOM,
        trace: [1, 2, 3, 4, 5, 6].map((n) => ({ First: n, Second: n })),
      }),
    });
  });

  it('HeuristicPlayer with Predefined', async () => {
    await tests.checkPlayerWithPredefined({
      playerBuilder: () => new HeuristicPlayer({
        random: RANDOM,
      }),
    });
  });
}); // describe 'players'
