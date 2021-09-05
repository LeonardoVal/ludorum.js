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
