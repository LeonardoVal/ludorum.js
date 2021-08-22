/* eslint-disable no-plusplus */
import { Randomness } from '@creatartis/randomness';
import Aleatory from './Aleatory';

const rangeProbability = (min, max) => 1 / (max - min + 1);

export default class RangeAleatory extends Aleatory {
  constructor(args) {
    super();
    const { min = 0, max = 0x7fffffff } = args || {};
    this.min = min;
    this.max = max;
  }

  probability(value) {
    const { min, max } = this;
    return value >= min && value <= max ? rangeProbability(min, max) : 0;
  }

  * distribution() {
    const { min, max } = this;
    const prob = rangeProbability(min, max);
    for (let value = min; value <= max; value++) {
      yield [value, prob];
    }
  }

  randomValue(random = Randomness.DEFAULT) {
    return random.random(this.min, this.max);
  }

  /** Serialization and materialization using Sermat.
   */
  static __SERMAT_ = {
    identifier: 'ludorum.RangeAleatory',
    serializer: ({ min, max }) => [{ min, max }],
  };
} // class RangeAleatory
