import { RoundRobinTournament, Tournament } from '../../src/tournaments';

describe('tournaments', () => {
  test('expected definitions', () => {
    expect(Tournament).toBeOfType('function');
    expect(RoundRobinTournament).toBeOfType('function');
  });
}); // describe 'tournaments'
