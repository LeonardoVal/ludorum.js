import { Game } from '../Game';
import { D6 } from '../Aleatory';

const ROLL_ACTION = 'roll';
const HOLD_ACTION = 'hold';

export class Pig extends Game {
  /** [Pig](http://en.wikipedia.org/wiki/Pig_%28dice_game%29) is a simple dice
   * betting game, used as an example of a game with random variables.
   *
   * @param {object} [args]
   * @param {'One'|'Two'} [args.activeRole='One'] - The active player.
   * @param {number} [args.goal=100] - The amount of points a player has to
   *   reach to win the game.
   * @param {object} [args.scores={One: 0, Two: 0}] - The scores so far in the
   *   match.
   * @param {int[]} [args.rolls=[]] - The rolls the active player has made in
   *   his turn.
   */
  constructor({
    activeRole = 'One',
    goal = NaN,
    scores = null,
    rolls = null,
  } = {}) {
    super({ activeRoles: activeRole && [activeRole] });
    this.goal = Number.isNaN(goal) ? 100 : +goal;
    this.scores = scores || Object.fromEntries(this.roles.map((r) => [r, 0]));
    this.rolls = rolls || [];
  }

  rollSum() {
    return this.rolls.reduce((s, n) => s + n, 0);
  }

  /** Since it involves dice, Pig is not a deterministic game.
   *
   * @property {boolean} [isDeterministic]
   */
  get isDeterministic() {
    return false;
  }

  /** Players for Pig are named `One`, `Two`.
   *
   * @property {string[]} [roles]
   */
  get roles() {
    return ['One', 'Two'];
  }

  /** The active player can either hold and pass the turn, or roll.
   *
   * @returns {object}
   */
  actions() {
    if (this.result()) {
      return null;
    }
    const { goal, scores } = this;
    const activeRole = this.activeRole();
    const rollSum = this.rollSum();
    const currentScore = scores[activeRole] + rollSum;
    const _actions = [];
    if (rollSum > 0) {
      _actions.push(HOLD_ACTION);
    }
    if (currentScore < goal) {
      _actions.push(ROLL_ACTION);
    }
    return { [activeRole]: _actions };
  }

  /** A Pig match finishes when one player reaches or passes the goal score. The
   * result for each player is the difference between its score and its
   * opponent's score.
   *
   * @returns {object}
   */
  result() {
    const [role0, role1] = this.roles;
    const { [role0]: score0, [role1]: score1 } = this.scores;
    const { goal } = this;
    if (score0 >= goal || score1 >= goal) {
      const result0 = Math.min(goal, score0) - Math.min(goal, score1);
      return { [role0]: result0, [role1]: -result0 };
    }
    return null;
  }

  checkChoices(choices, eq) {
    if (typeof choices !== 'object' || !choices) {
      throw new TypeError(`Invalid choices:${JSON.stringify(choices)}!`);
    }
    Object.entries(this.actions()).forEach((role, roleActions) => {
      const choice = choices[role];
      const includes = roleActions.find((roleAction) => (
        eq ? eq(roleAction, choice) : roleAction === choice
      ));
      if (!includes) {
        throw new Error(`Invalid choice for ${role} (${choice})!`);
      }
    });
  }

  /** If the active player holds, it earns the sum of the rolls made so in its
   * turn. If the move is roll, a die is rolled. A roll of 1 stops the this turn
   * and the active player earns no points. A roll of 2 or up, makes the turn
   * continue.
   *
   * For this game mechanic, an contingent game state is used. If the move is
   * `roll`, an instance of this class is build and returned using the dice
   * shotcuts as random variables. This aleatoric game state will call the
   * `next` method again with the same moves and the values of the random
   * variables, and then the match will continue.
   *
   */
  next(choices, haps, args) {
    this.checkChoices(choices);
    const { goal, rolls, scores } = this;
    const activeRole = this.activeRole();
    const { [activeRole]: activeRoleChoice } = choices;
    if (activeRoleChoice === ROLL_ACTION) {
      // eslint-disable-next-line no-bitwise
      const roll = (haps && haps.die) | 0;
      if (!roll) { // Die has not been rolled.
        return this.contingent(this, choices, { die: D6 }, args);
      }
      if (roll > 1) { // Dice has been rolled.
        return new this.constructor({ activeRole, goal, scores, rolls: [...rolls, roll] });
      }
    } // if (activeRoleChoice === HOLD_ACTION) {
    const nextRole = this.opponent();
    const nextScores = {
      ...scores,
      [activeRole]: scores[activeRole] + this.rollSum(),
    };
    const nextRolls = [];
    if (args && args.update) {
      this.activateRoles(nextRole);
      this.scores = nextScores;
      this.rolls = nextRolls;
      return this;
    }
    return new this.constructor({
      goal,
      activeRole: nextRole,
      scores: nextScores,
      rolls: nextRolls,
    });
  }

  // Utility methods ///////////////////////////////////////////////////////////

  /** The `resultBounds` for a Pig game are estimated with the goals.
   *
   * @property {[number, number]} [resultBounds]
   */
  get resultBounds() {
    const { goal } = this;
    return [-goal, +goal];
  }

  /** Serialization and materialization using Sermat.
   *
   * @property {object} [__SERMAT__]
   */
  static __SERMAT__ = {
    identifier: 'Pig',
    serializer: (obj) => {
      const { goal, rolls, scores } = obj;
      return [{ goal, rolls, scores, activeRole: obj.activeRole() }];
    },
  }
} // class Pig.

export default { Pig };
