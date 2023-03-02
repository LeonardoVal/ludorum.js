import { Player } from '../players/Player';

function defineShiftProps(game) {
  const { actions, haps, result } = game.shift();
  Object.defineProperties(game, {
    actions: { value: actions ?? null },
    haps: { value: haps ?? null },
    result: { value: result ?? null },
  });
} // function defineShiftProps

/** The class `Game` is the base type for all games.
 *
 * @class
*/
export class Game {
  // Game model ////////////////////////////////////////////////////////////////

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
  init(_state) {
    throw new Error(`${this.constructor.name}.init() is not defined!`);
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
    throw new Error(`${this.constructor.name}.roles is not defined!`);
  }

  /** Calculates the necessary data to determine how to shift the game forward,
   * or to tell that it has finished.
   *
   * @returns {object}
   * @see {@link Game#actions}
   * @see {@link Game#haps}
   * @see {@link Game#result}
   */
  shift() {
    throw new Error(`${this.constructor.name}.shift() is not defined!`);
  }

  /** The game's `actions` is an object with every role related to the actions
   * each can make in this turn. Roles with no actions can have either `null` or
   * an empty array.
   *
   * @property {Record<string, unknown[]> | null}
   * @see {@link Game#shift}
   * @example
   *   {
   *     Player1: ['Rock', 'Paper', 'Scissors'],
   *     Player2: ['Rock', 'Paper', 'Scissors'],
   *   }
  */
  get actions() {
    defineShiftProps(this);
    return this.actions;
  }

  /** The game's `haps` are the random variables that may affect the game, e.g.
   * dice or card decks. Is an object with each property having an random
   * variable distribution, i.e. an array of tuples _[value, probability]_.
   *
   * @property {Record<string, [unknown, number][]> | null}
   * @see {@link Game#shift}
   * @example
   *   { D6: [1,2,3,4,5,6].map((v) => [v, 1/6]) }
  */
  get haps() {
    defineShiftProps(this);
    return this.haps;
  }

