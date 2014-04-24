/** A proxy for another player executing inside a webworker.
*/
var WebWorkerPlayer = players.WebWorkerPlayer = declare(Player, {
	/** new players.WebWorkerPlayer(params):
		Builds a player that is a proxy for another player executing in a web
		worker.
	*/
	constructor: function WebWorkerPlayer(params) {
		Player.call(this, params);
		initialize(this, params)
		/** players.WebWorkerPlayer.worker:
			The Worker instance where the actual player is executing.
		*/
			.object('worker');
		this.worker.onmessage = base.Parallel.prototype.__onmessage__.bind(this);
	},
	
	/** static WebWorkerPlayer.createWorker(playerBuilder):
		Asynchronously creates and initializes a web worker. The modules 
		creatartis-base and	ludorum are loaded in the global namespace (self), 
		before calling the given playerBuilder function. Its results will be 
		stored in the global variable PLAYER.
	*/
	"static createWorker": function createWorker(playerBuilder) {
		raiseIf('string function'.indexOf(typeof playerBuilder) < 0, 
			"Invalid player builder: "+ playerBuilder +"!");
		var parallel = new base.Parallel();
		return parallel.run('self.ludorum = ('+ exports.__init__ +')(self.base), "OK"'
			).then(function () {
				return parallel.run('self.PLAYER = ('+ playerBuilder +').call(self), "OK"');
			}).then(function () {
				return parallel.worker;
			});
	},
	
	/** static WebWorkerPlayer.create(params):
		Asynchronously creates and initializes a WebWorkerPlayer, with a web 
		worker ready to play. The params must include the playerBuilder function
		to execute on the web worker's environment.
	*/
	"static create": function create(params) {
		var WebWorkerPlayer = this;
		return WebWorkerPlayer.createWorker(params.playerBuilder).then(function (worker) {
			return new WebWorkerPlayer({name: name, worker: worker}); 
		});
	},
	
	/** players.WebWorkerPlayer.decision(game, player):
		The decision is delegated to this player's webworker, returning a future
		that will be resolved when the parallel execution is over. 
		Warning! If this method is called while another decision is pending, the 
		player will assume the previous match was aborted, issuing a QUIT 
		command.
	*/
	decision: function decision(game, player) {
		if (this.__future__ && this.__future__.isPending()) {
			this.__future__.resolve(Match.commandQuit);
		}
		this.__future__ = new Future();
		this.worker.postMessage('PLAYER.decision(ludorum.Game.fromJSON('+ game.toJSON() 
			+'), '+ JSON.stringify(player) +')');
		return this.__future__;
	}
}); // declare WebWorkerPlayer