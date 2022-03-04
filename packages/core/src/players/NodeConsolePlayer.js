import Player from './Player';
import Match from '../Match';
import RandomPlayer from './RandomPlayer';

const bold = (x) => `\x1b[1m${x}\x1b[0m`;
const boldBlue = (x) => `\x1b[1;94m${x}\x1b[0m`;
const boldRed = (x) => `\x1b[1;91m${x}\x1b[0m`;

const completer = (choices, line) => [
  choices ? [...choices.keys()].filter((key) => key.startsWith(line)) : [],
  line,
];

/** Player that uses the console in the NodeJS environment. Meant mostly for
 * testing.
 *
 * @class
*/
class NodeConsolePlayer extends Player {
  /** @inheritdoc */
  static get name() {
    return 'NodeConsolePlayer';
  }

  /** The constructor takes the following arguments.
   *
   * @param {object} args - Argument object.
   * @param {function} [actionString] - A callback that returns a string for a
   *   game's action, with the signature `(action, game, role)`.
   * @param {function} [hapString] - A callback that returns a string for a
   *   game's hap (aleatory value), with the signature `(value, aleatory, game,
   *   role)`.
   * @param {function} [gameString] - A callback that returns a string for a
   *   game, with the signature `(game, role)`.
   * @param {object} readline - The NodeJS's standards `readline` module.
  */
  constructor(args) {
    const {
      actionString, hapString, gameString, readline,
    } = args || {};
    super(args);
    if (typeof readline?.createInterface !== 'function') {
      throw new TypeError('Cannot create interface from provided `readline` argument!');
    }
    const readLineInterface = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      completer: (line) => completer(this.choices, line),
    });
    const defaultStringFunction = (x) => `${x}`;
    this
      ._prop('actionString', actionString, 'function', defaultStringFunction)
      ._prop('hapString', hapString, 'function', defaultStringFunction)
      ._prop('gameString', gameString, 'function', defaultStringFunction)
      ._prop('readLineInterface', readLineInterface);
  }

  /** Builds an spectator object compatible with Match.
   *
   * @param {string} role
   * @returns {object}
  */
  spectator(role) {
    const { readLineInterface } = this;
    const write = (text) => process.stdout.write(text);
    const showGame = (game) => {
      const gameString = this.gameString(game, role);
      readLineInterface.write(`${gameString}\n`);
    };
    const actionString = (...args) => this.actionString(...args);
    const hapString = (...args) => this.hapString(...args);
    return {
      begin(game, players) {
        const opponents = Object.entries(players)
          .filter(([r]) => r !== role)
          .map(([r, p]) => `${bold(p.name)} (${p.constructor.name}) as ${bold(r)}`);
        write(`You are playing a match of ${bold(game.name)} as ${
          bold(role)} against ${opponents.join(', ')}.\n`);
        showGame(game);
      },
      next(_gameBefore, _actions, _haps, gameAfter) {
        if (_actions) {
          Object.entries(_actions).forEach(([r, a]) => write(
            `- ${bold(r)} played ${actionString(a, _gameBefore, r)}.\n`,
          ));
        }
        if (_haps) {
          Object.entries(_haps).forEach(([a, v]) => write(
            `- ${bold(a)} happened as ${hapString(v, a, _gameBefore, role)}.\n`,
          ));
        }
        showGame(gameAfter);
      },
      end(_game, results) {
        const roleResult = results[role];
        const status = roleResult > 0 ? boldBlue('win')
          : roleResult < 0 ? boldRed('lose') : bold('tied');
        write(`Match ${bold('finished')}. You ${status} (${roleResult}).\n`);
      },
    };
  }

  /** @inheritdoc */
  participate(match, role) {
    match.spectate(this.spectator(role));
    return this;
  }

  /** @inheritdoc */
  async decision(game, role) {
    this.choices = new Map(
      this.actionsFor(game, role)
        .map((action) => [this.actionString(action), action]),
    );
    const { readLineInterface } = this;
    return new Promise((resolve, reject) => {
      readLineInterface.question(`${bold(role)}> `, (answer) => {
        const action = answer.trim().length === 0
          ? this.random.choice([...this.choices.values()])
          : this.choices.get(answer);
        if (action === undefined) {
          reject(new Error(`Unknown action "${answer}"!`));
        } else {
          resolve(action);
        }
      });
    });
  }

  // Utility functions /////////////////////////////////////////////////////////

  /** Shortcut for creating a match for a game with this player in the given
   * role.
   *
   * @param {Game} game - The game to play.
   * @param {string} role - The role for this player.
   * @param {function} playerBuilder - Builds an opponent `Player`.
   * @returns {object[]} - The complete result of the match.
  */
  async playAgainst(game, role, playerBuilder) {
    const players = game.roles.map(
      (r) => (r === role ? this : playerBuilder(r)),
    );
    const match = new Match({ game, players });
    return match.complete();
  }

  /** Shortcut for creating a match for a game with this player in the given
   * role, against random players.
   *
   * @param {Game} game - The game to play.
   * @param {string} role - The role for this player.
   * @returns {object[]} - The complete result of the match.
  */
  async playAgainstRandoms(game, role) {
    return this.playAgainst(game, role, () => new RandomPlayer());
  }
} // class NodeConsolePlayer

export default NodeConsolePlayer;
