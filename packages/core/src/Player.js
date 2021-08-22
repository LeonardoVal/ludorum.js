import { Randomness } from '@creatartis/randomness';
import Match from './Match';
import Game from './Game';
import { cartesianProductObject } from './utils';

let PLAYER_COUNT = -1; // Used by the Player's default naming.

/** Player is the base type for all playing agents. Basically, playing a game
 * means choosing a move from all available ones, each time the game enables the
 * player to do so.
 *
 * This is an abstract class that is meant to be extended.
 */
export default class Player {
  /** Default unique name for players.
   *
   * @returns {string}
   */
  static defaultPlayerName() {
    PLAYER_COUNT += 1;
    return `Player${PLAYER_COUNT}`;
  }

  /** The default constructor takes its `name` and a pseudo-`random` number
   * generator from the given `params`.
   *
   * @param {object} [args]
   * @param {string} [args.name] - Name for the player.
   * @param {Randomness} [args.random] - Pseudo-random number generator.
   */
  constructor(args = null) {
    const { name, random } = args || {};
    this.name = `${name || this.constructor.defaultPlayerName()}`;
    this.random = random || Randomness.DEFAULT;
  }

  /** A player is asked to choose a move by calling `decision`.
   *
   * @param {Game} [game] - Game state on which to choose an action.
   * @param {string} [role] - Role this player is playing in the given game.
   * @returns {any} A promise that resolves to the selected move.
   */
  async decision(game, role) {
    // Indeed not a very thoughtful base implementation.
    return this.actionsFor(game, role)[0];
  }

  /** To help implement the decision, `actionsFor` gets the actions in the game
   * for the role. It also checks if there are any actions, and if it not so an
   * error is risen.
   *
   * @param {Game} [game] - Game state.
   * @param {string} [role] - Role this player is playing in the given game.
   * @returns {any[]} Available moves for the role in the given game state.
   * @throws {Error} If the given role has no available moves.
   */
  actionsFor(game, role) {
    const { [role]: roleActions } = game.actions() || {};
    if (!Array.isArray(roleActions) || roleActions.length < 1) {
      throw new Error(`Role ${role} has no actions for game ${game}.`);
    }
    return roleActions;
  }

  /** Not all players can be used to play with all games. Still, by default the
   * result of `canPlay` is `true`.
   *
   * @param {Game} game - Game state.
   * @returns {boolean} Whether this player can play the `game` or not.
   */
  canPlay(game) {
    return game instanceof Game;
  }

  /** Before starting a match, all players are asked to join by calling
   * `participate`. This allows the player to prepare properly. If this implies
   * building another instance of the player object, it must be returned in
   * order to participate in the match.
   *
   * @param {Match} [match] - The match to play.
   * @param {string} [role] - The role this player will play in the match.
   * @returns {Player} Either this player or a new one.
   */
  participate() {
    return this;
  }

  // Utilities /////////////////////////////////////////////////////////////////

  /** The `playTo` method makes a match for the given `game` where all roles are
   * played by this agent.
   *
   * @param {Game} [game] - Game to play.
   * @returns {Match}
   */
  playTo(game) {
    return new Match(game, game.players.map(() => this));
  }

  /** The `possibleChoices` for all active players in a given `game` is a
   * sequence of objects, with one available action for each active role.
   *
   * @param {Game} [game] - A game state.
   * @yields {object} A map from active roles to actions.
   */
  static* possibleChoices(game) {
    const actions = game.actions();
    yield* cartesianProductObject(actions);
  }

  /** The string representation of the player is like `Player("name")`.
   *
   * @returns {string}
   * @override
   */
  toString() {
    return `${this.constructor.name}(${JSON.stringify(this.name)})`;
  }

  /** Serialization and materialization using Sermat.
  */
  static __SERMAT__ = {
    identifier: 'ludorum.Player',
    serializer: ({ name, random }) => [{ name, random }],
  };
} // class Player.
