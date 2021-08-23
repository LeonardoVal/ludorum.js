import Player from './Player';

/** A RandomPlayer is an automatic player that moves fully randomly.
 */
export default class RandomPlayer extends Player {
  /** The `decision` is made completely at random.
   *
   * @param {Game} [game] - Game state on which to choose an action.
   * @param {string} [role] - Role this player is playing in the given game.
   * @returns {any} A promise that resolves to the selected move.
   */
  async decision(game, role) {
    const actions = this.actionsFor(game, role);
    return this.random.choice(actions);
  }

  static __SERMAT__ = {
    identifier: 'ludorum.RandomPlayer',
    serializer: Player.__SERMAT__.serializer,
  };
} // class RandomPlayer.
