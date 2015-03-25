/** # Checkerboard from pieces

[`Checkerboard`](Checkerboard.html) implementation represented by a list of pieces (objects) with a
location in the board.
*/
var CheckerboardFromPieces = utils.CheckerboardFromPieces = declare(Checkerboard, {
	/** The constructor takes `height`, `width`, a list of piece objects and optionally the empty 
	square object. The piece objects must have a property `position`. Only one piece is allowed at
	each square.
	*/
	constructor: function CheckerboardFromPieces(height, width, pieces, emptySquare) {
		Checkerboard.call(this, height, width);
		if (arguments.length > 3) {
			this.emptySquare = emptySquare;
		}
		this.pieces = iterable(pieces || []).map(function (piece) {
			var position = piece.position;
			return [position[0] * width + position[1], piece];
		}).toObject();
	},
	
	/** The `emptySquare` in `CheckerboardFromPieces` is `null` by default.
	*/
	emptySquare: null,	
	
	/** The default string conversion of `CheckerboardFromPieces` prints the piece list.
	*/
	toString: function toString() {
		return '['+ iterable(this.pieces).select(1).join(', ') +']';
	},
	
	// ## Board information ########################################################################
	
	/** The `square(coord, outside)` return the piece object at the given `coord` if there is one 
	and the coordinate is inside the board. Else returns `outside`.
	*/
	square: function square(coord, outside) {
		var pos = coord[0] * this.width + coord[1];
		return this.pieces.hasOwnProperty(pos) ? this.pieces[pos] : outside;
	},
	
	// ## Board modification #######################################################################
	
	/** Cloning a `CheckerboardFromPieces` simply calls the constructor again with the proper 
	arguments to replicate this instance.
	
	Warning! The list of pieces is copied shallowly.
	*/
	clone: function clone() {
		var newPieces = [].concat(this.pieces);
		if (this.hasOwnProperty('emptySquare')) {
			return new this.constructor(this.height, this.width, newPieces, this.emptySquare);
		} else {
			return new this.constructor(this.height, this.width, newPieces);
		}
	},
	
	/** A `place(coord, value)` means removing any existing piece at the given `coord` and adding 
	the `value` piece if given.
	*/
	__place__: function __place__(coord, value) {
		raiseIf(!this.isValidCoord(coord), "Invalid coordinate ", coord, "!");
		var pos = coord[0] * this.width + coord[1];
		delete this.pieces[pos];
		if (value) {
			this.pieces[pos] = value;
		}
		return this;
	}
}); // declare utils.CheckerboardFromPieces
