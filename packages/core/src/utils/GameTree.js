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
    const distros = keys.reduce((obj, key, alea) => {
      obj[key] = [...alea.distribution()];
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

  static randomActions(random, actions, override = null) {
    const obj = { ...actions, ...override };
    return Object.keys(obj).reduce((r, k, vs) => {
      r[k] = random.choice(vs);
      return r;
    }, {});
  }
} // class GameTree

GameTree.defineSERMAT('state transitions');

export default GameTree;
