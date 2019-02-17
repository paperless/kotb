import db from './sqlite';

const GAMES_TABLE = 'games';

const GameErrorCodes = Object.freeze({
  GAME_EXISTS: 1,
});

// Mostly to have a structured way to describe mundane, erroneous and predictable situations as well
class GameError {
  constructor (message, code) {
    this.name = this.constructor.name;
    // For internal use on logs etc
    this.message = message;
    // --
    this.code = code;
  }
}

class Game {
  static async create (name) {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run(`INSERT INTO ${GAMES_TABLE} (NAME) VALUES (?)`, [name], function (err) {
          if (err === null) {
            resolve(this.lastID);
          } else if (err.code === 'SQLITE_CONSTRAINT') {
            reject(new GameError('Game exists.', GameErrorCodes.GAME_EXISTS));
          } else {
            reject(err);
          }
        });
      });
    });
  }

  static async getAll () {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.all(`SELECT * FROM ${GAMES_TABLE}`, [], (err, rows) => {
          if (err === null) {
            resolve(rows);
          } else {
            reject(err);
          }
        });
      });
    });
  }

  static async idExists (gameId) {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.all(`SELECT * FROM ${GAMES_TABLE} WHERE id == ?`, [gameId], (err, rows) => {
          if (err === null) {
            resolve(rows.length > 0);
          } else {
            reject(err);
          }
        });
      });
    });
  }

  static async nameExists (gameName) {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.all(`SELECT * FROM ${GAMES_TABLE} WHERE name == ?`, [gameName], (err, rows) => {
          if (err === null) {
            resolve(rows.length > 0);
          } else {
            reject(err);
          }
        });
      });
    });
  }
}

export { Game, GameErrorCodes };
