/** .
*/
games.ConnectFour = declare(Game, {
	/** games.ConnectFour.height=6:
		Number of rows in the ConnectFour board.
	*/
	height: 6,
	
	/** games.ConnectFour.width=7:
		Number of columns in the ConnectFour board.
	*/
	width: 7,
	
	/** new games.ConnectFour(activePlayer=players[0], board=<empty board>):
		Builds a new game state for Connect Four.
	*/
	constructor: function ConnectFour(activePlayer, board, height, width) {
		Game.call(this, activePlayer);
		if (!isNaN(height) && this.height !== +height) {
			this.height = +height;
		}
		if (!isNaN(width) && this.width !== +width) {
			this.width = +width;
		}
		/** games.ConnectFour.board:
			ConnectFour board as a string.
		*/
		this.board = (board instanceof boards.CheckerboardFromString) ? board :
			new boards.CheckerboardFromString(this.height, this.width, 
				(board || '.'.repeat(this.height * this.width)) +''
			);
	},

	name: 'ConnectFour',
	
	/** games.ConnectFour.players=['Yellow', 'Red']:
		Connect Four's players.
	*/
	players: ['Yellow', 'Red'],
	
	/* Cache of lines to accelerate the result calculation. */
	__lines__: (function () {
		var CACHE = {};
		function __lines__(height, width) {
			var key = height +'x'+ width;
			if (!CACHE.hasOwnProperty(key)) {
				var board = new boards.CheckerboardFromString(height, width, '.'.repeat(height * width));
				CACHE[key] = board.lines().map(function (line) {
					return line.toArray();
				}, function (line) {
					return line.length >= 4;
				}).toArray();
			}
			return CACHE[key];
		}
		__lines__.CACHE = CACHE;
		return __lines__;
	})(),
	
	/** games.ConnectFour.result():
		A Connect Four game ends when whether player gets four pieces aligned
		(either horizontally, vertically or diagonally), then winning the game.
		The match ends in a tie if the board gets full.
	*/
	result: function result() {
		var lines = this.board.asStrings(this.__lines__(this.height, this.width)).join(' ');
		if (lines.indexOf('0000') >= 0) { // Yellow wins.
			return this.victory([this.players[0]]);
		} else if (lines.indexOf('1111') >= 0) { // Red wins.
			return this.victory([this.players[1]]);
		} else if (lines.indexOf('.') < 0) { // No empty squares means a tie.
			return this.draw();
		} else {
			return null; // The game continues.
		}
	},
	
	/** games.ConnectFour.moves():
		Return the index of every column that has not reached the top height.
	*/
	moves: function moves() {
		var result = null;
		if (!this.result()) {
			var ms = [],
				board = this.board.string,
				offset = (this.height - 1) * this.width;
			for (var i = 0; i < board.length; ++i) {
				if (board.charAt(offset + i) === '.') {
					ms.push(i);
				}
			}
			if (ms.length > 0) {
				result = {};
				result[this.activePlayer()] = ms;
			}
		}
		return result;
	},

	/** games.ConnectFour.next(moves):
		Each ConnectFour move is a column index.
	*/
	next: function next(moves) {
		var activePlayer = this.activePlayer(),
			board = this.board.string,
			column = +moves[activePlayer],
			height = this.height,
			width = this.width;
		for (var row = 0; row < height; ++row) {
			if (board.charAt(row * width + column) === '.') {
				return new this.constructor(this.opponent(), 
					this.board.place([row, column], activePlayer === this.players[0] ? '0' : '1'));
			}
		}
		throw new Error('Invalid move '+ JSON.stringify(moves) +'!');
	},
	
	/** games.ConnectFour.toHTML():
		Renders the ConnectFour board as a HTML table.
	*/
	toHTML: function toHTML() {
		var moves = this.moves(),
			activePlayer = this.activePlayer(),
			board = this.board;
		moves = moves && moves[activePlayer];
		return '<table>'+
			'<colgroup>'+ '<col/>'.repeat(this.board.width) +'</colgroup>'+
			board.horizontals().reverse().map(function (line) {
				return '<tr>'+ line.map(function (coord) {
					var data = '',
						value = board.square(coord);
					if (moves && moves.indexOf(coord[1]) >= 0) {
						data = ' data-ludorum="move: '+ coord[1] +', activePlayer: \''+ activePlayer +'\'"';
					}
					return (value === '.') ? '<td '+ data +'>&nbsp;</td>'
						: '<td class="ludorum-player'+ value +'" '+ data +'>&#x25CF;</td>';
				}).join('') +'</tr>';
			}).join('') + '</table>';
	},
	
	__serialize__: function __serialize__() {
		return [this.name, this.activePlayer(), this.board.string, this.board.height, this.board.width];
	}
}); // declare ConnectFour.
