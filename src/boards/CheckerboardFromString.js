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
	
// Board information. //////////////////////////////////////////////////////////
	
	/** boards.CheckerboardFromString.emptySquare='.':
		The character used to represent empty squares.
	*/
	emptySquare: '.',	
	
	/** boards.CheckerboardFromString.square(coord, outside=undefined):
		Return the character at (row * width + column) if the coordinate is 
		inside the board. Else returns the value of the outside argument.
	*/
	square: function square(coord, outside) {
		var row = coord[0], 
			column = coord[1],
			width = this.width;
		if (row >= 0 && row < this.height && column >= 0 && column < width) {
			return this.string.charAt(row * width + column);
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
	},
	
	/** boards.CheckerboardFromString.asString(line):
		Takes a line (iterable of coordinates) and returns a string with a
		character for each square.
	*/
	asString: function asString(line) {
		var board = this;
		return line.map(function (coord) {
			return board.square(coord);
		}).join('');
	},
	
	/** boards.CheckerboardFromString.asStrings(lines):
		Takes an iterable of lines (each being an iterable of coordinates) and 
		returns an iterable of strings for each line.
	*/
	asStrings: function asStrings(lines) {
		var board = this;
		return lines.map(function (line) {
			return board.asString(line);
		});
	},
	
	/** boards.CheckerboardFromString.asRegExp(line, insideLine, outsideLine='.'):
		Takes a line (iterable of coordinates) and returns a string with a 
		regular expression. This may be used to tests the whole board string for
		the line.
		Warning! Both insideLine and outsideLine must be simple regular 
		expressions (e.g. a character or atom). If more complex expressions are
		required they must be provided between parenthesis.
	*/
	asRegExp: function asRegExp(line, insideLine, outsideLine) {
		outsideLine = outsideLine || '.';
		var width = this.width,
			squares = Iterable.repeat(false, width * this.height).toArray();
		line.forEach(function (coord) {
			squares[coord[0] * width + coord[1]] = true;
		});
		var result = '', count = 0, current;
		for (var i = 0; i < squares.length; count = 0) {
			current = squares[i];
			do {
				++count;
			} while (++i < squares.length && squares[i] === current);
			if (count < 2) {
				result += current ? insideLine : outsideLine;
			} else {
				result += (current ? insideLine : outsideLine) +'{'+ count +'}';
			}
		}
		return result;
	},
	
	/** boards.CheckerboardFromString.asRegExps(lines, insideLine, outsideLine='.'):
		Takes a sequence of lines (each a sequence of coordinates) and returns a
		string with a regular expression, as the union of the regular expression
		for each line.
	*/
	asRegExps: function asRegExps(lines, insideLine, outsideLine) {
		var board = this;
		return lines.map(function (line) {
			return board.asRegExp(line, insideLine, outsideLine);
		}).join('|');
	}
}); // declare boards.CheckerboardFromString
