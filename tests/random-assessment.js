var base = require('creatartis-base'),
	Sermat = require('sermat'),
	capataz = require('capataz'),
	ludorum = require('../build/ludorum');

// Synonyms
var Iterable = base.Iterable,
	iterable = base.iterable,
	Future = base.Future,
	RandomPlayer = ludorum.players.RandomPlayer
;
Sermat.modifiers.mode = Sermat.CIRCULAR_MODE;

(function main() { /////////////////////////////////////////////////////////////////////////////////
	var server = capataz.Capataz.run({
			port: 8088,
			maxScheduled: 21000,
			desiredEvaluationTime: 5000,
			logFile: base.Text.formatDate(null, '"./tests/random-assessment-"yyyymmdd-hhnnss".log"')
		}),
		logger = server.logger;
	server.__serveNodeModule__(Sermat);
	server.__serveNodeModule__(ludorum);

	function randomPlays(game, player, n) {
		var randomPlayers = game.players.map(function (p, i) {
				return new RandomPlayer({ name: 'RAN#'+ (i + 1) });
			});
		return Iterable.range(n).product(game.players).mapApply(function (i, role) {
			var players = randomPlayers.slice();
			players[game.players.indexOf(role)] = player;
			return {
				info: game.name +'('+ players.map(function (p) {
						return p.name;
					}).join(',') +')',
				imports: ['sermat', 'ludorum'],
				args: [Sermat.ser(game), Sermat.ser(players), role],
				fun: 'function (Sermat, ludorum, game, players, role) {\n\t'+
					'var m = new ludorum.Match(Sermat.mat(game), Sermat.mat(players));\n\t'+
					'return m.run().then(function () { return [role, m.result()[role]]; });\n'+
				'}'
			};
		});
	}

	function assess(game, player, n, levels) {
		var count = n * levels[levels.length - 1],
			plays = randomPlays(game, player, count),
			results = iterable(game.players).map(function (role) {
				return [role, ''];
			}).toObject();
		return server.scheduleAll(plays, server.maxScheduled, function (scheduled) {
			return scheduled.then(function (p) {
				results[p[0]] += p[1] > 0 ? '2' : p[1] < 0 ? '0' : '1';
			});
		}).then(function () {
			var resultsZeroes = iterable(game.players).map(function (role) {
					return [role, [0, 0, 0]];
				}).toObject(),
				levelResults = levels.map(function (level) {
					return { level: level, results: Sermat.clone(resultsZeroes) };
				});
			levelResults.forEach(function (levelResult) {
				for (var role in resultsZeroes) {
					iterable(results[role])
						.take(levelResult.level * n)
						.map((c, i) => [c, i])
						.groupBy((p) => Math.floor(p[1] / levelResult.level))
						.forEachApply(function (g, rs) {
							var r = iterable(rs).select(0).min();
							levelResult.results[role][+r]++;
						});
				}
			});
			return levelResults;
		});
	}

	var game = new ludorum.games.TicTacToe();
	return Future.sequence([1, 2, 4, 6, 8], function (horizon) {
		var player = new ludorum.players.MiniMaxPlayer({
				name: 'MM'+ horizon,
				horizon: horizon
			}),
			levels = Iterable.range(1, 51).toArray();
		return assess(game, player, 1000, levels).then(function (levelResults) {
			levelResults.forEach((levelResult) => {
				server.logger.info('player:'+ player.name +'\tlevel:'+ levelResult.level +
					'\tresults:'+ JSON.stringify(levelResult.results)
				);
			});
			
		});
	}).then(function () {
		server.logger.info("Finished. Stopping server.");
		server.logger.info("Server statistics:\n"+ server.statistics);
		setTimeout(process.exit, 10);
	});
})();