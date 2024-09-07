
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
