import MiniMaxPlayer from './MiniMaxPlayer';

/** Automatic players based on MiniMax with alfa-beta pruning.
*/
class AlphaBetaPlayer extends MiniMaxPlayer {
  /** Every state's evaluation is the minimax value for the given game and
   * player. The alfa and beta arguments are initialized with `-Infinity` and
   * `Infinity`.
   *
   * @param {Game} game
   * @param {string} role
   * @returns {number}
  */
  stateEvaluation(game, role) {
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
    const {
      activeRole, aleatories,
    } = game;
    if (aleatories) {
      return game.expectedEvaluation( // expectiMinimax
        role,
        (g, r) => this.minimax(g, r, depth + 1, alpha, beta),
      );
    }
    let value = this.quiescence(game, role, depth);
    if (!Number.isNaN(value)) { // game is quiescent.
      return value;
    }
    const isActive = activeRole === role;
    const actions = this.actionsFor(game, activeRole);
    for (const action of actions) {
      const next = game.next({ [activeRole]: action });
      value = this.minimax(next, role, depth + 1, alpha, beta);
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
MiniMaxPlayer.addSERMAT(AlphaBetaPlayer, '');

export default AlphaBetaPlayer;
