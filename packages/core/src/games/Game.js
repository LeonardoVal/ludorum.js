import { defProps } from '../utils';

/** The class `Game` is the base type for all games.
 *
 * @class
*/
export class Game {
  /** Every game class constructor takes an object argument. All data relevant
   * to the game state must be included there. The object should be able to be
   * constructed in spite of some or all arguments missing.
   *
   * @param {state} [args=null]
  */
  constructor(state = null) {
    this.init(state);
  }

  /** The init method takes the state data and initializes this game object. It
   * can usually be implemented as `Object.assign(this, state)`, once proper
   * default values are set.
   *
   * @param {Record<string, unknown>}
   * @returns {Game} This object.
  */
  init(state) {
    defProps(this, state, { configurable: true });
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
    return this.constructor.roles;
  }

  /** The game's `actions` is an object with every role related to the actions
   * each can make in this turn. Roles with no actions can have either `null` or
   * an empty array.
   *
   * @property {Record<string, unknown[]> | null}
   * @example
   *   {
   *     Player1: ['Rock', 'Paper', 'Scissors'],
   *     Player2: ['Rock', 'Paper', 'Scissors'],
   *   }
  */
  get actions() {
    throw new Error(`${this.constructor.name}.actions is not defined!`);
  }

  /** The game's `haps` are the random variables that may affect the game, e.g.
   * dice or card decks. Is an object with each property having an random
   * variable distribution, i.e. an array of tuples _[value, probability]_.
   *
   * @property {Record<string, [unknown, number][]> | null}
   * @example
   *   { D6: [1,2,3,4,5,6].map((v) => [v, 1/6]) }
  */
  get haps() {
    return null;
  }

  /** If the game is finished the result of the game is calculated with
   * `result`. If the game is not finished, this function must return `null`.
   *
   * @property {Record<string, number> | null} - An object with every player in
   *   the game related to a number. This number must be positive if the player
   *   wins, negative if the player loses or zero if the game is a tie.
   * @example
   *   { Player1: -1, Player2: +1 }
  */
  get result() {
    throw new Error(`${this.constructor.name}.result is not defined!`);
  }

  /** Calculates the state for the next game, when applying a set of actions and
   * haps. It is strongly advised to check if the arguments are valid.
   *
   * @param {Record<string, unknown>} actions - Should be an object with a move
   *   for each active player. For example:
   *   `{ Player1: 'Rock', Player2: 'Paper' }`.
   * @param {Record<string, [unknown, number][]>} haps - Should be an object
   *   with a value for each aleatory. For example: `{ die: 5, coin: 'Tails' }`.
   * @returns {Record<string, unknown>} Game state data.
  */
  nextState(_actions, _haps) {
    throw new Error(`${this.constructor.name}.nextState() is not defined!`);
  }

  /** Updates this game object state with the next state.
   *
   * @param {Record<string, unknown>} actions - Should be an object with a move
   *   for each active player. For example:
   *   `{ Player1: 'Rock', Player2: 'Paper' }`.
   * @param {Record<string, [unknown, number][]>} haps - Should be an object
   *   with a value for each aleatory. For example: `{ die: 5, coin: 'Tails' }`.
   * @returns {Record<string, unknown>} Game state data.
   * @see {@link Game#nextState}
  */
  perform(actions, haps) {
    const newState = this.nextState(actions, haps);
    this.init(newState);
  }

