/** An aleatory function is one that has two behaviours. If number arguments
 * between 0 (inclusive) and 1 (exclusive) are given, random values are
 * returned. If no arguments are given, the random variable's distribution is
 * returned, in the form of a list of [value, probability] pairs.
 *
 * @typedef {function} Aleatory
 */

/** Creates an aleatory for an uniform variable for the given value list.
 *
 * @param  {...T} values
 * @returns {Aleatory} Aleatory function for the list of values, each with a
 *   the same probability.
 */
export function uniformAleatory(...values) {
  return (...ns) => {
    const count = values.length;
    if (ns.length > 0) {
      return ns.map((n) => values[Math.trunc(n * count)]);
    }
    const prob = 1 / count;
    return values.map((value) => [value, prob]);
  };
}

/** Create the distribution of an uniform variable ranging integers from `from`
 * to `to`.
 *
 * @param {number} from
 * @param {number} to
 * @returns {Aleatory}
 */
export function uniformRangeAleatory(from, to) {
  return (...ns) => {
    if (ns.length > 0) {
      return ns.map((n) => Math.trunc((1 - n) * from + n * to));
    }
    const n = to - from + 1;
    const prob = 1 / n;
    return Array(n).fill(0).map((_, i) => [from + i, prob]);
  };
}

/** Predefined distributions for common dice.
 */
export const dice = Object.fromEntries(
  [2, 4, 6, 8, 10, 12, 20].map((n) => [`D${n}`, uniformRangeAleatory(1, n)]),
);
