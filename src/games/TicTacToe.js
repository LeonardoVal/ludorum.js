/** # TicTacToe.

Implementation of the traditional [Tic-Tac-Toe game](http://en.wikipedia.org/wiki/Tictactoe).
*/
games.TicTacToe = declare(Game, {
	name: 'TicTacToe',

	/** The constructor takes the `activePlayer` (`"Xs"` by default) and the
	`board` as a string (empty board as default).
	*/
	constructor: function TicTacToe(activePlayer, board) {
		Game.call(this, activePlayer);
		this.board = board || '_________';
	},
	
	/** This game's players are `"Xs"` and `"Os"`.
	*/
	players: ['Xs', 'Os'],
	
	/** A match ends with a victory for any player that has three marks in line, 
	or a draw if the board is full.
	*/
	result: (function () {
		return function result() {			
			if (this.board.match(this.WIN_X)) { // Xs wins.
				return this.victory(["Xs"]);
			} else if (this.board.match(this.WIN_O)) { // Os wins.
				return this.victory(["Os"]);
			} else if (this.board.indexOf('_') < 0) { // No empty squares means a tie.
				return this.draw();
			} else {
				return null; // The game continues.
			}
		};
	})(),
	
	/** The active player's `moves()` are the indexes of empty squares in the 
	board.
	*/
	moves: function moves() {
		if (!this.result()) {
			var result = {};
			result[this.activePlayer()] = iterable(this.board).filter(function (chr, i) {
				return chr === '_'; // Keep only empty squares.
			}, function (chr, i) {
				return i; // Grab the index.
			}).toArray();
			return result;
		} else {
			return null;
		}		
	},
	
	/** The `next(moves)` game state puts the mark of the active player in the
	square indicated by the move. 
	*/
	next: function next(moves) {
		var activePlayer = this.activePlayer(), 
			move = +moves[activePlayer];
		if (isNaN(move) || this.board.charAt(move) !== '_') {
			throw new Error('Invalid move '+ JSON.stringify(moves) +' for board '+ this.board +
				' (moves= '+ JSON.stringify(moves) +').');
		}
		var newBoard = this.board.substring(0, move) + activePlayer.charAt(0) + this.board.substring(move + 1);
		return new this.constructor(this.opponent(activePlayer), newBoard);
	},

	// ## Utility methods ######################################################
	
	/** The serialization of the game is a representation of a call to its
	constructor.
	*/
	__serialize__: function __serialize__() {
		return [this.name, this.activePlayer(), this.board];
	},
	
	// ## User intefaces #######################################################
	
	/** `printBoard()` creates a text (ASCII) version of the board.
	*/
	printBoard: function printBoard() {
		var board = this.board;
		return [
			board.substr(0,3).split('').join('|'), '-+-+-',
			board.substr(3,3).split('').join('|'), '-+-+-',
			board.substr(6,3).split('').join('|')
		].join('\n');
	},
	
	/** The `display(ui)` method is called by a `UserInterface` to render the
	game state. The only supported user interface type is `BasicHTMLInterface`.
	The look can be configured using CSS classes.
	*/
	display: function display(ui) {
		raiseIf(!ui || !(ui instanceof UserInterface.BasicHTMLInterface), "Unsupported UI!");
		var activePlayer = this.activePlayer(),
			moves = this.moves(),
			board = this.board,
			classNames = { 'X': "ludorum-square-Xs", 'O': "ludorum-square-Os", '_': "ludorum-square-empty" },
			squareHTML = { 'X': "X", 'O': "O", '_': "&nbsp;" };
		moves = moves && moves[activePlayer] && moves[activePlayer].length > 0;
		(new CheckerboardFromString(3, 3, this.board, '_'))
			.renderAsHTMLTable(ui.document, ui.container, function (data) {
				data.className = classNames[data.square];
				data.innerHTML = squareHTML[data.square];
				if (moves && data.square === '_') {
					data.move = data.coord[0] * 3 + data.coord[1];
					data.activePlayer = activePlayer;
					data.onclick = ui.perform.bind(ui, data.move, activePlayer);
				}
			});
		return ui;
	},
	
	// ## Heuristics and AI ####################################################
	
	/** `TicTacToe.heuristics` is a bundle of helper functions to build heuristic 
	evaluation functions for this game.
	*/
	"static heuristics": {
		/** `heuristicFromWeights(weights)` builds an heuristic evaluation 
		function from weights for each square in the board. The result of the 
		function is the weighted sum, empty squares being ignored, opponent 
		squares considered negative.
		*/
		heuristicFromWeights: function heuristicFromWeights(weights) {
			var weightSum = iterable(weights).map(Math.abs).sum();
			function __heuristic__(game, player) {
				var playerChar = player.charAt(0);
				return iterable(game.board).map(function (square, i) {
					return (square === '_' ? 0 : weights[i] * (square === playerChar ? 1 : -1));
				}).sum() / weightSum;
			}
			__heuristic__.weights = weights;
			return __heuristic__;
		}
	},
	
	// ## TicTacToe type initialization ########################################
	
	'': function () { 
		/** The regular expressions `WIN_X` and `WIN_O` used in the victory test 
		are calculated here.
		*/
		var board3x3 = new CheckerboardFromString(3, 3, '_'.repeat(9)),
			lines = board3x3.sublines(board3x3.lines(), 3);
		this.prototype.WIN_X = new RegExp(board3x3.asRegExps(lines, 'X', '.'));
		this.prototype.WIN_O = new RegExp(board3x3.asRegExps(lines, 'O', '.'));
		
		/** The `defaultHeuristic `for TicTacToe is based on weights for each 
		square. Center is worth 5, corners 2 and the other squares 1.
		*/
		this.heuristics.defaultHeuristic = this.heuristics
			.heuristicFromWeights([2,1,2,1,5,1,2,1,2]);
	}	
}); // declare TicTacToe
