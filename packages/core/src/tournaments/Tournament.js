import { Randomness } from '@creatartis/randomness';
import BaseClass from '../utils/BaseClass';
import Statistics from '../utils/Statistics';
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
    await this.onBegin();
    let count = 0;
    for await (const match of this.matches()) {
      await this.onMatchCreated(match, count);
      const matchResult = await this.runMatch(match);
      yield matchResult;
      await this.onMatchCompleted(match, count, matchResult);
      count += 1;
    }
    await this.onEnd(count);
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

  // Spectators ________________________________________________________________

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
   * @param {number} matchNumber
   * @returns {any[]}
  */
  async onMatchCreated(match, matchNumber) {
    return this._emit('matchCreated', match, matchNumber);
  }

  /** The `matchCompleted` event signals when a match of the tournament is
   * completed (fully played). The spectators listen to it with a
   * `matchCompleted(match, history, tournament)` method.
   *
   * @param {Match} match
   * @param {number} matchNumber
   * @param {object[]} history
   * @returns {any[]}
  */
  async onMatchCompleted(match, matchNumber, history) {
    return this._emit('matchCompleted', match, matchNumber, history);
  }

  /** The `end` event notifies when the tournament ends. The spectators listen
   * to it with a `end(tournament)` method.
   *
   * @returns {any[]}
  */
  async onEnd(matchCount) {
    return this._emit('end', matchCount);
  }

  /** Tournaments are usually done to gather information from the matches. The
   * statistics spectator observes all the matches and records data about them.
   * The static method returns the spectator object.
   *
   * @returns {object}
  */
  static statisticalSpectator() {
    return {
      stats: new Statistics(),
      matchCompleted(match, _matchNumber, history) {
        const { stats } = this;
        const { game, players } = match;
        const { game: { result } } = history[history.length - 1];
        Object.entries(players).forEach(([role, player]) => {
          const baseKeys = { game: game.name, role, player: player.name };
          const roleResult = result[role];
          stats.account({ ...baseKeys, stat: 'result' }, roleResult);
          const roleStatus = roleResult > 0 ? 'victories'
            : (roleResult < 0 ? 'defeats' : 'draws');
          stats.account({ ...baseKeys, stat: roleStatus }, roleResult);
          stats.account({ ...baseKeys, stat: 'length' }, history.length);
        });
      },
    };
  }

  /** The instance method adds the spectator object to this tournament, and also
   * returns the object.
   *
   * @returns {object}
  */
  statisticalSpectator() {
    const spectator = this.constructor.statisticalSpectator();
    this.spectate(spectator);
    return spectator;
  }
} // class Tournament

/** Serialization and materialization using Sermat.
*/
Tournament.defineSERMAT('game players random');

export default Tournament;
