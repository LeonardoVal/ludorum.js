define(['creatartis-base', 'ludorum'], function (base, ludorum) {
	var Aleatory = ludorum.Aleatory,
		iterable = base.iterable;

	describe("aleatories", function () { ////////////////////////////////////////////////////
		it(".from*() & .with*() shortcuts", function () {
			var dist = [[true, 0.5], [false, 0.5]];
			[Aleatory.fromDistribution(dist), 
			 new (Aleatory.withDistribution(dist))()
			].forEach(function (alea) {
				iterable(dist).zip(alea.distribution()).forEachApply(function (d1, d2) {
					expect(JSON.stringify(d1)).toBe(JSON.stringify(d2))
				});
				for (var i = 0; i < 5; ++i) {
					expect(typeof alea.value()).toBe('boolean');
				}
			});
			
			[Aleatory.fromValues(['a', 'b', 'c']),
			 new (Aleatory.withValues(['a', 'b', 'c']))()
			].forEach(function (alea) {
				dist = [['a', 1/3], ['b', 1/3], ['c', 1/3]];
				iterable(dist).zip(alea.distribution()).forEachApply(function (d1, d2) {
					expect(JSON.stringify(d1)).toBe(JSON.stringify(d2))
				});
				for (var i = 0; i < 5; ++i) {
					expect(['a', 'b', 'c'].indexOf(alea.value())).not.toBeLessThan(0);
				}
			});
			
			[Aleatory.fromRange(2, 4),
			 new (Aleatory.withRange(2, 4))()
			].forEach(function (alea) {
				dist = [[2, 1/3], [3, 1/3], [4, 1/3]];
				iterable(dist).zip(alea.distribution()).forEachApply(function (d1, d2) {
					expect(JSON.stringify(d1)).toBe(JSON.stringify(d2))
				});
				for (var i = 0; i < 5; ++i) {
					expect([2, 3, 4].indexOf(alea.value())).not.toBeLessThan(0);
				}
			});
		});
	}); //// aleatories
	
}); //// define.