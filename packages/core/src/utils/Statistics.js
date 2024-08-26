/** Object used to account and process statistics.
*/
export class Statistics {
  /** The arguments are optional.
   *
   * @param {object} [args]
   * @param {Map} [args.map=null] - Optional map with preloaded entries.
  */
  constructor(args = null) {
    Object.defineProperty(this, 'map', {
      value: new Map(args?.map),
    });
  }

  /** Returns an entry for a given key. If none is available, it creates one
   * before returning it.
   *
   * @param {string} key
   * @returns {object} - The entry for the `keys`.
  */
  entry(key) {
    const { map } = this;
    let result = map.get(key);
    if (!result) {
      result = { key, count: 0, min: NaN, max: NaN, sum: 0, sumSquares: 0 };
      map.set(key, result);
    }
    return result;
  } // entry

  /** Accounts for a value associated with a given set of keys.
   *
   * @param {string} key
   * @param {number} value
   * @returns {object} - The updated entry.
   * @throws {TypeError} - If `value` is not a number.
  */
  account(key, value) {
    if (Number.isNaN(value)) {
      throw new TypeError(`Value for statistic "${key}" is NaN!`);
    }
    const entry = this.entry(key);
    entry.count += 1;
    entry.sum += value;
    entry.sumSquares += value * value;
    entry.min = Number.isNaN(entry.min) ? value : Math.min(entry.min, value);
    entry.max = Number.isNaN(entry.max) ? value : Math.max(entry.max, value);
    return entry;
  } // account

  /** Get the current statistics for the given key.
   * 
   * @param {string} key
   * @returns {object}
  */
  stat(key) {
    const { count, sum, min, max, sumSquares } = this.entry(key);
    const svar = count < 2 ? 0
      : (sumSquares - sum * sum / count) / (count - 1);
    return {
      key, count, sum, min, max, svar,
      avg: count && sum / count,
      stdDev: Math.sqrt(svar),
    };
  }

  /** Enumerates all statistics for each key. 
   * 
   * @yield {object}
  */
  * stats() {
    for (const key of this.map.keys()) {
      yield this.stat(key);
    }
  }

  /** Exports all entries as a string.
   *
   * @returns {string}
  */
  toString() {
    const fields = ['key', 'count', 'sum', 'avg', 'min', 'max', 'svar'];
    return [
      fields.join('\t'),
      ...((function* () {
        for (const stat of this.stats()) {
          yield fields.map((k) => stat[k]).join('\t');
        }
      })()),
    ].join('\n');
  }

} // class Statistics
