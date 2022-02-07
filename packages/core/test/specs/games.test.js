import { Randomness } from '@creatartis/randomness';
import {
  Bet, Choose2Win, Game, Predefined, tests,
} from '../../src/games';

const RANDOM = Randomness.DEFAULT;
const MATCH_COUNT = 6;

describe('games', () => {
  it('expected definitions', () => {
    expect(Game).toBeOfType('function');
    expect(Predefined).toBeOfType('function');
    expect(tests).toBeOfType('object');
    expect(tests.checkGameFlow).toBeOfType('function');
  });

  it('Predefined works like a game', () => {
    const game = new Predefined();
    for (let i = 0; i < MATCH_COUNT; i += 1) {
      tests.checkGameFlow(expect, game, {
        deterministic: true,
        oneActivePlayerPerTurn: true,
        random: RANDOM,
        zeroSum: true,
        update: i % 2 === 0,
      });
    }
  });

  it('Choose2Win works like a game', () => {
    const game = new Choose2Win();
    for (let i = 0; i < MATCH_COUNT; i += 1) {
      tests.checkGameFlow(expect, game, {
        deterministic: true,
        oneActivePlayerPerTurn: true,
        random: RANDOM,
        zeroSum: true,
        update: i % 2 === 0,
      });
    }
  });

  it('Bet works like a game', () => {
    const game = new Bet();
    for (let i = 0; i < MATCH_COUNT; i += 1) {
      tests.checkGameFlow(expect, game, {
        deterministic: false,
        oneActivePlayerPerTurn: true,
        random: RANDOM,
        zeroSum: false,
        update: i % 2 === 0,
      });
    }
  });
}); // describe 'games'
