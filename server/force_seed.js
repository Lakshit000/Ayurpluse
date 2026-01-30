import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./database.sqlite');
const email = 'vindhuhallermahendrakumar2005@gmail.com';
const doshaScores = JSON.stringify({ vata: 70, pitta: 20, kapha: 10 });

db.serialize(() => {
    db.run("UPDATE users SET dosha_scores = ?, prakruti = 'Vata-Pitta' WHERE email = ?", [doshaScores, email], function (err) {
        if (err) console.error("Error updating:", err);
        else console.log(`Updated user ${email}. Changes: ${this.changes}`);
    });
});
