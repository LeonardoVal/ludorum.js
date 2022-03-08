import { Randomness } from '@creatartis/randomness';
import { Predefined, RandomPlayer, Tournament } from '@ludorum/core';
import MeasurementTournament from '../../src/tournaments/MeasurementTournament';
import EliminationTournament from '../../src/tournaments/EliminationTournament';

const RANDOM = Randomness.DEFAULT;

const randomPlayers = (n) => Array(n).fill()
  .map(() => new RandomPlayer({ random: RANDOM }));

describe('tournaments', () => {
  test('expected definitions', () => {
    expect(MeasurementTournament).toBeOfType('function');
    expect(EliminationTournament).toBeOfType('function');
  });

  test('MeasurementTournament with Predefined & RandomPlayer', async () => {
    const result = { First: 1, Second: -1 };
    const roles = Object.keys(result);
    const tournament = new MeasurementTournament({
      game: new Predefined({ result }),
      matchCount: 1,
      players: randomPlayers(2),
      opponents: randomPlayers(2),
      random: RANDOM,
    });
    const {
      game, matchCount, players, opponents,
    } = tournament;
    const histories = await tournament.complete();
    expect(histories).toBeOfType(Array);
    expect(histories.length).toBe(players.length * opponents.length
      * game.roles.length * matchCount);
    histories.forEach((history) => {
      expect(history).toBeOfType(Array);
      expect(history.length).toBe(tournament.game.height + 1);
      history.forEach(({ game: gameState, actions, haps }, i) => {
        expect(gameState).toBeOfType(Predefined);
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

  const eliminations = (n) => {
    let r = 0;
    while (n > 1) {
      n = Math.ceil(n / 2);
      r += n;
    }
    return r;
  };

  test('EliminationTournament with Predefined & RandomPlayer', async () => {
    const result = { First: 1, Second: -1 };
    const roles = Object.keys(result);
    const tournament = new EliminationTournament({
      game: new Predefined({ result }),
      matchCount: 1,
      players: randomPlayers(8),
      random: RANDOM,
    });
    const { matchCount, players } = tournament;
    const histories = await tournament.complete();
    expect(histories).toBeOfType(Array);
    expect(histories.length).toBe(eliminations(players.length) * matchCount);
    histories.forEach((history) => {
      expect(history).toBeOfType(Array);
      expect(history.length).toBe(tournament.game.height + 1);
      history.forEach(({ game: gameState, actions, haps }, i) => {
        expect(gameState).toBeOfType(Predefined);
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
