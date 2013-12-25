/** ludorum/tests/test_tournaments.js:
	Test cases for the tournament implementations in the Ludorum framework.
	
	@author <a href="mailto:leonardo.val@creatartis.com">Leonardo Val</a>
	@licence MIT Licence
*/
define(['basis', 'ludorum'], function (basis, ludorum) {
	var verifier = new basis.Verifier(),
		games = ludorum.games,
		players = ludorum.players,
		tournaments = ludorum.tournaments;

	verifier.test("tournaments.RoundRobin() with games.Choose2Win() & players.RandomPlayer()", function () { /////////////////
		var game = new games.Choose2Win(),
			participants = [new players.RandomPlayer('RandomPlayer#1'), new players.RandomPlayer('RandomPlayer#2')],
			contest = new tournaments.RoundRobin(game, participants, 2),
			matchCount = 0;
		contest.events.on('beforeMatch', function (match) {
			verifier.assertSame(game, match.state());
			matchCount++;
		});
		return contest.run().then(function () {
			var stats = contest.statistics;
			verifier.assertEqual(4, matchCount);
			verifier.assertEqual(4, stats.count(['player:RandomPlayer#1', 'results']));
			verifier.assertEqual(2, stats.count(['player:RandomPlayer#1', 'role:This', 'results']));
			verifier.assertEqual(2, stats.count(['player:RandomPlayer#1', 'role:That', 'results']));
			verifier.assertEqual(4, stats.count(['player:RandomPlayer#2', 'results']));
			verifier.assertEqual(2, stats.count(['player:RandomPlayer#2', 'role:This', 'results']));
			verifier.assertEqual(2, stats.count(['player:RandomPlayer#2', 'role:That', 'results']));
			verifier.assertEqual(0, stats.sum(['results'])); // Choose2Win is a zero-sum game.
			return 'Tournament played '+ stats.count(['results']) / 2 +' matches.';
		});
	}); // tournaments.RoundRobin()
	
	verifier.test("tournaments.Measurement() with games.Choose2Win() & players.RandomPlayer()", function () { /////////////////
		var game = new games.Choose2Win(),
			participants = [new players.RandomPlayer('RandomPlayer#1'), new players.RandomPlayer('RandomPlayer#2')],
			contest = new tournaments.Measurement(game, 
				[new players.RandomPlayer('RandomPlayer#1')],
				[new players.RandomPlayer('RandomPlayer#2'), new players.RandomPlayer('RandomPlayer#3')], 2),
			matchCount = 0;
		contest.events.on('beforeMatch', function (match) {
			verifier.assertSame(game, match.state());
			matchCount++;
		});
		return contest.run().then(function () {
			var stats = contest.statistics;
			verifier.assertEqual(8, matchCount);
			verifier.assertEqual(8, stats.count(['player:RandomPlayer#1', 'results']));
			verifier.assertEqual(4, stats.count(['player:RandomPlayer#1', 'role:This', 'results']));
			verifier.assertEqual(4, stats.count(['player:RandomPlayer#1', 'role:That', 'results']));
			verifier.assertEqual(4, stats.count(['player:RandomPlayer#2', 'results']));
			verifier.assertEqual(2, stats.count(['player:RandomPlayer#2', 'role:This', 'results']));
			verifier.assertEqual(2, stats.count(['player:RandomPlayer#2', 'role:That', 'results']));
			verifier.assertEqual(4, stats.count(['player:RandomPlayer#3', 'results']));
			verifier.assertEqual(2, stats.count(['player:RandomPlayer#3', 'role:This', 'results']));
			verifier.assertEqual(2, stats.count(['player:RandomPlayer#3', 'role:That', 'results']));
			verifier.assertEqual(0, stats.sum(['results'])); // Choose2Win is a zero-sum game.
			return 'Tournament played '+ stats.count(['results']) / 2 +' matches.';
		});
	}); // tournaments.Measurement()
	
/////////////////////////////////////////////////////////////////////////// Fin.
	return verifier;
});