import { defProps } from '../utils';
import { randomWeightedChoice } from '../randomness';
import { Player } from '../players/Player';
import { Spectator } from './Spectator';

/** TODO
 * 
 * @class
 */
export class Match {
  /** TODO
   * 
   * @param {object} args
   * @param {Game} args.game
   * @param {Player[] | Record<string, Player>} args.players
   * @param {() => number} args.rng
   * @param {Spectator[]} [args.spectators=[]]
  */
  constructor(args) {
    const { game, rng } = args;
    const players = Player.participants(game, args.players);
    defProps(this, {
      history: [{ start: game, players }],
      players,
      rng: rng ?? Math.random,
      spectators: args.spectators ?? [],
    });
  }

  /** Calculates at random one of the possible `haps` objects that can be used
   * with a `Game`'s `perform` or `next` methods.
   *
   * @param {Game} game
   * @param {function} rng
   * @return {Record<string, unknown>} - Random haps object.
  */
  static randomHaps(game, rng = Math.random) {
    const { haps } = game;
    return haps && Object.entries(haps).reduce((r, [k, d]) => {
      r[k] = randomWeightedChoice(rng, d);
      return r;
    }, {});
  }

  randomHaps(game) {
    return this.constructor.randomHaps(game, this.rng);
  }

  /** Conducts a match of this game played by the given players. Each step an
   * object is yielded:
   *
   * + First an object with the `start` game state and the participating
   *   `players`.
   *
   * + After that objects with the `actions` taken by the players, random `haps`
   *   and the resulting `next` game state.
   *
   * + In the end the `final` game state and its corresponding `result`.
   *
   * @yields {object}
   */
  async* steps() {
    let step = this.history.at(-1);
    Spectator.broadcast(this, 'matchBegin', step);
    yield step;
    let game = step.start ?? step.next;
    let { result } = game;
    while (!result) {
      const actions = await Player.decisions(game, this.players);
      const haps = this.randomHaps(game);
      game = game.next(actions, haps);
      step = { actions, haps, next: game };
      this.history.push(step);
      Spectator.broadcast(this, 'matchStep', step);
      yield step;
      result = game.result;
    }
    Spectator.broadcast(this, 'matchEnd', { final: game, result });
  }

  static async* steps(args) {
    const match = new this(args);
    yield* match.steps();
  }

  /** Plays a match until the end and returns the result.
   *
   * @returns {Record<string, number>}
  */
  async playthrough() {
    let game;
    for await (const step of this.steps()) {
      game = step.next ?? step.start;
    }
    if (game?.isFinished) {
      return game.result;
    }
    throw new Error(`Unexpected match ending without result for ${
      this.constructor.name}!`);
  }
 
} // class Match
