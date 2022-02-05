import Randomness from '@creatartis/randomness/Randomness';
import { Predefined } from '../../src/games';
import { RandomPlayer } from '../../src/players';
import Match from '../../src/Match';

const RANDOM = Randomness.DEFAULT;
const MATCH_COUNT = 5;

describe('Match', () => {
  it('expected definitions', () => {
    expect(Match).toBeOfType('function');
  });

  it('constructor', () => {
    const game = new Predefined();
    const players = Object.fromEntries(
      game.roles.map((role) => [role, new RandomPlayer()]),
    );
    expect(() => new Match({ game, players }))
      .not.toThrow();
    [
      { game: 'game', players },
      { game, players: 'players' },
      { game, players: null },
      { game, players, random: 'random' },
    ].forEach((matchArgs) => {
      expect(() => new Match(matchArgs)).toThrowError(TypeError);
    });
    const match1 = new Match({ game, players });
    expect(match1.game).toBe(game);
    expect(match1.history).toEqual([]);
    expect(match1.players).toEqual(players);
    const playersArray = Object.values(players);
    const match2 = new Match({ game, players: playersArray });
    expect(match2.players).toEqual(playersArray);
  });

  it('with Predefined', async () => {
    const game = new Predefined();
    const players = Object.fromEntries(
      game.roles.map((role) => [role, new RandomPlayer()]),
    );
    const match = new Match({ game, players });
    expect(match.isFinished).toBe(false);
    let previousGame = null;
    for await (const current of match.run()) {
      const { game: currentGame } = current;
      expect(currentGame).toBeOfType(Predefined);
      if (!previousGame) {
        expect(current.actions).not.toBeDefined();
        expect(current.haps).not.toBeDefined();
      } else {
        const { actions, aleatories } = previousGame;
        Object.entries(current.actions).forEach(([role, action]) => {
          expect(actions[role]).toContain(action);
        });
        expect(aleatories).toBe(null);
        expect(current.haps).toBe(null);
      }
      previousGame = currentGame;
    }
    expect(previousGame.isFinished).toBe(true);
  });
}); // describe 'Match'
