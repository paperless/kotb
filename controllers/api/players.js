import { check, validationResult } from 'express-validator/check';
import Player from '../../store/players';

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

  Player.create(req.body.name)
    .then((playerId) => {
      res.status(200).json({ id: playerId });
    })
    .catch((e) => {
      res.status(500).json({});
    });
};

exports.list = (req, res, next) => {
  Player.getAll()
    .then((players) => {
      res.status(200).json(players);
    })
    .catch((e) => {
      res.status(500).json({});
    });
};
