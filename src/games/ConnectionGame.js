/** # ConnectionGame

Base class for a subset of the family of [connection games](http://en.wikipedia.org/wiki/Connection_game), 
which includes [TicTacToe](http://en.wikipedia.org/wiki/Tic-tac-toe), 
[ConnectFour](http://en.wikipedia.org/wiki/Connect_Four) and [Gomoku](http://en.wikipedia.org/wiki/Gomoku).
It implements a rectangular board, the placing of the pieces and the checks for lines.
*/
games.ConnectionGame = declare(Game, {
	/** Boards by default have 9 rows ...
	*/
	height: 9,
	
	/** ... and 9 columns.
	*/
	width: 9,
	
	/** A player has to make a line of 5 pieces to win, by default.
	*/
	lineLength: 5,

	/** The constructor takes the active player and the board given as a string. For the game's 
	`board` this last string argument is used to build a [`CheckerboardFromString`](../utils/CheckerboardFromString.js.html).
	*/
	constructor: function ConnectionGame(activePlayer, board) {
		Game.call(this, activePlayer);
		this.board = (board instanceof CheckerboardFromString) ? board :
			new CheckerboardFromString(this.height, this.width, 
				(board || '.'.repeat(this.height * this.width)) +''
			);
	},

	name: 'ConnectionGame',
	
	/** This base implementations names its players First and Second.
	*/
	players: ['First', 'Second'],
	
	/** Lines in the board are cached to accelerate the result calculation. */
	__lines__: (function () {
		var CACHE = {};
		function __lines__(height, width, lineLength) {
			var key = height +'x'+ width +'/'+ lineLength;
			if (!CACHE.hasOwnProperty(key)) {
				var board = new CheckerboardFromString(height, width, '.'.repeat(height * width));
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
	
	/** A connection game ends when either player gets the required amount of pieces aligned (either
	horizontally, vertically or diagonally), hence winning the game. The match ends in a tie if the 
	board gets full.
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
	
	/** The active player can place a piece in any empty square in the board. The moves are indices
	in the board's string representation.
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

	/** To get from one game state to the next, an active player's piece in the square indicated by 
	its move.
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
	
	// ## User intefaces ###########################################################################
	
	/** The `display(ui)` method is called by a `UserInterface` to render the game state. The only 
	supported user interface type is `BasicHTMLInterface`. The look can be configured using CSS 
	classes.
	*/
	display: function display(ui) {
		raiseIf(!ui || !(ui instanceof UserInterface.BasicHTMLInterface), "Unsupported UI!");
		var moves = this.moves(),
			activePlayer = this.activePlayer(),
			board = this.board;
		moves = moves && moves[activePlayer];
		var table = this.board.renderAsHTMLTable(ui.document, ui.container, function (data) {
				data.className = data.square === '.' ? 'ludorum-empty' : 'ludorum-player'+ data.square;
				data.innerHTML = data.square === '.' ? "&nbsp;" : "&#x25CF;";
				var i = data.coord[0] * board.height + data.coord[1];
				if (moves && moves.indexOf(i) >= 0) {
					data.move = i;
					data.activePlayer = activePlayer;
					data.onclick = ui.perform.bind(ui, data.move, activePlayer);
				}
			});
		return ui;
	},

	// ## Utilities ################################################################################
	
	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: exports.__package__ +'.ConnectionGame',
		serializer: function serialize_ConnectionGame(obj) {
			return [obj.activePlayer(), obj.board];
		}
	}
}); // declare ConnectionGame.