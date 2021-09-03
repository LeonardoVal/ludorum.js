import randomness from '@creatartis/randomness';
import { players } from '@ludorum/core';
import {
  MaxNPlayer, MiniMaxPlayer,
} from '../../src/players';

const { tests } = players;
const { Randomness } = randomness;
const RANDOM = Randomness.DEFAULT;

describe('players', () => {
  it('expected definitions', () => {
    expect(MaxNPlayer).toBeOfType('function');
    expect(MiniMaxPlayer).toBeOfType('function');
  });

  it('MaxNPlayer with Predefined', async () => {
    await tests.checkPlayerWithPredefined({
      playerBuilder: () => new MaxNPlayer({
        random: RANDOM,
      }),
    });
  });
}); // describe 'players'
