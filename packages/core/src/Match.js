/* eslint-disable no-param-reassign */
import { Randomness } from '@creatartis/randomness';
import { ensureType } from './utils';
import Game from './Game';

/** A match is a controller for a game, managing player decisions, handling the
 * flow of the turns between the players by following the game's logic.
 */
export default class Match {
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
   * @param {object[]} [args.spectators]
   * //TODO
   */
  constructor(args) {
    const {
      game, history, players, random, spectators,
    } = args || {};
    this.game = ensureType(game, Game);
    this.players = Match.matchPlayers(this, game, players);
    this.spectators = spectators;
    this.history = history || [{ game, result: game.result }];
    this.random = random || Randomness.DEFAULT;
  }

  /** The match represents a sequence of steps in a game. This is an
   * asynchronous sequence, because players choose their actions asynchronously.
   */
  [Symbol.asyncIterator]() {
    let i = 0;
    let done = false;
    return {
      next: async () => {
        if (done) {
          return { done };
        }
        const entry = (i < this.history.length) ? this.history[i] : await this.next();
        i += 1;
        const { result } = this.next();
        done = !!result;
        return { value: entry };
      },
    };
  }

  /** Each step in the match's history is called a `ply`. This property
   * indicates the current ply number.
   *
   * @property {int} [ply]
   */
  get ply() {
    return this.history.length - 1;
  }

  /** Indicates if this match's game is finished.
   *
   * @property {boolean} isFinished
  */
  get isFinished() {
    return !!this.history[this.ply].result;
  }

  /** This method asks the active players in the game to choose their actions.
   *
   * @param {Game} [game=null] - Game on which players will move. By default is
   *   this match's current game state.
   * @return {object}
   */
  async decisions(game = null) { // TODO Let Nature decide.
    const { history, players, ply } = this;
    game = game || history[ply].game;
    const { activeRoles } = game;
    const decisions = activeRoles.map((role) => {
      const player = players[role];
      return player.decision(game.view(player), role)
        .then((decision) => [role, decision]);
    });
    // TODO Nature haps.
    const moves = await Promise.all(decisions);
    return Object.fromEntries(moves);
  }

  /** After players of all active roles have decided which action they're
   * performing, the match can be advanced by applying these actions. The
   * `advance` method asks the players for their decisions, applies the actions
   * to get the next state, and adds it to the match's history.
   *
   * @return {object} - The new entry on the match's history.
   */
  async next() {
    const { ply, history, players } = this;
    const { game, result } = history[ply];
    if (result) {
      return null;
    }
    if (ply < 1) {
      this.emit('onBegin', game, this);
    }
    const actions = await this.decisions(game, players);
    // TODO Match commands, like QUIT.
    const nextGame = game.next(actions);
    this.emit('onNext', game, actions, nextGame, this);
    const nextResult = nextGame.result();
    if (nextResult) {
      this.emit('onEnd', game, result, this);
    }
    const nextEntry = { actions, game: nextGame, result: nextResult };
    history.push(nextEntry);
    return nextEntry;
  }

  /** Runs the match until the game finishes. The result is the last entry in
   * the match's history.
   *
   * @returns {object}
   */
  async run() {
    if (this.isFinished) {
      return this.history[this.play];
    }
    let entry;
    for await (entry of this) {
      // Do nothing.
    }
    return entry;
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

  // Events ////////////////////////////////////////////////////////////////////

  /** Calls an event handler method of every spectator that has it.
   */
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
  }

  toString() {
    return `${this.constructor.name}(${this.game})`; // TODO Add players
  }

  /** Serialization and materialization using Sermat.
  */
  static __SERMAT__ = {
    identifier: 'ludorum.Match',
    serializer: (obj) => [obj.game, obj.players, obj.history],
  };
} // class Match.
