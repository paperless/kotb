'use strict';

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
