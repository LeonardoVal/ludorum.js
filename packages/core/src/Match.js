/* eslint-disable no-param-reassign */
import { Randomness } from '@creatartis/randomness';
import BaseClass from './utils/BaseClass';
import Game from './games/Game';

const checkPlayersForGame = (game, players) => {
  const { roles } = game;
  return Array.isArray(players) && players.length === roles.length
    || typeof players === 'object' && roles.every((r) => players[r]);
};

/** A match is a controller for a game, managing player decisions, handling the
 * flow of the turns between the players by following the game's logic.
*/
class Match extends BaseClass {
  /** `Match` objects are build with a game's starting state and the players
   * that participate. The players argument must be either an array
   * of `Player`s or an object mapping each of the game's roles to `Player`s.
   *
   * @param {object} [args]
   * @param {Game} [args.game]
   * @param {Player[]|object} [args.players]
  */
  constructor(args) {
    const {
      game, history, players, random, spectators,
    } = args || {};
    super();
    this
      ._prop('game', game, Game)
      ._prop('history', history, Array, [])
      ._prop('random', random, Randomness, Randomness.DEFAULT)
      ._prop('players', players, checkPlayersForGame(game, players))
      ._prop('spectators', spectators, Array, []);
  }

  /** Indicates if according to the history the match has started.
   *
   * @property {boolean}
  */
  get isStarted() {
    return this.history.length > 0;
  }

  /** Indicates if according to the history the match has finished.
   *
   * @property {boolean}
  */
  get isFinished() {
    const { history } = this;
    const current = history[history.length - 1];
    return !!current && current.game.isFinished;
  }

  /** Participates all given `players` to the match.
   *
   * @returns {object} - Participating players.
  */
  participate() {
    const { game, players } = this;
    const { roles } = game;
    if (Array.isArray(players)) {
      if (roles.length !== players.length) {
        throw new Error(
          `Expected ${roles.length} players, but got ${players.length}!`,
        );
      }
      return Object.fromEntries(roles.map((r, i) => {
        const p = players[i];
        return [r, p.participate(this, r)];
      }));
    }
    if (typeof players === 'object' && players) {
      return Object.fromEntries(roles.map((r) => {
        if (!players[r]) {
          throw new Error(`Missing player for role ${r}!`);
        }
        return [r, players[r].participate(this, r)];
      }));
    }
    throw new TypeError('Invalid players!');
  }

  /** Asks the active players in the game to choose their actions.
   *
   * @param {Game} game - Game on which players will move.
   * @param {object} players - Players participating in the match.
   * @return {object}
  */
  async actions(game, players) {
    const { actions } = game;
    if (!actions) {
      return null;
    }
    const activeRoles = Object.keys(actions);
    const decisions = Object.fromEntries(
      await Promise.all(
        activeRoles.map(async (role) => {
          const player = players[role];
          if (!player) {
            throw new Error(`Player not found for role ${role}!`);
          }
          return [role, await player.decision(game.view(role), role)];
        }),
      ),
    );
    return decisions;
  }

  /** Assigns random values to the `game`'s haps.
   *
   * @param {Game} game
   * @returns {object}
   */
  haps(game) {
    const { random } = this;
    const { aleatories } = game;
    if (!aleatories) {
      return null;
    }
    const result = { ...aleatories };
    Object.keys(result).forEach((key) => {
      result[key] = result[key].randomValue(random);
    });
    return result;
  }

  /** Runs the match until the game finishes. The result is the last entry in
   * the match's history.
   *
   * @returns {object}
  */
  async* run() {
    const {
      game, history, isFinished, isStarted,
    } = this;
    if (!isFinished) {
      let currentGame = isStarted ? history[history.length - 1] : game;
      const players = this.participate();
      if (!isStarted) {
        this.onBegin(currentGame);
      }
      yield { game: currentGame };
      while (!currentGame.isFinished) {
        const actions = await this.actions(currentGame, players);
        const haps = this.haps(currentGame);
        const nextGame = currentGame.next(actions, haps);
        this.onNext(currentGame, actions, haps, nextGame);
        yield { actions, haps, game: nextGame };
        currentGame = nextGame;
      }
      this.onEnd(currentGame, currentGame.result);
    }
  }

  /** Analogous to `run`, but waits for the whole match to finish and returns
   * the whole history in an array.
   *
   * @returns {object[]}
  */
  async complete() {
    const result = [];
    for await (const entry of this.run()) {
      result.push(entry);
    }
    return result;
  }

  // Spectator events //////////////////////////////////////////////////////////

  /** Adds a spectator object to the match. This are objects that listen to
   * events that happen as the match is played.
   *
   * @param {object} spectator
   * @returns {Match}
  */
  spectate(spectator) {
    this.spectators.push(spectator);
    return this;
  }

  /** And event emitted calls a method called `eventName` in all spectators that
   * support it, with the given `params` and the match itself. Async event
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

  /** The `begin` event fired when the match begins. The spectators listen to
   * it with a `begin(game, match)` method.
   *
   * @param {Game} game
   * @returns {any[]}
  */
  async onBegin(game) {
    return this._emit('begin', game);
  }

  /** The `next` event signals when the match advances to the next game state.
   * This may be due to actions or aleatory instantiation. The spectators listen
   * to it with a `next(gameBefore, actions, haps, gameAfter, match)` method.
   *
   * @param {Game} gameBefore
   * @param {object} actions
   * @param {object} haps
   * @param {Game} gameAfter
   * @returns {any[]}
  */
  async onNext(gameBefore, actions, haps, gameAfter) {
    return this._emit('next', gameBefore, actions, haps, gameAfter);
  }

  /** The `end` event notifies when the match ends. The spectators listen to it
   * with a `end(game, result, match)` method.
   *
   * @param {Game} game
   * @param {object} result
   * @returns {any[]}
  */
  async onEnd(game, result) {
    return this._emit('end', game, result);
  }

  // Commands //////////////////////////////////////////////////////////////////

  /* Commands are pseudo-moves, which can be returned by the players instead of
   * valid moves for the game being played. Their intent is to control the match
   * itself.
   * The available commands are:
   * /
  static commands = {
    /** + `Quit`: A quit command means the player that issued it is leaving the match. The match
    is then aborted.
    * /
    Quit: declare({
      __command__: function __command__(match, player) {
        match.onQuit(match.state(), player);
        return false;
      }
    })
  } /* */
} // class Match.

/** Serialization and materialization using Sermat.
*/
Match.defineSERMAT('game history players random');

export default Match;
