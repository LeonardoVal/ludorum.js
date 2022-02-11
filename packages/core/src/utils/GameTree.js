import BaseClass from './BaseClass';
import Game from '../games/Game';
import { cartesianProductObject } from './iterables';

/** Utility class that represents tree-like structures containing game states
 * and associated data. Meant to be used with search and optimization
 * algorithms.
*/
class GameTree extends BaseClass {
  /** TODO
   *
   * @param {object} [args]
   * @param {Game} [args.state=null]
   */
  constructor(args) {
    const { state, transitions } = args || {};
    super(args);
    this
      ._prop('state', state, Game, null)
      ._prop('transitions', transitions, Array, []);
  }

  /**
  */
  expand() {
    // eslint-disable-next-line no-shadow
    const { state, transitions, constructor: GameTree } = this;
    const possibleTransitions = GameTree.possibleTransitions(state);
    for (const transition of possibleTransitions) {
      const { actions, haps } = transition;
      const nextState = state.next(actions, haps);
      transition.next = new GameTree({ state: nextState });
      transitions.push(transition);
    }
    return transitions;
  }

  /** Calculates all possible `actions` objects that can be used with a `Game`'s
   * `perform` or `next` methods.
   *
   * @param {Game} game
   * @param {object} [override=null]
   * @yields {object}
  */
  static* possibleActions(actions, override = null) {
    yield* cartesianProductObject({ ...actions, ...override });
  }

  /** Calculates all possible `haps` objects that can be used with a `Game`'s
   * `perform` or `next` methods, and their corresponding probability.
   *
   * @param {object} aleatories
   * @yields {Array} - Arrays of the shape `[object, number]`.
  */
  static* possibleHaps(aleatories) {
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
  */
  static* possibleTransitions(game, actionsOverride = null) {
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
   */
  static* possibleNexts(game, actionsOverride = null) {
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
  */
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
  */
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
  */
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
} // class GameTree

GameTree.defineSERMAT('state transitions');

export default GameTree;
