/* eslint-disable no-param-reassign */
import { Randomness } from '@creatartis/randomness';
import BaseClass from './utils/BaseClass';
import Game from './games/Game';

/** A match is a controller for a game, managing player decisions, handling the
 * flow of the turns between the players by following the game's logic.
*/
class Match extends BaseClass {
  /** TODO
  */
  static matchPlayers(match, game, players) {
    const { roles } = game;
    if (Array.isArray(players)) {
      if (roles.length !== players.length) {
        throw new Error(
          `Expected ${roles.length} players, but got ${players.length}!`,
        );
      }
      return Object.fromEntries(roles.map((r, i) => {
        const p = players[i];
        return [r, p.participate(match, r)];
      }));
    }
    if (typeof players === 'object' && players) {
      return Object.fromEntries(roles.map((r) => {
        if (!players[r]) {
          throw new Error(`Missing player for role ${r}!`);
        }
        return [r, players[r].participate(match, r)];
      }));
    }
    throw new TypeError('Invalid players!');
  }

  /** `Match` objects are build with a game's starting state and the players
   * that participate. The players argument must be either an array
   * of `Player`s or an object mapping each of the game's roles to `Player`s.
   *
   * @param {object} [args]
   * @param {Game} [args.game]
   * @param {Player[]|object} [args.players]
   * //TODO
   */
  constructor(args) {
    const { game, players, random } = args || {};
    super();
    this
      ._prop('game', game, Game)
      ._prop('history', [{ game }], Array)
      ._prop('random', random, Randomness, Randomness.DEFAULT)
      ._prop('players', Match.matchPlayers(this, game, players), 'object');
  }

  /** TODO
   *
   */
  get current() {
    const { history } = this;
    return history[history.length - 1];
  }

  /** Indicates if this match's game is finished.
   *
   * @property {boolean} isFinished
   */
  get isFinished() {
    return this.current.game.isFinished;
  }

  /** This method asks the active players in the game to choose their actions.
   *
   * @param {Game} [game=null] - Game on which players will move. By default is
   *   this match's current game state.
   * @return {object}
   */
  async actions(game = null) {
    const { players } = this;
    game = game || this.current.game;
    const { actions } = game;
    if (!actions) {
      return null;
    }
    const activeRoles = Object.keys(actions);
    const result = {};
    await Promise.all(
      activeRoles.map(async (role) => {
        const player = players[role];
        if (!player) {
          throw new Error(`Player not found for role ${role}!`);
        }
        result[role] = await player.decision(game.view(role), role);
      }),
    );
    return result;
  }

  /** TODO
   *
   * @param {Game} game
   */
  haps(game = null) {
    const { random } = this;
    game = game || this.current.game;
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

  /** After players of all active roles have decided which action they're
   * performing, the match can be advanced by applying these actions. The
   * `advance` method asks the players for their decisions, applies the actions
   * to get the next state, and adds it to the match's history.
   *
   * @return {object} - The new entry on the match's history.
   */
  async next() {
    const { history, current } = this;
    const { game } = current;
    if (game.isFinished) {
      return null;
    }
    const actions = await this.actions(game);
    current.actions = actions;
    const haps = this.haps(game);
    current.haps = haps;
    const nextGame = game.next(actions);
    const nextEntry = { game: nextGame };
    history.push(nextEntry);
    return nextEntry;
  }

  /** Runs the match until the game finishes. The result is the last entry in
   * the match's history.
   *
   * @returns {object}
   */
  async* run() {
    while (!this.isFinished) {
      const { current } = this;
      await this.next();
      yield current;
    }
    yield this.current;
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
  } /* * /

  // Events ////////////////////////////////////////////////////////////////////

  /** Calls an event handler method of every spectator that has it.
   * /
  emit(eventName, ...args) {
    this.spectators.forEach((spectator) => {
      if (typeof spectator[eventName] === 'function') {
        spectator[eventName](...args);
      }
    });
  }

  // Utilities /////////////////////////////////////////////////////////////////

  consoleSpectator(log) {
    // eslint-disable-next-line no-console
    log = log || console.log;
    return {
      onBegin(game, match) {
        log(`Match begins with ${Object.entries(match.players)
          .map(([role, player]) => `${player} as ${role}`)
          .join(', ')}; for ${game}.`);
      },
      onNext(game, _actions, next) {
        log(`Match advances from ${game} to ${next}.`);
      },
      onEnd(game, result) {
        log(`Match for ${game} ends with ${JSON.stringify(result)}.`);
      },
      onQuit(game, player) {
        log(`Match for ${game} aborted because player ${player} quitted.`);
      },
    };
  } /* */

  toString() {
    return `${this.constructor.name}(${this.game})`; // TODO Add players
  }

  /** Serialization and materialization using Sermat.
  */
  static __SERMAT__ = {
    identifier: 'ludorum.Match',
    serializer: ({ game, players, random }) => [{ game, players, random }],
  };
} // class Match.

export default Match;
