define(['creatartis-base', 'ludorum'], function (base, ludorum) {

	function __testLines__(board, horizontals, verticals, positiveDiagonals, negativeDiagonals) {
		var orthogonals = horizontals.concat(verticals),
			diagonals = positiveDiagonals.concat(negativeDiagonals),
			lines = orthogonals.concat(diagonals);
		function square(coord) {
			return board.square(coord);
		}
		function checkLine(pair) {
			expect(pair[0].map(square).join('')).toEqual(pair[1]);
		}
		board.horizontals().zip(horizontals).forEach(checkLine);
		board.verticals().zip(verticals).forEach(checkLine);
		board.orthogonals().zip(orthogonals).forEach(checkLine);
		board.positiveDiagonals().zip(positiveDiagonals).forEach(checkLine);
		board.negativeDiagonals().zip(negativeDiagonals).forEach(checkLine);
		board.diagonals().zip(diagonals).forEach(checkLine);
		board.lines().zip(lines).forEach(checkLine);
	}
	
	describe("CheckerboardFromString", function () { ///////////////////////////
		var CheckerboardFromString = ludorum.utils.CheckerboardFromString;
		
		it("calculate lines properly", function () {
			__testLines__(new CheckerboardFromString(1, 1, '1'),	
				['1'], ['1'], ['1'], ['1']);
			__testLines__(new CheckerboardFromString(1, 2, '12'), 
				['12'], ['1', '2'], ['1', '2'], ['1', '2']);
			__testLines__(new CheckerboardFromString(2, 1, '12'),
				['1', '2'], ['12'], ['2', '1'], ['1', '2']);
			__testLines__(new CheckerboardFromString(2, 2, '1234'),
				['12', '34'], ['13', '24'], ['3', '14', '2'], ['1', '32' ,'4']);
			__testLines__(new CheckerboardFromString(3, 3, '123456789'),
				['123', '456', '789'], ['147', '258', '369'],
				['7', '48', '159', '26', '3'], ['1', '42', '753', '86', '9']);
			__testLines__(new CheckerboardFromString(3, 4, '123456789ABC'),
				['1234', '5678', '9ABC'], ['159', '26A', '37B', '48C'],
				['9', '5A', '16B', '27C', '38', '4'], ['1', '52', '963', 'A74', 'B8', 'C']);
			__testLines__(new CheckerboardFromString(4, 3, '123456789ABC'),
				['123', '456', '789', 'ABC'], ['147A', '258B', '369C'],
				['A', '7B', '48C', '159', '26', '3'], ['1', '42', '753', 'A86', 'B9', 'C']);
		}); //// calculate lines properly.
		
		it("places pieces properly", function () {
			var board1x1 = new CheckerboardFromString(1, 1, '1');
			expect(board1x1.place([0,0], '').string).toBe('.');
			expect(board1x1.place([0,0], '2').string).toBe('2');
			expect(board1x1.place.bind(board1x1)).toThrow();
			expect(board1x1.place.bind(board1x1, [])).toThrow();
			expect(board1x1.place.bind(board1x1, ['3', 'b'])).toThrow();
			expect(board1x1.place.bind(board1x1, [-1, 0])).toThrow();
			expect(board1x1.place.bind(board1x1, [0, 2])).toThrow();

			var board3x3 = new CheckerboardFromString(3, 3, '123456789');
			expect(board3x3.place([1,1], '').string).toBe('1234.6789');
			expect(board3x3.place([1,1], 'X').string).toBe('1234X6789');
			expect(board3x3.place([2,1], 'X').string).toBe('1234567X9');
			expect(board3x3.place([1,2], 'X').string).toBe('12345X789');
			expect(board3x3.place([0,0], 'X').string).toBe('X23456789');			
		}); // places pieces properly.
	
		it("moves pieces properly", function () {
			var board3x3 = new CheckerboardFromString(3, 3, '123456789');
			expect(board3x3.move([1,1], [0,0]).string).toBe('5234.6789');
			expect(board3x3.move([0,0], [1,1]).string).toBe('.23416789');
			expect(board3x3.move([2,1], [1,2], 'X').string).toBe('1234587X9');
			expect(board3x3.move([0,2], [2,0], 'X').string).toBe('12X456389');
			
			expect(board3x3.move.bind(board3x3)).toThrow();
			expect(board3x3.move.bind(board3x3, [])).toThrow();
			expect(board3x3.move.bind(board3x3, [0,0])).toThrow();
			expect(board3x3.move.bind(board3x3, [0,0], ['3', 'a'])).toThrow();
			expect(board3x3.move.bind(board3x3, [0,0], [-1, 0])).toThrow();
			expect(board3x3.move.bind(board3x3, [0,0], [0, 9])).toThrow();
		}); // moves pieces properly
		
		it("swaps pieces properly", function () {
			var board3x3 = new CheckerboardFromString(3, 3, '123456789');
			expect(board3x3.swap([1,1], [0,0]).string).toBe('523416789');
			expect(board3x3.swap([0,0], [1,1]).string).toBe('523416789');
			expect(board3x3.swap([2,1], [1,2]).string).toBe('123458769');
			expect(board3x3.swap([0,2], [2,0]).string).toBe('127456389');
			
			expect(board3x3.swap.bind(board3x3)).toThrow();
			expect(board3x3.swap.bind(board3x3, [])).toThrow();
			expect(board3x3.swap.bind(board3x3, [0,0])).toThrow();
			expect(board3x3.swap.bind(board3x3, [0,0], ['3', 'a'])).toThrow();
			expect(board3x3.swap.bind(board3x3, [0,0], [-1, 0])).toThrow();
			expect(board3x3.swap.bind(board3x3, [0,0], [0, 9])).toThrow();
		}); // swaps pieces properly
		
		it("walks properly", function () {
			var board3x3 = new CheckerboardFromString(3, 3, '123456789');
			expect(board3x3.asString(board3x3.walk([0,0], [+1,+1]))).toBe('159');
			expect(board3x3.asString(board3x3.walk([1,1], [-1,+1]))).toBe('53');
			expect(board3x3.asString(board3x3.walk([2,2], [-1,-1]))).toBe('951');
			expect(board3x3.asString(board3x3.walk([2,2], [+1,+1]))).toBe('9');
			expect(board3x3.asString(board3x3.walk([3,3], [+1,+1]))).toBe('');
			
			var walks = board3x3.asStrings(board3x3.walks([1,1], [[+1,+1],[-1,-1]]));
			expect(Array.isArray(walks)).toBe(true);
			expect(walks[0]).toBe('59');
			expect(walks[1]).toBe('51');
		}); // walks properly
	}); //// describe CheckerboardFromString.

}); //// define.