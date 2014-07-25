/** # Bahab

Bahab is a chess-like board game originally designed for Ludorum.
*/
games.Bahab = declare(Game, {
	initialBoard: ['BBABB', 'BBBBB', '.....', 'bbbbb', 'bbabb'].join(''),

	name: 'Bahab',
	
	players: ['Uppercase', 'Lowercase'],
	
	constructor: function Bahab(activePlayer, board) {
		Game.call(this, activePlayer);
		this.board = board instanceof CheckerboardFromString ? board
			: new CheckerboardFromString(5, 5, board || this.initialBoard);
	},
	
	__PLAYER_PIECES_RE__: { Uppercase: /[AB]/g, Lowercase: /[ab]/g },
	
	result: function result() {
		var board = this.board.string;
		if (board.match(/^[.bAB]+$|[A].{0,4}$/)) { // Lowercase has no piece 'a' or Uppercase has a piece in Lowercase's rank.
			return this.defeat(this.players[1]);
		} else if (board.match(/^[.Bab]+$|^.{0,4}[a]/)) { // Uppercase has no piece 'A' or Lowercase has a piece in Uppercase's rank.
			return this.defeat(this.players[0]);
		} else {
			return null;
		}
	},
	
	moves: function moves() {
		var activePlayer = this.activePlayer(),
			pieceRegExp = this.__PLAYER_PIECES_RE__[activePlayer],
			board = this.board,
			_moves = [];
		board.string.replace(pieceRegExp, function (piece, i) {
			var coord = [(i / 5)|0, i % 5], pieceMoves;
			switch (piece) {
				case 'A': pieceMoves = [[+1,-1], [+1, 0], [+1,+1]]; break;
				case 'B': pieceMoves = [[+1,-1], [+1,+1]]; break;
				case 'a': pieceMoves = [[-1,-1], [-1, 0], [-1,+1]]; break;
				case 'b': pieceMoves = [[-1,-1], [-1,+1]]; break;
			}
			iterable(pieceMoves).forEachApply(function (dx, dy) {
				var coordTo = [coord[0] + dx, coord[1] + dy],
					squareTo = board.square(coordTo);
				if (board.isValidCoord(coordTo) 
						&& !squareTo.match(pieceRegExp)
						&& (piece.toLowerCase() != 'b' || squareTo.toLowerCase() != 'a')) {
					//// Valid coordinate and not occupied by a friendly piece.
					_moves.push([coord, coordTo]);
				}
			});
			return piece;
		});
		return _moves.length > 0 ? obj(activePlayer, _moves) : null;
	},
	
	next: function next(moves) {
		if (!moves) {
			throw new Error("Invalid moves "+ moves +"!");
		}
		var activePlayer = this.activePlayer(),
			move = moves[activePlayer];
		if (!Array.isArray(moves[activePlayer])) {
			throw new Error("Invalid moves "+ JSON.stringify(moves) +"!");
		}
		return new this.constructor(this.opponent(), this.board.move(move[0], move[1]));
	},
	
	__serialize__: function __serialize__() {
		return [this.name, this.activePlayer(), this.board.string];
	}
}); //// declare Bahab.