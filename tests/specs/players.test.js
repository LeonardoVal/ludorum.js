define(['basis', 'ludorum'], function (basis, ludorum) {
	var RANDOM = basis.Randomness.DEFAULT,
		autonomousPlayers = ["RandomPlayer", "HeuristicPlayer", "MiniMaxPlayer", 
			"AlphaBetaPlayer", "MaxNPlayer", "MonteCarloPlayer"];
		
	describe('Module players', function () {
		it('must exist', function () {
			expect(ludorum.players).toBeDefined();
		});
		autonomousPlayers.forEach(function (playerName) {
			it('must have player '+ playerName, function () {
				var Player = ludorum.players[playerName];
				expect(Player).toBeOfType('function');
				expect(new Player()).toBeOfType(ludorum.Player);
			});
		});
	})

	describe("games.__Predefined__", function () { /////////////////////
		var MATCH_COUNT = 10,
			MATCH_LENGTH = 5,
			MATCH_WIDTH = 6;
		autonomousPlayers.forEach(function (playerName) {
			async_it('can be played by '+ playerName, function () {
				var Player = ludorum.players[playerName],
					done = false;
				return basis.Future.all(basis.Iterable.range(MATCH_COUNT).map(function (i) {
					var resultA = (i % 3) - 1,
						resultB = -resultA,
						game = new ludorum.games.__Predefined__(i % 2 ? 'A' : 'B', {
							A: resultA, B: resultB
						}, MATCH_LENGTH, MATCH_WIDTH),
						match = new ludorum.Match(game, [new Player(), new Player()]);
					return match.run().then(function (match) {
						var result = match.result();
						expect(result).toBeTruthy();
						expect(result.A).toEqual(resultA);
						expect(result.B).toEqual(resultB);
						expect(match.ply()).toEqual(MATCH_LENGTH);
					});
				}));
			});
		}); 
	}); //// games.__Predefined__ can be played by autonomousPlayers.
	
	describe("games.Choose2Win", function () { /////////////////////////
		var MATCH_COUNT = 10,
			game = new ludorum.games.Choose2Win(),
			passer = new ludorum.players.TracePlayer({trace: ['pass']});
		autonomousPlayers.forEach(function (playerName) {
			var Player = ludorum.players[playerName];
			async_it('can be played by '+ playerName, function () {
				return basis.Future.all(basis.Iterable.range(MATCH_COUNT).map(function (i) {
					var match = new ludorum.Match(game, [new Player(), new Player()]);
					return match.run().then(function (match) {
						var result = match.result();
						expect(result).toBeTruthy();
						expect(result[game.players[0]] + result[game.players[1]]).toBe(0);
					});
				}));
			});
			if (Player !== ludorum.players.RandomPlayer) { // RandomPlayer does not try to win. The others must.
				async_it('can be won by '+ playerName, function () {
					return basis.Future.all(basis.Iterable.range(MATCH_COUNT).map(function (i) {
						var match = new ludorum.Match(game, i % 2 ? [passer, new Player()] : [new Player(), passer]),
							role = game.players[i % 2];
						return match.run().then(function (match) {
							var result = match.result();
							expect(result).toBeTruthy();
							expect(match.state(-1).activePlayer()).toBe(role);
							expect(result[role]).toBeGreaterThan(0);
						});
					}));
				});
			}
		});
	}); //// games.Choose2Win can be played/won by autonomous players.
	
	describe("games.Pig", function () { ////////////////////////////////
		["RandomPlayer", "MonteCarloPlayer"].forEach(function (playerName) {
			var MATCH_COUNT = 10,
				game = new ludorum.games.Pig('One', 15),
				Player = ludorum.players[playerName];
			async_it("can be played by "+ playerName, function () {
				return basis.Future.all(basis.Iterable.range(MATCH_COUNT).map(function (i) {
					var match = new ludorum.Match(game, [new Player(), new Player()]);
					return match.run().then(function (match) {
						var result = match.result();
						expect(result).toBeTruthy();
						expect(result[game.players[0]] + result[game.players[1]]).toEqual(0);
					});
				}));
			});
		});
	}); //// games.Pig can be can be played/won by some autonomous players.
	
	describe("games.OddsAndEvens", function () { ////////////////////////////////
		["RandomPlayer", "MonteCarloPlayer"].forEach(function (playerName) {
			var MATCH_COUNT = 10,
				game = new ludorum.games.OddsAndEvens(),
				Player = ludorum.players[playerName];
			async_it("can be played by "+ playerName, function () {
				return basis.Future.all(basis.Iterable.range(MATCH_COUNT).map(function (i) {
					var match = new ludorum.Match(game, [new Player(), new Player()]);
					return match.run().then(function (match) {
						var result = match.result();
						expect(result).toBeTruthy();
						expect(result[game.players[0]] + result[game.players[1]]).toEqual(0);
					});
				}));
			});
		});
	}); //// games.OddsAndEvens can be can be played/won by some autonomous players.
}); //// define.