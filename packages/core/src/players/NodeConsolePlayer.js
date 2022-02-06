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
      ._prop('hapString', actionString, 'function', defaultStringFunction)
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
    const write = (...args) => readLineInterface.write(...args);
    const showGame = (game) => {
      const gameString = this.gameString(game, role);
      readLineInterface.write(`${gameString}\n`);
    };
    const actionString = (...args) => this.actionString(...args);
    const hapString = (...args) => this.hapString(...args);
    return {
      begin(game) {
        write(`You are playing a match of ${bold(game.name)} as ${bold(role)}.\n`);
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
        const action = this.choices.get(answer);
        if (!action) {
          reject(new Error(`Unknown action "${answer}"!`));
        } else {
          resolve(action);
        }
      });
    });
  }

  // Utility functions /////////////////////////////////////////////////////////

  async playAgainstRandoms(game, role) {
    const players = game.roles.map(
      (r) => (r === role ? this : new RandomPlayer()),
    );
    const match = new Match({ game, players });
    return match.complete();
  }
} // class NodeConsolePlayer

export default NodeConsolePlayer;
