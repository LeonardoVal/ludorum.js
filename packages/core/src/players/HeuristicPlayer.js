import { Game } from '../games/Game';
import { randomChoice, randomNumber } from '../randomness';
import { Player } from './Player';

/** This is the base type of automatic players based on heuristic evaluations of
 * game states or moves.
 *
 * @class
 * @extends Player
*/
export class HeuristicPlayer extends Player {
  /** The constructor takes an heuristic function with which to evaluate game
   * states. By default its a random value between -0.5 and 0.5, mostly only
   * useful for testing.
  */
  constructor(args = null) {
    super(args);
    this.heuristic = args?.heuristic ?? this.randomHeuristic;
  }

  /** Returns a the possible transitions from the given `game` state, grouped
   * for each available action of the given `role`.
   *
   * @param {Game} game
   * @param {string} role
   * @param {object} [extraData=null]
   * @yields {object} Objects of the shape `{ roleAction, transitions, ... }`.
  */
  * transitionsByRoleAction(game, role, extraData = null) {
    const { actions } = game;
    if (actions) {
      const { [role]: roleActions } = actions;
      if (roleActions) {
        for (const roleAction of roleActions) {
          const transitions = [
            ...Game.possibleNexts(game, { [role]: [roleAction] }),
          ];
          yield { roleAction, transitions, ...extraData };
        }
      }
    }
  }

  /** Heuristic players work by evaluating the moves of the `role` in the given
   * `game` state. If the game state has aleatories, then all possible scenarios
   * are evaluated and aggregated.
   *
   * @param {Game} - A game state
   * @param {string} - A role in the given game.
   * @yields {Array} - Pairs `[move, evaluation]`.
  */
  async* evaluatedActions(game, role) {
    const options = this.transitionsByRoleAction(game, role);
    for (const { roleAction, transitions } of options) {
      let sum = 0;
      let div = 0;
      for (const { next, probability } of transitions) {
        sum += (await this.stateEvaluation(next, role)) * probability;
        div += probability;
      }
      const actionEvaluation = div > 0 ? sum / div : 0; // Average all evaluations.
      yield [roleAction, actionEvaluation];
    }
  }

  /** The `stateEvaluation` calculates a number as the assessment of the given
   * `game` state for the given `role`. The base implementation returns the
   * result for the player is the game has results, else it returns the
   * heuristic value for the state.
   *
   * @param {Game} game
   * @param {string} role
   * @returns {number}
  */
  async stateEvaluation(game, role) {
    const { result } = game;
    return result ? result[role] : this.heuristic(game, role);
  }

  /** The `randomHeuristic` returns a random number in [-0.5, +0.5). This is
   * mostly only useful for testing.
   *
   * @returns {number}
  */
  randomHeuristic() {
    return randomNumber(this.rng, -0.5, +0.5);
  }

  /** The heuristic is an evaluation used at states that are not finished games.
   *
   * @param {Game} game
   * @param {string} role
   * @returns {number}
  */
  async heuristic(_game, _role) {
    return this._unimplemented('heuristic');
  }

  /** The `bestActions` are all the best evaluated in the given `game` for the
   * given `role`.
   *
   * @param {Game} game
   * @param {string} role
  */
  async bestActions(game, role) {
    let bestEvaluation = -Infinity;
    let result = [];
    for await (const [action, evaluation] of this.evaluatedActions(game, role)) {
      if (evaluation > bestEvaluation) {
        bestEvaluation = evaluation;
        result = [action];
      } else if (Math.abs(evaluation - bestEvaluation) < 1e-15) {
        result.push(action);
      }
    }
    return result;
  }

  /** The `decision` selects randomly from the best evaluated moves.
   *
   * @param {Game} game
   * @param {string} role
   * @returns {any}
  */
  async decision(game, role) {
    const bestMoves = await this.bestActions(game, role);
    return randomChoice(this.rng, bestMoves);
  }

  // Utilities to build heuristics

  /** A `composite` heuristic function returns the weighted sum of other
   * functions. The arguments must be a sequence of heuristic functions and a
   * weight. All weights must be between 0 and 1 and add up to 1.
  * /
  static composite(...components) {
    var components = Array.prototype.slice.call(arguments),
      weightSum = 0;
    raiseIf(components.length < 1,
      "HeuristicPlayer.composite() cannot take an odd number of arguments!");
    for (var i = 0; i < components.length; i += 2) {
      raiseIf(typeof components[i] !== 'function',
        "HeuristicPlayer.composite() argument ", i, " (", components[i], ") is not a function!");
      components[i+1] = +components[i+1];
      raiseIf(isNaN(components[i+1]) || components[i+1] < 0 || components[i+1] > 1,
        "HeuristicPlayer.composite() argument ", i+1,
        " (", components[i+1], ") is not a valid weight!");
    }
    return (game, role) => {
      let sum = 0;
      for (let i = 0; i + 1 < components.length; i += 2) {
        sum += components[i](game, role) * components[i+1];
      }
      return sum;
    };
  } */
} // class HeuristicPlayer.
