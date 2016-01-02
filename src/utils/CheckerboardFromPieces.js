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
		var board = this;
		if (emptySquare !== this.emptySquare) {
			this.emptySquare = emptySquare;
		}
		if (Array.isArray(pieces)) {
			this.pieces = {}; 
			iterable(pieces || []).forEach(function (piece) {
				raiseIf(!Array.isArray(piece.position), "Piece has not a position (", piece, ")!");
				board.pieces[piece.position +''] = piece;
			});
		} else if (typeof pieces === 'object') {
			this.pieces = base.copy({}, pieces);
		} else {
			raise("Invalid pieces definition: ", pieces, "!");
		}
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
		return this.pieces[coord] || outside;
	},
	
	// ## Board modification #######################################################################
	
	/** Cloning a `CheckerboardFromPieces` simply calls the constructor again with the proper 
	arguments to replicate this instance. The `pieces` object is copied _shallowly_ by the 
	constructor.
	*/
	clone: function clone() {
		return new this.constructor(this.height, this.width, this.pieces, this.emptySquare);
	},
	
	/** A `place(coord, value)` means removing any existing piece at the given `coord` and adding 
	the `value` piece if given.
	*/
	__place__: function __place__(coord, value) {
		raiseIf(!this.isValidCoord(coord), "Invalid coordinate ", coord, "!");
		var id = coord +'';
		delete this.pieces[id];
		if (value) {
			this.pieces[id] = value;
		}
		return this;
	},
	
	// ## Utilities ################################################################################
	
	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'CheckerboardFromPieces',
		serializer: function serialize_CheckerboardFromPieces(obj) {
			var r = [obj.height, obj.width, obj.pieces];
			if (obj.hasOwnProperty('emptySquare')) {
				r.push(obj.emptySquare);
			}
			return r;
		}
	}
}); // declare utils.CheckerboardFromPieces
