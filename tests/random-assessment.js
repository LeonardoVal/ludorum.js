var base = require('creatartis-base'),
	ludorum = require('../build/ludorum');

// Synonyms
var Iterable = base.Iterable,
	iterable = base.iterable,
	Future = base.Future,
	Match = ludorum.Match,
	RandomPlayer = ludorum.players.RandomPlayer
;

function randomPlays(game, n, player) {
	var randomPlayers = game.players.map(function () {
			return new RandomPlayer();
		}),
		matches = Iterable.range(n).product(game.players).mapApply(function (i, role) {
			var players = randomPlayers.slice();
			players[role] = player;
			var match = new Match(game, players);
			return match.run().then(function () {
				var result = match.result();
				return [role, result[role]];
			});
		}),
		results = iterable(game.players).map(function (role) {
			return [role, Infinity];
		}).toObject();
	return Future.sequence(matches, function (r) {
		results[r[0]] = Math.min(results[r[0]], r[1]);
		return results;
	});
}

function assess(game, n, player) {
	var results = iterable(game.players).map(function (role) {
			return [role, [0, 0]];
		}).toObject();
	return Future.sequence(Iterable.range(10), function () {
		return randomPlays(game, n, player).then(function (rs) {
			for (var role in results) {
				results[role][rs[role] > 0 ? 0 : 1]++;
			}
			return results;
		});
	});
}

assess(new ludorum.games.TicTacToe(), 2,
	new ludorum.players.AlphaBetaPlayer({ horizon: 4 })
).then(console.log);