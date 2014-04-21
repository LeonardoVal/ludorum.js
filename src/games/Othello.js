/** Implementation of Othello.
*/
games.Othello = declare(Game, {
	/** new games.Othello(activePlayer="Black", board):
		TODO.
	*/
	constructor: function Othello(activePlayer, board){
		Game.call(this, activePlayer);
		this.board = this.makeBoard.apply(this, board || []);
		if (!this.moves()) {
			var opponent = this.opponent();
			if (this.moves(opponent)) {
				this.activePlayers = [opponent];
			}
		}
	},
	
	/** games.Othello.makeBoard(rows, columns, string):
		Builds a board array to use as the game state.
	*/
	makeBoard: function makeBoard(rows, columns, string){
		rows = isNaN(rows) ? 8 : +rows;
		columns = isNaN(columns) ? 8 : +columns;
		raiseIf(rows < 4 || columns < 4 || rows % 2 || columns % 2,
			"An Othello board must have even dimensions greater than 3.")
		if (typeof string === 'string') {
			return new CheckerboardFromString(rows, columns, string);
		} else {
			return new CheckerboardFromString(rows, columns)
				.__place__([rows / 2, columns / 2 - 1], "W")
				.__place__([rows / 2 - 1, columns / 2], "W")
				.__place__([rows / 2, columns / 2], "B")
				.__place__([rows / 2 - 1, columns / 2 - 1], "B");
		}
	},
	
	name: 'Othello',
	
	/** games.Othello.players:
		Players of Othello are Black and White.
	*/
	players: ["Black", "White"],
	
	/** games.Othello.lines:
		Lines of Othello.
		//TODO: comentario en serio
		//???
	 */
	lines: new utils.Checkerboard(8, 8).lines().map(function(line){ //Deberia ser board.w y board.h en vez de 8, 8?
		return line.toArray();
	}, function(line){
		return line.length > 2;
	}).toArray(),
	
	__MOVE_REGEXPS__: {
		"Black": [/\.W+B/g, /BW+\./g],
		"White": [/\.B+W/g, /WB+\./g]
	},
	
	/** games.Othello.moves():
		A move for this game is an index of the square in the board.
	*/
	moves: function moves(player){
		if (!player && this.__moves__) {
			return this.__moves__;
		}
		player = player || this.activePlayer();
		var board = this.board,
			coords = {},
			regexps = this.__MOVE_REGEXPS__[player];
		this.lines.forEach(function(line){
			regexps.forEach(function (regexp) {
				board.asString(line).replace(regexp, function(m, i){
					var coord = m.charAt(0) === "." ? line[i] : line[m.length - 1 + i];
					coords[coord] = coord;
					return m;
				});
			});
		});
		var _moves = [];
		for (var id in coords) {
			_moves.push(coords[id]);
		}
		return this.__moves__ = (_moves.length > 0 ? basis.obj(player, _moves) : null);
	},
	
	/** games.Othello.result():
		TODO comment
	*/
	result: function result() {
		if (this.moves()) {
			return null;
		} else {
			var weight = {"W": -1, "B": 1},
				res_b = iterable(this.board.string).map(function(m){
					return weight[m] || 0;
				}).sum();
			return this.zerosumResult(res_b, "Black");
		}
	},
	
	/** games.Othello.next(moves):
		TODO.
	*/
	next: function next(moves) {
		var board = this.board.clone(),
			activePlayer = this.activePlayer(),
			piece, valid;
		if (!moves.hasOwnProperty(activePlayer) || !board.isValidCoord(moves[activePlayer])) {
			throw new Error("Invalid moves "+ JSON.stringify(moves) +"!");
		} else if (activePlayer == this.players[0]) {
			piece = "B";
			valid = /^W+B/;
		} else {
			piece = "W";
			valid = /^B+W/;
		}
		board.walks(moves[activePlayer], Checkerboard.DIRECTIONS.EVERY).forEach(function (walk){
			var match = valid.exec(board.asString(walk).substr(1));
			if (match){
				walk.toArray().slice(0, match[0].length).forEach(function(coord){
					board.__place__(coord, piece);
				});
			}
		});
		return new this.constructor(this.opponent(), [board.height, board.width, board.string]);
	},
	
	// Utility methods. ////////////////////////////////////////////////////
	
	__serialize__: function __serialize__() {
		var board = this.board;
		return [this.name, this.activePlayer(), [board.height, board.width, board.string]];
	},
	
	/** games.ConnectionGame.toHTML():
		Renders the board as a HTML table.
	*/
	toHTML: function toHTML() {
		var moves = this.moves(),
			activePlayer = this.activePlayer(),
			board = this.board,
			width = this.width;
		moves = moves && moves[activePlayer].map(JSON.stringify);
		return '<table>'+
			board.horizontals().reverse().map(function (line) {
				return '<tr>'+ line.map(function (coord) {
					switch (board.square(coord)) {
						case 'B': return '<td class="ludorum-square-Black">&nbsp;</td>';
						case 'W': return '<td class="ludorum-square-White">&nbsp;</td>'; // &#x25CF;
						default: {
							var move = JSON.stringify(coord);
							if (moves && moves.indexOf(move) >= 0) {
								return '<td class="ludorum-square-move" data-ludorum="move: '+ 
									move +', activePlayer: \''+ activePlayer +'\'">&nbsp;</td>'; //&#x2022;
							} else {
								return '<td class="ludorum-square-empty">&nbsp;</td>';
							}
						}
					}
				}).join('') +'</tr>';
			}).join('') + '</table>';
	}
}); // declare Othello.
	
games.Othello.makeBoard = games.Othello.prototype.makeBoard;

// Heuristics //////////////////////////////////////////////////////////////////

/** static games.Othello.heuristics:
	Bundle of heuristic evaluation functions for Gomoku.
*/
games.Othello.heuristics = {};
