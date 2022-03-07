/** Utility functions regarding sequences and iterators.
*/

export function* permutations(list, k) {
  list = [...list];
  k = Number.isNaN(+k) ? list.length : +k;
  if (k < 0 || k > list.length) {
    throw new Error(`Cannot compute permutations with k=${k}!`);
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

/** The sequence of all tuples that result from the cartesian product of the
 * given lists.
 *
 * @param {...Iterable} lists
 * @yield {Array}
 *
*/
export function* cartesianProduct(...lists) {
  if (lists.length < 1) {
    yield [];
  } else {
    const [list, ...rest] = lists;
    for (const value of list) {
      if (rest.length < 1) {
        yield [value];
      } else {
        for (const tuple of cartesianProduct(...rest)) {
          yield [value, ...tuple];
        }
      }
    }
  }
}

/** The sequence of all objects that result from the cartesian product of the
 * properties of the give object.
 *
 * @param {object} obj
 * @yield {object}
*/
export function* cartesianProductObject(obj, options) {
  let { keys } = options || {};
  keys ||= Object.keys(obj);
  const lists = keys.map((key) => obj[key]);
  for (const tuple of cartesianProduct(...lists)) {
    yield tuple.reduce((r, v, i) => {
      r[keys[i]] = v;
      return r;
    }, {});
  }
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
  cartesianProduct,
  cartesianProductObject,
  permutations,
};
