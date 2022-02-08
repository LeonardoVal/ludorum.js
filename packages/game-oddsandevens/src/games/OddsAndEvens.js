import { Game } from '@ludorum/core';

const ROLE_EVENS = 'Evens';
const ROLE_ODDS = 'Odds';
const DEFAULT_POINTS = { [ROLE_EVENS]: 0, [ROLE_ODDS]: 0 };
const DEFAULT_OPTIONS = [1, 2];

/** [Odds and evens](http://en.wikipedia.org/wiki/Odds_and_evens) is a classic
 * child game, implemented as a simple example of a simultaneous game, i.e. a
 * game in which more than one player can move at any given turn.
*/
class OddsAndEvens extends Game {
  /** @inheritdoc */
  static get name() {
    return 'OddsAndEvens';
  }

  /** Builds a new OddsAndEvens game state:
   *
   * @param {object} [args]
   * @param {number} [args.turns=1] - Turns left for the current game.
   * @param {object} [args.points={Evens:0,Odds:0}] - The scores so far in the
   *   match.
   * @param {number[]} [args.options=[1, 2]] - The moves available to the
   *   players each turn.
  */
  constructor(args = null) {
    const {
      turns, points, options,
    } = args || {};
    super();
    this
      ._prop('turns', turns, 'number', 1)
      ._prop('points', points && { ...points }, 'object', { ...DEFAULT_POINTS })
      ._prop('options', options, Array, DEFAULT_OPTIONS);
  }

  /** OddsAndEvens is a simultaneous game, i.e. both players make their moves at
   * the same time, instead of alternating.
   *
   * @property {boolean}
  */
  get isSimultaneous() {
    return true;
  }

  /** Players for Odds & Evens are named `Evens` and `Odds`.
   *
   * @property {string[]}
  */
  get roles() {
    return [ROLE_EVENS, ROLE_ODDS];
  }

  /** Amount of turns still to be played.
   *
   * @property {number}
  */
  get remainingTurns() {
    const { turns, points } = this;
    return turns - points[ROLE_EVENS] - points[ROLE_ODDS];
  }

  /** All roles are active in every turn.
   *
   * @property {string[]}
  */
  get activeRoles() {
    return [...this.roles];
  }

  /** If the game has not finished, both players can play any of the available
   * options.
   *
   * @property {object}
  */
  get actions() {
    const { remainingTurns, options } = this;
    if (remainingTurns > 0) {
      return {
        [ROLE_EVENS]: [...options],
        [ROLE_ODDS]: [...options],
      };
    }
    return null;
  }

  /** A Odds & Evens game finishes after the set number of turns have been
   * played.
   *
   * @property {object}
  */
  get result() {
    const { remainingTurns, points } = this;
    if (remainingTurns > 0) {
      return null;
    }
    const pointDifference = points[ROLE_EVENS] - points[ROLE_ODDS];
    return {
      [ROLE_EVENS]: +pointDifference,
      [ROLE_ODDS]: -pointDifference,
    };
  }

  /** The `resultBounds` for an Odds & evens game are between -turns and +turns.
   *
   * @property {Array}
  */
  get resultBounds() {
    const { turns } = this;
    return [-turns, +turns];
  }

  /** If both players play either even or odd, the Evens player earns a point.
   * Otherwise the Odds player earns a point.
   *
   * @param {object} actions
   * @param {object} haps
   * @return {Game}
  */
  perform(actions, haps) {
    const { points, options } = this;
    const { [ROLE_EVENS]: moveEvens, [ROLE_ODDS]: moveOdds } = actions;
    if (!options.includes(moveEvens) || !options.includes(moveOdds)) {
      throw new Error(`Invalid actions ${JSON.stringify(actions)} (expecting: ${options.join(', ')})!`);
    }
    if (haps) {
      throw new Error(`Haps are not required (given ${JSON.stringify(haps)})!`);
    }
    if (moveEvens === moveOdds) {
      points[ROLE_EVENS] += 1;
    } else {
      points[ROLE_ODDS] += 1;
    }
  }
} // class OddsAndEvens.

/** Serialization and materialization using Sermat.
*/
OddsAndEvens.defineSERMAT('turns points options');

export default OddsAndEvens;
