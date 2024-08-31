import { Game, randomness } from '@ludorum/core';

const ROLE_ONE = 'One';
const ROLE_TWO = 'Two';
const DEFAULT_SCORE = { [ROLE_ONE]: 0, [ROLE_TWO]: 0 };
const ACTIONS = { HOLD: 'hold', ROLL: 'roll' };

/** Implementation of the [Pig dice game](http://en.wikipedia.org/wiki/Pig_%28dice_game%29),
 * a simple dice betting game, used as an example of a game with random
 * variables.
*/
export class Pig extends Game {
  /** TODO */
  static meta = {
    description: `Implementation of Pig.`,
    isDeterministic: false,
    name: 'Pig',
    roles: [ROLE_ONE, ROLE_TWO],
  }

  /** The active player can either hold and pass the turn, or roll. A Pig match
   * finishes when one player reaches or passes the goal score. The result for
   * each player is the difference between its score and its opponent's score.
  */
  init(state = null) {
    const { roles } = this;
    const activeRole = state?.activeRole ?? roles[0];
    const goal = state?.goal ?? 100;
    const scores = state?.scores ?? { ...DEFAULT_SCORE };
    const rolls = state?.rolls ?? [];
    const rolling = state?.rolling ?? false;

    const rollsSum = rolls.reduce((sum, n) => sum + n, 0);
    const score1 = scores[ROLE_ONE];
    const score2 = scores[ROLE_TWO];
    const isFinished = score1 >= goal || score2 >= goal;
    const result = !isFinished ? null
      : this.zeroSumResult(ROLE_ONE, Math.sign(score1 - score2));
    const actions = isFinished || rolling ? null
      : { [activeRole]: [
        ...(scores[activeRole] + rollsSum < goal ? [ACTIONS.ROLL] : []),
        ...(rolls.length > 0 ? [ACTIONS.HOLD] : []),
      ],
    };
    const haps = isFinished || !rolling ? null : { die: randomness.dice.D6 };
    super.init({
      actions, activeRole, goal, haps, isFinished, result, rolling, rolls, scores,
    });
  }

  /** TODO */
  nextState(actions, haps) {
    const { activeRole, goal, roles, rolling, rolls, scores } = this;
    const opponent = roles[(roles.indexOf(activeRole) + 1) % 2];
    const state = {
      activeRole, goal,
      rolls: [...rolls],
      scores: { ...scores },
      rolling: false,
    };
    if (rolling) {
      const rollValue = haps.die;
      if (rollValue === 1) {
        state.rolls = [];
        state.activeRole = opponent;
      } else {
        state.rolls.push(rollValue);
      }
    } else {
      const action = actions?.[activeRole];
      switch (action) {
        case ACTIONS.HOLD: {
          state.scores[activeRole] += rolls.reduce((s, r) => s + r, 0);
          state.rolls = [];
          state.activeRole = opponent;
          break;
        }
        case ACTIONS.ROLL: {
          state.rolling = true;
          break;
        }
        default: throw new Error(`Invalid action ${action} for role ${activeRole} at ${this}!`);
      }
    }
    return state;
  }
} // class Pig
