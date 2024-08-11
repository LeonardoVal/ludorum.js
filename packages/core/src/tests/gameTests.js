import { Game } from '../games/Game';
import { Match } from '../matches/Match';

export default function gameTestUtils({ expect }) {
  const MAX_PLIES = 200;
  return {
    /** Checks if a game state's actions comply with the Game's protocol.
     *
     * @param {Game} - Game to test.
     * @returns {number} Count of active players.
    */
    testActions(game) {
      const { meta } = game.constructor;
      const { actions, roles } = game;
      expect(typeof actions).toBe('object');
      expect(Object.keys(actions)).toEqual(roles);
      let activeCount = 0;
      roles.forEach((role) => {
        const roleActions = actions[role];
        expect(roleActions === null || Array.isArray(roleActions)).toBe(true);
        if (roleActions?.length > 0) {
          activeCount += 1;
          roleActions.forEach((action) => {
            const actionJSON = JSON.stringify(action);
            expect(JSON.parse(actionJSON)).toEqual(action);
          });
        }
      });
      if (activeCount > 1) {
        expect(meta.isSimultaneous).toBe(true);
      }
      return activeCount;
    }, // testActions

    /** Checks if a game state's actions comply with the Game's protocol.
     *
     * @param {Game} - Game to test.
     * @returns {boolean} True if the game has haps.
    */
    testHaps(game) {
      const { meta } = game.constructor;
      const { haps } = game;
      if (haps) {
        expect(meta.isDeterministic).toBe(false);
        Object.entries(haps).forEach(([, distribution]) => {
          expect(Array.isArray(distribution)).toBe(true);
          for (const entry of distribution) {
            expect(entry.length).toBe(2);
            expect(typeof entry[1]).toBe('number');
          }
        });
      }
      return !!haps;
    }, // testHaps

    /** Checks if this game state's actions comply with the Game's protocol.
     *
     * @param {Game} - Game to test.
     * @returns {number} Sum of the game's result or NaN is game is not finished.
    */
    testResult(game) {
      const { meta } = game.constructor;
      const { result, roles } = game;
      expect(typeof result).toBe('object');
      if (result) {
        let resultSum = 0;
        roles.forEach((role) => {
          const roleResult = result[role];
          expect(typeof roleResult).toBe('number');
          expect(roleResult).not.toBeNaN();
          resultSum += roleResult;
        });
        if (meta.isZeroSum) {
          expect(resultSum).toBeCloseTo(0);
        }
        return resultSum;
      }
      return NaN;
    }, // testResult

    /** Tests if this instance complies with the conditions for finished game
     * states.
     *
     * @param {Game} - Game to test.
     * @param {boolean} [args.isFinished]
    */
    testGame(game, isFinished) {
      const activeCount = this.testActions(game);
      this.testHaps(game);
      const resultSum = this.testResult(game);
      if (typeof isFinished === 'boolean') {
        expect(activeCount > 0).toBe(!isFinished);
        expect(Number.isNaN(resultSum)).toBe(!isFinished);
      }
    }, // testGame

    /** Tests if a match can be played from this game state onwards.
     *
     * @param {Game} - Game to test.
     * @param {Player[]} - Players to play the test match.
     * @returns {object[]} The match's history.
     */
    async testMatch(game, players) {
      const match = new Match({ game, players });
      for await (const step of match.steps()) {
        if (match.history.length < 1) {
          expect(step.start).toBeInstanceOf(game.constructor);
          game = step.start;
          // TODO Test players
          this.testGame(step.start, false);
        } else if (step.next) {
          expect(step.next).toBeInstanceOf(game.constructor);
          // TODO Test actions & haps.
          this.testGame(step.next, !!step.next.result);
          game = step.next;
        } else if (step.final) {
          expect(step.final).toBeInstanceOf(game.constructor);
          this.testGame(step.final, true);
          expect(step.result).toEqual(step.final.result);
        }
      }
      return match.history;
    }, // testMatch

    checkFinishedGameState(game, options) {
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
    }, // checkFinishedGameState

    checkRunningGameState(game, options) {
      const { actions, roles, aleatories } = game;
      if (actions) {
        expect(game.activeRoles).toBeOfType(Array);
        if (options && options.oneActivePlayerPerTurn) {
          expect(game.activeRoles.length).toBe(1);
        }
        if (game.activeRoles.length === 1) {
          expect(game.activeRole).toBe(game.activeRoles[0]);
        } else {
          expect(() => game.activeRole).toThrow();
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
    }, // checkRunningGameState

    checkGameState(game, options) {
      expect(game).toBeOfType(Game);
      if (game.isFinished) {
        this.checkFinishedGameState(game, options);
        return true;
      }
      const { random } = options;
      this.checkRunningGameState(game, options);
      return false;
    }, // checkGameState

    randomFlow(game, random = Randomness.DEFAULT) {
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
    }, // randomFlow

    checkGameFlow(game, options) {
      const {
        random = Randomness.DEFAULT,
        update = false,
      } = options;
      const maxPlies = options?.maxPlies || MAX_PLIES;
      let i = 0;
      for (; i < MAX_PLIES; i += 1) {
        const isFinished = this.checkGameState(game, options);
        if (isFinished) {
          break;
        }
        const { decisions, haps } = this.randomFlow(game, random);
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
    } // checkGameFlow
  };
}; // function gameTestUtils
