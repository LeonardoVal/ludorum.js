global.expect.extend({
  /** Tests the type of the received value. If `type` is a string the `typeof`
   * operator is used. Else it is assumed `type` is a function, and the
   * `instanceof` operator is used.
  */
  toBeOfType(received, type) {
    const pass = typeof type === 'string'
      // eslint-disable-next-line valid-typeof
      ? (typeof received === type)
      : (received instanceof type);
    if (pass) {
      return {
        message: () => `expected ${received} not to be of type ${type}`,
        pass: true,
      };
    }
    return {
      message: () => `expected ${received} to be of type ${type}`,
      pass: false,
    };
  },
});
