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
};
