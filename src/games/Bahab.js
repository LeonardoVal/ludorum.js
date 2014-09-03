/** # Bahab

Bahab is a chess-like board game originally designed for Ludorum.
*/
games.Bahab = declare(Game, {
	name: 'Bahab',
	
	/** Players are `Uppercase` and `Lowercase`.
	*/
	players: ['Uppercase', 'Lowercase'],
	
	/** The constructor takes the `activePlayer` (Uppercase by default) and the 
	`board` as a string (`initialBoard` by default).
	*/
	constructor: function Bahab(activePlayer, board) {
		Game.call(this, activePlayer);
		this.board = board instanceof CheckerboardFromString ? board
			: new CheckerboardFromString(5, 5, board || this.initialBoard);
	},
	
	/** The `initialBoard` has two ranks of pieces for each player. All B pieces
	except one A piece at the center of the first rank.
	*/
	initialBoard: ['BBABB', 'BBBBB', '.....', 'bbbbb', 'bbabb'].join(''),

	/** `__PLAYER_ENDGAME_RE__` regular expressions are used to optimize result 
	calculations. They match if the player has no A piece or if its opponent has 
	an A piece in its rank.
	*/
	__PLAYER_ENDGAME_RE__: {
		Uppercase: /^[.Bab]+$|^.{0,4}[a]/, 
		Lowercase: /^[.bAB]+$|[A].{0,4}$/ 
	},
	
	/** A player wins when it moves its A piece to the opponent's first rank, 
	and loses when its A piece is captured by the opponent.
	*/
	result: function result() {
		var board = this.board.string;
		for (var i = 0; i < 2; ++i) {
			if (board.match(this.__PLAYER_ENDGAME_RE__[this.players[i]])) {
				return this.defeat(this.players[(i+1)%2]); 
			}
		}
		return null;
	},
	
	/** `__PLAYER_PIECES_RE__` regular expressions are used to optimize move 
	calculations.
	*/
	__PLAYER_PIECES_RE__: {
		Uppercase: /[AB]/g,
		Lowercase: /[ab]/g
	},
	
	/** All pieces move one square forward. A pieces can move straight forward 
	or diagonally, and B pieces move only diagonally. Pieces can move to any
	square that is empty or occupied by an opponent's piece. If the piece moves 
	to an occupied square, it captures the piece in it.
	*/
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
					_moves.push([coord, coordTo]); // Valid coordinate and not occupied by a friendly piece.
				}
			});
			return piece;
		});
		return _moves.length > 0 ? obj(activePlayer, _moves) : null;
	},
	
	/** Valid move for this game are pairs of coordinates (`[row, column]`), the
	first one being where the moving piece starts, and the second one being 
	where the moving piece ends.	
	*/
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
	
	// ## User intefaces #######################################################
	
	/** The `display(ui)` method is called by a `UserInterface` to render the
	game state. The only supported user interface type is `BasicHTMLInterface`.
	The look can be configured using CSS classes.
	*/
	display: function display(ui) {
		raiseIf(!ui || !(ui instanceof UserInterface.BasicHTMLInterface), "Unsupported UI!");
		return this.__displayHTML__(ui);
	},
	
	/** The game board is rendered in HTML as a table. The look can be customized
	with CSS classes.
	*/
	__displayHTML__: function __displayHTML__(ui) {
		var moves = this.moves(),
			activePlayer = this.activePlayer(),
			board = this.board,
			classNames = {
				'B': "ludorum-square-Uppercase-B",
				'A': "ludorum-square-Uppercase-A",
				'b': "ludorum-square-Lowercase-B",
				'a': "ludorum-square-Lowercase-A",
				'.': "ludorum-square-empty"
			};
		if (ui.selectedPiece) {
			moves = moves && moves[activePlayer].filter(function (move) {
				return move[0][0] == ui.selectedPiece[0] && move[0][1] == ui.selectedPiece[1];
			}).map(function (move) {
				return JSON.stringify(move[1]);
			});
		} else {
			moves = moves && moves[activePlayer].map(function (move) {
				return JSON.stringify(move[0]);
			});
		}
		board.renderAsHTMLTable(ui.document, ui.container, function (data) {
			data.className = classNames[data.square];
			data.innerHTML = data.square == '.' ? '&nbsp;' : data.square;
			var move = JSON.stringify(data.coord);
			if (moves && moves.indexOf(move) >= 0) {
				data.move = data.coord;
				data.activePlayer = activePlayer;
				if (data.square == '.') {
					data.className = "ludorum-square-move";
					data.innerHTML = '.';
				}
				if (ui.selectedPiece) {
					data.onclick = ui.perform.bind(ui, [ui.selectedPiece, data.move], activePlayer);
				} else {
					data.onclick = function () {
						ui.selectedPiece = data.move;
					};
				}
			}
		});
		return ui;
	},
	
	// ## Utility methods ######################################################
	
	/** The game state serialization simply contains the constructor arguments.
	*/
	__serialize__: function __serialize__() {
		return [this.name, this.activePlayer(), this.board.string];
	}
}); // declare Bahab.