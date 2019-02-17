import db from './sqlite';

const PLAYERS_TABLE = 'players';

class Player {
  static async create (name) {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run(`INSERT INTO ${PLAYERS_TABLE} (NAME) VALUES (?)`, [name], function (err) {
          if (err === null) {
            resolve(this.lastID);
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
        db.all(`SELECT * FROM ${PLAYERS_TABLE}`, [], (err, rows) => {
          if (err === null) {
            resolve(rows);
          } else {
            reject(err);
          }
        });
      });
    });
  }

  static async idExists (playerId) {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.all(`SELECT * FROM ${PLAYERS_TABLE} WHERE id == ?`, [playerId], (err, rows) => {
          if (err === null) {
            resolve(rows.length > 0);
          } else {
            reject(err);
          }
        });
      });
    });
  }

  static async nameExists (playerName) {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.all(`SELECT * FROM ${PLAYERS_TABLE} WHERE name == ?`, [playerName], (err, rows) => {
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

export { Player as default };
