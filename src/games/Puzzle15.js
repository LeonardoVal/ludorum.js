/** # Puzzle15

The [15 puzzle](https://en.wikipedia.org/wiki/15_puzzle) is a simple sliding puzzle, that consists 
in putting a set of pieces in order by moving them to the only empty space in the frame.

It is included here as a test of the support in Ludorum for singleplayer games. The only player in 
this game is `'Player'`.
*/
games.Puzzle15 = declare(Game, {
	name: "Puzzle15",
	players: ['Player'],
	
	width: 4,
	height: 4,
	target: '0123456789ABCDE ',
	maxMoves: 81,
	
	/** The constructor takes a `board` or builds one at random by default.	Also takes a 
	`moveNumber`, or 0 by default.
	*/
	constructor: function Puzzle15(args) {
		Game.call(this, this.players[0]);
		args = args || {};
		this.board = args.board || this.randomBoard();
		this.moveNumber = args.moveNumber |0;
	},
	
	/** The puzzle usually starts with a `randomBoard`.
	*/
	randomBoard: function randomBoard(width, height, rng, symbols) {
		width = (width |0) || this.width;
		height = (height |0) || this.height;
		rng = rng || Randomness.DEFAULT;
		symbols = symbols || Iterable.range(width * height - 1).map(function (n) {
			return n.toString(36);
		}).join('').toUpperCase();
		return new CheckerboardFromString(width, height, 
			rng.shuffle(' '+ symbols.substr(0, width * height - 1)).join(''), ' ');
	},
	
	/** The puzzle is finished when the pieces and the empty square are arranged in the `target`
	configuration.
	*/
	differences: function differences(target) {
		target = target || this.target;
		var str = this.board.string;
		return iterable(str).zip(target).map(function (p) {
			return p[0] === p[1] ? 0 : 1;
		}).sum();
	},
	
	/** The score of the player is the number of remaining moves.
	*/
	scores: function scores() {
		return obj(this.players[0], this.maxMoves - this.moveNumber);	
	},
	
	/** The puzzle can only end in victory, or remain unsolved.
	*/
	result: function result() {
		return this.differences() === 0 ? this.victory() : 
			this.moveNumber >= this.maxMoves ? this.defeat() : null;
	},
	
	/** The moves of the player are defined by the position of the empty square.
	*/
	emptyCoord: function emptyCoord() {
		var i = this.board.string.indexOf(' '),
			width = this.board.width;
		return [(i / width) |0, i % width];
	},
	
	/** The player can move the empty square up, down, left or right. A move is the coordinate where
	to move the empty square.
	*/
	moves: function moves() {
		var pos = this.emptyCoord(),
			board = this.board;
		if (this.result()) {
			return null;
		} else {
			return { Player: iterable(Checkerboard.DIRECTIONS.ORTHOGONAL).mapApply(function (dr, dc) {
					return [pos[0] + dr, pos[1] + dc];			
				}, this.board.isValidCoord.bind(this.board)).toArray()
			};
		}
	},
	
	/** The next game state is calculated simply by swapping the contents of the empty square and
	the given position in the board.
	*/
	next: function next(move, haps, update) {
		raiseIf(haps, "Haps are not required (given ", haps, ")!");
		var nextBoard = this.board.swap(this.emptyCoord(), move.Player);
		if (update) {
			this.board = nextBoard;
			this.moveNumber++;
			return this;
		} else {
			return new this.constructor({ board: nextBoard, moveNumber: this.moveNumber + 1 });
		}
	},
	
	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'Puzzle15',
		serializer: function serialize_Puzzle15(obj) {
			return [{ board: obj.board, moveNumber: obj.moveNumber }];
		}
	}	
}); // declare Puzzle15