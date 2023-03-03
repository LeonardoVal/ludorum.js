import {
  Bet, Choose2Win, Game, Predefined,
} from '../../src/games';
import { RandomPlayer } from '../../src/players/RandomPlayer';

const MATCH_COUNT = 10;

async function testGame(TestGame) {
  const game = new TestGame();
  for (let i = 0; i < MATCH_COUNT; i += 1) {
    await game.testMatch({
      expect,
      players: game.roles.map(() => new RandomPlayer()),
    });
  }
}

describe('games', () => {
  test('expected definitions', () => {
    [Bet, Choose2Win, Game, Predefined].forEach((def) => {
      expect(typeof def).toBe('function');
    });
  });

  test('Predefined works like a game', async () => {
    await testGame(Predefined);
  });

  test('Choose2Win works like a game', async () => {
    await testGame(Choose2Win);
  });

  test('Bet works like a game', async () => {
    await testGame(Bet);
  });
}); // describe 'games'
