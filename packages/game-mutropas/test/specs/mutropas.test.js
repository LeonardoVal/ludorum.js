import { MersenneTwister } from '@creatartis/randomness';
import { gameTests, playerTests } from '@ludorum/core';
import {
  AlphaBetaPlayer, MaxNPlayer, MiniMaxPlayer,
} from '@ludorum/players-minimax';
import { MonteCarloPlayer } from '@ludorum/players-montecarlo';
import { Mutropas } from '../../src/index';

const RANDOM = new MersenneTwister(parseInt('Mutropas', 32) % 1e8);
const MATCH_COUNT = 6;

describe('Mutropas', () => {
  it('has the expected definitions', () => {
    expect(Mutropas).toBeOfType('function');
  });

  it('works like a game', () => {
    const game = new Mutropas();
    for (let i = 0; i < MATCH_COUNT; i += 1) {
      gameTests.checkGameFlow(expect, game, {
        deterministic: false,
        oneActivePlayerPerTurn: false,
        random: RANDOM,
        zeroSum: true,
        update: i % 2 === 0,
      });
    }
  });

  it('cannot be played with minimax players', () => {
    const game = new Mutropas();
    const playerBuilders = [
      () => new MaxNPlayer({ random: RANDOM }),
      () => new MiniMaxPlayer({ random: RANDOM }),
      () => new AlphaBetaPlayer({ random: RANDOM }),
    ];
    for (const playerBuilder of playerBuilders) {
      const player = playerBuilder();
      expect(player.canPlay(game)).toBe(false);
    }
  });

  it('can be played with montecarlo players', async () => {
    const game = new Mutropas();
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
}); // describe 'Pig'
