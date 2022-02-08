/* eslint-disable */

import GameTree from '@ludorum/core/utils/GameTree';
import MonteCarloPlayer from './MonteCarloPlayer';

/** Automatic player based on Upper Confidence Bound Monte Carlo tree search.
*/
class UCTPlayer extends MonteCarloPlayer {
  /** The constructor builds a MonteCarlo Tree Search player that chooses its
   * moves using the Upper Confidence Bound method.
   *
   * @param {object} [args]
   * @param {number} [args.explorationConstant=√2] - The exploration factor used
   *   in the UCT selection.
  */
  constructor(args) {
    const {
      explorationConstant,
    } = args || {};
    super(args);
    this
      ._prop('explorationConstant', explorationConstant, 'number', Math.sqrt(2));
  }

  /** Evaluate all child nodes of the given `node` according to the [Upper Confidence Bound
  formula by L. Kocsis and Cs. Szepesvári](http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.102.1296).
  Returns one of the greatest evaluated, chosen at random.
  */
  selectNode(parent, totalSimulationCount, explorationConstant) {
    explorationConstant = isNaN(explorationConstant) ? this.explorationConstant : +explorationConstant;
    var EPSILON = 1e-10,
      bestChildren = iterable(parent.children()).greater(function (node) {
        if (!node.uct) { // Node has not been expanded.
          node.uct = { visits: 0, wins: 0, rewards: 0 };
        }
        var visits = node.uct.visits,
          result = node.uct.wins / (visits + EPSILON) + explorationConstant *
            Math.sqrt(Math.log(parent.uct.visits + 1) / (visits + EPSILON));
        return result;
      });
    return this.random.choice(bestChildren);
  }

  /** @inheritdoc
  */
  async* evaluatedActions(game, role) {
    const root = new GameTree({
      state: game,
      data: { visits: 0, wins: 0, rewards: 0 },
    });
    const startTime = Date.now();
    for (var i = 0;  !this.__finishMoveEvaluation__(i, startTime, root); i++) {
      node = root;
      while (node.__children__ && node.__children__.length > 0) { // Selection
        node = this.selectNode(node, i+1, this.explorationConstant);
      }
      if (!node.state) {
        node.expand();
      }
      simulationResult = this.simulation(node.state, player); // Simulation
      for (; node; node = node.parent) { // Backpropagation
        node.uct.visits++;
        if (simulationResult.result > 0) {
          node.uct.wins++;
        }
        node.uct.rewards += game.normalizedResult(simulationResult.result);
      }
    }
    var result = iterable(root.children()).map(function (n) {
      if (!n.uct) console.log(n);//FIXME
      var visits = n.uct.visits;
      return n.uct ?
        [n.transition, n.uct.rewards / (visits + 1e-10), visits] :
        [n.transition, 0, 0];
    }).toArray();
    //console.log(result);//FIXME
    return result;
  }
} // class UCTPlayer

/** Serialization and materialization using Sermat.
*/
UCTPlayer.defineSERMAT('explorationConstant');

export default UCTPlayer;