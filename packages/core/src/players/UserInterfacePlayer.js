import Player from './Player';

/** Player that pauses decision until told what to choose.
 *
 * @class
*/
class UserInterfacePlayer extends Player {
  /** @inheritdoc */
  static get name() {
    return 'UserInterfacePlayer';
  }

  /** TODO */
  constructor(args) {
    const { onDecision } = args || {};
    super(args);
    this
      ._prop('onDecision', onDecision, ['function', undefined]);
    this.actions = null;
  }

  /** @inheritdoc */
  participate(_match, role) {
    this.role = role;
    return this;
  }

  /** If this player is active, this property has the available actions. If not
   * is has `null`.
   *
   * @property {any[]}
  * /
  get actions() {
    return null;
  } */

  /** If the player is active, the choose method should be called to make a
   * decision.
   *
   * @param {any} action - The action to perform in the game.
  */
  choose(_action) {
    throw new Error(`Player ${this} is not active!`);
  }

  /** If this player is active, rejects the decision. If not it just throws an
   * exception.
   *
   * @param {string} message - The message of the error.
   * @throws {Error}
  */
  fail(message) {
    throw new Error(message);
  }

  /** @inheritdoc */
  async decision(game, role) {
    if (role !== this.role) {
      throw Error(`${this.name} participating as ${this.role}, was asked to decide for ${role}!`);
    }
    const reset = () => {
      delete this.actions;
      delete this.choose;
      delete this.fail;
    };
    return new Promise((resolve, reject) => {
      this.actions = game.actions[role];
      this.choose = (action) => {
        reset();
        resolve(action);
      };
      this.fail = (message) => {
        reset();
        reject(new Error(message));
      };
      if (this.onDecision) {
        this.onDecision(this, game, role);
      }
    });
  }
} // class UserInterfacePlayer

export default UserInterfacePlayer;
