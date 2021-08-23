import randomness from '@creatartis/randomness';
import Predefined from '../../src/games/Predefined';
import Match from '../../src/Match';
import {
  Player, RandomPlayer,
} from '../../src/players';

const { Randomness } = randomness;
const RANDOM = Randomness.DEFAULT;
const MATCH_COUNT = 5;

describe('players', () => {
  it('expected definitions', () => {
    expect(typeof Player).toBe('function');
    expect(typeof RandomPlayer).toBe('function');
  });

  it('RandomPlayer with Predefined', async () => {
    const MATCH_LENGTH = 5;
    for (let i = 0; i < MATCH_COUNT; i += 1) {
      const result1 = (i % 3) - 1;
      const result2 = -result1;
      const game = new Predefined({
        activeRole: i % 2,
        result: { First: result1, Second: result2 },
        height: MATCH_LENGTH,
        width: 6,
      });
      const match = new Match({
        game,
        players: [new RandomPlayer(), new RandomPlayer()],
      });
      await match.run();
      const result = match.result();
      expect(result).toBeTruthy();
      expect(result.First).toEqual(result1);
      expect(result.Second).toEqual(result2);
      expect(match.ply()).toEqual(MATCH_LENGTH);
    }
  });
}); // describe 'players'

/*
describe("games.Predefined", function () { /////////////////////////////////////////////////////
  var MATCH_LENGTH = 5,
    MATCH_WIDTH = 6;
  autonomousPlayers.forEach(function (playerName) {
    it('can be played by '+ playerName, function (done) {
      var Player = ludorum.players[playerName];
      return base.Future.all(base.Iterable.range(MATCH_COUNT).map(function (i) {
        var resultA = (i % 3) - 1,
          resultB = -resultA,
          game = new ludorum.games.Predefined(i % 2 ? 'A' : 'B', {
            A: resultA, B: resultB
          }, MATCH_LENGTH, MATCH_WIDTH),
          match = new ludorum.Match(game, [new Player(), new Player()]);
        return match.run().then(function (match) {
          var result = match.result();
          expect(result).toBeTruthy();
          expect(result.A).toEqual(resultA);
          expect(result.B).toEqual(resultB);
          expect(match.ply()).toEqual(MATCH_LENGTH);
          done();
        });
      }));
    });
  });
}); //// games.Predefined can be played by autonomousPlayers.

function zeroSumCheck(done) {
  return function (match) {
    var result = match.result(),
      game = match.history[0].state;
    expect(result).toBeTruthy();
    expect(result[game.players[0]] + result[game.players[1]]).toBe(0);
    done();
  };
}

describe("games.Choose2Win", function () { /////////////////////////////////////////////////////
  var game = new ludorum.games.Choose2Win(),
    passer = new ludorum.players.TracePlayer({trace: ['pass']});
  autonomousPlayers.forEach(function (playerName) {
    var Player = ludorum.players[playerName];
    it('can be played by '+ playerName, function (done) {
      return base.Future.all(base.Iterable.range(MATCH_COUNT).map(function (i) {
        var match = new ludorum.Match(game, [new Player(), new Player()]);
        return match.run().then(zeroSumCheck(done));
      }));
    });
    if (Player !== ludorum.players.RandomPlayer) {
      // RandomPlayer does not try to win. The others must.
      it('can be won by '+ playerName, function (done) {
        return base.Future.all(base.Iterable.range(MATCH_COUNT).map(function (i) {
          var match = new ludorum.Match(game,
            i % 2 ? [passer, new Player()] : [new Player(), passer]),
            role = game.players[i % 2];
          return match.run().then(function (match) {
            var result = match.result();
            expect(result).toBeTruthy();
            expect(match.state(-1).activePlayer()).toBe(role);
            expect(result[role]).toBeGreaterThan(0);
            done();
          });
        }));
      });
    }
  });
}); //// games.Choose2Win can be played/won by autonomous players.
*/
