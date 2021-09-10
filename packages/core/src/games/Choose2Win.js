import Game from './Game';

const ROLES = ['This', 'That'];
const ACTIONS = { WIN: 'win', LOSE: 'lose', PASS: 'pass' };

/** Choose2Win is a simple silly game. Each turn one of the players can decide
 * to win, to lose or to pass the turn. It is meant to be used only for testing
 * Ludorum, since a game can hardly become less interesting than this.
 *
 * @class
 * @extends Game
*/
class Choose2Win extends Game {
  /** The constructor takes a number of turns for the game to last (`Infinity`
   * by default), the active player and the winner if the game has ended.
  */
  constructor(args) {
    const { activeRole = 0, turns, winner = null } = args || {};
    super({ activeRoles: [activeRole] });
    this
      ._prop('turns', Number.isNaN(+turns) ? Infinity : +turns, 'number', Infinity)
      ._prop('winner', winner, ROLES.includes(winner) || winner === null);
  }

  /** Players of this dummy game are labeled This and That.
  */
  get roles() {
    return [...ROLES];
  }

  /** Every turn the active player's moves are: `'win'`, `'lose'` and `'pass'`.
  */
  get actions() {
    if (!this.winner && this.turns > 0) {
      return { [this.activeRole]: Object.values(ACTIONS) };
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
  perform(actions) {
    const { activeRole } = this;
    const opponent = this.opponent(activeRole);
    const action = actions[activeRole];
    switch (action) {
      case ACTIONS.WIN: this.winner = activeRole; break;
      case ACTIONS.LOSE: this.winner = opponent; break;
      case ACTIONS.PASS: break; // do nothing
      default: throw new Error(`Invalid action ${action} for role ${activeRole} at ${this}!`);
    }
    this.activateRoles(opponent);
    this.turns -= 1;
  }

  /** Serialization and materialization using Sermat.
  */
  static __SERMAT__ = {
    identifier: 'ludorum.Choose2Win',
    serializer({ turns, activeRole, winner }) {
      return [{ turns, activeRole, winner }];
    },
    materializer(_obj, args) {
      return args && (new Choose2Win(...args));
    },
  };
} // class Choose2Win.

export default Choose2Win;
