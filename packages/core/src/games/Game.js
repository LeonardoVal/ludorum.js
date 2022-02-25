import BaseClass from '../utils/BaseClass';

/** The class `Game` is the base type for all games.
 *
 * @class
*/
class Game extends BaseClass {
  /** @inheritdoc */
  static get name() {
    return 'Game';
  }

  /** `Game`'s constructor takes the active player/s. A player is active if and
   * only if it can move.
   *
   * @param {object} args
   * @param {string|string[]} [args.activeRoles] - Role/s that are active are
   *  allowed to perform actions, and hence have actions available.
  */
  constructor(args) {
    const { activeRoles } = args || {};
    super();
    if (activeRoles) {
      this.activateRoles(...activeRoles);
    }
  }

  /** The game's `name` is used mainly for displaying purposes.
   *
   * @property {string}
  */
  get name() {
    return this.constructor.name;
  }

  /** The game `roles` are specified in an array of names (strings). Players can
   * assume any role in a match of this game. For example: `"Xs"` and `"Os"` in
   * TicTacToe, or `"Whites"` and `"Blacks"` in Chess.
   *
   * @property {string[]}
   * @example
   *   ['Red', 'Blue']
  */
  get roles() {
    return this._unimplemented('roles');
  }

  /** Roles that are allowed to perform actions.
   *
   * @property {string[]}
  */
  get activeRoles() {
    return null;
  }

  /** The game's `actions` is an object with every active role related to the
   * actions each can make in this turn. If the game has finished then a _falsy_
   * value must be returned (`null` is recommended).
   *
   * @property {object}
   * @example
   *   {
   *     Player1: ['Rock', 'Paper', 'Scissors'],
   *     Player2: ['Rock', 'Paper', 'Scissors'],
   *   }
  */
  get actions() {
    return this._unimplemented('actions');
  }

  /** The game's `aleatories` are the random variables that may affect the game,
   * e.g. dice or card decks. Is an object with each property having an instance
   * of `Aleatory`. Should be `null` when there are none, which is the default
   * case.
   *
   * @property {object}
  */
  get aleatories() {
    return null;
  }

  /** Once the players have chosen their actions, these must be `perform`ed to
   * advance the game to the next state. It is strongly advised to check if the
   * arguments are valid.
   *
   * @param {object} actions - Should be an object with a move for each active
   *   player. For example: `{ Player1: 'Rock', Player2: 'Paper' }`.
   * @param {object} haps - Should be an object with a value for each aleatory.
   *   For example: `{ die: 5, coin: 'Tails' }`.
   * @returns {Game} - Same as `this`.
  */
  perform(_actions, _haps) {
    return this._unimplemented('perform()');
  }

  /** The next method is similar to `perform`, but it doesn't update the current
   * game state. It rather builds a new instance with the updated game state.
   *
   * @param {object} actions - Should be an object with a move for each active
   *   player. For example: `{ Player1: 'Rock', Player2: 'Paper' }`.
   * @param {object} haps - Should be an object with a value for each aleatory.
   *   For example: `{ die: 5, coin: 'Tails' }`.
   * @returns {Game} - A new game instance.
  */
  next(actions, haps) {
    const result = this.clone();
    result.perform(actions, haps);
    return result;
  }

  /** If the game is finished the result of the game is calculated with
   * `result`. If the game is not finished, this function must return a
   * _falsy_ value (`null` is recommended).
   *
   * @property {object} An object with every player in the game related to a
   *   number. This number must be positive if the player wins, negative if the
   *   player loses or zero if the game is a tie.
   * @example
   *   { Player1: -1, Player2: +1 }
  */
  get result() {
    return this._unimplemented('result');
  }

  /** Some games may assign scores to the players in a finished game. This may
   * differ from the result, since the score sign doesn't have to indicate
   * victory or defeat. For example:
   *
   * + result: `{ Player1: -1, Player2: +1 }`
   *
   * + scores: `{ Player1: 14, Player2: 15 }`
   *
   * The method `scores()` returns the scores if such is the case. Also the
   * score may be defined for unfinished games. By default, it return the same
   * that `result` does.
   *
   * @property {object}
  */
  get scores() {
    return this.result;
  }

  /** In incomplete or imperfect information games each role may have different
   * access to the game state data. The method `view` returns a modified version
   * of this game, that shows only the information from the perspective of the
   * given player. The other information may be modelled as random variables.
   *
   * In this way searches in the game tree can be performed without revealing to
   * the automatic player information it shouldn't have access to (a.k.a.
   * _cheating_).
   *
   * @param {string} role
   * @return {Game}
  */
  view(_role) {
    return this;
  }

