import { Randomness } from '@creatartis/randomness';
import BaseClass from '../utils/BaseClass';
import { addStatistic } from '../utils/stats';
import Game from '../games/Game';
import Match from '../Match';

/** A tournament is a set of matches played between many players. The whole
 * contest ranks the participants according to the result of the matches. This
 * is an abstract base class for many different types of contests.
*/
class Tournament extends BaseClass {
  /** The tournament always has one [`game`](Game.html) state from which all
   * matches start. All the `players` involved in the tournament must be
   * provided to the constructor in an array.
   *
   * @param {object} args
   * @param {Game} args.game
   * @param {Player[]} args.players
  */
  constructor(args) {
    const {
      game, players, random,
    } = args || {};
    super();
    this
      ._prop('game', game, Game)
      ._prop('players', players, Array)
      ._prop('random', random, Randomness, Randomness.DEFAULT);
  }

  /** Shotcut for creating a `Match` with a `game` and `players`.
   *
   * @param {Game} game
   * @param {Player[]} players
   * @returns {Match}
  */
  newMatch(game, players) {
    return new Match({ game, players });
  }

  /** Generates the `Match` objects for this tournament. It is not implemented
   * in this base class.
   *
   * @yields {Match}
  */
  async* matches() {
    yield this._unimplemented('*matches()');
  }

  /** Plays all the tournament's matches. The `matchRunner` argument can be used
   * to override the way each match is processed.
   *
   * @param {function} [matchRunner=null]
   * @yields {Match}
  */
  async* run(matchRunner = null) {
    for await (const match of this.matches()) {
      if (matchRunner) {
        yield matchRunner(match);
      } else {
        await match.complete();
        yield match;
      }
    }
  }

  /** Analogous to `run`, but waits for the whole tournament to finish and
   * returns all matches played in an array.
   *
   * @param {function} [matchRunner=null]
   * @returns {Match[]}
  */
  async complete(matchRunner = null) {
    const results = [];
    for await (const result of this.run(matchRunner)) {
      results.push(result);
    }
    return results;
  }

  /** Tournaments are usually done to gather information from the matches. The
   * `stats` method runs all the matches and records data about them:
   *
   * + The match results are gathered in the `results` key.
   * + The keys `victories`, `defeats` and `draws` count each result type.
   * + The length of each game is recorded under `length`.
   *
   * All these numbers are open by game, role, player.
   *
   * @param {object} [args=null]
   * @param {Array} [args.matches] - An array to put the matches (optional).
   * @returns {object[]}
  */
  async stats(args = null) {
    const { matches } = args || {};
    const { game, players } = this;
    const result = new Map();
    for await (const match of this.run()) {
      const { current: { game: { result: matchResult } } } = match;
      Object.entries(match.players).forEach(([role, player]) => {
        const baseKeys = { role, game: game.name, player: player.name };
        const playerResult = matchResult[role];
        addStatistic(result, { ...baseKeys, key: 'results' }, playerResult);
        const playerStatus = playerResult > 0 ? 'victories'
          : (playerResult < 0 ? 'defeats' : 'draws');
        addStatistic(result, { ...baseKeys, key: playerStatus }, playerResult);
        const matchLength = match.history.length;
        addStatistic(result, { ...baseKeys, key: 'length' }, matchLength);
        // TODO Record matches' widths.
      });
      if (matches) {
        matches.push(match);
      }
    }
    return [...result.values()];
  }
} // class Tournament

/** Serialization and materialization using Sermat.
*/
BaseClass.addSERMAT(Tournament, 'game players random');

export default Tournament;
