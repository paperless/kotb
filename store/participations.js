import db from './sqlite';
import { Game } from './games';
import Player from './players';

const PARTICIPATIONS_TABLE = 'participations';

class Participation {
  static async create (date, games) {
    const timestamp = parseInt(date.getTime() / 1000, 10);

    // First let's create any non existent games and players
    for (let i = 0; i < games.length; i++) {
      const game = games[i];

      const gameExists = await Game.idExists(game.id);

      if (!gameExists) {
        await Game.create(game.id)
          .then((id) => {
            game.id = id;
          });
      }

      for (let j = 0; j < game.players.length; j++) {
        const player = game.players[j];

        if (player.id === null) continue;

        const playerExists = await Player.idExists(player.id);

        if (!playerExists) {
          let newName = player.id; // new player names come as the id, confusing but quicker to implement

          await Player.create(newName)
            .then((id) => {
              player.id = id;

              // To avoid creating multiple new players with the same name
              // if a new player shows up in multiple games for the first time
              games.forEach(g => {
                g.players.forEach(p => {
                  if (p.id === newName) {
                    p.id = id;
                  }
                });
              });
            });
        }
      }
    }

    return new Promise((resolve, reject) => {
      // Now let's add the actual participations
      for (let i = 0; i < games.length; i++) {
        const game = games[i];

        for (let j = 0; j < game.players.length; j++) {
          const player = game.players[j];
          let won = parseInt(player.won);
          const played = parseInt(player.played);

          for (let k = 0; k < played; k++) {
            let setAsWon = false;

            if (won > 0) {
              setAsWon = true;
              won--;
            }

            db.serialize(() => {
              db.run(`INSERT INTO ${PARTICIPATIONS_TABLE} (TIMESTAMP, PLAYER, GAME, WON) VALUES (?, ?, ?, ?)`, [timestamp, player.id, game.id, setAsWon ? 1 : 0], (err) => {
                if (err !== null) {
                  reject(err);
                }
              });
            });
          }
        }
      }

      resolve();
    });
  }

  // Get all, ready to show in a table with players and games
  static async getAll (dateFrom, dateTo) {
    let statement = `SELECT player, game, won FROM ${PARTICIPATIONS_TABLE}`;
    let params = [];

    if (dateFrom && dateTo) {
      dateFrom = new Date(dateFrom * 1000);
      dateFrom.setHours(0, 0, 0, 0);
      dateTo = new Date(dateTo * 1000);
      dateTo.setHours(23, 59, 59, 999);

      let timestampFrom = dateFrom.getTime() / 1000;
      let timestampTo = dateTo.getTime() / 1000;
      statement = `SELECT player, game, won FROM ${PARTICIPATIONS_TABLE} WHERE timestamp >= ? AND timestamp <= ?`;
      params = [timestampFrom, timestampTo];
    }

    let rows = null;

    try {
      rows = await new Promise((resolve, reject) => {
        // select player, game, won from participations
        db.serialize(() => {
          db.all(statement, params, (err, rows) => {
            if (err === null) {
              resolve(rows);
            } else {
              reject(err);
            }
          });
        });
      });
    } catch (e) {
      return Promise.reject(e);
    }

    return Promise.resolve(rows);
  }

  static async getBoard (dateFrom, dateTo) {
    const participations = await Participation.getAll(dateFrom, dateTo);
    const players = await Player.getAll();

    const boardPlayers = {};

    for (let i = 0; i < participations.length; i++) {
      const participation = participations[i];
      const won = parseInt(participation.won) === 1 ? 1 : 0;

      if (boardPlayers.hasOwnProperty(participation.player)) {
        boardPlayers[participation.player].total++;
        if (won) boardPlayers[participation.player].won++;
        boardPlayers[participation.player].perc = boardPlayers[participation.player].won / boardPlayers[participation.player].total;

        if (boardPlayers[participation.player].games.hasOwnProperty(participation.game)) {
          boardPlayers[participation.player].games[participation.game].total++;
          if (won) boardPlayers[participation.player].games[participation.game].won++;
        } else {
          boardPlayers[participation.player].games[participation.game] = {
            total: 1,
            won,
          };
        }
      } else {
        boardPlayers[participation.player] = {
          name: players.find(el => el.id === participation.player).name,
          total: 1,
          won,
          perc: won / 1,
          games: {},
        };

        boardPlayers[participation.player].games[participation.game] = {
          total: 1,
          won,
        };
      }
    }

    const board = Object.values(boardPlayers).sort((el1, el2) => {
      if (el1.perc < el2.perc) return 1;
      if (el1.perc > el2.perc) return -1;
      if (el1.perc === el2.perc) {
        if (el1.total > el2.total) {
          return -1;
        }

        return 0;
      };
    });

    return Promise.resolve(board);
  }
}

export { Participation as default };
