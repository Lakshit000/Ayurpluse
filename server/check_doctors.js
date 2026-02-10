import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./database.sqlite');

// Check all users with role = 'doctor'
db.all(`SELECT id, name, email, role, is_verified FROM users WHERE role = 'doctor'`, [], (err, doctors) => {
    if (err) {
        console.error('Error querying database:', err);
        db.close();
        return;
    }

    console.log('=== DOCTORS IN DATABASE ===');
    if (doctors.length === 0) {
        console.log('❌ No doctors found in database!');
        console.log('\n💡 You need to register a doctor account first!');
    } else {
        doctors.forEach(doc => {
            console.log(`\nID: ${doc.id}`);
            console.log(`Name: ${doc.name}`);
            console.log(`Email: ${doc.email}`);
            console.log(`Verified: ${doc.is_verified ? '✅ Yes' : '❌ No - needs verification'}`);
            console.log('---');
        });
    }

    db.close();
});
