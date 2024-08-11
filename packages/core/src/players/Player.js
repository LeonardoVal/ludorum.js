import { defProps } from '../utils';

let PLAYER_COUNT = 0; // Used by the Player's default naming.

/** Player is the base type for all playing agents. Basically, playing a game
 * means choosing a move from all available ones, each time the game enables the
 * player to do so.
 *
 * This is an abstract class that is meant to be extended.
 *
 * @class
*/
export class Player {
  /** The default constructor takes its `name` and a pseudo-`random` number
   * generator from the given `params`.
   *
   * @param {object} [args]
   * @param {string} [args.name] - Name for the player.
   * @param {function} [args.rng] - Pseudo-random number generator.
   * @param {function} [args.update] - Function to respond to a game advancing,
   *   with the signature `(game, role, actions, haps) => Promise<void>`.
  */
  constructor(args) {
    defProps(this, {
      name: `${args?.name ?? `${this.constructor.name}${PLAYER_COUNT++}`}`,
      rng: args?.rng ?? Math.random,
      update: args?.update ?? null,
    });
  }

  /** Before starting a match, all players are asked to join by calling
   * `participate`. This allows the player to prepare properly. If this implies
   * building another instance of the player object, it must be returned in
   * order to participate in the match.
   *
   * @param {Game} [game] - The game to play.
   * @param {string} [role] - The role this player will play in the match.
   * @returns {Player} Either this player or a new one.
  */
  participate(_game, _role) {
    return this;
  }

  /** Participates the given `players` to a match of the given `game`.
   *
   * @param {Game} game
   * @param {Player[] | Record<string, Player>} players
   * @returns {Record<string, Player>}
   * @throws {Error} Fails a role of the game has no corresponding player.
  */
  static participants(game, players) {
    const { roles } = game;
    if (Array.isArray(players)) {
      players = players.reduce((ps, p, i) => {
        ps[roles[i]] = p;
        return ps;
      }, {});
    }
    if (!roles.every((r) => players[r])) {
      throw new TypeError(`Missing players for match of ${game.name}!`);
    }
    return roles.reduce((ps, role) => {
      ps[role] = players[role].participate(game, role);
      return ps;
    }, {});
  }

  /** A player is asked to choose a move by calling `decision`.
   *
   * @param {Game} game - Game state on which to choose an action.
   * @param {string} role - Role this player is playing in the given game.
   * @returns {unknown} A promise that resolves to the selected move.
  */
  async decision(_game, _role) {
    throw new Error(`${this.constructor.name}.decision() is not defined!`);
  }

// Utilities ___________________________________________________________________

  /** To help implement the decision, `actionsFor` gets the actions in the game
   * for the role. It also checks if there are any actions, and if it not so an
   * error is risen.
   *
   * @param {Game} [game] - Game state.
   * @param {string} [role] - Role this player is playing in the given game.
   * @returns {unknown[]} Available moves for the role in the given game state.
   * @throws {Error} If the given role has no available moves.
  */
  actionsFor(game, role) {
    const { [role]: roleActions } = game.actions;
    if (!Array.isArray(roleActions) || roleActions.length < 1) {
      throw new Error(`Role ${role} has no actions for game ${game}.`);
    }
    return roleActions;
  }

  /** Ask all players in active roles for a decision, i.e. to chose one of the
   * available actions for the game.
   *
   * @param {Game} game
   * @param {Record<string, Player>} players
   * @returns {Record<string, unknown>} The actions chosen by the players.
   * @throws {Error} Fails if a player is missing for one active role.
  */
  static async decisions(game, players) {
    const { actions } = game;
    return Object.fromEntries(await Promise.all(Object.entries(actions)
      .filter(([, roleActions]) => roleActions && roleActions.length > 0)
      .map(async ([role]) => {
        const player = players[role];
        return [role, await player.decision(game.view(role), role)];
      }),
    ));
  }

} // class Player.
