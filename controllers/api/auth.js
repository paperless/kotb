import { check, validationResult } from 'express-validator/check';
import jwt from 'jsonwebtoken';

const PASSWORD = process.env.PASSWORD;

exports.validate = (method) => {
  switch (method) {
    case 'auth': {
      return [
        check('password').exists({ checkFalsy: true }),
      ];
    }
  }
};

exports.token = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  let password = req.body.password;

  if (password !== PASSWORD) {
    return res.status(401).json({
      error: 'A palavra-passe não é válida.',
    });
  }

  // The API is stateless but here's an exception for use in browsers because
  // cookies with the HttpOnly flag make the app more resistant against XSS
  // compared to storing the token in localStorage. Together with the SameSite flag it is also immune against CSRF which makes cookies the best
  // solution for storing the token on a browser environment.
  // Here's a discussion on the topic: https://dev.to/jondubois/comment/373l (check full discussion as well)
  let generalToken = jwt.sign({ user: 1 }, process.env.JWT_SECRET, { algorithm: 'HS512', expiresIn: '7d' });
  let tokenForCookie = jwt.sign({ user: 1 }, process.env.JWT_SECRET, { algorithm: 'HS512', expiresIn: '730d' });

  res.cookie('token', tokenForCookie, { httpOnly: true, sameSite: true, maxAge: 730 * 24 * 60 * 60 * 1000 });
  res.status(200).json({
    jwt: generalToken,
  });
};

exports.check = (req, res) => {
  res.status(200).json({});
};
