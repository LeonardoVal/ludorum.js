import randomness from '@creatartis/randomness';
import { Predefined } from '../../src/games';
import { RandomPlayer } from '../../src/players';
import Match from '../../src/Match';

const { Randomness } = randomness;
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
    expect(match1.history).toEqual([{ game }]);
    expect(match1.players).toEqual(players);
    const match2 = new Match({ game, players: Object.values(players) });
    expect(match2.players).toEqual(players);
  });

  it('with Predefined', async () => {
    const game = new Predefined();
    const players = Object.fromEntries(
      game.roles.map((role) => [role, new RandomPlayer()]),
    );
    const match = new Match({ game, players });
    expect(match.isFinished).toBe(false);
    expect(match.current).toEqual({ game });
    while (!match.isFinished) {
      const currentGame = match.current.game;
      expect(currentGame).toBeOfType(Predefined);
      const currentGameActions = currentGame.actions;
      const actions = await match.actions();
      Object.entries(currentGameActions).forEach(([role, actionList]) => {
        expect(actionList).toContain(actions[role]);
      });
      const haps = match.haps();
      expect(haps).toBe(null);
      const { game: nextGame } = await match.next();
      expect(match.current).toEqual({ game: nextGame });
      expect(match.current).toBe(match.history[match.history.length - 1]);
      const prevEntry = match.history[match.history.length - 2];
      expect(prevEntry.game).toBeOfType(Predefined);
      Object.entries(currentGameActions).forEach(([role, actionList]) => {
        expect(actionList).toContain(prevEntry.actions[role]);
      });
      expect(prevEntry.haps).toBe(null);
    }
  });
}); // describe 'Match'
