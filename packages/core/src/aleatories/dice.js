import RangeAleatory from './RangeAleatory';

const dice = new Proxy({}, {
  get(target, propName, receiver) {
    const match = /D(\d+)/.exec(propName);
    if (match) {
      return new RangeAleatory({ min: 1, max: +match[1] });
    }
    return target[propName]; // Default behaviour.
  },
});

export default dice;
