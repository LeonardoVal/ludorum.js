import { hypergeometricRule } from '../../src/utils/fisher-test';

const F = (n) => Array(n).fill().reduce((f, _, i) => f * (i + 1), 1);

describe('Fisher test', () => {
  test('layout', () => {
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
  }); // hypergeometricRule
}); // describe 'Fisher test'
