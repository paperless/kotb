'use strict';

const crypto = require('crypto');
const path = require('path');
const chalk = require('chalk');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

let statements = '';

statements = fs.readFileSync(path.join(__dirname, '../db_schema.sql'), 'utf8').toString();

let db = new sqlite3.Database('database.sqlite3', () => {
  db.exec(statements, () => {
    console.log(chalk.green('Database created!'));
  });
});

let password = crypto.randomBytes(16).toString('hex');
let jwtSecret = crypto.randomBytes(64).toString('hex');

fs.writeFileSync(path.join(__dirname, '../.env'),
  `\
PORT=8080
PASSWORD=${password}
JWT_SECRET=${jwtSecret}
  `,
);

console.log(chalk.green('.env created!'));
