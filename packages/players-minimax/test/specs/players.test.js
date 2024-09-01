import { describe, expect, test } from 'vitest';
import { Predefined, TestSpectator } from '@ludorum/core';
import { TicTacToe } from '@ludorum/game-tictactoe';
import {
  AlphaBetaPlayer, MaxNPlayer, MiniMaxPlayer,
} from '../../src/index';

async function checkPlayer({
  matchCount = 10,
  player,
}) {
  for (let i = 0; i < matchCount; i += 1) {
    const game = new Predefined({
      height: 5,
      width: 6,
      winner: i < 2 ? i : null,
    });
    await TestSpectator.testGame({
      expect, game, player, matchCount: 1,
    });
  }
}

describe('Minimax players', () => {
  test('expected definitions', () => {
    [
      AlphaBetaPlayer, MaxNPlayer, MiniMaxPlayer,
    ].forEach((def) => {
      expect(typeof def).toBe('function');
    });
  });

  test.skip('MiniMaxPlayer with Predefined', async () => {
    const player = new MiniMaxPlayer();
    await checkPlayer({ expect, player });
  });

  test.skip('AlphaBetaPlayer with Predefined', async () => {
    const player = new AlphaBetaPlayer();
    await checkPlayer({ player });
  });

  test('MaxNPlayer with Predefined', async () => {
    const player = new MaxNPlayer();
    await checkPlayer({ player });
  });

  test('MaxNPlayer with TicTacToe', async () => {
    const player = new MaxNPlayer();
    await TestSpectator.testGame({
      expect,
      game: new TicTacToe(),
      player,
      matchCount: 5,
    });
  });

}); // describe 'Minimax players'
