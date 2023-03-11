/** Object used to account and process statistics.
*/
export class Statistics {
  /** The arguments are optional.
   *
   * @param {object} [args]
   * @param {Map} [args.map=null] - Optional map with preloaded entries.
  */
  constructor(args = null) {
    this.map = new Map(args?.map);
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
      result = {
        key,
        count: 0,
        min: NaN,
        max: NaN,
        sum: 0,
        sumSquares: 0,
      };
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

  /** Exports all entries in table format.
   *
   * @yields {(string | number)[]}
   */
  * table() {
    const { map } = this;
    yield ['key', 'count', 'sum', 'avg', 'min', 'max', 'var'];
    for (const stat of map.values()) {
      const {
        key, count, sum, min, max, sumSquares,
      } = stat;
      yield [
        key,
        count,
        sum,
        sum / count,
        min,
        max,
        count < 2 ? 0 : (sumSquares - sum * sum / count) / (count - 1),
      ];
    }
  }

  /** Exports all entries in TSV format.
   *
   * @returns {string}
  */
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

  /** Exports all entries as a string.
   *
   * @param {string} - So far the only supported format is TSV.
   * @returns {string}
  */
  toString(format = 'tsv') {
    switch (format) {
      case 'tsv': return this.toTSV();
      default: throw new Error(`Unknown or unsupported format ${format}!`);
    }
  }

  /** Wraps the `match` to gather statistics about the game.
   *
   * @param {Iterator<T>} match - A generator representing a match.
   * @param {object} [options] - Options
   * @param {function} [options.callback] - Function with signature (step,
   *   stats), called on each step before yielding it.
   * @yields {T}
  */
  async* accountMatch(match, options) {
    let game;
    let players;
    let stepCount = 0;
    for await (const step of match) {
      if (step.final) {
        const { result } = step;
        for (const [role, roleResult] of Object.entries(result)) {
          this.account(`${game.name}.result.${role}`, roleResult);
          const roleStatus = roleResult > 0 ? 'victories'
            : (roleResult < 0 ? 'defeats' : 'draws');
          this.account(`${game.name}.${roleStatus}.${role}`, roleResult);
          const player = players[role];
          this.account(`${player.name}.result.${game.name}`, roleResult);
          this.account(`${player.name}.${roleStatus}.${game.name}`, roleResult);
        }
        this.account(`${game.name}.length`, stepCount);
        break;
      }
      if (step.start) {
        game = step.start;
        players = step.players;
      }
      for (const [role, roleActions] of Object.entries(game.actions)) {
        if (roleActions && roleActions.length > 0) {
          this.account(`${game.name}.width.${role}`, roleActions.length);
        }
      }
      if (step.next) {
        game = step.next;
      }
      options?.callback?.(step, this);
      yield step;
      stepCount += 1;
    }
  } // accountMatch
} // class Statistics
