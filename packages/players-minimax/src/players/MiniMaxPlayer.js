import HeuristicPlayer from '@ludorum/core/players/HeuristicPlayer';

/** Automatic players based on pure MiniMax.
 *
 * @class
 * @extends HeuristicPlayer
*/
class MiniMaxPlayer extends HeuristicPlayer {
  /** The constructor takes the player's `name` and the MiniMax search's
   * `horizon` (`4` by default).
   *
   * A `hook` is a callback function to be called in every node with the game
   * state and its value. A result other than NaN overrides the minimax
   * evaluation.
   *
   * @param {object} [args]
   * @param {number} [args.horizon=4]
  */
  constructor(args) {
    const { horizon, hook } = args || {};
    super(args);
    this._prop('horizon', horizon, 'number', 4);
  }

  /** MiniMax players cannot be used with simultaneous games.
   *
   * @param {Game} game
   * @returns {boolean}
  */
  canPlay(game) {
    return !game.isSimultaneous;
  }

  /** Every state's evaluation is the minimax value for the given game and
   * role.
   *
   * @param {Game} game
   * @param {string} role
   * @returns {number}
  */
  stateEvaluation(game, role) {
    return this.minimax(game, role, 1);
  }

  /** The `quiescence` method is a stability test for the given game state. If
   * the game is quiescent, this function must return an evaluation. Else it
   * must return `NaN` or an equivalent value.
   *
   * Final game states are always quiescent, and their evaluation is the game's
   * result for the given player. This default implementation also return an
   * heuristic evaluation for every game state at a deeper depth than the
   * player's horizon.
   *
   * @param {Game} game
   * @param {string} role
   * @param {number} [depth=0]
   * @returns {number}
  */
  quiescence(game, role, depth = 0) {
    const { horizon } = this;
    const { result } = game;
    if (result) {
      return result[role];
    }
    if (depth >= horizon) {
      return this.heuristic(game, role);
    }
    return NaN;
  }

  /** The `minimax` method calculates the Minimax evaluation of the given game
   * for the given player. If the game is not finished and the depth is greater
   * than the horizon, `heuristic` is used.
   *
   * @param {Game} game
   * @param {string} role
   * @param {number} [depth=0]
   * @returns {number}
  */
  minimax(game, role, depth = 0) {
    const { activeRole, aleatories } = game;
    if (aleatories) {
      return game.expectedEvaluation( // expectiMinimax
        role,
        (g, r) => this.minimax(g, r, depth + 1),
      );
    }
    let value = this.quiescence(game, role, depth);
    if (Number.isNaN(value)) { // game is not quiescent.
      const actions = this.actionsFor(game, activeRole);
      value = activeRole === role ? -Infinity : +Infinity;
      const comparison = value < 0 ? Math.max : Math.min;
      actions.forEach((action) => {
        const next = game.next({ [activeRole]: action });
        value = comparison(value, this.minimax(next, role, depth + 1));
      });
    }
    return value;
  }

  /** A `solution` calculates the minimax value for every game state derivable
   * from the given `game`. The result is an object with a key for every game
   * state, with a numerical value. The game is assumed to be deterministic.
   *
   * @param {Game} game
   * @param {object} [options]
   * @param {function} [option.gameKey] - A callback that returns a string key
   *   for every game state. The game's string conversion is used by default.
   * @param {Map} [option.evals] - The object in which the solution is stored.
   *   A new Map is used by default.
   * @returns {Map}
  */
  static solution(game, options) {
    const evals = options?.evals ?? new Map();
    const mmPlayer = new this({ horizon: 1e8 });
    const gameKey = options?.gameKey ?? ((g) => `${g}`);
    const oldMinimax = mmPlayer.minimax;
    mmPlayer.minimax = function minimax(gameState, role, depth = 0) {
      const value = oldMinimax.call(this, gameState, role, depth);
      const key = gameKey(gameState);
      if (evals.has(key)) {
        if (evals.get(key) !== value) {
          throw new Error(`Game ${gameState} (key ${
            key}) has different values ${evals.get(key)} and ${value}!`);
        }
      } else {
        evals.set(key, value);
      }
    };
    mmPlayer.minimax(game, game.activeRole, 0);
    return evals;
  }
} // class MiniMaxPlayer.

/** Serialization and materialization using Sermat.
*/
MiniMaxPlayer.defineSERMAT('horizon');

export default MiniMaxPlayer;