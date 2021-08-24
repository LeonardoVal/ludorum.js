import randomness from '@creatartis/randomness';
import { unimplemented } from '../utils';

const { Randomness } = randomness;

/**  Aleatories are different means of non determinism that games can use, like:
 * dice, card decks, roulettes, etc.
*/
export default class Aleatory {
  /** The aleatory iterates over the distribution of its random variable, which
   * is a sequence of `[value, probability]` pairs.
   */
  * distribution() {
    yield unimplemented('distribution', this);
  }

  probability(value) {
    return unimplemented('probability', this);
  }

  /** The `Aleatory.randomValue()` can be used to obtain a valid random value
   * for the random variable.
  */
  randomValue(random = Randomness.DEFAULT) {
    const weightedValues = [...this.distribution()];
    return random.weightedChoice(weightedValues);
  }
} // class Aleatory
