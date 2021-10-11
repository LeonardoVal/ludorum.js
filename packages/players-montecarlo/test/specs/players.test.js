import Randomness from '@creatartis/randomness/Randomness';
import { tests } from '@ludorum/core/players';
import {
  MonteCarloPlayer,
} from '../../src/players';

const RANDOM = Randomness.DEFAULT;

describe('players', () => {
  it('expected definitions', () => {
    expect(MonteCarloPlayer).toBeOfType('function');
  });

  it('MonteCarloPlayer with Predefined', async () => {
    await tests.checkPlayerWithPredefined({
      playerBuilder: () => new MonteCarloPlayer({ random: RANDOM }),
    });
  });
}); // describe 'players'
