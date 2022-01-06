import Randomness from '@creatartis/randomness/Randomness';
import Aleatory from '../aleatories/Aleatory';
import Game from './Game';

export const checkFinishedGameState = (expect, game, options) => {
  const { result, roles } = game;
  expect(result).toBeTruthy();
  const resultSum = roles.reduce(
    (sum, role) => {
      expect(result[role]).toBeOfType('number');
      return sum + result[role];
    },
    0,
  );
  if (options && options.zeroSum) {
    expect(resultSum).toBeCloseTo(0);
  }
};

export const checkRunningGameState = (expect, game, options) => {
  const { actions, roles, aleatories } = game;
  if (actions) {
    expect(game.activeRoles).toBeOfType(Array);
    if (options && options.oneActivePlayerPerTurn) {
      expect(game.activeRoles.length).toBe(1);
    }
    if (game.activeRoles.length === 1) {
      expect(game.activeRole).toBe(game.activeRoles[0]);
    } else {
      expect(game.activeRole.bind(game)).toThrow();
    }
    game.activeRoles.forEach((activeRole) => {
      expect(game.isActive(activeRole)).toBe(true);
      expect(actions[activeRole]).toBeOfType(Array);
      expect(actions[activeRole].length).toBeGreaterThan(0);
    });
    Object.entries(actions).forEach(([role, roleActions]) => {
      expect(roles.includes(role)).toBeTruthy();
      expect(roleActions[Symbol.iterator]).toBeDefined();
    });
  }
  if (options.deterministic) {
    expect(aleatories).toBeFalsy();
  } else if (aleatories) {
    Object.entries(aleatories).forEach(([key, aleatory]) => {
      expect(aleatory).toBeOfType(Aleatory);
    });
  }
};

export const checkGameState = (expect, game, options) => {
  expect(game).toBeOfType(Game);
  if (game.isFinished) {
    checkFinishedGameState(expect, game, options);
    return true;
  }
  const { random } = options;
  // TODO Check Sermat serialization
  checkRunningGameState(expect, game, options);
  return false;
};

export const randomFlow = (game, random = Randomness.DEFAULT) => {
  const { actions, aleatories } = game;
  const decisions = actions && Object.fromEntries(
    Object.entries(actions).map(([role, roleActions]) => {
      const randomAction = random.choice(roleActions);
      return [role, randomAction];
    }),
  );
  const haps = aleatories && Object.fromEntries(
    Object.entries(aleatories).map(([key, aleatory]) => {
      const randomValue = aleatory.randomValue(random);
      return [key, randomValue];
    }),
  );
  return { decisions, haps };
};

const MAX_PLIES = 200;

export const checkGameFlow = (expect, game, options) => {
  const {
    random = Randomness.DEFAULT,
    update = false,
  } = options;
  const maxPlies = options?.maxPlies || MAX_PLIES;
  let i = 0;
  for (; i < MAX_PLIES; i += 1) {
    const isFinished = checkGameState(expect, game, options);
    if (isFinished) {
      break;
    }
    const { decisions, haps } = randomFlow(game, random);
    if (update) {
      game.perform(decisions, haps);
    } else {
      game = game.next(decisions, haps);
    }
  }
  if (i >= maxPlies) {
    throw new Error(`Match of game ${game.name} did not end after ${
      maxPlies} plies (final state: ${game})!`);
  }
};

export default {
  checkFinishedGameState,
  checkGameFlow,
  checkGameState,
  checkRunningGameState,
};
