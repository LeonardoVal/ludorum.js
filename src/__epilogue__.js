﻿// See __prologue__.js
	[Match,
	// Games.
		games.Bahab, games.Choose2Win, games.ConnectionGame, games.Mutropas, games.OddsAndEvens,
			games.Pig, games.Predefined, games.TicTacToe, games.ToadsAndFrogs, games.Puzzle15,
	// Players.
		Player, players.AlphaBetaPlayer, players.MaxNPlayer, players.MiniMaxPlayer,
			players.MonteCarloPlayer, players.RandomPlayer, players.TracePlayer, players.UCTPlayer,
	// Tournaments.
		Tournament, tournaments.Elimination, tournaments.Measurement, tournaments.RoundRobin,
	// Aleatories.
		aleatories.Aleatory, aleatories.DieAleatory,
	// Utilities.
		utils.CheckerboardFromString
	].forEach(function (type) {
		type.__SERMAT__.identifier = exports.__package__ +'.'+ type.__SERMAT__.identifier;
		exports.__SERMAT__.include.push(type);
	});
	Sermat.include(exports); // Ludorum uses Sermat internally.

	return exports;
}
