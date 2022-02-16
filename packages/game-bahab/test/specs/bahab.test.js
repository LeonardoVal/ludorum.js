import { MersenneTwister } from '@creatartis/randomness';
import { gameTests, playerTests } from '@ludorum/core';
import {
  AlphaBetaPlayer, MaxNPlayer, MiniMaxPlayer,
} from '@ludorum/players-minimax';
import { MonteCarloPlayer } from '@ludorum/players-montecarlo';
import { Bahab } from '../../src/index';

const RANDOM = new MersenneTwister(parseInt('Bahab', 32) % 1e8);
const MATCH_COUNT = 6;

describe('Bahab', () => {
  it('has the expected definitions', () => {
    expect(Bahab).toBeOfType('function');
  });

  it('works like a game', () => {
    const game = new Bahab();
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
    const game = new Bahab();
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
    const game = new Bahab();
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
}); // describe 'Bahab'
