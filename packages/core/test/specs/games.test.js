import randomness from '@creatartis/randomness';
import {
  Choose2Win, Game, Predefined, tests,
} from '../../src/games';

const { Randomness } = randomness;
const RANDOM = Randomness.DEFAULT;
const MATCH_COUNT = 5;

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
      });
    }
  });
}); // describe 'games'
