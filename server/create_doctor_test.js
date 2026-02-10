
import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';

const db = new sqlite3.Database('./database.sqlite');

const createDoctor = async () => {
    const password = await bcrypt.hash('password123', 10);
    const email = 'doctor@test.com';

    db.serialize(() => {
        db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
            if (row) {
                console.log("Doctor exists. Updating password...");
                db.run("UPDATE users SET password = ?, role = 'doctor' WHERE email = ?", [password, email], (err) => {
                    if (err) console.error(err);
                    else console.log("Doctor updated.");
                });
            } else {
                console.log("Creating new doctor...");
                db.run(`INSERT INTO users (name, email, password, role, qualifications, place) 
                        VALUES ('Dr. Test', ?, ?, 'doctor', 'BAMS, MD', 'Ayurveda Specialist')`,
                    [email, password], (err) => {
                        if (err) console.error(err);
                        else console.log("Doctor created.");
                    });
            }
        });
    });
};

createDoctor();
