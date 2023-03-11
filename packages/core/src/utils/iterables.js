/** TODO
 *
*/
export function* permutations(list, k) {
  if (!(k >= 0 && k <= list.length)) {
    throw new Error(`Cannot compute permutations with k = ${k}!`);
  }
  const recursion = function* recursion(elems, count) {
    if (count < 1) {
      yield [];
    } else {
      for (let i = 0; i < elems.length; i += 1) {
        const other = [...elems];
        const [value] = other.splice(i, 1);
        for (const tuple of recursion(other, count - 1)) {
          tuple.unshift(value);
          yield tuple;
        }
      }
    }
  };
  yield* recursion(list, k);
}

/** Given a sequence of elements and an evaluation function, returns an array
 * with the maximum evaluation.
 *
 * @param {Iterable} elements
 * @param {function} evaluation
 * @param {number} [ε=1e-15]
 * @returns {Array}
*/
export function bests(elements, evaluation, ε = 1e-15) {
  let maxEvaluation = -Infinity;
  let result = [];
  for (const element of elements) {
    const elementEvaluation = evaluation(element);
    if (elementEvaluation >= maxEvaluation - ε) {
      if (elementEvaluation > maxEvaluation + ε) {
        result = [element];
        maxEvaluation = elementEvaluation;
      } else {
        result.push(element);
      }
    }
  }
  return result;
}

export default {
  bests,
  permutations,
};
