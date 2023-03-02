import { Bet, Choose2Win, Predefined } from './games';
import { HeuristicPlayer, RandomPlayer } from './players';

export { Game } from './games';
export const games = {
  Bet,
  Choose2Win,
  Predefined,
};

export { Player } from './players';
export const players = {
  HeuristicPlayer,
  RandomPlayer,
};
