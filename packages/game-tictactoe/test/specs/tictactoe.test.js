import Randomness from '@creatartis/randomness/Randomness';
import { tests } from '@ludorum/core/games';
import { TicTacToe } from '../../src/games';

const RANDOM = Randomness.DEFAULT;
const MATCH_COUNT = 5;

describe('TicTacToe', () => {
  it('has the expected definitions', () => {
    expect(TicTacToe).toBeOfType('function');
  });

  it('works like a game', () => {
    const game = new TicTacToe();
    for (let i = 0; i < MATCH_COUNT; i += 1) {
      tests.checkGameFlow(expect, game, {
        deterministic: true,
        oneActivePlayerPerTurn: true,
        random: RANDOM,
        zeroSum: true,
      });
    }
  });
}); // describe 'TicTacToe'
