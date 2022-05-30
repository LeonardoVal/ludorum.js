import { MatchProvider, useMatch } from '../../src/index';

describe('MatchProvider', () => {
  it('is defined as expected', () => {
    expect(MatchProvider).toBeOfType('function');
    expect(useMatch).toBeOfType('function');
  });
}); // describe MatchProvider
