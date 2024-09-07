import { describe, expect, test } from 'vitest';
import { CheckerboardFromSquareList } from '../../src/index';

describe('CheckerboardFromSquareList', () => {
  test('is defined', () => {
    expect(CheckerboardFromSquareList).toBeTypeOf('function');
  });

}); // describe 'CheckerboardFromSquareList'
