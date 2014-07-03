/** # Mancala

Implementation of the [Kalah](http://en.wikipedia.org/wiki/Kalah) member of the 
[Mancala family of games](http://en.wikipedia.org/wiki/Mancala).
*/
games.Mancala = declare(Game, {
	name: 'Mancala',
	
	/** The constructor takes the `activePlayer` (`"North"` by default) and the
	board as an array of integers (initial board by default).
	*/
	constructor: function Mancala(activePlayer, board){
		Game.call(this, activePlayer);
		this.board = board || this.makeBoard();
	},
	
	/** `makeBoard(seeds, houses)` builds an array for the given amounts of 
	houses and seeds per house. By default 4 seeds and 6 houses per player are
	assumed.
	*/
	makeBoard: function makeBoard(seeds, houses){
		seeds = isNaN(seeds) ? 4 : +seeds;
		houses = isNaN(houses) ? 6 : +houses;
		var result = [];
		for(var j = 0; j < 2; j++){
			for(var i = 0; i < houses; i++){
				result.push(seeds);
			}
			result.push(0);
		}
		return result;
	},
	
	/** The players' roles in a Mancala match are `"North"` and `"South"`.
	*/
	players: ["North", "South"],
	
	/** If `emptyCapture` is true, making a capture only moves the active 
	player's seed to his store, and the opponents seeds are not captured. By 
	default this is false.
	*/
	emptyCapture: false,
	
	/** If `countRemainingSeeds` is true, at the end of the game if a player has
	seeds on his houses, those seeds are included in his score. This is the 
	default behaviour.
	*/
	countRemainingSeeds: true,
	
	// ## Game state information ###############################################
	
	/** `store(player)` returns the index in this game's board of the player's
	store.
	*/
	store: function store(player){
		switch (this.players.indexOf(player)) {
			case 0: return this.board.length / 2 - 1; // Store of North.
			case 1: return this.board.length - 1; // Store of South.
			default: throw new Error("Invalid player "+ player +".");
		}
	},

	/** `houses(player)` returns an array with the indexes of the player's 
	houses in this game's board.
	*/
	houses: function houses(player){
		switch (this.players.indexOf(player)) {
			case 0: return Iterable.range(0, this.board.length / 2 - 1).toArray(); // Store of North.
			case 1: return Iterable.range(this.board.length / 2, this.board.length - 1).toArray(); // Store of South.
			default: throw new Error("Invalid player "+ player +".");
		}
	},
	
	/** The house in front of a players house is calculated by 
	`oppositeHouse(player, i)`. It returns the index of the opposite house of 
	`i` for the given player, or a negative if `i` is not a house of the given
	player. This is necessary for resolving captures.
	*/
	oppositeHouse: function oppositeHouse(player, i) {
		var playerHouses = this.houses(player),
			opponentHouses = this.houses(this.opponent(player)),
			index = playerHouses.indexOf(i);
		return index < 0 ? index : opponentHouses.reverse()[index];
	},
	
	/** The flow of seeds on the board is defined by `nextSquare(player, i)`. It
	returns the index of the square following `i` for the given player.
	*/
	nextSquare: function nextSquare(player, i){
		do {
			i = (i + 1) % this.board.length;
		} while (i === this.store(this.opponent(player)));
		return i;
	},
	
	// ## Game logic ###########################################################
	
	/** A move for a Mancala player is an index of the square in the board.
	*/
	moves: function moves(){
		if (this.result()) {
			return null;
		} else {
			var board = this.board,
				result = {},
				activePlayer = this.activePlayer();			
			result[activePlayer] = this.houses(activePlayer).filter(function(house){
				return board[house] > 0; // The house has seeds.
			});
			return result[activePlayer].length > 0 ? result : null;
		}
	},
	
	/** The game ends when the active player cannot move. The `score()` for each 
	player is the seed count of its store and (if `countRemainingSeeds` is true)
	the houses on its side of the board.
	*/
	scores: function scores() {
		var game = this,
			board = this.board,
			sides = this.players.map(function (player) {
				return iterable(game.houses(player)).map(function (h) {
					return board[h];
				}).sum();
			});
		if (sides[0] > 0 && sides[1] > 0) { // Both sides have seeds.
			return null;
		} else { // One side has no seeds.
			var _scores = {};
			this.players.forEach(function (player, i) {
				_scores[player] = board[game.store(player)] + game.countRemainingSeeds * sides[i];
			});
			return _scores;
		}
	},
	
	/** The result for each player is the difference between its score and the
	opponent's.
	*/
	result: function result() {
		var scores = this.scores(),
			players = this.players;
		return scores && this.zerosumResult(scores[players[0]] - scores[players[1]], players[0]);
	},
	
	/** The `next(moves)` game state implies taking all seeds from the selected
	house and moving them across the board, placing one seed at each step. A 
	player can pass through its store but not through the opponent's. If the 
	move ends at the active player's store, then it has another move. If it ends
	at an empty house, capture may occur.
	*/
	next: function next(moves) {
		var activePlayer = this.activePlayer(), 
			move = +moves[activePlayer],
			newBoard = this.board.slice(0),
			seeds = newBoard[move],
			freeTurn = false,
			store, oppositeHouse;
		raiseIf(seeds < 1, "Invalid move ", move, " for game ", this);
		// Move.
		newBoard[move] = 0;
		for (; seeds > 0; seeds--) {
			move = this.nextSquare(activePlayer, move);
			newBoard[move]++;
		}
		// Free turn if last square of the move is the player's store.
		freeTurn = move == this.store(activePlayer); 
		// Capture.
		if (!freeTurn) {
			oppositeHouse = this.oppositeHouse(activePlayer, move);
			if (oppositeHouse >= 0 && newBoard[move] == 1 && newBoard[oppositeHouse] > 0) { 
				store = this.store(activePlayer);
				newBoard[store]++;
				newBoard[move] = 0;
				if (!this.emptyCapture) {
					newBoard[store] += newBoard[oppositeHouse];
					newBoard[oppositeHouse] = 0;
				}					
			}
		}
		return new this.constructor(freeTurn ? activePlayer : this.opponent(), newBoard);
	},
	
	/** The `resultBounds` for a Mancala game are estimated with the total 
	number of seeds in the board. It is very unlikely to get these result 
	though.
	*/
	resultBounds: function resultBounds() {
		var stoneCount = iterable(this.board).sum();
		return [-stoneCount,+stoneCount];
	},
	
	// ## Utility methods ######################################################
	
	/** Serialization is used in the `toString()` method, but it is also vital
	for sending the game state across a network or the marshalling between the
	rendering thread and a webworker.
	*/
	__serialize__: function __serialize__() {
		return [this.name, this.activePlayer(), this.board.slice()];
	},

	identifier: function identifier() {
		return this.activePlayer().charAt(0) + this.board.map(function (n) {
			return ('00'+ n.toString(36)).substr(-2);
		}).join('');
	},

	// ## User intefaces #######################################################
	
	/** `printBoard()` creates a text (ASCII) version of the board.
	*/
	printBoard: function printBoard() {
		var game = this,
			lpad = base.Text.lpad,
			north = this.players[0],
			northHouses = this.houses(north).map(function (h) {
				return lpad(''+ game.board[h], 2, '0');
			}).reverse(),
			northStore = lpad(''+ this.board[this.store(north)], 2, '0'),
			south = this.players[1],
			southHouses = this.houses(south).map(function (h) {
				return lpad(''+ game.board[h], 2, '0');
			}),
			southStore = lpad(''+ this.board[this.store(south)], 2, '0');
		return "   "+ northHouses.join(" | ") +"   \n"+
			northStore +" ".repeat(northHouses.length * 2 + (northHouses.length - 1) * 3 + 2) + southStore +"\n"+
			"   "+ southHouses.join(" | ") +"   ";
	},
	
	/** games.Mancala.toHTML():
		Renders the Mancala board as a HTML table.
	*/
	toHTML: function toHTML() {			
		function renderHouse(player, h) {
			if (!moves || !moves[player] || !moves[player].indexOf(h) < 0) { // Not a move.
				return '<td>'+ this.board[h] +'</td>';
			} else {
				return '<td data-ludorum="move:'+ h +', activePlayer: \''+ player +'\'">'+ this.board[h] +'</td>';
			}
		}
		return '<table><tr>'
			+ '<td rowspan="2">'+ this.board[this.store(north)] +'</td>'
			+ this.houses(north).map(renderHouse.bind(this, north)).reverse().join('') 
			+ '<td rowspan="2">'+ this.board[this.store(south)] +'</td>'
			+ '</tr><tr>'
			+ this.houses(south).map(renderHouse.bind(this, south)).join('') 
			+ '</tr></table>';
	},
	
	// ## Heuristics and AI ####################################################

	/** `Mancala.heuristics` is a bundle of helper functions to build heuristic 
	evaluation functions for this game.
	*/
	'static heuristics': {
		/** games.Mancala.heuristics.heuristicFromWeights(weights=default weights):
			Builds an heuristic evaluation function from weights for each square 
			in the board. The result of the function is the normalized weighted 
			sum.
		*/
		heuristicFromWeights: function heuristicFromWeights(weights) {
			var weightSum = iterable(weights).map(Math.abs).sum();
			function __heuristic__(game, player) {
				var seedSum = 0, signum;
				switch (game.players.indexOf(player)) {
					case 0: signum = 1; break; // North.
					case 1: signum = -1; break; // South.
					default: throw new Error("Invalid player "+ player +".");
				}
				return iterable(game.board).map(function (seeds, i) {
					seedSum += seeds;
					return seeds * weights[i]; //TODO Normalize weights before.
				}).sum() / weightSum / seedSum * signum;
			}
			__heuristic__.weights = weights;
			return __heuristic__;
		}
	},
	
	// ## Mancala type initialization ##########################################

	'': function () {
		/** The `makeBoard` can also be used without an instance of Mancala.
		*/
		this.makeBoard = this.prototype.makeBoard;
		
		/** The `defaultHeuristic `for Mancala is based on weights for each 
		square. Stores are worth 5 and houses 1, own possitive and the 
		opponent's negative.
		*/
		this.heuristics.defaultHeuristic = this.heuristics.heuristicFromWeights(
			[+1,+1,+1,+1,+1,+1,+5, 
			 -1,-1,-1,-1,-1,-1,-5]
		);
	}
}); // declare Mancala.
