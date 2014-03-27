games.Mutropas = declare(Game, {
	/** games.Mutropas.allPieces=[0, .., 8]:
		TODO.
	*/
	allPieces: basis.Iterable.range(9).toArray(),
	
	name: 'Mutropas',
	
	players: ['Left', 'Right'],
	
	/** new games.Mutropas(args):
		TODO
	*/
	constructor: function Mutropas(args) {
		Game.call(this, this.players);
		args = args || {};
		this._pieces = args.pieces || this.dealtPieces(args.random);
		this._scores = args.scores || basis.obj(this.players[0], 0, this.players[1], 0);
	},
	
	result: function result() {
		var player0 = this.players[0];
		if (this._pieces[player0].length < 1) {
			return basis.copy({}, this._scores);
		} else {
			return null;
		}
	},
	
	moves: function moves() {
		var player0 = this.players[0],
			player1 = this.players[1];
		if (!this.result()) {
			return basis.obj(
				player0, this._pieces[player0].slice(), 
				player1, this._pieces[player1].slice()
			);
		} else {
			return null;
		}
	},	
	
	next: function next(moves) {
		var player0 = this.players[0],
			player1 = this.players[1],
			move0 = moves[player0],
			move1 = moves[player1];
		raiseIf(this._pieces[player0].indexOf(move0) < 0, 
			"Invalid move "+ JSON.stringify(move0) +" for player "+ player0 +"! (moves= "+ JSON.stringify(moves) +")");
		raiseIf(this._pieces[player1].indexOf(move1) < 0, 
			"Invalid move "+ JSON.stringify(move1) +" for player "+ player1 +"! (moves= "+ JSON.stringify(moves) +")");
		var moveResult = this.moveResult(move0, move1),
			newPieces0 = this._pieces[player0].slice(),
			newPieces1 = this._pieces[player1].slice();
		newPieces0.splice(newPieces0.indexOf(move0), 1);
		newPieces1.splice(newPieces1.indexOf(move1), 1);
		return new this.constructor({ 
			pieces: basis.obj(player0, newPieces0, player1, newPieces1),
			scores: basis.obj(
				player0, this._scores[player0] + moveResult,
				player1, this._scores[player1] - moveResult
			)
		});
	},
	
	__serialize__: function __serialize__() {
		return [this.name, { pieces: this._pieces, scores: this._scores }];
	},
	
	dealtPieces: function dealtPieces(random) {
		var random = random || basis.Randomness.DEFAULT,
			piecesPerPlayer = this.allPieces.length >> 1,
			split1 = random.split(piecesPerPlayer, this.allPieces),
			split2 = random.split(piecesPerPlayer, split1[1]);
		return basis.obj(this.players[0], split1[0], this.players[1], split2[0]);
	},
	
	moveResult: function moveResult(piece1, piece2) {
		var upperBound = basis.iterable(this.allPieces).max(0) + 1;
		if (piece1 < piece2) {
			return piece2 - piece1 <= (upperBound >> 1) ? 1 : -1;
		} else if (piece1 > piece2) {
			return piece1 - piece2 >= (upperBound >> 1) + 1 ? 1 : -1;
		} else {
			return 0;
		}
	}
}); // declare Mutropas