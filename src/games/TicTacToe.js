/** Implementation of the traditional Tic-Tac-Toe game.
*/
games.TicTacToe = declare(Game, {
	/** new games.TicTacToe(activePlayer="Xs", board='_________'):
		Constructor of TicTacToe games. The first player is always Xs.
	*/
	constructor: function TicTacToe(activePlayer, board) {
		Game.call(this, activePlayer);
		this.board = board || '_________';
	},
	
	name: 'TicTacToe',
	
	/** games.TicTacToe.players:
		There are two roles in this game: "Xs" and "Os".
	*/
	players: ['Xs', 'Os'],
	
	/** games.TicTacToe.result():
		Returns a victory if any player has three marks in line, a draw if the
		board is full, or null otherwise.
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
	
	/** games.TicTacToe.moves():
		Returns the indexes of empty squares in the board.
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
	
	/** games.TicTacToe.next(moves):
		Puts the mark of the active player in the square indicated by the move. 
	*/
	next: function next(moves) {
		var activePlayer = this.activePlayer(), 
			move = +moves[activePlayer];
		if (this.board.charAt(move) !== '_') {
			throw new Error('Invalid move '+ JSON.stringify(moves) +' for board '+ this.board
					+' (moves= '+ JSON.stringify(moves) +').');
		}
		var newBoard = this.board.substring(0, move) + activePlayer.charAt(0) + this.board.substring(move + 1);
		return new this.constructor(this.opponent(activePlayer), newBoard);
	},

	/** games.TicTacToe.toString():
		Text version of the TicTacToe board.
	*/
	toString: function toString() {
		var board = this.board;
		return [
			board.substr(0,3).split('').join('|'), '-+-+-',
			board.substr(3,3).split('').join('|'), '-+-+-',
			board.substr(6,3).split('').join('|')
		].join('\n');
	},
	
	/** games.TicTacToe.toHTML():
		Renders the TicTacToe board as a HTML table.
	*/
	toHTML: function toHTML() {
		var activePlayer = this.activePlayer(),
			board = this.board.split('').map(function (chr, i) {
				if (chr === '_') {
					return '<td data-ludorum="move: '+ i +', activePlayer: \''+ activePlayer +'\'">&nbsp;</td>';
				} else {
					return '<td>'+ chr +'</td>';
				}
			});
		return '<table><tr>'+ [
				board.slice(0,3).join(''),
				board.slice(3,6).join(''),
				board.slice(6,9).join('')
			].join('</tr><tr>') +'</tr></table>';
	},
	
	__serialize__: function __serialize__() {
		return [this.name, this.activePlayer(), this.board];
	},
	
	// Heuristics and AI ///////////////////////////////////////////////////////
	
	/** static games.TicTacToe.heuristics:
		Bundle of heuristic evaluation functions for TicTacToe.
	*/
	"static heuristics": {
		/** games.TicTacToe.heuristics.heuristicFromWeights(weights):
			Builds an heuristic evaluation function from weights for each square 
			in the board. The result of the function is the weighted sum, empty 
			squares being ignored, opponent squares considered negative.
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
	
	'': function () { // Class initializer. ////////////////////////////////////
		// Build the regular expressions used in the victory test.
		var board3x3 = new CheckerboardFromString(3, 3, '_'.repeat(9)),
			lines = board3x3.sublines(board3x3.lines(), 3);
		this.prototype.WIN_X = new RegExp(board3x3.asRegExps(lines, 'X', '.'));
		this.prototype.WIN_O = new RegExp(board3x3.asRegExps(lines, 'O', '.'));
	}	
}); // declare TicTacToe
	
/** games.TicTacToe.heuristics.defaultHeuristic(game, player):
	Default heuristic for TicTacToe, based on weights for each square.
*/
games.TicTacToe.heuristics.defaultHeuristic = games.TicTacToe.heuristics.heuristicFromWeights([2,1,2,1,5,1,2,1,2]);
