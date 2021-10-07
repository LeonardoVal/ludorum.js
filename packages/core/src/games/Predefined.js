import Game from './Game';

const DEFAULT_HEIGHT = 5;
const DEFAULT_WIDTH = 5;
const DEFAULT_ROLES = ['First', 'Second'];
const DEFAULT_RESULT = Object.fromEntries(DEFAULT_ROLES.map((p) => [p, 0]));

/** Simple reference games with a predefined outcome, mostly for testing
 * purposes.
 *
 * @class
 * @extends Game
*/
class Predefined extends Game {
  /** @inheritdoc */
  static get name() {
    return 'Predefined';
  }

  /** `Predefined` is a pseudogame used for testing purposes. It will give
   * `width` amount of  moves for each player until `height` moves pass. Then
   * the match is finished with the given `result`, or a tie as default.
   *
   * @param {object} [args]
  */
  constructor(args = null) {
    const {
      activeRole = 0, result, height = DEFAULT_HEIGHT, width = DEFAULT_WIDTH,
    } = args || {};
    super();
    this._prop('_result', result, 'object', DEFAULT_RESULT);
    this.activateRoles(activeRole);
    this
      ._prop('height', height, !Number.isNaN(+height) && +height >= 0)
      ._prop('width', width, !Number.isNaN(+width) && +width > 0);
  }

  /** Default roles for `Predefined` are `First` and `Second`.
   *
   * @property {string[]}
  */
  get roles() {
    return Object.keys(this._result);
  }

  /** Actions for a `Predefined` game are numbers from 1 to this.width.
   *
   * @property {object}
  */
  get actions() {
    if (this.height > 0) {
      const { activeRole, width } = this;
      return {
        [activeRole]: [...`${Array(width + 1)}`].map((_, i) => i + 1),
      };
    }
    return null;
  }

  /** Returned the predefined results if height is zero or less.
   *
   * @property {object}
  */
  get result() {
    return this.height > 0 ? null : { ...this._result };
  }

  /** Actions are completely irrelevant. They only advance in the match.
  */
  perform() {
    this.height -= 1;
    this.activateRoles(this.opponent());
  }
} // class Predefined.

/** Serialization and materialization using Sermat.
*/
Game.addSERMAT(Predefined, 'height width result=_result');

export default Predefined;
