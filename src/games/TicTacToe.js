/** ludorum/src/games/TicTacToe.js
	Implementation of the traditional Tic-Tac-Toe game.
	
	@author <a href="mailto:leonardo.val@creatartis.com">Leonardo Val</a>
	@licence MIT Licence
*/
games.TicTacToe = basis.declare(Game, {
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
		var WIN_X = /XXX......|...XXX...|......XXX|X..X..X..|.X..X..X.|..X..X..X|X...X...X|..X.X.X../,
			WIN_O = /OOO......|...OOO...|......OOO|O..O..O..|.O..O..O.|..O..O..O|O...O...O|..O.O.O../;
		return function result() {			
			if (this.board.match(WIN_X)) { // Xs wins.
				return this.victory(["Xs"]);
			} else if (this.board.match(WIN_O)) { // Os wins.
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
			result[this.activePlayer()] = basis.iterable(this.board).filter(function (chr, i) {
				return chr == '_'; // Keep only empty squares.
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
		basis.raiseIf(this.board.charAt(move) !== '_', 'Invalid move ', move, ' for board ', this.board, 
			' (moves= ', JSON.stringify(moves) +').');
		var newBoard = this.board.substring(0, move) + activePlayer.charAt(0) + this.board.substring(move + 1);
		return new this.constructor(this.opponent(activePlayer), newBoard);
	},

	args: function args() {
		return [this.name, this.activePlayer(), this.board];
	},
	
	/** games.TicTacToe.toString():
		Text version of the TicTacToe board.
	*/
	toString: function toString() {
		return [
			this.board.substring(0,2).split('').join('|'), '-+-+-',
			board.substring(3,5).split('').join('|'), '-+-+-',
			board.substring(6,8).split('').join('|')
		].join('\n');
	}
}); // declare TicTacToe
	
// TicTacToe AI ////////////////////////////////////////////////////////////////
/** static games.TicTacToe.heuristics:
	Bundle of heuristic evaluation functions for TicTacToe.
*/
games.TicTacToe.heuristics = {};

/** games.TicTacToe.heuristics.heuristicFromWeights(weights):
	Builds an heuristic evaluation function from weights for each square in the 
	board. The result of the function is the weighted sum, empty squares being
	ignored, opponent squares considered negative.
*/
games.TicTacToe.heuristics.heuristicFromWeights = function heuristicFromWeights(weights) {
	var weightSum = basis.iterable(weights).map(Math.abs).sum();
	function __heuristic__(game, player) {
		var playerChar = player.charAt(0);
		return iterable(game.board).map(function (square, i) {
			return (square === '_' ? 0 : weights[i] * (square === playerChar ? 1 : -1));
		}).sum() / weightSum;
	}
	__heuristic__.weights = weights;
	return __heuristic__;
};
	
/** games.TicTacToe.heuristics.defaultHeuristic(game, player):
	Default heuristic for TicTacToe, based on weights for each square.
*/
games.TicTacToe.heuristics.defaultHeuristic = games.TicTacToe.heuristics.heuristicFromWeights([2,1,2,1,5,1,2,1,2]);
