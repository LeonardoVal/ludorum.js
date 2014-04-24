var APP = {};

require.config({ 
	paths: { 
		'creatartis-base': "../../lib/creatartis-base", 
		ludorum: "../../build/ludorum"
	}
});
require(['creatartis-base', 'ludorum'], function (base, ludorum) {
	APP.imports = { base: base, ludorum: ludorum };

// Player options. /////////////////////////////////////////////////////////////
	var PLAYER_OPTIONS = APP.PLAYER_OPTIONS = [
		{title: "You", builder: function () { 
			return new ludorum.players.UserInterfacePlayer(); 
		}},
		{title: "Random", builder: function () { 
			return new ludorum.players.RandomPlayer();
		}},
		{title: "MonteCarlo (20 sims)", builder: function () {
			return new ludorum.players.MonteCarloPlayer({ simulationCount: 20, timeCap: 1500 });
		}},
		{title: "MonteCarlo (50 sims)", builder: function () {
			return new ludorum.players.MonteCarloPlayer({ simulationCount: 50, timeCap: 1500 });
		}},
		{title: "MiniMax AlfaBeta (4 plies)", builder: function () {
			return new ludorum.players.AlphaBetaPlayer({ horizon: 4 });
		}},
		{title: "MiniMax AlfaBeta (6 plies)", builder: function () {
			return new ludorum.players.AlphaBetaPlayer({ horizon: 6 });
		}},
		{title: "Default heuristic (4 plies)", builder: function () {
			return new ludorum.players.AlphaBetaPlayer({ horizon: 4, 
				heuristic: ludorum.games.Mancala.defaultHeuristic
			});
		}},
		{title: "Default heuristic (6 plies)", builder: function () {
			return new ludorum.players.AlphaBetaPlayer({ horizon: 6, 
				heuristic: ludorum.games.Mancala.defaultHeuristic
			});
		}}
	];
	APP.players = [PLAYER_OPTIONS[0].builder(), PLAYER_OPTIONS[0].builder()];
	$('#player0').html(PLAYER_OPTIONS.map(function (option, i) {
		return '<option value="'+ i +'">'+ option.title +'</option>';
	}).join(''));
	$('#player1').html($('#player0').html());
	$('#player0').change(function () {
		APP.players[0] = PLAYER_OPTIONS[+this.value].builder();
		APP.reset();
	});
	$('#player1').change(function () {
		APP.players[1] = PLAYER_OPTIONS[+this.value].builder();
		APP.reset();
	});
	
// Buttons. ////////////////////////////////////////////////////////////////////
	$('#reset').click(APP.reset = function reset() {
		var board = ludorum.games.Mancala.prototype.makeBoard(4),
			game = new ludorum.games.Mancala(undefined, board),
			match = new ludorum.Match(game, APP.players);
		$('#player0-name').html(base.Text.escapeXML(game.players[0]));
		$('#player1-name').html(base.Text.escapeXML(game.players[1]));
		APP.ui = new ludorum.players.UserInterface.BasicHTMLInterface({ match: match, container: 'board' });
		match.events.on('begin', function (game) {
			$('footer').html(base.Text.escapeXML(
				"Turn "+ game.activePlayer() +"."
			));
		});
		match.events.on('next', function (game, next) {
			$('footer').html(base.Text.escapeXML(
				"Turn "+ next.activePlayer() +"."
			));
		});
		match.events.on('end', function (game, results) {
			var player0 = game.players[0];
			$('footer').html(base.Text.escapeXML(
				results[player0] === 0 ? 'Drawed game.' : (results[player0] > 0 ? player0 : game.players[1]) +' wins.'
			));
		});
		match.run();
	});
	
// Start.
	APP.reset();
}); // require().
