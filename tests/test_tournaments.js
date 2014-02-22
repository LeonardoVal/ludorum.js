/** Test cases for the tournament implementations in the Ludorum framework.
*/
define(['basis', 'ludorum'], function (basis, ludorum) {
	var verifier = new basis.Verifier(),
		games = ludorum.games,
		players = ludorum.players,
		tournaments = ludorum.tournaments;

	verifier.test("tournaments.RoundRobin() with games.Choose2Win() & players.RandomPlayer()", function () {
		var game = new games.Choose2Win(),
			participants = [
				new players.RandomPlayer({name: 'RandomPlayer#1'}), 
				new players.RandomPlayer({name: 'RandomPlayer#2'})
			],
			contest = new tournaments.RoundRobin(game, participants, 2),
			matchCount = 0;
		contest.events.on('beforeMatch', function (match) {
			verifier.assertSame(game, match.state());
			matchCount++;
		});
		return contest.run().then(function () {
			var stats = contest.statistics;
			verifier.assertEqual(4, matchCount);
			verifier.assertEqual(4, stats.count({key:'results', player:'RandomPlayer#1'}));
			verifier.assertEqual(2, stats.count({key:'results', player:'RandomPlayer#1', role:'This'}));
			verifier.assertEqual(2, stats.count({key:'results', player:'RandomPlayer#1', role:'That'}));
			verifier.assertEqual(4, stats.count({key:'results', player:'RandomPlayer#2'}));
			verifier.assertEqual(2, stats.count({key:'results', player:'RandomPlayer#2', role:'This'}));
			verifier.assertEqual(2, stats.count({key:'results', player:'RandomPlayer#2', role:'That'}));
			verifier.assertEqual(0, stats.sum({key:'results'})); // Choose2Win is a zero-sum game.
			return 'Tournament played '+ stats.count({key:'results'}) / 2 +' matches.';
		});
	}); // tournaments.RoundRobin()
	
	verifier.test("tournaments.Measurement() with games.Choose2Win() & players.RandomPlayer()", function () {
		var game = new games.Choose2Win(),
			participants = [new players.RandomPlayer('RandomPlayer#1'), new players.RandomPlayer('RandomPlayer#2')],
			contest = new tournaments.Measurement(game, 
				[new players.RandomPlayer({name: 'RandomPlayer#1'})],
				[new players.RandomPlayer({name: 'RandomPlayer#2'}), 
					new players.RandomPlayer({name: 'RandomPlayer#3'})], 2),
			matchCount = 0;
		contest.events.on('beforeMatch', function (match) {
			verifier.assertSame(game, match.state());
			matchCount++;
		});
		return contest.run().then(function () {
			var stats = contest.statistics;
			verifier.assertEqual(8, matchCount);
			verifier.assertEqual(8, stats.count({key:'results', player:'RandomPlayer#1'}));
			verifier.assertEqual(4, stats.count({key:'results', player:'RandomPlayer#1', role:'This'}));
			verifier.assertEqual(4, stats.count({key:'results', player:'RandomPlayer#1', role:'That'}));
			verifier.assertEqual(4, stats.count({key:'results', player:'RandomPlayer#2'}));
			verifier.assertEqual(2, stats.count({key:'results', player:'RandomPlayer#2', role:'This'}));
			verifier.assertEqual(2, stats.count({key:'results', player:'RandomPlayer#2', role:'That'}));
			verifier.assertEqual(4, stats.count({key:'results', player:'RandomPlayer#3'}));
			verifier.assertEqual(2, stats.count({key:'results', player:'RandomPlayer#3', role:'This'}));
			verifier.assertEqual(2, stats.count({key:'results', player:'RandomPlayer#3', role:'That'}));
			verifier.assertEqual(0, stats.sum({key:'results'}));
			return 'Tournament played '+ stats.count({key:'results'}) / 2 +' matches.';
		});
	}); // tournaments.Measurement()
	
/////////////////////////////////////////////////////////////////////////// Fin.
	return verifier;
});