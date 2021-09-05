import RangeAleatory from './RangeAleatory';

/** Dice are implemented with `RangeAleatory`. The `dice` object can create
 * these aleatories by getting members with a name like `Dn`. The standard
 * cubic die would be `D6`.
*/
const dice = new Proxy({}, {
  get(target, propName, _receiver) {
    const match = /D(\d+)/.exec(propName);
    if (match) {
      return new RangeAleatory({ min: 1, max: +match[1] });
    }
    return target[propName]; // Default behaviour.
  },
});

export default dice;
