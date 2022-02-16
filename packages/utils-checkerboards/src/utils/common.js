/** Calculates a column name formed by letters, with the same syntax as chess or
 * electronic spreadsheets. E.g. column 0 is 'a', column 1 is 'b', column 25 is
 * 'z', column 26 is 'aa', column 27 is 'ab', column 33 is 'ah', column 333 is
 * 'lv', etc.
 *
 * @param {integer} c
 * @returns {string}
*/
export const columnName = (c) => {
  if (c < 26) {
    return String.fromCharCode(c + 97);
  }
  let result = '';
  while (c / 26 >= 1) {
    result = String.fromCharCode(c % 26 + 97) + result;
    c = Math.floor(c / 26);
  }
  return String.fromCharCode(c + 96) + result;
};

/** Makes a coordinate array from its components.
 *
 * @param {integer} x
 * @param {integer} y
 * @returns {number[]}
*/
export const makeCoord = (x, y) => Uint16Array.of(x, y);

export default {
  columnName,
  makeCoord,
};
