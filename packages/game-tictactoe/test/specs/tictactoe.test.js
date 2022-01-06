import MersenneTwister from '@creatartis/randomness/generators/MersenneTwister';
import { tests as gameTests } from '@ludorum/core/games';
import { HeuristicPlayer, tests as playerTests } from '@ludorum/core/players';
import {
  AlphaBetaPlayer, MaxNPlayer, MiniMaxPlayer,
} from '@ludorum/players-minimax/players';
import { TicTacToe } from '../../src/games';

const RANDOM = new MersenneTwister(parseInt('TicTacToe', 32) % 1e8);
const MATCH_COUNT = 20;

describe('TicTacToe', () => {
  it('has the expected definitions', () => {
    expect(TicTacToe).toBeOfType('function');
  });

  it('works like a game', () => {
    const game = new TicTacToe();
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

  it('can be played with HeuristicPlayer', async () => {
    const game = new TicTacToe();
    const weightsVariants = [
      null,
      [1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, -1, 0, -1, 1, -1, 0, -1, 0],
    ];
    for (const weights of weightsVariants) {
      const playerBuilder = () => new HeuristicPlayer({
        random: RANDOM,
        heuristic: TicTacToe.heuristicFromWeights(weights),
      });
      for (let i = 0; i < MATCH_COUNT; i += 1) {
        await playerTests.checkPlayer({ game, playerBuilder });
      }
    }
  });

  it('can be played with minimax players', async () => {
    const game = new TicTacToe();
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

  // TODO MCTS players
}); // describe 'TicTacToe'
