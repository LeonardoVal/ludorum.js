/* eslint-disable import/prefer-default-export */
import BaseClass from './BaseClass';

/** Object used to account and process statistics.
*/
class Statistics extends BaseClass {
  /** The arguments are optional.
   *
   * @param {object} [args]
   * @param {Map} [args._map] - Optional map with preloaded entries.
  */
  constructor(args = null) {
    const { _map } = args || {};
    super();
    this
      ._prop('_map', _map, Map, new Map());
  }

  /** All entries have a set of keys, which are used to calculate an identifier
   * to use with the map.
   *
   * @param {object} keys
   * @returns {string}
  */
  entryId(keys) {
    return Object.entries(keys || {})
      .sort(([k1], [k2]) => k1.localeCompare(k2))
      .map(([k, v]) => `${JSON.stringify(k)}:${JSON.stringify(v)}`)
      .join(',');
  }

  /** Returns an entry for a given set of keys. If none is available, it creates
   * and adds one before returning it.
   *
   * @param {object} keys
   * @returns {object} - The entry for the `keys`.
  */
  entry(keys) {
    const { _map } = this;
    const entryId = this.entryId(keys);
    let result = _map.get(entryId);
    if (!result) {
      result = {
        ...keys,
        count: 0,
        min: NaN,
        max: NaN,
        sum: 0,
        sumSquares: 0,
      };
      _map.set(entryId, result);
    }
    return result;
  }

  /** Accounts for a value associated with a given set of keys.
   *
   * @param {object} keys
   * @param {number} value
   * @returns {object} - The updated entry.
   * @throws {TypeError} - If `value` is not a number.
  */
  account(keys, value) {
    if (Number.isNaN(value)) {
      throw new TypeError(`Value for statistic ${JSON.stringify(keys)} is NaN!`);
    }
    const entry = this.entry(keys);
    entry.count += 1;
    entry.sum += value;
    entry.sumSquares += value * value;
    entry.min = Number.isNaN(entry.min) ? value : Math.min(entry.min, value);
    entry.max = Number.isNaN(entry.max) ? value : Math.max(entry.max, value);
    return entry;
  }

  * entries() {
    yield* this._map.values();
  }

  * table() {
    const { _map } = this;
    const keySet = new Set();
    for (const entryId of _map.keys()) {
      Object.keys(JSON.parse(`{${entryId}}`)).forEach((key) => keySet.add(key));
    }
    const keyList = [...keySet].sort(([k1], [k2]) => k1.localeCompare(k2));
    yield [...keyList, 'count', 'sum', 'avg', 'min', 'max', 'var'];
    for (const stat of _map.values()) {
      const {
        count, sum, min, max, sumSquares,
      } = stat;
      yield [
        ...keyList.map((key) => stat[key]),
        count,
        sum,
        sum / count,
        min,
        max,
        count < 2 ? NaN : (sumSquares - sum * sum / count) / (count - 1),
      ];
    }
  }

  toTSV() {
    const escape = (str) => `${str}`.replaceAll(/[\\\t\n\r]/g, (m) => `\\${({
      '\\': '\\',
      '\n': 'n',
      '\r': 'r',
      '\t': 't',
    }?.[m] ?? m)}`);
    let result = '';
    for (const row of this.table()) {
      result += `${row.map(escape).join('\t')}\n`;
    }
    return result;
  }

  toString(format = 'tsv') {
    switch (format) {
      case 'tsv': return this.toTSV();
      default: throw new Error(`Unknown or unsupported format ${format}!`);
    }
  }
} // class Accountant

export default Statistics;
