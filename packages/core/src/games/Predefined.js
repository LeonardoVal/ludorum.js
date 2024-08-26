import { Game } from './Game';

const ROLES = ['First', 'Second'];

const DEFAULT_HEIGHT = 5;
const DEFAULT_WIDTH = 5;

const ACTIONS_REGEX = /^action(\d+)$/;

/** Simple reference games with a predefined outcome, mostly for testing
 * purposes.
 *
 * @class
 * @extends Game
*/
export class Predefined extends Game {
  static meta = {
    description: `Predefined is a pseudogame used for testing purposes. It will
      give _width_ amount of moves for each player until _height_ moves pass. Then
      the match is finished with the given _result_, or a tie as default.`,
    name: 'Predefined',
    roles: ROLES,
  }

  /** The game's state has the active role, a width and height, and a final
   * result.
   * 
   * The game finishes when there is a winner or a predefined number of turns
   * pass. Every turn the active player's moves are: `'win'`, `'lose'` and
   * `'pass'`.
   *
   * @param {object} [state=null]
   * @param {string} [state.activeRole='First']
   * @param {number} [state.height=5]
   * @param {number} [state.width=5]
   * @param {number | null} [state.winner=null]
  */
  init(state = null) {
    const { roles } = this;
    const activeRole = state?.activeRole ?? roles[0];
    const height = state?.height ?? DEFAULT_HEIGHT;
    const width = state?.width ?? DEFAULT_WIDTH;
    const winner = state?.winner ?? null;

    const isFinished = height < 1;
    const actions = isFinished ? null : {
      [activeRole]: Array(width).fill(0).map((_, i) => `action${i}`),
    };
    const result = !isFinished ? null
      : roles.reduce((r, role, roleIndex) => {
        r[role] = winner === null ? 0 : (winner === roleIndex) * 2 - 1;
        return r;
      }, {});

    super.init({ actions, activeRole, height, result, width, winner });
  }

  /** @inheritdoc */
  isValidAction(_role, action) {
    return +(ACTIONS_REGEX.exec(action)?.[1]) < this.width;
  }

  /** @inheritdoc */
  nextState(actions, haps) {
    const { activeRole, roles } = this;
    this.confirmTransition(actions, haps);
    return {
      activeRole: roles[(roles.indexOf(activeRole) + 1) % roles.length],
      height: this.height - 1,
      width: this.width,
      winner: this.winner,
    };
  }

} // class Predefined.
