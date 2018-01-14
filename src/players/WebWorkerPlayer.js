/** # WebWorkerPlayer

A proxy for another player executing inside a webworker.
*/
var WebWorkerPlayer = players.WebWorkerPlayer = declare(Player, {
	/** The constructor builds a player that is a proxy for another player executing in a webworker.
	The parameters must include:
	*/
	constructor: function WebWorkerPlayer(params) {
		Player.call(this, params);
		initialize(this, params)
			/** + `worker`: The `Worker` instance where the actual player is executing.
			*/
			.object('worker');
		this.worker.onmessage = base.Parallel.prototype.__onmessage__.bind(this);
	},

	/** The static `createWorker(playerBuilder)` method creates (asynchronously) and initializes a
	web worker. The modules `creatartis-base` and `ludorum` are loaded in the webworker's root
	namespace (`self`). If a `workerSetup` function is given, it is also run. After that, the
	`playerBuilder` function is called and its results stored in the variable `self.PLAYER`.
	*/
	'static createWorker': function createWorker(params) {
		raiseIf('string function'.indexOf(typeof params.playerBuilder) < 0,
			"Invalid player builder: "+ params.playerBuilder +"!");
		raiseIf(params.workerSetup && 'string function'.indexOf(typeof params.workerSetup) < 0,
			"Invalid worker setup: "+ params.workerSetup +"!");
		var parallel = new base.Parallel(),
			deps = [exports].concat(params.dependencies || []);
		return Future.sequence(deps, function (dependency) {
				return parallel.loadModule(dependency, true);
			}).then(function () {
				return parallel.run(
					(params.workerSetup ? '('+ params.workerSetup +')(),\n' : '')+
					'self.PLAYER = ('+ params.playerBuilder +').call(self),\n'+
					'"OK"');
			}).then(function () {
				var worker = parallel.worker;
				worker.__parallel__ = parallel;
				return worker;
			});
	},

	/** The static `create(params)` method creates (asynchronously) and initializes a
	`WebWorkerPlayer`, with a web worker ready to play. The `params` must include the
	`playerBuilder` function to execute on the web worker's environment.
	*/
	'static create': function create(params) {
		var WebWorkerPlayer = this;
		return WebWorkerPlayer.createWorker(params).then(function (worker) {
			return new WebWorkerPlayer({name: name, worker: worker});
		});
	},

	/** The webworker player stores the future of the current computation in the `__future__`
	property. If one code is executed in the webworker before a previous one ends, the previous one
	gets resolved with a `cancelValue` or rejected.
	*/
	__newFuture__: function __newFuture__(cancelValue) {
		var future = this.__future__;
		if (future && future.isPending()) {
			if (future.hasOwnProperty('__cancelValue__')) {
				future.resolve(future.__cancelValue__);
			} else {
				future.reject("Canceled!");
			}
		}
		future = new Future();
		if (typeof cancelValue !== 'undefined') {
			future.__cancelValue__ = cancelValue;
		}
		this.__future__ = future;
		return future;
	},

	/** The `__onemessage__` method is the handler of the webworker messages to the calling thread.
	*/
	__onmessage__: function __onmessage__(msg) {
		var future = this.__future__;
		if (future) {
			if (future.hasOwnProperty('__cancelValue__')) {
				future.resolve(future.__cancelValue__);
			} else {
				future.reject("Canceled!");
			}
		}
		this.__future__ = null;
		try {
			var data = JSON.parse(msg.data);
			if (data.error) {
				future.reject(data.error);
			} else {
				future.resolve(data.result);
			}
		} catch (err) {
			future.reject(err);
		}
	},

	/** The method `__run__` executes the given `code` in the player's webworker. Returns a future
	the will be fulfilled when the code execution ends. The returned future is also stored in the
	player's `__future__` property.
	*/
	__run__: function __run__(code) {
		var future = this.__newFuture__(Match.commandQuit);
		this.worker.postMessage(code);
		return future;
	},

	/** This player's `decision` method is delegated to this player's webworker, returning a future
	that will be resolved when the parallel execution is over.

	Warning! If this method is called while another decision is pending, the player will assume the
	previous match was aborted, issuing a quit command.
	*/
	decision: function decision(game, player) {
		return this.__run__('PLAYER.decision(Sermat.mat('+ JSON.stringify(Sermat.ser(game)) +
			'),'+ JSON.stringify(player) +')');
	},

	/** This player's `evaluatedMoves` method is delegated to this player's webworker.
	*/
	evaluatedMoves: function evaluatedMoves(game, player) {
		return this.__run__('PLAYER.evaluatedMoves(Sermat.mat('+
			JSON.stringify(Sermat.ser(game)) +'),'+ JSON.stringify(player) +')');
	}
}); // declare WebWorkerPlayer
