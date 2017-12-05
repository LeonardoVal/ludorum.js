/** # RandomPlayer

Automatic players that moves fully randomly.
*/	
players.RandomPlayer = declare(Player, {
	/** The constructor takes the player's `name` and a `random` number generator
	(`base.Randomness.DEFAULT` by default).
	*/
	constructor: function RandomPlayer(params) {
		Player.call(this, params);
		initialize(this, params)
			.object('random', { defaultValue: Randomness.DEFAULT });
	},

	/** The `decision(game, player)` is made completely at random.
	*/
	decision: function(game, player) {
		raiseIf(game.isContingent, "Contingent game state has no moves!");
		return this.random.choice(this.movesFor(game, player));
	},
	
	// ## Utilities ################################################################################
	
	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'RandomPlayer',
		serializer: function serialize_RandomPlayer(obj) {
			return this.serializeAsProperties(obj, ['name', 'random']);
		}
	},
}); // declare RandomPlayer.
