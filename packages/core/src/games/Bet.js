import Game from './Game';
import { Aleatory, dice } from '../aleatories';

const ROLE = 'Gambler';

const DEFAULT_POINTS = 5;
const DEFAULT_GOAL = 10;

/** # Bet
 *
*/
class Bet extends Game {
  /** TODO
  */
  constructor(args = {}) {
    const { die, goal, points } = args;
    super({ activeRoles: [ROLE] });
    this
      ._prop('die', die, Aleatory, dice.D2)
      ._prop('goal', goal, +goal, !Number.isNaN(+goal), DEFAULT_GOAL)
      ._prop('points', points, !Number.isNaN(+points), DEFAULT_POINTS);
  }

  /** TODO
  */
  get roles() {
    return [ROLE];
  }

  /** TODO
  */
  get isFinished() {
    const { points, goal } = this;
    return points < 1 || points >= goal;
  }

  /** TODO
  */
  get actions() {
    const { die, isFinished, nature } = this;
    if (!isFinished) {
      const bets = [...die.distribution()].map(([value]) => value);
      return { [ROLE]: bets };
    }
    return null;
  }

  get aleatories() {
    return { die: this.die };
  }

  /** TODO
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

  /** TODO
  */
  perform(actions, haps) {
    const { [ROLE]: bet } = actions;
    const { die: roll } = haps;
    this.points += bet === roll ? +1 : -1;
  }

  /** Serialization and materialization using Sermat.
  */
  static __SERMAT__ = {
    identifier: 'ludorum.Bet',
    serializer({ die, goal, points }) {
      return [{ die, goal, points }];
    },
    materializer(_obj, args) {
      return args && (new Bet(...args));
    },
  };
} // class Bet

export default Bet;
