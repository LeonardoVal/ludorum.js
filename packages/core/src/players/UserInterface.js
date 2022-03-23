/* eslint-disable max-classes-per-file */
import { Randomness } from '@creatartis/randomness';
import Player from './Player';
import Match from '../Match';
import RandomPlayer from './RandomPlayer';
import BaseClass from '../utils/BaseClass';

class UserInterface extends BaseClass {
  /** @inheritdoc */
  static get name() {
    return 'UserInterfacePlayer';
  }

  /** TODO */
  constructor(args) {
    const { random } = args || {};
    super();
    this
      ._prop('random', random, Randomness, Randomness.DEFAULT);
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
   * @param {string} role
   * @param {function} choose
   * @param {function} fail
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
    const ui = this;
    return {
      begin(game, players) {
        return ui.renderBeginning(game, players);
      },
      next(gameBefore, actions, haps, gameAfter) {
        return ui.renderMovePerformed(gameBefore, actions, haps, gameAfter);
      },
      end(game, results) {
        return ui.renderEnd(game, results);
      },
    };
  }

  /** TODO */
  bind(match) {
    if (!this.match) {
      this._prop('match', match, Match);
      match.spectate(this.spectator());
    } else if (this.match !== match) {
      throw new Error('User interface is already bound!');
    }
  }

  /** TODO */
  static get Player() {
    // eslint-disable-next-line no-use-before-define
    return UserInterfacePlayer;
  }

  /** TODO */
  player(args) {
    return new this.constructor.Player({ ui: this, ...args });
  }
} // class UserInterface

/** Abstract base class for players that deal with a user interface.
 *
 * @class
*/
class UserInterfacePlayer extends Player {
  /** @inheritdoc */
  static get name() {
    return 'UserInterfacePlayer';
  }

  constructor(args) {
    const { ui } = args || {};
    super(args);
    this
      ._prop('ui', ui, UserInterface);
  }

  /** @inheritdoc */
  participate(match, role) {
    this.role = role;
    this.ui.bind(match);
    return this;
  }

  /** @inheritdoc */
  async decision(game, role) {
    if (role !== this.role) {
      throw Error(`${this.name} participating as ${this.role}, was asked to decide for ${role}!`);
    }
    return new Promise((resolve, reject) => {
      try {
        this.ui.renderChoices(game, role, resolve, reject);
      } catch (error) {
        reject(error);
      }
    });
  }
} // class UserInterfacePlayer

export default UserInterface;
