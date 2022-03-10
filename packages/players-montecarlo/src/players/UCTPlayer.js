import { Game, iterables } from '@ludorum/core';
import MonteCarloPlayer from './MonteCarloPlayer';

const { bests } = iterables;

const UCT_INIT_DATA = { rewards: 0, visits: 1 };

/** Automatic player based on Upper Confidence Bound Monte Carlo tree search.
*/
class UCTPlayer extends MonteCarloPlayer {
  /** @inheritdoc */
  static get name() {
    return 'UCTPlayer';
  }

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

  // Search tree _______________________________________________________________

  /** Build the root node for a search tree starting with the given `state` for
   * the given `role`. The second level is also created with the role's actions,
   * and the third level is created with the next game states.
   *
   * @param {Game} game
   * @param {string} role
   * @returns {object}
  */
  searchTreeRoot(game, role) {
    const root = {
      ...UCT_INIT_DATA,
      state: game,
      children: [...this.transitionsByRoleAction(game, role)]
        .map(({ roleAction, transitions }) => ({
          ...UCT_INIT_DATA,
          state: game,
          roleAction,
          children: transitions.map(({ next, probability }) => ({
            ...UCT_INIT_DATA,
            state: next,
            probability,
          })),
        })),
    };
    return root;
  }

  /** Builds a path from the root node to the next node from which to perform a
   * simulation. Returns an array from the most deep node to the root. If a not
   * fully expanded node is found, a new transition will be followed.
   *
   * @param {object} root
   * @returns {object[]}
  */
  treePolicy(root) {
    const { random } = this;
    const spine = [root];
    for (let node = root; !node.state.isFinished;) {
      const notExpanded = node.children.filter((child) => !child.children);
      if (notExpanded.length > 0) { // Expand a random node.
        const child = random.choice(notExpanded);
        child.children = [...Game.possibleNexts(node.state)]
          .map(({ next, probability }) => ({
            state: next,
            probability,
            ...UCT_INIT_DATA,
          }));
        spine.unshift(child);
        break;
      }
      node = random.choice(
        bests(node.children, (child) => this.nodeEval(child, node)),
      );
      spine.unshift(node);
    }
    return spine;
  }

  /** Evaluate a search tree `node` according to the [Upper Confidence Bound
   * formula by L. Kocsis and Cs. Szepesvári](http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.102.1296).
   *
   * @param {object} node
   * @param {object} parent
   * @returns {number}
  */
  nodeEval(node, parent) {
    const { explorationConstant, random } = this;
    const { visits: parentVisits } = parent;
    const { visits, rewards } = node;
    return rewards / visits + explorationConstant
      * Math.sqrt(Math.log(parentVisits) / visits);
  }

  /** @inheritdoc
  */
  async* evaluatedActions(game, role) {
    const startTime = Date.now();
    const root = this.searchTreeRoot(game, role);
    for (let i = 0; !this.endActionEvaluation(i, startTime, root); i += 1) {
      // Selection
      const spine = this.treePolicy(root);
      const { result } = this.simulation(spine[0].state, role); // Simulation
      spine.forEach((node) => {
        node.visits += 1;
        node.rewards += result;
      });
    }
    for (const child of root.children) {
      yield [child.roleAction, this.nodeEval(child, root)];
    }
  }
} // class UCTPlayer

/** Serialization and materialization using Sermat.
*/
UCTPlayer.defineSERMAT('explorationConstant');

export default UCTPlayer;
