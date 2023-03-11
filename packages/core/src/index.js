import {
  Bet,
  Choose2Win,
  Predefined,
} from './games';
import {
  HeuristicPlayer,
  RandomPlayer,
  TracePlayer,
} from './players';

export {
  Game,
  GameTree,
} from './games';
export const games = {
  Bet,
  Choose2Win,
  Predefined,
};

export { Player } from './players';
export const players = {
  HeuristicPlayer,
  RandomPlayer,
  TracePlayer,
};
