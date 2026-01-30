const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const db = new sqlite3.Database('./database.sqlite');

const password = 'password123';
const hash = bcrypt.hashSync(password, 10);

db.serialize(() => {
    db.run("INSERT INTO users (name, email, password, role, is_verified) VALUES ('Test Patient', 'testpatient@ayurpulse.com', ?, 'patient', 1)", [hash], function (err) {
        if (err) console.error("Error creating user:", err.message);
        else console.log("Created Test Patient. Email: testpatient@ayurpulse.com Pass: password123");
    });
});
