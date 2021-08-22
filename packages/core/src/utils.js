/** Checks if the given `value` is not of the given `type`.
 *
 * @param {any} [value]
 * @param {string|function} [type]
 * @returns {boolean}
 */
export const checkType = (value, type) => (
  // eslint-disable-next-line valid-typeof
  (typeof type === 'string') ? typeof value === type : value instanceof type
);

/** Raises a `TypeError` if the given `value` is not of the given `type`.
 *
 * @param {any} [value]
 * @param {string|function} [type]
 * @param {any} [defaultValue]
 * @throws {TypeError}
 * @returns {any} - Same as `value`.
 */
export const ensureType = (value, type, defaultValue) => {
  if (!checkType(value, type)) {
    if (defaultValue !== undefined && value === undefined && checkType(defaultValue, type)) {
      return defaultValue;
    }
    const typeIsString = !type || typeof type === 'string';
    const expectedType = typeIsString ? type : type.name;
    const actualType = typeIsString ? typeof value : value.constructor.name;
    throw new TypeError(`Expected ${expectedType} but got ${actualType}!`);
  }
  return value;
};

/** TODO
*/
export const unimplemented = (method, obj) => {
  // eslint-disable-next-line no-nested-ternary
  const className = (typeof obj === 'object' && obj ? obj.constructor.name
    : typeof obj === 'function' ? obj.name : `${obj}`);
  const message = `${obj ? `${className}.` : ''}${method} not implemented!`
    + ' Please override.';
  throw new Error(message);
};

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
