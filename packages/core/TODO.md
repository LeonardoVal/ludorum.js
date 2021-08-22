# Pending for [ludorum](https://github.com/LeonardoVal/ludorum.js).

## Refactors

@ludorum/core: 
  Match, Game, Choose2Win, PredefinedGame,
  Contigent, Aleatory, ~DieAleatory~,
  Player, RandomPlayer, TracePlayer, UserInterfacePlayer, WebWorkerPlayer, HeuristicPlayer
@ludorum/player-minimax:
  MiniMaxPlayer, AlphaBetaPlayer, MaxNPlayer,
@ludorum/player-montecarlo:
  MonteCarloPlayer, UCTPlayer, GameTree,
@ludorum/game-utils:
  Checkerboard, CheckerboardFromString, CheckerboardFromPieces,
  ConnectionGame,
@ludorum/game-pack:
  Bahab, Mutropas, OddsAndEvens, Pig, Puzzle15, TicTacToe, ToadsAndFrogs,
@ludorum/tournaments:
  Tournament, RoundRobin, Measurement, Elimination,

## Game

.players = [string]
.actions = { [string]: [...any], [string]: Aleatory }
.result = { [string]: number }
.next(actions: { [string]: any }) = Game
.update(actions: { [string]: any }) = this:Game

Aleatory[Symbol.iterator] -> { value, probability }

---

## Matches

+ Match commands for the players to control the match.

## Tournaments

+ Add `TugOfWar` tournament.

## Aleatories

+ Make `Aleatory` representation of card decks and bags.

## Utils

+ Loop methods in `Checkerboard` (coordinates and squares) like `filter`, `map` and `forEach`.
+ More methods in `Checkerboard` for altering the board (rotate, transpose, etc).
