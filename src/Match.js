import { EventEmitter } from './utils';

const matchPlayers = (match, game, players) => {
  const { roles } = game;
  if (Array.isArray(players)) {
    if (roles.length !== players.length) {
      throw new Error(`Expected ${roles.length} players, but got ${players.length}!`);
    }
    return Object.fromEntries(roles.map((r, i) => {
      const p = players[i];
      return [r, p.participate(match, r)];
    }));
  }
  if (typeof players === 'object' && players) {
    const result = {};
    roles.forEach((r) => {
      if (!players[r]) {
        throw new Error(`Missing player for role ${r}!`);
      }
      result[r] = players[r].participate(match, r);
    });
    return players;
  }
  throw new TypeError('Invalid players!');
};

/** A match is a controller for a game, managing player decisions, handling the
 * flow of the turns between the players by following the game's logic.
 */
export class Match {
  /** `Match` objects are build with a game's starting state and the players
   * that participate. The players argument must be either an array
   * of `Player`s or an object mapping each of the game's roles to `Player`s.
   *
   * @param {Game} [game]
   * @param {Player[]|object} [players]
   */
  constructor(game, players) {
    this.game = game;
    this.players = matchPlayers(game, players);
    /** The match records the sequence of game states in `history`.
     *
     * @property {object[]} [history]
     */
    this.history = [{ state: game, ply: 0 }];
  }

  /** 
   * 
   */
  [Symbol.asyncIterator]() {
    let i = -1;
    return {
      next: async () => {
        i += 1;
        if (i < this.history.length) {
          return this.history[i];
        }
        return this.advance();
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

  /** Each ply has a game state. This function retrieves the game state for the
   * given ply, or the last one by default.
   *
   * @param {integer} [ply]
   * @returns {Game}
   */
  state(ply = -1) {
    ply = Math.floor(+ply < 0 ? this.ply() + (+ply) : +ply);
    return this.history[ply].state;
  }

  /** If the last game state is finished, then the whole match is finished. If
   * so, this property access the match's result, which is the result of the
   * last game state.
   *
   * @property {number} [result]
   */
  get result() {
    return this.state().result();
  }

  /** If the last game state is not finished, then the match continues. To move
   * the play on, this method asks the active players in the game to choose
   * their moves.
   *
   * @param {Game} [game=null] - Game on which players will move. By default is
   *   this match's current game state.
   * @return {object}
   */
  async decisions(game = null) {
    game = game || this.state();
    const { players } = this;
    const { activeRoles } = game;
    const decisions = activeRoles.map((role) => {
      const player = players[role];
      return player.decision(game.view(player), role)
        .then((decision) => [role, decision]);
    });
    const moves = await Promise.all(decisions);
    return Object.fromEntries(moves);
  }

  /** 
   * 
   */
  async advance() {
    const ply = this.history.length - 1;
    const entry = this.history[ply];
    const { state } = entry;
    const actions = await this.decisions(state, this.players);
    const nextState = state.next(actions);
    const nextEntry = {
      actions,
      state: nextState,
      ply: ply + 1,
    };
    this.history.push(nextEntry);
    //TODO Match commands, like QUIT.
    return nextEntry;
  }

  /** `Match.run(plys=Infinity)` runs the match the given number of plys, or
   * until the game finishes. The result is a future that gets resolved when the
   * game ends.
   */
  run(plys) {
    plys = isNaN(plys) ? Infinity : +plys;
    if (plys < 1) { // If the run must stop...
      return Future.when(this);
    }
    var ply = this.ply(),
      game = this.state(),
      results, next;
    if (ply < 1) {
      this.onBegin(game);
    }
    game = this.__advanceContingents__(game); // Remove all non-determinism.
    results = game.result();
    if (results) { // If the match has finished ...
      this.onEnd(game, results);
      return Future.when(this);
    } else { // Else the run must continue ...
      var match = this;
      return this.decisions(game).then(function (moves) {
        if (match.__advance__(game, moves)) {
          return match.run(plys - 1);
        } else {
          return match;
        }
      });
    }
  }

  __advanceContingents__(game) {
    var haps, next;
    while (game.isContingent) {
      haps = game.randomHaps();
      this.history[this.history.length - 1].haps = haps;
      next = game.next(haps);
      this.history.push({ state: next });
      this.onNext(game, null, haps, next);
      game = next;
    }
    return game;
  }

  // ## Commands ###############################################################
  
  /* Commands are pseudo-moves, which can be returned by the players instead of
   * valid moves for the game being played. Their intent is to control the match
   * itself.
   * The available commands are:
   */
  static commands = {
    /** + `Quit`: A quit command means the player that issued it is leaving the match. The match
    is then aborted.
    */
    Quit: declare({
      __command__: function __command__(match, player) {
        match.onQuit(match.state(), player);
        return false;
      }
    })
  }

  // ## Events #################################################################

  /** Matches provide game events that players and spectators can be registered
   * to. `Match.events` is the event handler. Emitted events are:
   */

  /** + The `begin` event fired by `Match.onBegin(game)` when the match begins.
   *    The callbacks should have the signature `function (game, match)`.
   */
  onBegin(game) {
    this.events.emit('begin', game, this);
    if (this.logger) {
      this.logger.info('Match begins with ', iterable(this.players).map(function (attr) {
        return attr[1] +' as '+ attr[0];
      }).join(', '), '; for ', game, '.');
    }
  }

  /** + The `next` event fired by `Match.onNext(game, next)` signals when the
   * match advances to the next game state. This may be due to moves or aleatory
   * instantiation.  The callbacks should have the signature
   * `function (gameBefore, gameAfter, match)`.
   */
  onNext(game, moves, haps, next) {
    this.events.emit('next', game, moves, haps, next, this);
    if (this.logger) {
      this.logger.info('Match advances from ', game, ' to ', next);
    }
  }

  /** + The `end` event triggered by `Match.onEnd(game, results)` notifies when
   * the match ends. The callbacks should have the signature
   * `function (game, result, match)`.
   */
  onEnd(game, results) {
    this.events.emit('end', game, results, this);
    if (this.logger) {
      this.logger.info('Match for ', game, 'ends with ', JSON.stringify(results));
    }
  }

  /** + The `quit` event triggered by `Match.onQuit(game, player)` is emitted
   * when the match is aborted due to the given player leaving it. The callbacks
   * should have the signature `function (game, quitter, match)`.
   */
  onQuit(game, player) {
    this.events.emit('quit', game, player, this);
    if (this.logger) {
      this.logger.info('Match for ', game, ' aborted because player '+ player +' quitted.');
    }
  }

  // ## Utilities ##############################################################

  /** A `randomMatch` is a match for the given `game` played by random players
   * (`RandomPlayer`).
   */
  static randomMatch(game, args) {
    args = args || {};
    var m = players.RandomPlayer.playTo(game);
    if (args.log) {
      if (typeof args.log ===  'object') {
        m.logger = args.log;
      } else {
        m.logger = new base.Logger(typeof args.log === 'string' ? args.log : 'Match');
        m.logger.appendToConsole();
      }
    }
    return m;
  }

  toString() {
    return Sermat.ser(this);
  }

  /** Serialization and materialization using Sermat.
  */
  static __SERMAT__ = {
    identifier: 'Match',
    serializer: (obj) => [obj.game, obj.players, obj.history],
    materializer: (obj, args) => {
      if (args) {
        var match = new Match(args[0], args[1]);
        match.history = args[2];
        return match;
      } else {
        return null;
      }
    },
  }
} // class Match.

export default {
  Match,
};
