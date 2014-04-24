define(['creatartis-base', 'ludorum'], function (base, ludorum) {
	
	describe("Scanner", function () {
		async_it("scans games.__Predefined__", function () {
			var scanner = new ludorum.utils.Scanner({ 
				game: new ludorum.games.__Predefined__('A', {A: 1, B:-1}, 6, 5),
				maxWidth: 100,
				maxLength: 10
			});
			return scanner.scan().then(function (stats) {
				expect(stats.average({key:'game.result'})).toBe(0);
				expect(stats.average({key:'game.result', role:'A'})).toBe(1);
				expect(stats.count({key:'victory.result', role:'A'}))
					.toEqual(stats.count({key:'victory.result'}));
				expect(stats.average({key:'game.result', role:'B'})).toBe(-1);
				expect(stats.count({key:'defeat.result', role:'B'}))
					.toEqual(stats.count({key:'defeat.result'}));
				expect(stats.count({key:'draw.length'})).toBe(0);
				expect(stats.average({key:'game.width'})).toBe(5);
				expect(stats.average({key:'game.length'})).toBe(6);
				expect(stats.average({key:'aborted'})).toBe(0);
			});
		}); //// scans games.__Predefined__
	
		async_it("scans games.Choose2Win", function () {
			var scanner = new ludorum.utils.Scanner({ 
				game: new ludorum.games.Choose2Win(),
				maxWidth: 100,
				maxLength: 10
			});
			return scanner.scan().then(function (stats) {
				expect(stats.average({key:'game.result'})).toBe(0);
				expect(stats.average({key:'game.result', role:'This'})).toBe(0);
				expect(stats.maximum({key:'game.result', role:'This'})).toBe(1);
				expect(stats.minimum({key:'game.result', role:'This'})).toBe(-1);
				expect(stats.average({key:'game.result', role:'That'})).toBe(0);
				expect(stats.maximum({key:'game.result', role:'That'})).toBe(1);
				expect(stats.minimum({key:'game.result', role:'That'})).toBe(-1);
				expect(stats.count({key:'draw.length'})).toBe(0);
				expect(stats.average({key:'game.width'})).toBe(3);
				expect(stats.average({key:'aborted'})).toBe(3);
			});
		}); //// scans games.Choose2Win
	}); // describe Scanner

}); //// define.