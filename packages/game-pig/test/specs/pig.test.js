import MersenneTwister from '@creatartis/randomness/generators/MersenneTwister';
import { tests as gameTests } from '@ludorum/core/games';
import { tests as playerTests } from '@ludorum/core/players';
import {
  AlphaBetaPlayer, MiniMaxPlayer,
} from '@ludorum/players-minimax/players';
import { Pig } from '../../src/games';

const RANDOM = new MersenneTwister(parseInt('Pig', 32) % 1e8);
const MATCH_COUNT = 6;

describe('Pig', () => {
  it('has the expected definitions', () => {
    expect(Pig).toBeOfType('function');
  });

  it('works like a game', () => {
    const game = new Pig();
    for (let i = 0; i < MATCH_COUNT; i += 1) {
      gameTests.checkGameFlow(expect, game, {
        deterministic: false,
        oneActivePlayerPerTurn: true,
        random: RANDOM,
        zeroSum: true,
        update: i % 2 === 0,
      });
    }
  });

  it('can be played with minimax players', async () => {
    const game = new Pig();
    const playerBuilders = [
      // MaxNPlayer does not support non deterministic games.
      () => new MiniMaxPlayer({ random: RANDOM }),
      () => new AlphaBetaPlayer({ random: RANDOM }),
    ];
    for (const playerBuilder of playerBuilders) {
      for (let i = 0; i < MATCH_COUNT; i += 1) {
        await playerTests.checkPlayer({ game, playerBuilder });
      }
    }
  });
}); // describe 'Pig'
