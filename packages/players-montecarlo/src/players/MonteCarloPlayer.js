import Player from '@ludorum/core/players/Player';
import GameTree from '@ludorum/core/utils/GameTree';
import HeuristicPlayer from '@ludorum/core/players/HeuristicPlayer';

/** Automatic player based on flat Monte Carlo tree search.
*/
class MonteCarloPlayer extends HeuristicPlayer {
  /** The constructor builds a player that chooses its moves using the
   * [flat Monte Carlo game tree search method](http://en.wikipedia.org/wiki/Monte-Carlo_tree_search).
   *
   * @param {object} [args]
   * @param {number} [args.horizon=500] - Maximum amount of moves performed in
   *   simulations.
   * @param {number} [args.simulationCount=30] - Maximum amount of simulations
   *   performed for each available move at each decision.
   * @param {number} [args.timeCap=1000ms] - Time limit for the player to decide.
   * + `agent`: Player instance used in the simulations. If undefined moves are
   *   chosen at random. Agents with asynchronous decisions are not supported.
  */
  constructor(args) {
    const {
      agent, horizon, simulationCount, timeCap,
    } = args || {};
    super(args);
    this
      ._prop('horizon', horizon, 'number', 500)
      ._prop('simulationCount', simulationCount, 'number', 30)
      ._prop('timeCap', timeCap, 'number', 1000)
      ._prop('agent', agent, Player, undefined);
  }

  /** @inheritdoc
  */
  async* evaluatedActions(game, role) {
    const startTime = Date.now();
    const options = [
      ...this.transitionsByRoleAction(game, role, { simSum: 0, simDiv: 0 }),
    ];
    for (let i = 0; !this.endActionEvaluation(i, startTime, options);) {
      for (const option of options) {
        for (const transition of option.transitions) {
          const { next, probability } = transition;
          const result = await this.stateEvaluation(next, role);
          option.simSum += result * probability;
          option.simDiv += probability;
          i += 1;
        }
      }
    }
    for (const { roleAction, simDiv, simSum } of options) {
      if (Number.isNaN(simSum)) {
        throw new Error(`State evaluation is NaN for action ${roleAction}!`);
      }
      yield [roleAction, simDiv > 0 ? simSum / simDiv : 0];
    }
  }

  /** The move evaluation can be finished on many criteria. By default,
   * `simulationCount` and `timeCap` are considered.
   *
   * @param {number} simCount
   * @param {number} startTime
   * @param {object} [data=null]
   * @returns {boolean}
  */
  endActionEvaluation(simCount, startTime, data = null) {
    const { simulationCount, timeCap } = this;
    return simCount > simulationCount || startTime + timeCap < Date.now();
  }

  /** This player's `stateEvaluation(game, player)` runs only one simulation and
   * returns the its result.
   *
   * @param {Game} game
   * @param {string} role
   * @returns {number}
  */
  async stateEvaluation(game, role) {
    const { result } = game;
    if (result) {
      return result[role];
    }
    const { result: simResult } = this.simulation(game, role);
    return simResult;
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
  quiescence(game, role, depth) {
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

  /** A `simulation` plays a random match from the given `game` state and
   * returns an object with the final state (`game`), its result (`result`) and
   * the number of plies simulated (`plies`).
   *
   * @param {Game} game
   * @param {string} role
  */
  simulation(game, role) {
    game = game.clone();
    let plies = 0;
    let value = this.quiescence(game, role, plies + 1);
    for (; Number.isNaN(value); plies += 1) {
      const { actions, haps } = GameTree.randomTransition(this.random, game);
      game.perform(actions, haps);
      value = this.quiescence(game, role, plies + 1);
    }
    return { game, plies, result: value };
  }
} // class MonteCarloPlayer

/** Serialization and materialization using Sermat.
*/
MonteCarloPlayer.defineSERMAT('agent horizon simulationCount timeCap');

export default MonteCarloPlayer;
