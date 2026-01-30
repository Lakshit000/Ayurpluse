import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./server/database.sqlite', (err) => {
    if (err) {
        console.error("Error opening database:", err.message);
        return;
    }
    console.log("Connected to database.");
    checkAndSeed();
});

function checkAndSeed() {
    // 1. Find User 'shiny'
    db.get("SELECT id, name FROM users WHERE name LIKE '%shiny%' OR email LIKE '%shiny%'", [], (err, user) => {
        if (err) {
            console.error("Error finding user:", err);
            return;
        }

        if (!user) {
            console.log("User 'shiny' not found. Listing all users to identify target...");
            db.all("SELECT id, name FROM users LIMIT 5", [], (err, rows) => {
                console.log("Available users:", rows);
            });
            return;
        }

        console.log(`Found User: ${user.name} (ID: ${user.id})`);

        // 2. Check Clinical Records
        db.all("SELECT * FROM clinical_records WHERE patient_id = ?", [user.id], (err, rows) => {
            if (err) {
                console.error("Error fetching records:", err);
                return;
            }

            console.log(`Found ${rows.length} clinical records.`);

            if (rows.length === 0) {
                console.log("No records found. Seeding a sample clinical record...");
                seedRecord(user.id);
            } else {
                console.log("Records exist:", rows);
            }
        });
    });
}

function seedRecord(patientId) {
    const vitals = JSON.stringify({ bp: "120/80", pulse: "72", temp: "98.6", weight: "70" });
    const prescription = JSON.stringify([
        { name: "Ashwagandha", dosage: "500mg", frequency: "1-0-1", duration: "14" },
        { name: "Triphala Churna", dosage: "1 tsp", frequency: "0-0-1", duration: "30" }
    ]);
    const complaints = "Fatigue and irregular sleep.";
    const diagnosis = "Vata Imbalance";
    const doctorId = 1; // Assuming doctor ID 1 exists
    const date = new Date().toISOString();

    db.run(
        `INSERT INTO clinical_records (patient_id, doctor_id, date, vitals, complaints, diagnosis, prescription) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [patientId, doctorId, date, vitals, complaints, diagnosis, prescription],
        function (err) {
            if (err) console.error("Error seeding record:", err);
            else console.log(`Seeded record with ID: ${this.lastID}`);
        }
    );
}
