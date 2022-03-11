import { MersenneTwister } from '@creatartis/randomness';
import { Choose2Win, playerTests } from '@ludorum/core';
import {
  RuleBasedPlayer,
} from '../../src/index';

const RANDOM = new MersenneTwister(parseInt('MonteCarlo', 32) % 1e8);
const MATCH_COUNT = 4;

describe('players', () => {
  test('expected definitions', () => {
    expect(RuleBasedPlayer).toBeOfType('function');
  });

  test('RuleBasedPlayer with Predefined', async () => {
    for (let i = 0; i < MATCH_COUNT; i += 1) {
      await playerTests.checkPlayerWithPredefined({
        playerBuilder: () => new RuleBasedPlayer({
          random: RANDOM,
          features: () => [0], // mock
        }),
      });
    }
  });

  test('RuleBasedPlayer with Choose2Win', async () => {
    for (let i = 0; i < MATCH_COUNT; i += 1) {
      await playerTests.checkPlayer({
        game: new Choose2Win(),
        playerBuilder: () => new RuleBasedPlayer({ random: RANDOM }),
      });
      await playerTests.checkPlayer({
        game: new Choose2Win(),
        playerBuilder: () => new RuleBasedPlayer({
          random: RANDOM,
          rules: [() => 'win'],
        }),
      });
      await playerTests.checkPlayer({
        game: new Choose2Win(),
        playerBuilder: () => new RuleBasedPlayer({
          random: RANDOM,
          rules: [
            [[NaN, NaN, NaN], 'win'],
          ],
        }),
      });
    }
  });
}); // describe 'players'
