var base = require('creatartis-base'),
	Sermat = require('sermat'),
	ludorum = require('../build/ludorum');

// Synonyms
var Iterable = base.Iterable,
	iterable = base.iterable,
	Future = base.Future,
	Match = ludorum.Match,
	RandomPlayer = ludorum.players.RandomPlayer
;
Sermat.modifiers.mode = Sermat.CIRCULAR_MODE;

function randomPlays(game, level, player) {
	var randomPlayers = game.players.map(function (p, i) {
			return new RandomPlayer({ name: 'RAN#'+ (i + 1) });
		}),
		matches = Iterable.range(level).product(game.players).mapApply(function (i, role) {
			var players = randomPlayers.slice();
			players[game.players.indexOf(role)] = player;
			var match = new Match(game, players);
			return match.run().then(function () {
				var result = match.result();
				//console.log("---", role, result, players.map((p)=> p.constructor.name));//FIXME
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

function assess(n, game, level, player) {
	var results = iterable(game.players).map(function (role) {
			return [role, [0, 0, 0]];
		}).toObject();
	return Future.sequence(Iterable.range(n), function () {
		return randomPlays(game, level, player).then(function (rs) {
			for (var role in results) {
				results[role][Math.sign(rs[role]) + 1]++;
			}
			return results;
		});
	});
}

(function main() { /////////////////////////////////////////////////////////////////////////////////
	var game = new ludorum.games.TicTacToe();
	return Future.sequence([0, 2, 4, 6, 8, 10], function (horizon) {
		var player = new ludorum.players.MiniMaxPlayer({
				name: 'MM'+ horizon,
				horizon: horizon
			});
		return Future.sequence(Iterable.range(1, 11), function (level) {
			return assess(100, game, level, player).then(function (assessment) {
				console.log("level:"+ level +"\t"+ Sermat.ser(player) +"\t"+ Sermat.ser(assessment));
			});
		});
	});
})();