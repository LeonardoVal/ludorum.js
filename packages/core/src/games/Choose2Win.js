import { mapObject } from '../utils';
import { Game } from './Game';

const ACTIONS = { WIN: 'win', LOSE: 'lose', PASS: 'pass' };
const ACTION_VALUES = Object.values(ACTIONS);

/** Choose2Win is a simple silly game. Each turn one of the players can decide
 * to win, to lose or to pass the turn. It is meant to be used only for testing
 * Ludorum, since a game can hardly become less interesting than this.
 *
 * @class
 * @extends Game
*/
export class Choose2Win extends Game {
  static meta = {
    description: `Choose2Win is a simple silly game. Each turn one of the players
      can decide to win, to lose or to pass the turn.`,
    name: 'Choose2Win',
    roles: ['This', 'That'],
  }

  /** The game's state has a number of turns for the game to last (`Infinity`
   * by default), the active role and the winner if the game has ended.
   * 
   * The game finishes when there is a winner or a predefined number of turns
   * pass. Every turn the active player's moves are: `'win'`, `'lose'` and
   * `'pass'`.
   *
   * @param {object} [state=null]
   * @param {string} [state.activeRole=0]
   * @param {number} [state.turns=+Infinity]
   * @param {string} [state.winner=null]
  */
  init(state = null) {
    const activeRole = +(state?.activeRole ?? 0);
    const turns = state?.turns ?? Infinity;
    const winner = state?.winner ?? null;
    const { roles } = this;

    const isFinished = winner !== null || turns < 1;
    const actions = isFinished ? null : {
      [roles[activeRole]]: [...ACTION_VALUES],
    };
    const result = !isFinished ? null : mapObject(roles, (_role, roleIndex) => (
      winner === null ? 0 : (winner === roleIndex) * 2 - 1
    ));

    super.init({ actions, activeRole, isFinished, result, turns, winner });
  }

  /** If a player moves to win or lose, a final game state is returned. Else the
   * game goes on.
  */
  nextState(actions, haps) {
    this.confirmTransition(actions, haps);
    const { roles } = this;
    let { activeRole, turns, winner } = this;
    const opponent = (activeRole + 1) % roles.length;
    const action = actions[roles[activeRole]];
    switch (action) {
      case ACTIONS.WIN: winner = activeRole; break;
      case ACTIONS.LOSE: winner = opponent; break;
      case ACTIONS.PASS: break; // do nothing
      default: throw new Error(
        `Invalid actions ${JSON.stringify(actions)} at ${this}!`,
      );
    }
    activeRole = opponent;
    turns -= 1;
    return { activeRole, turns, winner };
  }

  /** @inheritdoc */
  get features() {
    const { activeRole, turns, winner } = this;
    return Uint16Array.of(
      activeRole,
      turns === Infinity ? -1 : turns,
      winner,
    );
  }

  /** @inheritdoc */
  get identifier() {
    const { activeRole, turns, winner } = this;
    return [
      activeRole,
      turns === Infinity ? '∞' : Math.max(0, turns),
      winner === null ? '?' : winner,
    ].join('');
  }
} // class Choose2Win.
