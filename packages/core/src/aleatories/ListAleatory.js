/* eslint-disable no-plusplus */
import { Randomness } from '@creatartis/randomness';
import Aleatory from './Aleatory';

export default class ListAleatory extends Aleatory {
  constructor(args) {
    super();
    const { values } = args || {};
    this.values = [...values];
  }

  probability(value) {
    const { values } = this;
    return values.includes(value) ? 1 / values.length : 0;
  }

  * distribution() {
    const { values } = this;
    const prob = 1 / (values.length);
    for (const value of values) {
      yield [value, prob];
    }
  }

  randomValue(random = Randomness.DEFAULT) {
    return random.choice(this.values);
  }

  /** Serialization and materialization using Sermat.
   */
  static __SERMAT_ = {
    identifier: 'ludorum.ListAleatory',
    serializer: (obj) => [{ values: obj.values }],
  };
} // class ListAleatory
