/** # Bahab

Bahab is a chess-like board game originally designed for Ludorum.
*/
games.Bahab = declare(Game, {
	name: 'Bahab',
	
	/** Players are `Uppercase` and `Lowercase`.
	*/
	players: ['Uppercase', 'Lowercase'],
	
	/** The constructor takes the `activePlayer` (Uppercase by default) and the `board` as a string 
	(`initialBoard` by default).
	*/
	constructor: function Bahab(activePlayer, board) {
		Game.call(this, activePlayer);
		this.board = board instanceof CheckerboardFromString ? board
			: new CheckerboardFromString(5, 5, board || this.initialBoard);
	},
	
	/** The `initialBoard` has two ranks of pieces for each player. All B pieces except one A piece 
	at the center of the first rank.
	*/
	initialBoard: ['BBABB', 'BBBBB', '.....', 'bbbbb', 'bbabb'].join(''),

	/** `__PLAYER_ENDGAME_RE__` regular expressions are used to optimize result calculations. They 
	match if the player has no A piece or if its opponent has an A piece in its rank.
	*/
	__PLAYER_ENDGAME_RE__: {
		Uppercase: /^[.Bab]+$|^.{0,4}[a]/, 
		Lowercase: /^[.bAB]+$|[A].{0,4}$/ 
	},
	
	/** A player wins when it moves its A piece to the opponent's first rank, and loses when its A 
	piece is captured by the opponent.
	*/
	result: function result() {
		var board = this.board.string, player;
		for (var i = 0; i < 2; ++i) {
			player = this.players[i];
			if (board.match(this.__PLAYER_ENDGAME_RE__[player])) {
				return this.defeat(player); 
			}
		}
		return this.moves() ? null : this.defeat(this.activePlayer());
	},
	
	/** `__PLAYER_PIECES_RE__` regular expressions are used to optimize move calculations.
	*/
	__PLAYER_PIECES_RE__: {
		Uppercase: /[AB]/g,
		Lowercase: /[ab]/g
	},
	
	/** All pieces move one square forward. Piece A can move straight backwards or diagonally 
	forward, and B pieces move only diagonally forward. Pieces can move to any square that is empty 
	or occupied by an opponent's piece of the same type. If the piece moves to an occupied square, 
	it captures the piece in it.
	*/
	moves: function moves() {
		var activePlayer = this.activePlayer(),
			pieceRegExp = this.__PLAYER_PIECES_RE__[activePlayer],
			board = this.board,
			_moves = [];
		board.string.replace(pieceRegExp, function (piece, i) {
			var coord = [(i / 5)|0, i % 5], pieceMoves;
			switch (piece) {
				case 'A': pieceMoves = [[+1,-1], [-1, 0], [+1,+1]]; break;
				case 'B': pieceMoves = [[+1,-1], [+1,+1]]; break;
				case 'a': pieceMoves = [[-1,-1], [+1, 0], [-1,+1]]; break;
				case 'b': pieceMoves = [[-1,-1], [-1,+1]]; break;
			}
			iterable(pieceMoves).forEachApply(function (dx, dy) {
				var coordTo = [coord[0] + dx, coord[1] + dy],
					squareTo = board.square(coordTo);
				if (board.isValidCoord(coordTo) && !squareTo.match(pieceRegExp) &&
						(squareTo == '.' || piece.toLowerCase() == squareTo.toLowerCase())) {
					_moves.push([coord, coordTo]); // Valid coordinate and not occupied by a friendly piece.
				}
			});
			return piece;
		});
		return _moves.length > 0 ? obj(activePlayer, _moves) : null;
	},
	
	/** Valid move for this game are pairs of coordinates (`[row, column]`), the first one being 
	where the moving piece starts, and the second one being where the moving piece ends.	
	*/
	next: function next(moves, haps, update) {
		raiseIf(haps, "Haps are not required (given ", haps, ")!");
		raiseIf(!moves, "Invalid moves ", moves, "!");
		var activePlayer = this.activePlayer(),
			move = moves[activePlayer];
		raiseIf(!Array.isArray(moves[activePlayer]), "Invalid moves ", moves, "!");
		var nextBoard = this.board.move(move[0], move[1]);
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
		identifier: 'Bahab',
		serializer: function serialize_Bahab(obj) {
			return [obj.activePlayer(), obj.board];
		}
	}
}); // declare Bahab.