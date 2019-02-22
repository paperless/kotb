import Participation from '../../store/participations';
import { check, validationResult } from 'express-validator/check';

exports.validate = (method) => {
  switch (method) {
    case 'create': {
      return [
        check('date').exists({ checkFalsy: true }),
        check('games').exists({ checkFalsy: true }),
      ];
    }
  }
};

exports.create = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  let date = new Date(req.body.date);
  let games = req.body.games;

  let hasInvalidGame = false;

  games.forEach(game => {
    if (game.id === null || game.id.length === 0) {
      hasInvalidGame = true;
    }
  });

  if (hasInvalidGame) return res.status(422).json({ errors: [{ games: 'Pelo menos um dos jogos é inválido' }] });

  Participation.create(date, games)
    .then(() => {
      res.status(200).json({});
    })
    .catch((e) => {
      res.status(500).json({});
    });
};

exports.list = (req, res, next) => {
  Participation.getBoard()
    .then((board) => {
      res.status(200).json(board);
    })
    .catch((e) => {
      res.status(500).json({});
    });
};
