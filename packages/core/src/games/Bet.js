import { dice } from '../randomness';
import { Game } from './Game';

const ROLE = 'Gambler';
const DEFAULT_POINTS = 5;
const DEFAULT_GOAL = 10;

/** A simple betting game, where the player tries to guess the next result of a
 * die. If they do they earn one point, if they do not they lose one point. The
 * game finishes when one player loses all their points, or earns a goal amount.
 *
 * This is an example of both a single player game and a non-deterministic game,
 * using a die as its sole aleatory.
*/
export class Bet extends Game.create({
  description: `A simple betting game, where the player tries to guess the next result
    of a die. If they do they earn one point, if they do not they lose one
    point. The game finishes when the player loses all their points, or earns a
    goal amount.`,
  name: 'Bet',
  isDeterministic: false,
  isZeroSum: false,
  roles: [ROLE],
}) {
  /** The game's state has the die to be rolled, the amount of points to be
   * earned to win (i.e. the goal), and the amount of points earned so far.
   *
   * @param {object} [args]
   * @param {string} [args.die=dice.D2]
   * @param {number} [args.goal=10]
   * @param {string} [args.points=5]
  */
  init(state = null) {
    Object.assign(this, {
      die: state?.die ?? dice.D2,
      goal: state?.goal ?? DEFAULT_GOAL,
      points: state?.points ?? DEFAULT_POINTS,
    });
  }

  /** The game is finished when the gambler has no points or has reached their
   * goal. The gambler chooses a possible value of the die, betting one point.
   * The sole aleatory in the game is a `die`. The gambler wins the game when
   * they reach the `goal`, and loses when they run out of points.
  */
  shift() {
    const { die, goal, points } = this;
    const isFinished = points < 1 || points >= goal;
    const actions = {
      [ROLE]: isFinished ? null : die().map(([value]) => value),
    };
    const haps = { die };
    const result = !isFinished ? null : {
      [ROLE]: (points > 0) * 2 - 1,
    };
    return { actions, haps, result };
  }

  /** With the bet played, the die is rolled. If the rolled value matches the
   * bet, the gambler earns a point. Otherwise the gambler loses a point.
   *
   * @param {object} actions
   * @param {object} haps
  */
  nextState(actions, haps) {
    const { [ROLE]: bet } = actions;
    const { die: roll } = haps;
    return {
      die: this.die,
      goal: this.goal,
      points: this.points + (bet === roll ? +1 : -1),
    };
  }

  /** @inheritdoc */
  get features() {
    const { die, goal, points } = this;
    return Uint16Array.of(die.length, goal, points);
  }

  /** @inheritdoc */
  get identifier() {
    const [die, goal, points] = this.features;
    return `${points}/${goal}#${die}`;
  }
} // class Bet
