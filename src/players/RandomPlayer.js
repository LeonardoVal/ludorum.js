/** Automatic players that moves fully randomly.
*/	
players.RandomPlayer = declare(Player, {
	/** new players.RandomPlayer(name, random=basis.Randomness.DEFAULT):
		Builds a player that chooses its moves randomly.
	*/
	constructor: function RandomPlayer(name, random) {
		Player.call(this, name);
		this.random = random || Randomness.DEFAULT;
	},

	toString: function toString() {
		return 'RandomPlayer('+ JSON.stringify(this.name) +')';
	},

	/** players.RandomPlayer.decision(game, player):
		Makes the decision completely at random.
	*/
	decision: function(game, player) {
		return this.random.choice(this.__moves__(game, player));
	}
}); // declare RandomPlayer.
