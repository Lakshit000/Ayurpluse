
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
    console.log('Connected to SQLite database for seeding.');
    seedAnalytics();
});

function seedAnalytics() {
    const patients = [
        { name: 'Rohan Sharma', prakruti: 'Vata', email: 'rohan@test.com' },
        { name: 'Priya Patel', prakruti: 'Pitta', email: 'priya@test.com' },
        { name: 'Amit Singh', prakruti: 'Kapha', email: 'amit@test.com' },
        { name: 'Sneha Gupta', prakruti: 'Vata-Pitta', email: 'sneha@test.com' },
        { name: 'Rahul Verma', prakruti: 'Pitta-Kapha', email: 'rahul@test.com' },
        { name: 'Anjali Das', prakruti: 'Kapha-Vata', email: 'anjali@test.com' },
        { name: 'Vikram Malhotra', prakruti: 'Vata', email: 'vikram@test.com' },
        { name: 'Neha Kapoor', prakruti: 'Pitta', email: 'neha@test.com' }
    ];

    console.log("Seeding Patients...");

    // Insert Patients
    let completed = 0;
    patients.forEach(p => {
        const sql = `INSERT OR IGNORE INTO users (name, email, password, role, prakruti, is_verified) VALUES (?, ?, 'password123', 'patient', ?, 1)`;
        db.run(sql, [p.name, p.email, p.prakruti], function (err) {
            if (err) console.error("Error inserting patient:", err.message);
            else {
                // Get the User ID (potentially new or existing)
                db.get("SELECT id FROM users WHERE email = ?", [p.email], (err, row) => {
                    if (row) {
                        seedAppointments(row.id);
                    }
                });
            }
        });
    });
}

function seedAppointments(patientId) {
    const appointmentTypes = ['New Consultation', 'Follow-up', 'Ayurvedic Therapy', 'Regular Checkup'];
    const numAppointments = Math.floor(Math.random() * 4) + 1; // 1 to 4 appointments per patient

    const today = new Date();

    for (let i = 0; i < numAppointments; i++) {
        const daysAgo = Math.floor(Math.random() * 30); // Last 30 days
        const date = new Date(today);
        date.setDate(date.getDate() - daysAgo);
        const dateStr = date.toISOString().split('T')[0];

        const type = appointmentTypes[Math.floor(Math.random() * appointmentTypes.length)];
        const status = daysAgo > 0 ? 'completed' : 'scheduled';
        const doctorId = 1; // Assume doctor ID 1 exists

        db.run(`INSERT INTO appointments (patient_id, doctor_id, date, time, type, status) VALUES (?, ?, ?, '10:00', ?, ?)`,
            [patientId, doctorId, dateStr, type, status],
            (err) => {
                if (err) console.error("Error seeding appointment:", err.message);
            }
        );
    }
}

// Give it a moment to finish async operations then exit
setTimeout(() => {
    console.log("Seeding process initiated...");
    // We don't strictly wait for all callbacks here but for a small seed script it's usually fine.
    // For robustness, we could use Promises, but this is a quick helper.
    setTimeout(() => {
        console.log("Closing connection.");
        db.close();
    }, 2000);
}, 1000);
