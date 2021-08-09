import { Randomness } from '@creatartis/randomness';
import { Match } from './Match';

/** Player is the base type for all playing agents. Basically, playing a game
 * means choosing a move from all available ones, each time the game enables the
 * player to do so.
 *
 * This is an abstract class that is meant to be extended.
 */
export class Player {
  /** The default constructor takes its `name` and a pseudo-`random` number
   * generator from the given `params`.
   *
   * @param {object} [args]
   * @param {string} [args.name] - Name for the player.
   * @param {Randomness} [args.random] - Pseudo-random number generator.
   */
  constructor(args = null) {
    args = args || {};
    this.name = `${args.name || defaultPlayerName()}`;
    this.random = args.random || Randomness.DEFAULT;
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
  canPlay() {
    return true;
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

  /** Serialization and materialization using Sermat.
   *
   * @property {identifier} [string]
   * @property {serializer} [function]
   */
  static __SERMAT__ = {
    identifier: 'Player',
    serializer: ({ name, random }) => [{ name, random }],
  }

  /** The string representation of the player is like `Player("name")`.
   *
   * @returns {string}
   * @override
   */
  toString() {
    return `Player(${JSON.stringify(this.name)})`;
  }
} // class Player.

/** Default unique name for players.
 *
 * @returns {string}
 */
export const defaultPlayerName = (() => {
  let PLAYER_COUNT = 0; // Used by the Player's default naming.
  // eslint-disable-next-line no-plusplus
  return () => `Player${PLAYER_COUNT++}`;
})();

/** The `possibleChoices` for all active players in a given `game` is a
 * sequence of objects, with one available action for each active role.
 *
 * @param {Game} [game] - A game state.
 * @yields {object} A map from active roles to actions.
 */
export const possibleChoices = (() => {
  function* combinations(entries) {
    if (entries.length < 1) {
      yield {};
    } else if (entries.length === 1) {
      const [[key, values]] = entries;
      for (const value of values) {
        yield { [key]: value };
      }
    } else {
      const [[key, values], ...rest] = entries;
      for (const value of values) {
        for (const restObj of combinations(rest)) {
          yield { ...restObj, [key]: value };
        }
      }
    }
  }

  return (game) => {
    const actions = game.actions();
    return combinations(Object.entries(actions));
  };
})();

export default {
  Player,
  defaultPlayerName,
  possibleChoices,
};
