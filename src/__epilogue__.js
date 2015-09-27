// See __prologue__.js
	[Match,
		games.Bahab, games.Choose2Win, games.ConnectionGame, games.Mutropas, games.OddsAndEvens,
			games.Pig, games.Predefined, games.TicTacToe, games.ToadsAndFrogs,
		aleatories.Aleatory, aleatories.UniformAleatory,
		utils.CheckerboardFromString
	].forEach(function (type) {
		type.__SERMAT__.identifier = exports.__package__ +'.'+ type.__SERMAT__.identifier;
		exports.__SERMAT__.include.push(type);
	});
	Sermat.include(exports); // Ludorum uses Sermat internally.

	return exports;
});