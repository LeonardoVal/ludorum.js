define(['creatartis-base', 'sermat', 'ludorum'], function (base, Sermat, ludorum) {
	
	describe("tournaments", function () { //////////////////////////////////////////////////////////
		it("can be serialized with Sermat", function () {
			var game = new ludorum.games.Choose2Win(),
				players = [
					new ludorum.players.RandomPlayer({name: 'RandomPlayer#1'}), 
					new ludorum.players.RandomPlayer({name: 'RandomPlayer#2'})
				],
				contest = new ludorum.tournaments.RoundRobin(game, players, 2),
				contest2 = Sermat.sermat(contest, { mode: Sermat.BINDING_MODE });
			expect(contest2 instanceof contest.constructor).toBe(true);
			expect(contest2.game instanceof ludorum.games.Choose2Win).toBe(true);
			expect(contest2.players.length).toBe(contest.players.length);
			expect(contest2.matchCount).toBe(contest.matchCount);
			
			contest = new ludorum.tournaments.Measurement(game, players[0], [players[1]], 2);
			contest2 = Sermat.sermat(contest, { mode: Sermat.BINDING_MODE });
			expect(contest2 instanceof contest.constructor).toBe(true);
			expect(contest2.game instanceof ludorum.games.Choose2Win).toBe(true);
			expect(contest2.players.length).toBe(contest.players.length);
			expect(contest2.opponents.length).toBe(contest.opponents.length);
			expect(contest2.matchCount).toBe(contest.matchCount);
			
			contest = new ludorum.tournaments.Elimination(game, players, 2);
			contest2 = Sermat.sermat(contest, { mode: Sermat.BINDING_MODE });
			expect(contest2 instanceof contest.constructor).toBe(true);
			expect(contest2.game instanceof ludorum.games.Choose2Win).toBe(true);
			expect(contest2.players.length).toBe(contest.players.length);
			expect(contest2.matchCount).toBe(contest.matchCount);
		});
	}); //// tournaments
	
	describe("tournaments.RoundRobin", function () { ///////////////////////////////////////////////
		it("(games.Choose2Win, players.RandomPlayer)", function (done) {
			var game = new ludorum.games.Choose2Win(),
				participants = [
					new ludorum.players.RandomPlayer({name: 'RandomPlayer#1'}), 
					new ludorum.players.RandomPlayer({name: 'RandomPlayer#2'})
				],
				contest = new ludorum.tournaments.RoundRobin(game, participants, 2),
				matchCount = 0;
			contest.events.on('beforeMatch', function (match) {
				expect(match.state()).toBe(game);
				matchCount++;
			});
			return contest.run().then(function () {
				var stats = contest.statistics;
				expect(matchCount).toBe(4);
				expect(stats.count({key:'results', player:'RandomPlayer#1'})).toBe(4);
				expect(stats.count({key:'results', player:'RandomPlayer#1', role:'This'})).toBe(2);
				expect(stats.count({key:'results', player:'RandomPlayer#1', role:'That'})).toBe(2);
				expect(stats.count({key:'results', player:'RandomPlayer#2'})).toBe(4);
				expect(stats.count({key:'results', player:'RandomPlayer#2', role:'This'})).toBe(2);
				expect(stats.count({key:'results', player:'RandomPlayer#2', role:'That'})).toBe(2);
				expect(stats.sum({key:'results'})).toBe(0); // Choose2Win is a zero-sum game.
				done();
			});
		});
	}); //// tournaments.RoundRobin
	
	describe("tournaments.Measurement", function () { //////////////////////////////////////////////
		it("(games.Choose2Win, players.RandomPlayer)", function (done) {
			var game = new ludorum.games.Choose2Win(),
				contest = new ludorum.tournaments.Measurement(game,
					[new ludorum.players.RandomPlayer({name: 'RandomPlayer#1'})],
					[	new ludorum.players.RandomPlayer({name: 'RandomPlayer#2'}), 
						new ludorum.players.RandomPlayer({name: 'RandomPlayer#3'})
					], 2),
				matchCount = 0;
			contest.events.on('beforeMatch', function (match) {
				expect(match.state(), game);
				matchCount++;
			});
			return contest.run().then(function () {
				var stats = contest.statistics;
				expect(matchCount).toBe(8);
				expect(stats.count({key:'results', player:'RandomPlayer#1'})).toBe(8);
				expect(stats.count({key:'results', player:'RandomPlayer#1', role:'This'})).toBe(4);
				expect(stats.count({key:'results', player:'RandomPlayer#1', role:'That'})).toBe(4);
				expect(stats.count({key:'results', player:'RandomPlayer#2'})).toBe(4);
				expect(stats.count({key:'results', player:'RandomPlayer#2', role:'This'})).toBe(2);
				expect(stats.count({key:'results', player:'RandomPlayer#2', role:'That'})).toBe(2);
				expect(stats.count({key:'results', player:'RandomPlayer#3'})).toBe(4);
				expect(stats.count({key:'results', player:'RandomPlayer#3', role:'This'})).toBe(2);
				expect(stats.count({key:'results', player:'RandomPlayer#3', role:'That'})).toBe(2);
				expect(stats.sum({key:'results'})).toBe(0);
				done();
			});
		});
	}); //// tournaments.Measurement
	
	describe("tournaments.Elimination", function () { //////////////////////////////////////////////
		it("(games.Choose2Win, players.RandomPlayer)", function (done) {
			var game = new ludorum.games.Choose2Win(),
				contest = new ludorum.tournaments.Elimination(game, [
					new ludorum.players.RandomPlayer({name: 'RandomPlayer#1'}), 
					new ludorum.players.RandomPlayer({name: 'RandomPlayer#2'}),
					new ludorum.players.RandomPlayer({name: 'RandomPlayer#3'}), 
					new ludorum.players.RandomPlayer({name: 'RandomPlayer#4'})
				], 2),
				matchCount = 0;
			contest.events.on('beforeMatch', function (match) {
				expect(match.state(), game);
				matchCount++;
			});
			return contest.run().then(function () {
				var stats = contest.statistics;
				expect(matchCount).toBe(6);
				expect(stats.sum({key:'results'})).toBe(0);
				done();
			});
		});
	}); //// tournaments.Elimination
}); //// define.