import { Player } from './Player';

/** Player that an user interface controls. When it is required to choose an
 * action, the object will have properties `game` and `role` set. The decision
 * must be made by calling the `choose` method.
 *
 * @class
*/
export class UserInterfacePlayer extends Player {
  /** The constructor takes an optional function, to be called every time this
   * agent is asked to choose an action.
   * 
   * @param {object} args
  */
  constructor(args) {
    super(args);
    this.__props({
      onDecision: args?.onDecision,
      spectator: args?.spectator,
    });
    this.currentDecision = null;
  }

// Decision ____________________________________________________________________

  /** If the player is active, the choose method should be called to make a
   * decision.
   *
   * @param {any} action - The action to perform in the game.
  */
  choose(action) {
    const { currentDecision } = this;
    if (!currentDecision) {
      throw new Error(`Player ${this} is not active!`);
    }
    this.currentDecision = null;
    currentDecision.resolve(action);
  }

  /** If this player is active, rejects the decision. If not it just throws an
   * exception.
   *
   * @param {string} message - The message of the error.
   * @throws {Error}
  */
  fail(message) {
    const { currentDecision } = this;
    if (!currentDecision) {
      throw new Error(`Player ${this} is not active!`);
    }
    this.currentDecision = null;
    currentDecision.resolve(message);
  }

  /** @inheritdoc */
  async decision(game, role) {
    if (this.currentDecision) {
      throw Error(`${this.name} has not decided a move yet!`);
    }
    this.onDecision?.({ game, player: this, role });
    const result = new Promise((resolve, reject) => {
      this.currentDecision = {
        game,
        reject(message) {
          this.currentDecision = null;
          reject(new Error(message));
        },
        resolve(action) {
          this.currentDecision = null;
          resolve(action);
        },
        role,
      };
    });
    return result;
  }

} // class UserInterfacePlayer
