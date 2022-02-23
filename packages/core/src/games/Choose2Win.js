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
  /** @inheritdoc */
  static get name() {
    return 'Choose2Win';
  }

  /** The constructor takes a number of turns for the game to last (`Infinity`
   * by default), the active player and the winner if the game has ended.
   *
   * @param {object} [args]
   * @param {string} [args.activeRole=0]
   * @param {number} [args.turns=+Infinity]
   * @param {string} [args.winner=null]
  */
  constructor(args = null) {
    const { activeRole = 0, turns, winner = null } = args || {};
    super({ activeRoles: [activeRole] });
    this
      ._prop('turns', Number.isNaN(+turns) ? Infinity : +turns, 'number', Infinity)
      ._prop('winner', winner, ROLES.includes(winner) || winner === null);
  }

  /** Players of this dummy game are labeled This and That.
   *
   * @property {string[]}
  */
  get roles() {
    return [...ROLES];
  }

  /** Every turn the active player's moves are: `'win'`, `'lose'` and `'pass'`.
   *
   * @property {object}
  */
  get actions() {
    if (!this.winner && this.turns > 0) {
      return { [this.activeRole]: Object.values(ACTIONS) };
    }
    return null;
  }

  /** Victory is for whom chooses to win first. Defeat is for whom chooses to
   * lose first. A draw only results when the limit of turns (if any) is met.
   *
   * @property {object}
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
   *
   * @param {object}
  */
  perform(actions) {
    const { activeRole } = this;
    const opponent = this.opponent(activeRole);
    const action = actions[activeRole];
    switch (action) {
      case ACTIONS.WIN: this.winner = activeRole; break;
      case ACTIONS.LOSE: this.winner = opponent; break;
      case ACTIONS.PASS: break; // do nothing
      default: throw new Error(`Invalid actions ${JSON.stringify(actions)} at ${this}!`);
    }
    this.activateRoles(opponent);
    this.turns -= 1;
  }

  /** @inheritdoc */
  get features() {
    const {
      activeRole, roles, turns, winner,
    } = this;
    return new Int16Array(
      roles.indexOf(activeRole),
      turns === Infinity ? -1 : turns,
      roles.indexOf(winner),
    );
  }

  /** @inheritdoc */
  get identifier() {
    return this.features.join(',');
  }
} // class Choose2Win.

/** Serialization and materialization using Sermat.
*/
Choose2Win.defineSERMAT('activeRole turns winner');

export default Choose2Win;
