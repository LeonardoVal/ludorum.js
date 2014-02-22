/** Automatic player that is scripted previously.
*/
players.TracePlayer = declare(Player, {
	/** new players.TracePlayer(params):
		Builds a player that makes his decisions based on a trace, a list of 
		moves to follow.
	*/
	constructor: function TracePlayer(params) {
		Player.call(this, params);
		this.trace = iterable(params.trace);
		this.__iterator__ = this.trace.__iter__();
		this.__decision__ = this.__iterator__();
	},

	toString: function toString() {
		return (this.constructor.name || 'Player') +'('+ JSON.stringify({
			name: this.name, trace: this.trace.toArray()
		}) +')';
	},

	/** players.TracePlayer.decision(game, player):
		Returns the next move in the trace, or the last one if the trace has
		ended.
	*/
	decision: function(game, player) {
		try {
			this.__decision__ = this.__iterator__();
		} catch (err) {
			Iterable.prototype.catchStop(err);
		}
		return this.__decision__;
	}
}); // declare TracePlayer.
