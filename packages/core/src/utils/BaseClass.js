/** Base class for Ludorum's classes. */
export class BaseClass {

// Static definitions __________________________________________________________

  static defProps(obj, props, baseDef = null) {
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
  }

// Instance definitions ________________________________________________________

  /** Shortcut for [Object.defineProperties](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperties).
   * 
   * @param {object} props
   * @param {object} [baseDef=null]
  */
  __props(props, baseDef = null) {
    this.constructor.defProps(this, props, baseDef);
  }

  /** Throws an error for a method that is not defined (a sort of _abstract_
   * definition).
   * 
   * @param {string} id
   */
  __undefined(id) {
    throw new Error(`${id} is not defined!`);
  }

  /** Returns a default string representation of the object.
   * 
   * @returns {string}
  */
  toString() {
    return `${this.constructor.name}${JSON.stringify(this)}`;
  }

} // class BaseClass
