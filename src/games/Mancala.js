/** # Mancala

Implementation of the [Kalah](http://en.wikipedia.org/wiki/Kalah) member of the 
[Mancala family of games](http://en.wikipedia.org/wiki/Mancala).
*/
games.Mancala = declare(Game, {
	name: 'Mancala',
	
	/** The constructor takes the `activePlayer` (`"North"` by default) and the board as an array of
	integers (initial board by default).
	*/
	constructor: function Mancala(activePlayer, board){
		Game.call(this, activePlayer);
		this.board = board || this.makeBoard();
	},
	
	/** `makeBoard(seeds, houses)` builds an array for the given amounts of houses and seeds per 
	house. By default 4 seeds and 6 houses per player are assumed.
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
	
	/** If `emptyCapture` is true, making a capture only moves the active player's seed to his 
	store, and the opponents seeds are not captured. By default this is false.
	*/
	emptyCapture: false,
	
	/** If `countRemainingSeeds` is true, at the end of the game if a player has seeds on his 
	houses, those seeds are included in his score. This is the default behaviour.
	*/
	countRemainingSeeds: true,
	
	// ## Game state information ###################################################################
	
	/** `store(player)` returns the index in this game's board of the player's store.
	*/
	store: function store(player){
		switch (this.players.indexOf(player)) {
			case 0: return this.board.length / 2 - 1; // Store of North.
			case 1: return this.board.length - 1; // Store of South.
			default: throw new Error("Invalid player "+ player +".");
		}
	},

	/** `houses(player)` returns an array with the indexes of the player's houses in this game's 
	board.
	*/
	houses: function houses(player){
		switch (this.players.indexOf(player)) {
			case 0: return Iterable.range(0, this.board.length / 2 - 1).toArray(); // Store of North.
			case 1: return Iterable.range(this.board.length / 2, this.board.length - 1).toArray(); // Store of South.
			default: throw new Error("Invalid player "+ player +".");
		}
	},
	
	/** The house in front of a players house is calculated by `oppositeHouse(player, i)`. It 
	returns the index of the opposite house of `i` for the given player, or a negative if `i` is not
	a house of the given player. This is necessary for resolving captures.
	*/
	oppositeHouse: function oppositeHouse(player, i) {
		var playerHouses = this.houses(player),
			opponentHouses = this.houses(this.opponent(player)),
			index = playerHouses.indexOf(i);
		return index < 0 ? index : opponentHouses.reverse()[index];
	},
	
	/** The flow of seeds on the board is defined by `nextSquare(player, i)`. It returns the index
	of the square following `i` for the given player.
	*/
	nextSquare: function nextSquare(player, i){
		do {
			i = (i + 1) % this.board.length;
		} while (i === this.store(this.opponent(player)));
		return i;
	},
	
	// ## Game logic ###############################################################################
	
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
	
	/** The game ends when the active player cannot move. The `score()` for each player is the seed
	count of its store and (if `countRemainingSeeds` is true) the houses on its side of the board.
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
	
	/** The result for each player is the difference between its score and the opponent's.
	*/
	result: function result() {
		var scores = this.scores(),
			players = this.players;
		return scores && this.zerosumResult(scores[players[0]] - scores[players[1]], players[0]);
	},
	
	/** The `next(moves)` game state implies taking all seeds from the selected house and moving
	them across the board, placing one seed at each step. A player can pass through its store but
	not through the opponent's. If the move ends at the active player's store, then it has another
	move. If it ends at an empty house, capture may occur.
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
	
	/** The `resultBounds` for a Mancala game are estimated with the total number of seeds in the 
	board. It is very unlikely to get these result though.
	*/
	resultBounds: function resultBounds() {
		var stoneCount = iterable(this.board).sum();
		return [-stoneCount,+stoneCount];
	},
	
	// ## Utility methods ##########################################################################
	
	/** Serialization is used in the `toString()` method, but it is also vital for sending the game
	state across a network or the marshalling between the rendering thread and a webworker.
	*/
	__serialize__: function __serialize__() {
		return [this.name, this.activePlayer(), this.board.slice()];
	},

	identifier: function identifier() {
		return this.activePlayer().charAt(0) + this.board.map(function (n) {
			return ('00'+ n.toString(36)).substr(-2);
		}).join('');
	},

	// ## User intefaces ###########################################################################
	
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
	
	/** The `display(ui)` method is called by a `UserInterface` to render the game state. The only
	supported user interface type is `BasicHTMLInterface`. The look can be configured using CSS
	classes.
	*/
	display: function display(ui) {
		raiseIf(!ui || !(ui instanceof UserInterface.BasicHTMLInterface), "Unsupported UI!");
		return this.__displayHTML__(ui);
	},
	
	/** Board is displayed in HTML as a table with two rows: north and south. The north row has the
	two stores on each side, as `TD`s with `rowspan=2`. Each table cell (houses and stores) contains
	the number of seeds inside it. 
	*/
	__displayHTML__: function __displayHTML__(ui) {
		var table, tr, td, data,
			mancala = this,
			north = this.players[0], 
			south = this.players[1],
			activePlayer = this.activePlayer(),
			moves = this.moves(),
			boardSquare = function boardSquare(td, i, isStore) {
				var data = {
					id: "ludorum-square-"+ i,
					className: isStore ? "ludorum-square-store" : "ludorum-square-house",
					square: mancala.board[i],
					innerHTML: base.Text.escapeXML(mancala.board[i])
				};
				if (!isStore && moves && moves[activePlayer] && moves[activePlayer].indexOf(i) >= 0) {
					data.move = i;
					data.activePlayer = activePlayer;
					data.className = "ludorum-square-move";
					td.onclick = data.onclick = ui.perform.bind(ui, data.move, activePlayer);
				}
				td['ludorum-data'] = data;
				td.id = data.id;
				td.className = data.className;
				td.innerHTML = data.innerHTML;
				td.setAttribute("rowspan", isStore ? 2 : 1);
				return td;
			};
		ui.container.appendChild(table = document.createElement('table'));
		table.appendChild(tr = document.createElement('tr'));
		tr.appendChild(boardSquare(document.createElement('td'), this.store(north), true));
		this.houses(north).reverse().forEach(function (h) {
			tr.appendChild(boardSquare(document.createElement('td'), h, false));
		});
		tr.appendChild(boardSquare(document.createElement('td'), this.store(south), true));
		table.appendChild(tr = document.createElement('tr'));
		this.houses(south).forEach(function (h) {
			tr.appendChild(boardSquare(document.createElement('td'), h, false));
		});
		return ui;
	},
	
	// ## Heuristics and AI ########################################################################

	/** `Mancala.heuristics` is a bundle of helper functions to build heuristic evaluation functions
	for this game.
	*/
	'static heuristics': {
		/** + `heuristicFromWeights(weights=default weights)` builds an heuristic evaluation 
			function from weights for each square in the board. The result of the function is the 
			normalized weighted sum.
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
	
	// ## Mancala type initialization ##############################################################

	'': function () {
		/** The `makeBoard` can also be used without an instance of Mancala.
		*/
		this.makeBoard = this.prototype.makeBoard;
		
		/** The `defaultHeuristic `for Mancala is based on weights for each square. Stores are worth
		5 and houses 1, own possitive and the opponent's negative.
		*/
		this.heuristics.defaultHeuristic = this.heuristics.heuristicFromWeights(
			[+1,+1,+1,+1,+1,+1,+5, 
			 -1,-1,-1,-1,-1,-1,-5]
		);
	}
}); // declare Mancala.
