﻿/** # Player

Player is the base type for all playing agents. Basically, playing a game means choosing a move from 
all available ones, each time the game enables the player to do so.
*/
var Player = exports.Player = declare({
	/** The default constructor takes only its `name` from the given `params`. This is an abstract 
	class that is meant to be extended.
	*/
	constructor: (function () {
		var __PlayerCount__ = 0; // Used by the Player's default naming.
		return function Player(params) {
			var prototype = Object.getPrototypeOf(this);
			initialize(this, params)
				.string('name', { defaultValue: 'Player' + (__PlayerCount__++), coerce: true })
				.object('random', { defaultValue: prototype.random });
		};
	})(),

	random: Randomness.DEFAULT,

	/** A player is asked to choose a move by calling `Player.decision(game, role)`. The result is 
	the selected move if it can be obtained synchronously, else a future is returned.
	*/
	decision: function decision(game, role) {
		return this.movesFor(game, role)[0]; // Indeed not a very thoughtful base implementation. 
	},

	/** To help implement the decision, `Player.movesFor(game, player)` gets the moves in the game 
	for the player. It also checks if there are any moves, and if it not so an error is risen.
	*/
	movesFor: function movesFor(game, role) {
		var moves = game.moves();
		raiseIf(!moves || !moves[role] || moves[role].length < 1, 
			"Player ", role, " has no moves for game ", game, ".");
		return moves[role];
	},
	
	/** Not all players can be used to play with all games. Still, by default the result of 
	`isCompatibleWith` is `true`.
	*/
	isCompatibleWith: function isCompatibleWith(game) {
		return true;
	},
	
	/** Before starting a [match](Match.js.html), all players are asked to join by calling 
	`Player.participate(match, role)`. This allows the player to prepare properly. If this implies 
	building another instance of the player object, it must be returned in order to participate in 
	the match.
	*/
	participate: function participate(match, role) {
		return this;
	},
	
	// ## Utilities ################################################################################
	
	/** `make` is a shortcut for making a subclass of `Player`.
	*/
	'static make': function make(members) {
		return declare(this, members);
	},

	/** The `playTo` method makes a match for the given `game` where all roles are played by this
	agent.
	*/
	'dual playTo': function playTo(game) {
		var self = this,
			players = game.players.map(function (role) {
				return typeof self === 'function' ? new self() : self;
			});
		return new Match(game, players);
	},

	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'Player',
		serializer: function serialize_Player(obj) {
			return [{name: obj.name}];
		}
	},
	
	/** The string representation of the player is derived straight from its serialization.
	*/
	toString: function toString() {
		return Sermat.ser(this);
	}
}); // declare Player.
