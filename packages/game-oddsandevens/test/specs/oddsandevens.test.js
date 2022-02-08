import { MersenneTwister } from '@creatartis/randomness';
import { gameTests, playerTests } from '@ludorum/core';
import {
  AlphaBetaPlayer, MaxNPlayer, MiniMaxPlayer,
} from '@ludorum/players-minimax';
import { MonteCarloPlayer } from '@ludorum/players-montecarlo';
import { OddsAndEvens } from '../../src/index';

const RANDOM = new MersenneTwister(parseInt('Pig', 32) % 1e8);
const MATCH_COUNT = 6;

describe('OddsAndEvens', () => {
  it('has the expected definitions', () => {
    expect(OddsAndEvens).toBeOfType('function');
  });

  it('works like a game', () => {
    const game = new OddsAndEvens();
    for (let i = 0; i < MATCH_COUNT; i += 1) {
      gameTests.checkGameFlow(expect, game, {
        deterministic: true,
        oneActivePlayerPerTurn: false,
        random: RANDOM,
        zeroSum: true,
        update: i % 2 === 0,
      });
    }
  });

  it('cannot be played with minimax players', () => {
    const game = new OddsAndEvens();
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
    const game = new OddsAndEvens();
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
}); // describe 'OddsAndEvens'
