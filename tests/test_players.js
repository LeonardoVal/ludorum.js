/** ludorum/tests/test_players.js:
	Test cases for the player implementations in the Ludorum framework.
	
	@author <a href="mailto:leonardo.val@creatartis.com">Leonardo Val</a>
	@licence MIT Licence
*/
define(['basis', 'ludorum'], function (basis, ludorum) {
	var verifier = new basis.Verifier(),
		games = ludorum.games,
		players = ludorum.players,
		RANDOM = basis.Randomness.DEFAULT;

	var autonomousPlayers = [players.RandomPlayer, players.HeuristicPlayer, 
		players.MiniMaxPlayer, players.MonteCarloPlayer];
	
	autonomousPlayers.forEach(function (player) { //////////////////////////////
		verifier.test("games.__Predefined__() with players."+ player.name +"()", function () { 
			return basis.Future.all(basis.Iterable.range(30).map(function (i) {
				var resultA = (i % 3) - 1,
					resultB = -resultA,
					game = new games.__Predefined__(i % 2 ? 'A' : 'B', {
						A: resultA, B: resultB
					}, 10, 6),
					match = new ludorum.Match(game, [new player(), new player()]);
				return match.run().then(function (match) {
					var results = match.result();
					verifier.assert(results, "Finished match has no results.");
					verifier.assertEqual(resultA, results.A);
					verifier.assertEqual(resultB, results.B);
					verifier.assertEqual(10, match.ply());
				});
			})).then(function () {
				return 'Ran 30 matches.'; // For the log.
			});
		}); 
	}); // games.__Predefined__() with autonomousPlayers
	
	autonomousPlayers.forEach(function (player) { //////////////////////////////
		var game = new games.Choose2Win(),
			passer = new players.TracePlayer('', ['pass']);
		verifier.test("games.Choose2Win() with players."+ player.name +"()", function () {
			return basis.Future.all(basis.Iterable.range(30).map(function (i) {
				var match = new ludorum.Match(game, [new player(), new player()]);
				return match.run().then(function (match) {
					var results = match.result();
					verifier.assert(results, "Finished match has no results.");
					verifier.assertEqual(0, results[game.players[0]] + results[game.players[1]]);
				});
			})).then(function () {
				return basis.Future.all(basis.Iterable.range(30).map(function (i) {
					var match = new ludorum.Match(game, i % 2 ? [passer, new player()] : [new player(), passer]),
						role = game.players[i % 2];
					return match.run().then(function (match) {
						var results = match.result();
						verifier.assert(results, "Finished match has no results.");
						verifier.assertSame(role, match.state(-1).activePlayer(), player.name +" should have ended the game.");
						if (player !== players.RandomPlayer) {
							// RandomPlayer does not try to win. The others must.
							verifier.assert(results[role] > 0, player.name +" should have won the game.");
						}
					});
				}));
			}).then(function () {
				return "Ran 60 matches.";
			});
		});
	}); // games.Choose2Win() with autonomousPlayers
	
	[players.RandomPlayer].forEach(function (player) {
		var game = new games.Pig();
		verifier.test("games.Pig() with players."+ player.name +"()", function () {
			return basis.Future.all(basis.Iterable.range(30).map(function (i) {
				var match = new ludorum.Match(game, [new player(), new player()]);
				return match.run().then(function (match) {
					var results = match.result();
					verifier.assert(results, "Finished match has no results.");
					verifier.assertEqual(0, results[game.players[0]] + results[game.players[1]]);
				});
			})).then(function () {
				return "Ran 30 matches.";
			});
		});
	}); // games.Pig() with RandomPlayer.
	
/////////////////////////////////////////////////////////////////////////// Fin.
	return verifier;
});