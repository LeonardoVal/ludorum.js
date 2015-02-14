/** # Cache

A game cache contains a part of a game tree, avoiding redundancies. It can be
used to implement a [transposition table](http://en.wikipedia.org/wiki/Transposition_table) 
or similar data structures.
*/
utils.Cache = declare({
	/** The `Cache` constructor may take a game to define as `root`.
	*/
	constructor: function Cache(game) {
		this.clear();
		game && this.root(game);
	},
	
	/** The `stateIdentifier(state)` of every game state is used as the key in 
	the cache's entries. By default is calculated with the `Game.identifier()`
	method.
	*/
	stateIdentifier: function stateIdentifier(state) {
		return state.identifier();
	},
	
	/** The `moveIdentifier(move)` is used as the key in each entry's 
	descendants. By default it uses the move JSON _stringification_.
	*/
	moveIdentifier: function moveIdentifier(move) {
		return JSON.stringify(move);
	},
	
	/** The `has(state|id)` returns if the given state or state identifier has 
	an entry in this cache.
	*/
	has: function has(state) {
		var stateId = typeof state === 'string' ? state : this.stateIdentifier(state);
		return this.__entries__.hasOwnProperty(stateId);
	},
	
	/** If the given state or state identifier has en entry in this cache, 
	`get(state)` returns that entry. Else it returns `undefined`.
	*/
	get: function get(state) {
		var stateId = typeof state === 'string' ? state : this.stateIdentifier(state);
		return this.__entries__[stateId];
	},
	
	/** `size()` returns the amount of entries in this cache.
	*/
	size: function size() {
		return Object.keys(this.__entries__).length;
	},
	
	/** If the given state has no entry in this cache, `entry(state, id)` builds
	a new entry, adds it to this cache and returns it. If the state is already
	cached, its entry is returned.
	Every entry has the game `state`, its `id`, the states that may come before
	(the `precursors`) and the states that may follow (the `descendants`).
	*/
	entry: function entry(state, id) {
		id = id || this.stateIdentifier(state);
		if (this.has(id)) {
			return this.get(id);
		} else {
			var _entry = { id: id, state: state, precursors: [], descendants: {} };
			this.__entries__[id] = _entry;
			return _entry;
		}
	},
	
	/** An entry's `descendant(entry, moves)` is the entry of the game state 
	following the given entry's game state with the given moves. The method not
	only returns the entry is this state, it creates and caches that entry if 
	not present.
	*/
	descendant: function descendant(entry, moves) {
		var movesId = this.moveIdentifier(moves),
			descendants = entry.descendants;
		if (descendants.hasOwnProperty(movesId)) { // Already expanded.
			return descendants[movesId][1];
		} else {
			var nextState = entry.state.next(moves),
				nextStateId = this.stateIdentifier(nextState),
				nextEntry = this.get(nextStateId) // Reuse entry in cache if it exists.
					|| this.entry(nextState, nextStateId); // Else add new entry.
			descendants[movesId] = [moves, nextEntry];
			nextEntry.precursors.push([moves, entry]);
			return nextEntry;
		}
	},
	
	/** An entry `descendants(entry)` is an array of all the entry's 
	descendants, for all the possible moves for the entry's state.
	*/
	descendants: function descendants(entry) {
		var descendant = this.descendant.bind(this, entry);
		if (arguments.length > 1) {
			return Array.prototype.slice.call(arguments, 1).map(descendant);
		} else { // if (arguments.length == 0)
			return entry.state.possibleMoves().map(descendant);
		}
	},
	
	/** A clear cache has no entries and of course no root.
	*/
	clear: function clear() {
		this.__entries__ = {};
		this.__root__ = null;
	},
	
	/** If `root()` is called without arguments, it returns the current root.
	If a state is given, that state is assigned as the new root, and the whole
	cache is pruned.
	*/
	root: function root(state) {
		if (arguments.length > 0) { // Called with argument means setter.
			var stateId = this.stateIdentifier(state);
			this.__root__ = this.get(stateId) || this.entry(state, stateId);
			this.prune(stateId);
		}
		return this.__root__;
	},
	
	/** `prune(id=root.id)` deletes all nodes except the one with the given id 
	and its descendants.
	*/
	prune: function prune(id) {
		var pending = [id || this.__root__.id], 
			pruned = {},
			entry;
		while (id = pending.shift()) {
			if (!pruned.hasOwnProperty(id)) {
				entry = this.get(id);
				pruned[id] = entry;
				pending.push.apply(pending, iterable(entry.descendants).mapApply(function (id, pair) {
					return pair[1].id;
				}).toArray());
			}
		}
		return this.__entries__ = pruned;
	}	
}); // declare Cache
