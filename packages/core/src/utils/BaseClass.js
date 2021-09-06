const typeCheckers = {
  boolean(type) {
    return !type && 'checks failed';
  },
  function(type, value) {
    return !(value instanceof type) && `expected ${type.name}`;
  },
  string(type, value) {
    // eslint-disable-next-line valid-typeof
    return typeof value !== type && `expected ${type}`;
  },
};

/** Base class for all classes in this package.
 *
 * @class
*/
class BaseClass {
  /** Raises an error saying the definition is not implemented. Used to simulate
   * abstract members.
   *
   * @param {string} id - Name used for the error message.
   * @throws {Error}
   */
  _unimplemented(id) {
    const name = `${this.constructor.name}.${id}`;
    const message = `${name} not implemented! Please override.`;
    throw new Error(message);
  }

  /** Checks the given `value` against a `type`. If `type` is:
   * + a `string`, the `typeof value` is compared;
   * + a `function`, it is assumed to be a class and `instanceof` is used;
   * + a `boolean`, it is assumed to result from a check, and expected to be
   *   true.
   * If `ErrorType` is given, a failure of the check results in an exception
   * being thrown. Otherwise a boolean value is returned.
   *
   * @param {any} value
   * @param {any} type
   * @param {class} [ErrorType=null]
   * @returns {boolean}
   * @throws {ErrorType}
  */
  static checkType(value, type, ErrorType = null) {
    const error = typeCheckers[typeof type](type, value);
    if (error && ErrorType) {
      // eslint-disable-next-line no-nested-ternary
      throw new ErrorType(`Type mismatch for ${value}, ${error}!`);
    }
    return !error;
  }

  /** Instance version of the static method `checkType`.
   *
   * @see {@link BaseClass.checkType}
  */
  _checkType(...args) {
    return BaseClass.checkType(...args);
  }

  /** Ensures a `value` matches a type. If `value` is `undefined`, and a
   * `defaultValue` is given, this is used instead.
   *
   * @param {any} value - Value to check.
   * @param {any} [type=undefined] - Expected type for `value`, or undefined to
   *   disable the check.
   * @param {any} [defaultValue=undefined] - Default value, to use when `value`
   *   is `undefined`. A default value of `undefined` means there is no default
   *   value.
  */
  static typedValue(value, type = undefined, defaultValue = undefined) {
    if (value === undefined && defaultValue !== undefined) {
      value = defaultValue;
    }
    if (type !== undefined) {
      this.checkType(value, type, TypeError);
    }
    return value;
  }

  /** Instance version of the static method `typedValue`.
   *
   * @see {@link BaseClass.typedValue}
  */
  _typedValue(...args) {
    return BaseClass.typedValue(...args);
  }

  /** Shortcut for `Object.defineProperty` with type checking and default value.
   *
   * @param {object} obj - Object to which to add the property.
   * @param {string} id - Property name.
   * @param {any} value - Property value.
   * @param {any} type - Expected type for `value`, or undefined to disable the
   *   check.
   * @param {any} defaultValue - Default value, to use when `value` is
   *   `undefined`. A default value of `undefined` indicates the property to be
   *   optional.
   * @returns {object} - The given `obj`.
   * @throws {TypeError} - If either `value` or `defaultValue` don't match the
   *   given `type`.
  */
  static prop(obj, id, value, type, ...args) {
    if (value === undefined && args.length > 0 && args[0] === undefined) {
      return obj; // Property assumed to be optional and skipped.
    }
    Object.defineProperty(obj, id, {
      value: this.typedValue(value, type, ...args),
      writable: true,
    });
    return obj;
  }

  /** Instance version of the static method `prop`.
   *
   * @see {@link BaseClass.prop}
  */
  _prop(...args) {
    return BaseClass.prop(this, ...args);
  }

  // TODO const - for non-writable properties.
  // TODO memoize
} // class BaseClass

export default BaseClass;
