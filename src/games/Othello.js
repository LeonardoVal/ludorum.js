/** # Othello

Implementation of [Othello (aka Reversi)](http://en.wikipedia.org/wiki/Reversi)
for Ludorum.
*/
games.Othello = declare(Game, {
	/** The constructor takes the `activePlayer` (`"Black"` by default) and a
	board (initial board by default). The board is represented by an array of
	two integers and a string: `[rows, columns, string]`. The string must have:
	
	+ `'W'` for every square occupied by a white piece.
	+ `'B'` for every square occupied by a black piece.
	+ `'.'` for every empty square.
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
	
	/** `makeBoard(rows=8, columns=8, string)` is used to build the initial 
	board.
	*/
	makeBoard: function makeBoard(rows, columns, string){
		rows = isNaN(rows) ? 8 : +rows;
		columns = isNaN(columns) ? 8 : +columns;
		raiseIf(rows < 4 || columns < 4 || rows % 2 || columns % 2, "An Othello board must have even dimensions greater than 3.");
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
	
	/** The game's name is `'Othello'`.
	*/
	name: 'Othello',
	
	/** The game is played by two players: Black and White. Black moves first.
	*/
	players: ["Black", "White"],
	
	/** Much of the move calculations are based on the possible lines in the 
	board. These are calculated and cached by the `lines(rows, cols)` function.
	*/
	lines: (function (cache) {
		return function lines(rows, cols) {
			var key = rows +'x'+ cols,
				result = cache[key];
			if (typeof result === 'undefined') {
				result = cache[key] = new utils.Checkerboard(rows, cols).lines().map(function(line) { 
					return line.toArray();
				}, function(line){
					return line.length > 2;
				}).toArray();
			}
			return result;
		};
	})({}),
	
	/** Another optimization in the move logic uses regular expressions to match
	patterns in the board. These are predefined as a _class_ member.
	*/
	__MOVE_REGEXPS__: {
		"Black": [/\.W+B/g, /BW+\./g],
		"White": [/\.B+W/g, /WB+\./g]
	},
	
	/** A move always places a piece in an empty square, if and only if by doing
	so one or more lines of the opponent's pieces get enclosed between pieces of
	the active player.
	*/
	moves: function moves(player){
		if (!player && this.__moves__) {
			return this.__moves__;
		}
		player = player || this.activePlayer();
		var board = this.board,
			coords = {},
			regexps = this.__MOVE_REGEXPS__[player];
		this.lines(board.height, board.width).forEach(function(line){
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
		return this.__moves__ = (_moves.length > 0 ? obj(player, _moves) : null);
	},
	
	/** When the active player encloses one or more lines of opponent's pieces 
	between two of its own, all those are turned into active player's pieces.
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
	
	/** A match ends when the active player cannot move. The winner is the one
	with more pieces of its color in the board at the end.
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
	
	/** The actual score is calculated as the difference in piece count. This
	means that the maximum victory (maybe impossible) is to fill the board with
	pieces of only one colour.
	*/
	resultBounds: function resultBounds() {
		var squareCount = this.board.width * this.board.height;
		return [-squareCount, +squareCount];
	},
	
	// ## User intefaces #######################################################
	
	/** The `display(ui)` method is called by a `UserInterface` to render the
	game state. The only supported user interface type is `BasicHTMLInterface`.
	The look can be configured using CSS classes.
	*/
	display: function display(ui) {
		raiseIf(!ui || !(ui instanceof UserInterface.BasicHTMLInterface), "Unsupported UI!");
		var moves = this.moves(),
			activePlayer = this.activePlayer(),
			board = this.board,
			classNames = {
				'B': "ludorum-square-Black",
				'W': "ludorum-square-White",
				'.': "ludorum-square-empty"
			};
		moves = moves && moves[activePlayer].map(JSON.stringify);
		board.renderAsHTMLTable(ui.document, ui.container, function (data) {
			data.className = classNames[data.square];
			data.innerHTML = '&nbsp;';
			var move = JSON.stringify(data.coord);
			if (moves && moves.indexOf(move) >= 0) {
				data.move = data.coord;
				data.activePlayer = activePlayer;
				data.className = "ludorum-square-move";
				data.onclick = ui.perform.bind(ui, data.move, activePlayer);
			}
		});
		return ui;
	},
	
	// ## Utility methods ######################################################
	
	/** The game state serialization simply contains the constructor arguments.
	*/
	__serialize__: function __serialize__() {
		var board = this.board;
		return [this.name, this.activePlayer(), [board.height, board.width, board.string]];
	},
	
	// ## Heuristics ###########################################################
	
	/** `Othello.heuristics` is a bundle of helper functions to build heuristic 
	evaluation functions for this game.
	*/
	'static heuristics': {
		/** `heuristicFromWeights(weights)` returns an heuristic function that
		may be used with any [heuristic based player](../players/HeuristicPlayer.js.html).
		Weights are normalized, so the result is in (-1,+1) (exclusively).
		*/
		heuristicFromWeights: function heuristicFromWeights(weights) {
			var weightCount = weights.length,
				weightSum = iterable(weights).map(Math.abs).sum(); // Used to normalize the sum.
			var heuristic = function __heuristic__(game, player) {
				var board = game.board;
				raiseIf(board.height * board.width !== weightCount, "Wrong amount of weights!");
				return board.weightedSum(weights, {
					'W': player.charAt(0) === 'W' ? 1 : -1,
					'B': player.charAt(0) === 'B' ? 1 : -1
				}) / weightSum;
			};
			heuristic.weights = weights;
			return heuristic;
		},
		
		/** `heuristicFromSymmetricWeights(weights)` is similar to 
		`heuristicFromWeights()` but instead of demanding a weight for every 
		square in the board, it uses only the upper left quadrant and builds
		the rest by symmetry. Hence only a quarter of the weights is required.
		*/
		heuristicFromSymmetricWeights: function heuristicFromSymmetricWeights(weights, rows, columns) {
			rows = isNaN(rows) ? 8 : rows | 0;
			columns = isNaN(columns) ? 8 : columns | 0;
			var width = Math.ceil(rows / 2);
			raiseIf(width * Math.ceil(columns / 2) > weights.length, "Not enough weights!");
			weights = Iterable.range(columns).map(function (column) {
				var i = column < columns / 2 ? column : columns - column - 1,
					left = i * width,
					right = (i + 1) * width;
				return weights.slice(left, right)
					.concat(weights.slice(left, right - rows % 2).reverse());
			}).flatten().toArray();
			return this.heuristicFromWeights(weights);
		},
		
		/** `pieceRatio(game, player)` is an heuristic criteria based on the
		difference of the piece counts of both players.
		*/
		pieceRatio: function pieceRatio(game, player) {
			var playerPieceCount = 0, opponentPieceCount = 0;
			iterable(game.board.string).forEach(function (sq) {
				if (sq !== '.') {
					if (sq === player.charAt(0)) {
						++playerPieceCount;
					} else {
						++opponentPieceCount;
					}
				}
			});
			return (playerPieceCount - opponentPieceCount) / (playerPieceCount + opponentPieceCount) || 0;
		},
		
		/** `mobilityRatio(game, player)` is an heuristic criteria based on the
		difference of the move counts of both players.
		*/
		mobilityRatio: function mobilityRatio(game, player) {
			var opponent = game.opponent(player),
				playerMoves = game.moves(player),
				opponentMoves = game.moves(opponent), 
				playerMoveCount = playerMoves && playerMoves[player] && playerMoves[player].length || 0, 
				opponentMoveCount = opponentMoves && opponentMoves[opponent] && opponentMoves[opponent].length || 0;
			return (playerMoveCount - opponentMoveCount) / (playerMoveCount + opponentMoveCount) || 0;
		}
	}	
}); // declare Othello.
	
games.Othello.makeBoard = games.Othello.prototype.makeBoard;
