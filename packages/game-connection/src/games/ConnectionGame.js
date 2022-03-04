/* eslint-disable max-classes-per-file */
import { Game } from '@ludorum/core';
import { ListCheckerboard } from '@ludorum/utils-checkerboards';

const ROLES = ['First', 'Second'];
const DEFAULT_HEIGHT = 9;
const DEFAULT_WIDTH = 9;
const DEFAULT_LINE_LENGTH = 5;
const EMPTY_SQUARE = '.';

/** Base class for a subset of the family of [connection games](http://en.wikipedia.org/wiki/Connection_game),
 * which includes [TicTacToe](http://en.wikipedia.org/wiki/Tic-tac-toe),
 * [ConnectFour](http://en.wikipedia.org/wiki/Connect_Four) and [Gomoku](http://en.wikipedia.org/wiki/Gomoku).
 * It implements a rectangular board, the placing of the pieces and the checks
 * for lines.
*/
class ConnectionGame extends Game {
  /** @inheritdoc */
  static get name() {
    return 'ConnectionGame';
  }

  /** Create a subclass of ConnectionGame.
   *
   * @param {object} args
   * @param {number} [args.height] - The height of the new game's board.
   * @param {number} [args.lineLength] - The length of the lines to make.
   * @param {string} [args.name] - The new game's name.
   * @param {number} [args.width] - The width of the new game's board.
  */
  static subclass(args) {
    const {
      height = DEFAULT_HEIGHT,
      lineLength = DEFAULT_LINE_LENGTH,
      width = DEFAULT_WIDTH,
      name = `${this.name}_${height}x${width}-${lineLength}`,
    } = args || {};
    const checkerboard = new ListCheckerboard({
      dimensions: [width, height],
      emptySquare: EMPTY_SQUARE,
    });
    const result = class extends this {
      static get name() {
        return name;
      }

      get height() {
        return height;
      }

      get width() {
        return width;
      }

      get lineLength() {
        return lineLength;
      }

      get checkerboard() {
        const { board } = this;
        return board ? checkerboard.with([...this.board]) : checkerboard;
      }
    };
    result.defineSERMAT('');
    return result;
  }

  /** The constructor takes the active player and the board given as a string.
   *
   * @param {object} [args]
   * @param {string} [args.activeRole]
   * @param {string} [args.board=emptyBoard]
  */
  constructor(args = null) {
    const {
      activeRole = 0, board,
    } = args || {};
    super({ activeRoles: [activeRole] });
    this
      ._prop('board', board, 'string', this.checkerboard.emptyBoard().join(''));
  }

  /** This base implementations names its players First and Second.
   *
   * @property {string[]}
  */
  get roles() {
    return [...ROLES];
  }

  /** Boards by default have 9 rows.
   *
   * @property {number}
  */
  get height() {
    return 9;
  }

  /** Boards by default have 9 columns.
   *
   * @property {number}
  */
  get width() {
    return 9;
  }

  /** A player has to make a line of 5 pieces to win, by default.
   *
   * @property {number}
  */
  get lineLength() {
    return 5;
  }

  /** The Checkerboard instance for this game state.
   *
   * @property {Checkerboard}
  */
  get checkerboard() {
    const { board, height, width } = this;
    return new ListCheckerboard({
      dimensions: [width, height],
      emptySquare: EMPTY_SQUARE,
      squareValues: board && [...board],
    });
  }

  /** All lines of the board: horizontal, vertical & diagonal.
   *
   * @property {number[][]}
  */
  get boardLines() {
    const { checkerboard, lineLength } = this;
    return [...checkerboard.lines()]
      .filter((line) => line.length < lineLength)
      .map((line) => line.map((coord) => checkerboard.coord(coord, 'int')));
  }

  /** A connection game ends when either player gets the required amount of
   * pieces aligned (either horizontally, vertically or diagonally), hence
   * winning the game. The match ends in a tie if the board gets full.
   *
   * @property {object}
  */
  get result() {
    const {
      board, boardLines, lineLength, roles,
    } = this;
    for (let roleIndex = 0; roleIndex < roles.length; roleIndex += 1) {
      const roleLine = roleIndex.toString(36).repeat(lineLength);
      for (const boardLine of boardLines) {
        const line = boardLine.map((i) => board[i]).join('');
        if (line.includes(roleLine)) {
          return this.victory(roles[roleIndex]);
        }
      }
    }
    if (board.indexOf(EMPTY_SQUARE) < 0) { // No empty squares means a tie.
      return this.tied();
    }
    return null; // The game continues.
  }

  /** The active player can place a piece in any empty square in the board. The
   * moves are indices in the board's string representation.
   *
   * @property {object}
  */
  get actions() {
    const { activeRole, checkerboard, result } = this;
    if (result) {
      return null;
    }
    const emptySquaresCoords = [...checkerboard.coordinates()]
      .filter((coord) => checkerboard.isEmptySquare(coord));
    return { [activeRole]: emptySquaresCoords };
  }

  /** To get from one game state to the next, an active player's piece in the
   * square indicated by its move.
   *
   * @param {object} actions
   * @param {object} haps
   * @return {Game}
  */
  perform(actions, haps) {
    if (haps) {
      throw new Error(`Haps are not required (given ${JSON.stringify(haps)})!`);
    }
    const { activeRole, checkerboard, roles } = this;
    const { [activeRole]: move } = actions;
    const roleIndex = roles.indexOf(activeRole);
    this.board = checkerboard.place(move, roleIndex.toString(36)).squareValues.join('');
    this.activateRoles((roleIndex + 1) % roles.length);
    return this;
  }

  // ## User intefaces ###########################################################################

  /** The `display(ui)` method is called by a `UserInterface` to render the game state. The only
  supported user interface type is `BasicHTMLInterface`. The look can be configured using CSS
  classes.
  * /
  display: function display(ui) {
    raiseIf(!ui || !(ui instanceof UserInterface.BasicHTMLInterface), "Unsupported UI!");
    var moves = this.moves(),
      activePlayer = this.activePlayer(),
      board = this.board;
    moves = moves && moves[activePlayer];
    var table = this.board.renderAsHTMLTable(ui.document, ui.container, function (data) {
        data.className = data.square === '.' ? 'ludorum-empty' : 'ludorum-player'+ data.square;
        data.innerHTML = data.square === '.' ? "&nbsp;" : "&#x25CF;";
        var i = data.coord[0] * board.height + data.coord[1];
        if (moves && moves.indexOf(i) >= 0) {
          data.move = i;
          data.activePlayer = activePlayer;
          data.onclick = ui.perform.bind(ui, data.move, activePlayer);
        }
      });
    return ui;
  } */
} // class ConnectionGame.

/** Serialization and materialization using Sermat.
*/
ConnectionGame.defineSERMAT('activeRole board');

export default ConnectionGame;
