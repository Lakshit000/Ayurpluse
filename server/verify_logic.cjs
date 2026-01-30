const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

// 1. Get Patient ID
db.get("SELECT id FROM users WHERE email='testpatient@ayurpulse.com'", (err, user) => {
    if (err || !user) {
        console.error("User not found or error:", err);
        return;
    }
    const patientId = user.id;
    console.log("Patient ID:", patientId);

    // 2. Clear existing active cycles for this patient
    db.run("DELETE FROM panchakarma_cycles WHERE patient_id = ?", [patientId], (err) => {

        // 3. Request New Cycle (Simulating POST request logic)
        // Find a doctor first
        db.get("SELECT id FROM users WHERE role = 'doctor' LIMIT 1", (err, doctor) => {
            const doctorId = doctor ? doctor.id : null;
            console.log("Assigning Doctor ID:", doctorId);

            db.run(`INSERT INTO panchakarma_cycles (patient_id, doctor_id, name, status, progress, start_date) VALUES (?, ?, 'Test Therapy', 'active', 0, ?)`,
                [patientId, doctorId, new Date().toISOString().split('T')[0]],
                function (err) {
                    if (err) {
                        console.error("Insert failed:", err);
                        return;
                    }
                    const cycleId = this.lastID;
                    console.log("Cycle Created ID:", cycleId);

                    // 4. Verify Fetch (Simulating GET request logic with JOIN)
                    const sql = `
                        SELECT pc.*, u.name as doctor_name 
                        FROM panchakarma_cycles pc
                        LEFT JOIN users u ON pc.doctor_id = u.id 
                        WHERE pc.id = ?
                    `;
                    db.get(sql, [cycleId], (err, cycle) => {
                        console.log("VERIFICATION RESULT:");
                        console.log("-------------------");
                        console.log("Cycle Name:", cycle.name);
                        console.log("Assigned Doctor:", cycle.doctor_name);
                        console.log("-------------------");
                    });
                }
            );
        });
    });
});
