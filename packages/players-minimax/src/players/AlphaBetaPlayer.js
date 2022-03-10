import { Game } from '@ludorum/core';
import MiniMaxPlayer from './MiniMaxPlayer';

/** Automatic players based on MiniMax with alfa-beta pruning.
*/
class AlphaBetaPlayer extends MiniMaxPlayer {
  /** @inheritdoc */
  static get name() {
    return 'AlphaBetaPlayer';
  }

  /** Every state's evaluation is the minimax value for the given game and
   * player. The alfa and beta arguments are initialized with `-Infinity` and
   * `Infinity`.
   *
   * @param {Game} game
   * @param {string} role
   * @returns {number}
  */
  async stateEvaluation(game, role) {
    return this.minimax(game, role, 1, -Infinity, Infinity);
  }

  /** The `minimax` method calculates the Minimax evaluation of the given game
   * for the given player. If the game is not finished and the depth is greater
   * than the horizon, the heuristic is used.
   *
   * @param {Game} game
   * @param {string} role
   * @param {number} [depth=0]
   * @param {number} [alpha=-Infinity]
   * @param {number} [beta=+Infinity]
   * @returns {number}
  */
  minimax(game, role, depth = 0, alpha = -Infinity, beta = Infinity) {
    const { activeRole, actions, aleatories } = game;
    let value = this.quiescence(game, role, depth);
    if (!Number.isNaN(value)) { // game is quiescent.
      return value;
    }
    const isActive = activeRole === role;
    const actionOptions = Game.possibleActions(actions);
    const possibleHaps = aleatories && Game.possibleHaps(aleatories);
    for (const actionOption of actionOptions) {
      if (!possibleHaps) {
        const next = game.next(actionOption);
        value = this.minimax(next, role, depth + 1);
      } else { // expectiMinimax
        value = 0;
        for (const [haps, probability] of possibleHaps) {
          const next = game.next(actionOption, haps);
          value += this.minimax(next, role, depth + 1) * probability;
        }
      }
      if (isActive) {
        if (alpha < value) { // MAX
          alpha = value;
        }
      } else if (beta > value) { // MIN
        beta = value;
      }
      if (beta <= alpha) {
        break;
      }
    }
    return isActive ? alpha : beta;
  }
} // class AlphaBetaPlayer.

/** Serialization and materialization using Sermat.
*/
AlphaBetaPlayer.defineSERMAT('');

export default AlphaBetaPlayer;
