/** # EnsemblePlayer

Players defined as a combination of other players.
*/
players.EnsemblePlayer = declare(Player, {
	/** The constructor takes the player's `name`, a `random` number generator
	(`base.Randomness.DEFAULT` by default), and (optionally) an array of `players`.
	*/
	constructor: function EnsemblePlayer(params) {
		Player.call(this, params);
		initialize(this, params)
			.object('random', { defaultValue: Randomness.DEFAULT })
			.array('players', { ignore: true });
	},

	players: [],

	/** The `playerSelection` returns a subset of all `players` which can be used to decide on the
	given `game` state. By default all players are selected.
	*/
	playerSelection: function playerSelection(game, role) {
		return this.players;
	},

	/** By default one of the selected players is chosen at random.
	*/
	decision: function(game, role) {
		return this.randomDecision(game, role);
	},

	// ## Posible combinations ####################################################################

	/** A `randomDecision` delegates the decision to one of the available `players` chosen at
	random.
	*/
	randomDecision: function randomDecision(game, role, players) {
		players = players || this.playerSelection(game, role);
		raiseIf(players.length < 1, "No player was selected!");
		return (players.length == 1 ? players[0] : this.random.choice(players))
			.decision(game, role);
	},

	// ## Utilities ################################################################################

	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'EnsemblePlayer',
		serializer: function serialize_EnsemblePlayer(obj) {
			return this.serializeAsProperties(obj, ['name', 'random', 'players']);
		}
	},
}); // declare RandomPlayer.
