/** ludorum/src/players/UserInterfacePlayer.js:
	Implementation of player user interfaces and proxies in the Ludorum 
	library.

	@author <a href="mailto:leonardo.val@creatartis.com">Leonardo Val</a>
	@licence MIT Licence
*/
// User interfaces proxies for Player. /////////////////////////////////////////
	
var UserInterfacePlayer = players.UserInterfacePlayer = basis.declare(Player, {
	/** new UserInterfacePlayer(name):
		Base class of all players that are proxies of user interfaces.
	*/
	constructor: function UserInterfacePlayer(name) {
		Player.call(this, name);
	},

	/** UserInterfacePlayer.decision(game, player):
		Returns a future that will be resolved when the perform() method is 
		called.
	*/
	decision: function decision(game, player) {
		if (this.__future__ && this.__future__.isPending()) {
			var error = new Error("Last decision has not been made. Match probably aborted.");
			this.__future__.reject(error);
		}
		return this.__future__ = new basis.Future();
	},
	
	/** UserInterfacePlayer.perform(action):
		Resolves the decision future. This method is meant to be called by 
		the user interface.
	*/
	perform: function perform(action) {
		var future = this.__future__;
		if (future) {
			this.__future__ = null;
			future.resolve(action);
		}
		return !!future;
	}
}); // declare UserInterfacePlayer.
	
// User interfaces base constructor. ///////////////////////////////////////////

var UserInterface = players.UserInterface = basis.declare({
	/** new players.UserInterface(match, config):
		Base class for user interfaces that display a game and allow one
		or more players to play.
	*/
	constructor: function UserInterface(match, config) {
		this.match = match;
		basis.initialize(this, config)
			.array('players', { defaultValue: match.state().players });
		match.events.on('begin', this.onBegin.bind(this));
		match.events.on('move', this.onMove.bind(this));
		match.events.on('end', this.onEnd.bind(this));
	},
	
	/** players.UserInterface.onBegin(players, game):
		Handler for the 'begin' event of the match.
	*/
	onBegin: function onBegin(players, game) {
		this.activePlayer = game.activePlayer();
		this.display(game);
	},
	
	/** players.UserInterface.onMove(moves, game, next):
		Handler for the 'move' event of the match.
	*/
	onMove: function onMove(moves, game, next) {
		this.activePlayer = next.activePlayer();
		this.display(next);
	},
	
	/** players.UserInterface.onEnd(results, game):
		Handler for the 'end' event of the match.
	*/
	onEnd: function onEnd(results, game) {
		this.activePlayer = null;
		this.results = results;
		this.display(game);
	},
	
	/** players.UserInterface.display(game):
		Renders the game in this user interface. Not implemented, so please
		override.
	*/
	display: function display(game) {
		throw new Error("UserInterface.display is not defined. Please override.");
	},
	
	/** players.UserInterface.perform(action, player=<active player>):
		Makes the given player perform the action if the player has a 
		perform method and is included in this UI's players.
	*/
	perform: function perform(action, player) {
		player = player || this.match.state().activePlayer();
		if (this.players.indexOf(player) >= 0) {
			var activePlayer = this.match.players[player];
			if (activePlayer && typeof activePlayer.perform === 'function') {
				activePlayer.perform(action);
			}
		}
	}
}); // declare UserInterface.
	
// Basic HTML user interface support. //////////////////////////////////////////
	
UserInterface.BasicHTMLInterface = basis.declare(UserInterface, {
	/** new BasicHTMLInterface(match, players, domElement):
		Simple HTML based UI, that renders the game to the given domElement
		using its toHTML method.
	*/
	constructor: function BasicHTMLInterfacePlayer(match, config) {
		exports.UserInterface.call(this, match, config);
		this.domElement = config.domElement;
		if (typeof this.domElement === 'string') {
			this.domElement = document.getElementById(this.domElement);
		}
	},

	/** BasicHTMLInterface.display(game):
		When the player is participated of a match, a callback is registered
		to the match's events. This method renders the game to HTML at each 
		step in the match.
	*/
	display: function display(game) {
		domElement.innerHTML = game.toHTML();
	}
}); // declare HTMLInterface.
	
// KineticJS graphical user interface. //////////////////////////////////////////

UserInterface.KineticJSInterface = basis.declare(UserInterface, {
	/** new KineticJSInterface(match, config):
		TODO.
	*/
	constructor: function KineticJSInterface(match, config) {
		exports.UserInterface.call(this, match, config);
		basis.initialize(this, config)
			.object('container')
			.object('Kinetic', { defaultValue: window.Kinetic });
		this.container.destroyChildren(); // Clear the container.
	}
}); // declare KineticJSInterface.
