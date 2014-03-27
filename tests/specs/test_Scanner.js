/** Test cases for the Scanner component in the Ludorum framework.
*/
define(['basis', 'ludorum'], function (basis, ludorum) {
	var verifier = new basis.Verifier(),
		games = ludorum.games,
		players = ludorum.players;
	
	verifier.test("Scanner with games.__Predefined__()", function () { /////////
		var scanner = new ludorum.utils.Scanner({ 
			game: new ludorum.games.__Predefined__('A', {A: 1, B:-1}, 6, 5),
			maxWidth: 100,
			maxLength: 10
		});
		return scanner.scan().then(function (stats) {
			verifier.assertEqual(0, stats.average({key:'game.result'}));
			verifier.assertEqual(1, stats.average({key:'game.result', role:'A'}));
			verifier.assertEqual(stats.count({key:'victory.result'}),
				stats.count({key:'victory.result', role:'A'}));
			verifier.assertEqual(-1, stats.average({key:'game.result', role:'B'}));
			verifier.assertEqual(stats.count({key:'defeat.result'}),
				stats.count({key:'defeat.result', role:'B'}));
			verifier.assertEqual(0, stats.count({key:'draw.length'}));
			verifier.assertEqual(5, stats.average({key:'game.width'}));
			verifier.assertEqual(6, stats.average({key:'game.length'}));
			verifier.assertEqual(0, stats.average({key:'aborted'}));
		});
	}); // Scanner with games.__Predefined__()
	
	verifier.test("Scanner with games.Choose2Win()", function () { /////////////
		var scanner = new ludorum.utils.Scanner({ 
			game: new ludorum.games.Choose2Win(),
			maxWidth: 100,
			maxLength: 10
		});
		return scanner.scan().then(function (stats) {
			verifier.assertEqual(0, stats.average({key:'game.result'}));
			verifier.assertEqual(0, stats.average({key:'game.result', role:'This'}));
			verifier.assertEqual(1, stats.maximum({key:'game.result', role:'This'}));
			verifier.assertEqual(-1, stats.minimum({key:'game.result', role:'This'}));
			verifier.assertEqual(0, stats.average({key:'game.result', role:'That'}));
			verifier.assertEqual(1, stats.maximum({key:'game.result', role:'That'}));
			verifier.assertEqual(-1, stats.minimum({key:'game.result', role:'That'}));
			verifier.assertEqual(0, stats.count({key:'draw.length'}));
			verifier.assertEqual(3, stats.average({key:'game.width'}));
			verifier.assertEqual(3, stats.average({key:'aborted'}));
		});
	}); // Scanner with games.Choose2Win()
	
/////////////////////////////////////////////////////////////////////////// Fin.
	return verifier;
});