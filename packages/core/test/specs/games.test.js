import {
  Bet, Choose2Win, Game, Predefined,
} from '../../src/games';
import { RandomPlayer } from '../../src/players/RandomPlayer';

async function checkGame(TestGame) {
  const game = new TestGame();
  await game.checkMatch({
    expect,
    players: game.roles.map(() => new RandomPlayer()),
  });
}

describe('games', () => {
  it('expected definitions', () => {
    [Bet, Choose2Win, Game, Predefined].forEach((def) => {
      expect(typeof def).toBe('function');
    });
  });

  it('Predefined works like a game', async () => {
    await checkGame(Predefined);
  });

  it('Choose2Win works like a game', async () => {
    await checkGame(Choose2Win);
  });

  it('Bet works like a game', async () => {
    await checkGame(Bet);
  });
}); // describe 'games'
