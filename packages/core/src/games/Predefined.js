import Game from './Game';
import { validate } from '../utils';

const DEFAULT_HEIGHT = 5;
const DEFAULT_WIDTH = 5;
const DEFAULT_ROLES = ['First', 'Second'];
const DEFAULT_RESULT = Object.fromEntries(DEFAULT_ROLES.map((p) => [p, 0]));

/** # Predefined

Simple reference games with a predefined outcome, mostly for testing purposes.
*/
export default class Predefined extends Game {
  /** `Predefined` is a pseudogame used for testing purposes. It will give
   * `width` amount of  moves for each player until `height` moves pass. Then
   * the match is finished with the given `result`, or a tie as default.
  */
  constructor(args) {
    const {
      activeRole = 0,
      result: _result = DEFAULT_RESULT,
      height = DEFAULT_HEIGHT,
      width = DEFAULT_WIDTH,
    } = args || {};
    super();
    validate({
      result: typeof _result === 'object' && _result,
      height: !Number.isNaN(+height) && +height >= 0,
      width: !Number.isNaN(+width) && +width > 0,
    });
    this._result = _result;
    this.activateRoles(activeRole);
    this.height = +height;
    this.width = +width;
  }

  /** Default roles for `Predefined` are `First` and `Second`.
  */
  get roles() {
    return Object.keys(this._result);
  }

  /** Actions for a `Predefined` game are numbers from 1 to this.width.
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
  */
  get result() {
    return this.height > 0 ? null : { ...this.__result };
  }

  /** Moves are completely irrelevant. They only advance in the match.
  */
  perform(actions) {
    this.height -= 1;
    this.activateRoles(this.opponent());
  }

  /** Serialization and materialization using Sermat.
  */
  static __SERMAT__ = {
    identifier: 'ludorum.Predefined',
    serializer: ({
      activeRole, height, width, _result,
    }) => [{
      activeRole, height, width, result: _result,
    }],
  }
} // class Predefined.
