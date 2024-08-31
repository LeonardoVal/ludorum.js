import { describe, expect, expectTypeOf, test } from 'vitest';
import { HeuristicPlayer, TestSpectator } from '@ludorum/core';
import { TicTacToe } from '../../src/index';

const MATCH_COUNT = 15;

const EXAMPLES = [
  { board: '_________', activeRole: 'Xs' },
  { board: 'X________', activeRole: 'Os' },
  { board: 'XO_______', activeRole: 'Xs' },
  { board: 'XOX______', activeRole: 'Os' },
  { board: 'XOXO_____', activeRole: 'Xs' },
  { board: 'XOXO___X_', activeRole: 'Os' },
  { board: 'XOXO___XO', activeRole: 'Xs' },
  { board: 'XOXO_X_XO', activeRole: 'Os' },
  { board: 'XOXO_XOXO', activeRole: 'Xs' },
  { board: 'XOXOOXOXO' },
  { board: 'XXXOO____', winner: 'Xs' },
  { board: '_OOXXX___', winner: 'Xs' },
  { board: '___O_OXXX', winner: 'Xs' },
  { board: 'XOXXOX_O_', winner: 'Os' },
]; // const EXAMPLES

describe('TicTacToe', () => {
  test('has the expected definitions', () => {
    expectTypeOf(TicTacToe).toBeFunction();
  });

  test('TicTacToe handles board properly', async () => {
    for (const example of EXAMPLES) {
      const boards = [example.board, ...TicTacToe.equivalent(example.board)];
      for (const board of boards) {
        const game = new TicTacToe({ board });
        if (example.activeRole) {
          expect(game.isFinished).toBe(false);
          expect(game.actions?.[example.activeRole]?.length).toBeGreaterThan(0);
          expect(game.result).toBeNull();
        } else {
          expect(game.isFinished).toBe(true);
          expect(game.actions).toBeNull();
          if (example.winner) {
            expect(game.result?.[example.winner]).toBeGreaterThan(0);
          }
        }
      }
    }
  }); // test 'TicTacToe handles board properly'

  test('TicTacToe works like a game', async () => {
    await TestSpectator.testGame({
      expect,
      game: new TicTacToe(),
      matchCount: MATCH_COUNT,
    });
  });

  
  test('TicTacToe can be played with HeuristicPlayer', async () => {
    await TestSpectator.testGame({
      expect,
      game: new TicTacToe(),
      matchCount: MATCH_COUNT,
      player: new HeuristicPlayer({
        heuristic: HeuristicPlayer.heuristicFromWeights(
          [1, -1, 1, -1, 3, -1, 1, -1, 1],    
        ),
      }),
    });
  });

}); // describe 'TicTacToe'
