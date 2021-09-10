import Aleatory from './Aleatory';

class ListAleatory extends Aleatory {
  constructor(args) {
    const { values } = args || {};
    super();
    this._prop('values', [...values], Array);
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

  randomValue(rng) {
    return this.rng(rng).choice(this.values);
  }

  /** Serialization and materialization using Sermat.
   */
  static __SERMAT__ = {
    identifier: 'ludorum.ListAleatory',
    serializer({ values }) {
      return [{ values }];
    },
    materializer(_obj, args) {
      return args && (new ListAleatory(...args));
    },
  };
} // class ListAleatory

export default ListAleatory;
