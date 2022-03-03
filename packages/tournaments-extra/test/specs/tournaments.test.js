import { Randomness } from '@creatartis/randomness';
import { Predefined, RandomPlayer, Tournament } from '@ludorum/core';
import MeasurementTournament from '../../src/tournaments/MeasurementTournament';

const RANDOM = Randomness.DEFAULT;

const randomPlayers = (n) => Array(2).fill()
  .map(() => new RandomPlayer({ random: RANDOM }));

describe('tournaments', () => {
  it('expected definitions', () => {
    expect(MeasurementTournament).toBeOfType('function');
  });

  it('MeasurementTournament with Predefined & RandomPlayer', async () => {
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
}); // describe 'tournaments'
