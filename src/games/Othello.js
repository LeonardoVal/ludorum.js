/** Implementation of Othello.
*/
games.Othello = declare(Game, {
	/** new games.Othello(activePlayer="Black", board=makeBoard(), rows=8, cols=8):
		TODO.
	*/
	constructor: function Othello(activePlayer, board, rows, cols){
		Game.call(this, activePlayer);
		this.board = board || this.makeBoard(rows, cols);
		this.__moves__ = this.moves(this.activePlayer());
		if (!this.__moves__){
			this.__moves__ = this.moves(this.opponent());
			if(this.__moves__){
				this.activePlayers = [this.opponent()];
			}
		}
	},
	
	/** games.Othello.makeBoard(rows=8, columns=8):
		Builds a board array to use as the game state.
	*/
	makeBoard: function makeBoard(rows, cols){
		rows = isNaN(rows) ? 8 : +rows;
		cols = isNaN(cols) ? 8 : +cols;
		raiseIf(rows < 4 || cols < 4 || rows % 2 || cols % 2,
			"An Othello board must have even dimensions greater than 3.")
		return new utils.CheckerboardFromString(rows, cols, null, null)
			.__place__([rows / 2, cols / 2 - 1], "W")
			.__place__([rows / 2 - 1, cols / 2], "W")
			.__place__([rows / 2, cols / 2], "B")
			.__place__([rows / 2 - 1, cols / 2 - 1], "B");
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
		"Black": /\.W+B|BW+\./g,
		"White": /\.B+W|WB+\./g
	},
	
	/** games.Othello.moves():
		A move for this game is an index of the square in the board.
	*/
	moves: function moves(player){
		if (!player) {
			if (this.__moves__) {
				return this.__moves__;
			} else {
				player = this.activePlayer();
			}
		}
		var board = this.board,
			result = {},
			squares = {},
			moveRegExp = this.__MOVE_REGEXPS__[player];
		this.lines.forEach(function(line){
			board.asString(line).replace(moveRegExp, function(m, i){
				var coord = m.charAt(0) === "." ? line[i] : line[m.length - 1 + i];
				squares[JSON.stringify(coord)] = true;
				return m;
			});
		});
		result[player] = Object.keys(squares).map(JSON.parse);
		return result[player].length > 0 ? result : null;
	},
	
	/** games.Othello.result():
		TODO comment
	*/
	result: function result() {
		if(this.__moves__){
			return null;
		}
		var weight = {"W": -1, "B": 1},
			res_b = iterable(this.board.string).map(function(m){
					return weight[m] || 0;
				}).sum();
		return this.zerosumResult(res_b, "Black");
	},
	
	/** games.Othello.next(moves):
		TODO.
	*/
	next: function next(moves) {
		var piece, valid, board = this.board.clone();
		if(this.activePlayer() == "Black"){
			piece = "B";
			valid = /^W+B/;
		}else{
			piece = "W";
			valid = /^B+W/;
		}
		board.walks(moves[this.activePlayer()], [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]]).forEach(function(walk){
			var match = valid.exec(board.asString(walk).substr(1));
			if (match){
				walk.toArray().slice(0, match[0].length).forEach(function(coord){
					board.__place__(coord, piece);
				});
			}
		});
		return new this.constructor(this.opponent(), board);
	},
	
	// Utility methods. ////////////////////////////////////////////////////
	
	__serialize__: function __serialize__() {
		return [this.name, this.activePlayer(), this.board];
	},
	
	identifier: function identifier() {
		return this.activePlayer().charAt(0) + this.board.map(function (n) {
			return ('00'+ n.toString(36)).substr(-2);
		}).join('');
	},

	toString: function toString() {
		var game = this,
			black = this.players[0],
			white = this.players[1];
		//Representacion de tablero.
		//TODO representacion
		return "   "+ northHouses.join(" | ") +"   \n"+
			northStore +" ".repeat(northHouses.length * 2 + (northHouses.length - 1) * 3 + 2) + southStore +"\n"+
			"   "+ southHouses.join(" | ") +"   ";
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
					var piece = value === "B" ? '&#x25CF;' : '&#x25CB;';
					return (value === '.') ? '<td '+ data +'>&nbsp;</td>'
						: '<td class="ludorum-player'+ value +'" '+ data +'>' + piece + '</td>';
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
