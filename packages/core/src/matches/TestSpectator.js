import { Game, Match } from "../games";
import { Player, RandomPlayer } from "../players";
import { defProps } from "../utils";
import { Spectator } from "./Spectator";

/** TODO
 * 
 * @class
 */
export class TestSpectator extends Spectator {
  constructor(args) {
    super(args);
    defProps(this, {
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

  /** TODO */
  checkArray(array, eachValue) {
    const { expect } = this;
    expect(Array.isArray(array)).toBe(true);
    array.forEach(eachValue);
  }

  /** TODO */
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
    const { actions, roles, constructor: gameClass } = game;
    let activeCount = 0;
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
    if (activeCount > 1) {
      expect(gameClass.isSimultaneous).toBe(true);
    }
    return activeCount;
  }

  /** TODO */
  checkGameHaps(game) {
    const { expect } = this;
    const { haps, constructor: gameClass } = game;
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
    // TODO Check normalizedResult & scores
    return resultSum;
  }

  /** TODO */
  checkActions(game, actions) {
    const { expect } = this;
    const { actions: gameActions } = game;
    this.checkObject(gameActions, null, (roleActions, role) => {
      const roleChoice = actions[role];
      expect(roleChoice).toBeDefined();
      expect(roleActions).toContain(roleChoice);
    });
  }

  /** TODO */
  checkHaps(game, haps) {
    const { expect } = this;
    const { haps: gameHaps } = game;
    if (!haps) {
      expect(gameHaps).toBeFalsy();
    } else {
      this.checkObject(gameHaps, null, (hapDistribution, hapName) => {
        const hapValue = haps[hapName];
        expect(hapValue).toBeDefined();
        expect(hapDistribution.map(([value,]) => value)).toContain(hapValue);
      });
    }
  }

// Utilities ___________________________________________________________________

  /** TODO */
  async testGame(args) {
    const { game, matchCount = 10 } = args;
    const players = args.players ?? new Array(game.roles.length).fill(0)
      .map(() => new RandomPlayer());
    for (let i = 0; i < matchCount; i += 1) {
      const match = new Match({ game, players, spectators: [this] });
      await match.playthrough();
    }
  }

  /** TODO */
  static async testGame(args) {
    const { expect, ...otherArgs } = args;
    await new this({ expect }).testGame(otherArgs);
  }

} // class TestSpectator
