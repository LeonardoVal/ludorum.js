/* global process */
import { BaseClass } from './BaseClass';
import { randomChoice } from '../randomness';
import { UserInterfacePlayer } from '../players/UserInterfacePlayer';
import { Spectator } from '../matches/Spectator';

const ansiColors = {
  blue: 94,
  red: 91,
}

export function ansiBold(x, color = null) {
  if (color) {
    const ansiColor = ansiColors[color] ?? +color;
    return `\x1b[1;${ansiColor}m${x}\x1b[0m`
  }
  return `\x1b[1m${x}\x1b[0m`;
}

/** Player that uses the console in the NodeJS environment. Meant mostly for
 * testing.
 *
 * @class
*/
export class NodeConsoleInterface extends BaseClass {
  /** The constructor takes the following arguments.
   *
   * @param {object} args
  */
  constructor(args) {
    super();
    this.__props({
      choices: new Map(),
      renderAction: args.renderAction,
      renderHaps: args.renderHaps,
      renderGame: args.renderGame,
      rng: args.rng ?? Math.random,
    })
  }

  /** TODO */
  async init(readline) {
    const readLineInterface = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      completer: (line) => {
        const choices = [...this.choices.keys()]
          .filter((key) => key.startsWith(line));
        return [choices, line];
      },
    });
    this.__props({ readLineInterface });
  }

// Rendering ___________________________________________________________________

  /** TODO */
  renderAction(action, _game, _role) {
    return JSON.stringify(action);
  }

  /** TODO */
  renderHaps(haps, _game) {
    return `${ansiBold('Nature')} happened as ${JSON.stringify(haps)}`;
  }

  /** TODO */
  renderGame(game, _role) {
    return `${game}`;
  }

  /** TODO */
  renderList(texts) {
    return texts.length < 2 ? texts.join('')
      : `${texts.slice(0, -1).join(', ')} and ${texts.at(-1)}`;
  }

  /** TODO */
  renderBegin({ start: game, players }) {
    const playerStrings = Object.entries(players).map(([r, p]) => (
      `${ansiBold(p.name)} (${p.constructor.name}) as ${ansiBold(r)}`
    ));
    process.stdout.write(`Match of ${ansiBold(game.name)} is played by ${
      this.renderList(playerStrings)}.\n`);
    this.readLineInterface.write(`${this.renderGame(game)}\n`);
  }

  /** TODO */
  renderChoices(game, role, player) {
    const { choices } = this;
    choices.clear();
    for (const action of game.actions[role]) {
      choices.set(this.renderAction(action, game, role), action);
    }
    this.readLineInterface.question(`${ansiBold(role)}> `, (answer) => {
      const action = answer.trim().length === 0
        ? randomChoice(this.rng, [...choices.values()])
        : choices.get(answer);
      if (action === undefined) {
        player.fail(`Unknown action "${answer}"!`);
      } else {
        player.choose(action);
      }
    });
  }

  /** TODO */
  renderStep({ actions, haps, next: game }) {
    const write = (text) => process.stdout.write(text);
    if (actions) {
      Object.entries(actions).forEach(([r, a]) => write(
        `- ${ansiBold(r)} played ${this.renderAction(a, game, r)}.\n`,
      ));
    }
    if (haps) { 
      write(`- ${this.renderHaps(haps, game)}.\n`);
    }
    this.readLineInterface.write(`${this.renderGame(game)}\n`);
  }

  /** TODO */
  renderEnd({ result }) {
    const finishText = this.renderList(
      Object.entries(result).map(([role, roleResult]) => {
        const status = roleResult > 0 ? ansiBold('wins', 'blue')
          : roleResult < 0 ? ansiBold('loses', 'red') : ansiBold('tied');
        return `${role} ${status}`;
      }),
    );
    process.stdout.write(`Match ${ansiBold('finished')}: ${finishText}.\n`);
  }

  /** TODO 
   * 
  */
  async player() {
    return new UserInterfacePlayer({
      onDecision: ({ player, game, role }) => {
        this.renderChoices(game, role, player);
      },
    });
  }

  /** TODO */
  spectator() {
    return new Spectator({
      matchBegin: (args) => this.renderBegin(args),
      matchStep: (args) => this.renderStep(args),
      matchEnd: (args) => this.renderEnd(args),
    });
  }

} // class NodeConsoleInterface
