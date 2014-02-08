/** Base class for checkerboards based on several different data structures.
*/
boards.Checkerboard = declare({
	/** new boards.Checkerboard(height, width):
		The base constructor only sets the board dimensions.
	*/
	constructor: function Checkerboard(height, width) {
		if (!isNaN(height)) {
			this.height = +height | 0;
		}
		if (!isNaN(width)) {
			this.width = +width | 0;
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
		Returns an iterable of all the horizontal lines (rows) in the board.
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
		Returns an iterable of all the vertical lines (columns) in the board.
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
		(columns) in the board.
	*/
	orthogonals: function orthogonals() {
		return this.horizontals().chain(this.verticals());
	},
	
	/** boards.Checkerboard.positiveDiagonals():
		Returns an iterable of all the positive diagonals lines (those where 
		row = k + column).
	*/
	positiveDiagonals: function positiveDiagonals() {
		var width = this.width, height = this.height, count = height + width - 1;
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
		row = k - column).
	*/
	negativeDiagonals: function negativeDiagonals() {
		var width = this.width, height = this.height, count = height + width - 1;
		return Iterable.range(count).map(function (i) {
			var row = Math.min(i, height - 1),
				column = Math.max(0, i - height + 1);
			return Iterable.range(Math.min(i + 1, count - i)).map(function (j) {
				return [row - j, column + j];
			});
		});
	},
	
	/** boards.Checkerboard.diagonals():
		Returns an iterable of all the diagonal lines in the board.
	*/
	diagonals: function diagonals() {
		return this.positiveDiagonals().chain(this.negativeDiagonals());
	},
	
	/** boards.Checkerboard.lines():
		Returns an iterable of all the horizontal, vertical and diagonal lines 
		in the board.
	*/
	lines: function lines() {
		return this.orthogonals().chain(this.diagonals());
	},
	
	/** abstract boards.Checkerboard.square(row, column, outside):
		Returns the content of the square at the given coordinate, or outside if
		the coordinate is not inside the board.
	*/
	square: function square(row, column, outside) {
		throw new Error('boards.Checkerboard.square() is not implemented. Please override.');
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
			.place(coordTo, this.square(coordFrom[0], coordFrom[1]))
			.place(coordFrom, typeof valueLeft === 'undefined' ? this.emptySquare : valueLeft);
	},
	
	/** boards.Checkerboard.swap(coordFrom, coordTo):
		Moves the contents at coordFrom to coordTo, and viceversa. Returns a new
		instance of Checkerboard.
	*/
	swap: function swap(coordFrom, coordTo) {
		var valueTo = this.square(coordTo[0], coordTo[1]);
		return this
			.place(coordTo, this.square(coordFrom[0], coordFrom[1]))
			.place(coordFrom, valueTo);
	}	
}); // declare boards.Checkerboard.