  /** The next method is similar to `perform`, but it doesn't update the current
   * game state. It rather builds a new instance with the updated game state.
   *
   * @param {Record<string, unknown>} actions - Should be an object with a move
   *   for each active player. For example:
   *   `{ Player1: 'Rock', Player2: 'Paper' }`.
   * @param {Record<string, [unknown, number][]>} haps - Should be an object
   *   with a value for each aleatory. For example: `{ die: 5, coin: 'Tails' }`.
   * @returns {Record<string, unknown>} Game state data.
   * @see {@link Game#nextState}
  */
  next(actions, haps) {
    const newState = this.nextState(actions, haps);
    return new this.constructor(newState);
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

  /** Creates a copy of this game state.
   *
   * @returns {Game}
   */
  clone() {
    return new this.constructor(this);
  }

// Static information __________________________________________________________

  /** Metadata about the game this class represents.
   *
   * @property {object} meta
   * @property {boolean} meta.isSimultaneous - 
   * @property {boolean} meta.isZeroSum - 
   * @property {string} meta.name - An identifier for the game.
   * @property {string[]} meta.roles - 
  */
  static get meta() {
    throw new Error(`${this.name}.meta is not defined!`);
  }

  /** A user readable game's description.
   * 
   * @static
   * @property {string} 
  */
  static get description() {
    return this.meta.description;
  }

  /** A game is deterministic if it has perfect information without random
   * variables. True by default.
   * 
   * @static
   * @property {boolean=true}
  */
  static get isDeterministic() {
    return this.meta.isDeterministic ?? true;
  }

  /** A game is simultaneous if in some or all turns more than one player is
   * active. False by default, since most games are not like this.
   * 
   * @static
   * @property {boolean=false}
  */
  static get isSimultaneous() {
    return this.meta.isSimultaneous ?? false;
  }

  /** A game is zerosum if the sum of all results in every match is zero. True
   * by default, since most games are.
   * 
   * @static
   * @property {boolean=true}
  */
  static get isZeroSum() {
    return this.meta.isZeroSum ?? true;
  }

  /** The minimum and maximum values for the result method.
   * 
   * @static
   * @property {[number, number]=[-1,+1]}
  */
  static get resultRange() {
    return this.meta.resultRange ?? [-1, +1];
  }

  /** All of the game roles.
   * 
   * @static
   * @property {string[]}
  */
  static get roles() {
    return this.meta.roles ?? null;
  }

// Actions _____________________________________________________________________

  /** Returns true if the given action is available to the given role in this
   * game state.
   *
   * @param {string} role
   * @param {unknown} action
   * @returns {boolean}
  */
  isValidAction(role, action) {
    return this.actions[role].includes(action);
  }

  /** Confirms the given actions are valid, and throws an exception if it any
   * is not.
   *
   * @param {Record<string, unknown>} actions
   * @throws {Error} If any actions is not valid.
  */
  confirmActions(actions) {
    Object.entries(actions).forEach(([role, action]) => {
      const isValid = this.isValidAction(role, action);
      if (!isValid) {
        throw new Error(`Invalid action ${action} for ${role}!`);
      }
    });
  }

// Results _____________________________________________________________________

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
   * @property {Record<string, number>}
   * @see {@link Game#result}
  */
  get scores() {
    return this.result;
  }

  /** A finished game must have a result, no role with actions and no haps.
   *
   * @property {boolean}
  */
  get isFinished() {
    return !!this.result;
  }

  /** The `normalizedResult` is the `result` expressed so the minimum defeat
   * is equal to -1 and the maximum victory is equal to +1.
   *
   * @property {Record<string, number>}
  */
  get normalizedResult() {
    const [minR, maxR] = this.constructor.resultRange;
    return Object.entries(this.result)
      .reduce((normResults, [role, resultNumber]) => {
        normResults[role] = (resultNumber - minR) / (maxR - minR) * 2 - 1;
        return normResults;
      }, {});
  }

// Game information utilities __________________________________________________

  /** The game's name should be accesible from both class and instance.
   *
   * @property {string}
  */
  get name() {
    return this.constructor.meta.name ?? this.constructor.name;
  }

  /** A string which can be used as an identifier for the game state in a data
     * structure like a `Map`.
     *
     * @property {string}
    */
  get identifier() {
    throw new Error(`${this.constructor.name}.identifier is not defined!`);
  }

  /** Returns an typed array with values representing aspects of the game state.
   *
   * @property {number[]}
  */
  get features() {
    throw new Error(`${this.constructor.name}.features is not defined!`);
  }

  /** Returns a string representation of the game.
   * 
   * @returns {string}
  */
  toString() {
    throw new Error(`${this.constructor.name}.toString is not defined!`);
  }

  /** TODO `serialized(game)` builds a serialized version of a simultaneous game,
   * i.e. one in which two or more players may be active in the same turn. It
   * converts a simultaneous game to an alternated turn based game. This may be
   * useful for using algorithms like MiniMax to build AIs for simultaneous
   * games.
   */
} // class Game.
