import MersenneTwister from '@creatartis/randomness/generators/MersenneTwister';
import { tests as gameTests } from '@ludorum/core/games';
import { HeuristicPlayer, tests as playerTests } from '@ludorum/core/players';
import {
  AlphaBetaPlayer, MaxNPlayer, MiniMaxPlayer,
} from '@ludorum/players-minimax/players';
import {
  MonteCarloPlayer,
} from '@ludorum/players-montecarlo/players';
import { Puzzle15 } from '../../src/games';

const RANDOM = new MersenneTwister(parseInt('Puzzle15', 32) % 1e8);
const MATCH_COUNT = 2;

describe('Puzzle15', () => {
  it('has the expected definitions', () => {
    expect(Puzzle15).toBeOfType('function');
  });

  it('works like a game', () => {
    const game = new Puzzle15();
    for (let i = 0; i < MATCH_COUNT; i += 1) {
      gameTests.checkGameFlow(expect, game, {
        deterministic: true,
        oneActivePlayerPerTurn: true,
        random: RANDOM,
        zeroSum: false,
        update: i % 2 === 0,
      });
    }
  });

  it('can be played with minimax players', async () => {
    const game = new Puzzle15();
    const playerBuilders = [
      () => new MaxNPlayer({ random: RANDOM }),
      () => new MiniMaxPlayer({ random: RANDOM }),
      () => new AlphaBetaPlayer({ random: RANDOM }),
    ];
    for (const playerBuilder of playerBuilders) {
      for (let i = 0; i < MATCH_COUNT; i += 1) {
        await playerTests.checkPlayer({ game, playerBuilder });
      }
    }
  });

  it('can be played with montecarlo players', async () => {
    const game = new Puzzle15();
    const playerBuilders = [
      () => new MonteCarloPlayer({ random: RANDOM }),
    ];
    for (const playerBuilder of playerBuilders) {
      for (let i = 0; i < MATCH_COUNT; i += 1) {
        await playerTests.checkPlayer({ game, playerBuilder });
      }
    }
  });
}); // describe 'Puzzle15'
