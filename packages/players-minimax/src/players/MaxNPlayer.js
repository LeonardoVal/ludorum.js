import { players } from '@ludorum/core';

/** Automatic players based on the [MaxN](http://dl.acm.org/citation.cfm?id=2887795)
 * algorithm, a MiniMax variant for games of more than two players.
 *
 * @class
 * @extends HeuristicPlayer
*/
export class MaxNPlayer extends players.HeuristicPlayer {
  /** Besides the parameters of every `HeuristicPlayer`, an `horizon` for the
   * search may be specified (3 plies by default).
   *
   * @param {object} [args=null]
   * @param {int} [args.horizon=4]
  */
  constructor(args = null) {
    super(args);
    Object.defineProperty(this, 'horizon', {
      enumerable: true,
      value: args?.horizon ?? 4,
    });
  }

  /** This player evaluates each state using the `maxN` method, taking the
   * evaluation for the given `player`.
   *
   * @param {Game} game
   * @param {string} role
   * @returns {number}
  */
  async stateEvaluation(game, role) {
    return this.maxN(game, role, 0)[role];
  }

  /** `heuristics(game)` returns an heuristic value for each players in the
   * game, as an object.
   *
   * @param {Game} game
   * @returns {object}
  */
  heuristics(game) {
    const result = {};
    game.roles.forEach((role) => {
      result[role] = this.heuristic(game, role);
    });
    return result;
  }

  /** `quiescence(game, player, depth)` is a stability test for the given `game`
   * state and the given `player`. If the game is quiescent, this function must
   * return evaluations. Else it must return null.
   *
   * Final game states are always quiescent, and their evaluations are the
   * game's result for each player. This default implementation also returns
   * heuristic evaluations for every game state at a deeper depth than the
   * player's horizon, calculated via the `heuristics()` method.
   *
   * @param {Game} game
   * @param {string} role
   * @param {int} depth
   * @returns {object}
  */
  quiescence(game, _role, depth) {
    const { result } = game;
    if (result) {
      return result;
    }
    if (depth >= this.horizon) {
      return this.heuristics(game);
    }
    return null;
  }

  /** The core `maxN(game, player, depth)` algorithm return the evaluations for
   * each player of the given game, assuming each player tries to maximize its
   * own evaluation regardless of the others'.
   *
   * @param {Game} game
   * @param {string} role
   * @param {int} depth
   * @returns {object}
  */
  maxN(game, role, depth) {
    let values = this.quiescence(game, role, depth);
    if (values === null) { // game is not quiescent.
      const { actions, activeRole } = game;
      for (const action of actions[activeRole]) {
        const next = game.next({ [activeRole]: action });
        const nextValues = this.maxN(next, role, depth + 1);
        if (!values || nextValues[activeRole] > values[activeRole]) {
          values = nextValues;
        }
      }
    }
    return values;
  }
} // class MaxNPlayer.
