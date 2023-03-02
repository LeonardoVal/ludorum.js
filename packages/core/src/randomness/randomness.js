/** Generate a random number.
 *
 * @param {function} rng - A pseudo-random number generator between 0 and 1.
 * @param {number} [min=0] - Minimum random value (inclusive).
 * @param {number} [max=1] - Maximum random value (exclusive).
 * @returns {number} A random number in [x,y).
 */
export function randomNumber(rng, min = 0, max = 1) {
  const n = rng ? rng() : Math.random();
  return (1 - n) * min + n * max;
}

/** Randomnly choose a value from an array.
 *
 * @param {function} rng - A pseudo-random number generator between 0 and 1.
 * @param {T[]} values - An array of values to choose from.
 * @returns {T} A randomly chose value from the given array, or undefined.
 */
export function randomChoice(rng, values) {
  // eslint-disable-next-line no-bitwise
  return values[randomNumber(rng, 0, values.length) | 0];
}

/** Choose a value from a list, where each value chance is proportional to its
 * weight. Weights that are not greater than zero are ignored.
 *
 * @param {[T,number][]} weightedValues - A list of pairs [value, weight].
 * @returns {T} The randomly selected value, or undefined.
 * @throws {Error} Raised when a weight is negative.
 */
export function randomWeightedChoice(rng, weightedValues) {
  let currentValue;
  let weightSum = 0;
  for (const [value, weight] of weightedValues) {
    if (weight > 0) {
      const chance = rng();
      if (chance <= weight / (weight + weightSum)) {
        currentValue = value;
      }
      weightSum += weight;
    }
  }
  return currentValue;
}
