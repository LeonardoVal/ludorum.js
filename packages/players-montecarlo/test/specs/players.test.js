import { MersenneTwister } from '@creatartis/randomness';
import { Choose2Win, playerTests } from '@ludorum/core';
import {
  MonteCarloPlayer,
} from '../../src/index';

const RANDOM = new MersenneTwister(parseInt('MonteCarlo', 32) % 1e8);
const MATCH_COUNT = 4;

describe('players', () => {
  it('expected definitions', () => {
    expect(MonteCarloPlayer).toBeOfType('function');
  });

  it('MonteCarloPlayer with Predefined', async () => {
    for (let i = 0; i < MATCH_COUNT; i += 1) {
      await playerTests.checkPlayerWithPredefined({
        playerBuilder: () => new MonteCarloPlayer({ random: RANDOM }),
      });
    }
  });

  it('MonteCarloPlayer with Choose2Win', async () => {
    for (let i = 0; i < MATCH_COUNT; i += 1) {
      await playerTests.checkPlayer({
        game: new Choose2Win(),
        playerBuilder: () => new MonteCarloPlayer({ random: RANDOM }),
      });
    }
  });
}); // describe 'players'
