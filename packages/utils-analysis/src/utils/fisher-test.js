/* eslint-disable import/prefer-default-export */

// SEE https://mathworld.wolfram.com/FishersExactTest.html

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
 * @param {int[]} row1
 * @param {int[]} row2
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
