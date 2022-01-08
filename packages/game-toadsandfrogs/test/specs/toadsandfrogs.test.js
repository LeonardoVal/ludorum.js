import MersenneTwister from '@creatartis/randomness/generators/MersenneTwister';
import { tests as gameTests } from '@ludorum/core/games';
import { tests as playerTests } from '@ludorum/core/players';
import {
  AlphaBetaPlayer, MaxNPlayer, MiniMaxPlayer,
} from '@ludorum/players-minimax/players';
import {
  MonteCarloPlayer,
} from '@ludorum/players-montecarlo/players';
import { ToadsAndFrogs } from '../../src/games';

const RANDOM = new MersenneTwister(parseInt('Pig', 32) % 1e8);
const MATCH_COUNT = 6;

describe('ToadsAndFrogs', () => {
  it('has the expected definitions', () => {
    expect(ToadsAndFrogs).toBeOfType('function');
  });

  it('works like a game', () => {
    const game = new ToadsAndFrogs();
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
    const game = new ToadsAndFrogs();
    const playerBuilders = [
      () => new MaxNPlayer({ random: RANDOM }),
      () => new MiniMaxPlayer({ random: RANDOM }),
      () => new AlphaBetaPlayer({ random: RANDOM }),
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
    const game = new ToadsAndFrogs();
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
}); // describe 'ToadsAndFrogs'
