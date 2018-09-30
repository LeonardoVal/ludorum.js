var base = require('creatartis-base'),
	Sermat = require('sermat'),
	capataz = require('capataz'),
	ludorum = require('../build/ludorum');

// Synonyms
var Iterable = base.Iterable,
	iterable = base.iterable,
	Future = base.Future,
	Match = ludorum.Match,
	RandomPlayer = ludorum.players.RandomPlayer
;
Sermat.modifiers.mode = Sermat.CIRCULAR_MODE;

function localRunMatch(game, players) {
	var match = new Match(game, players);
	return match.run().then(function () {
		return match.result();
	});
}

function randomPlays(game, level, player, runMatch) {
	runMatch = runMatch || localRunMatch;
	var randomPlayers = game.players.map(function (p, i) {
			return new RandomPlayer({ name: 'RAN#'+ (i + 1) });
		}),
		matches = Iterable.range(level).product(game.players).mapApply(function (i, role) {
			var players = randomPlayers.slice();
			players[game.players.indexOf(role)] = player;
			return runMatch(game, players).then(function (result) {
				return [role, result[role]];
			});
		});
	return Future.all(matches).then(function (rs) {
		var results = iterable(game.players).map(function (role) {
				return [role, Infinity];
			}).toObject();
		iterable(rs).forEachApply(function (role, r) {
			results[role] = Math.min(results[role], r);
		});
		return results;
	});
}

function assess(n, game, level, player, runMatch) {
	var results = iterable(game.players).map(function (role) {
			return [role, [0, 0, 0]];
		}).toObject();
	return Future.sequence(Iterable.range(n), function () {
		return randomPlays(game, level, player, runMatch).then(function (rs) {
			for (var role in results) {
				results[role][Math.sign(rs[role]) + 1]++;
			}
			return results;
		});
	});
}

(function main() { /////////////////////////////////////////////////////////////////////////////////
	var server = capataz.Capataz.run({
			port: 8088,
			workerCount: 2,
			desiredEvaluationTime: 10000,
			logFile: base.Text.formatDate(null, '"./tests/random-assessment-"yyyymmdd-hhnnss".log"')
		}),
		logger = server.logger;
	server.__serveNodeModule__(Sermat);
	server.__serveNodeModule__(ludorum);

	function distributedRunMatch(game, players) {
		return server.schedule({
			info: game.name +'('+ players.map(function (p) {
					return p.name;
				}).join(',') +')',
			imports: ['sermat', 'ludorum'],
			args: [Sermat.ser(game), Sermat.ser(players)],
			fun: 'function (Sermat, ludorum, game, players) {\n\t'+
				'var m = new ludorum.Match(Sermat.mat(game), Sermat.mat(players));\n\t'+
				'return m.run().then(function () { return m.result(); });\n'+
			'}'
		});
	}

	var game = new ludorum.games.TicTacToe();
	return Future.sequence([1, 2, 4, 6, 8, 10], function (horizon) {
		var player = new ludorum.players.MiniMaxPlayer({
				name: 'MM'+ horizon,
				horizon: horizon
			});
		return Future.sequence(Iterable.range(1, 11), function (level) {
			return assess(1000, game, level, player, distributedRunMatch).then(function (assessment) {
				logger.info("level:"+ level +"\t"+ player.name +"\t"+ JSON.stringify(assessment));
			});
		});
	});
})();