var base = require('creatartis-base'),
	Sermat = require('sermat'),
	ludorum = require('../../build/ludorum'),
	games = ludorum.games,
	players = ludorum.players;
Sermat.modifiers.mode = Sermat.CIRCULAR_MODE;

module.exports = {
	name: 'Player benchmarks',
	tests: { /* To be loaded later. */ }
};

// Test cases //////////////////////////////////////////////////////////////////////////////////////

var RANDOM = base.Randomness.DEFAULT;

function randomGameStates(game) {
	var r = {}, count = 0,
		g, ms;
	
	for (var i = 0; i < 10 && Object.keys(r).length < 50; i++) {
		g = game;
		while (g.isContingent || !g.result()) {
			if (g.isContingent) {
				g = g.randomNext();
			} else {
				r[Sermat.hashCode(g).toString(36)] = g;
				ms = g.possibleMoves();
				g = g.next(RANDOM.choice(ms));
			}
		}
	}
	return Object.values(r);
}

var GAMES = [
		new games.ToadsAndFrogs(),
		new games.TicTacToe(),
		new games.Pig(),
		new games.OddsAndEvens(15),
		new games.Bahab(),
		new games.Puzzle15()
	],
	PLAYERS = [new players.RandomPlayer({ name: 'RandomPlayer' })]
		.concat([1,3,5].map(function (h) {
			return new players.AlphaBetaPlayer({ name: 'MM\u03b1\u03b2(h='+ h +')', horizon: h });
		}))
		.concat([1,3,5].map(function (h) {
			return new players.MaxNPlayer({ name: 'MaxN(h='+ h +')', horizon: h });
		}))
		.concat([10,50,100].map(function (s) {
			return new players.MonteCarloPlayer({ name: 'MCTS(s='+ s +')', simulationCount: s });
		}))
		.concat([10,50,100].map(function (s) {
			return new players.UCTPlayer({ name: 'UCT(s='+ s +')', simulationCount: s });
		}));

GAMES.forEach(function (game) {	
	var randomStates = randomGameStates(game);
	game.constructor.RANDOM_STATES = randomStates;
	console.log("Generated "+ randomStates.length +" random game states for "+ game.name +".");
});

function playerDecisionTest(player, gameStates) {
	return {
		defer: true,
		fn: function (deferred) {
			return base.Future.all(gameStates.map(function (state) {
				return player.decision(state, RANDOM.choice(state.activePlayers));
			})).then(function () {
				deferred.resolve();
			});
		}
	};
}

base.Iterable.product(GAMES, PLAYERS).forEachApply(function (game, player) {
	if (player.isCompatibleWith(game)) {
		module.exports.tests[game.name +' with '+ player.name] = playerDecisionTest(player, 
			game.constructor.RANDOM_STATES);
	}
})
