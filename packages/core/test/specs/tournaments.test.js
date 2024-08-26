import { describe, expect, test } from 'vitest';
import { RoundRobinTournament, Tournament } from '../../src/tournaments';

describe('tournaments', () => {
  test('expected definitions', () => {
    expect(typeof Tournament).toBe('function');
    expect(typeof RoundRobinTournament).toBe('function');
  });

  
}); // describe 'tournaments'
