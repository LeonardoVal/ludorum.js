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
		var resultsZeroes = iterable(game.players).map(function (role) {
				return [role, [0, 0, 0]];
			}).toObject(),
			levelResults = levels.map(function (level) {
				return { 
					level: level, 
					results: Sermat.clone(resultsZeroes),
					__min__: Infinity,
					__playCount__: 0
				};
			}),
			count = n * levels[levels.length - 1],
			i = 0;
		return server.scheduleAll(randomPlays(game, player, count), server.maxScheduled,
			function (scheduled) {
				return scheduled.then(function (p) {
					var role = p[0],
						result = p[1];
					levelResults.forEach(function (levelResult) {
						var rs = levelResult.results[role],
							matchCount = rs[0] + rs[1] + rs[2];
						if (matchCount < n) { 
							levelResult.__min__ = Math.min(levelResult.__min__, result);
							levelResult.__playCount__++;
							if (levelResult.__playCount__ >= levelResult.level) {
								levelResult.results[role][Math.sign(levelResult.__min__) + 1]++;
								levelResult.__min__ = Infinity;
								levelResult.__playCount__ = 0;
							}
						}
					});
				});
			}
		).then(function () {
			return levelResults;
		});
	}

	var game = new ludorum.games.TicTacToe();
	return Future.sequence([1, 2, 4, 6, 8, 10], function (horizon) {
		var player = new ludorum.players.MiniMaxPlayer({
				name: 'MM'+ horizon,
				horizon: horizon
			});
		return assess(game, player, 100, [1,2,3,4,5,6,7,8,9,10]).then(function (levelResults) {
			server.logger.info(player.name +'\t'+ levelResults.map(JSON.stringify).join('\n'));
		});
	}).then(function () {
		server.logger.info("Finished. Stopping server.");
		server.logger.info("Server statistics:\n"+ server.statistics);
		setTimeout(process.exit, 10);
	});
})();