const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

db.get("SELECT email, password FROM users WHERE role='patient' LIMIT 1", (err, row) => {
    if (err) console.error(err);
    else console.log('Patient Creds:', row);
});
