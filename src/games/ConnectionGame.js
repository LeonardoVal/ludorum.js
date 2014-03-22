games.ConnectionGame = declare(Game, {
	/** games.ConnectionGame.height=9:
		Number of rows in the board.
	*/
	height: 9,
	
	/** games.ConnectionGame.width=9:
		Number of columns in the board.
	*/
	width: 9,
	
	/** games.ConnectionGame.lineLength=5:
		Length of the line required to win.
	*/
	lineLength: 5,

	/** new games.ConnectionGame(activePlayer=players[0], board=<empty board>):
		Builds a new connection game.
	*/
	constructor: function ConnectionGame(activePlayer, board) {
		Game.call(this, activePlayer);
		/** games.ConnectionGame.board:
			Instance of boards.CheckerboardFromString.
		*/
		this.board = (board instanceof boards.CheckerboardFromString) ? board :
			new boards.CheckerboardFromString(this.height, this.width, 
				(board || '.'.repeat(this.height * this.width)) +''
			);
	},

	name: 'ConnectionGame',
	
	/** games.ConnectionGame.players=['First', 'Second']:
		Connection game's default players.
	*/
	players: ['First', 'Second'],
	
	/* Cache of lines to accelerate the result calculation. */
	__lines__: (function () {
		var CACHE = {};
		function __lines__(height, width, lineLength) {
			var key = height +'x'+ width +'/'+ lineLength;
			if (!CACHE.hasOwnProperty(key)) {
				var board = new boards.CheckerboardFromString(height, width, '.'.repeat(height * width));
				CACHE[key] = board.lines().map(function (line) {
					return line.toArray();
				}, function (line) {
					return line.length >= lineLength;
				}).toArray();
			}
			return CACHE[key];
		}
		__lines__.CACHE = CACHE;
		return __lines__;
	})(),
	
	/** games.ConnectionGame.result():
		A connection game ends when whether player gets the required amount of
		pieces aligned (either horizontally, vertically or diagonally), then 
		winning the game. The match ends in a tie if the board gets full.
	*/
	result: function result() {
		if (this.hasOwnProperty('__result__')) {
			return this.__result__;
		}
		var lineLength = this.lineLength,
			lines = this.board.asStrings(this.__lines__(this.height, this.width, lineLength)).join(' ');
		for (var i = 0; i < this.players.length; ++i) {
			if (lines.indexOf(i.toString(36).repeat(lineLength)) >= 0) {
				return this.__result__ = this.victory([this.players[i]]);
			}
		}
		if (lines.indexOf('.') < 0) { // No empty squares means a tie.
			return this.__result__ = this.draw();
		}
		return this.__result__ = null; // The game continues.
	},
	
	/** games.ConnectionGame.moves():
		Return the index of every empty square.
	*/
	moves: function moves() {
		if (this.hasOwnProperty('__moves__')) {
			return this.__moves__;
		} else if (this.result()) {
			return this.__moves__ = null;
		} else {
			return this.__moves__ = obj(this.activePlayer(), 
				iterable(this.board.string).filter(function (c) {
					return c === '.';
				}, function (c, i) {
					return i;
				}).toArray()
			);
		}
	},

	/** games.ConnectionGame.next(moves):
		Places a active player's piece in the given square.
	*/
	next: function next(moves) {
		var activePlayer = this.activePlayer(),
			playerIndex = this.players.indexOf(activePlayer),
			squareIndex = +moves[activePlayer],
			row = (squareIndex / this.width) >> 0,
			column = squareIndex % this.width;
		return new this.constructor((playerIndex + 1) % this.players.length, 
			this.board.place([row, column], playerIndex.toString(36))
		);
	},
	
	/** games.ConnectionGame.toHTML():
		Renders the board as a HTML table.
	*/
	toHTML: function toHTML() {
		var moves = this.moves(),
			activePlayer = this.activePlayer(),
			board = this.board,
			width = this.width;
		moves = moves && moves[activePlayer];
		return '<table>'+
			board.horizontals().reverse().map(function (line) {
				return '<tr>'+ line.map(function (coord) {
					var data = '',
						value = board.square(coord),
						move = coord[0] * width + coord[1];
					if (moves && moves.indexOf(move) >= 0) {
						data = ' data-ludorum="move: '+ move +', activePlayer: \''+ activePlayer +'\'"';
					}
					return (value === '.') ? '<td '+ data +'>&nbsp;</td>'
						: '<td class="ludorum-player'+ value +'" '+ data +'>&#x25CF;</td>';
				}).join('') +'</tr>';
			}).join('') + '</table>';
	},
	
	__serialize__: function __serialize__() {
		return [this.name, this.activePlayer(), this.board.string];
	}
}); // declare ConnectionGame.