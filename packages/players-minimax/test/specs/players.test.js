import { describe, expect, test } from 'vitest';
import { games, TestSpectator } from '@ludorum/core';
import { TicTacToe } from '@ludorum/game-tictactoe';
import { players } from '../../src/index';

async function checkPlayer({
  matchCount = 10,
  player,
}) {
  const { Predefined } = games;
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
    const { AlphaBetaPlayer, MaxNPlayer, MiniMaxPlayer } = players;
    [
      AlphaBetaPlayer, MaxNPlayer, MiniMaxPlayer,
    ].forEach((def) => {
      expect(typeof def).toBe('function');
    });
  });

  test.skip('MiniMaxPlayer with Predefined', async () => {
    const player = new players.MiniMaxPlayer();
    await checkPlayer({ expect, player });
  });

  test.skip('AlphaBetaPlayer with Predefined', async () => {
    const player = new players.AlphaBetaPlayer();
    await checkPlayer({ player });
  });

  test('MaxNPlayer with Predefined', async () => {
    const player = new players.MaxNPlayer();
    await checkPlayer({ player });
  });

  test('MaxNPlayer with TicTacToe', async () => {
    const player = new players.MaxNPlayer();
    await TestSpectator.testGame({
      expect,
      game: new TicTacToe(),
      player,
      matchCount: 5,
    });
  });

}); // describe 'Minimax players'
