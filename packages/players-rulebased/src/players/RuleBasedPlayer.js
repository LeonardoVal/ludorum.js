import {
  HeuristicPlayer, Game,
} from '@ludorum/core';

/** Automatic players based on rules, either for evaluating game states or to
 * choose moves.
*/
class RuleBasedPlayer extends HeuristicPlayer {
  /** @inheritdoc */
  static get name() {
    return 'MonteCarloPlayer';
  }

  /** The base implementation of this player depends on a set of rules.
   * Optionally a specific function for calculating the game's features can also
   * be used.
   *
   * @param {object} [args]
   * @param {function} [args.features]
   * @param {any[]} [args.rules]
  */
  constructor(args) {
    const {
      features, rules,
    } = args || {};
    super(args);
    this
      ._prop('features', features, [undefined, 'function'])
      ._prop('rules', rules, Array, []);
  }

  /** A game state's features is an array of numbers, preferrably a typed array.
   *
   * @param {Game} game
   * @param {string} role
   * @returns {number[]}
  */
  features(game, _role) {
    return game.features;
  }

  /** Matches a rule againts the given features. The result is either an action
   * or null.
   *
   * @param {any} rule
   * @param {number[]} features
   * @param {Game} game
   * @param {string} role
   * @returns {any} - A game's action.
  */
  match(rule, features, game, role) {
    if (typeof rule === 'function') {
      return rule.call(this, features, game, role);
    }
    const [ruleFeatures, action] = rule;
    const matches = ruleFeatures.every((f, i) => (
      typeof f !== 'number' || Number.isNaN(f) || Math.abs(f - features[i]) < 1e-15
    ));
    // TODO Check action is valid for the game state.
    return matches ? action : null;
  }

  /** To choose a move, the rules are checked in order. The first rule that fits
   * decides the move to make. If no rule fits, a move is chosen randomly. If a
   * rule returns a move that is not valid, it is ignored.
   *
   * @param {Game} game
   * @param {string} role
   * @returns {any}
  */
  decision(game, role) {
    const { random, rules } = this;
    const features = this.features(game, role);
    const actions = this.actionsFor(game, role);
    let result = null;
    for (const rule of rules) {
      result = this.match(rule, features, game, role);
      if (result !== null) {
        return result;
      }
    }
    return random.choice(actions);
  }
} // class RuleBasedPlayer

/** Serialization and materialization using Sermat.
*/
RuleBasedPlayer.defineSERMAT('rules');

export default RuleBasedPlayer;
