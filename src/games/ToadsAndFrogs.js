/** # ToadsAndFrogs

Implementation of the [Toads & Frogs](http://en.wikipedia.org/wiki/Toads_and_Frogs_%28game%29) game.
*/
games.ToadsAndFrogs = declare(Game, {
	name: 'ToadsAndFrogs',
	
	/** Constructor of Toads & Frogs games. The first player is always _Toads_. The default board is
	`'TTT__FFF'`.
	*/
	constructor: function ToadsAndFrogs(activePlayer, board) {
		Game.call(this, activePlayer);
		this.board = board || ToadsAndFrogs.board();
	},
	
	/** A `board` builder for Toads & Frogs. These boards are single rows with a given number of 
	`chips` for each player (toads to the left and frogs to the right) separated by the given number 
	of empty spaces (`separation`).
	*/
	"static board": function board(chips, separation) {
		chips = isNaN(chips) ? 3 : +chips;
		separation = isNaN(separation) ? 2 : +separation;
		return 'T'.repeat(chips) + '_'.repeat(separation) + 'F'.repeat(chips);
	},
	
	/** There are two roles in this game: _Toads_ and _Frogs_.
	*/
	players: ['Toads', 'Frogs'],
	
	/** The match finishes when one player cannot move, hence losing the game.
	*/
	result: function result() {
		return this.moves() ? null : this.defeat();
	},
	
	/** The active players `moves` is a list of square indexes (integers) in the board, where chips
	can be moved in one of the two ways possible in this game.
	*/
	moves: function moves() {
		var activePlayer = this.activePlayer(),
			result = {}, 
			ms = result[activePlayer] = [];
		this.board.replace(activePlayer == this.players[0] ? /TF?_/g : /_T?F/g, function (m, i) {
			ms.push(i);
			return m;
		});
		return ms.length > 0 ? result : null;
	},
	
	/** The board of the next game state is calculated by applying the given move.
	*/
	next: function next(moves, haps, update) {
		raiseIf(haps, 'Haps are not required (given ', haps, ')!');
		var activePlayer = this.activePlayer(), 
			move = moves[activePlayer], 
			chip = activePlayer.charAt(0),
			board = this.board,
			nextBoard;
		if (board.substr(move, 2) == 'T_') {
			nextBoard = board.substring(0, move) + '_T' + board.substring(move + 2);
		} else if (board.substr(move, 2) == '_F') {
			nextBoard = board.substring(0, move) + 'F_' + board.substring(move + 2);
		} else if (board.substr(move, 3) == 'TF_') {
			nextBoard = board.substring(0, move) + '_FT' + board.substring(move + 3);
		} else if (board.substr(move, 3) == '_TF') {
			nextBoard = board.substring(0, move) + 'FT_' + board.substring(move + 3);
		} else {
			throw new Error('Invalid move ', move, ' for board <', board, '>.');
		}
		if (update) {
			this.activatePlayers(this.opponent());
			this.board = nextBoard;
			return this;
		} else {
			return new this.constructor(this.opponent(), nextBoard);
		}
	},

	// ## Utility methods ##########################################################################
	
	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'ToadsAndFrogs',
		serializer: function serialize_ToadsAndFrogs(obj) {
			return [obj.activePlayer(), obj.board];
		}
	},
	
	/** The game state is hashed by converting the concatenation of the `activePlayer` and the 
	`board` it to a integer in base 3.
	*/
	__hash__: function __hash__(activePlayer, board) {
		var VALUE = {'_': 0, 'T': 1, 'F': 2};
		activePlayer = (activePlayer || this.activePlayer()).charAt(0);
		board = board || this.board;
		return parseInt((activePlayer + board).split('').map(function (chr) {
			return VALUE[chr];
		}).join(''), 3);
	}
}); // declare ToadsAndFrogs
