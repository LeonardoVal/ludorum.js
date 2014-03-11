/** Base class for checkerboards based on several different data structures.
*/
boards.Checkerboard = declare({
	/** new boards.Checkerboard(height, width):
		The base constructor only sets the board dimensions.
	*/
	constructor: function Checkerboard(height, width) {
		if (!isNaN(height)) {
			this.height = +height >> 0;
		}
		if (!isNaN(width)) {
			this.width = +width >> 0;
		}
	},
	
	/** boards.Checkerboard.emptySquare=null:
		The value of empty squares.
	*/
	emptySquare: null,
	
// Board information. //////////////////////////////////////////////////////////
	
	/** boards.Checkerboard.isValidCoord(coord):
		Returns true if coord is an array with two numbers between this board's
		dimensions.
	*/
	isValidCoord: function isValidCoord(coord) {
		return Array.isArray(coord) && !isNaN(coord[0]) && !isNaN(coord[1])
			&& coord[0] >= 0 && coord[0] < this.height 
			&& coord[1] >= 0 && coord[1] < this.width;
	},
	
	/** boards.Checkerboard.horizontals():
		Returns an iterable of all the horizontal lines (rows) in the board, as
		a list of coordinates.
	*/
	horizontals: function horizontals() {
		var width = this.width;
		return Iterable.range(this.height).map(function (row) {
			return Iterable.range(width).map(function (column) {
				return [row, column];
			});
		});
	},
	
	/** boards.Checkerboard.verticals():
		Returns an iterable of all the vertical lines (columns) in the board, as
		a list of coordinates.
	*/
	verticals: function verticals() {
		var height = this.height;
		return Iterable.range(this.width).map(function (column) {
			return Iterable.range(height).map(function (row) {
				return [row, column];
			});
		});
	},
	
	/** boards.Checkerboard.orthogonals():
		Returns an iterable of all the horizontal (rows) and vertical lines 
		(columns) in the board, as a list of coordinates.
	*/
	orthogonals: function orthogonals() {
		return this.horizontals().chain(this.verticals());
	},
	
	/** boards.Checkerboard.positiveDiagonals():
		Returns an iterable of all the positive diagonals lines (those where 
		row = k + column), as a list of coordinates.
	*/
	positiveDiagonals: function positiveDiagonals() {
		var width = this.width, 
			height = this.height, 
			count = height + width - 1;
		return Iterable.range(count).map(function (i) {
			var row = Math.max(0, height - i - 1),
				column = Math.max(0, i - height + 1);
			return Iterable.range(Math.min(i + 1, count - i)).map(function (j) {
				return [row + j, column + j];
			});
		});
	},
	
	/** boards.Checkerboard.negativeDiagonals():
		Returns an iterable of all the negative diagonals lines (those where 
		row = k - column), as a list of coordinates.
	*/
	negativeDiagonals: function negativeDiagonals() {
		var width = this.width, 
			height = this.height, 
			count = height + width - 1;
		return Iterable.range(count).map(function (i) {
			var row = Math.min(i, height - 1),
				column = Math.max(0, i - height + 1);
			return Iterable.range(Math.min(i + 1, count - i)).map(function (j) {
				return [row - j, column + j];
			});
		});
	},
	
	/** boards.Checkerboard.diagonals():
		Returns an iterable of all the diagonal lines in the board, as a list 
		of coordinates.
	*/
	diagonals: function diagonals() {
		return this.positiveDiagonals().chain(this.negativeDiagonals());
	},
	
	/** boards.Checkerboard.lines():
		Returns an iterable of all the horizontal, vertical and diagonal lines 
		in the board, as a list of coordinates.
	*/
	lines: function lines() {
		return this.orthogonals().chain(this.diagonals());
	},
	
	/** boards.Checkerboard.sublines(lines, length):
		Returns an iterable of all sublines of the given lines with the given 
		length.
	*/
	sublines: function sublines(lines, length) {
		return iterable(lines).map(function (line) {
			return Array.isArray(line) ? line : iterable(line).toArray();
		}, function (line) {
			return line.length >= length;
		}).map(function (line) {
			return Iterable.range(0, line.length - length + 1).map(function (i) {
				return line.slice(i, i + length);
			});
		}).flatten();
	},
	
	/** abstract boards.Checkerboard.square(coord, outside):
		Returns the content of the square at the given coordinate ([row, 
		column]), or outside if the coordinate is not inside the board.
	*/
	square: function square(coord, outside) {
		throw new Error('boards.Checkerboard.square() is not implemented. Please override.');
	},
	
	/** boards.Checkerboard.walk(coord, delta):
		Returns an iterable with coordinates ([row, column]) from the given 
		coord and on, adding delta's row and column until going off the board.
	*/
	walk: function walk(coord, delta) {
		var board = this;
		return new Iterable(function __iter__() {
			var current = coord.slice();
			return function __walkIterator__() {
				if (board.isValidCoord(current)) {
					var result = current.slice();
					current[0] += delta[0];
					current[1] += delta[1];
					return result;
				} else {
					throw Iterable.STOP_ITERATION;
				}
			};
		});
	},
	
	/** boards.Checkerboard.walks(coord, deltas):
		Returns all walks from the given coord with each given delta.
	*/
	walks: function walks(coord, deltas) {
		var board = this;
		return deltas.map(function (delta) {
			return board.walk(coord, delta);
		});
	},
	
// Board modification. /////////////////////////////////////////////////////////

	/** abstract boards.Checkerboard.place(coord, value):
		Places value at coord, replacing whatever was there. Returns a new 
		instance of Checkerboard.
	*/
	place: function place(coord, value) {
		throw new Error('boards.Checkerboard.place() is not implemented. Please override.');
	},

	/** boards.Checkerboard.move(coordFrom, coordTo, valueLeft=this.emptySquare):
		Moves the contents at coordFrom to coordTo. Whatever coordTo is 
		replaced, and at coordFrom valueLeft is placed. Returns a new instance 
		of Checkerboard.
	*/
	move: function move(coordFrom, coordTo, valueLeft) {
		return this
			.place(coordTo, this.square(coordFrom))
			.place(coordFrom, typeof valueLeft === 'undefined' ? this.emptySquare : valueLeft);
	},
	
	/** boards.Checkerboard.swap(coordFrom, coordTo):
		Moves the contents at coordFrom to coordTo, and viceversa. Returns a new
		instance of Checkerboard.
	*/
	swap: function swap(coordFrom, coordTo) {
		var valueTo = this.square(coordTo);
		return this
			.place(coordTo, this.square(coordFrom))
			.place(coordFrom, valueTo);
	}
}); // declare boards.Checkerboard.
