import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./database.sqlite');
const email = 'vindhuhallermahendrakumar2005@gmail.com';

db.serialize(() => {
    db.get("SELECT id, name, email, dosha_scores FROM users WHERE email = ?", [email], (err, row) => {
        if (err) console.error("Error:", err);
        else console.log("User Data:", row);
    });
});
