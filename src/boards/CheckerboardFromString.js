/** Checkerboards represented by simple strings.
*/
boards.CheckerboardFromString = declare(boards.Checkerboard, {
	/** new boards.CheckerboardFromString(height, width, string, emptySquare='.'):
		A checkerboard represented by a string, each character being a square.
	*/
	constructor: function CheckerboardFromString(height, width, string, emptySquare) {
		boards.Checkerboard.call(this, height, width);
		if (emptySquare) {
			this.emptySquare = (emptySquare + this.emptySquare).charAt(0);
		}
		/** boards.CheckerboardFromString.string:
			The string representation of the board.
		*/
		if (string && string.length !== height * width) {
			throw new Error('Given string '+ JSON.stringify(string) +' does not match board dimensions.');
		}
		this.string = string || this.emptySquare.repeat(height * width);
	},
	
	/** boards.CheckerboardFromString.emptySquare='.':
		The character used to represent empty squares.
	*/
	emptySquare: '.',
	
	/** boards.CheckerboardFromString.square(row, column, outside=undefined):
		Return the character at (row * width + column) if the coordinate is 
		inside the board. Else returns the value of the outside argument.
	*/
	square: function square(row, column, outside) {
		if (row >= 0 && row < this.height && column >= 0 && column < this.width) {
			return this.string.charAt(row * this.width + column);
		} else {
			return outside;
		}
	},
	
	/** boards.CheckerboardFromString.place(coord, value):
		Returns a new board with the character at the given coord changed to
		value.
	*/
	place: function place(coord, value) {
		raiseIf(!this.isValidCoord(coord), "Invalid coordinate ", coord, ".");
		value = (value + this.emptySquare).charAt(0);
		var i = coord[0] * this.width + coord[1],
			newString = this.string.substr(0, i) + value + this.string.substr(i + 1);
		return new this.constructor(this.height, this.width, newString, this.emptySquare);
	},
	
	/** boards.CheckerboardFromString.toString():
		Prints the board one line by row, last row on top.
	*/
	toString: function toString() {
		var string = this.string, height = this.height, width = this.width;
		return Iterable.range(height).map(function (i) {
			return string.substr((height - i - 1) * width, width);
		}).join('\n');
	}
}); // declare boards.CheckerboardFromString

