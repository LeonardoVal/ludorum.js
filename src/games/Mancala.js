/** ludorum/src/games/Mancala.js
	Implementation of the Kalah member of the Mancala family of games.
	
	@author <a href="mailto:leonardo.val@creatartis.com">Leonardo Val</a>
	@author <a href="mailto:">Maximiliano Martins</a>
	@licence MIT Licence
*/
games.Mancala = basis.declare(Game, {
	/** new Mancala(activePlayer="North", board=makeBoard()):
		TODO.
	*/
	constructor: function Mancala(activePlayer, board){
		Game.call(this, activePlayer);
		this.board = board || this.makeBoard();
	},
	
	/** Mancala.makeBoard(seeds=3, houses=6):
		Builds a board array to use as the game state.
	*/
	makeBoard: function makeBoard(seeds, houses){
		seeds = isNaN(seeds) ? 3 : +seeds;
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
	
	/** Mancala.players:
		Players of Mancala are North and South.
	*/
	players: ["North", "South"],
	
	/** Mancala.emptyCapture=false:
		If true, making a capture only moves the active player's seed to his
		store. The opponents seeds are not captured.
	*/
	emptyCapture: false,
	
	/** Mancala.countRemainingSeeds=true:
		If true, at the end of the game if a player has seeds on his houses,
		those seeds are included in his score.
	*/
	countRemainingSeeds: true,
	
	/** Mancala.store(player):
		Returns the index in this game's board of the player's store.
	*/
	store: function store(player){
		switch (this.players.indexOf(player)) {
			case 0: return this.board.length / 2 - 1; // Store of North.
			case 1: return this.board.length - 1; // Store of South.
			default: throw new Error("Invalid player "+ player +".");
		}
	},

	/** Mancala.houses(player):
		Returns an array with the indexes of the player's houses in this
		game's board.
	*/
	houses: function houses(player){
		switch (this.players.indexOf(player)) {
			case 0: return basis.Iterable.range(0, this.board.length / 2 - 1).toArray(); // Store of North.
			case 1: return basis.Iterable.range(this.board.length / 2, this.board.length - 1).toArray(); // Store of South.
			default: throw new Error("Invalid player "+ player +".");
		}
	},
	
	/** Mancala.oppositeHouse(player, i):
		Returns the index of the opposite house of i for the given player,
		or a negative if i is not a house of the given player.
	*/
	oppositeHouse: function oppositeHouse(player, i) {
		var playerHouses = this.houses(player),
			opponentHouses = this.houses(this.opponent(player)),
			index = playerHouses.indexOf(i);
		return index < 0 ? index : opponentHouses.reverse()[index];
	},
	
	/** Mancala.nextSquare(player, i):
		Returns the index of the square following i for the given player.
	*/
	nextSquare: function nextSquare(player, i){
		do {
			i = (i + 1) % this.board.length;
		} while (i === this.store(this.opponent(player)));
		return i;
	},
	
	/** Mancala.moves():
		A move for this game is an index of the square in the board.
	*/
	moves: function moves(){
		var board = this.board,
			result = {},
			activePlayer = this.activePlayer();
		result[activePlayer] = this.houses(activePlayer).filter(function(house){
			return board[house] > 0; // The house has seeds.
		});
		return result[activePlayer].length > 0 ? result : null;
	},
	
	/** Mancala.result():
		The game ends when the active player cannot move. The result for
		each player is the difference between the seed count of the stores.
		If a player has seeds in his side, those are added to his count.
	*/
	result: function result() {
		if (!this.moves()) {
			var result = {}, 
				game = this,
				board = this.board;
			// Calculate score.
			this.players.forEach(function (player) {
				result[player] = board[game.store(player)];
				if (game.countRemainingSeeds) {
					game.houses(player).forEach(function (house) {
						result[player] += board[house];
					});
				}
			});
			// Calculate result.
			result[this.players[0]] -= result[this.players[1]];
			result[this.players[1]] = -result[this.players[0]];
			return result;
		} else {
			return null;
		}
	},
	
	/** Mancala.next(moves):
		TODO.
	*/
	next: function next(moves) {
		var activePlayer = this.activePlayer(), 
			move = +moves[activePlayer],
			newBoard = this.board.slice(0),
			seeds = newBoard[move],
			freeTurn = false,
			store, oppositeHouse;
		basis.raiseIf(seeds < 1, "Invalid move ", move, " for game ", this);
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
	
	/** Mancala.resultBounds():
		Result bounds are estimated with the total number of stones in the
		board. It is very unlikely to get these result though.
	*/
	resultBounds: function resultBounds() {
		var stoneCount = basis.iterable(this.board).sum();
		return [-stoneCount,+stoneCount];
	},
	
	// Utility methods. ////////////////////////////////////////////////////
	
	args: function args() {
		return ['Mancala', this.activePlayer(), this.board.slice()];
	},

	identifier: function identifier() {
		return this.activePlayer().charAt(0) + this.board.map(function (n) {
			return ('00'+ n.toString(36)).substr(-2);
		}).join('');
	},

	toString: function toString() {
		var game = this,
			north = this.players[0],
			northHouses = this.houses(north).map(function (h) {
				return (''+ game.board[h]).lpad(2, '0');
			}).reverse(),
			northStore = (''+ this.board[this.store(north)]).lpad(2, '0'),
			south = this.players[1],
			southHouses = this.houses(south).map(function (h) {
				return (''+ game.board[h]).lpad(2, '0');
			}),
			southStore = (''+ this.board[this.store(south)]).lpad(2, '0');
		return "   "+ northHouses.join(" | ") +"   \n"+
			northStore +" ".repeat(northHouses.length * 2 + (northHouses.length - 1) * 3 + 2) + southStore +"\n"+
			"   "+ southHouses.join(" | ") +"   ";
	}
}); // declare Mancala.
	
games.Mancala.makeBoard = games.Mancala.prototype.makeBoard;

// Heuristics //////////////////////////////////////////////////////////////////

/** static games.Mancala.heuristics:
	Bundle of heuristic evaluation functions for Mancala.
*/
games.Mancala.heuristics = {};
	
/** games.Mancala.heuristics.heuristicFromWeights(weights):
	Builds an heuristic evaluation function from weights for each square in
	the board. The result of the function is the normalized weighted sum.
*/
games.Mancala.heuristics.heuristicFromWeights = function heuristicFromWeights(weights) {
	var weightSum = basis.iterable(weights).map(Math.abs).sum();
	function __heuristic__(game, player) {
		var seedSum = 0, signum;
		switch (game.players.indexOf(player)) {
			case 0: signum = 1; break; // North.
			case 1: signum = -1; break; // South.
			default: throw new Error("Invalid player "+ player +".");
		}
		return basis.iterable(game.board).map(function (seeds, i) {
			seedSum += seeds;
			return seeds * weights[i]; //TODO Normalize weights before.
		}).sum() / weightSum / seedSum * signum;
	}
	__heuristic__.weights = weights;
	return __heuristic__;
};
	
/** games.Mancala.heuristics.defaultHeuristic(game, player):
	Default heuristic for Mancala, based on weights for each square.
*/
games.Mancala.heuristics.defaultHeuristic = games.Mancala.heuristics.heuristicFromWeights(
	[+1,+1,+1,+1,+1,+1,+5,
	 -1,-1,-1,-1,-1,-1,-5]
);
