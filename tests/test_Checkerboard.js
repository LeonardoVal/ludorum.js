/** Test cases for the Checkerboard definitions in the Ludorum framework.
*/
define(['basis', 'ludorum'], function (basis, ludorum) {
	var verifier = new basis.Verifier(),
		games = ludorum.games,
		players = ludorum.players;
	
	// Test lines in the given order.
	function __testLines__(board, horizontals, verticals, positiveDiagonals, negativeDiagonals) {
		var orthogonals = horizontals.concat(verticals),
			diagonals = positiveDiagonals.concat(negativeDiagonals),
			lines = orthogonals.concat(diagonals);
		function square(coord) {
			return board.square.apply(board, coord);
		}
		board.horizontals().zip(horizontals).forEach(function (pair) {
			var line = pair[0].map(square).join('');
			verifier.assertEqual(pair[1], line, 'Line "', line, '" is not a valid horizontal.');
		});
		board.verticals().zip(verticals).forEach(function (pair) {
			var line = pair[0].map(square).join('');
			verifier.assertEqual(pair[1], line, 'Line "', line, '" is not a valid vertical.');
		});
		board.orthogonals().zip(orthogonals).forEach(function (pair) {
			var line = pair[0].map(square).join('');
			verifier.assertEqual(pair[1], line, 'Line "', line, '" is not a valid orthogonal.');
		});
		board.positiveDiagonals().zip(positiveDiagonals).forEach(function (pair) {
			var line = pair[0].map(square).join('');
			verifier.assertEqual(pair[1], line, 'Line "', line, '" is not a valid positive diagonal.');
		});
		board.negativeDiagonals().zip(negativeDiagonals).forEach(function (pair) {
			var line = pair[0].map(square).join('');
			verifier.assertEqual(pair[1], line, 'Line "', line, '" is not a valid negative diagonal.');
		});
		board.diagonals().zip(diagonals).forEach(function (pair) {
			var line = pair[0].map(square).join('');
			verifier.assertEqual(pair[1], line, 'Line "', line, '" is not a valid diagonal.');
		});
		board.lines().zip(lines).forEach(function (pair) {
			var line = pair[0].map(square).join('');
			verifier.assertEqual(pair[1], line, 'Line "', line, '" is not valid.');
		});
	} 
	
	verifier.test("CheckerboardFromString lines", function () { ////////////////
		__testLines__(new ludorum.boards.CheckerboardFromString(1, 1, '1'),
			['1'], ['1'], ['1'], ['1']
		);
		__testLines__(new ludorum.boards.CheckerboardFromString(1, 2, '12'),
			['12'], ['1', '2'], ['1', '2'], ['1', '2']
		);
		__testLines__(new ludorum.boards.CheckerboardFromString(2, 1, '12'),
			['1', '2'], ['12'], ['2', '1'], ['1', '2']
		);
		__testLines__(new ludorum.boards.CheckerboardFromString(2, 2, '1234'),
			['12', '34'], ['13', '24'], ['3', '14', '2'], ['1', '32' ,'4']
		);
		__testLines__(new ludorum.boards.CheckerboardFromString(3, 3, '123456789'),
			['123', '456', '789'], ['147', '258', '369'],
			['7', '48', '159', '26', '3'], ['1', '42', '753', '86', '9']
		);
		__testLines__(new ludorum.boards.CheckerboardFromString(3, 4, '123456789ABC'),
			['1234', '5678', '9ABC'], ['159', '26A', '37B', '48C'],
			['9', '5A', '16B', '27C', '38', '4'], ['1', '52', '963', 'A74', 'B8', 'C']
		);
		__testLines__(new ludorum.boards.CheckerboardFromString(4, 3, '123456789ABC'),
			['123', '456', '789', 'ABC'], ['147A', '258B', '369C'],
			['A', '7B', '48C', '159', '26', '3'], ['1', '42', '753', 'A86', 'B9', 'C']
		);
	}); // CheckerboardFromString lines.
	
	verifier.test("CheckerboardFromString.place()", function () { /////////
		var board1x1 = new ludorum.boards.CheckerboardFromString(1, 1, '1');
		verifier.assertEqual('.', board1x1.place([0,0], '').string);
		verifier.assertEqual('2', board1x1.place([0,0], '2').string);
		var board3x3 = new ludorum.boards.CheckerboardFromString(3, 3, '123456789');
		verifier.assertEqual('1234.6789', board3x3.place([1,1], '').string);
		verifier.assertEqual('1234X6789', board3x3.place([1,1], 'X').string);
		verifier.assertEqual('1234567X9', board3x3.place([2,1], 'X').string);
		verifier.assertEqual('12345X789', board3x3.place([1,2], 'X').string);
		verifier.assertEqual('X23456789', board3x3.place([0,0], 'X').string);
		
		verifier.assertFails(board1x1.place.bind(board1x1));
		verifier.assertFails(board1x1.place.bind(board1x1, []));
		verifier.assertFails(board1x1.place.bind(board1x1, ['3', 'b']));
		verifier.assertFails(board1x1.place.bind(board1x1, [-1, 0]));
		verifier.assertFails(board1x1.place.bind(board1x1, [0, 2]));
	}); // CheckerboardFromString.place().
	
	verifier.test("CheckerboardFromString.move()", function () { /////////
		var board3x3 = new ludorum.boards.CheckerboardFromString(3, 3, '123456789');
		verifier.assertEqual('5234.6789', board3x3.move([1,1], [0,0]).string);
		verifier.assertEqual('.23416789', board3x3.move([0,0], [1,1]).string);
		verifier.assertEqual('1234587X9', board3x3.move([2,1], [1,2], 'X').string);
		verifier.assertEqual('12X456389', board3x3.move([0,2], [2,0], 'X').string);
		
		verifier.assertFails(board3x3.move.bind(board3x3));
		verifier.assertFails(board3x3.move.bind(board3x3, []));
		verifier.assertFails(board3x3.move.bind(board3x3, [0,0]));
		verifier.assertFails(board3x3.move.bind(board3x3, [0,0], ['3', 'a']));
		verifier.assertFails(board3x3.move.bind(board3x3, [0,0], [-1, 0]));
		verifier.assertFails(board3x3.move.bind(board3x3, [0,0], [0, 9]));
	}); // CheckerboardFromString.move().
	
	verifier.test("CheckerboardFromString.swap()", function () { /////////
		var board3x3 = new ludorum.boards.CheckerboardFromString(3, 3, '123456789');
		verifier.assertEqual('523416789', board3x3.swap([1,1], [0,0]).string);
		verifier.assertEqual('523416789', board3x3.swap([0,0], [1,1]).string);
		verifier.assertEqual('123458769', board3x3.swap([2,1], [1,2]).string);
		verifier.assertEqual('127456389', board3x3.swap([0,2], [2,0]).string);
		
		verifier.assertFails(board3x3.swap.bind(board3x3));
		verifier.assertFails(board3x3.swap.bind(board3x3, []));
		verifier.assertFails(board3x3.swap.bind(board3x3, [0,0]));
		verifier.assertFails(board3x3.swap.bind(board3x3, [0,0], ['3', 'a']));
		verifier.assertFails(board3x3.swap.bind(board3x3, [0,0], [-1, 0]));
		verifier.assertFails(board3x3.swap.bind(board3x3, [0,0], [0, 9]));
	}); // CheckerboardFromString.swap().
	
/////////////////////////////////////////////////////////////////////////// Fin.
	return verifier;
});