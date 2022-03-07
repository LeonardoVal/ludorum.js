import { MersenneTwister } from '@creatartis/randomness';
import { Choose2Win, playerTests } from '@ludorum/core';
import {
  MonteCarloPlayer,
  UCTPlayer,
} from '../../src/index';

const RANDOM = new MersenneTwister(parseInt('MonteCarlo', 32) % 1e8);
const MATCH_COUNT = 4;

describe('players', () => {
  test('expected definitions', () => {
    expect(MonteCarloPlayer).toBeOfType('function');
    expect(UCTPlayer).toBeOfType('function');
  });

  test('MonteCarloPlayer with Predefined', async () => {
    for (let i = 0; i < MATCH_COUNT; i += 1) {
      await playerTests.checkPlayerWithPredefined({
        playerBuilder: () => new MonteCarloPlayer({ random: RANDOM }),
      });
    }
  });

  test('MonteCarloPlayer with Choose2Win', async () => {
    for (let i = 0; i < MATCH_COUNT; i += 1) {
      await playerTests.checkPlayer({
        game: new Choose2Win(),
        playerBuilder: () => new MonteCarloPlayer({ random: RANDOM }),
      });
    }
  });

  test('UCTPlayer with Predefined', async () => {
    for (let i = 0; i < MATCH_COUNT; i += 1) {
      await playerTests.checkPlayerWithPredefined({
        playerBuilder: () => new UCTPlayer({ random: RANDOM }),
      });
    }
  });

  test('UCTPlayer with Choose2Win', async () => {
    for (let i = 0; i < MATCH_COUNT; i += 1) {
      await playerTests.checkPlayer({
        game: new Choose2Win(),
        playerBuilder: () => new UCTPlayer({ random: RANDOM }),
      });
    }
  });
}); // describe 'players'
