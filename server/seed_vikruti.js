import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./database.sqlite');
const email = 'vindhuhallermahendrakumar2005@gmail.com';

const vikrutiMetrics = JSON.stringify([
    { label: "Joint Stiffness Reduction", value: 82 },
    { label: "Digestive Regularity", value: 55 },
    { label: "Sleep Quality Enhancement", value: 70 },
    { label: "Overall Energy Levels", value: 65 }
]);

db.serialize(() => {
    db.run("UPDATE users SET vikruti_metrics = ? WHERE email = ?", [vikrutiMetrics, email], function (err) {
        if (err) console.error("Error updating:", err);
        else console.log(`Updated vikruti_metrics for ${email}. Changes: ${this.changes}`);
    });
});
