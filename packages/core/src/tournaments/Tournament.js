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
  /** @inheritdoc */
  static get name() {
    return 'Tournament';
  }

  /** The tournament always has one `game` state from which all matches start.
   * All the `players` involved in the tournament must be provided to the
   * constructor in an array.
   *
   * @param {object} args
   * @param {Game} args.game
   * @param {Player[]} args.players
   * @param {object[]} args.spectators
  */
  constructor(args) {
    const {
      game, players, random, spectators,
    } = args || {};
    super();
    this
      ._prop('game', game, Game)
      ._prop('players', players, Array)
      ._prop('random', random, Randomness, Randomness.DEFAULT)
      ._prop('spectators', spectators, Array, []);
  }

  /** Creating a new `Match` with a `game` and `players`.
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

  /** Runs the given `match` completely.
   *
   * @param {Match} match
   * @return {object[]} - The complete match history.
  */
  async runMatch(match) {
    return match.complete();
  }

  /** Plays all the tournament's matches.
   *
   * @yields {object[]} - Each match's history.
  */
  async* run() {
    const { game, players } = this;
    this.onBegin();
    for await (const match of this.matches()) {
      this.onMatchCreated(match);
      const matchResult = this.runMatch(match);
      yield matchResult;
      this.onMatchCompleted(match, matchResult);
    }
    this.onEnd();
  }

  /** Analogous to `run`, but waits for the whole tournament to finish and
   * returns all matches played in an array.
   *
   * @returns {object[][]}
  */
  async complete() {
    const results = [];
    for await (const result of this.run()) {
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

  // Spectator events //////////////////////////////////////////////////////////

  /** Adds a spectator object to the tournament. This are objects that listen to
   * events that happen as the tournament runs.
   *
   * @param {object} spectator
   * @returns {Tournament}
  */
  spectate(spectator) {
    this.spectators.push(spectator);
    return this;
  }

  /** An event emitted calls a method called `eventName` in all spectators that
   * support it, with the given `params` and the tournament itself. Async event
   * handlers are supported. The results of the calls are returned as a result,
   * with `null`s for failed spectators.
   *
   * @param {string} eventName
   * @param {...any} params
   * @returns {any[]}
  */
  async _emit(eventName, ...params) {
    return Promise.all(
      this.spectators.map((spectator) => {
        if (typeof spectator?.[eventName] === 'function') {
          return spectator[eventName](...params, this);
        }
        return null;
      }),
    );
  }

  /** The `begin` event fired when the tournament begins. The spectators listen
   * to it with a `begin(tournament)` method.
   *
   * @returns {any[]}
  */
  async onBegin() {
    return this._emit('begin');
  }

  /** The `matchCreated` event signals when a match of the tournament is created
   * and about to be played. The spectators listen to it with a
   * `matchCreated(match, tournament)` method.
   *
   * @param {Match} match
   * @returns {any[]}
  */
  async onMatchCreated(match) {
    return this._emit('matchCreated', match);
  }

  /** The `matchCompleted` event signals when a match of the tournament is
   * completed (fully played). The spectators listen to it with a
   * `matchCompleted(match, history, tournament)` method.
   *
   * @param {Match} match
   * @param {object[]} history
   * @returns {any[]}
  */
  async onMatchCompleted(match, history) {
    return this._emit('matchCompleted', match, history);
  }

  /** The `end` event notifies when the tournament ends. The spectators listen
   * to it with a `end(tournament)` method.
   *
   * @returns {any[]}
  */
  async onEnd() {
    return this._emit('end');
  }
} // class Tournament

/** Serialization and materialization using Sermat.
*/
Tournament.defineSERMAT('game players random');

export default Tournament;
