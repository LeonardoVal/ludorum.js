import Game from '../Game';

const PLAYERS = [Symbol('This'), Symbol('That')];
const ACTIONS = ['win', 'lose', 'pass'];

/** # Choose2Win
 *
 * Choose2Win is a simple silly game. Each turn one of the players can decide to
 * win, to lose or to pass the turn. It is meant to be used only for testing
 * Ludorum, since a game can hardly become less interesting than this.
*/
export default class Choose2Win extends Game {
  /** The constructor takes a number of turns for the game to last (`Infinity`
   * by default), the active player and the winner if the game has ended.
  */
  constructor({ turns, activeRole, winner }) {
    super({ activeRoles: [activeRole] });
    this.turns = Number.isNaN(turns) ? Infinity : +turns;
    this.winner = winner;
  }

  /** Players of this dummy game are labeled This and That.
  */
  get roles() {
    return PLAYERS;
  }

  /** Every turn the active player's moves are: `'win'`, `'lose'` and `'pass'`.
  */
  get actions() {
    if (!this.winner && this.turns > 0) {
      return { [this.activeRole]: ACTIONS };
    }
    return null;
  }

  /** Victory is for whom chooses to win first. Defeat is for whom chooses to
   * lose first. A draw only results when the limit of turns (if any) is met.
  */
  get result() {
    if (this.winner) {
      return this.victory(this.winner);
    }
    if (this.turns < 1) {
      return this.draw();
    }
    return null;
  }

  /** If a player moves to win or lose, a final game state is returned. Else the
   * game goes on.
  */
  apply(actions) {
    const activeRole = this.activeRole();
    const opponent = this.opponent(activeRole);
    const action = actions[activeRole];
    switch (action) {
      case 'win': this.winner = activeRole; break;
      case 'lose': this.winner = opponent; break;
      case 'pass': break; // do nothing
      default: throw new Error(`Invalid action ${action} for role ${activeRole} at ${this}!`);
    }
    this.activateRoles(opponent);
    this.turns -= 1;
  }

  /** Serialization and materialization using Sermat.
  */
  static __SERMAT__ = {
    identifier: 'Choose2Win',
    serializer: (turns, activePlayer, winner) => (
      [{ turns, activePlayer, winner }]
    ),
  };
} // class Choose2Win.
