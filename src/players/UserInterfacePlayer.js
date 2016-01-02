/** # UserInterfacePlayer

Implementation of player user interfaces and proxies.
*/
var UserInterfacePlayer = players.UserInterfacePlayer = declare(Player, {
	/** `UserInterfacePlayer` is a generic type for all players that are proxies of user interfaces.
	*/
	constructor: function UserInterfacePlayer(params) {
		Player.call(this, params);
	},

	/** The `participate` method assigns this players role to the given role.
	*/
	participate: function participate(match, role) {
		this.role = role;
		return this;
	},
	
	/** The `decision(game, player)` of this players returns a future that will be resolved when the 
	`perform()` method is called.
	*/
	decision: function decision(game, player) {
		if (this.__future__ && this.__future__.isPending()) {
			this.__future__.resolve(new Match.commands.Quit());
		}
		this.__future__ = new Future();
		return this.__future__;
	},
	
	/**  User interfaces have to be configured to call `perform(action)` upon each significant user 
	action.players. It resolves the future returned by the `decision()` method.
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

// ## User interfaces ##############################################################################

var UserInterface = players.UserInterface = declare({
	/** `UserInterface` is the base abstract type for user interfaces that display a game and allow 
	one or more players to play. The `config` argument may include the `match` being played.
	*/
	constructor: function UserInterface(config) {
		this.onBegin = this.onBegin.bind(this);
		this.onNext = this.onNext.bind(this);
		this.onEnd = this.onEnd.bind(this);
		if (config.match) {
			this.show(config.match);
		}
	},
	
	/** `show(match)` discards the current state and sets up to display the given `match`.
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
	
	/** When the player is participated of a match, callbacks are registered to the following 
	match's events.
	
	+ `onBegin(game)` handles the `'begin'` event of the match.
	*/
	onBegin: function onBegin(game) {
		this.display(game);
	},
	
	/** + `onNext(game, next)` handles the `'move'` event of the match.
	*/
	onNext: function onNext(game, next) {
		this.display(next);
	},
	
	/** + `onEnd(game, results)` handles the `'end'` event of the match.
	*/
	onEnd: function onEnd(game, results) {
		this.results = results;
		this.display(game);
	},
	
	/** `display(game)` renders the game in this user interface. Not implemented, so please 
	override.
	*/
	display: unimplemented("UserInterface", "display"),
	
	/** `perform(action, actionRole=undefined)` makes the given player perform the action if the 
	player has a `perform()` method and is included in this UI's players.
	*/
	perform: function perform(action, actionRole) {
		iterable(this.match.players).forEach(function (pair) {
			var role = pair[0], player = pair[1];
			if (player instanceof UserInterfacePlayer && (!actionRole || player.role === actionRole)) {
				player.perform(action);
			}
		});
	}
}); // declare UserInterface.

// ### HTML based user interfaces ##################################################################

UserInterface.BasicHTMLInterface = declare(UserInterface, {
	/** `BasicHTMLInterface(config)` builds a simple HTML based UI, that renders the game on the DOM 
	using its `display()` method. The `config` argument may include:
	
	+ `document=window.document`: the DOM root.
	+ `container`: the DOM node to render the game in, or its name.
	*/
	constructor: function BasicHTMLInterface(config) {
		UserInterface.call(this, config);
		this.document = config.document || base.global.document;
		this.container = config.container;
		if (typeof this.container === 'string') {
			this.container = this.document.getElementById(this.container);
		}
	},

	/** On `display(game)` the `container` is emptied and the game is rendered using its 
	`display(ui)` method.
	*/
	display: function display(game) {
		var container = this.container, child;
		while (child = container.firstChild) { // It seems the DOM API does not provide a method for this. :-(
			container.removeChild(child);
		}
		game.display(this);
	},
	
	/** `build()` helps DOM creation. The `nodes` argument specifies DOM elements, each with an 
	array of the shape: `[tag, attributes, elements]`.
	*/
	build: function build(parent, nodes) {
		var ui = this;
		nodes.forEach(function (node) {
			var element;
			if (Array.isArray(node)) {
				element = ui.document.createElement(node[0]);
				if (node.length > 2 && node[1]) { // There are attributes.
					var attrs = node[1];
					for (var attrName in attrs) if (attr.hasOwnProperty(attrName)) {
						element.setAttribute(attrName, attrs[attrName]);
					}
				}
				if (node.length > 1 && node[node.length-1]) { // There are child elements.
					ui.build(element, node[node.length-1]);
				}
			} else if (typeof node === 'string') {
				element = ui.document.createTextNode(node);
			}
			if (element && parent) {
				parent.appendChild(element);
			}
		});
		return parent;
	}
}); // declare HTMLInterface.
