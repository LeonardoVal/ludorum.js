/** # Checkerboard

Base class for checkerboards representations based on several different data 
structures.
*/
var Checkerboard = utils.Checkerboard = declare({
	/** The base constructor only sets the board dimensions: `height` and 
	`width`.
	*/
	constructor: function Checkerboard(height, width) {
		if (!isNaN(height)) {
			this.height = height|0;
		}
		if (!isNaN(width)) {
			this.width = width|0;
		}
	},
	
	/** The value for empty squares is `emptySquare`. This will be used in 
	functions walking and traversing the board. 
	*/
	emptySquare: null,
	
	// ## Board information ####################################################
	
	/** All coordinates are represented by `[row, column]` arrays. To check if
	a coordinate is inside the board, use `isValidCoord(coord)`.
	*/
	isValidCoord: function isValidCoord(coord) {
		return Array.isArray(coord) && !isNaN(coord[0]) && !isNaN(coord[1])
			&& coord[0] >= 0 && coord[0] < this.height 
			&& coord[1] >= 0 && coord[1] < this.width;
	},
	
	/** Method `coordinates()` returns the sequence of the board's valid 
	positions; first by row then by column.
	*/
	coordinates: function coordinates() {
		return Iterable.range(this.height).product(Iterable.range(this.width));
	},
	
	/** Method `square(coord, outside)` should get the contents at a given 
	coordinate. If the coordinate is off the board, `outside` must be returned.
	This method is abstract so it must be overriden in subclasses.
	*/
	square: unimplemented('utils.Checkerboard', 'square'),
	
	/** A square is assumed to be empty when its value is equal to 
	`emptySquare`.
	*/
	isEmptySquare: function isEmptySquare(coord) {
		return this.square(coord) === this.emptySquare;
	},
	
	// ### Lines ###############################################################
	
	/** Many games must deal with line configurations of pieces. The following
	methods help with this kind of logic. Each line is a sequence of coordinates
	in the board.
	+ `horizontals()`: All the horizontal lines (rows).
	*/
	horizontals: function horizontals() {
		var width = this.width;
		return Iterable.range(this.height).map(function (row) {
			return Iterable.range(width).map(function (column) {
				return [row, column];
			});
		});
	},
	
	/** 
	+ `verticals()`: All the vertical lines (columns).
	*/
	verticals: function verticals() {
		var height = this.height;
		return Iterable.range(this.width).map(function (column) {
			return Iterable.range(height).map(function (row) {
				return [row, column];
			});
		});
	},
	
	/** 
	+ `orthogonals()`: All the horizontal (rows) and vertical lines (columns) in 
		the board.
	*/
	orthogonals: function orthogonals() {
		return this.horizontals().chain(this.verticals());
	},
	
	/**
	+ `positiveDiagonals()`: All the positive diagonals lines (those where 
		row = k + column).
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
	
	/** 
	+ `negativeDiagonals()`: All the negative diagonals lines (those where 
		row = k - column).
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
	
	/**
	+ `diagonals()`: All the diagonal lines in the board.
	*/
	diagonals: function diagonals() {
		return this.positiveDiagonals().chain(this.negativeDiagonals());
	},
	
	/**
	+ `lines()`: All the horizontal, vertical and diagonal lines in the board.
	*/
	lines: function lines() {
		return this.orthogonals().chain(this.diagonals());
	},
	
	/** The previous methods return the whole lines. Some times the game logic 
	demands checking lines of a certain length. These are sublines, and can be
	calculated by `sublines(lines, length)`. It obviously filters lines which
	are shorter than length.
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
	
	// ### Walks ###############################################################
	
	/** A walk is a sequence of coordinates in the board that start at a given
	point and advances in a certain direction. The `walk(coord, delta)` method
	returns an iterable with coordinates from `coord` and on, adding `delta`'s 
	row and column until going off the board.
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
	
	/** Convenient method `walks(coord, deltas)` can be used to get many walks
	from the same origin.
	*/
	walks: function walks(coord, deltas) {
		var board = this;
		return deltas.map(function (delta) {
			return board.walk(coord, delta);
		});
	},
	
	/** Frequently used deltas for walks are available at `DIRECTIONS`.
	*/
	"static DIRECTIONS": {
		HORIZONTAL: [[0,-1], [0,+1]],
		VERTICAL:   [[-1,0], [+1,0]], 
		ORTHOGONAL: [[0,-1], [0,+1], [-1,0], [+1,0]],
		DIAGONAL:   [[-1,-1], [-1,+1], [+1,-1], [+1,+1]],
		EVERY:      [[0,-1], [0,+1], [-1,0], [+1,0], [-1,-1], [-1,+1], [+1,-1], [+1,+1]]
	},
	
	// ## Board modification ###################################################
	
	/** Game states must not be modifiable, else game search algorithms may fail
	or be extremely complicated. Then, all board altering method in 
	`Checkerboard` must return a new board instance and leave this instance 
	unspoiled.
	
	Most board modification functions have two versions: one which actually
	modifies the board state and another which returns a modified copy. This is
	meant to optimize chains of board alterations. To get a copy of this board, 
	the `clone` method can be used.
	*/
	clone: unimplemented('utils.Checkerboard', 'clone'),
	
	/** The first function to change the board is `place(coord, value)`. It 
	places the value at the given coordinate, replacing whatever was there.
	
	The `__place__` version modifies this board, and is not implemented in the 
	base class. It should return this instance, to enable chaining.
	*/
	__place__: unimplemented('utils.Checkerboard', 'place'),
	
	place: function place(coord, value) {
		return this.clone().__place__(coord, value);
	},

	/** Another usual operation is `move(coordFrom, coordTo, valueLeft)`.
	It moves the contents at `coordFrom` to `coordTo`. Whatever is at `coordTo`
	gets replaced, and `valueLeft` is placed at `coordFrom`. If `valueLeft` is 
	undefined, `emptySquare` is used.
	*/
	__move__: function __move__(coordFrom, coordTo, valueLeft) {
		return this.__place__(coordTo, this.square(coordFrom))
			.__place__(coordFrom, typeof valueLeft === 'undefined' ? this.emptySquare : valueLeft);
	},
	
	move: function move(coordFrom, coordTo, valueLeft) {
		return this.clone().__move__(coordFrom, coordTo, valueLeft);
	},
	
	/** The next board operation is `swap(coordFrom, coordTo)`, which moves the 
	contents at `coordFrom` to `coordTo`, and viceversa.
	*/
	__swap__: function __swap__(coordFrom, coordTo) {
		var valueTo = this.square(coordTo);
		return this.__place__(coordTo, this.square(coordFrom))
			.__place__(coordFrom, valueTo);
	},
	
	swap: function swap(coordFrom, coordTo) {
		return this.clone().__swap__(coordFrom, coordTo);
	},
	
	// ## Board presentation. ##################################################
	
	/** Board games' user interfaces may be implemented using HTML & CSS. This
	is the case of Ludorum's playtesters.
	TODO.
	*/
	renderAsHTMLTable: function (document, container, callback) {
		var board = this, // for closures.
			table = document.createElement('table');
		container.appendChild(table);
		board.horizontals().reverse().forEach(function (line) {
			var tr = document.createElement('tr');
			table.appendChild(tr);
			line.forEach(function (coord) {
				var square = board.square(coord),
					td = document.createElement('td'),
					data = {
						id: "ludorum-square-"+ coord.join('-'),
						className: "ludorum-square",
						square: square,
						coord: coord,
						innerHTML: base.Text.escapeXML(square)
					};
				if (callback) {
					data = callback(data) || data;
				}
				td['ludorum-data'] = data;
				td.id = data.id;
				td.className = data.className;
				td.innerHTML = data.innerHTML;
				if (data.onclick) {
					td.onclick = data.onclick
				}
				tr.appendChild(td);
			});
		});
		return table;
	},
	
	// ## Heuristics ###########################################################
	
	/** A `weightedSum` is an simple way of defining an heuristic. Every 
	position in the board is assigned a weight, and every possible value is 
	assigned a coefficients (usually player is 1, opponent is -1, else is 0).
	
	Weights have to be in the same order that `coordinates()` enumerates the
	board's positions. This function assumes the weights are normalized and 
	sufficient to cover the whole board.
	*/
	weightedSum: function weightedSum(weights, coefficients) {
		var board = this;
		return this.coordinates().zip(weights).mapApply(function (coord, weight) {
			return coefficients[board.square(coord)] * weight || 0;
		}).sum();
	}
}); //// declare utils.Checkerboard.
