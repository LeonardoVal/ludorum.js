import { Bet, Choose2Win, Predefined } from './games';
import {
  HeuristicPlayer, RandomPlayer, TracePlayer, UserInterfacePlayer,
} from './players';
import { RoundRobinTournament } from './tournaments';

export {
  DebugSpectator, Match, Spectator,
} from './matches';

export { Game, GameTree } from './games';

export const games = {
  Bet, Choose2Win, Predefined,
};

export {
  Player,
} from './players';

export const players = {
  HeuristicPlayer, RandomPlayer, TracePlayer, UserInterfacePlayer,
};

export { Tournament } from './tournaments';

export const tournaments = {
  RoundRobinTournament,
};

export * as randomness from './randomness';
export * as utils from './utils';
