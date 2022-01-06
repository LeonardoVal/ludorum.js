import MersenneTwister from '@creatartis/randomness/generators/MersenneTwister';
import { tests as gameTests } from '@ludorum/core/games';
import { tests as playerTests } from '@ludorum/core/players';
import { ToadsAndFrogs } from '../../src/games';

const RANDOM = new MersenneTwister(parseInt('Pig', 32) % 1e8);
const MATCH_COUNT = 6;

describe('ToadsAndFrogs', () => {
  it('has the expected definitions', () => {
    expect(ToadsAndFrogs).toBeOfType('function');
  });

  it('works like a game', () => {
    const game = new ToadsAndFrogs();
    for (let i = 0; i < MATCH_COUNT; i += 1) {
      gameTests.checkGameFlow(expect, game, {
        deterministic: true,
        oneActivePlayerPerTurn: true,
        random: RANDOM,
        zeroSum: true,
        update: i % 2 === 0,
      });
    }
  });
}); // describe 'ToadsAndFrogs'
