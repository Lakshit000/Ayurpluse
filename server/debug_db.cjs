const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
    db.all('PRAGMA table_info(panchakarma_cycles)', (err, rows) => {
        if (err) console.error(err);
        else console.log('Schema:', rows);
    });

    db.all("SELECT * FROM users WHERE role='doctor'", (err, rows) => {
        if (err) console.error(err);
        else console.log('Doctors:', rows);
    });
});
