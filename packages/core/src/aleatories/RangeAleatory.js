import Aleatory from './Aleatory';

const rangeProbability = (min, max) => 1 / (max - min + 1);

export default class RangeAleatory extends Aleatory {
  constructor(args) {
    const { min, max } = args || {};
    super();
    this
      ._prop('min', min, 'number', 1)
      ._prop('max', max, 'number');
  }

  probability(value) {
    const { min, max } = this;
    return value >= min && value <= max ? rangeProbability(min, max) : 0;
  }

  * distribution() {
    const { min, max } = this;
    const prob = rangeProbability(min, max);
    for (let value = min; value <= max; value += 1) {
      yield [value, prob];
    }
  }

  randomValue(rng) {
    return this.rng(rng).random(this.min, this.max);
  }

  /** Serialization and materialization using Sermat.
   */
  static __SERMAT_ = {
    identifier: 'ludorum.RangeAleatory',
    serializer: ({ min, max }) => [{ min, max }],
  };
} // class RangeAleatory
