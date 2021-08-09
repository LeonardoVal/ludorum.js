import { Player, possibleChoices } from '../Player';

/** This is the base type of automatic players based on heuristic evaluations of
 * game states or moves.
 */
export class HeuristicPlayer extends Player {
  /** The constructor takes the player's `name` and a `random` number generator.
   * Many heuristic can be based on randomness, but this is also necessary to
   * choose between moves with the same evaluation without any bias.
   *
   * @param {object} [args]
   * @param {string} [args.name] - Name for the player.
   * @param {Randomness} [args.random] - Pseudo-random number generator.
   * @param {function} [args.heuristic] - Heuristic game state evaluation
   *   function.
   */
  constructor(args = null) {
    super(args);
    const { heuristic } = args || {};
    if (heuristic) {
      this.heuristic = heuristic;
    }
  }

  /** The `decision` selects randomly from the best evaluated moves.
   *
   * @param {Game} [game] - Game state on which to choose an action.
   * @param {string} [role] - Role this player is playing in the given game.
   * @returns {any} A promise that resolves to the selected move.
   */
  async decision(game, role) {
    const evaluatedActions = await this.evaluatedActions(game, role);
    const bests = bestActions(evaluatedActions);
    if (!bests || !bests.length) {
      throw new Error(`No moves where selected at ${game} for player ${role}!`);
    }
    return this.random.choice(bests)[role];
  }

  /** The `heuristic` is an evaluation used at states that are not finished
   * games. The default implementation returns a random number in [-0.5, 0.5).
   * This is only useful in testing. Any serious use should redefine this.
   *
   * @param {Game} [game] - A game state.
   * @param {string} [role] - A role to play in the given `game`.
   * @returns {number}
   */
  heuristic() {
    return this.random.random(-0.5, 0.5);
  }

  /** Heuristic players work by evaluating all actions available to the `role`
   * in the given `game` state.
   *
   * @param {Game} [game] - A game state.
   * @param {string} [role] - A role to play in the given `game`.
   * @returns {Array} An array of `[action, evaluation]` pairs.
   */
  async evaluatedActions(game, role) {
    if (game.isContingent) {
      throw new Error('Contingent game state has no moves!');
    }
    // Every action is evaluated using `actionEvaluation`.
    const evaluations = new Map();
    for (const choices of possibleChoices(game)) {
      const roleAction = choices[role];
      if (roleAction === undefined) {
        throw new Error(`Role ${role} has no actions for game ${game}.`);
      }
      // eslint-disable-next-line no-await-in-loop
      const evaluation = await this.actionsEvaluation(game, roleAction, role);
      evaluations.set(roleAction,
        (evaluations.get(roleAction) || 0) + evaluation);
    }
    return [...evaluations];
  }

  /** An `HeuristicPlayer` choses the best moves at any given game state. For
   * this purpose it evaluates every move with `actionEvaluation`. By default
   * this function evaluates the states resulting from making each move, which
   * is the most common thing to do.
   *
   * @param {Game} [game] - A game state.
   * @param {string} [role] - A role in the given `game`.
   * @param {object} [actions] - An object with one valid action for each active
   *   the given `game` and `role`.
   */
  async actionsEvaluation(game, role, actions) {
    return this.stateEvaluation(game.next(actions), role);
  }

  /** The `stateEvaluation` calculates a number as the assessment of the given
   * game state for the given player. The base implementation returns the result
   * for the player is the game has results, else it returns the heuristic value
   * for the state.
   *
   * Heuristics cannot be applied to contingent game states. Hence all posible
   * haps are explored, and when a non-contingent game state is reached the
   * heuristic is called.
   *
   * @param {Game} [game] - A game state.
   * @param {string} [role] - A role to play in the given `game`.
   * @returns {number}
   */
  async stateEvaluation(game, role) {
    if (!game.isContingent) {
      const gameResult = game.result();
      return gameResult ? gameResult[role] : this.heuristic(game, role);
    }
    return (await Promise.all(game.nexts().map(async ([prob, nextGame]) => {
      const nextEval = await this.stateEvaluation(nextGame, role);
      return [prob, nextEval];
    }))).reduce((evaluation, [prob, nextEval]) => evaluation + prob * nextEval, 0);
  }

  // Utilities /////////////////////////////////////////////////////////////////

  /** Serialization and materialization using Sermat.
  */
  static __SERMAT__ = {
    identifier: 'HeuristicPlayer',
    serializer(obj) {
      return {
        ...Player.__SERMAT__.serializer(obj),
        heuristic: obj.heuristic,
      };
    },
  }
} // class HeuristicPlayer

/** The `expectedEvaluation` method explores al possible resulting game states
 * from this contingent state and applies an evaluation function. This state
 * evaluation function must have the signature `stateEvaluation`. Asynchronous
 * evaluations are supported, in which case a `Future` will be returned.
 *
 * By default the aggregated result is the sum of the evaluations weighted by
 * the probability of each possible resulting game state. The `aggregation`
 * function may be specified to override this behaviour and process the results
 * in another way. If given, it will be called with an array of triples
 * `[haps, probability, evaluation]`.
 */
export async function expectedEvaluation(game, role) {
  const evaluations = await Promise.all(game.possibleHaps()
    .map(async ([haps, prob]) => {
      const nextGame = game.next(haps);
      if (nextGame.isContingent) {
        return (await this.expectedEvaluation(game, role)) * prob;
      }
      return (await this.stateEvaluation(nextGame, role)) * prob;
    }));
  return evaluations.reduce((s, n) => s + n, 0);
}

/** The `bestActions` are all the best evaluated in the given sequence of tuples
 * `[move, evaluation]`.
 *
 * @param {Array} [evaluatedActions]
 * @returns {Array}
 */
export function bestActions(evaluatedActions) {
  let maxEval = -Infinity;
  let best = [];
  for (const [action, evaluation] of evaluatedActions) {
    if (maxEval < evaluation) {
      maxEval = evaluation;
      best = [action];
    } else if (maxEval === evaluation) {
      best.push(action);
    }
  }
  return best;
}


export default {
  HeuristicPlayer,
  bestActions,
};
