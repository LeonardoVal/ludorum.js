import MersenneTwister from '@creatartis/randomness/generators/MersenneTwister';
import { tests } from '@ludorum/core/players';
import { Choose2Win } from '@ludorum/core/games';
import {
  MonteCarloPlayer,
} from '../../src/players';

const RANDOM = new MersenneTwister(parseInt('MonteCarlo', 32) % 1e8);
const MATCH_COUNT = 4;

describe('players', () => {
  it('expected definitions', () => {
    expect(MonteCarloPlayer).toBeOfType('function');
  });

  xit('MonteCarloPlayer with Predefined', async () => {
    for (let i = 0; i < MATCH_COUNT; i += 1) {
      await tests.checkPlayerWithPredefined({
        playerBuilder: () => new MonteCarloPlayer({ random: RANDOM }),
      });
    }
  });

  it('MonteCarloPlayer with Choose2Win', async () => {
    for (let i = 0; i < MATCH_COUNT; i += 1) {
      await tests.checkPlayer({
        game: new Choose2Win(),
        playerBuilder: () => new MonteCarloPlayer({ random: RANDOM }),
      });
    }
  });
}); // describe 'players'
