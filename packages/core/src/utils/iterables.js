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

/** TODO
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

/** TODO
 *
*/
export function* cartesianProductObject(obj) {
  const keys = Object.keys(obj);
  const lists = keys.map((key) => obj[key]);
  for (const tuple of cartesianProduct(...lists)) {
    yield Object.fromEntries(tuple.map(([v, i]) => [keys[i], v]));
  }
}
