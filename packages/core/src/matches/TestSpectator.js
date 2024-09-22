import { Game, Match } from "../games";
import { Player, RandomPlayer } from "../players";
import { Spectator } from "./Spectator";

/** An spectator that performs unit tests on a game implementation while it is
 * played.
 * 
 * @class
 */
export class TestSpectator extends Spectator {
  constructor(args) {
    super(args);
    this.__props({
      expect: args.expect,
      maxPlies: args.maxPlies ?? 200,
    });
  }

  /** @inheritdoc */
  matchBegin(args) {
    const { expect } = this;
    const { start, players } = args;
    this.checkGame(start);
    this.checkArray(start.roles, (role) => {
      expect(typeof role).toBe('string');
    });
    this.checkObject(players, start.roles, (player) => {
      expect(player).toBeInstanceOf(Player);
    });
  }

  /** @inheritdoc */
  matchStep(args) {
    const { actions, haps, next, previous } = args;
    this.checkGame(next);
    this.checkActions(previous, actions)
    this.checkHaps(previous, haps);
  }

  /** @inheritdoc */
  matchEnd(args) {
    const { expect } = this;
    const { final, result } = args;
    this.checkGame(final);
    expect(final.result).toEqual(result);
  }

// Checks ______________________________________________________________________

  /** Checks if `array` is really an `Array` and calls `eachValue` for each
   * value.
   * 
   * @param {any} array
   * @param {function} eachValue
  */
  checkArray(array, eachValue) {
    const { expect } = this;
    expect(Array.isArray(array)).toBe(true);
    array.forEach(eachValue);
  }

  /** Checks if `obj` is an object (and not null), if `obj`'s keys are the
   * same as `keys` (if given) and calls `eachValue` for each key-value pair
   * (if given).
   * 
   * @param {any} obj
   * @param {string[] | null} [key=null]
   * @param {function | null} [eachValue=null]
  */
  checkObject(obj, keys, eachValue = null) {
    const { expect } = this;
    expect(obj).toBeTypeOf('object');
    expect(obj).not.toBe(null);
    if (keys) {
      expect(Object.keys(obj).sort()).toEqual([...keys].sort());
    }
    if (eachValue) {
      Object.entries(obj).forEach(([key, value]) => eachValue(value, key));
    }
  }

  /** TODO */
  checkGame(game) {
    const { expect } = this;
    expect(game).toBeInstanceOf(Game);
    expect(game.isFinished).toBeTypeOf('boolean');
    if (game.isFinished) {
      expect(game.actions).toBe(null);
      expect(game.haps).toBe(null);
      this.checkResult(game);
    } else {
      expect(game.result).toBe(null);
      this.checkGameActions(game);
      this.checkGameHaps(game);
    }
  }

  /** TODO */
  checkGameActions(game) {
    const { expect } = this;
    const { actions, haps, roles, constructor: gameClass } = game;
    let activeCount = 0;
    if (actions) {
      this.checkObject(actions, null, (roleActions, role) => {
        expect(roles).toContain(role);
        if (roleActions) {
          activeCount += 1;
          this.checkArray(roleActions, (roleAction) => {
            const roleActionJSON = JSON.stringify(roleAction);
            expect(JSON.parse(roleActionJSON)).toEqual(roleAction);
          });
        }
      });
      expect(activeCount > 1).toBe(gameClass.isSimultaneous);
      if (!gameClass.isSimultaneous) {
        expect(game.activeRoles).toEqual([game.activeRole]);
      } else if (activeCount > 1) {
        expect(() => game.activeRole).toThrow();
      }
    } else {
      expect(actions).toBeNull();
      expect(haps).toBeTruthy();
    }
    return activeCount;
  }

  /** TODO */
  checkGameHaps(game) {
    const { expect } = this;
    const { actions, haps, constructor: gameClass } = game;
    if (haps) {
      expect(gameClass.isDeterministic).toBe(false);
      this.checkObject(haps, null, (hapDistribution) => {
        let probabilitySum = 0;
        this.checkArray(hapDistribution, (hapCase) => {
          expect(hapCase.length).toBe(2);
          const hapProbability = hapCase[1];
          expect(hapProbability).toBeTypeOf('number');
          expect(hapProbability).toBeGreaterThanOrEqual(0);
          expect(hapProbability).toBeLessThanOrEqual(1);
          probabilitySum += hapProbability;
        });
        expect(probabilitySum).toBeCloseTo(1);
      });
      return Object.keys(haps).length;
    } else {
      expect(haps).toBeNull();
      expect(actions).toBeTruthy();
    }
    return 0;
  }

  /** TODO */
  checkResult(game) {
    const { expect } = this;
    const { result, roles, constructor: gameClass } = game;
    let resultSum = 0;
    this.checkObject(result, roles, (roleResult) => {
      expect(roleResult).toBeTypeOf('number');
      expect(roleResult).toBeGreaterThanOrEqual(gameClass.resultRange[0]);
      expect(roleResult).toBeLessThanOrEqual(gameClass.resultRange[1]);
      resultSum += roleResult;
    });
    if (gameClass.isZeroSum) {
      expect(resultSum).toBeCloseTo(0);
    }
    return resultSum;
  }

  /** TODO */
  checkActions(game, actions) {
    const { expect } = this;
    const { actions: gameActions } = game;
    if (actions) {
      expect(gameActions).toBeTruthy();
      this.checkObject(gameActions, null, (roleActions, role) => {
        const roleChoice = actions[role];
        expect(roleChoice).toBeDefined();
        expect(roleActions).toContain(roleChoice);  
      });
    } else {
      expect(gameActions).toBeNull();
    }
  }

  /** TODO */
  checkHaps(game, haps) {
    const { expect } = this;
    const { haps: gameHaps } = game;
    if (haps) {
      this.checkObject(gameHaps, null, (hapDistribution, hapName) => {
        const hapValue = haps[hapName];
        expect(hapValue).toBeDefined();
        expect(hapDistribution.map(([value,]) => value)).toContain(hapValue);
      });
    } else {
      expect(gameHaps).toBeNull();
    }
  }

// Utilities ___________________________________________________________________

  /** TODO */
  async testGame(args) {
    const { game, matchCount = 10, onMatchPlayed } = args;
    this.expect(game).toBeInstanceOf(Game);
    const players = game.roles.reduce((obj, role, i) => {
      const player = args.players?.[role] ?? args.players?.[i] ?? args.player
        ?? new RandomPlayer();
      this.expect(player).toBeInstanceOf(Player);
      obj[role] = player;
      return obj;
    }, {});
    for (let i = 0; i < matchCount; i += 1) {
      const match = new Match({ game, players, spectators: [this] });
      const result = await match.playthrough();
      onMatchPlayed?.({ match, result });
    }
  }

  /** TODO */
  static async testGame(args) {
    const { expect, ...otherArgs } = args;
    return new this({ expect }).testGame(otherArgs);
  }

} // class TestSpectator
