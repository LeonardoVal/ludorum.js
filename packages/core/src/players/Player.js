import Randomness from '@creatartis/randomness/Randomness';
import Game from '../games/Game';
import BaseClass from '../utils/BaseClass';

let PLAYER_COUNT = -1; // Used by the Player's default naming.

/** Player is the base type for all playing agents. Basically, playing a game
 * means choosing a move from all available ones, each time the game enables the
 * player to do so.
 *
 * This is an abstract class that is meant to be extended.
 *
 * @class
 */
class Player extends BaseClass {
  /** The default constructor takes its `name` and a pseudo-`random` number
   * generator from the given `params`.
   *
   * @param {object} [args]
   * @param {string} [args.name] - Name for the player.
   * @param {Randomness} [args.random] - Pseudo-random number generator.
  */
  constructor(args = null) {
    const { name, random } = args || {};
    super();
    this
      ._prop('name', `${name || `${this.constructor.name}${PLAYER_COUNT += 1}`}`, 'string')
      ._prop('random', random, Randomness, Randomness.DEFAULT);
  }

  /** A player is asked to choose a move by calling `decision`.
   *
   * @param {Game} [game] - Game state on which to choose an action.
   * @param {string} [role] - Role this player is playing in the given game.
   * @returns {any} A promise that resolves to the selected move.
  */
  async decision(_game, _role) {
    return this._unimplemented('decision');
  }

  /** Not all players can be used to play with all games. Still, by default the
   * result of `canPlay` is `true` for all instances of `Game`.
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
    const { [role]: roleActions } = game.actions || {};
    if (!Array.isArray(roleActions) || roleActions.length < 1) {
      throw new Error(`Role ${role} has no actions for game ${game}.`);
    }
    return roleActions;
  }

  /** TODO
   *
   * @param {Game} game
   * @param {string} role
  */
  * nextsFor(game, role) {
    const actionsFor = this.actionsFor(game, role);
    for (const action of actionsFor) {
      yield game.next({ [role]: action });
    }
  }
} // class Player.

/** Serialization and materialization using Sermat.
*/
BaseClass.addSERMAT(Player, 'name random');

export default Player;
