import { Randomness } from '@creatartis/randomness';
import { Predefined } from '../../src/games';
import { RandomPlayer } from '../../src/players';
import Tournament from '../../src/tournaments/Tournament';
import RoundRobinTournament from '../../src/tournaments/RoundRobinTournament';

const RANDOM = Randomness.DEFAULT;

describe('tournaments', () => {
  it('expected definitions', () => {
    expect(Tournament).toBeOfType('function');
    expect(RoundRobinTournament).toBeOfType('function');
  });

  it('base class behaves as expected', async () => {
    // expect(() => new Tournament()).toThrow();
    const game = new Predefined();
    // expect(() => new Tournament({ game })).toThrow();
    const players = [];
    // expect(() => new Tournament({ players })).toThrow();
    expect(() => new Tournament({ game, players })).not.toThrow();
    const tournament = new Tournament({ game, players });
    expect(tournament.game).toBe(game);
    expect(tournament.players).toEqual(players);
    await expect(() => tournament.complete()).rejects.toThrow();
  });

  it('RandomPlayer with Predefined', async () => {
    const result = { First: 1, Second: -1 };
    const roles = Object.keys(result);
    const tournament = new RoundRobinTournament({
      game: new Predefined({ result }),
      matchCount: 1,
      players: Array(3).fill().map(() => new RandomPlayer({ random: RANDOM })),
      random: RANDOM,
    });
    const histories = await tournament.complete();
    expect(histories).toBeOfType(Array);
    expect(histories.length).toBe(6);
    histories.forEach((history) => {
      expect(history).toBeOfType(Array);
      expect(history.length).toBe(tournament.game.height + 1);
      history.forEach(({ game, actions, haps }, i) => {
        expect(game).toBeOfType(Predefined);
        expect(haps).toBeFalsy();
        if (i === 0) {
          expect(actions).not.toBeDefined();
        } else {
          expect(actions).toBeOfType('object');
          expect(actions[roles[(i - 1) % 2]]).toBeOfType('number');
        }
      });
      expect(history[history.length - 1].game.isFinished).toBe(true);
    });
  });
}); // describe 'tournaments'
