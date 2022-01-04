import Randomness from '@creatartis/randomness/Randomness';
import { tests } from '@ludorum/core/games';
import { Pig } from '../../src/games';

const RANDOM = Randomness.DEFAULT;
const MATCH_COUNT = 5;

describe('Pig', () => {
  it('has the expected definitions', () => {
    expect(Pig).toBeOfType('function');
  });

  it('works like a game', () => {
    const game = new Pig();
    for (let i = 0; i < MATCH_COUNT; i += 1) {
      tests.checkGameFlow(expect, game, {
        deterministic: false,
        oneActivePlayerPerTurn: true,
        random: RANDOM,
        zeroSum: true,
      });
    }
  });
}); // describe 'Pig'
