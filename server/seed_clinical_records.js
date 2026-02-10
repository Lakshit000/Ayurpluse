import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error("Error opening database:", err.message);
        return;
    }
    console.log("Connected to database.");

    // First, let's find the user 'shiny'
    db.get("SELECT id, name FROM users WHERE name LIKE '%shiny%'", [], (err, user) => {
        if (err) {
            console.error("Error finding user:", err);
            return;
        }

        if (!user) {
            console.log("User 'shiny' not found. Listing all users:");
            db.all("SELECT id, name, email FROM users LIMIT 10", [], (err, rows) => {
                if (rows) console.table(rows);
                db.close();
            });
            return;
        }

        console.log(`Found User: ${user.name} (ID: ${user.id})`);

        // Check for existing clinical records
        db.all("SELECT * FROM clinical_records WHERE patient_id = ?", [user.id], (err, records) => {
            if (err) {
                console.error("Error fetching records:", err);
                db.close();
                return;
            }

            console.log(`\nFound ${records.length} existing clinical records for ${user.name}.`);

            if (records.length === 0) {
                console.log("\nSeeding a sample clinical record...");

                const vitals = JSON.stringify({
                    bp: "120/80",
                    pulse: "72",
                    temp: "98.6",
                    weight: "70"
                });

                const prescription = JSON.stringify([
                    { name: "Ashwagandha Capsules", dosage: "500mg", frequency: "1-0-1", duration: "14" },
                    { name: "Triphala Churna", dosage: "1 tsp", frequency: "0-0-1", duration: "30" }
                ]);

                const complaints = "Fatigue, irregular sleep, and mild digestive discomfort.";
                const diagnosis = "Vata Imbalance with Agni Mandya";
                const doctorId = 1; // Assuming doctor ID 1 exists
                const date = new Date().toISOString();

                db.run(
                    `INSERT INTO clinical_records (patient_id, doctor_id, date, vitals, complaints, diagnosis, prescription) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [user.id, doctorId, date, vitals, complaints, diagnosis, prescription],
                    function (err) {
                        if (err) {
                            console.error("Error seeding record:", err);
                        } else {
                            console.log(`✓ Seeded clinical record with ID: ${this.lastID}`);
                            console.log("  Vitals: BP=120/80, Pulse=72, Temp=98.6°F, Weight=70kg");
                            console.log("  Prescriptions: 2 medicines");
                        }
                        db.close();
                    }
                );
            } else {
                console.log("\nExisting records:");
                records.forEach((r, idx) => {
                    console.log(`  ${idx + 1}. Date: ${r.date}, Diagnosis: ${r.diagnosis}`);
                });
                db.close();
            }
        });
    });
});
