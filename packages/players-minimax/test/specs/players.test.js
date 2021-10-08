import Randomness from '@creatartis/randomness/Randomness';
import { tests } from '@ludorum/core/players';
import {
  AlphaBetaPlayer, MaxNPlayer, MiniMaxPlayer,
} from '../../src/players';

const RANDOM = Randomness.DEFAULT;

describe('players', () => {
  it('expected definitions', () => {
    expect(MaxNPlayer).toBeOfType('function');
    expect(MiniMaxPlayer).toBeOfType('function');
  });

  it('MaxNPlayer with Predefined', async () => {
    await tests.checkPlayerWithPredefined({
      playerBuilder: () => new MaxNPlayer({ random: RANDOM }),
    });
  });

  it('MiniMaxPlayer with Predefined', async () => {
    await tests.checkPlayerWithPredefined({
      playerBuilder: () => new MiniMaxPlayer({ random: RANDOM }),
    });
  });

  it('AlphaBetaPlayer with Predefined', async () => {
    await tests.checkPlayerWithPredefined({
      playerBuilder: () => new AlphaBetaPlayer({ random: RANDOM }),
    });
  });
}); // describe 'players'