  // Player information ________________________________________________________

  /** Gets a role by string or number.
   *
   * @param {string|number} id - Role name or index.
   * @returns {string}
   * @throws {Error} - If role is not valid.
  */
  role(id) {
    const { roles } = this;
    if (roles.includes(id)) {
      return id;
    }
    if (!Number.isNaN(+id) && roles[id]) {
      return roles[id];
    }
    throw new Error(`Unknown role ${JSON.stringify(id)} (roles: ${
      roles.map((r) => JSON.stringify(r)).join(', ')})!`);
  }

  /** Method `isActive` checks if the given roles are all active.
   *
   * @param {...(string|number)} roles
   * @return {boolean}
  */
  isActive(...roles) {
    const { activeRoles } = this;
    return roles.every((role) => activeRoles.includes(this.role(role)));
  }

  /** In most games there is only one active player per turn. The method
   * `activeRole` returns that active player's role if there is one and only
   * one, else it raises an error.
   *
   * @return {string}
  */
  get activeRole() {
    const len = this.activeRoles.length;
    if (len < 1) {
      throw new Error('There are no active players!');
    }
    if (len > 1) {
      throw new Error('More than one player is active!');
    }
    return this.activeRoles[0];
  }

  /** Sets the `activeRoles` of this game state. Since this method changes the
   * current game state, use with care.
   *
   * @param {...(string|number)} roles
   * @return {string[]}
  */
  activateRoles(...roles) {
    if (!this.activeRoles) {
      this._prop('activeRoles', [], Array);
    }
    const { activeRoles } = this;
    activeRoles.splice(
      0, activeRoles.length, ...roles.map((role) => this.role(role)),
    );
    return activeRoles;
  }

  /** All players in a game are assumed to be opponents. The method `opponents`
   * returns an array with the opponent roles of the given players, or of the
   * active players by default. If not all players are opponents this method can
   * be overriden.
   *
   * @param {...string} roles
   * @return {string[]}
  */
  opponents(...roles) {
    const roleSet = new Set(roles.length < 1 ? this.activeRoles
      : roles.map((role) => this.role(role)));
    return this.roles.filter((role) => !roleSet.has(role));
  }

  /** Since most games have only two players, the method `opponent` conveniently
   * returns the opponent of the given player, or the active player by default.
   *
   * @param {string} [role=activeRole]
   * @return {string}
  */
  opponent(role = null) {
    const { roles } = this;
    const roleCount = roles.length;
    if (roleCount !== 2) {
      throw new Error('Can only get the opponent on a game of 2 players!');
    }
    const i = roles.indexOf(role ? this.role(role) : this.activeRole);
    return this.roles[(i + 1) % roleCount];
  }

  /* Game information __________________________________________________________
   *
   * Some AI algorithms have constraints on which games they can support. A game
   * can provide some information to assess its compatibility with an artificial
   * player automaticaly.
   */

  /** A game `isZeroSum` if the sum of all results in every match is zero. True
   * by default, since most games are.
   *
   * @property {boolean}
  */
  get isZeroSum() {
    return true;
  }

  /** A game `isDeterministic` if it has perfect information without random
   * variables. True by default.
   *
   * @property {boolean}
  */
  get isDeterministic() {
    return true;
  }

  /** A game `isSimultaneous` if in some or all turns more than one player is
   * active. False by default, since most games are not like this.
   *
   * @property {boolean}
  */
  get isSimultaneous() {
    return false;
  }

  /** Returns an typed array with values representing aspects of the game state.
   *
   * @property {number[]}
  */
  get features() {
    return this._unimplemented('features');
  }

  /** A string which can be used as an identifier for the game state in a data
   * structure like a `Map`.
   *
   * @property {string}
  */
  get identifier() {
    return `${this}`;
  }

  // Result functions __________________________________________________________

  /** A finished game must have a result, no active player and no actions.
   *
   * @property {boolean}
  */
  get isFinished() {
    return !!this.result;
  }

  /** The maximum and minimum results may be useful and even required by some
   * game search algorithm. To expose these values, `resultBounds()` returns an
   * array with first the minimum and then the maximum. Most game have one type
   * of victory (+1) and one type of defeat (-1). That's why `resultBounds()`
   * returns [-1,+1] by default. Yet some games can define different bounds by
   * overriding it.
   *
   * @property {Array}
  */
  get resultBounds() {
    return [-1, +1];
  }

