/** tests/ludorum.js:
	Test cases for the module <ludorum.js>.
	
	@author <a href="mailto:leonardo.val@creatartis.com">Leonardo Val</a>
	@licence MIT Licence
*/
define(['basis', 'ludorum'], function (basis, ludorum) {
	var verifier = new basis.Verifier(),
		games = ludorum.games,
		players = ludorum.players,
		RANDOM = basis.Randomness.DEFAULT;

	function checkGame(game, options) {
		options = options || {};
		verifier.assert(Array.isArray(game.players), "Invalid or missing property <players> in ", game, ".");
		for (var i = 0; i < 1000; i++) {
			verifier.assertInstanceOf(ludorum.Game, game);
			var result = game.result(),
				moves = game.moves();
			if (result) { // Game is finished.
				verifier.assertFalse(moves, "Finished game ", game, " has moves ", JSON.stringify(moves));
				var sum = 0;
				game.players.forEach(function (player) {
					verifier.assertSame('number', typeof result[player], "Invalid or missing result for ", player, ": ", JSON.stringify(result), ".");
					sum += result[player];
				});
				options.zeroSum && verifier.assertEqual(0, sum, "Game's results add up to ", sum, " instead of zero: ", JSON.stringify(result), ".");
				return result;
			} else { // Game is not finished.
				verifier.assert(moves, "Unfinished game ", game, " has no moves.");
				verifier.assert(Array.isArray(game.activePlayers), "Invalid or missing activePlayers property.");
				options.oneActivePlayerPerTurn && verifier.assertEqual(1, game.activePlayers.length);
				if (game.activePlayers.length === 1) {
					verifier.assertSame(game.activePlayers[0], game.activePlayer());
				} else {
					verifier.assertFails(game.activePlayer.bind(game));
				}
				var decisions = {};
				game.activePlayers.forEach(function (activePlayer) {
					verifier.assert(game.isActive(activePlayer), "isActivePlayer() returned false for active player '", activePlayer, "'.");
					verifier.assert(moves.hasOwnProperty(activePlayer), "Player '", activePlayer, "' has no moves: ", JSON.stringify(moves), ".");
					verifier.assert(Array.isArray(moves[activePlayer]), "Moves for ", activePlayer, " are not in an array: ", JSON.stringify(moves), ".");
					verifier.assert(moves[activePlayer].length > 0, "Empty moves arrays for ", activePlayer, ": ", JSON.stringify(moves), ".");
					decisions[activePlayer] = RANDOM.choice(moves[activePlayer]);
				});
				game = game.next(decisions);
			}
		}
		verifier.fail("Game did not finish after 1000 plies.");
	}
		
	verifier.test("games.__Predefined__()", function () { //////////////////////
		var game, moves, results, resultA, resultB;
		for (var h = 0; h < 15; h++) {
			for (var w = 1; w < 10; w++) {
				resultA = (h % 3) - 1;
				resultB = -resultA;
				game = new games.__Predefined__('A', {'A': resultA, 'B': resultB}, h, w);
				this.assertEqual('A B', game.players.join(' '));
				for (var i = 0; i < h; i++) {
					moves = game.moves();
					this.assert(moves, "Unfinished game has no moves: "+ game);
					this.assertFalse(game.result(), "Unfinished game has results: "+ game);
					moves = moves[game.activePlayer()]
					this.assert(moves, "Active player has no moves: "+ game);
					this.assertEqual(w, moves.length);
					game = game.next(basis.obj(game.activePlayer(), moves[i % w]))
				}
				this.assertFalse(game.moves(), "Finished game has moves: "+ game);
				results = game.result();
				this.assert(results, "Finished game has no result: "+ game);
				this.assertEqual(resultA, results.A);
				this.assertEqual(resultB, results.B);
			}
		}
	}); // games.__Predefined__()

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
	
	verifier.test("games.Choose2Win()", function () { //////////////////////////
		var game = new games.Choose2Win();
		checkGame(game, { zeroSum: true, oneActivePlayerPerTurn: true });
		verifier.assertEqual('This', game.activePlayer());
		var moves = game.moves().This, results;
		
		verifier.assert(moves.indexOf('win') >= 0, "Player 'This' doesn't have the 'win' move.");
		results = game.next({ This: 'win' }).result();
		verifier.assert(results.This > 0, "Player 'This' should have won in "+ game +" but results are: "+ JSON.stringify(results));
		verifier.assert(moves.indexOf('lose') >= 0, "Player 'This' doesn't have the 'lose' move.");
		results = game.next({ This: 'lose' }).result();
		verifier.assert(results.This < 0, "Player 'This' should have lost in "+ game +" but results are: "+ JSON.stringify(results));
		
		verifier.assert(moves.indexOf('pass') >= 0, "Player 'This' doesn't have the 'pass' move.");
		verifier.assertFalse(game.result(), "Passed turn should not have finished the game.");
	}); // games.Choose2Win()
	
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
	
	verifier.test("games.TicTacToe()", function () { ///////////////////////////
		checkGame(new games.TicTacToe(), { zeroSum: true, oneActivePlayerPerTurn: true });
	}); // games.TicTacToe()
	
	verifier.test("games.ToadsAndFrogs()", function () { ///////////////////////
		checkGame(new games.ToadsAndFrogs(), { zeroSum: true, oneActivePlayerPerTurn: true });
	}); // games.ToadsAndFrogs()
	
	verifier.test("games.Mancala()", function () { /////////////////////////////
		checkGame(new games.Mancala(), { zeroSum: true, oneActivePlayerPerTurn: true });
	}); // games.Mancala()
	
	verifier.test("games.OddsAndEvens()", function () { ////////////////////////
		checkGame(new games.OddsAndEvens(), { zeroSum: true });
	}); // games.OddsAndEvens()
	
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