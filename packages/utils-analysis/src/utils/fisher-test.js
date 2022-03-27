/* eslint-disable import/prefer-default-export */

/** Part of Fisher's exact test is the hypergeometric rule, which is used to
 * calculate the probability of a given contingency table. The formula is
 * $ p=\frac{(a+b)!(c+d)!(a+c)!(b+d)!}{a!b!c!d!n!} $ for 2x2 tables.
 *
 * Calculating all factorials can be very inefficient, possibly overflowing the
 * 64 bits double floating point precision of Javascript's number type. This
 * algorithm lists all factors (and divisors), simplifying the calculation as
 * much as possible, and ordering multiplications and divisions to minimize the
 * size of the numbers.
 *
 * @see https://mathworld.wolfram.com/FishersExactTest.html
 * @param {int[]} row1
 * @param {int[]} row2
 * @return {number}
*/
export function hypergeometricRule(row1, row2) {
  let n = 0;
  let row1Sum = 0;
  let row2Sum = 0;
  const colSums = row1.map((v, i) => {
    row1Sum += v;
    row2Sum += row2[i];
    n += v + row2[i];
    return v + row2[i];
  });
  const factors = Array(n + 1).fill(0);
  [row1Sum, row2Sum, ...colSums].forEach((x) => {
    for (let i = 2; i <= x; i += 1) {
      factors[i] += 1;
    }
  });
  [n, ...row1, ...row2].forEach((x) => {
    for (let i = 2; i <= x; i += 1) {
      factors[i] -= 1;
    }
  });
  let r = 1;
  for (let fi = 2, di = 2; fi <= n || di <= n;) {
    if (r <= 1 && fi <= n) {
      if (factors[fi] > 0) {
        r *= fi ** factors[fi];
      }
      fi += 1;
    } else {
      if (factors[di] < 0) {
        r *= di ** factors[di];
      }
      di += 1;
    }
  }
  return r;
}

/** Fisher's exact test for contingency tables of 2 rows per 2 columns. Both
 * arguments `row1` and `row2` must be arrays of two possitive integers, and
 * `alpha` indicates the significance of the hypothesis test (5% or 0.05 by
 * default).
 *
 * The result is an object with:
 *
 * + `pValue`: The _p value_ for the test.
 *
 * + `comparison`: A number complaint with sorting functions (i.e. negative if
 *   `row1` is less than `row2`, possitive if `row1` is greater than `row2`,
 *    zero otherwise). If the p value is greater than `alpha` the comparison is
 *    zero, else the difference of the values of the first column is returned.
 *
 * @see https://mathworld.wolfram.com/FishersExactTest.html
 * @param {int[]} row1
 * @param {int[]} row2
 * @param {number} [alpha=0.05]
 * @return {object}
*/
export function fisher2x2(row1, row2, alpha = 0.05) {
  if (row1?.length !== 2 || row2?.length !== 2) {
    throw new TypeError('Contingency table should be 2x2!');
  }
  if (Number.isNaN(alpha) || alpha < 0 || alpha > 1) {
    throw new TypeError(`Invalid value ${alpha} for alpha!`);
  }
  let [a, b] = row1;
  let [c, d] = row2;
  const [r1, r2] = [a + b, c + d];
  const c1 = a + c;
  const cutoff = Math.abs(a / r1 - c / r2);
  const maxA = Math.min(r1, c1);
  let pValue = 0;
  for (a = 0; a <= maxA; a += 1) {
    b = r1 - a;
    c = c1 - a;
    d = r2 - c;
    if (d >= 0) {
      const disprop = Math.abs(a / r1 - c / r2);
      if (disprop >= cutoff) {
        const p = hypergeometricRule([a, b], [c, d]);
        pValue += p;
      }
    }
  }
  const comparison = pValue > alpha ? 0 : (row1[0] - row2[0]);
  return {
    alpha, comparison, pValue, row1, row2,
  };
}

/** Fisher's exact test for contingency tables of 2 rows per 3 columns. Both
 * arguments `row1` and `row2` must be arrays of three possitive integers, and
 * `alpha` indicates the significance of the hypothesis test (5% or 0.05 by
 * default).
 *
 * The result is an object with:
 *
 * + `pValue`: The _p_ value for the test.
 *
 * + `comparison`: A number complaint with sorting functions (i.e. negative if
 *   `row1` is less than `row2`, possitive if `row1` is greater than `row2`,
 *   zero otherwise). If the p value is greater than `alpha` the comparison is
 *   zero. Else the difference of the values of the first column is returned if
 *   not zero. Else the difference of the values of the second column normalized
 *   between 0 and 1 is returned.
 *
 * @see https://mathworld.wolfram.com/FishersExactTest.html
 * @param {int[]} row1
 * @param {int[]} row2
 * @param {number} [alpha=0.05]
 * @return {object}
*/
export function fisher2x3(row1, row2, alpha = 0.05) {
  if (row1?.length !== 3 || row2?.length !== 3) {
    throw new TypeError('Contingency table should be 2x2!');
  }
  if (Number.isNaN(alpha) || alpha < 0 || alpha > 1) {
    throw new TypeError(`Invalid value ${alpha} for alpha!`);
  }
  let [a, b, c] = row1;
  let [d, e, f] = row2;
  const [r1, r2] = [a + b + c, d + e + f];
  const [c1, c2, c3] = [a + d, b + e, c + f];
  const cutoff = hypergeometricRule([a, b, c], [d, e, f]);
  const maxA = Math.min(r1, c1);
  let pValue = 0;
  for (a = 0; a <= maxA; a += 1) {
    const maxB = Math.min(r1 - a, c2);
    for (b = 0; b <= maxB; b += 1) {
      c = r1 - a - b;
      d = c1 - a;
      e = c2 - b;
      f = c3 - c;
      if (f >= 0) {
        const p = hypergeometricRule([a, b, c], [d, e, f]);
        if (p <= cutoff) {
          pValue += p;
        }
      }
    }
  }
  const comparison = pValue > alpha ? 0
    : (row1[0] - row2[0] || (row1[1] - row2[1]) / (c2 + 1));
  return {
    alpha, comparison, pValue, row1, row2,
  };
}
