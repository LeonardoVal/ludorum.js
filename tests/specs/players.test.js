define(['creatartis-base', 'sermat', 'ludorum'], function (base, Sermat, ludorum) {
	var RANDOM = base.Randomness.DEFAULT,
		autonomousPlayers = ["RandomPlayer", "HeuristicPlayer", "MiniMaxPlayer", 
			"AlphaBetaPlayer", "MaxNPlayer", "MonteCarloPlayer", "UCTPlayer"];
		
	describe('Module players', function () { ///////////////////////////////////////////////////////
		it('must exist', function () {
			expect(ludorum.players).toBeDefined();
		});
		autonomousPlayers.forEach(function (playerName) {
			it('must have player '+ playerName, function () {
				var Player = ludorum.players[playerName];
				expect(Player).toBeOfType('function');
				var p = new Player();
				expect(p).toBeOfType(ludorum.Player);
				expect(Sermat.sermat(p, { mode: Sermat.BINDING_MODE })).toBeOfType(Player);
			});
		});
	});

	describe("games.Predefined", function () { /////////////////////////////////////////////////////
		var MATCH_COUNT = 10,
			MATCH_LENGTH = 5,
			MATCH_WIDTH = 6;
		autonomousPlayers.forEach(function (playerName) {
			it('can be played by '+ playerName, function (done) {
				var Player = ludorum.players[playerName];
				return base.Future.all(base.Iterable.range(MATCH_COUNT).map(function (i) {
					var resultA = (i % 3) - 1,
						resultB = -resultA,
						game = new ludorum.games.Predefined(i % 2 ? 'A' : 'B', {
							A: resultA, B: resultB
						}, MATCH_LENGTH, MATCH_WIDTH),
						match = new ludorum.Match(game, [new Player(), new Player()]);
					return match.run().then(function (match) {
						var result = match.result();
						expect(result).toBeTruthy();
						expect(result.A).toEqual(resultA);
						expect(result.B).toEqual(resultB);
						expect(match.ply()).toEqual(MATCH_LENGTH);
						done();
					});
				}));
			});
		}); 
	}); //// games.Predefined can be played by autonomousPlayers.
	
	describe("games.Choose2Win", function () { /////////////////////////////////////////////////////
		var MATCH_COUNT = 10,
			game = new ludorum.games.Choose2Win(),
			passer = new ludorum.players.TracePlayer({trace: ['pass']});
		autonomousPlayers.forEach(function (playerName) {
			var Player = ludorum.players[playerName];
			it('can be played by '+ playerName, function (done) {
				return base.Future.all(base.Iterable.range(MATCH_COUNT).map(function (i) {
					var match = new ludorum.Match(game, [new Player(), new Player()]);
					return match.run().then(function (match) {
						var result = match.result();
						expect(result).toBeTruthy();
						expect(result[game.players[0]] + result[game.players[1]]).toBe(0);
						done();
					});
				}));
			});
			if (Player !== ludorum.players.RandomPlayer) { // RandomPlayer does not try to win. The others must.
				it('can be won by '+ playerName, function (done) {
					return base.Future.all(base.Iterable.range(MATCH_COUNT).map(function (i) {
						var match = new ludorum.Match(game, i % 2 ? [passer, new Player()] : [new Player(), passer]),
							role = game.players[i % 2];
						return match.run().then(function (match) {
							var result = match.result();
							expect(result).toBeTruthy();
							expect(match.state(-1).activePlayer()).toBe(role);
							expect(result[role]).toBeGreaterThan(0);
							done();
						});
					}));
				});
			}
		});
	}); //// games.Choose2Win can be played/won by autonomous players.
	
	describe("games.Pig", function () { ////////////////////////////////////////////////////////////
		["RandomPlayer", "HeuristicPlayer", "MiniMaxPlayer", "AlphaBetaPlayer",
				"MonteCarloPlayer", "UCTPlayer"].forEach(function (playerName) {
			var MATCH_COUNT = 10,
				game = new ludorum.games.Pig('One', 15),
				Player = ludorum.players[playerName];
			it("can be played by "+ playerName, function (done) {
				return base.Future.all(base.Iterable.range(MATCH_COUNT).map(function (i) {
					var match = new ludorum.Match(game, [new Player(), new Player()]);
					return match.run().then(function (match) {
						var result = match.result();
						expect(result).toBeTruthy();
						expect(result[game.players[0]] + result[game.players[1]]).toEqual(0);
						done();
					});
				}));
			});
		});
	}); //// games.Pig can be played/won by some autonomous players.
	
	describe("games.OddsAndEvens", function () { ///////////////////////////////////////////////////
		["RandomPlayer", "HeuristicPlayer", "MonteCarloPlayer", "UCTPlayer"
		].forEach(function (playerName) {
			var MATCH_COUNT = 10,
				game = new ludorum.games.OddsAndEvens(),
				Player = ludorum.players[playerName];
			it("can be played by "+ playerName, function (done) {
				return base.Future.all(base.Iterable.range(MATCH_COUNT).map(function (i) {
					var match = new ludorum.Match(game, [new Player(), new Player()]);
					return match.run().then(function (match) {
						var result = match.result();
						expect(result).toBeTruthy();
						expect(result[game.players[0]] + result[game.players[1]]).toEqual(0);
						done();
					});
				}));
			});
		});
	}); //// games.OddsAndEvens can be played/won by some autonomous players.
	
	describe("games.TicTacToe", function () { //////////////////////////////////////////////////////
		it("can be played by a rule based player", function (done) {
			function makeRule(re, move) {
				return function (board) {
					return re.test(board) ? move : null;
				};
			}
			var MATCH_COUNT = 10,
				player = new ludorum.players.RuleBasedPlayer({
					features: function (game, role) {
						return game.board.split('').map(function (chr) {
							return chr === '_' ? '_' : chr === role.charAt(0) ? 'A' : 'a';
						}).join('');
					}
				}),
				game = new ludorum.games.TicTacToe();
			player
				.regExpRule(/...._..../, 4)
				.regExpRule(/_......../, 0)
				.regExpRule(/.._....../, 2)
				.regExpRule(/......_../, 6)
				.regExpRule(/........_/, 8);
			return base.Future.all(base.Iterable.range(MATCH_COUNT).map(function (i) {
				var match = new ludorum.Match(game, [player, player]);
				return match.run().then(function (match) {
					var result = match.result();
					expect(result).toBeTruthy();
					expect(result[game.players[0]] + result[game.players[1]]).toEqual(0);
					done();
				});
			}));
		});
	}); //// games.TicTacToe can be played by a rule based player.
}); //// define.