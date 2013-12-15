/** ludorum/src/players/RandomPlayer.js:
	Automatic players that moves fully randomly.

	@author <a href="mailto:leonardo.val@creatartis.com">Leonardo Val</a>
	@licence MIT Licence
*/
// Random players //////////////////////////////////////////////////////////////
	
players.RandomPlayer = basis.declare(Player, {
	/** new RandomPlayer(name, random=basis.Randomness.DEFAULT):
		Builds a player that chooses its moves randomly.
	*/
	constructor: function RandomPlayer(name, random) {
		Player.call(this, name);
		this.random = random || basis.Randomness.DEFAULT;
	},

	toString: function toString() {
		return 'RandomPlayer('+ JSON.stringify(this.name) +')';
	},

	/** RandomPlayer.decision(game, player):
		Makes the decision completely at random.
	*/
	decision: function(game, player) {
		return this.random.choice(this.__moves__(game, player));
	}
}); // declare RandomPlayer.
