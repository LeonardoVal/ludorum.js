import { players } from '@ludorum/core';

const { HeuristicPlayer } = players;

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
  */
  constructor(args) {
    super(args);
    this._prop('horizon', args?.horizon, 'number', 4);
    this._prop('hook', args?.hook, 'function', undefined);
  }

  /** MiniMax players cannot be used with simultaneous games.
  */
  canPlay(game) {
    return !game.isSimultaneous;
  }

  /** Every state's evaluation is the minimax value for the given game and
   * role.
  */
  stateEvaluation(game, role) {
    return this.minimax(game, role, 1);
  }

  /** The `quiescence(game, player, depth)` method is a stability test for the
   * given game state. If the game is quiescent, this function must return an
   * evaluation. Else it must return `NaN` or an equivalent value.
   *
   * Final game states are always quiescent, and their evaluation is the game's
   * result for the given player. This default implementation also return an
   * heuristic evaluation for every game state at a deeper depth than the
   * player's horizon.
  */
  quiescence(game, role, depth) {
    const { horizon, result } = this;
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
  */
  minimax(game, role, depth) {
    const {
      activeRole, aleatories,
    } = game;
    if (aleatories) {
      return this.expectiMinimax(game, role, depth);
    }
    let value = this.quiescence(game, role, depth);
    if (Number.isNaN(value)) { // game is not quiescent.
      const actions = this.actionsFor(game, activeRole);
      if (actions.length < 1) {
        throw new Error(`No moves for unfinished game ${game}.`);
      }
      value = activeRole === role ? -Infinity : +Infinity;
      const comparison = value < 0 ? Math.max : Math.min;
      actions.forEach((action) => {
        const next = game.next({ [activeRole]: action });
        value = comparison(value, this.minimax(next, role, depth + 1));
      });
    }
    this?.hook(game, value); // Call hook if present.
    return value;
  }

  /** The `expectiMinimax` method is used when calculating the minimax value of
   * a contingent game state. Basically returns the sum of all the minimax
   * values weighted by the probability of each possible next state.
  */
  expectiMinimax(game, role, depth) {
    if (!game.isContingent) {
      return this.minimax(game, role, depth);
    }
    return game.expectedEvaluation(role, (g, r) => this.minimax(g, r, depth + 1));
  }

  // Utilities

  /** A `solution` calculates the minimax value for every game state derivable
   * from the given `game`. The result is an object with a key for every game
   * state, with a numerical value. The game is assumed to be deterministic.
   *
   * The optional `options` argument can have:

  + `gameKey`: A function that returns a string key for every game state. The game `toString`
  method is used by default.

  + `evals`: The object in which the solution is stored. A new object is used by default.
  */
  static solution(game, options) {
    const evals = options?.evals ?? new Map();
    const mmPlayer = new this({ horizon: 1e8 });
    const gameKey = options?.gameKey ?? ((g) => g.toString());
    mmPlayer.minimax(game, game.activeRole, 0, {
      // eslint-disable-next-line no-shadow
      hook(game, value) {
        const k = gameKey(game);
        if (evals.has(k)) {
          if (evals.get(k) !== value) {
            throw new Error(`Game ${game} (key ${k}) has different values ${
              evals.get(k)} and ${value}!`);
          }
        } else {
          evals.set(k, value);
        }
      },
    });
    return evals;
  }

  /** Serialization and materialization using Sermat.
  */
  static __SERMAT__ = {
    identifier: 'MiniMaxPlayer',
    serializer(obj) {
      const [args] = HeuristicPlayer.__SERMAT__.serializer(obj);
      args.horizon = obj.horizon;
      return [args];
    },
  };
} // declare MiniMaxPlayer.

/** Serialization and materialization using Sermat.
*/
HeuristicPlayer.addSERMAT(MiniMaxPlayer, 'horizon');

export default MiniMaxPlayer;
