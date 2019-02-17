import jwt from 'jsonwebtoken';

exports.auth = function (req, res, next) {
  if (typeof req.user !== 'undefined' && Number.isInteger(req.user.user)) {
    next();
  } else {
    // Check cookie
    if (req.cookies.token && req.cookies.token && req.cookies.token.length > 0) {
      try {
        jwt.verify(req.cookies.token, process.env.JWT_SECRET);

        next();
      } catch (err) {
        res.status(403).json({
          error: 'Autorização necessária.',
        });
      }
    } else {
      res.status(403).json({
        error: 'Autorização necessária.',
      });
    }
  }
};
