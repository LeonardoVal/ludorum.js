/** # Mutropas

Mutropas is a game invented for Ludorum as a simple example of a game of hidden (a.k.a. incomplete)
information. It is also a simultaneous game.
*/
games.Mutropas = declare(Game, {
	name: 'Mutropas',
	
	/** The players' roles are `"Left"` and `"Right"`.
	*/
	players: ['Left', 'Right'],

	/** The constructor takes an `args` object with:
	
	+ `pieces`: an object with the available pieces for each player. By default pieces get randomly
	dealt.
	
	+ `scores`: an object with current score for each player (0 by default for all players).
	
	+ `random`: the pseudorandom number generator to use (`base.Randomness.DEFAULT` by default).
	*/
	constructor: function Mutropas(args) {
		Game.call(this, this.players);
		args = args || {};
		this.playedPieces = args.playedPieces || [];
		this.pieces = args.pieces || this.dealPieces(args.random);
		this.__scores__ = args.scores || obj(this.players[0], 0, this.players[1], 0);
	},
	
	/** Mutropas was invented to be an example of a simultaneous non-deterministic game.
	*/
	isDeterministic: false,
	isSimultaneous: true,
	
	/** All the pieces to be used in a match of Mutropas are stored in `allPieces`, which by default
	has the numbers from 0 to 8.
	*/
	allPieces: Iterable.range(9).toArray(),	
	
	/** The method `dealPieces` is used to split the pieces randomly between all players. Half the
	pieces go to each player, and one is left out.
	*/
	dealPieces: function dealPieces(random) {
		random = random || Randomness.DEFAULT;
		var piecesPerPlayer = (this.allPieces.length / 2)|0,
			split1 = random.split(piecesPerPlayer, this.allPieces),
			split2 = random.split(piecesPerPlayer, split1[1]);
		return obj(this.players[0], split1[0], this.players[1], split2[0]);
	},
	
	/** Mutropas is a simultaneous game. Hence every turn all players can move. The moves are the
	pieces of each player that have not been played.
	*/
	moves: function moves() {
		return this.result() ? null : copy({}, this.pieces);
	},
	
	/** If all pieces are put in a circle, each piece beats half the pieces next to it, and it is 
	beaten by half the pieces before it. For example if `allPieces` where `[0,1,2,3,4]`:
	
	+ piece `1` would beat pieces `2` and `3`, and lose against `4` and `0`,
	+ piece `2` would beat pieces `3` and `4`, and lose against `0` and `1`,
	+ piece `4` would beat pieces `0` and `1`, and lose against `2` and `3`,
	
	The `moveResult` returns 1 if `piece1` beats `piece2` or -1 if otherwise.
	*/
	moveResult: function moveResult(piece1, piece2) {
		var upperBound = iterable(this.allPieces).max(0) + 1;
		if (piece1 < piece2) {
			return piece2 - piece1 <= (upperBound / 2) ? 1 : -1;
		} else if (piece1 > piece2) {
			return piece1 - piece2 >= (upperBound / 2) + 1 ? 1 : -1;
		} else {
			return 0;
		}
	},
	
	/** Each turn all players play a piece, and the player who plays the greatest piece wins a 
	point.
	*/
	next: function next(moves, haps, update) {
		var player0 = this.players[0],
			player1 = this.players[1];
		if (!this.pieces[player0] || !this.pieces[player1]) { // This state is a view.
			return this.__viewNext__(moves, haps, update);
		}
		var move0 = moves[player0],
			move1 = moves[player1],
			pieces = this.pieces;
		raiseIf(pieces[player0].indexOf(move0) < 0, "Invalid move ", JSON.stringify(move0),
			" for player ", player0, "! (moves= ", JSON.stringify(moves), ")");
		raiseIf(pieces[player1].indexOf(move1) < 0, "Invalid move ", JSON.stringify(move1),
			" for player ", player1, "! (moves= ", JSON.stringify(moves), ")");
		var moveResult = this.moveResult(move0, move1),
			nextPlayedPieces = this.playedPieces.concat([move0, move1]),
			nextPieces = obj(
				player0, pieces[player0].filter(function (p) { 
					return p !== move0; 
				}), 
				player1, pieces[player1].filter(function (p) { 
					return p !== move1;
				})
			),
			nextScores = obj(player0, this.__scores__[player0] + moveResult,
				player1, this.__scores__[player1] - moveResult);
		if (update) {
			this.playedPieces = nextPlayedPieces;
			this.pieces = nextPieces;
			this.__scores__ = nextScores;
			return this;
		} else {
			return new this.constructor({
				playedPieces: nextPlayedPieces,
				pieces: nextPieces,
				scores: nextScores
			});
		}
	},
	
	__viewNext__: function __viewNext__(moves, haps, update) {
		var player = this.pieces[this.players[0]] ? this.players[0] : this.players[1],
			opponent = this.opponent(player);
		if (!haps) {
			return this.contingent(moves, 
				obj(player, aleatories.uniformAleatory(this.__possiblePieces__(opponent))), 
				update);
		} else {
			return (new this.constructor({
				pieces: obj(player, this.pieces[player], opponent, haps[opponent]), 
				playedPieces: this.playedPieces,
				scores: this.__scores__
			})).next(moves, null, update);
		}
	},

	/** The game's `score` is simply the sum of the move results for each player.
	*/
	scores: function scores() {
		return copy({}, this.__scores__);
	},
	
	/** A game of Mutropas ends when the players have no more pieces to play. The result is the 
	difference in scores.
	*/
	result: function result() {
		var players = this.players;
		if (this.playedPieces.length >= this.allPieces.length - 1) {
			var scores = this.scores();
			return this.zerosumResult(scores[players[0]] - scores[players[1]], players[0]);
		} else {
			return null;
		}
	},
	
	// ## Game views ###############################################################################
	
	/** The method `__possiblePieces__` calculates the pieces the `player` may have.
	*/
	__possiblePieces__: function __possiblePieces__(player) {
		var playedPieces = this.playedPieces,
			opponentPieces = this.pieces[this.opponent(player)],
			possiblePieces = iterable(this.allPieces).filter(function (p) {
				return playedPieces.indexOf(p) < 0 && // p has not been played yet ...
					opponentPieces.indexOf(p) < 0; // ... and the opponent does not have it.
			});
		return possiblePieces.combinations(possiblePieces.count() - 1);
	},
	
	/** In this view of the game the hidden information is modelled as random variables. The 
	aleatory that is returned ranges over all possible piece sets that the opponent of the given
	`player` may have. After each possibility the assumption is maintained for the rest of the
	game.
	
	This allows to model the uncertainty that each player has about its opponent's pieces. By doing
	so an artificial player that searches the game space cannot infer the pieces the opponent has,
	and hence it cannot cheat.
	*/	
	view: function view(player) {
		return new this.constructor({
			pieces: obj(player, this.pieces[player]), 
			playedPieces: this.playedPieces,
			scores: this.__scores__
		});
	},
	
	// ## Utility methods ##########################################################################
	
	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'Mutropas',
		serializer: function serialize_Mutropas(obj) {
			return [{
				pieces: obj.pieces, 
				playedPieces: obj.playedPieces,
				scores: obj.__scores__
			}];
		}
	}
}); // declare Mutropas