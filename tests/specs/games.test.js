define(['creatartis-base', 'ludorum'], function (base, ludorum) {
	var RANDOM = base.Randomness.DEFAULT;	
	
	function itIsGameInstance(game) {
		it("is a valid instance of ludorum.Game", function () {
			expect(game).toBeOfType(ludorum.Game);
			expect(game.name).toBeTruthy();
			expect(game.players).toBeOfType(Array);
			expect(game.players.length).toBeGreaterThan(0);
			expect(game.__serialize__()).toBeOfType(Array);
		});
	}

	function checkFinishedGame(game, options) {
		expect(game.moves()).toBeFalsy();
		var sum = 0, result = game.result();
		expect(result).toBeTruthy();
		game.players.forEach(function (player) {
			expect(result[player]).toBeOfType('number');
			sum += result[player];
		});
		options && options.zeroSum && expect(sum).toBe(0);
	}
	
	function checkUnfinishedGame(game, options) {
		var moves = game.moves();
		expect(moves).toBeTruthy();
		expect(game.activePlayers).toBeOfType(Array);
		options && options.oneActivePlayerPerTurn && expect(game.activePlayers.length).toBe(1);
		if (game.activePlayers.length === 1) {
			expect(game.activePlayer()).toBe(game.activePlayers[0]);
		} else {
			expect(game.activePlayer.bind(game)).toThrow();
		}
		game.activePlayers.forEach(function (activePlayer) {
			expect(game.isActive(activePlayer)).toBe(true);
			expect(moves[activePlayer]).toBeOfType(Array);
			expect(moves[activePlayer].length).toBeGreaterThan(0);
		});
	}
	
	function itWorksLikeGame(game, options) {
		it("works like a game", function () {
			var MAX_PLIES = 500, moves, decisions;
			for (var i = 0; i < MAX_PLIES; i++) {
				while (game && game instanceof ludorum.Aleatory) {
					game = game.next();
				}
				expect(game).toBeOfType(ludorum.Game);
				moves = game.moves();
				if (!moves) {
					checkFinishedGame(game, options);
					break;
				} else {
					checkUnfinishedGame(game, options);
					decisions = {};
					game.activePlayers.forEach(function (activePlayer) {
						decisions[activePlayer] = RANDOM.choice(moves[activePlayer]);
					});
					game = game.next(decisions);
				}
			}
			expect(i).toBeLessThan(MAX_PLIES);
		});
	}
	
	["Predefined", "Choose2Win", "TicTacToe", "ToadsAndFrogs", "Mancala", 
		"ConnectFour", "Pig", "ConnectionGame", "Othello", "Bahab"]
	.forEach(function (name) { // Zerosum games for 2 players with one active player per turn.
		describe("games."+ name, function () {
			var game = new ludorum.games[name](),
				options = { zeroSum: true, oneActivePlayerPerTurn: true };
			itIsGameInstance(game, options);
			itWorksLikeGame(game, options);
		});
	});
	
	["OddsAndEvens", "Mutropas"]
	.forEach(function (name) { // Zerosum simultaneous games for 2 players.
		describe("games."+ name, function () {
			var game = new ludorum.games[name](),
				options = { zeroSum: true };
			itIsGameInstance(game, options);
			itWorksLikeGame(game, options);
		});
	});
	
//// Specific tests. ///////////////////////////////////////////////////////////

	describe("games.Predefined()", function () {
		it("works like a game", function () {
			var game, moves, results, resultA, resultB;
			for (var h = 0; h < 15; h++) {
				for (var w = 1; w < 10; w++) {
					resultA = (h % 3) - 1;
					resultB = -resultA;
					game = new ludorum.games.Predefined('A', {'A': resultA, 'B': resultB}, h, w);
					expect(game.players.join(' ')).toBe('A B');
					for (var i = 0; i < h; i++) {
						moves = game.moves();
						expect(moves).toBeTruthy();
						expect(game.result()).toBeFalsy();
						moves = moves[game.activePlayer()]
						expect(moves).toBeTruthy();
						expect(moves.length).toEqual(w);
						game = game.next(base.obj(game.activePlayer(), moves[i % w]))
					}
					expect(game.moves()).toBeFalsy();
					results = game.result();
					expect(results).toBeTruthy();
					expect(results.A).toEqual(resultA);
					expect(results.B).toEqual(resultB);
				}
			}
		});
	}); // games.Predefined()
	
	describe("games.Choose2Win()", function () { //////////////////////////
		var game = new ludorum.games.Choose2Win();
		it("must enable to choose to win or lose", function () {
			expect(game.activePlayer()).toBe('This');
			var moves = game.moves().This;
			expect(moves.indexOf('win') >= 0).toBe(true);
			var result = game.next({ This: 'win' }).result();
			expect(result.This).toBeGreaterThan(0);
			expect(moves.indexOf('lose') >= 0).toBe(true);
			result = game.next({ This: 'lose' }).result();
			expect(result.This).toBeLessThan(0);
			expect(moves.indexOf('pass') >= 0).toBe(true);
			result = game.next({ This: 'pass' }).result();
			expect(result).toBeFalsy();
		});
	}); // games.Choose2Win()
	
}); //// define.
