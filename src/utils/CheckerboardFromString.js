/** # CheckerboardFromString

[`Checkerboard`](Checkerboard.html) implementation represented by a simple 
string (one character per square).
*/
var CheckerboardFromString = utils.CheckerboardFromString = declare(Checkerboard, {
	/** The constructor takes `height`, `width`, the whole board content in a 
	`string`, and optionally the empty square character.
	*/
	constructor: function CheckerboardFromString(height, width, string, emptySquare) {
		Checkerboard.call(this, height, width);
		if (emptySquare) {
			this.emptySquare = (emptySquare + this.emptySquare).charAt(0);
		}
		if (string && string.length !== height * width) {
			throw new Error('Given string '+ JSON.stringify(string) +' does not match board dimensions.');
		}
		this.string = string || this.emptySquare.repeat(height * width);
	},
	
	/** The `emptySquare` in `CheckerboardFromString` is `'.'` by default.
	*/
	emptySquare: '.',	
	
	/** The default string conversion of `CheckerboardFromString` prints the 
	board one line by row, last row on top.
	*/
	toString: function toString() {
		var string = this.string, height = this.height, width = this.width;
		return Iterable.range(height).map(function (i) {
			return string.substr((height - i - 1) * width, width);
		}).join('\n');
	},
	
	// ## Board information ####################################################
	
	/** The `square(coord, outside)` return the character at `(row * width + 
	column)` if the coordinate is inside the board. Else returns `outside`.
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
	
	// ### Lines ###############################################################
	
	/** Since square contents in `CheckerboardFromString` are just characters,
	lines can be thought as strings. The method `asString(line)` takes an
	iterable of coordinates and returns a string of the characters found at each
	point in the sequence.
	*/
	asString: function asString(line) {
		var board = this;
		return line.map(function (coord) {
			return board.square(coord);
		}).join('');
	},
	
	/** The method `asStrings(lines)` can be used to easily map `asString(line)`
	to a sequence of lines, like the one calculated by `lines()`.
	*/
	asStrings: function asStrings(lines) {
		var board = this;
		return lines.map(function (line) {
			return board.asString(line);
		});
	},
	
	/** Many games based on board configurations (like connection games) have 
	patterns that can be expressed with regular expressions. The method 
	`asRegExp(line, insideLine, outsideLine)` takes a line (iterable of 
	coordinates) and returns a string with a regular expression. This may be 
	used to tests the whole board string for the line.
	
	_Warning!_ Both `insideLine` and `outsideLine` must be simple regular 
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
	
	/** The method `asRegExps(lines)` can be used to easily map `asRegExp(line)`
	to a sequence of lines. All regular expressions are joined as a union (`|`).
	Use with caution, because the whole regular expression can get very big even
	with small boards.
	*/
	asRegExps: function asRegExps(lines, insideLine, outsideLine) {
		var board = this;
		return lines.map(function (line) {
			return board.asRegExp(line, insideLine, outsideLine);
		}).join('|');
	},
	
	// ## Board modification ###################################################
	
	/** Cloning a CheckerboardFromString simply calls the constructor again
	with the proper arguments to replicate this instance.
	*/
	clone: function clone() {
		return new this.constructor(this.height, this.width, this.string, 
			this.hasOwnProperty('emptySquare') ? this.emptySquare : undefined);
	},
	
	/** A `place(coord, value)` means only changing one character in the
	underlying string. The `value` must be a character, and `coord` a point
	inside the board.
	*/
	__place__: function __place__(coord, value) {
		raiseIf(!this.isValidCoord(coord), "Invalid coordinate ", coord, ".");
		value = (value + this.emptySquare).charAt(0);
		var i = coord[0] * this.width + coord[1];
		this.string = this.string.substr(0, i) + value + this.string.substr(i + 1);
		return this;
	}
}); // declare utils.CheckerboardFromString
