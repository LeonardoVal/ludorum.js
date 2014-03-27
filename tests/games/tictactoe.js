var APP = {};

require.config({
	paths: {
		basis: "../../lib/basis", 
		ludorum: "../../build/ludorum"
	}
});
require(['basis', 'ludorum'], function (basis, ludorum) {
	APP.imports = {basis: basis, ludorum: ludorum};
	APP.elements = {
		selectXs: document.getElementById('playerXs'),
		selectOs: document.getElementById('playerOs'),
		buttonReset: document.getElementById('reset'),
		footer: document.getElementsByTagName('footer')[0]
	};

// Player options. /////////////////////////////////////////////////////////////
	var PLAYER_OPTIONS = APP.PLAYER_OPTIONS = [
		{title: "You", builder: function () { 
			return new ludorum.players.UserInterfacePlayer(); 
		}, runOnWorker: false },
		{title: "Random", builder: function () { 
			return new ludorum.players.RandomPlayer();
		}, runOnWorker: false },
		{title: "MonteCarlo (20 sims)", builder: function () {
			return new ludorum.players.MonteCarloPlayer({ simulationCount: 20 });
		}, runOnWorker: true },
		{title: "MonteCarlo (80 sims)", builder: function () {
			return new ludorum.players.MonteCarloPlayer({ simulationCount: 80 });
		}, runOnWorker: true },
		{title: "MiniMax AlfaBeta (4 plies)", builder: function () {
			return new ludorum.players.AlphaBetaPlayer({ horizon: 4 });
		}, runOnWorker: true },
		{title: "MiniMax AlfaBeta (6 plies)", builder: function () {
			return new ludorum.players.AlphaBetaPlayer({ horizon: 6 });
		}, runOnWorker: true },
		{title: "MaxN (6 plies)", builder: function () {
			return new ludorum.players.MaxNPlayer({ horizon: 6 });
		}, runOnWorker: true },
	];
	APP.players = [PLAYER_OPTIONS[0].builder(), PLAYER_OPTIONS[0].builder()];
	PLAYER_OPTIONS.forEach(function (option, i) {
		var html = '<option value="'+ i +'">'+ option.title +'</option>';
		APP.elements.selectXs.innerHTML += html;
		APP.elements.selectOs.innerHTML += html;
	});
	APP.elements.selectXs.onchange = 
	APP.elements.selectOs.onchange = function () {
		var i = this === APP.elements.selectXs ? 0 : 1,
			option = PLAYER_OPTIONS[+this.value];
		(option.runOnWorker
			? ludorum.players.WebWorkerPlayer.create({ playerBuilder: option.builder })
			: basis.Future.when(option.builder())
		).then(function (player) {
			APP.players[i] = player;
			APP.reset();
		});
	};

// Buttons. ////////////////////////////////////////////////////////////////////
	APP.elements.buttonReset.onclick = APP.reset = function reset() {
		var match = new ludorum.Match(new ludorum.games.TicTacToe(), APP.players);
		APP.ui = new ludorum.players.UserInterface.BasicHTMLInterface({ match: match, container: 'board' });
		match.events.on('begin', function (game) {
			APP.elements.footer.innerHTML = basis.Text.escapeXML("Turn "+ game.activePlayer() +".");
		});
		match.events.on('next', function (game, next) {
			APP.elements.footer.innerHTML = basis.Text.escapeXML("Turn "+ next.activePlayer() +".");
		});
		match.events.on('end', function (game, results) {
			APP.elements.footer.innerHTML = basis.Text.escapeXML(results['Xs'] === 0 ? 'Drawed game.'
				: (results['Xs'] > 0 ? 'Xs' : 'Os') +' wins.');
		});
		match.run();
	};
	
// Start.
	APP.reset();
}); // require().
