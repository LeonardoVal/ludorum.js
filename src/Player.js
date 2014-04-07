/** ## Class `Player`

Player is the base type for all playing agents. Basically, playing a game means
choosing a move from all available ones, each time the game enables the player 
to do so.
*/
var Player = exports.Player = declare({
	/** The default constructor takes only its `name` from the given `params`.
	This is an abstract class that is meant to be extended.
	*/
	constructor: (function () {
		var __PlayerCount__ = 0; // Used by the Player's default naming.
		return function Player(params) {
			initialize(this, params)
				.string('name', { defaultValue: 'Player' + (__PlayerCount__++), coerce: true });
		};
	})(),

	/** A player is asked to choose a move by calling 
	`Player.decision(game, role)`. The result is the selected move if it can be 
	obtained synchronously, else a future is returned.
	*/
	decision: function decision(game, role) {
		return this.__moves__(game, role)[0]; // Indeed not a very thoughtful base implementation. 
	},

	/** To help implement the decision, `Player.__moves__(game, player)` gets
	the moves in the game for the player. It also checks if there are any moves,
	and if it not so an error is risen.
	*/
	__moves__: function __moves__(game, role) {
		var moves = game.moves();
		raiseIf(!moves || !moves[role] || moves[role].length < 1, 
			"Player ", role, " has no moves for game ", game, ".");
		return moves[role];
	},
	
	/** Before starting a [match](Match.html), all players are asked to join
	by calling `Player.participate(match, role)`. This allows the player to
	prepare properly. If this implies building another instance of the player 
	object, it must be returned in order to participate in the match.
	*/
	participate: function participate(match, role) {
		return this;
	},
	
	// ### Conversions & presentations #########################################

	/** Players can also be serialized, pretty much in the same way 
	[games](Game.html) are. `Player.__serialize__()` returns an array, where the 
	first element should be the name of the game, and the rest the arguments to 
	call the player's constructor in order to rebuild this player's state.
	*/
	__serialize__: function __serialize__() {
		return [this.constructor.name, {name: this.name}];
	},
	
	/** The string representation of the player is derived straight from its
	serialization.
	*/
	toString: function toString() {
		var args = this.__serialize__();
		return args.shift() +'('+ args.map(JSON.stringify).join(',') +')';
	}
}); // declare Player.

/** The namespace `ludorum.players` contains all kinds of players provided by
this library: artificial intelligences, user interface proxies and others.
*/
var players = exports.players = {};