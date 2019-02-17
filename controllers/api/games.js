import { check, validationResult } from 'express-validator/check';
import { Game, GameErrorCodes } from '../../store/games';

exports.validate = (method) => {
  switch (method) {
    case 'create': {
      return [
        check('name').exists({ checkFalsy: true }),
      ];
    }
  }
};

exports.create = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  Game.create(req.body.name)
    .then((gameId) => {
      res.status(200).json({ id: gameId });
    })
    .catch((e) => {
      switch (e.code) {
        case GameErrorCodes.GAME_EXISTS:
          res.status(400).json({
            error: 'O jogo já existe.',
          });
          break;
        default:
          res.status(500).json({});
      }
    });
};

exports.list = (req, res, next) => {
  Game.getAll()
    .then((games) => {
      res.status(200).json(games);
    })
    .catch((e) => {
      res.status(500).json({});
    });
};
