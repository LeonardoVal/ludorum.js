import Aleatory from './Aleatory';

class ListAleatory extends Aleatory {
  /** @inheritdoc */
  static get name() {
    return 'ListAleatory';
  }

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
} // class ListAleatory

/** Serialization and materialization using Sermat.
*/
ListAleatory.defineSERMAT('values');

export default ListAleatory;
