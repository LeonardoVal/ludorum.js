
export function defProps(obj, props, baseDef = null) {
  const defs = Object.entries(props).reduce((defs, [k, value]) => {
    if (value !== undefined) { // Skip undefined values.
      defs[k] = {
        enumerable: true, // Enumerable by default.
        ...baseDef,
        value,
      };
    }
    return defs;
  }, {});
  Object.defineProperties(obj, defs);
  return obj;
} // function defProps

/** Builds an objects based on a list of property keys and a function which
 * generates the values for every key.
 * 
 * @param {string[]} keys
 * @param {(key: string, index: number) => T} valueFn
 * @param {Record<string, T>} [obj={}]
 * @returns {Record<string, T>}
*/
export function mapObject(keys, valueFn, obj = {}) {
  return keys.reduce((r, key, i) => {
    r[key] = valueFn(key, i);
    return r;
  }, obj);
} // function mapObject
