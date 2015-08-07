var APP = {};

require.config({
	paths: {
		'creatartis-base': '../../lib/creatartis-base',
		sermat: '../../lib/sermat-umd',
		ludorum: '../../lib/ludorum'
	}
});
require(['ludorum', 'creatartis-base'], function (ludorum, base) {
	APP.imports = { base: base, ludorum: ludorum };
	APP.elements = {
		selectUppercase: document.getElementById('playerUppercase'),
		selectLowercase: document.getElementById('playerLowercase'),
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
		{title: "MonteCarlo (50 sims)", builder: function () {
			return new ludorum.players.MonteCarloPlayer({ simulationCount: 50 });
		}, runOnWorker: true },
		{title: "MonteCarlo (100 sims)", builder: function () {
			return new ludorum.players.MonteCarloPlayer({ simulationCount: 100 });
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
		APP.elements.selectUppercase.innerHTML += html;
		APP.elements.selectLowercase.innerHTML += html;
	});
	APP.elements.selectUppercase.onchange = 
	APP.elements.selectLowercase.onchange = function () {
		var i = this === APP.elements.selectUppercase ? 0 : 1,
			option = PLAYER_OPTIONS[+this.value];
		(option.runOnWorker
			? ludorum.players.WebWorkerPlayer.create({ playerBuilder: option.builder })
			: base.Future.when(option.builder())
		).then(function (player) {
			APP.players[i] = player;
			APP.reset();
		});
	};

// Buttons. ////////////////////////////////////////////////////////////////////
	APP.elements.buttonReset.onclick = APP.reset = function reset() {
		var match = new ludorum.Match(new ludorum.games.Bahab(), APP.players);
		APP.ui = new ludorum.players.UserInterface.BasicHTMLInterface({ match: match, container: 'board' });
		match.events.on('begin', function (game) {
			APP.elements.footer.innerHTML = base.Text.escapeXML("Turn "+ game.activePlayer() +".");
		});
		match.events.on('next', function (game, next) {
			APP.elements.footer.innerHTML = base.Text.escapeXML("Turn "+ next.activePlayer() +".");
		});
		match.events.on('end', function (game, results) {
			APP.elements.footer.innerHTML = base.Text.escapeXML(results['Uppercase'] === 0 ? 'Drawed game.'
				: (results['Uppercase'] > 0 ? 'Uppercase' : 'Lowercase') +' wins.');
		});
		match.run();
	};
	
// Start.
	APP.reset();
}); // require().
