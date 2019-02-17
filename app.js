'use strict';

require('dotenv').config();

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const expressValidator = require('express-validator');
const jwt = require('express-jwt');

const app = express();

app.set('trust proxy', true);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(expressValidator());

app.use(express.static(path.join(__dirname, 'public')));

app.use(jwt({
  secret: process.env.JWT_SECRET,
  credentialsRequired: false,
}));

app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({
      error: 'Token inválido.',
    });
  }
});

// Followed nested routing example: https://stackoverflow.com/questions/25260818/rest-with-express-js-nested-router
app.use('/', require('./routes'));
app.use('/api', require('./routes/api'));
app.use('/images', express.static('images'));

if (process.env.NODE_ENV !== 'production') {
  const webpack = require('webpack');
  const webpackConfig = require('./webpack.config');
  const compiler = webpack(webpackConfig);

  app.use(
    require('webpack-dev-middleware')(compiler, {
      noInfo: false,
      publicPath: webpackConfig.output.publicPath,
    }),
  );
} else {
  /* app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist'));
  }); */
  app.use('/', express.static('dist'));
}

if (module === require.main) {
  const server = app.listen(process.env.PORT || 8080, () => {
    const port = server.address().port;
    console.log(`App listening on port ${port}`);
  });
}

module.exports = app;
