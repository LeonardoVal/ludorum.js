var APP = {};

require.config({ 
	paths: { 
		basis: "../../lib/basis", 
		ludorum: "../../build/ludorum"
	}
});
require(['basis', 'ludorum'], function (basis, ludorum) {
	APP.imports = { basis: basis, ludorum: ludorum };

// Player options. /////////////////////////////////////////////////////////////
	var PLAYER_OPTIONS = APP.PLAYER_OPTIONS = [
		{title: "You", builder: function () { 
			return new ludorum.players.UserInterfacePlayer(); 
		}, runOnWorker: false},
		{title: "Random", builder: function () { 
			return new ludorum.players.RandomPlayer();
		}, runOnWorker: false},
		{title: "MonteCarlo (50 sims)", builder: function () {
			return new ludorum.players.MonteCarloPlayer({ simulationCount: 50, timeCap: 1500 });
		}, runOnWorker: true},
		{title: "MonteCarlo (100 sims)", builder: function () {
			return new ludorum.players.MonteCarloPlayer({ simulationCount: 100, timeCap: 1500 });
		}, runOnWorker: true},
		{title: "MiniMax AlfaBeta (4 plies)", builder: function () {
			return new ludorum.players.AlphaBetaPlayer({ horizon: 4 });
		}, runOnWorker: true},
		{title: "MiniMax AlfaBeta (6 plies)", builder: function () {
			return new ludorum.players.AlphaBetaPlayer({ horizon: 6 });
		}, runOnWorker: true}
	];
	APP.players = [PLAYER_OPTIONS[0].builder(), PLAYER_OPTIONS[0].builder()];
	$('#player0, #player1').html(PLAYER_OPTIONS.map(function (option, i) {
		return '<option value="'+ i +'">'+ option.title +'</option>';
	}).join(''));
	$('#player0, #player1').change(function () {
		var i = this.id === 'player0' ? 0 : 1,
			option = PLAYER_OPTIONS[+this.value];
		(option.runOnWorker
			? ludorum.players.WebWorkerPlayer.create({ playerBuilder: option.builder })
			: basis.Future.when(option.builder())
		).then(function (player) {
			APP.players[i] = player;
			APP.reset();
		});
	});
	
// Buttons. ////////////////////////////////////////////////////////////////////
	$('#reset').click(APP.reset = function reset() {
		var game = new ludorum.games.ConnectFour(),
			match = new ludorum.Match(game, APP.players);
		$('#player0-name').html(basis.Text.escapeXML(game.players[0]));
		$('#player1-name').html(basis.Text.escapeXML(game.players[1]));
		APP.ui = new ludorum.players.UserInterface.BasicHTMLInterface({ match: match, container: 'board' });
		match.events.on('begin', function (game) {
			$('footer').html(basis.Text.escapeXML("Turn "+ game.activePlayer() +"."));
		});
		match.events.on('next', function (game, next) {
			$('footer').html(basis.Text.escapeXML("Turn "+ next.activePlayer() +"."));
		});
		match.events.on('end', function (game, results) {
			var player0 = game.players[0];
			$('footer').html(basis.Text.escapeXML(
				results[player0] === 0 ? 'Drawed game.' : (results[player0] > 0 ? player0 : game.players[1]) +' wins.'
			));
		});
		match.run();
	});
	
// Start.
	APP.reset();
}); // require().
