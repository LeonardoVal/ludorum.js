var base = require('creatartis-base'),
	Sermat = require('sermat'),
	ludorum = require('../../build/ludorum');
Sermat.modifiers.mode = Sermat.CIRCULAR_MODE;
	
// Test cases //////////////////////////////////////////////////////////////////////////////////////

function randomGameStates(game) {
	var r = [];
	for (var ms; (ms = game.possibleMoves()).length; ) {
		r.push(game);
		game = game.next(base.Randomness.DEFAULT.choice(ms));
	}
	return r;
}

var TICTACTOE_STATES = randomGameStates(new ludorum.games.TicTacToe());

function playerDecisionTest(player, gameStates) {
	return {
		defer: true,
		fn: function (deferred) {
			return base.Future.all(gameStates.map(function (state) {
				return player.decision(state, state.activePlayer());
			})).then(function () {
				deferred.resolve();
			});
		}
	};
}

// Exports /////////////////////////////////////////////////////////////////////////////////////////

module.exports = {
	name: 'Player benchmarks',
	tests: {
		'RandomPlayer with TicTacToe':
			playerDecisionTest(new ludorum.players.RandomPlayer(), TICTACTOE_STATES),
		'MCTS(s=10) with TicTacToe':
			playerDecisionTest(new ludorum.players.MonteCarloPlayer({ simulationCount: 10 }), TICTACTOE_STATES)
	}
};