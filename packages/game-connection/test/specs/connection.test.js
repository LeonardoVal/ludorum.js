import { MersenneTwister } from '@creatartis/randomness';
import { gameTests, playerTests } from '@ludorum/core';
import {
  AlphaBetaPlayer, MaxNPlayer, MiniMaxPlayer,
} from '@ludorum/players-minimax';
import { MonteCarloPlayer } from '@ludorum/players-montecarlo';
import { ConnectionGame } from '../../src/index';

const RANDOM = new MersenneTwister(parseInt('ConnectionGame', 32) % 1e8);
const MATCH_COUNT = 6;

const makeTicTacToe = () => ConnectionGame.subclass({
  height: 3,
  width: 3,
  lineLength: 3,
});

describe('ConnectionGame', () => {
  it('has the expected definitions', () => {
    expect(ConnectionGame).toBeOfType('function');
  });

  it('defines subclasses properly', () => {
    const TicTacToe = makeTicTacToe();
    expect(TicTacToe).toBeOfType('function');
    const ticTacToe = new TicTacToe();
    expect(ticTacToe).toBeOfType(ConnectionGame);
  });

  it('works like a game', () => {
    const TicTacToe = makeTicTacToe();
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

  it('can be played with minimax players', async () => {
    const TicTacToe = makeTicTacToe();
    const game = new TicTacToe();
    const playerBuilders = [
      () => new AlphaBetaPlayer({ random: RANDOM, horizon: 2 }),
      () => new MaxNPlayer({ random: RANDOM, horizon: 2 }),
      () => new MiniMaxPlayer({ random: RANDOM, horizon: 2 }),
    ];
    for (const playerBuilder of playerBuilders) {
      const player = playerBuilder();
      expect(player.canPlay(game)).toBe(true);
      for (let i = 0; i < MATCH_COUNT; i += 1) {
        await playerTests.checkPlayer({ game, playerBuilder });
      }
    }
  });

  it('can be played with montecarlo players', async () => {
    const TicTacToe = makeTicTacToe();
    const game = new TicTacToe();
    const playerBuilders = [
      () => new MonteCarloPlayer({ random: RANDOM }),
    ];
    for (const playerBuilder of playerBuilders) {
      const player = playerBuilder();
      expect(player.canPlay(game)).toBe(true);
      for (let i = 0; i < MATCH_COUNT; i += 1) {
        await playerTests.checkPlayer({ game, playerBuilder });
      }
    }
  });
}); // describe 'ConnectionGame'
