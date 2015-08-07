// See __prologue__.js
	exports.__SERMAT__.include.push(
		Match,
		games.Bahab, games.Choose2Win, games.ConnectionGame, games.Mutropas, games.OddsAndEvens,
			games.Pig, games.Predefined, games.TicTacToe, games.ToadsAndFrogs,
		utils.CheckerboardFromString
	);
	Sermat.include(exports); //FIXME?

	return exports;
});