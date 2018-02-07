/** This is a bundle of common definitions and functions used by playtesters.
*/
define(['ludorum', 'creatartis-base', 'sermat'], function (ludorum, base, Sermat) { /*jshint evil:true */
	var escapeXML = base.Text.escapeXML.bind(base.Text);

	function domElemOrId(elem) {
		return (typeof elem === 'string') ? document.getElementById(elem) : elem;
	}

	var PlayTesterApp = base.declare({
		constructor: function PlayTesterApp(game, ui, elements, webWorkerDependencies) {
			this.game = game;
			this.ui = ui;
			this.elements = base.iterable(elements).mapApply(function (id, elem) {
				return [id, domElemOrId(elem)];
			}).toObject();
			this.players = [];
			this.currentPlayers = [];
			this.webWorkerDependencies = webWorkerDependencies || [];
		},

		player: function addPlayer(title, builder, runOnWorker) {
			this.players.push({title: title, builder: builder, runOnWorker: runOnWorker });
			return this; // for chaining.
		},

		playerUI: function playerUI(title, runOnWorker) {
			this.player(title || "UI", function () {
				return new ludorum.players.UserInterfacePlayer();
			}, !!runOnWorker);
			return this; // for chaining.
		},

		builderRandom: function builderRandom() {
			return function () { 
				return new ludorum.players.RandomPlayer();
			};
		},

		playerRandom: function playerRandom(title, runOnWorker) {
			this.player(title || "Random", this.builderRandom(), !!runOnWorker);
			return this; // for chaining.
		},

		builderMonteCarlo: function builderMonteCarlo(simulationCount, timeCap) {
			timeCap = timeCap || Infinity;
			return new Function('return new ludorum.players.MonteCarloPlayer({simulationCount:'+ simulationCount +','
				+'timeCap:'+ timeCap +'});'
			);
		},

		playerMonteCarlo: function playerMonteCarlo(title, runOnWorker, simulationCount, timeCap) {
			timeCap = timeCap || Infinity;
			title = title || "MonteCarlo ("+ (simulationCount ? simulationCount +"sims" : timeCap +"secs") +")";
			this.player(title, this.builderMonteCarlo(simulationCount, timeCap), !!runOnWorker);
			return this; // for chaining.
		},

		builderUCT: function builderUCT(simulationCount, timeCap) {
			timeCap = timeCap || Infinity;
			return new Function('return new ludorum.players.UCTPlayer({simulationCount:'+ simulationCount +','
				+'timeCap:'+ timeCap +'});'
			);
		},

		playerUCT: function playerUCT(title, runOnWorker, simulationCount, timeCap) {
			timeCap = timeCap || Infinity;
			title = title || "UCT ("+ (simulationCount ? simulationCount +"sims" : timeCap +"secs") +")";
			this.player(title, this.builderUCT(simulationCount, timeCap), !!runOnWorker);
			return this; // for chaining.
		},

		playerAlfaBeta: function playerAlfaBeta(title, runOnWorker, horizon, heuristic) {
			this.player(title || "AlfaBeta (h="+ horizon +")",
				new Function('return new ludorum.players.AlphaBetaPlayer({horizon:'+ horizon +','
					+'heuristic:'+ (heuristic ? heuristic.name : heuristic) +'});'),
				!!runOnWorker);
			return this; // for chaining.
		},

		playerMaxN: function playerMaxN(title, runOnWorker, horizon) {
			this.player(title || "MaxN (h="+ horizon +")",
				new Function('return new ludorum.players.MaxNPlayer({horizon: '+ horizon +'});'),
				!!runOnWorker);
			return this; // for chaining.
		},

		playerParallelHeuristic: function playerParallelHeuristic(title, amount, builder) {
			amount = amount || navigator.hardwareConcurrency || 2;
			title = title || "par ("+ amount +"ww)";
			this.player(title, 
				new Function('return ludorum.players.EnsemblePlayer.parallelizeHeuristicPlayer('
					+ amount +', {playerBuilder: ('+ builder +'),'
					+'dependencies:'+ JSON.stringify(this.webWorkerDependencies) +'});'),
				false);
			return this; // for chaining.
		},

		playerParallelMCTS: function playerParallelMCTS(title, amount, simulationCount, timeCap) {
			title = title || "parMCTS ("+ amount +"ww,"
				+ (simulationCount ? simulationCount +"sims" : timeCap +"secs") +")";
			this.playerParallelHeuristic(title, amount, 
				this.builderMonteCarlo(simulationCount, timeCap));
			return this; // for chaining
		},

		playerParallelUCT: function playerParallelUCT(title, amount, simulationCount, timeCap) {
			title = title || "parUCT ("+ amount +"ww,"
				+ (simulationCount ? simulationCount +"sims" : timeCap +"secs") +")";
			this.playerParallelHeuristic(title, amount, 
				this.builderUCT(simulationCount, timeCap));
			return this; // for chaining
		},

		selects: function selects(selectElems) {
			selectElems = selectElems ? selectElems.map(domElemOrId) : document.getElementsByTagName('select');
			this.elements.selects = selectElems;
			var app = this,
				optionsHTML = base.iterable(this.players).map(function (option, i) {
					return '<option value="'+ i +'">'+ option.title +'</option>';
				}).join('');
			selectElems.forEach(function (select, i) {
				select.innerHTML = optionsHTML;
				select.onchange = function  () {
					app.selectPlayer(i, +this.value, true);
				};
			});
			var defaultBuilder = app.players[0].builder;
			this.currentPlayers = selectElems.map(function () {
				return defaultBuilder();
			});
			return this; // for chaining.
		},

		selectPlayer: function selectPlayer(playerNum, agentNum, resetMatch) {
			var app = this,
				option = this.players[agentNum];
			return (option.runOnWorker ?
				ludorum.players.WebWorkerPlayer.create({
					playerBuilder: option.builder,
					dependencies: app.webWorkerDependencies
				}) :
				base.Future.when(option.builder())
			).then(function (player) {
				app.currentPlayers[playerNum] = player;
				if (resetMatch) {
					app.reset();
				}
				return player;
			});
		},

		setPlayer: function setPlayer(playerNum, agentNum, resetMatch) {
			this.elements.selects[playerNum].value = agentNum;
			return this.selectPlayer(playerNum, agentNum, resetMatch);
		},

		setPlayers: function selectPlayer(playerNums, agentNum, resetMatch) {
			playerNums = playerNums || base.Iterable.range(this.players.length).toArray();
			var app = this,
				r = base.Future.all(playerNums.map(function (playerNum) {
					return app.setPlayer(playerNum, agentNum, false);
				}));
			if (resetMatch) {
				return r.then(function () {
					app.reset();
				});
			} else {
				return r;
			}
		},

		button: function button(name, elem, onclick) {
			this.elements[name] = elem;
			elem.onclick = onclick;
			return this;
		},

		reset: function reset() {
			var match = new ludorum.Match(this.game.clone(), this.currentPlayers);
			this.currentMatch = match;
			this.ui.show(match);
			var bar = this.elements.bar;
			if (bar) {
				match.events.on('begin', function (game) {
					var msg = game.isContingent ? "Resolving contingency." : //FIXME Better message
						"Turn "+ game.activePlayer() +".";
					bar.innerHTML = escapeXML("Turn "+ game.activePlayer() +".");
				});
				match.events.on('next', function (game, next) {
					var msg = next.isContingent ? "Resolving contingency." : //FIXME Better message
						"Turn "+ next.activePlayer() +".";
					bar.innerHTML = escapeXML(msg);
				});
				match.events.on('end', function (game, results) {
					var winner = game.players.filter(function (p) {
						return results[p] > 0;
					});
					bar.innerHTML = escapeXML(winner.length < 1 ? 'Drawed game.' : winner[0] +' wins.');
				});
			}
			match.run();
			return this; // for chaining.
		}
	});

	return PlayTesterApp;
}); // define
