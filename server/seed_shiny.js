
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
        process.exit(1);
    }
});

const searchTerm = 'shiny';

db.all(`SELECT id, name, email FROM users WHERE name LIKE ?`, [`%${searchTerm}%`], (err, rows) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log("Found users:", JSON.stringify(rows, null, 2));
        if (rows.length > 0) {
            seedData(rows[0].id);
        } else {
            console.log("User 'shiny' not found. Creating...");
            createUser();
        }
    }
});

function createUser() {
    const sql = `INSERT INTO users (name, email, password, role, is_verified) VALUES ('shiny', 'shiny@test.com', 'password123', 'patient', 1)`;
    db.run(sql, function (err) {
        if (err) console.error(err.message);
        else {
            console.log(`Created user shiny with ID: ${this.lastID}`);
            seedData(this.lastID);
        }
    });
}

function seedData(userId) {
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekDate = nextWeek.toISOString().split('T')[0];

    // 1. Update Prakruti and Metrics
    const doshaScores = JSON.stringify({ vata: 65, pitta: 25, kapha: 10 });
    const vikrutiMetrics = JSON.stringify([
        { label: "Stress Levels", value: 30 },
        { label: "Digestion Index", value: 85 },
        { label: "Sleep Quality", value: 70 }
    ]);

    db.run(`UPDATE users SET prakruti = 'Vata', dosha_scores = ?, vikruti_metrics = ? WHERE id = ?`,
        [doshaScores, vikrutiMetrics, userId],
        (err) => {
            if (err) console.error("Error updating user profile:", err.message);
            else console.log("User profile updated (Prakruti, Vikruti).");
        }
    );

    // 2. Add Appointment
    db.run(`INSERT INTO appointments (patient_id, doctor_id, date, time, type, status) VALUES (?, 1, ?, '10:30 AM', 'General Consultation', 'scheduled')`,
        [userId, nextWeekDate],
        (err) => {
            if (err) console.error("Error creating appointment:", err.message);
            else console.log("Appointment created.");
        }
    );

    // 3. Add Medications
    db.run(`INSERT INTO medications (patient_id, name, dosage, status) VALUES (?, 'Ashwagandha', '1 tablet twice daily', 'active')`,
        [userId],
        (err) => {
            if (err) console.error("Error adding medication 1:", err.message);
            else console.log("Medication 1 added.");
        }
    );

    db.run(`INSERT INTO medications (patient_id, name, dosage, status) VALUES (?, 'Triphala Churna', '1 tsp at night', 'active')`,
        [userId],
        (err) => {
            if (err) console.error("Error adding medication 2:", err.message);
            else console.log("Medication 2 added.");
        }
    );

    // 4. Add Panchakarma Cycle
    db.run(`INSERT INTO panchakarma_cycles (patient_id, name, status, progress, start_date) VALUES (?, 'Virechana Detox', 'active', 45, ?)`,
        [userId, today],
        (err) => {
            if (err) console.error("Error adding panchakarma:", err.message);
            else console.log("Panchakarma cycle added.");
        }
    );

    setTimeout(() => {
        console.log("Seeding complete.");
        db.close();
    }, 2000);
}
