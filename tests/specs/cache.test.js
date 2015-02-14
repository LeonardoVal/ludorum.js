define(['creatartis-base', 'ludorum'], function (base, ludorum) {

	describe("utils.Cache (basics)", function () { /////////////////////////////
		it("with Mancala", function () {
			var game = new ludorum.games.Mancala(),
				cache = new ludorum.utils.Cache(game),
				root = cache.root();
			expect(root).toBeDefined();
			expect(root.state).toBe(game);
			expect(root.id).toBe(game.identifier());
			expect(cache.has(game)).toBe(true);
			expect(cache.has(root.id)).toBe(true);
			expect(cache.get(game)).toBe(root);
			expect(cache.get(root.id)).toBe(root);
			expect(cache.entry(game)).toBe(root);
			expect(cache.entry(root.state)).toBe(root);
			expect(cache.size()).toBe(1);
			
			var descendants = cache.descendants(cache.root());
			expect(descendants.length).toBe(6);
			descendants.forEach(function (d, i) {
				expect(cache.get(d.id)).toBe(d);
				expect(d.precursors.length).toBe(1);
				expect(d.precursors[0].length).toBe(2);
				expect(d.precursors[0][1]).toBe(root);
				var move = d.precursors[0][0],
					moveIdentifier = cache.moveIdentifier(move);
				expect(root.descendants[moveIdentifier].length).toBe(2);
				expect(root.descendants[moveIdentifier][0]).toBe(move);
				expect(root.descendants[moveIdentifier][1]).toBe(d);
			});
			expect(cache.size()).toBe(7);
			
			root = cache.root(descendants[3].state);
			expect(root).toBe(descendants[3]);
			expect(cache.entry(root.state)).toBe(root);
			expect(cache.size()).toBe(1);
		});
	}); //// utils.Cache (basics)

}); //// define.