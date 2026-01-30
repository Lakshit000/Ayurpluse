import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./database.sqlite');
const PATIENT_ID = 18;

const doshaScores = JSON.stringify({ vata: 65, pitta: 25, kapha: 10 });

db.serialize(() => {
    // 1. Update User Profile
    db.run("UPDATE users SET dosha_scores = ?, prakruti = 'Vata-Pitta' WHERE id = ?", [doshaScores, PATIENT_ID], (err) => {
        if (!err) console.log("Updated Dosha Scores");
    });

    // 2. Add Medications
    db.run("INSERT INTO medications (patient_id, name, dosage, status) VALUES (?, 'Ashwagandha', '500mg Nightly', 'active')", [PATIENT_ID]);
    db.run("INSERT INTO medications (patient_id, name, dosage, status) VALUES (?, 'Triphala', '1 tsp warm water', 'active')", [PATIENT_ID]);
    console.log("Added Medications");

    // 3. Add Next Appointment
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    db.run("INSERT INTO appointments (patient_id, doctor_id, date, time, type, status) VALUES (?, 1, ?, '10:30 AM', 'Follow-up', 'scheduled')", [PATIENT_ID, dateStr]);
    console.log("Added Appointment");

    // 4. Add Panchakarma Cycle
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 5); // Started 5 days ago
    const startStr = startDate.toISOString().split('T')[0];

    db.run("INSERT INTO panchakarma_cycles (patient_id, name, status, progress, start_date) VALUES (?, 'Virechana Protocol', 'active', 35, ?)",
        [PATIENT_ID, startStr],
        function (err) {
            if (err) return console.error(err);
            const cycleId = this.lastID;

            // Add Stages
            const stages = [
                { name: 'Deepan-Pachan', status: 'completed', days: -5 },
                { name: 'Snehapana Day 1', status: 'completed', days: -4 },
                { name: 'Snehapana Day 2', status: 'completed', days: -3 },
                { name: 'Snehapana Day 3', status: 'completed', days: -2 },
                { name: 'Snehapana Day 4', status: 'completed', days: -1 },
                { name: 'Abhyanga + Swedana', status: 'active', days: 0 },
                { name: 'Virechana Karma', status: 'pending', days: 2 },
                { name: 'Samsarjana Krama', status: 'pending', days: 3 }
            ];

            stages.forEach(stage => {
                const d = new Date();
                d.setDate(d.getDate() + stage.days);
                db.run("INSERT INTO panchakarma_stages (cycle_id, name, date, status, type) VALUES (?, ?, ?, ?, 'therapy')",
                    [cycleId, stage.name, d.toISOString().split('T')[0], stage.status]);
            });
            console.log("Added Panchakarma Cycle");
        });
});
