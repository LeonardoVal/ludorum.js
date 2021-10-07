import Player from './Player';

/** This is the base type of automatic players based on heuristic evaluations of
 * game states or moves.
 *
 * @class
 * @extends Player
*/
class HeuristicPlayer extends Player {
  /** @inheritdoc */
  static get name() {
    return 'HeuristicPlayer';
  }

  /** The constructor takes the player's `name` and a `random` number generator
   * (`Randomness.DEFAULT` by default). Many heuristic can be based on
   * randomness, but this is also necessary to chose between moves with the same
   * evaluation without any bias.
  */
  constructor(args = null) {
    const { heuristic } = args || {};
    super(args);
    this
      ._prop('heuristic', heuristic, 'function', this.randomHeuristic);
  }

  /** An `HeuristicPlayer` choses the best moves at any given game state. For
   * this purpose it evaluates every move with `actionEvaluation`. By default
   * this function evaluates the states resulting from making each move, which
   * is the most common thing to do.
  */
  async actionEvaluation(action, game, role) {
    const { actions, aleatories, constructor: Game } = game;
    const roleActions = { ...actions, [role]: [action] };
    let sum = 0;
    let count = 0;
    const possibilities = Game.possibilities(roleActions, aleatories);
    for (const { actions: _actions, haps, probability } of possibilities) {
      const nextGame = game.next(_actions, haps);
      sum += (await this.stateEvaluation(nextGame, role)) * probability;
      count += 1;
    }
    return count > 0 ? sum / count : 0; // Average all evaluations.
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

  /** The `randomHeuristic` returns a random number in [-0.5, 0.5). This is only
   * useful in testing. Any serious use should redefine this.
   *
   * @returns {number}
  */
  randomHeuristic() {
    return this.random.random(-0.5, 0.5);
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

  /** Heuristic players work by evaluating the moves of the `role` in the given
   * `game` state. If the game state has aleatories, then all possible scenarios
   * are evaluated and aggregated.
   *
   * @param {Game} - A game state
   * @param {string} - A role in the given game.
   * @yields {Array} - Pairs `[move, evaluation]`.
  */
  async* evaluatedActions(game, role) {
    const { actions } = game;
    const roleActions = actions[role];
    for (const roleAction of roleActions) {
      yield [roleAction, await this.actionEvaluation(roleAction, game, role)];
    }
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
    return this.random.choice(bestMoves);
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

/** Serialization and materialization using Sermat.
*/
HeuristicPlayer.defineSERMAT('heuristic');

export default HeuristicPlayer;
