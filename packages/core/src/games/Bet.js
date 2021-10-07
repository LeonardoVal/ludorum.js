import Game from './Game';
import { Aleatory, dice } from '../aleatories';

const ROLE = 'Gambler';

const DEFAULT_POINTS = 5;
const DEFAULT_GOAL = 10;

/** # Bet
 *
*/
class Bet extends Game {
  /** @inheritdoc */
  static get name() {
    return 'Bet';
  }

  /** TODO
  */
  constructor(args = {}) {
    const {
      die, goal, points,
    } = args;
    super({ activeRoles: [ROLE] });
    this
      ._prop('die', die, Aleatory, dice.D2)
      ._prop('goal', goal, 'number', DEFAULT_GOAL)
      ._prop('points', points, 'number', DEFAULT_POINTS);
  }

  /** There is only one role: Gambler.
   *
   * @property {string[]}
  */
  get roles() {
    return [ROLE];
  }

  /** The game is finished when the gambler has no points or has reached their
   * goal.
   *
   * @property {boolean}
  */
  get isFinished() {
    const { points, goal } = this;
    return points < 1 || points >= goal;
  }

  /** The gambler chooses a possible value of the die, betting one point.
   *
   * @property {object}
  */
  get actions() {
    const { die, isFinished, nature } = this;
    if (!isFinished) {
      const bets = [...die.distribution()].map(([value]) => value);
      return { [ROLE]: bets };
    }
    return null;
  }

  /** The sole aleatory in the game is a `die`.
   *
   * @property {object}
  */
  get aleatories() {
    return { die: this.die };
  }

  /** The gambler wins the game when they reach the `goal`, and loses when they
   * run out of points.
   *
   * @property {object}
  */
  get result() {
    const { points, goal } = this;
    if (points < 1) {
      return this.defeat(ROLE);
    }
    if (points >= goal) {
      return this.victory(ROLE);
    }
    return null;
  }

  /** With the bet played, the die is rolled. If the rolled value matches the
   * bet, the gambler earns a point. Otherwise the gambler loses a point.
   *
   * @param {object} actions
   * @param {object} haps
  */
  perform(actions, haps) {
    const { [ROLE]: bet } = actions;
    const { die: roll } = haps;
    this.points += bet === roll ? +1 : -1;
  }
} // class Bet

/** Serialization and materialization using Sermat.
*/
Bet.defineSERMAT('die goal points');

export default Bet;