  /** The `normalizedResult` is the `result` expressed so the minimum defeat
   * is equal to -1 and the maximum victory is equal to +1.
   *
   * @param {number|object} [result=this.result]
   * @returns {number|object}
  */
  normalizedResult(result = null) {
    result = result || this.result;
    if (result && typeof result === 'object') {
      const { resultBounds: [minR, maxR] } = this;
      return Object.fromEntries(Object.entries(result).map(
        ([p, r]) => [p, (+r - minR) / (maxR - minR) * 2 - 1],
      ));
    }
    if (typeof result === 'number') {
      const { resultBounds: [minR, maxR] } = this;
      return (+result - minR) / (maxR - minR) * 2 - 1;
    }
    return null;
  }

  /** Most games have victory and defeat results that cancel each other. It is
   * said that all the victors wins the defeated player loses. Those games are
   * called _zerosum games_. The method `zerosumResult` builds a game result
   * object for a zerosum game.
   *
   * The given score is split between the given players (the active players by
   * default), and (-score) is split between their opponents.
   *
   * @param {number} [score]
   * @param {...string} [roles]
   * @returns {object}
  */
  zerosumResult(score, ...roles) {
    const roleSet = new Set(roles.length > 0 ? roles : this.activeRoles);
    score = (+score) / Math.max(roleSet.size, 1);
    const opponentScore = -score / Math.max(this.roles.length - roleSet.size, 1);
    return Object.fromEntries(this.roles.map(
      (r) => [r, roleSet.has(r) ? score : opponentScore],
    ));
  }

  /** Method `victory` is a shortcut for `zerosumResult` that returns the
   * zero-sum game result with the given players (or the active roles by
   * default) as winners, and their opponents as losers.
   *
   * @param {string|string[]} [roles]
   * @param {number} [score = +1]
   * @returns {object}
  */
  victory(roles, score = +1) {
    roles = Array.isArray(roles) ? roles : [roles];
    score = Number.isNaN(score) ? +1 : score;
    return this.zerosumResult(score, ...roles);
  }

  /** Method `defeat` is a shortcut for `zerosumResult` that returns the
   * zero-sum game result with the given players (or the active players by
   * default) as losers, and their opponents as winners.
   *
   * @param {string|string[]} [roles]
   * @param {number} [score = +1]
   * @returns {object}
  */
  defeat(roles, score = -1) {
    roles = Array.isArray(roles) ? roles : [roles];
    score = Number.isNaN(score) ? -1 : score;
    return this.zerosumResult(score, ...roles);
  }

  /** Method `tied` returns the game result of a tied game with the given
   * roles (or all roles by default) all with the same score (zero by default).
   * A tied game must always have the same result for all players.
   *
   * @param {string|string[]} [roles]
   * @param {number} [score = +1]
   * @returns {object}
  */
  tied(roles = null, score = 0) {
    roles = roles || this.roles;
    score = Number.isNaN(score) ? 0 : score;
    return Object.fromEntries(roles.map((p) => [p, score]));
  }

  // Other utilities ___________________________________________________________

  /** Based on the game's serialization, `clone()` creates a copy of this game
   * state.
   *
   * @returns {Game}
  */
  clone() {
    const args = this.constructor.__SERMAT__.serializer(this);
    return new this.constructor(...args);
  }

  /** Modify the given Game class to cache properties.
   *
   * @param {Class<Game>} gameClass
   * @param {object} [config]
   * @param {string[]} [config.properties] - By default ['actions', 'result'].
   * @param {string[]} [config.invalidations] - By default ['perform'].
   * @returns {Class<Game>} - The given game class.
   */
  static cachedProperties(gameClass, config) {
    const {
      properties = ['actions', 'result'],
      invalidations = ['perform'],
    } = config || {};
    const { prototype } = gameClass;
    properties.forEach((name) => {
      const descriptor = Object.getOwnPropertyDescriptor(prototype, name);
      const { get } = descriptor;
      Object.defineProperty(prototype, name, {
        ...descriptor,
        get() {
          const value = get.call(this);
          Object.defineProperty(this, name, {
            value,
            configurable: true,
            enumerable: false,
          });
          return value;
        },
      });
    });
    invalidations.forEach((name) => {
      const method = prototype[name];
      Object.defineProperty(prototype, name, {
        value(...args) {
          const r = method.call(this, ...args);
          properties.forEach((n) => {
            delete this[n];
          });
          return r;
        },
        writable: true,
        configurable: true,
        enumerable: false,
      });
    });
    return gameClass;
  }

  /** TODO `serialized(game)` builds a serialized version of a simultaneous game,
   * i.e. one in which two or more players may be active in the same turn. It
   * converts a simultaneous game to an alternated turn based game. This may be
   * useful for using algorithms like MiniMax to build AIs for simultaneous
   * games.
   */
} // class Game.

export default Game;
