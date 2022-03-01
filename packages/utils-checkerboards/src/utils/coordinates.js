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

// coord types: array, int, string, null

const checkedArrayLength = (array, dimensions) => {
  const arrayLength = array.length;
  if (arrayLength !== dimensions.length) {
    throw new Error(`Expected array to have ${dimensions.length} dimensions, but has ${array.length}!`);
  }
  return arrayLength;
};

const checkedArrayValue = (array, i, dimensions) => {
  const value = array[i];
  if (value < 0 || value >= dimensions[i]) {
    throw new Error(`Coordinate (${array}) is out of bounds (${dimensions})!`);
  }
  return value;
};

/** Converts an array coordinate to an index (integer) coordinate.
 *
 * @param {number[]} array
 * @param {number[]} dimensions
 * @returns {number}
*/
export const coordArrayToInt = (array, dimensions) => {
  const lastI = checkedArrayLength(array, dimensions) - 1;
  let factor = 1;
  let sum = checkedArrayValue(array, lastI, dimensions);
  for (let i = lastI - 1; i >= 0; i -= 1) {
    const value = array[i];
    factor *= dimensions[i];
    sum = sum * factor + checkedArrayValue(array, i, dimensions);
  }
  return sum;
};

/** Converts an index (integer) coordinate to an array coordinate.
 *
 * @param {number} int
 * @param {number[]} dimensions
 * @param {Class<TypedArray>} ArrayType
 * @returns {TypedArray}
*/
export const coordIntToArray = (int, dimensions, ArrayType) => {
  if (Number.isNaN(int) || int < 0) {
    throw new Error(`Invalid number ${int} for coordinate!`);
  }
  const len = dimensions.length;
  const array = new ArrayType(len);
  let n = int;
  for (let i = 0; i < len; i += 1) {
    const size = dimensions[i];
    array[i] = n % size;
    n = Math.trunc(n / size);
  }
  if (n > 0) {
    throw new Error(`Invalid number ${int} for coordinate!`);
  }
  return array;
};

/** Converts an array coordinate to a string.
 *
 * @param {number[]} array
 * @param {number[]} dimensions
 * @returns {string}
*/
export const coordArrayToString = (array, dimensions) => {
  if (checkedArrayLength(array, dimensions) !== 2) {
    throw new Error(`Algebraic notation is not supported for ${dimensions.length} dimensions!`);
  }
  return `${columnName(checkedArrayValue(array, 0, dimensions))}${
    checkedArrayValue(array, 1, dimensions) + 1}`;
};

/** Converts a string to an array coordinate.
 *
 * @param {string} str
 * @param {number[]} dimensions
 * @param {Class<TypedArray>} ArrayType
 * @returns {TypedArray}
*/
export const coordStringToArray = (str, dimensions, ArrayType) => {
  throw new Error('coordStringToArray is not implemented yet!'); // TODO
};

/** Checks if an array coordinate is valid or not.
 *
 * @param {number[]} array
 * @param {number[]} dimensions
 * @returns {boolean}
*/
export const isValidArrayCoord = (array, dimensions) => array.length === dimensions.length
  && array.every((value, i) => value >= 0 && value < dimensions[i]);

/** Checks if an index (integer) coordinate is valid or not.
 *
 * @param {number} int
 * @param {number[]} dimensions
 * @returns {boolean}
*/
export const isValidIntCoord = (int, dimensions) => !Number.isNaN(int) && int >= 0
  && int < dimensions.reduce((p, n) => p * n, 1);

/** Converts coordinates from one type to another. Available types are: `'int'`
 * (`'number'`), `'array'` and `'string'`.
 *
 * @param {number} int
 * @param {number[]} dimensions
 * @returns {boolean}
*/
export const coordinate = (value, type, args) => {
  const { dimensions, arrayType } = args;
  switch (`${typeof value} ${type}`) {
    case 'object int': return coordArrayToInt(value, dimensions);
    case 'object string': return coordArrayToString(value, dimensions);
    case 'object boolean': return isValidArrayCoord(value, dimensions);
    case 'number array': return coordIntToArray(value, dimensions, arrayType);
    case 'number string': return coordArrayToString(
      coordIntToArray(value, dimensions, arrayType),
      dimensions,
    );
    case 'number boolean': return isValidIntCoord(value, dimensions);
    case 'string array': return coordStringToArray(value, dimensions, arrayType);
    case 'string int': return coordArrayToInt(
      coordStringToArray(value, dimensions, arrayType),
      dimensions,
    );
    case 'string boolean': return isValidArrayCoord(
      coordStringToArray(value, dimensions, arrayType),
      dimensions,
    );
    default: throw new Error(`Cannot convert coordinate ${value} to ${type}!`);
  }
};
