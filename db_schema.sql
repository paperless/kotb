CREATE TABLE "games" ( `name` TEXT UNIQUE, `id` INTEGER PRIMARY KEY AUTOINCREMENT );
CREATE TABLE "participations" ( `timestamp` INTEGER, `player` INTEGER, `game` INTEGER, `id` INTEGER PRIMARY KEY AUTOINCREMENT, `won` INTEGER );
CREATE TABLE "players" ( `name` TEXT, `id` INTEGER PRIMARY KEY AUTOINCREMENT );
