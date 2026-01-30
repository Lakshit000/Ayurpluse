import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./database.sqlite');
const email = 'vindhuhallermahendrakumar2005@gmail.com';

db.serialize(() => {
    db.all("SELECT id, name, email, is_verified, verification_token FROM users", [], (err, rows) => {
        if (err) console.error("Error:", err);
        else {
            rows.forEach(r => {
                console.log(`ID: ${r.id} | Email: ${r.email} | Verified: ${r.is_verified} | Token: ${r.verification_token}`);
            });
        }
    });
});
