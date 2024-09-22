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
} // function* permutations
