/* eslint-disable import/prefer-default-export */

/** Statistic accumulator
 *
 * @param {Map} [stats]
 * @param {object} keys
 * @param {number} datum
 * @returns {Map}
*/
export function addStatistic(stats, keys, datum) {
  stats = stats || new Map();
  const statKey = Object.entries(keys)
    .sort(([k1], [k2]) => k1.localeCompare(k2))
    .map(([k, v]) => `${k}\t${v}`)
    .join('\n');
  let stat = stats.get(statKey);
  if (!stat) {
    stat = {
      ...keys, count: 0, min: NaN, max: NaN, sum: 0, sumSquares: 0,
    };
    stats.set(statKey, stat);
  }
  stat.count += 1;
  stat.sum += datum;
  stat.sumSquares += datum * datum;
  if (Number.isNaN(stat.min) || stat.min > datum) {
    stat.min = datum;
  }
  if (Number.isNaN(stat.max) || stat.max < datum) {
    stat.max = datum;
  }
  return stats;
}

export default {
  addStatistic,
};
