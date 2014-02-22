/** Implementation of player user interfaces and proxies in the Ludorum 
	library.
*/
var UserInterfacePlayer = players.UserInterfacePlayer = declare(Player, {
	/** new players.UserInterfacePlayer(params):
		Base class of all players that are proxies of user interfaces.
	*/
	constructor: function UserInterfacePlayer(params) {
		Player.call(this, params);
	},

	/** players.UserInterfacePlayer.decision(game, player):
		Returns a future that will be resolved when the perform() method is 
		called.
	*/
	decision: function decision(game, player) {
		if (this.__future__ && this.__future__.isPending()) {
			var error = new Error("Last decision has not been made. Match probably aborted.");
			this.__future__.reject(error); //TODO This should resolve to QUIT.
		}
		return this.__future__ = new Future();
	},
	
	/** players.UserInterfacePlayer.perform(action):
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

var UserInterface = players.UserInterface = declare({ ////////////////////
	/** new players.UserInterface(match, config):
		Base class for user interfaces that display a game and allow one
		or more players to play.
	*/
	constructor: function UserInterface(config) {
		this.onBegin = this.onBegin.bind(this);
		this.onNext = this.onNext.bind(this);
		this.onEnd = this.onEnd.bind(this);
		if (config.match) {
			this.show(config.match);
		}
	},
	
	/** players.UserInterface.show(match):
		Discards the current state and sets up to display the given match.
	*/
	show: function show(match) {
		if (this.match) {
			match.events.off('begin', this.onBegin);
			match.events.off('next', this.onNext);
			match.events.off('end', this.onEnd);
		}
		this.match = match;
		match.events.on('begin', this.onBegin);
		match.events.on('next', this.onNext);
		match.events.on('end', this.onEnd);
	},
	
	/** players.UserInterface.onBegin(game):
		Handler for the 'begin' event of the match.
	*/
	onBegin: function onBegin(game) {
		this.activePlayer = game.activePlayer();
		this.display(game);
	},
	
	/** players.UserInterface.onNext(game, next):
		Handler for the 'move' event of the match.
	*/
	onNext: function onNext(game, next) {
		this.activePlayer = next.activePlayer();
		this.display(next);
	},
	
	/** players.UserInterface.onEnd(game, results):
		Handler for the 'end' event of the match.
	*/
	onEnd: function onEnd(game, results) {
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
		var activePlayer = this.match.players[player];
		if (activePlayer instanceof UserInterfacePlayer) {
			activePlayer.perform(action);
		}
	}
}); // declare UserInterface.
	
UserInterface.BasicHTMLInterface = declare(UserInterface, { //////////////
	/** new players.UserInterface.BasicHTMLInterface(match, players, domElement):
		Simple HTML based UI, that renders the game to the given domElement
		using its toHTML method.
	*/
	constructor: function BasicHTMLInterfacePlayer(config) {
		UserInterface.call(this, config);
		this.container = config.container;
		if (typeof this.container === 'string') {
			this.container = document.getElementById(this.container);
		}
	},

	/** players.UserInterface.BasicHTMLInterface.display(game):
		When the player is participated of a match, a callback is registered
		to the match's events. This method renders the game to HTML at each 
		step in the match.
	*/
	display: function display(game) {
		var ui = this, 
			container = this.container;
		container.innerHTML = game.toHTML();
		Array.prototype.slice.call(container.querySelectorAll('[data-ludorum]')).forEach(function (elem) {
			var data = eval('({'+ elem.getAttribute('data-ludorum') +'})');
			if (data.hasOwnProperty('move')) {
				elem.onclick = ui.perform.bind(ui, data.move, data.activePlayer);
			}
		});
	}
}); // declare HTMLInterface.
