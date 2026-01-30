import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
  db.all("SELECT email FROM users", (err, rows) => {
    if (err) return;
    console.log("EMAILS:" + rows.map(r => r.email).join(','));
  });
});
