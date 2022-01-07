import Game from '@ludorum/core/games/Game';
import { dice } from '@ludorum/core/aleatories';

const ROLE_ONE = 'One';
const ROLE_TWO = 'Two';
const DEFAULT_SCORE = { [ROLE_ONE]: 0, [ROLE_TWO]: 0 };
const ACTIONS = { HOLD: 'hold', ROLL: 'roll' };

/** Implementation of the [Pig dice game](http://en.wikipedia.org/wiki/Pig_%28dice_game%29),
 * a simple dice betting game, used as an example of a game with random
 * variables.
*/
class Pig extends Game {
  /** @inheritdoc */
  static get name() {
    return 'Pig';
  }

  /** Builds a new Pig game state:
   *
   * @param {object} [args]
   * @param {string} [args.activeRole='One'] - The active player.
   * @param {number} [args.goal=100] - The amount of points a player has to
   *   reach to win the game.
   * @param {object} [args.scores={One:0,Two:0}] - The scores so far in the
   *   match.
   * @param {number[]} [args.rolls=[]] - The rolls the active player has made in
   *   his turn.
   * @param {boolean} [args.rolling=false] - A die roll is pending.
  */
  constructor(args = null) {
    const {
      activeRole = 0, goal, scores, rolls, rolling,
    } = args || {};
    super({ activeRoles: [activeRole] });
    this
      ._prop('goal', goal, 'number', 100)
      ._prop('scores', scores, 'object', { ...DEFAULT_SCORE })
      ._prop('rolls', rolls, Array, [])
      ._prop('rolling', rolling, 'boolean', false);
  }

  /** Since it involves dice, Pig is not a deterministic game.
   * @property {boolean}
  */
  get isDeterministic() {
    return false;
  }

  /** Players for Pig are named `One`, `Two`.
   *
   * @property {string[]}
  */
  get roles() {
    return [ROLE_ONE, ROLE_TWO];
  }

  /** The tentative score for the active role is the sum of their score plus
   * the current rolls.
   *
   * @returns {number}
  */
  tentativeScore() {
    const { activeRole, scores, rolls } = this;
    return rolls.reduce((sum, n) => sum + n, scores[activeRole]);
  }

  /** The active player can either hold and pass the turn, or roll.
   *
   * @property {object}
  */
  get actions() {
    const {
      activeRole, result, rolls, rolling, goal,
    } = this;
    if (!result && !rolling) {
      const moves = [];
      if (this.tentativeScore() < goal) {
        moves.push(ACTIONS.ROLL);
      }
      if (rolls.length > 0) {
        moves.push(ACTIONS.HOLD);
      }
      return { [activeRole]: moves };
    }
    return null;
  }

  /** If a roll is pending, a standard (six-sided) die is the aleatory.
   *
   * @property {object}
  */
  get aleatories() {
    const { rolling } = this;
    if (rolling) {
      return { die: dice.D6 };
    }
    return null;
  }

  /** A Pig match finishes when one player reaches or passes the goal score. The
   * result for each player is the difference between its score and its
   * opponent's score.
   *
   * @property {object}
  */
  get result() {
    const { scores, goal, rolling } = this;
    if (!rolling) {
      const score1 = scores[ROLE_ONE];
      const score2 = scores[ROLE_TWO];
      if (score1 >= goal || score2 >= goal) {
        const r = Math.min(goal, score1) - Math.min(goal, score2);
        return { [ROLE_ONE]: r, [ROLE_TWO]: -r };
      }
    }
    return null;
  }

  /** The `resultBounds` for a Pig game are between -goal and +goal.
   *
   * @property {Array}
  */
  get resultBounds() {
    return [-this.goal, +this.goal];
  }

  /** If the active player holds, it earns the sum of the rolls made so in its
   * turn. If the move is roll, a die is rolled. A roll of 1 stops the turn and
   * the active player earns no points. A roll of 2 or up, makes the turn
   * continue.
   *
   * @param {object} actions
   * @param {object} haps
   * @return {Game}
  */
  perform(actions, haps) {
    const {
      activeRole, scores, rolls, rolling,
    } = this;
    const opponent = this.opponent();
    if (rolling) {
      const rollValue = haps.die; // TODO Check value.
      if (rollValue === 1) {
        this.rolls = [];
        this.activateRoles(opponent);
      } else {
        rolls.push(rollValue);
      }
      this.rolling = false;
    } else {
      const action = actions?.[activeRole];
      switch (action) {
        case ACTIONS.HOLD: {
          const newScore = scores[activeRole] + this.tentativeScore();
          this.scores = { ...scores, [activeRole]: newScore };
          this.rolls = [];
          this.activateRoles(opponent);
          break;
        }
        case ACTIONS.ROLL: {
          this.rolling = true;
          break;
        }
        default: throw new Error(`Invalid action ${action} for role ${activeRole} at ${this}!`);
      }
    }
  }
} // class Pig.

/** Serialization and materialization using Sermat.
*/
Pig.defineSERMAT('activeRole goal rolls scores rolling');

export default Pig;
