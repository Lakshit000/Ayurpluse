import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./database.sqlite');
const emails = ['doctor@test.com', 'patient@test.com'];

db.serialize(() => {
    emails.forEach(email => {
        db.get("SELECT id, name, email, role FROM users WHERE email = ?", [email], (err, row) => {
            if (err) console.error("Error for " + email + ":", err.message);
            else if (row) console.log(`FOUND: ${row.name} (${row.email}) - ${row.role}`);
            else console.log(`NOT FOUND: ${email}`);
        });
    });
});
