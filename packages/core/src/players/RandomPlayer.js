import { randomChoice } from '../randomness';
import { Player } from './Player';

/** A RandomPlayer is an automatic player that moves fully randomly.
 *
 * @class
 * @extends Player
 */
export class RandomPlayer extends Player {
  /** The `decision` is made completely at random.
   *
   * @param {Game} [game] - Game state on which to choose an action.
   * @param {string} [role] - Role this player is playing in the given game.
   * @returns {any} A promise that resolves to the selected move.
   */
  async decision(game, role) {
    const actions = this.actionsFor(game, role);
    return randomChoice(this.rng, actions);
  }
} // class RandomPlayer.
