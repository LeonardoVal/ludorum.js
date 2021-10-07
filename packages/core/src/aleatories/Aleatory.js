import Randomness from '@creatartis/randomness/Randomness';
import BaseClass from '../utils/BaseClass';

/**  Aleatories are different means of non determinism that games can use, like:
 * dice, card decks, roulettes, etc.
 *
 * @class
*/
class Aleatory extends BaseClass {
  /** @inheritdoc */
  static get name() {
    return 'Aleatory';
  }

  /** The aleatory iterates over the distribution of its random variable, which
   * is a sequence of `[value, probability]` pairs.
   *
   * @yields {Array} - Arrays with the shape `[any, number]`.
   */
  * distribution() {
    yield this._unimplemented('distribution');
  }

  /** The probability of a given `value`.
   *
   * @param {any} _value
   * @returns {number}
   */
  probability(_value) {
    return this._unimplemented('probability');
  }

  /** Returns a valid random value for this aleatory.
   *
   * @param {Randomness} [rng=null]
   * @returns {any}
  */
  randomValue(rng = null) {
    const weightedValues = [...this.distribution()];
    return this.rng(rng).weightedChoice(weightedValues);
  }

  /** Checks if the given object is an instance of `Randomness`, or returns a
   * default RNG if it is `null`.
   *
   * @param {Randomness} [g=null]
   * @returns {Randomness}
   * @throws {TypeError} - If the given RNG is neither `null` nor an instance of
   *   `Randomness`.
  */
  rng(g = null) {
    return this._typedValue(g, Randomness, Randomness.DEFAULT);
  }
} // class Aleatory

export default Aleatory;
