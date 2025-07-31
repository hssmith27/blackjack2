const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('../db/blackjack.sqlite');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS hands (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_cards TEXT,
      dealer_cards TEXT,
      result TEXT,
      count INTEGER,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

module.exports = db;