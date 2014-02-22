/** Automatic players that moves fully randomly.
*/	
players.RandomPlayer = declare(Player, {
	/** new players.RandomPlayer(params):
		Builds a player that chooses its moves randomly.
	*/
	constructor: function RandomPlayer(params) {
		Player.call(this, params);
		initialize(this, params)
			.object('random', { defaultValue: Randomness.DEFAULT });
	},

	/** players.RandomPlayer.decision(game, player):
		Makes the decision completely at random.
	*/
	decision: function(game, player) {
		return this.random.choice(this.__moves__(game, player));
	}
}); // declare RandomPlayer.
