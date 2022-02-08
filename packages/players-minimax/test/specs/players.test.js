import { MersenneTwister } from '@creatartis/randomness';
import { Choose2Win, playerTests } from '@ludorum/core';
import {
  AlphaBetaPlayer, MaxNPlayer, MiniMaxPlayer,
} from '../../src/index';

const RANDOM = new MersenneTwister(parseInt('MiniMax', 32) % 1e8);
const MATCH_COUNT = 4;

describe('players', () => {
  it('expected definitions', () => {
    expect(MaxNPlayer).toBeOfType('function');
    expect(MiniMaxPlayer).toBeOfType('function');
  });

  it('MaxNPlayer with Predefined', async () => {
    for (let i = 0; i < MATCH_COUNT; i += 1) {
      await playerTests.checkPlayerWithPredefined({
        playerBuilder: () => new MaxNPlayer({ random: RANDOM }),
      });
    }
  });

  it('MaxNPlayer with Choose2Win', async () => {
    for (let i = 0; i < MATCH_COUNT; i += 1) {
      await playerTests.checkPlayer({
        game: new Choose2Win(),
        playerBuilder: () => new MaxNPlayer({ random: RANDOM }),
      });
    }
  });

  it('MiniMaxPlayer with Predefined', async () => {
    for (let i = 0; i < MATCH_COUNT; i += 1) {
      await playerTests.checkPlayerWithPredefined({
        playerBuilder: () => new MiniMaxPlayer({ random: RANDOM }),
      });
    }
  });

  it('MiniMaxPlayer with Choose2Win', async () => {
    for (let i = 0; i < MATCH_COUNT; i += 1) {
      await playerTests.checkPlayer({
        game: new Choose2Win(),
        playerBuilder: () => new MiniMaxPlayer({ random: RANDOM }),
      });
    }
  });

  it('AlphaBetaPlayer with Predefined', async () => {
    for (let i = 0; i < MATCH_COUNT; i += 1) {
      await playerTests.checkPlayerWithPredefined({
        playerBuilder: () => new AlphaBetaPlayer({ random: RANDOM }),
      });
    }
  });

  it('AlphaBetaPlayer with Choose2Win', async () => {
    for (let i = 0; i < MATCH_COUNT; i += 1) {
      await playerTests.checkPlayer({
        game: new Choose2Win(),
        playerBuilder: () => new AlphaBetaPlayer({ random: RANDOM }),
      });
    }
  });
}); // describe 'players'
