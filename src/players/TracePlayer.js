/** # TracePlayer

Automatic player that is scripted previously.
*/
players.TracePlayer = declare(Player, {
	/** The constructor takes the player's `name` and the `trace` as an 
	sequence of moves to make.
	*/
	constructor: function TracePlayer(params) {
		Player.call(this, params);
		this.trace = iterable(params.trace);
		this.__iter__ = this.trace.__iter__();
		this.__decision__ = this.__iter__();
	},

	/** The `decision(game, player)` returns the next move in the trace, or the 
	last one if the trace has ended.
	*/
	decision: function(game, player) {
		try {
			this.__decision__ = this.__iter__();
		} catch (err) {
			Iterable.prototype.catchStop(err);
		}
		return this.__decision__;
	},
	
	__serialize__: function __serialize__() {
		return ['TracePlayer', { name: this.name, trace: this.trace.toArray() }];
	}
}); // declare TracePlayer.
