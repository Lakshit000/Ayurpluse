import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./database.sqlite');
const email = 'vindhuhallermahendrakumar2005@gmail.com';

db.serialize(() => {
    db.run("UPDATE users SET is_verified = 1 WHERE email = ?", [email], function (err) {
        if (err) console.error("Error updating user:", err);
        else console.log(`Updated user ${email}. Changes: ${this.changes}`);
    });
});
