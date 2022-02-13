import { Randomness } from '@creatartis/randomness';
import { Predefined } from '../../src/games';
import { RandomPlayer } from '../../src/players';
import Match from '../../src/Match';

const RANDOM = Randomness.DEFAULT;
const MATCH_COUNT = 5;

const randomPlayers = (roles) => Object.fromEntries(
  roles.map((role) => [role, new RandomPlayer()]),
);

describe('Match', () => {
  it('expected definitions', () => {
    expect(Match).toBeOfType('function');
  });

  it('constructor', () => {
    const game = new Predefined();
    const players = randomPlayers(game.roles);
    expect(() => new Match({ game, players })).not.toThrow();
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
    expect(match2.players).toEqual(players);
  });

  it('with Predefined', async () => {
    const game = new Predefined();
    const players = randomPlayers(game.roles);
    const spectator = {
      begin: jest.fn(),
      next: jest.fn(),
      end: jest.fn(),
    };
    const match = new Match({ game, players, spectators: [spectator] });
    expect(match.isFinished).toBe(false);
    Object.values(spectator).forEach((eventHandler) => {
      expect(eventHandler).not.toHaveBeenCalled();
    });
    let previousGame = null;
    const history = [];
    for await (const current of match.run()) {
      history.push(current);
      const { game: currentGame } = current;
      expect(currentGame).toBeOfType(Predefined);
      if (!previousGame) {
        expect(spectator.begin).toHaveBeenCalledWith(game, players, match);
        expect(spectator.next).not.toHaveBeenCalled();
        expect(current.actions).not.toBeDefined();
        expect(current.haps).not.toBeDefined();
      } else {
        expect(spectator.next).toHaveBeenLastCalledWith(
          previousGame, current.actions, current.haps, currentGame, match,
        );
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
    expect(spectator.end)
      .toHaveBeenCalledWith(previousGame, previousGame.result, match);
  });
}); // describe 'Match'
