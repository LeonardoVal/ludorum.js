import { Randomness } from '@creatartis/randomness';

function* generatorFromDistribution(...distribution) {
  const probSum = distribution.reduce(([, p], s) => s + p, 0);
  for (const [value, prob] of distribution) {
    yield { value, probability: prob / probSum };
  }
}

function* generatorFromValues(...values) {
  const probability = 1 / values.length;
  for (const value of values) {
    yield { value, probability };
  }
}

function* generatorFromRange(min, max) {
  const probability = 1 / Math.floor(max - min + 1);
  for (let value = min; value <= max; value += 1) {
    yield { value, probability };
  }
}

/**  Aleatories are different means of non determinism that games can use, like:
 * dice, card decks, roulettes, etc.
*/
export default class Aleatory {
  /** TODO
  */
  constructor(args) {
    const {
      distribution, values, min, max,
    } = args || {};
    if (distribution !== undefined) {
      this.generator = () => generatorFromDistribution(distribution);
    }
    if (values !== undefined) {
      this.generator = () => generatorFromValues(values);
    }
    if (min !== undefined && max !== undefined) {
      this.generator = () => generatorFromRange(min, max);
    }
  }

  /** The aleatory iterates over the distribution of its random variable, which
   * is a sequence of `[value, probability]` pairs.
   */
  [Symbol.iterator]() {
    return this.generator()[Symbol.iterator]();
  }

  /** The `Aleatory.randomValue()` can be used to obtain a valid random value
   * for the random variable.
  */
  randomValue(random = Randomness.DEFAULT) {
    const weightedValues = [...this]
      .map(({ value, probability }) => [value, probability]);
    return random.weightedChoice(weightedValues);
  }

  // Common definitions ////////////////////////////////////////////////////////

  static D4 = new Aleatory({ min: 1, max: 4 });

  static D6 = new Aleatory({ min: 1, max: 6 });

  static D8 = new Aleatory({ min: 1, max: 8 });

  static D10 = new Aleatory({ min: 1, max: 10 });

  static D12 = new Aleatory({ min: 1, max: 12 });

  static D20 = new Aleatory({ min: 1, max: 20 });

  /** Serialization and materialization using Sermat.
  */
  static __SERMAT_ = {
    identifier: 'ludorum.Aleatory',
    serializer: (obj) => [{ distribution: [...obj] }],
  };
} // class Aleatory.
