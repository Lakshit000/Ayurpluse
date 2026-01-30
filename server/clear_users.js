import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
    db.run("DELETE FROM users", (err) => {
        if (err) console.error("Error clearing users:", err.message);
        else console.log("All existing users cleared.");
    });
});