  /** If the game is finished the result of the game is calculated with
   * `result`. If the game is not finished, this function must return `null`.
   *
   * @property {Record<string, number>} An object with every player in the game
   *   related to a number. This number must be positive if the player wins,
   *   negative if the player loses or zero if the game is a tie.
   * @see {@link Game#shift}
   * @example
   *   { Player1: -1, Player2: +1 }
  */
  get result() {
    defineShiftProps(this);
    return this.result;
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
   * @see {@link Game#init}
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
    delete this.actions;
    delete this.haps;
    delete this.result;
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

  // Game information utilities ////////////////////////////////////////////////

  /** Metadata about the game this class represents.
   *
   * @property {object} meta
   * @property {string} meta.description - A user readable game's description.
   * @property {boolean} meta.isDeterministic - A game is deterministic if it
   *   has perfect information without random variables. True by default.
   * @property {boolean} meta.isSimultaneous - A game is simultaneous if in some
   *   or all turns more than one player is active. False by default, since most
   *   games are not like this.
   * @property {boolean} meta.isZeroSum - A game is zerosum if the sum of all
   *   results in every match is zero. True by default, since most games are.
   * @property {string} meta.name - An identifier for the game.
   * @property {string[]} meta.roles - The game roles.
  */
  static get meta() {
    throw new Error(`${this.name}.meta() is not defined!`);
  }

  /** Helper static method for creating a Game subclass. It initializes the
   * subclass's `name`, `meta` and `roles`.
   *
   * @param {object}
   * @see {@link Game.meta}
  */
  static create(args) {
    if (!args?.name) {
      throw new Error(`${this.name} must have a valid name (got ${args?.name})!`);
    }
    return class extends this {
      static get name() {
        return args.name;
      }

      static get meta() {
        return {
          description: args.description ?? '',
          isDeterministic: !!(args.isDeterministic ?? true),
          isSimultaneous: !!(args.isSimultaneous ?? false),
          isZeroSum: !!(args.isZeroSum ?? true),
          minResult: args.minResult ?? -1,
          maxResult: args.maxResult ?? +1,
          name: args.name,
        };
      }

      get roles() {
        return args.roles ?? super.roles;
      }
    };
  } // static create

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

  /** A finished game must have a result, no role with actions and no haps.
   *
   * @property {boolean}
  */
  isFinished() {
    return !!this.result;
  }

  /** The `normalizedResult` is the `result` expressed so the minimum defeat
   * is equal to -1 and the maximum victory is equal to +1.
   *
   * @property {Record<string, number>}
   * @see {@link Game#result}
  */
  get normalizedResult() {
    const { minResult: minR, maxResult: maxR } = this.constructor.meta;
    return Object.fromEntries(
      Object.entries(this.result).map(([role, resultNumber]) => [
        role,
        (resultNumber - minR) / (maxR - minR) * 2 - 1,
      ]),
    );
  }

  // Utilities for matches and players /////////////////////////////////////////

  /** Calculates at random one of the possible `haps` objects that can be used
   * with a `Game`'s `perform` or `next` methods.
   *
   * @param {function} rng
   * @return {Record<string, unknown>} - Random haps object.
  */
  randomHaps(rng) {
    const { haps } = this;
    return haps && Object.fromEntries(
      Object.entries(haps).map(([name, aleatory]) => [
        name,
        aleatory(rng())[0],
      ]),
    );
  }

  /** Conducts a match of this game played by the given players. Each step an
   * object is yielded:
   *
   * + First an object with the `start` game state and the participating
   *   `players`.
   *
   * + After that objects with the `actions` taken by the players, random `haps`
   *   and the resulting `next` game state.
   *
   * + In the end the `final` game state and its corresponding `result`.
   *
   * @param {object} args
   * @param {Player[] | Record<string, Player>} args.players
   * @param {function} [args.rng=Math.random]
   * @yields {object}
  */
  async* match(args) {
    const { rng = Math.random } = args;
    const players = Player.participants(this, args.players);
    yield { start: this, players };
    let game = this;
    let { result } = game;
    while (!result) {
      const actions = await Player.decisions(game, players);
      const haps = this.randomHaps(rng);
      game = game.next(actions, haps);
      yield { actions, haps, next: game };
      result = game.result;
    }
    yield { final: game, result };
  }

  /** Plays a match until the end and returns the result.
   *
   * @param {object} args
   * @param {Player[] | Record<string, Player>} args.players
   * @param {function} args.rng
   * @returns {Record<string, number>}
  */
  async playMatch(args) {
    for (const { result } of this.match(args)) {
      if (result) {
        return result;
      }
    }
    throw new Error(`Unexpected match ending without result for ${
      this.constructor.name}!`);
  }

  // Testing utilities /////////////////////////////////////////////////////////

  /** Checks if this game state's actions comply with the Game's protocol.
   *
   * @param {object} args
   * @param {function} args.expect - Jest's `expect` function or equivalent.
   * @returns {number} Count of active players.
  */
  checkActions({ expect }) {
    const { meta } = this.constructor;
    const { actions, roles } = this;
    expect(typeof actions).toBe('object');
    expect(Object.keys(actions)).toEqual(roles);
    let activeCount = 0;
    roles.forEach((role) => {
      const roleActions = actions[role];
      expect(roleActions === null || Array.isArray(roleActions)).toBe(true);
      if (roleActions?.length > 0) {
        activeCount += 1;
        roleActions.forEach((action) => {
          const actionJSON = JSON.stringify(action);
          expect(JSON.parse(actionJSON)).toEqual(action);
        });
      }
    });
    if (activeCount > 1) {
      expect(meta.isSimultaneous).toBe(true);
    }
    return activeCount;
  }

  /** Checks if this game state's actions comply with the Game's protocol.
   *
   * @param {object} args
   * @param {function} args.expect - Jest's `expect` function or equivalent.
  */
  checkHaps({ expect }) {
    const { meta } = this.constructor;
    const { haps } = this;
    if (haps) {
      expect(meta.isDeterministic).toBe(false);
      Object.entries(haps).forEach(([, aleatory]) => {
        expect(typeof aleatory).toBe('function');
      });
    }
    return !!haps;
  }

  /** Checks if this game state's actions comply with the Game's protocol.
   *
   * @param {object} args
   * @param {function} args.expect - Jest's `expect` function or equivalent.
   * @returns {number} Sum of the game's result or NaN is game is not finished.
  */
  checkResult({ expect }) {
    const { meta } = this.constructor;
    const { result, roles } = this;
    expect(typeof result).toBe('object');
    if (result) {
      let resultSum = 0;
      roles.forEach((role) => {
        const roleResult = result[role];
        expect(typeof roleResult).toBe('number');
        expect(roleResult).not.toBeNaN();
        resultSum += roleResult;
      });
      if (meta.isZeroSum) {
        expect(resultSum).toBeCloseTo(0);
      }
      return resultSum;
    }
    return NaN;
  }

  /** Tests if this instance complies with the conditions for finished game
   * states.
   *
   * @param {object} args
   * @param {function} args.expect - Jest's `expect` function or equivalent.
   * @param {boolean} [args.isFinished]
  */
  checkGame({ expect, isFinished }) {
    const activeCount = this.checkActions({ expect });
    this.checkHaps({ expect });
    const resultSum = this.checkResult({ expect });
    if (typeof isFinished === 'boolean') {
      expect(activeCount > 0).toBe(!isFinished);
      expect(Number.isNaN(resultSum)).toBe(!isFinished);
    }
  }

  /** Tests if a match can be played from this game state onwards.
   *
   * @param {object} args
   * @param {function} args.expect - Jest's `expect` function or equivalent.
   * @returns {object[]} The match's history.
   */
  async checkMatch({ expect, ...matchArgs }) {
    const history = [];
    for await (const step of this.match(matchArgs)) {
      if (history.length < 1) {
        expect(step.start).toBeInstanceOf(this.constructor);
        step.start.checkGame({ expect, isFinished: false });
      } else if (step.next) {
        expect(step.next).toBeInstanceOf(this.constructor);
        step.next.checkGame({ expect, isFinished: !!step.next.result });
      } else if (step.final) {
        expect(step.final).toBeInstanceOf(this.constructor);
        step.final.checkGame({ expect, isFinished: true });
      }
      history.push(step);
    }
    return history;
  }

  // ///////////////////////////////////////////////////////////////////////////

  /** Calculates all possible `actions` objects that can be used with a `Game`'s
   * `perform` or `next` methods.
   *
   * @param {object} actions
   * @param {object} [override=null]
   * @yields {object}
  * /
  static * possibleActions(actions, override = null) {
    yield* cartesianProductObject({ ...actions, ...override });
  }

  /** Calculates all possible `haps` objects that can be used with a `Game`'s
   * `perform` or `next` methods, and their corresponding probability.
   *
   * @param {object} aleatories
   * @yields {Array} - Arrays of the shape `[object, number]`.
  * /
  static * possibleHaps(aleatories) {
    const keys = Object.keys(aleatories);
    const distros = keys.reduce((obj, key) => {
      obj[key] = [...aleatories[key].distribution()];
      return obj;
    }, {});
    for (const result of cartesianProductObject(distros)) {
      let aggregatedProbability = 1;
      keys.forEach((key) => {
        const [value, probability] = result[key];
        aggregatedProbability *= probability;
        result[key] = value;
      });
      yield [result, aggregatedProbability];
    }
  }

  /** Calculates all posible transitions that can generate a new game state from
   * another one. This includes `actions`, `haps` and a `probability`.
   *
   * @param {Game} game
   * @param {object} [actionsOverride=null]
   * @yields {object} - Object of the shape `{ actions, haps, probability }`.
  * /
  static * possibleTransitions(game, actionsOverride = null) {
    const {
      actions: gameActions, aleatories, isFinished,
    } = game;
    if (!isFinished) {
      const possibleActions = !gameActions ? [null]
        : this.possibleActions(gameActions, actionsOverride);
      const possibleHaps = !aleatories ? [[null, 1]]
        : this.possibleHaps(aleatories);
      for (const actions of possibleActions) {
        for (const [haps, probability] of possibleHaps) {
          yield { actions, haps, probability };
        }
      }
    }
  }

  /** Calculates all possible new game states from the given `game`, incluiding
   * also the actions, haps and probability of the corresponding transition.
   *
   * @param {Game} game
   * @param {object} [actionsOverride=null]
   * @yields {object} - Object of the shape `{ actions, haps, probability, next }`.
   * /
  static * possibleNexts(game, actionsOverride = null) {
    for (const transition of this.possibleTransitions(game, actionsOverride)) {
      const { actions, haps } = transition;
      transition.next = game.next(actions, haps);
      yield transition;
    }
  }

  /** Calculates at random one of the possible `actions` objects that can be
   * used with a `Game`'s `perform` or `next` methods.
   *
   * @param {Randomness} random
   * @param {object} actions
   * @param {object} [override=null]
   * @return {object}
  * /
  static randomActions(random, actions, override = null) {
    const obj = { ...actions, ...override };
    return Object.entries(obj).reduce((r, [k, vs]) => {
      r[k] = random.choice(vs);
      return r;
    }, {});
  }

  /** Calculates at random one of the possible `haps` objects that can be used
   * with a `Game`'s `perform` or `next` methods.
   *
   * @param {Randomness} random
   * @param {object} aleatories
   * @return {Array} - Array of the shape `[haps, probability]`.
  * /
  static randomHaps(random, aleatories) {
    let hapsProbability = 1;
    const haps = Object.entries(aleatories).reduce((result, [key, alea]) => {
      const distribution = new Map(
        [...alea.distribution()]
          .map(([value, prob]) => [[value, prob], prob]),
      );
      const [value, prob] = random.weightedChoice(distribution);
      result[key] = value;
      hapsProbability *= prob;
      return result;
    }, {});
    return [haps, hapsProbability];
  }

  /** Calculates at random one of the possible `actions` objects that can be
   * used with a `Game`'s `perform` or `next` methods.
   *
   * @param {Randomness} random
   * @param {object} actions
   * @param {object} [override=null]
   * @return {object}
  * /
  static randomTransition(random, game, options = null) {
    const { actions, aleatories } = game;
    const { actionsOverride = null } = options || {};
    const [haps, probability] = !aleatories ? [null, 1]
      : this.randomHaps(random, aleatories);
    return {
      actions: this.randomActions(random, actions, actionsOverride),
      haps,
      probability,
    };
  }

  /** TODO `serialized(game)` builds a serialized version of a simultaneous game,
   * i.e. one in which two or more players may be active in the same turn. It
   * converts a simultaneous game to an alternated turn based game. This may be
   * useful for using algorithms like MiniMax to build AIs for simultaneous
   * games.
   */
} // class Game.
