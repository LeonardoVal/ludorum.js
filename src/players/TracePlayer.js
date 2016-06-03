/** # TracePlayer

Automatic player that is scripted previously.
*/
players.TracePlayer = declare(Player, {
	/** The constructor takes the player's `name` and the `trace` as an sequence of moves to make.
	*/
	constructor: function TracePlayer(params) {
		Player.call(this, params);
		this.trace = iterable(params.trace);
		this.__iter__ = this.trace.__iter__();
		this.__decision__ = this.__iter__();
	},

	/** The `decision(game, player)` returns the next move in the trace, or the last one if the 
	trace has ended.
	*/
	decision: function(game, player) {
		try {
			this.__decision__ = this.__iter__();
		} catch (err) {
			Iterable.prototype.catchStop(err);
		}
		return this.__decision__;
	},
	
	// ## Utilities ################################################################################
	
	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'TracePlayer',
		serializer: function serialize_TracePlayer(obj) {
			var ser = Player.__SERMAT__.serializer(obj),
				args = ser[0];
			args.trace = obj.trace.toArray();
			return ser;
		}
	}
}); // declare TracePlayer.
