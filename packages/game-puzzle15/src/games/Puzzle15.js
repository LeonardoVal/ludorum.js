import SlidingPuzzle from './SlidingPuzzle';

/** The [15 puzzle](https://en.wikipedia.org/wiki/15_puzzle) is a classic simple
 * sliding puzzle, with 15 pieces in a board of 4 by 4 squares.
*/
const Puzzle15 = SlidingPuzzle.subclass({
  name: 'Puzzle15',
  height: 4,
  maxMoves: 81,
  width: 4,
});

export default Puzzle15;
