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
          await Player.create(player.id)
            .then((id) => {
              player.id = id;
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
  static async getAll () {
    let rows = null;

    try {
      rows = await new Promise((resolve, reject) => {
        // select player, game, won from participations
        db.serialize(() => {
          db.all(`SELECT player, game, won FROM ${PARTICIPATIONS_TABLE}`, [], (err, rows) => {
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

  static async getBoard () {
    const participations = await Participation.getAll();
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
