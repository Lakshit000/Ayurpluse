
import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./database.sqlite');
const email = 'pratibhaumare51@gmail.com';

db.serialize(() => {
    db.get("SELECT id, name, email, is_verified, verification_token FROM users WHERE email = ?", [email], (err, row) => {
        if (err) console.error("Error:", err);
        else {
            console.log("User Record:", row);
            if (row) {
                console.log(`User ID found: ${row.id}`);
            } else {
                console.log("User not found!");
            }
        }
    });
});
