import Player from './Player';
import Match from '../Match';
import RandomPlayer from './RandomPlayer';

/** Abstract base class for players that deal with a user interface.
 *
 * @class
*/
class UserInterfacePlayer extends Player {
  /** @inheritdoc */
  static get name() {
    return 'UserInterfacePlayer';
  }

  /** Renders the UI at the beginning of a match.
   *
   * @param {Game} game
   * @param {object} players
  */
  renderBeginning() {
    return this._unimplemented('renderBeginning');
  }

  /** Renders the UI when the player has to make a choice. The callback has to
   * be call when the player selects an action.
   *
   * @param {Game} game
   * @param {function} chooseCallback
   */
  renderChoices() {
    return this._unimplemented('renderChoices');
  }

  /** Renders the UI when a move is performed, either this player's or other's.
   *
   * @param {Game} gameBefore
   * @param {object} actions
   * @param {object} haps
   * @param {Game} gameAfter
   */
  renderMovePerformed() {
    return this._unimplemented('renderMovePerformed');
  }

  /** Renders the UI when the match has finished.
   *
   * @param {Game} game
   * @param {object} results
   */
  renderEnd() {
    return this._unimplemented('renderEnd');
  }

  /** Builds an spectator object compatible with Match.
   *
   * @returns {object}
  */
  spectator() {
    const uiPlayer = this;
    return {
      begin(game, players) {
        return uiPlayer.renderBeginning(game, players);
      },
      next(gameBefore, actions, haps, gameAfter) {
        return uiPlayer.renderMovePerformed(gameBefore, actions, haps, gameAfter);
      },
      end(game, results) {
        return uiPlayer.renderEnd(game, results);
      },
    };
  }

  /** @inheritdoc */
  participate(match, role) {
    this.role = role;
    match.spectate(this.spectator());
    return this;
  }

  /** @inheritdoc */
  async decision(game, role) {
    if (role !== this.role) {
      throw Error(`${this.name} participating as ${this.role}, was asked to decide for ${role}!`);
    }
    return new Promise((resolve, reject) => {
      try {
        const callback = (action) => resolve(action);
        this.renderChoices(game, callback);
      } catch (error) {
        reject(error);
      }
    });
  }

  // Utility functions _________________________________________________________

  /** Shortcut for creating a match for a game with this player in the given
   * role.
   *
   * @param {Game} game - The game to play.
   * @param {string} role - The role for this player.
   * @param {function} playerBuilder - Builds an opponent `Player`.
   * @returns {object[]} - The complete result of the match.
  */
  async playAgainst(game, role, playerBuilder) {
    const players = game.roles.map(
      (r) => (r === role ? this : playerBuilder(r)),
    );
    const match = new Match({ game, players });
    return match.complete();
  }

  /** Shortcut for creating a match for a game with this player in the given
   * role, against random players.
   *
   * @param {Game} game - The game to play.
   * @param {string} role - The role for this player.
   * @returns {object[]} - The complete result of the match.
  */
  async playAgainstRandoms(game, role) {
    return this.playAgainst(game, role, () => new RandomPlayer());
  }
} // class UserInterfacePlayer

export default UserInterfacePlayer;
