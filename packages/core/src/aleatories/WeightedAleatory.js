import Aleatory from './Aleatory';

class WeightedAleatory extends Aleatory {
  static weightedValuesMap(weightedValues) {
    const result = new Map();
    let probSum = 0;
    for (const [value, prob] of weightedValues) {
      result.set(value, (result.get(value) || 0) + prob);
      probSum += prob;
    }
    for (const [value, prob] of result) {
      result.set(value, prob / probSum);
    }
    return result;
  }

  constructor(args) {
    let { weightedValues } = args || {};
    super();
    weightedValues = this.constructor.weightedValuesMap(weightedValues);
    this
      ._prop('weightedValues', weightedValues, Map);
  }

  probability(value) {
    const { weightedValues } = this;
    return weightedValues.get(value) || 0;
  }

  * distribution() {
    yield* this.weightedValues;
  }
} // class WeightedAleatory

/** Serialization and materialization using Sermat.
*/
Aleatory.addSERMAT(WeightedAleatory, 'weightedValues');

export default WeightedAleatory;
