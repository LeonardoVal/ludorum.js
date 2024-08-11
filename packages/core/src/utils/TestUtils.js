import { Game, Match } from "../games";
import { Player } from "../players";

/** Utilities for making unit tests.
 */
export class TestUtils {
  /** The constructor expects the `expect` function from a unit test framework
   * like Vitest.
   * 
   * @param {object} args
   * @param {function} args.expect
  */
  constructor(args) {
    this.expect = args.expect;
  }

// Game tests __________________________________________________________________

// Player tests ________________________________________________________________

  /** Check if a player instance works correctly with a given game.
   * 
   * @param {object} args
   * @param {Player} args.player - Player to be tested.
   * @param {Game} args.game - Game to test the player with.
   * @return {Record<string, Player>} - The participants in the match.
  */
  async checkPlayer({ player, game }) {
    this.expect(player).toBeInstanceOf(Player);
    this.expect(game).toBeInstanceOf(Game);
    let players = new Array(game.roles.length).fill(player);
    let currentGame = game;
    for await (const step of Match.steps({ game, players })) {
      if (step.players) {
        players = step.players; // For returning at the end.
      } else {
        for (const [role, roleAction] of Object.entries(step.actions ?? {})) {
          this.expect(currentGame.actions[role]).toContain(roleAction);
        }
      }
      currentGame = step.start ?? step.next;
    }
    return players;
  }
} // class TestUtils
