
import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./database.sqlite');
const userId = 26;

db.serialize(() => {
    db.run("UPDATE users SET is_verified = 1, verification_token = NULL WHERE id = ?", [userId], function (err) {
        if (err) {
            console.error("Error updating user:", err);
            return;
        }
        console.log(`User ${userId} manually verified. Changes: ${this.changes}`);

        db.get("SELECT id, email, is_verified FROM users WHERE id = ?", [userId], (err, row) => {
            console.log("Updated User Record:", row);
        });
    });
});
