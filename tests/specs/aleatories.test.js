define(['creatartis-base', 'ludorum'], function (base, ludorum) {
	var aleatories = ludorum.aleatories,
		iterable = base.iterable;

	function expectUniformDistribution(dist, values) {
		dist = iterable(dist).toArray();
		var prob = 1 / values.length;
		values.forEach(function (value, i) {
			expect(dist[i][0]).toBe(value);
			expect(dist[i][1]).toBe(prob);
		});
	}
		
	describe("aleatories", function () { ///////////////////////////////////////////////////////////
		it("Aleatory base", function () {
			var d6 = new aleatories.Aleatory(1, 6);
			expectUniformDistribution(d6.distribution(), [1,2,3,4,5,6]);
		});
		
		it("UniformAleatory", function () {
			var alea = new aleatories.UniformAleatory("xyz");
			expectUniformDistribution(alea.distribution(), ['x','y','z']);
			expect(function () { // Must fail because of too few values.
				return new aleatories.UniformAleatory([]);
			}).toThrow();
		});
		
		it("dice", function () {
			var dice = ludorum.aleatories.dice;
			expect(dice).toBeDefined();
			'D4 D6 D8 D10 D12 D20'.split(/\s+/).forEach(function (id) {
				var die = dice[id];
				expect(die).toBeDefined();
				expectUniformDistribution(die.distribution(), 
					base.Iterable.range(1, +(id.substr(1)) + 1).toArray()
				);
			});
		});
		
		it("sumProbability", function () {
			var sumProbability = ludorum.aleatories.sumProbability;
			expect(typeof sumProbability).toBe('function');
			expect(sumProbability(1,2,6)).toBe(0);
			expect(1 / sumProbability(2,2,6)).toBe(36);
			expect(1 / sumProbability(3,2,6)).toBe(18);
			expect(1 / sumProbability(7,2,6)).toBe(6);
			expect(1 / sumProbability(11,2,6)).toBe(18);
			expect(1 / sumProbability(12,2,6)).toBe(36);
			expect(sumProbability(13,2,6)).toBe(0);
		});
	}); //// aleatories
	
}); //// define.