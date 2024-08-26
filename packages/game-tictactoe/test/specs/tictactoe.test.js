import { describe, expect, expectTypeOf, test } from 'vitest';
import { TestSpectator } from '@ludorum/core';
/*import {
  AlphaBetaPlayer, MaxNPlayer, MiniMaxPlayer,
} from '@ludorum/players-minimax';
import { MonteCarloPlayer } from '@ludorum/players-montecarlo';*/
import { TicTacToe } from '../../src/index';

const MATCH_COUNT = 15;

describe('TicTacToe', () => {
  test('has the expected definitions', () => {
    expectTypeOf(TicTacToe).toBeFunction();
  });

  test('TicTacToe works like a game', async () => {
    await TestSpectator.testGame({
      expect,
      game: new TicTacToe(),
      matchCount: MATCH_COUNT,
    });
  });

  /*
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
  */
}); // describe 'TicTacToe'
