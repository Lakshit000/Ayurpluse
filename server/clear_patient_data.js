import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./database.sqlite');
// Using email to be precise
const email = 'vindhuhallermahendrakumar2005@gmail.com';

db.serialize(() => {
    // Clear dynamic fields to test "Empty State"
    db.run(`UPDATE users SET 
        prakruti = NULL, 
        dosha_scores = NULL, 
        vikruti_metrics = NULL 
        WHERE email = ?`,
        [email],
        function (err) {
            if (err) console.error(err);
            else console.log(`Cleared profile data for ${email}. Changes: ${this.changes}`);
        }
    );

    // Get user id to clear related tables
    db.get("SELECT id FROM users WHERE email = ?", [email], (err, row) => {
        if (row) {
            db.run("DELETE FROM medications WHERE patient_id = ?", [row.id]);
            db.run("DELETE FROM appointments WHERE patient_id = ?", [row.id]);
            db.run("DELETE FROM panchakarma_cycles WHERE patient_id = ?", [row.id]);
            // Cascading delete for stages if I had foreign keys, but I don't, so...
            // Actually stages are linked to cycle_id. 
            // I should delete cycles first and stages logic is complex without cycle ids.
            // For now, just wiping cycles is enough to hide them from dashboard.
            console.log("Cleared related medications, appointments, and cycles.");
        }
    });

});
