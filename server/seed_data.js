import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';

const db = new sqlite3.Database('./database.sqlite');

async function seed() {
    const password = await bcrypt.hash('password123', 10);

    // Create Doctor
    db.run(`INSERT INTO users (name, email, password, role, qualifications) VALUES (?, ?, ?, ?, ?)`,
        ['Dr. Aditi', 'doctor@test.com', password, 'doctor', 'BAMS, MD'],
        (err) => {
            if (err) console.log('Doctor create error:', err.message);
            else console.log('Doctor created');
        }
    );

    // Create Patient
    db.run(`INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
        ['John Patient', 'patient@test.com', password, 'patient'],
        (err) => {
            if (err) console.log('Patient create error:', err.message);
            else console.log('Patient created');
        }
    );
}

seed();
