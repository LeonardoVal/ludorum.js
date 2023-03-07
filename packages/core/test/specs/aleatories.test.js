/* eslint-disable space-infix-ops */
import {
  randomChoice, randomNumber, randomWeightedChoice,
  dice, uniformAleatory, uniformRangeAleatory,
} from '../../src/randomness';

const expectUniformDistribution = (dist, values) => {
  const distArray = [...dist];
  const prob = 1 / values.length;
  values.forEach((value, i) => {
    expect(distArray.length).toBeGreaterThan(i);
    expect(distArray[i].length).toBe(2);
    expect(distArray[i][0]).toBe(value);
    expect(distArray[i][1]).toBeCloseTo(prob);
  });
};

describe('aleatories', () => {
  test('expected definitions', () => {
    expect(randomChoice).toBeOfType('function');
    expect(randomNumber).toBeOfType('function');
    expect(randomWeightedChoice).toBeOfType('function');
    expect(dice).toBeOfType('object');
    expect(uniformAleatory).toBeOfType('function');
    expect(uniformRangeAleatory).toBeOfType('function');
  });

  test('uniformAleatory', () => {
    const alea1 = uniformAleatory(...'xyz');
    expectUniformDistribution(alea1, [...'xyz']);
    const alea2 = uniformAleatory(...[1, 2, 3, 4]);
    expectUniformDistribution(alea2, [1, 2, 3, 4]);
  });

  test('uniformRangeAleatory', () => {
    const alea1 = uniformRangeAleatory(0, 1);
    expectUniformDistribution(alea1, [0, 1]);
    const alea2 = uniformRangeAleatory(0, 2);
    expectUniformDistribution(alea2, [0, 1, 2]);
    const alea3 = uniformRangeAleatory(1, 5);
    expectUniformDistribution(alea3, [1, 2, 3, 4, 5]);
  });

  test('dice', () => {
    const values = [...`${new Array(22)}`].map((_, i) => i);
    const faceCounts = [2, 4, 6, 8, 10, 12, 20];
    faceCounts.forEach((n) => {
      const die = dice[`D${n}`];
      expect(Array.isArray(die)).toBe(true);
      expectUniformDistribution(die, values.slice(1, n+1));
    });
  });
}); // aleatories
