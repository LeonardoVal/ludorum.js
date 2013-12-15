/** ludorum/src/players/TracePlayer.js:
	Automatic player that is scripted previously.

	@author <a href="mailto:leonardo.val@creatartis.com">Leonardo Val</a>
	@licence MIT Licence
*/
// Trace players ///////////////////////////////////////////////////////////////

players.TracePlayer = basis.declare(Player, {
	/** new TracePlayer(name, trace):
		Builds a player that makes his decisions based on a trace, a list of 
		moves to follow.
	*/
	constructor: function TracePlayer(name, trace) {
		Player.call(this, name);
		this.trace = basis.iterable(trace);
		this.__iterator__ = this.trace.__iter__();
		this.__decision__ = this.__iterator__();
	},

	toString: function toString() {
		return 'TracePlayer('+ JSON.stringify(this.name) +', ['+ this.trace.join(', ') +'])';
	},

	/** TracePlayer.decision(game, player):
		Returns the next move in the trace, or the last one if the trace has
		ended.
	*/
	decision: function(game, player) {
		try {
			this.__decision__ = this.__iterator__();
		} catch (err) {
			basis.Iterable.prototype.catchStop(err);
		}
		return this.__decision__;
	}
}); // declare TracePlayer.
