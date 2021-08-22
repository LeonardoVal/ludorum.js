/* eslint-disable space-infix-ops */
import {
  Aleatory, RangeAleatory, ListAleatory, WeightedAleatory, dice,
} from '../../src/aleatories';

function expectUniformDistribution(dist, values) {
  const distArray = [...dist];
  const prob = 1 / values.length;
  values.forEach((value, i) => {
    expect(distArray[i][0]).toBe(value);
    expect(distArray[i][1]).toBeCloseTo(prob);
  });
}

describe('aleatories', () => {
  it('expected definitions', () => {
    expect(typeof Aleatory).toBe('function');
    expect(typeof RangeAleatory).toBe('function');
    expect(typeof ListAleatory).toBe('function');
    expect(typeof WeightedAleatory).toBe('function');
    expect(typeof dice).toBe('object');
  });

  it('RangeAleatory', () => {
    const alea1 = new RangeAleatory({ min: 0, max: 1 });
    expectUniformDistribution(alea1.distribution(), [0, 1]);
    const alea2 = new RangeAleatory({ min: 0, max: 2 });
    expectUniformDistribution(alea2.distribution(), [0, 1, 2]);
    const alea3 = new RangeAleatory({ min: 1, max: 5 });
    expectUniformDistribution(alea3.distribution(), [1, 2, 3, 4, 5]);
  });

  it('ListAleatory', () => {
    const alea1 = new ListAleatory({ values: 'xyz' });
    expectUniformDistribution(alea1.distribution(), [...'xyz']);
    const alea2 = new ListAleatory({ values: [1, 2, 3, 4] });
    expectUniformDistribution(alea2.distribution(), [1, 2, 3, 4]);
  });

  it('dice', () => {
    const values = [...`${new Array(22)}`].map((_, i) => i);
    const faceCounts = [4, 6, 8, 10, 12, 20];
    faceCounts.forEach((n) => {
      const die = dice[`D${n}`];
      expect(die).toBeDefined();
      expectUniformDistribution(die.distribution(), values.slice(1, n+1));
    });
  });

  /* TODO
  xit('sumProbability', function () {
    var sumProbability = ludorum.aleatories.sumProbability;
    expect(typeof sumProbability).toBe('function');
    expect(sumProbability(1,2,6)).toBe(0);
    expect(1 / sumProbability(2,2,6)).toBe(36);
    expect(1 / sumProbability(3,2,6)).toBe(18);
    expect(1 / sumProbability(7,2,6)).toBe(6);
    expect(1 / sumProbability(11,2,6)).toBe(18);
    expect(1 / sumProbability(12,2,6)).toBe(36);
    expect(sumProbability(13,2,6)).toBe(0);
  });
  */

  it('WeightedAleatory normalization', () => {
    const norm = (dist) => {
      const alea = new WeightedAleatory({ weightedValues: dist });
      return [...alea.distribution()];
    };
    expect(norm([[1, 1], [2, 1]]))
      .toEqual([[1, 0.5], [2, 0.5]]);
    expect(norm([[1, 0.1], [2, 0.1]]))
      .toEqual([[1, 0.5], [2, 0.5]]);
    expect(norm([[1, 2], [2, 3]]))
      .toEqual([[1, 0.4], [2, 0.6]]);
    expect(norm([[1, 1], [2, 2], [1, 1], [2, 1]]))
      .toEqual([[1, 0.4], [2, 0.6]]);
  });
}); // aleatories
