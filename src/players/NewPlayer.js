/**

*/
var NewPlayer = players.NewPlayer = declare(HeuristicPlayer, {
	/** 
	*/
	constructor: function NewPlayer(params) {
		HeuristicPlayer.call(this, params);
		
	},

	/**
	*/
	evaluatedMoves: function evaluatedMoves(game, player) {
		var options = this.possibleMoves(game, player).map(function (m) {
				return {
					move: m,
					count: 0,
					sum: 0
				};
			}),
			playthrough = this.randomlyComplete([{ state: game }]);
		for (var i = 0; i < 100; i++) { //FIXME Magic 100.
			this.accountResult(options, playthrough, player);
			this.step(playthrough, game.players[i % game.players.length], 5); //FIXME Magic 5.
		}
		this.accountResult(options, playthrough, player);
		return options.map(function (option) {
			raiseIf(isNaN(option.sum), "State evaluation is NaN for move ", option.move, "!");
			return [option.move, option.count > 0 ? option.sum / option.count : 0, option.count];
		});
	},

	/** A `step` in the search takes a `playthrough` and explores `n` random changes, seeking to
	improve its final result for the given `player`. The playthrough must be a sequence of game
	states and moves, same as the `history` of a `Match`.
	*/
	step: function step(playthrough, player, n) {
		var self = this,
			playersPlies = iterable(playthrough).filter(function (entry) {
					return entry.state.isActive(player);
				}, function (entry, i) {
					return i;
				}).toArray(),
			randomPlies = this.random.choices(n, playersPlies), //TODO Ply selection distribution
			changedPlaythroughs = randomPlies.map(function (ply) { //TODO Not entirely correct for simultaneous games.
				return self.randomlyComplete(playthrough.slice(0, ply)); 
			}),
			bestChangedPlaythrough = iterable(changedPlaythroughs).greater(function (p) {
				return p[p.length - 1].result[player];
			});
		return this.random.choice(bestChangedPlaythrough);
	},

	/** The `randomlyComplete` functions takes an incomplete `playthrough` and takes random moves
	for all players until a final game state is reached.
	*/
	randomlyComplete: function randomlyComplete(playthrough) {
		var ply = playthrough[playthrough.length - 1],
			randomNext;
		ply.result = ply.state.result();
		while (!ply.result) {
			randomNext = ply.state.randomNext(this.random);
			ply.moves = randomNext.moves;
			ply = { state: randomNext.state };
			playthrough.push(ply);
			ply.result = ply.state.result();
		}
		return playthrough;
	},

	/** Accounting a `playthrough`'s result considers all options that have the same moves as the
	playthrough's first moves.
	*/
	accountResult: function accountResult(options, playthrough, player) {
		var firstPly = playthrough[0],
			playthroughResult = playthrough[playthrough.length - 1].result; 
			count = 0;
		options.forEach(function (option) {
			var applies = iterable(firstPly.activePlayers).all(function (activePlayer) {
				return option.moves[activePlayer] == firstPly.moves[activePlayer]; 
			});
			if (applies) {
				count++;
				option.count++;
				option.sum += playthroughResult[player];
			}
		});
		return count;
	}
}); // declare NewPlayer