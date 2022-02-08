import { MersenneTwister } from '@creatartis/randomness';
import { gameTests, HeuristicPlayer, playerTests } from '@ludorum/core';
import {
  AlphaBetaPlayer, MaxNPlayer, MiniMaxPlayer,
} from '@ludorum/players-minimax';
import { MonteCarloPlayer } from '@ludorum/players-montecarlo';
import { TicTacToe } from '../../src/index';

const RANDOM = new MersenneTwister(parseInt('TicTacToe', 32) % 1e8);
const MATCH_COUNT = 2;

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
      const heuristic = TicTacToe.heuristicFromWeights(weights);
      const playerBuilder = () => new HeuristicPlayer({
        heuristic, random: RANDOM,
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

  it('can be played with montecarlo players', async () => {
    const game = new TicTacToe();
    const playerBuilders = [
      () => new MonteCarloPlayer({ random: RANDOM }),
    ];
    for (const playerBuilder of playerBuilders) {
      for (let i = 0; i < MATCH_COUNT; i += 1) {
        await playerTests.checkPlayer({ game, playerBuilder });
      }
    }
  });
}); // describe 'TicTacToe'
