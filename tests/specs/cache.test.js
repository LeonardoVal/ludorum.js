define(['creatartis-base', 'ludorum'], function (base, ludorum) {

	describe("utils.Cache (basics)", function () { /////////////////////////////
		it("with Mancala", function () {
			var game = new ludorum.games.Mancala(),
				cache = new ludorum.utils.Cache(game),
				root = cache.root();
			expect(root).toBeDefined();
			expect(root.state).toBe(game);
			expect(root.id).toBe(game.identifier());
			expect(cache.__entries__[root.id]).toBe(root);
			expect(Object.keys(cache.__entries__).length).toBe(1);
			
			var descendants = cache.descendants(cache.root());
			expect(descendants.length).toBe(6);
			descendants.forEach(function (d, i) {
				expect(cache.__entries__[d.id]).toBe(d);
				expect(d.precursors.length).toBe(1);
				expect(d.precursors[0].length).toBe(2);
				expect(d.precursors[0][1]).toBe(root);
				var move = d.precursors[0][0],
					moveIdentifier = cache.moveIdentifier(move);
				expect(root.descendants[moveIdentifier].length).toBe(2);
				expect(root.descendants[moveIdentifier][0]).toBe(move);
				expect(root.descendants[moveIdentifier][1]).toBe(d);
			});
			expect(Object.keys(cache.__entries__).length).toBe(7);
			
			root = cache.root(descendants[3].state);
			expect(root).toBe(descendants[3]);
			expect(cache.__entries__[root.id]).toBe(root);
			expect(Object.keys(cache.__entries__).length).toBe(1);
		});
	}); //// utils.Cache (basics)

}); //// define.