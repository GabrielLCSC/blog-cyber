const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./blog.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    image TEXT NOT NULL,
    description TEXT NOT NULL,
    date TEXT NOT NULL
  )`);
});

module.exports = db;
