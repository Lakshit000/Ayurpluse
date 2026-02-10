const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
    // Check for doctor_id column
    db.all("PRAGMA table_info(panchakarma_cycles)", (err, rows) => {
        if (err) {
            console.error("Error getting schema:", err);
            return;
        }

        const hasDoctorId = rows.some(r => r.name === 'doctor_id');
        console.log("Has doctor_id column?", hasDoctorId);

        if (!hasDoctorId) {
            console.log("Adding doctor_id column...");
            db.run("ALTER TABLE panchakarma_cycles ADD COLUMN doctor_id INTEGER", (err) => {
                if (err) console.error("Error adding column:", err);
                else console.log("Column added successfully.");
            });
        }

        // Also check if we have any doctors
        db.all("SELECT id, name, role FROM users WHERE role='doctor'", (err, docs) => {
            console.log("Existing Doctors:", docs);
            if (docs.length === 0) {
                console.log("No doctors found. Creating a test doctor...");
                // Insert a dummy doctor for testing
                const stmt = db.prepare("INSERT INTO users (name, email, password, role, is_verified) VALUES (?, ?, ?, ?, ?)");
                stmt.run("Dr. Sharma", "doctor@ayurpulse.com", "password123", "doctor", 1, function (err) {
                    if (err) console.error(err);
                    else console.log("Created Dr. Sharma with ID:", this.lastID);
                });
                stmt.finalize();
            }
        });
    });
});
