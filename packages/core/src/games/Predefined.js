import { Game } from './Game';

const ROLES = ['First', 'Second'];

const DEFAULT_HEIGHT = 5;
const DEFAULT_WIDTH = 5;

/** Simple reference games with a predefined outcome, mostly for testing
 * purposes.
 *
 * @class
 * @extends Game
*/
export class Predefined extends Game.create({
  description: `Predefined is a pseudogame used for testing purposes. It will
    give _width_ amount of moves for each player until _height_ moves pass. Then
    the match is finished with the given _result_, or a tie as default.`,
  name: 'Predefined',
  roles: ROLES,
}) {
  /** The game's state has the active role, a width and height, and a final
   * result.
   *
   * @param {object} [state=null]
   * @param {string} [state.activeRole=0]
   * @param {number} [state.height=5]
   * @param {number} [state.width=5]
   * @param {number | null} [state.winner=null]
  */
  init(state = null) {
    Object.assign(this, {
      activeRole: +(state?.activeRole ?? 0),
      height: state?.height ?? DEFAULT_HEIGHT,
      width: state?.width ?? DEFAULT_WIDTH,
      winner: state?.winner ?? null,
    });
  }

  /** The game finishes when there is a winner or a predefined number of turns
   * pass. Every turn the active player's moves are: `'win'`, `'lose'` and
   * `'pass'`.
   */
  shift() {
    const {
      activeRole, height, roles, width, winner,
    } = this;
    const isFinished = height < 1;
    const actions = Object.fromEntries(roles.map((role, roleIndex) => [
      role,
      !isFinished && roleIndex === activeRole
        ? Array(width + 1).fill(0).map((_, i) => `action${i}`)
        : null,
    ]));
    const result = !isFinished ? null : Object.fromEntries(
      roles.map((role, roleIndex) => [
        role,
        winner === null ? 0 : (winner === roleIndex) * 2 - 1,
      ]),
    );
    return { actions, result };
  }

  /** If a player moves to win or lose, a final game state is returned. Else the
   * game goes on.
  */
  nextState(_actions) {
    return {
      activeRole: (this.activeRole + 1) % this.roles.length,
      height: this.height - 1,
      width: this.width,
      winner: this.winner,
    };
  }
} // class Predefined.
