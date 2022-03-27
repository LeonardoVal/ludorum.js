import {
  fisher2x2,
  fisher2x3,
  hypergeometricRule,
} from '../../src/utils/fisher-test';

const F = (n) => Array(n).fill().reduce((f, _, i) => f * (i + 1), 1);

describe('Fisher test', () => {
  test('layout', () => {
    expect(fisher2x2).toBeOfType('function');
    expect(fisher2x3).toBeOfType('function');
    expect(hypergeometricRule).toBeOfType('function');
  });

  test('hypergeometricRule', () => {
    [
      [[4, 9], [8, 4]],
      [[3, 2], [17, 8]],
    ].forEach(([[a, b], [c, d]]) => {
      const p = F(a + b) * F(c + d) * F(a + c) * F(b + d)
        / F(a) / F(b) / F(c) / F(d) / F(a + b + c + d);
      expect(hypergeometricRule([a, b], [c, d])).toBeCloseTo(p);
    });
  });

  test('fisher2x2', () => {
    // Failures
    expect(() => fisher2x2()).toThrow();
    expect(() => fisher2x2([1], [2])).toThrow();
    expect(() => fisher2x2([1, 1], [2, 2, 2])).toThrow();
    expect(() => fisher2x2([1, 1], [2, 2], NaN)).toThrow();
    // Results
    [
      [[100, 0], [100, 0], undefined, 1, 0],
      [[100, 0], [0, 100], undefined, 0, +1],
      [[0, 100], [100, 0], undefined, 0, -1],
      [[50, 50], [70, 70], undefined, 1, 0],
      [[300, 100], [325, 75], 0.05, 0.039924, -1],
      [[300, 100], [325, 75], 0.01, 0.039924, 0],
      [[5, 0], [1, 4], undefined, 0.047619, +1],
      [[5, 0], [1, 4], 0.01, 0.047619, 0],
      [[4, 9], [8, 4], 0.1, 0.115239, 0],
      [[1, 9], [11, 3], 0.01, 0.002759, -1],
      [[28, 10], [19, 10], undefined, 0.591604, 0],
      [[28, 10], [19, 10], 0.01, 0.591604, 0],
      [[28, 10], [29, 1], undefined, 0.017377, -1],
      [[28, 10], [29, 1], 0.01, 0.017377, 0],
    ].forEach(([row1, row2, alpha, pValue, comparison]) => {
      const testResult = fisher2x2(row1, row2, alpha);
      expect(testResult.alpha).toBeCloseTo(alpha ?? 0.05);
      expect(testResult.pValue).toBeCloseTo(pValue, 6);
      expect(Math.sign(testResult.comparison)).toBeCloseTo(comparison);
    });
  });

  test('fisher2x3', () => {
    // Failures
    expect(() => fisher2x3()).toThrow();
    expect(() => fisher2x3([1], [2])).toThrow();
    expect(() => fisher2x3([1, 1, 1], [2, 2, 2, 2])).toThrow();
    expect(() => fisher2x3([1, 1, 1], [2, 2, 2], NaN)).toThrow();
    // Results
    [
      [[386, 13, 1], [395, 4, 1], undefined, 0.046692, -1],
      [[386, 13, 1], [395, 4, 1], 0.01, 0.046692, 0],
      [[28, 13, 10], [19, 7, 10], 0.05, 0.646613, 0],
      [[28, 13, 10], [19, 7, 10], 0.01, 0.646613, 0],
      [[28, 13, 10], [29, 17, 1], undefined, 0.017989, -1],
      [[28, 13, 10], [29, 17, 1], 0.01, 0.017989, 0],
    ].forEach(([row1, row2, alpha, pValue, comparison]) => {
      const testResult = fisher2x3(row1, row2, alpha);
      expect(testResult.alpha).toBeCloseTo(alpha ?? 0.05);
      expect(testResult.pValue).toBeCloseTo(pValue, 6);
      expect(Math.sign(testResult.comparison)).toBeCloseTo(comparison);
    });
  });
}); // describe 'Fisher test'
