import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { Jimp } from 'jimp';
import PDFDocument from 'pdfkit';
import path from 'path';
import { fileURLToPath } from 'url';



dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const SECRET_KEY = process.env.JWT_SECRET || "super-secret-key-change-this";

// Middleware
app.use(cors());
app.use(express.json());

// Email Transporter (Ethereal compatible)
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Database Setup
// ... (existing imports)

// ... (DB setup)
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        createTables();
        createAppointmentsTable();
        createClinicalRecordsTable();
        createPatientPortalTables();
        enhanceNotificationsTable();
        createPatientPortalIndexes();
        addMissingColumns();
    }
});

function createTables() {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        role TEXT DEFAULT 'patient',
        phone TEXT,
        address TEXT,
        gender TEXT,
        dob TEXT,
        place TEXT,
        qualifications TEXT,
        prakruti TEXT,
        is_verified INTEGER DEFAULT 0,
        verification_token TEXT
    )`, (err) => {
        if (err) {
            console.error("Error creating table:", err.message);
        } else {
            console.log("Users table ready.");
        }
    });

    db.run(`CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        message TEXT,
        type TEXT,
        is_read INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (!err) console.log("Notifications table ready.");
    });

    db.run(`CREATE TABLE IF NOT EXISTS system_settings (
        key TEXT PRIMARY KEY,
        value TEXT,
        type TEXT,
        updated_by TEXT,
        last_updated TEXT DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (!err) {
            console.log("System Settings table ready.");
            seedDefaultSettings();
        }
    });

    db.run(`CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT,
        details TEXT,
        performed_by TEXT,
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (!err) console.log("Audit Logs table ready.");
    });

    createMedicationsTable();
    createPanchakarmaTables();
}

function seedDefaultSettings() {
    const defaults = [
        { key: 'security_2fa', value: 'false', type: 'boolean' },
        { key: 'security_auto_logout', value: '30', type: 'number' }, // minutes
        { key: 'data_backup_freq', value: 'daily', type: 'string' },
        { key: 'locale_timezone', value: 'Asia/Kolkata', type: 'string' },
        { key: 'locale_date_format', value: 'DD/MM/YYYY', type: 'string' }
    ];

    defaults.forEach(setting => {
        db.run(`INSERT OR IGNORE INTO system_settings (key, value, type, updated_by) VALUES (?, ?, ?, 'system')`,
            [setting.key, setting.value, setting.type]);
    });
}

function createMedicationsTable() {
    db.run(`CREATE TABLE IF NOT EXISTS medications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER,
        name TEXT,
        dosage TEXT,
        status TEXT DEFAULT 'active'
    )`, (err) => {
        if (!err) console.log("Medications table ready.");
    });
}

function createPanchakarmaTables() {
    db.run(`CREATE TABLE IF NOT EXISTS panchakarma_cycles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER,
        name TEXT,
        status TEXT DEFAULT 'active',
        progress INTEGER DEFAULT 0,
        start_date TEXT,
        end_date TEXT
    )`, (err) => {
        if (!err) console.log("Panchakarma Cycles table ready.");
    });

    db.run(`CREATE TABLE IF NOT EXISTS panchakarma_stages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cycle_id INTEGER,
        name TEXT,
        date TEXT,
        status TEXT DEFAULT 'pending', 
        type TEXT
    )`, (err) => {
        if (!err) console.log("Panchakarma Stages table ready.");
    });

    db.run(`CREATE TABLE IF NOT EXISTS dosha_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER,
        vata INTEGER,
        pitta INTEGER,
        kapha INTEGER,
        type TEXT,
        date TEXT DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (!err) console.log("Dosha History table ready.");
    });
}

function createAppointmentsTable() {
    db.run(`CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER,
        doctor_id INTEGER,
        date TEXT,
        time TEXT,
        type TEXT,
        status TEXT DEFAULT 'scheduled'
    )`, (err) => {
        if (!err) console.log("Appointments table ready.");
    });
}

function createClinicalRecordsTable() {
    db.run(`CREATE TABLE IF NOT EXISTS clinical_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER,
        doctor_id INTEGER,
        date TEXT,
        vitals TEXT,
        complaints TEXT,
        diagnosis TEXT,
        prescription TEXT
    )`, (err) => {
        if (!err) console.log("Clinical Records table ready.");
    });
}

// Patient Portal Enhancement Tables
function createPatientPortalTables() {
    // Prescriptions table
    db.run(`CREATE TABLE IF NOT EXISTS prescriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        doctor_id INTEGER NOT NULL,
        clinical_record_id INTEGER,
        prescription_date TEXT NOT NULL,
        diagnosis TEXT,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES users(id),
        FOREIGN KEY (doctor_id) REFERENCES users(id),
        FOREIGN KEY (clinical_record_id) REFERENCES clinical_records(id)
    )`, (err) => {
        if (!err) console.log("Prescriptions table ready.");
    });

    // Prescription medications table
    db.run(`CREATE TABLE IF NOT EXISTS prescription_medications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        prescription_id INTEGER NOT NULL,
        medicine_name TEXT NOT NULL,
        dosage TEXT NOT NULL,
        frequency TEXT NOT NULL,
        duration TEXT NOT NULL,
        instructions TEXT,
        FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE
    )`, (err) => {
        if (!err) console.log("Prescription Medications table ready.");
    });

    // Notification preferences table
    db.run(`CREATE TABLE IF NOT EXISTS notification_preferences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL UNIQUE,
        email_enabled INTEGER DEFAULT 1,
        in_app_enabled INTEGER DEFAULT 1,
        sms_enabled INTEGER DEFAULT 0,
        medication_reminders INTEGER DEFAULT 1,
        appointment_reminders INTEGER DEFAULT 1,
        followup_reminders INTEGER DEFAULT 1,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`, (err) => {
        if (!err) console.log("Notification Preferences table ready.");
    });

    // Medical reports table
    db.run(`CREATE TABLE IF NOT EXISTS medical_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        filename TEXT NOT NULL,
        original_filename TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_type TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        category TEXT NOT NULL,
        tags TEXT,
        upload_date TEXT DEFAULT CURRENT_TIMESTAMP,
        report_date TEXT,
        shared_with TEXT,
        FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE
    )`, (err) => {
        if (!err) console.log("Medical Reports table ready.");
    });

    // Messages table
    db.run(`CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_id INTEGER NOT NULL,
        recipient_id INTEGER NOT NULL,
        sender_role TEXT NOT NULL,
        content TEXT NOT NULL,
        attachments TEXT,
        is_refill_request INTEGER DEFAULT 0,
        is_read INTEGER DEFAULT 0,
        read_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users(id),
        FOREIGN KEY (recipient_id) REFERENCES users(id)
    )`, (err) => {
        if (!err) console.log("Messages table ready.");
    });

    // Document vault table
    db.run(`CREATE TABLE IF NOT EXISTS document_vault (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        document_type TEXT NOT NULL,
        filename TEXT NOT NULL,
        original_filename TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_type TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        category TEXT,
        tags TEXT,
        expiry_date TEXT,
        is_expired INTEGER DEFAULT 0,
        upload_date TEXT DEFAULT CURRENT_TIMESTAMP,
        metadata TEXT,
        FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE
    )`, (err) => {
        if (!err) console.log("Document Vault table ready.");
    });

    // Document shares table
    db.run(`CREATE TABLE IF NOT EXISTS document_shares (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        document_id INTEGER NOT NULL,
        document_source TEXT NOT NULL,
        patient_id INTEGER NOT NULL,
        doctor_id INTEGER NOT NULL,
        shared_at TEXT DEFAULT CURRENT_TIMESTAMP,
        access_revoked INTEGER DEFAULT 0,
        revoked_at TEXT,
        FOREIGN KEY (patient_id) REFERENCES users(id),
        FOREIGN KEY (doctor_id) REFERENCES users(id)
    )`, (err) => {
        if (!err) console.log("Document Shares table ready.");
    });
}

// Create indexes for patient portal tables
function createPatientPortalIndexes() {
    // Index for messages conversation queries
    db.run(`CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(sender_id, recipient_id)`, (err) => {
        if (!err) console.log("Messages conversation index ready.");
    });

    // Index for messages recipient queries
    db.run(`CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id, is_read)`, (err) => {
        if (!err) console.log("Messages recipient index ready.");
    });

    // Index for document vault patient queries
    db.run(`CREATE INDEX IF NOT EXISTS idx_vault_patient ON document_vault(patient_id)`, (err) => {
        if (!err) console.log("Document vault patient index ready.");
    });

    // Index for document vault expiry queries
    db.run(`CREATE INDEX IF NOT EXISTS idx_vault_expiry ON document_vault(expiry_date, is_expired)`, (err) => {
        if (!err) console.log("Document vault expiry index ready.");
    });

    // Index for document shares doctor queries
    db.run(`CREATE INDEX IF NOT EXISTS idx_shares_doctor ON document_shares(doctor_id, access_revoked)`, (err) => {
        if (!err) console.log("Document shares doctor index ready.");
    });

    // Index for notifications user queries
    db.run(`CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at)`, (err) => {
        if (!err) console.log("Notifications user index ready.");
    });

    // Index for medical reports patient queries
    db.run(`CREATE INDEX IF NOT EXISTS idx_reports_patient ON medical_reports(patient_id, category)`, (err) => {
        if (!err) console.log("Medical reports patient index ready.");
    });

    // Index for prescriptions patient queries
    db.run(`CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON prescriptions(patient_id, prescription_date)`, (err) => {
        if (!err) console.log("Prescriptions patient index ready.");
    });
}

// Enhance existing notifications table with new columns
function enhanceNotificationsTable() {
    const newColumns = [
        "notification_type TEXT DEFAULT 'general'",
        "scheduled_for TEXT",
        "sent_at TEXT",
        "delivery_status TEXT DEFAULT 'pending'",
        "metadata TEXT"
    ];

    newColumns.forEach(col => {
        const colName = col.split(" ")[0];
        db.run(`ALTER TABLE notifications ADD COLUMN ${col}`, (err) => {
            // Ignore error if column already exists
            if (err && !err.message.includes("duplicate column")) {
                console.error(`Error adding column ${colName}:`, err.message);
            }
        });
    });
    console.log("Notifications table enhanced with new columns.");
}

function addMissingColumns() {
    const columns = [
        "phone TEXT", "address TEXT", "gender TEXT", "dob TEXT", "place TEXT", "qualifications TEXT", "prakruti TEXT",
        "is_verified INTEGER DEFAULT 0", "verification_token TEXT", "dosha_scores TEXT", "vikruti_metrics TEXT",
        "created_at TEXT DEFAULT CURRENT_TIMESTAMP"
    ];
    columns.forEach(col => {
        const colName = col.split(" ")[0];
        db.run(`ALTER TABLE users ADD COLUMN ${col}`, (err) => {
            // Ignore error if column exists
        });
    });
}

// Register Route
app.post('/api/register', async (req, res) => {
    const { name, email, password, phone, address, gender, dob, place, qualifications } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "Name, email, and password are required" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const token = crypto.randomBytes(32).toString('hex');

        const sql = `INSERT INTO users (name, email, password, phone, address, gender, dob, place, qualifications, verification_token, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`;

        db.run(sql, [name, email, hashedPassword, phone, address, gender, dob, place, qualifications, token], function (err) {
            if (err) {
                if (err.message.includes("UNIQUE constraint failed")) {
                    return res.status(400).json({ message: "Email already exists" });
                }
                return res.status(500).json({ error: err.message });
            }

            const userId = this.lastID;
            const verifyLink = `http://localhost:5173/verify-email?token=${token}`; // Link to Frontend

            // Send Verification Email
            const mailOptions = {
                from: '"AyurPulse" <no-reply@ayurpulse.com>',
                to: email,
                subject: 'Verify your Email - AyurPulse',
                html: `<h3>Welcome to AyurPulse!</h3><p>Please click the link below to verify your account:</p><a href="${verifyLink}">${verifyLink}</a>`
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) console.log("Email error:", error);
                else console.log("Email sent:", info.messageId);
            });

            res.status(201).json({ message: "User registered successfully. Please check your email to verify your account.", userId });
        });

    } catch (e) {
        console.error("Register Error:", e);
        res.status(500).json({ error: "Server error" });
    }
});

// Login Route
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
        if (err) return res.status(500).json({ error: "Server error" });
        if (!user) return res.status(400).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        // Check verification (optional based on requirements, but good practice)
        /*
        if (!user.is_verified) {
             return res.status(403).json({ message: "Please verify your email first." });
        }
        */

        const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    });
});

// Dashboard Routes

// Doctor Stats
// Doctor Stats
app.get('/api/doctor/stats', (req, res) => {
    const stats = {
        totalPatients: 0,
        todayVisits: 0,
        activePanchakarma: 0,
        followUps: 0
    };

    db.get(`SELECT COUNT(*) as count FROM users WHERE role = 'patient'`, [], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        stats.totalPatients = row.count;

        const today = new Date().toISOString().split('T')[0];
        db.get(`SELECT COUNT(*) as count FROM appointments WHERE date = ?`, [today], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            stats.todayVisits = row.count;

            db.get(`SELECT COUNT(*) as count FROM panchakarma_cycles WHERE status = 'active'`, [], (err, row) => {
                if (err) return res.status(500).json({ error: err.message });
                stats.activePanchakarma = row.count;

                db.get(`SELECT COUNT(*) as count FROM appointments WHERE type = 'Follow-up' AND status = 'scheduled'`, [], (err, row) => {
                    if (err) return res.status(500).json({ error: err.message });
                    stats.followUps = row.count;
                    res.json(stats);
                });
            });
        });
    });
});

// Patient Dashboard Data
app.get('/api/patient/dashboard/:id', (req, res) => {
    const { id } = req.params;

    db.get(`SELECT * FROM users WHERE id = ?`, [id], (err, user) => {
        if (err || !user) return res.status(404).json({ message: "User not found" });

        const dashboardData = {
            name: user.name,
            prakruti: user.prakruti || null, // No default string
            doshaScores: user.dosha_scores ? JSON.parse(user.dosha_scores) : null, // No default JSON
            vikrutiMetrics: user.vikruti_metrics ? JSON.parse(user.vikruti_metrics) : [],
            nextAppointment: null,
            medications: [],
            panchakarma: null
        };

        // Fetch Next Appointment
        db.get(`SELECT * FROM appointments WHERE patient_id = ? AND status = 'scheduled' ORDER BY date ASC LIMIT 1`, [id], (err, appointment) => {
            if (appointment) dashboardData.nextAppointment = appointment;

            // Fetch Active Medications
            db.all(`SELECT name, dosage FROM medications WHERE patient_id = ? AND status = 'active'`, [id], (err, meds) => {
                if (meds) dashboardData.medications = meds;

                // Fetch Active Panchakarma Cycle Summary
                db.get(`SELECT name, progress, start_date FROM panchakarma_cycles WHERE patient_id = ? AND status = 'active'`, [id], (err, cycle) => {
                    if (cycle) dashboardData.panchakarma = cycle;

                    res.json(dashboardData);
                });
            });
        });
    });
});

// Get Patient Panchakarma Details
// Get List of Doctors
app.get('/api/doctors', (req, res) => {
    db.all("SELECT id, name FROM users WHERE role = 'doctor'", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Get Patient Panchakarma Details (Joined with Doctor Name)
app.get('/api/patient/panchakarma/:id', (req, res) => {
    const { id } = req.params;

    const sql = `
        SELECT pc.*, u.name as doctor_name 
        FROM panchakarma_cycles pc
        LEFT JOIN users u ON pc.doctor_id = u.id 
        WHERE pc.patient_id = ? AND pc.status = 'active'
    `;

    db.get(sql, [id], (err, cycle) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!cycle) return res.json(null); // No active cycle

        db.all(`SELECT * FROM panchakarma_stages WHERE cycle_id = ? ORDER BY date ASC`, [cycle.id], (err, stages) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ ...cycle, stages });
        });
    });
});

// Request Panchakarma Cycle (Mock logic)
// Request Panchakarma Cycle (Dynamic)
// Request Panchakarma Cycle (Dynamic with Doctor Assignment)
app.post('/api/patient/panchakarma/request', (req, res) => {
    const { patient_id, therapy, duration, startDate, doctor_id } = req.body;

    // Default values
    const therapyName = therapy || 'General Detox';
    const totalDays = parseInt(duration) || 7;
    const start = startDate ? new Date(startDate) : new Date();
    const startStr = start.toISOString().split('T')[0];

    const proceedWithInsert = (resolvedDoctorId) => {
        const stmt = db.prepare(`INSERT INTO panchakarma_cycles (patient_id, doctor_id, name, status, progress, start_date) VALUES (?, ?, ?, 'active', 0, ?)`);
        stmt.run(patient_id, resolvedDoctorId, therapyName, startStr, function (err) {
            if (err) return res.status(500).json({ error: err.message });
            insertStages(this.lastID, totalDays, therapyName, start, res);
        });
        stmt.finalize();
    };

    if (doctor_id) {
        proceedWithInsert(doctor_id);
    } else {
        // Auto-assign logic fallback (Pick first doctor)
        db.get("SELECT id FROM users WHERE role = 'doctor' LIMIT 1", [], (err, doctor) => {
            const doctorId = doctor ? doctor.id : null;
            proceedWithInsert(doctorId);
        });
    }

    function insertStages(cycleId, totalDays, therapyName, start, res) {
        let stages = [];
        if (totalDays === 14) {
            for (let i = 1; i <= 5; i++) stages.push({ name: 'Snehana (Oleation)', type: 'Purvakarma', day: i });
            for (let i = 6; i <= 9; i++) stages.push({ name: 'Abhyanga & Swedana', type: 'Purvakarma', day: i });
            for (let i = 10; i <= 12; i++) stages.push({ name: `${therapyName} Therapy`, type: 'Pradhanakarma', day: i });
            for (let i = 13; i <= 14; i++) stages.push({ name: 'Paschatkarma (Diet & Recovery)', type: 'Paschatkarma', day: i });
        } else {
            stages.push({ name: 'Snehana (Oleation)', type: 'Purvakarma', day: 1 });
            stages.push({ name: 'Snehana (Oleation)', type: 'Purvakarma', day: 2 });
            stages.push({ name: 'Abhyanga & Swedana', type: 'Purvakarma', day: 3 });
            stages.push({ name: 'Abhyanga & Swedana', type: 'Purvakarma', day: 4 });
            stages.push({ name: `${therapyName} Therapy`, type: 'Pradhanakarma', day: 5 });
            stages.push({ name: `${therapyName} Therapy`, type: 'Pradhanakarma', day: 6 });
            stages.push({ name: 'Paschatkarma (Diet & Recovery)', type: 'Paschatkarma', day: 7 });
        }

        const stmt = db.prepare(`INSERT INTO panchakarma_stages (cycle_id, name, date, status, type) VALUES (?, ?, ?, 'pending', ?)`);
        stages.forEach(stage => {
            const date = new Date(start);
            date.setDate(date.getDate() + (stage.day - 1));
            const dateStr = date.toISOString().split('T')[0];
            stmt.run(cycleId, stage.name, dateStr, stage.type);
        });
        stmt.finalize();

        res.json({ message: "Cycle requested successfully" });
    }
});

// Cancel/End Active Panchakarma Cycle
app.post('/api/patient/panchakarma/cancel', (req, res) => {
    const { patient_id } = req.body;

    // Find active cycle
    db.get("SELECT id FROM panchakarma_cycles WHERE patient_id = ? AND status = 'active'", [patient_id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ message: "No active cycle found" });

        const cycleId = row.id;

        // Delete stages and cycle
        db.run("DELETE FROM panchakarma_stages WHERE cycle_id = ?", [cycleId], (err) => {
            if (err) return res.status(500).json({ error: err.message });

            db.run("DELETE FROM panchakarma_cycles WHERE id = ?", [cycleId], (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: "Cycle cancelled successfully" });
            });
        });
    });
});

// Get Active Panchakarma Cycles (Doctor View)
app.get('/api/doctor/panchakarma', (req, res) => {
    const sql = `
        SELECT 
            pc.*, 
            u.name as patient_name, 
            u.dob, 
            u.gender
        FROM panchakarma_cycles pc
        JOIN users u ON pc.patient_id = u.id
        WHERE pc.status = 'active'
    `;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        // formats
        const data = rows.map(r => {
            let age = 'N/A';
            if (r.dob) {
                const diff = Date.now() - new Date(r.dob).getTime();
                age = Math.abs(new Date(diff).getUTCFullYear() - 1970);
            }
            return { ...r, age };
        });

        res.json(data);
    });
});
// Get Predictive Wellness Data
app.get('/api/patient/predictive/:id', (req, res) => {
    const { id } = req.params;
    db.get(`SELECT prakruti FROM users WHERE id = ?`, [id], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });

        // Mock logic based on Prakruti
        const prakruti = user ? (user.prakruti || 'Vata-Pitta') : 'Vata-Pitta';
        let risks = [];
        let wellness = [];

        if (prakruti.includes('Vata')) {
            risks.push({ title: 'Joint Sensitivity', value: 'High Vata', desc: 'Cold weather may increase joint pain next week.', status: 'warning' });
            wellness.push({ title: 'Best Practice', value: 'Oil Massage', desc: 'Daily Abhyanga recommended for grounding.', status: 'success' });
        }
        if (prakruti.includes('Pitta')) {
            risks.push({ title: 'Acidity Risk', value: 'High Heat', desc: 'Avoid spicy foods; predictive models show rising internal heat.', status: 'warning' });
        }
        if (prakruti.includes('Kapha')) {
            risks.push({ title: 'Lethargy', value: 'Slow Metabolism', desc: 'Rainy days might trigger sluggishness. Stay active.', status: 'warning' });
        }

        // Fillers if empty
        if (risks.length === 0) risks.push({ title: 'General', value: 'Balanced', desc: 'Your doshas seem stable for the coming weeks.', status: 'success' });

        // Mock Chart Data (30 days)
        // Simply returning a list of values for Vitality and Metabolism
        const forecast = Array.from({ length: 4 }, (_, i) => ({
            week: `Week ${i + 1}`,
            vitality: 60 + Math.random() * 30, // 60-90
            metabolism: 50 + Math.random() * 40 // 50-90
        }));

        res.json({
            prakruti,
            forecast,
            insights: [...risks, ...wellness]
        });
    });
});

// Generate AI Diet & Lifestyle Plan
app.post('/api/patient/predictive/plan', (req, res) => {
    const { userId } = req.body;
    db.get(`SELECT prakruti FROM users WHERE id = ?`, [userId], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });

        const prakruti = user ? (user.prakruti || 'Vata-Pitta') : 'Vata-Pitta';

        // AI Logic Simulation
        const plan = {
            diet: {
                focus: [],
                avoid: [],
                superfoods: []
            },
            lifestyle: {
                morning: "",
                exercise: "",
                bedtime: ""
            }
        };

        if (prakruti.includes('Vata')) {
            plan.diet.focus.push("Warm soups and stews", "Ghee and healthy fats", "Root vegetables (sweet potatoes, carrots)");
            plan.diet.avoid.push("Raw cold salads", "Dry crackers/chips", "Iced drinks");
            plan.diet.superfoods.push("Ashwagandha", "Sesame seeds");
            plan.lifestyle.morning = "Drink warm water with pinch of ginger. Self-massage with sesame oil.";
            plan.lifestyle.exercise = "Gentle Yoga or walking. Avoid high intensity cardio that depletes energy.";
            plan.lifestyle.bedtime = "Warm milk with nutmeg. Regular sleep schedule (10 PM).";
        }
        else if (prakruti.includes('Pitta')) {
            plan.diet.focus.push("Cooling foods", "Sweet fruits (melons, grapes)", "Green leafy vegetables");
            plan.diet.avoid.push("Spicy chili", "Fermented foods (pickles)", "Sour fruits");
            plan.diet.superfoods.push("Aloe Vera", "Fennel seeds");
            plan.lifestyle.morning = "Cool shower. Meditation to calm the mind.";
            plan.lifestyle.exercise = "Swimming or moon-light walks. Avoid midday sun.";
            plan.lifestyle.bedtime = "Reading calming books. Foot massage with coconut oil.";
        }
        else { // Kapha
            plan.diet.focus.push("Light, warm foods", "Spicy and bitter tastes", "Quinoa and millet");
            plan.diet.avoid.push("Heavy dairy (cheese, cream)", "Fried foods", "Sweets");
            plan.diet.superfoods.push("Turmeric", "Honey");
            plan.lifestyle.morning = "Vigorous dry brushing (Garshana). Warm water with honey.";
            plan.lifestyle.exercise = "Cardio, running, or dynamic yoga to stimulate metabolism.";
            plan.lifestyle.bedtime = "Light dinner before 7 PM. Avoid day sleeping.";
        }

        // Hybrid handling fallback (simplistic for demo)
        if (prakruti.includes('Vata') && prakruti.includes('Pitta')) {
            plan.lifestyle.exercise = "Moderate swimming or Hatha Yoga.";
        }

        // Artificial delay to simulate AI processing
        setTimeout(() => {
            res.json({ plan, prakruti });
        }, 1500);
    });
});

// Get all patients with details (for Doctor Patients View)
app.get('/api/patients', (req, res) => {
    const sql = `
            SELECT 
                u.id, u.name, u.gender, u.dob, u.phone,
                (SELECT diagnosis FROM clinical_records WHERE patient_id = u.id ORDER BY date DESC LIMIT 1) as diagnosis,
                (SELECT date FROM appointments WHERE patient_id = u.id AND status = 'completed' ORDER BY date DESC LIMIT 1) as lastVisit
            FROM users u 
            WHERE u.role = 'patient'
        `;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        // Calculate age from dob
        const patients = rows.map(p => {
            let age = 'N/A';
            if (p.dob) {
                const birthDate = new Date(p.dob);
                const diff = Date.now() - birthDate.getTime();
                age = Math.abs(new Date(diff).getUTCFullYear() - 1970);
            }
            return { ...p, age, diagnosis: p.diagnosis || 'General Checkup', lastVisit: p.lastVisit || 'First Visit' };
        });
        res.json(patients);
    });
});

// Get all Appointments for a Patient
app.get('/api/patient/appointments/:id', (req, res) => {
    const { id } = req.params;
    db.all(`SELECT * FROM appointments WHERE patient_id = ? ORDER BY date DESC`, [id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Book Appointment & Notify Doctor
app.post('/api/appointments', (req, res) => {
    const { patient_id, doctor_id, date, time, type } = req.body;

    if (!doctor_id) return res.status(400).json({ message: "Doctor ID is required" });

    const sql = `INSERT INTO appointments (patient_id, doctor_id, date, time, type, status) VALUES (?, ?, ?, ?, ?, 'Scheduled')`;

    db.run(sql, [patient_id, doctor_id, date, time, type], function (err) {
        if (err) return res.status(500).json({ error: err.message });

        const appointmentId = this.lastID;

        // Fetch Patient Name for Notification
        db.get(`SELECT name FROM users WHERE id = ?`, [patient_id], (err, row) => {
            const patientName = row ? row.name : "A patient";

            // Create Notification
            const msg = `New Appointment: ${patientName} has booked a ${type} on ${date} at ${time}`;
            db.run(`INSERT INTO notifications (user_id, message, type, is_read) VALUES (?, ?, 'appointment', 0)`,
                [doctor_id, msg],
                (err) => {
                    if (err) console.error("Failed to create notification:", err);
                }
            );
        });

        res.json({ message: "Appointment booked successfully", id: appointmentId });
    });
});

// Get Registered Doctors
app.get('/api/doctors', (req, res) => {
    db.all(`SELECT id, name, qualifications, place as specialization FROM users WHERE role = 'doctor'`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Get User Notifications
app.get('/api/notifications/:userId', (req, res) => {
    const { userId } = req.params;
    db.all(`SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC`, [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Mark Notification Read
app.put('/api/notifications/:id/read', (req, res) => {
    const { id } = req.params;
    db.run(`UPDATE notifications SET is_read = 1 WHERE id = ?`, [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Marked as read" });
    });
});

// Get Doctor Analytics data
// Get Doctor Analytics data
app.get('/api/doctor/analytics', (req, res) => {
    const analytics = {
        kpi: {
            retention: { value: '0%', change: '+0%' },
            revenue: { value: '₹0', change: '+0%' },
            newRegistrations: { value: 0, change: '+0' }
        },
        activity: { regular: 0, followUp: 0, new: 0 },
        prakrutiMix: { vata: 0, pitta: 0, kapha: 0 },
        vikrutiTrends: [
            { month: 'Aug', vata: 35, pitta: 40, kapha: 25 },
            { month: 'Sep', vata: 30, pitta: 45, kapha: 25 },
            { month: 'Oct', vata: 40, pitta: 30, kapha: 30 },
            { month: 'Nov', vata: 20, pitta: 50, kapha: 30 },
            { month: 'Dec', vata: 25, pitta: 35, kapha: 40 },
            { month: 'Jan', vata: 30, pitta: 40, kapha: 30 }
        ]
    };

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    const dateStr = startOfMonth.toISOString().split('T')[0];

    // 1. Total Patients & Retention
    db.all(`SELECT id FROM users WHERE role = 'patient'`, [], (err, patients) => {
        if (err) return res.status(500).json({ error: err.message });
        const totalPatients = patients.length;

        // Retention: Count patients with > 1 completed/scheduled appointment
        const patientIds = patients.map(p => p.id);
        if (patientIds.length === 0) {
            return sendResponse(); // No patients
        }

        const placeholders = patientIds.map(() => '?').join(',');
        db.all(`SELECT patient_id, COUNT(*) as count FROM appointments WHERE patient_id IN (${placeholders}) GROUP BY patient_id`, patientIds, (err, visitCounts) => {
            if (!err && visitCounts) {
                const returningPatients = visitCounts.filter(v => v.count > 1).length;
                const retentionRate = totalPatients ? Math.round((returningPatients / totalPatients) * 100) : 0;
                analytics.kpi.retention.value = `${retentionRate}%`;
            }

            // 2. New Registrations (This Month)
            db.get(`SELECT COUNT(*) as count FROM users WHERE role = 'patient' AND created_at >= ?`, [dateStr], (err, row) => {
                if (!err && row) {
                    analytics.kpi.newRegistrations.value = row.count;
                    analytics.kpi.newRegistrations.change = `+${row.count}`;
                }

                // 3. Activity & Revenue (This Month)
                db.all(`SELECT type, COUNT(*) as count FROM appointments WHERE date >= ? GROUP BY type`, [dateStr], (err, rows) => {
                    let totalRevenue = 0;
                    if (!err && rows) {
                        rows.forEach(r => {
                            const t = r.type.toLowerCase();
                            const count = r.count;

                            // Activity Breakdown
                            if (t.includes('follow')) {
                                analytics.activity.followUp += count;
                                totalRevenue += count * 300; // Assume 300 for follow up
                            } else if (t.includes('new') || t.includes('consultation')) {
                                analytics.activity.new += count;
                                totalRevenue += count * 500; // Assume 500 for new
                            } else {
                                analytics.activity.regular += count;
                                totalRevenue += count * 400; // Assume 400 for regular
                            }
                        });
                    }
                    analytics.kpi.revenue.value = `₹${totalRevenue}`;

                    // 4. Prakruti Mix
                    db.all(`SELECT prakruti, COUNT(*) as count FROM users WHERE role = 'patient' AND prakruti IS NOT NULL GROUP BY prakruti`, [], (err, pRows) => {
                        if (!err && pRows) {
                            pRows.forEach(r => {
                                const type = r.prakruti.toLowerCase();
                                if (type.includes('vata')) analytics.prakrutiMix.vata += r.count;
                                if (type.includes('pitta')) analytics.prakrutiMix.pitta += r.count;
                                if (type.includes('kapha')) analytics.prakrutiMix.kapha += r.count;
                            });
                        }
                        sendResponse();
                    });
                });
            });
        });
    });



    function sendResponse() {
        res.json(analytics);
    }
});

// Create Clinical Record
app.post('/api/clinical-records', (req, res) => {
    const { patient_id, doctor_id, date, vitals, complaints, diagnosis, prescription } = req.body;
    db.run(`INSERT INTO clinical_records (patient_id, doctor_id, date, vitals, complaints, diagnosis, prescription) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [patient_id, doctor_id, date, JSON.stringify(vitals), complaints, diagnosis, JSON.stringify(prescription)],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, message: "Clinical record saved" });
        }
    );
});

// Get Clinical Records for a Patient
app.get('/api/clinical-records/:patientId', (req, res) => {
    const { patientId } = req.params;
    db.all(`SELECT * FROM clinical_records WHERE patient_id = ? ORDER BY date DESC`, [patientId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        // Parse JSON fields
        const records = rows.map(r => ({
            ...r,
            vitals: r.vitals ? JSON.parse(r.vitals) : {},
            prescription: r.prescription ? JSON.parse(r.prescription) : []
        }));

        res.json(records);
    });
});

// Get User Details (Profile)
app.get('/api/users/:id', (req, res) => {
    const { id } = req.params;
    db.get(`SELECT id, name, email, phone, address, gender, dob, place, qualifications, role FROM users WHERE id = ?`, [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ message: "User not found" });
        res.json(row);
    });
});

// Get All Active Panchakarma Cycles for Doctors
app.get('/api/doctor/panchakarma', (req, res) => {
    db.all(`SELECT pc.*, p.name as patient_name, d.name as doctor_name FROM panchakarma_cycles pc JOIN users p ON pc.patient_id = p.id JOIN users d ON pc.doctor_id = d.id WHERE pc.status = 'Active' ORDER BY pc.start_date DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Get Specific Panchakarma Cycle Details with Stages
app.get('/api/panchakarma/cycle/:id', (req, res) => {
    const { id } = req.params;

    const sql = `
        SELECT pc.*, u.name as patient_name, u.gender, u.dob
        FROM panchakarma_cycles pc
        JOIN users u ON pc.patient_id = u.id
        WHERE pc.id = ?
    `;

    db.get(sql, [id], (err, cycle) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!cycle) return res.status(404).json({ message: "Cycle not found" });

        db.all(`SELECT * FROM panchakarma_stages WHERE cycle_id = ? ORDER BY date ASC`, [id], (err, stages) => {
            if (err) return res.status(500).json({ error: err.message });

            // Calculate age logic re-use if needed, but for now sending raw info
            let age = 'N/A';
            if (cycle.dob) {
                const diff = Date.now() - new Date(cycle.dob).getTime();
                age = Math.abs(new Date(diff).getUTCFullYear() - 1970);
            }

            res.json({ ...cycle, age, stages });
        });
    });
});

// Update Panchakarma Stage Status
app.post('/api/panchakarma/stage/:id/complete', (req, res) => {
    const { id } = req.params;

    // 1. Mark stage as completed
    db.run(`UPDATE panchakarma_stages SET status = 'completed' WHERE id = ?`, [id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ message: "Stage not found" });

        // 2. Recalculate Cycle Progress
        // Get cycle_id for this stage
        db.get(`SELECT cycle_id FROM panchakarma_stages WHERE id = ?`, [id], (err, stage) => {
            if (err || !stage) return;

            const cycleId = stage.cycle_id;

            db.all(`SELECT status FROM panchakarma_stages WHERE cycle_id = ?`, [cycleId], (err, stages) => {
                if (err || !stages) return;

                const total = stages.length;
                const completed = stages.filter(s => s.status === 'completed').length;
                const progress = Math.round((completed / total) * 100);

                db.run(`UPDATE panchakarma_cycles SET progress = ? WHERE id = ?`, [progress, cycleId], (err) => {
                    if (!err) {
                        // Optional: Check if all done, mark cycle as completed? 
                        // Leaving cycle as 'active' until manually closed or logic defines it.
                    }
                });
            });
        });

        res.json({ message: "Stage marked as completed" });
    });
});


// --- Reports API ---

// List Available Reports
app.get('/api/reports', (req, res) => {
    // Determine dynamic file sizes or row counts if possible, for now return static list with dynamic "Last updated"
    // In a real app, we might check file stats or query DB for "last_updated"
    res.json([
        { id: 'demographics', title: 'Patient Demographic Distribution', format: 'CSV', size: 'Dynamic' },
        { id: 'appointments', title: 'Appointment History Log', format: 'CSV', size: 'Dynamic' },
        { id: 'clinical', title: 'Clinical Records Dump', format: 'CSV', size: 'Dynamic' },
        { id: 'prakruti', title: 'Prakruti Profile Analysis', format: 'CSV', size: 'Dynamic' }
    ]);
});

// Download Report
app.get('/api/reports/download/:type', (req, res) => {
    const { type } = req.params;
    let sql = '';
    let filename = '';
    let headers = [];

    switch (type) {
        case 'demographics':
            sql = "SELECT id, name, email, phone, gender, dob, place, prakruti FROM users WHERE role='patient'";
            filename = 'patients_demographics.csv';
            headers = ['ID', 'Name', 'Email', 'Phone', 'Gender', 'DOB', 'Place', 'Prakruti'];
            break;
        case 'appointments':
            sql = `
                SELECT a.id, p.name as patient, d.name as doctor, a.date, a.time, a.type, a.status 
                FROM appointments a 
                LEFT JOIN users p ON a.patient_id = p.id 
                LEFT JOIN users d ON a.doctor_id = d.id
                ORDER BY a.date DESC
            `;
            filename = 'appointments_log.csv';
            headers = ['ID', 'Patient', 'Doctor', 'Date', 'Time', 'Type', 'Status'];
            break;
        case 'clinical':
            // Clinical records stored JSON in vitals/medicines, might need processing. 
            // For simplicity dumping raw fields.
            sql = `
                SELECT c.id, p.name as patient, c.date, c.complaints, c.diagnosis 
                FROM clinical_records c 
                JOIN users p ON c.patient_id = p.id
                ORDER BY c.date DESC
            `;
            filename = 'clinical_records.csv';
            headers = ['ID', 'Patient', 'Date', 'Complaints', 'Diagnosis'];
            break;
        case 'prakruti':
            sql = "SELECT id, name, prakruti FROM users WHERE role='patient' AND prakruti IS NOT NULL";
            filename = 'prakruti_analysis.csv';
            headers = ['ID', 'Name', 'Prakruti'];
            break;
        case 'all':
            sql = `SELECT u.name, u.email, u.phone, a.date as last_appt, a.type as last_visit_type FROM users u LEFT JOIN appointments a ON u.id = a.patient_id WHERE u.role = 'patient'`;
            filename = 'full_system_export.csv';
            headers = ['Name', 'Email', 'Phone', 'Last Appt', 'Visit Type'];
            break;
        default:
            return res.status(400).json({ error: 'Invalid report type' });
    }

    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        if (req.query.format === 'pdf') {
            const doc = new PDFDocument();
            const pdfFilename = filename.replace('.csv', '.pdf');

            res.header('Content-Type', 'application/pdf');
            res.header('Content-Disposition', `attachment; filename="${pdfFilename}"`);

            doc.pipe(res);

            doc.fontSize(20).text(filename.replace('.csv', '').toUpperCase(), { align: 'center' });
            doc.moveDown();

            rows.forEach((row, i) => {
                doc.fontSize(12).text(`Record #${i + 1}`, { underline: true });
                Object.entries(row).forEach(([key, val]) => {
                    doc.fontSize(10).text(`${key}: ${val}`, { indent: 20 });
                });
                doc.moveDown(0.5);
            });

            doc.end();
        } else {
            // Generate CSV
            const csvRows = [headers.join(',')];

            rows.forEach(row => {
                const values = Object.values(row).map(val => {
                    const escaped = ('' + (val || '')).replace(/"/g, '""'); // Escape double quotes
                    return `"${escaped}"`; // Wrap in quotes
                });
                csvRows.push(values.join(','));
            });

            const csvString = csvRows.join('\n');

            res.header('Content-Type', 'text/csv');
            res.header('Content-Disposition', `attachment; filename="${filename}"`);
            res.send(csvString);
        }
    });
});

// Update User Profile
app.put('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const { name, phone, address, gender, prakruti, dob, place, qualifications } = req.body;

    const updates = [];
    const params = [];

    if (name) { updates.push("name = ?"); params.push(name); }
    if (phone) { updates.push("phone = ?"); params.push(phone); }
    if (address) { updates.push("address = ?"); params.push(address); }
    if (gender) { updates.push("gender = ?"); params.push(gender); }
    if (prakruti) { updates.push("prakruti = ?"); params.push(prakruti); }
    if (dob) { updates.push("dob = ?"); params.push(dob); }
    if (place) { updates.push("place = ?"); params.push(place); }
    if (qualifications) { updates.push("qualifications = ?"); params.push(qualifications); }

    if (updates.length === 0) {
        return res.status(400).json({ message: "No fields to update" });
    }

    params.push(id);

    const sql = `UPDATE users SET ${updates.join(", ")} WHERE id = ?`;

    db.run(sql, params, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Profile updated successfully" });
    });
});

// Change Password Endpoint
app.put('/api/change-password', async (req, res) => {
    const { userId, currentPassword, newPassword } = req.body;

    if (!userId || !currentPassword || !newPassword) {
        return res.status(400).json({ message: "All fields are required" });
    }

    db.get(`SELECT password FROM users WHERE id = ?`, [userId], async (err, user) => {
        if (err || !user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect current password" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        db.run(`UPDATE users SET password = ? WHERE id = ?`, [hashedPassword, userId], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Password updated successfully" });
        });
    });
});

// Update Patient Prakruti (From Quiz)
app.put('/api/patient/prakruti', (req, res) => {
    const { userId, prakruti, doshaScores } = req.body;
    db.run(`UPDATE users SET prakruti = ?, dosha_scores = ? WHERE id = ?`,
        [prakruti, JSON.stringify(doshaScores), userId],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });

            // Also save to history
            const today = new Date().toISOString().split('T')[0];
            db.run(`INSERT INTO dosha_history (patient_id, vata, pitta, kapha, type, date) VALUES (?, ?, ?, ?, ?, ?)`,
                [userId, doshaScores.vata, doshaScores.pitta, doshaScores.kapha, prakruti, today],
                (err2) => {
                    if (err2) console.error("History save error:", err2);
                    res.json({ message: "Prakruti and history updated successfully" });
                }
            );
        }
    );
});

// Get Dosha History
app.get('/api/patient/dosha-history/:userId', (req, res) => {
    const { userId } = req.params;
    db.all(`SELECT * FROM dosha_history WHERE patient_id = ? ORDER BY date ASC`, [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// --- Notifications ---

// Get Notifications
app.get('/api/notifications/:userId', (req, res) => {
    const { userId } = req.params;
    db.all(`SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC`, [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Mark Notification as Read
app.put('/api/notifications/:id/read', (req, res) => {
    const { id } = req.params;
    db.run(`UPDATE notifications SET is_read = 1 WHERE id = ?`, [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Notification marked as read" });
    });
});


// --- System Settings Routes ---

// Get all settings
app.get('/api/settings', (req, res) => {
    db.all(`SELECT * FROM system_settings`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const settings = {};
        rows.forEach(r => {
            // Convert types
            if (r.type === 'boolean') settings[r.key] = r.value === 'true';
            else if (r.type === 'number') settings[r.key] = Number(r.value);
            else settings[r.key] = r.value;
        });
        res.json(settings);
    });
});

// Update setting
app.post('/api/settings/update', (req, res) => {
    const { key, value, updated_by } = req.body;

    // Log audit
    const logDetails = `Updated ${key} to ${value}`;
    db.run(`INSERT INTO audit_logs (action, details, performed_by) VALUES ('UPDATE_SETTING', ?, ?)`, [logDetails, updated_by || 'Admin']);

    db.run(`UPDATE system_settings SET value = ?, updated_by = ?, last_updated = CURRENT_TIMESTAMP WHERE key = ?`,
        [String(value), updated_by || 'Admin', key],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Setting updated", key, value });
        }
    );
});

// Trigger Backup
app.post('/api/system/backup', (req, res) => {
    const { triggered_by } = req.body;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = `./backups/backup-${timestamp}.sqlite`;

    // Create backup logic (copy file)
    // Ensure backups dir exists
    import('fs').then(fs => {
        if (!fs.existsSync('./backups')) {
            fs.mkdirSync('./backups');
        }
        fs.copyFile('./database.sqlite', backupFile, (err) => {
            if (err) return res.status(500).json({ error: "Backup failed: " + err.message });

            // Log audit
            db.run(`INSERT INTO audit_logs (action, details, performed_by) VALUES ('SYSTEM_BACKUP', 'Manual backup created', ?)`, [triggered_by || 'Admin']);

            res.json({ message: "Backup successful", file: backupFile });
        });
    });
});


// Email Verification Endpoint
app.get('/api/verify-email', (req, res) => {
    const { token } = req.query;

    if (!token) return res.status(400).send("Invalid token");

    db.get(`SELECT * FROM users WHERE verification_token = ?`, [token], (err, user) => {
        if (err) return res.status(500).send("Database error");
        if (!user) return res.status(400).send("Invalid or expired token");

        db.run(`UPDATE users SET is_verified = 1, verification_token = NULL WHERE id = ?`, [user.id], (err) => {
            if (err) return res.status(500).send("Error updating user");
            res.send("<h1>Email Verified Successfully!</h1><p>You can now <a href='http://localhost:5173/login'>login here</a>.</p>");
        });
    });
});

// Jivha Pariksha AI Analysis Endpoint (Real Image Processing)
app.post('/api/analyze-tongue', async (req, res) => {
    try {
        const { image } = req.body;
        if (!image) return res.status(400).json({ message: "No image provided" });

        // Decode Base64
        const buffer = Buffer.from(image.replace(/^data:image\/\w+;base64,/, ""), 'base64');

        // Load Image with Jimp
        const jimg = await Jimp.read(buffer);

        // Resize for performance & Center Crop (ROI)
        jimg.resize({ w: 200 });
        const width = jimg.width;
        const height = jimg.height;

        // Analyze center 50% of the image (Tongue area usually)
        let rTotal = 0, gTotal = 0, bTotal = 0;
        let luminanceTotal = 0;
        let pixelCount = 0;
        const pixelValues = []; // For variance/texture calculation

        jimg.scan(width * 0.25, height * 0.25, width * 0.5, height * 0.5, (x, y, idx) => {
            const r = jimg.bitmap.data[idx + 0];
            const g = jimg.bitmap.data[idx + 1];
            const b = jimg.bitmap.data[idx + 2];

            rTotal += r;
            gTotal += g;
            bTotal += b;

            // Luminance (perceived brightness)
            const lum = 0.299 * r + 0.587 * g + 0.114 * b;
            luminanceTotal += lum;
            pixelValues.push(lum);

            pixelCount++;
        });

        const rAvg = rTotal / pixelCount;
        const gAvg = gTotal / pixelCount;
        const bAvg = bTotal / pixelCount;
        const brightness = luminanceTotal / pixelCount;

        // Texture Analysis: Standard Deviation of Luminance
        const mean = brightness;
        const variance = pixelValues.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / pixelCount;
        const stdDev = Math.sqrt(variance);

        // Convert RGB to HSV for better color classification
        const rNorm = rAvg / 255, gNorm = gAvg / 255, bNorm = bAvg / 255;
        const max = Math.max(rNorm, gNorm, bNorm), min = Math.min(rNorm, gNorm, bNorm);
        const diff = max - min;

        let hue = 0;
        let saturation = max === 0 ? 0 : diff / max;

        if (max === min) {
            hue = 0;
        } else {
            switch (max) {
                case rNorm: hue = (gNorm - bNorm) / diff + (gNorm < bNorm ? 6 : 0); break;
                case gNorm: hue = (bNorm - rNorm) / diff + 2; break;
                case bNorm: hue = (rNorm - gNorm) / diff + 4; break;
            }
            hue /= 6;
        }

        console.log(`[ANALYSIS LOG] R:${rAvg.toFixed(0)} G:${gAvg.toFixed(0)} B:${bAvg.toFixed(0)} | H:${(hue * 360).toFixed(0)} S:${(saturation * 100).toFixed(0)}% V:${(max * 100).toFixed(0)}% | Texture(StdDev):${stdDev.toFixed(2)}`);

        // --- EXPERT SYSTEM RULES ---

        let primaryDosha = "Pitta"; // Defaulting to Pitta if unsure (common)
        let colorDesc = "Pinkish (Normal)";
        let coatingDesc = "Healthy";
        let amaPresence = "No";
        let agniStatus = "Balanced (Samagni)";
        let insights = [];

        // Rule 1: COATING (Kapha/Ama) - Determined by High Brightness & Low Saturation (White/Grey)
        // If image is very bright and pale
        if (brightness > 130 && saturation < 0.3) {
            primaryDosha = "Kapha";
            colorDesc = "Pale / Whitish";
            coatingDesc = "Thick White Coating";
            amaPresence = "Yes (High)";
            agniStatus = "Suppressed (Mandagni)";
            insights.push("Significant white coating indicates excess Kapha and Ama (toxins).");
            insights.push("Digestive fire is weak; avoid cold, heavy, and oily foods.");
        }
        // Rule 2: INFLAMMATION (Pitta) - Determined by Red Hue (approx 340-360 or 0-20) and High Saturation
        else if ((hue * 360 > 330 || hue * 360 < 25) && saturation > 0.35) {
            primaryDosha = "Pitta";
            colorDesc = "Red / Crimson";
            coatingDesc = "Yellowish / Thin";
            agniStatus = "High (Tikshnagni)";
            insights.push("Red tongue color signals Pitta (Heat) aggravation in the GI tract.");
            insights.push("You may experience acidity or heartburn.");
        }
        // Rule 3: DRYNESS/ROUGHNESS (Vata) - Determined by Texture (High StdDev) or Dark Color
        else if (stdDev > 40 || brightness < 80) {
            primaryDosha = "Vata";
            colorDesc = "Dark / Brownish";
            coatingDesc = "Dry / Cracked";
            agniStatus = "Irregular (Vishamagni)";
            insights.push("Rough texture/cracks indicate Vata dryness and stress.");
            insights.push("Irregular digestion detected; regular warm meals needed.");
        }
        else {
            // Balanced / Tridosha
            primaryDosha = "Vata-Pitta";
            colorDesc = "Pink (Healthy)";
            insights.push("Tongue appears relatively healthy with minor fluctuations.");
        }

        // Fallback / Secondary logic could be added here

        // Refine Insights based on Dosha
        if (primaryDosha === 'Vata') insights.push("Focus on regular routines and warm meals.");
        if (primaryDosha === 'Pitta') insights.push("Avoid spicy, sour, and salty foods that increase heat.");
        if (primaryDosha === 'Kapha') insights.push("Engage in regular exercise and consume light, warm spices.");

        res.json({
            capture_status: "Accepted",
            tongue_observation: {
                color: colorDesc,
                coating: coatingDesc,
                texture: brightness > 180 ? "Smooth / Wet" : "Rough / Dry",
                moisture: brightness > 180 ? "High" : "Low"
            },
            dosha_analysis: {
                primary_dosha: primaryDosha,
                secondary_dosha: "Vata", // Default secondary for now
                balance_status: primaryDosha === 'Pitta' ? "Aggravated" : "Imbalanced"
            },
            digestive_assessment: {
                ama_presence: amaPresence,
                agni_status: agniStatus
            },
            ayurvedic_insights: insights,
            confidence_score: "85%", // Static for heuristic
            disclaimer: "This analysis is AI-assisted using Computer Vision processing. It is not a medical diagnosis."
        });

    } catch (error) {
        console.error("Analysis Error:", error);
        res.status(500).json({ message: "Analysis failed", error: error.message });
    }
});

// Routes
app.post('/api/register', async (req, res) => {
    const { name, email, password, role, phone, address, gender, dob, place, qualifications } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const sql = `INSERT INTO users (name, email, password, role, phone, address, gender, dob, place, qualifications, is_verified, verification_token) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`;
    const params = [name, email, hashedPassword, role || 'patient', phone, address, gender, dob, place, qualifications, verificationToken];

    db.run(sql, params, function (err) {
        if (err) {
            if (err.message.includes("UNIQUE constraint failed")) {
                return res.status(400).json({ message: "Email already exists" });
            }
            return res.status(500).json({ message: "Database error", error: err.message });
        }

        const verificationLink = `http://localhost:${PORT}/api/verify-email?token=${verificationToken}`;
        console.log(`[DEV] Verification Link for ${email}: ${verificationLink}`);

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Verify your AyurPulse Account',
            html: `<p>Please verify your email by clicking the link below:</p>
                   <a href="${verificationLink}">${verificationLink}</a>`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log("Error sending email:", error);
                // Ideally, rollback user creation here, but for now we just warn
            } else {
                console.log('Email sent: ' + info.response);
                console.log('Preview URL: ' + nodemailer.getTestMessageUrl(info));
            }
        });

        res.status(201).json({
            message: "Registration successful. Please check your email to verify your account."
        });
    });
});

app.post('/api/login', (req, res) => {
    const { email, password, otp } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    const sql = `SELECT * FROM users WHERE email = ?`;
    db.get(sql, [email], async (err, user) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err.message });
        }
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        console.log(`[LOGIN ATTEMPT] Email: ${email}, Found User: ${user ? user.email : 'None'}, Verified: ${user ? user.is_verified : 'N/A'}`);
        if (!user.is_verified) {
            return res.status(403).json({ message: "Please verify your email before logging in." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // 2FA Logic
        if (user.role === 'doctor') {
            db.get(`SELECT value FROM system_settings WHERE key = 'security_2fa'`, [], (err, row) => {
                const is2FaEnabled = row && row.value === 'true';

                if (is2FaEnabled) {
                    if (!otp) {
                        return res.status(200).json({ status: "2FA_REQUIRED", message: "Enter OTP" });
                    }
                    // Verify Mock OTP
                    if (otp !== '123456') {
                        return res.status(400).json({ message: "Invalid OTP" });
                    }
                }

                // Proceed to login
                const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
                res.json({
                    message: "Login successful",
                    user: { id: user.id, name: user.name, email: user.email, role: user.role },
                    token
                });
            });
        } else {
            // Patient Login
            const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
            res.json({
                message: "Login successful",
                user: { id: user.id, name: user.name, email: user.email, role: user.role },
                token
            });
        }
    });
});

// Get Patient Health Score
app.get('/api/patient/health-score/:patientId', (req, res) => {
    const { patientId } = req.params;

    // Calculate health score based on multiple factors
    db.all(`SELECT * FROM clinical_records WHERE patient_id = ? ORDER BY date DESC LIMIT 10`, [patientId], (err, records) => {
        if (err) return res.status(500).json({ error: err.message });

        let score = 70; // Base score

        if (records.length === 0) {
            return res.json({ score: 65, trend: 'stable', lastUpdated: null });
        }

        // Parse and analyze vitals from recent records
        let vitalsScore = 0;
        let vitalsCount = 0;

        records.forEach(record => {
            if (record.vitals) {
                try {
                    const vitals = JSON.parse(record.vitals);
                    let recordScore = 100;

                    // BP scoring (optimal: 120/80)
                    if (vitals.bp) {
                        const bp = vitals.bp.split('/');
                        const systolic = parseInt(bp[0]);
                        const diastolic = parseInt(bp[1]);

                        if (systolic >= 110 && systolic <= 130 && diastolic >= 70 && diastolic <= 85) {
                            recordScore += 5;
                        } else if (systolic > 140 || diastolic > 90) {
                            recordScore -= 10;
                        }
                    }

                    // Pulse scoring (optimal: 60-100)
                    if (vitals.pulse) {
                        const pulse = parseInt(vitals.pulse);
                        if (pulse >= 60 && pulse <= 100) {
                            recordScore += 5;
                        } else {
                            recordScore -= 5;
                        }
                    }

                    // Temperature scoring (optimal: 97-99°F)
                    if (vitals.temp) {
                        const temp = parseFloat(vitals.temp);
                        if (temp >= 97 && temp <= 99) {
                            recordScore += 3;
                        } else {
                            recordScore -= 5;
                        }
                    }

                    vitalsScore += recordScore;
                    vitalsCount++;
                } catch (e) {
                    console.error('Error parsing vitals:', e);
                }
            }
        });

        if (vitalsCount > 0) {
            score = Math.round(vitalsScore / vitalsCount);
        }

        // Cap score between 0-100
        score = Math.max(0, Math.min(100, score));

        // Determine trend by comparing first and last records
        let trend = 'stable';
        if (records.length > 1) {
            const recentDate = new Date(records[0].date);
            const olderDate = new Date(records[records.length - 1].date);

            // Simple trend based on record frequency (more recent visits = improving care)
            const daysDiff = (recentDate - olderDate) / (1000 * 60 * 60 * 24);
            if (daysDiff < 30) trend = 'improving';
        }

        res.json({
            score,
            trend,
            lastUpdated: records[0].date,
            recordsAnalyzed: records.length
        });
    });
});

// Get Blood Reports
app.get('/api/patient/blood-reports/:patientId', (req, res) => {
    const { patientId } = req.params;

    db.all(`SELECT * FROM clinical_records WHERE patient_id = ? AND (
        diagnosis LIKE '%blood%' OR 
        diagnosis LIKE '%test%' OR 
        diagnosis LIKE '%lab%' OR
        complaints LIKE '%blood%' OR
        complaints LIKE '%test%'
    ) ORDER BY date DESC`, [patientId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        const records = rows.map(r => ({
            ...r,
            vitals: r.vitals ? JSON.parse(r.vitals) : {},
            prescription: r.prescription ? JSON.parse(r.prescription) : []
        }));

        res.json(records);
    });
});

// Get Prescriptions
app.get('/api/patient/prescriptions/:patientId', (req, res) => {
    const { patientId } = req.params;

    db.all(`SELECT * FROM clinical_records WHERE patient_id = ? AND prescription IS NOT NULL AND prescription != '[]' ORDER BY date DESC`, [patientId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        const records = rows.map(r => ({
            ...r,
            vitals: r.vitals ? JSON.parse(r.vitals) : {},
            prescription: r.prescription ? JSON.parse(r.prescription) : []
        })).filter(r => r.prescription.length > 0);

        res.json(records);
    });
});


// --- AyurGPT Clinical Decision Support API ---

// 1. Search Diseases / Symptoms
app.get('/api/ayurgpt/search', (req, res) => {
    const { q } = req.query;
    if (!q) return res.json([]);

    const sql = `
        SELECT id, disease_name_english, disease_name_ayurvedic, brief_description 
        FROM diseases 
        WHERE disease_name_english LIKE ? OR disease_name_ayurvedic LIKE ? OR brief_description LIKE ?
    `;
    const searchParam = `%${q}%`;
    db.all(sql, [searchParam, searchParam, searchParam], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 2. Get Full Disease Details (Knowledge Graph)
app.get('/api/ayurgpt/disease/:id', (req, res) => {
    const { id } = req.params;

    const response = {};

    db.get('SELECT * FROM diseases WHERE id = ?', [id], (err, disease) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!disease) return res.status(404).json({ message: "Disease not found" });

        response.disease = disease;

        // Parallel fetching of related data
        const queries = [
            // Symptoms
            new Promise((resolve) => {
                db.all('SELECT symptom_type, symptom_description FROM symptoms WHERE disease_id = ?', [id], (err, rows) => resolve({ symptoms: rows || [] }));
            }),
            // Causes
            new Promise((resolve) => {
                db.all('SELECT cause_description FROM causes WHERE disease_id = ?', [id], (err, rows) => resolve({ causes: rows || [] }));
            }),
            // Treatments
            new Promise((resolve) => {
                db.all('SELECT treatment_principle FROM treatments WHERE disease_id = ?', [id], (err, rows) => resolve({ treatments: rows || [] }));
            }),
            // Medicines
            new Promise((resolve) => {
                const sql = `
                    SELECT m.medicine_name, m.form, m.dosage, m.timing, m.anupana, dm.usage_type, dm.stage 
                    FROM disease_medicines dm
                    JOIN medicines m ON dm.medicine_id = m.id
                    WHERE dm.disease_id = ?
                `;
                db.all(sql, [id], (err, rows) => resolve({ medicines: rows || [] }));
            }),
            // Pathyam/Apathyam
            new Promise((resolve) => {
                db.all('SELECT instruction FROM pathyam WHERE disease_id = ?', [id], (err, rows) => resolve({ pathyam: rows || [] }));
            }),
            new Promise((resolve) => {
                db.all('SELECT instruction FROM apathyam WHERE disease_id = ?', [id], (err, rows) => resolve({ apathyam: rows || [] })); // Fixed table name from previous step context
            }),
            // Investigations
            new Promise((resolve) => {
                db.all('SELECT investigation_name FROM investigations WHERE disease_id = ?', [id], (err, rows) => resolve({ investigations: rows || [] }));
            })
        ];

        Promise.all(queries).then(results => {
            results.forEach(result => Object.assign(response, result));
            res.json(response);
        }).catch(err => {
            res.status(500).json({ error: "Data retrieval failed", details: err.message });
        });
    });
});

// 3. AyurGPT Chat / RAG Endpoint
// AyurGPT: Guardrailed Retrieval Agent
const knowledgeBase = [
    // Head
    {
        keywords: ["patches", "hair loss", "round", "alopecia", "areata", "indraluptam"],
        description: "This is known as Alopecia Areata (Indraluptam), which presents as round, irregular, patchy hair loss surrounded by otherwise normal hair.",
        cause: "It is considered an autoimmune disorder where Kapharodham (blockage by Kapha) and Raktaja krmi (microscopic organisms) block hair growth.",
        treatment: "The principle involves Krmihara (anti-parasitic) and Lekhana (scraping) therapies. Common applications include rubbing Indravaruni on the patch or applying Nilibhrngadi tailam."
    },
    {
        keywords: ["thinning", "falling", "gradually", "hair", "loss", "khalityam", "hair loss"],
        description: "This is general Hair Loss (Khalityam), often seen as a symptom of tissue depletion (Asthi kşaya) or circulatory disturbances (Rasa vaha srotodusti).",
        cause: "Factors include aging, heredity, stress, poor hygiene, or underlying conditions like anaemia and hypothyroidism.",
        treatment: "Focuses on Kesya (hair-strengthening) and Asthi pustikara (bone/tissue nourishing) treatments. Medicines like Saptamrta loham and oils like Kayyunyadi tailam are commonly used."
    },
    {
        keywords: ["grey", "gray", "white", "hair", "young", "premature", "palityam"],
        description: "This is Premature Greying (Akāla Palityam), where hair loses its color due to an increase in the body's 'heat' or Pitta.",
        cause: "It is caused by extreme worry, stress, familial history, or deficiencies in trace minerals.",
        treatment: "The goal is to balance Pitta using cooling medicines like Amalaki rasayanam. Externally, applying Prapoundarikādi tailam helps nourish the hair."
    },
    {
        keywords: ["itchy", "scalp", "white flakes", "dandruff", "seborrhoea", "darunaka"],
        description: "This is Seborrhoea or Dandruff (Darunaka), which involves dry or greasy scaling of the scalp with occasional itching.",
        cause: "It is caused by an increase in the dryness (Ruksa) of Vata and can be triggered by stress, lack of hygiene, or environmental changes.",
        treatment: "Focuses on oil-based treatments (Snigdha). A common remedy is applying Trphala curnam mixed with sour buttermilk to the scalp for 10 minutes."
    },
    {
        keywords: ["unsteady", "walking", "memory", "hydrocephalus", "jalasi"],
        description: "These can be symptoms of Normal Pressure Hydrocephalus (Jalasi rs akam), which causes gait disturbances and dementia.",
        cause: "It results from an accumulation of fluid in the head (Jalavr ddhi) due to trauma, tumors, or previous infections.",
        treatment: "Focuses on reducing swelling (Sophaghna) and using medicines that increase urine output (Mutrala) to drain fluid. Punarnavadi kasayam is a common prescription."
    },
    // Ear
    {
        keywords: ["ear", "pain", "pus", "discharge", "otitis"],
        description: "This is Acute Otitis Media (Karna sravam), characterized by severe ear pain and inflammation of the eardrum.",
        cause: "It is typically caused by a bacterial, viral, or fungal infection of the middle ear.",
        treatment: "The goal is wound healing (Vrana ropana). You should keep the ear dry by using clean cotton earplugs during bath and travel and avoid using ear picks."
    },
    {
        keywords: ["itching", "ringing", "ear", "fungus", "puti karnam"],
        description: "This is Fungus in the Ear (Puti karnam), which causes inflammation of the outer ear, itching, and a ringing sensation.",
        cause: "It is caused by various fungi such as Aspergillus or Candida species.",
        treatment: "Treatment involves anti-parasitic (Krmihara) and moisture-clearing (Kledahara) therapies. You must avoid head baths and swimming to prevent water from entering the ear."
    },
    {
        keywords: ["spinning", "vertigo", "buzzing", "meniere", "bhrama"],
        description: "This is Meniere's Disease (Bhrama), characterized by vertigo, tinnitus (buzzing), and a sensation of fullness in the ear.",
        cause: "It is caused by an increased collection of fluid in the inner ear.",
        treatment: "Focuses on balancing Pitta and Vata. During an attack, bed rest in a dark, quiet room is recommended. Avoid spicy, oily, and acidic foods."
    },
    // Nose
    {
        keywords: ["headache", "blocked", "nose", "sinusitis", "pinasa"],
        description: "This is Chronic Sinusitis (Dusta Pinasa), where a constant headache is the primary symptom along with nasal congestion.",
        cause: "It results from viral infections, severe allergies, or environmental pollutants.",
        treatment: "Management involves Kaphahara (mucus-clearing) therapy. Avoid cold environments, dust, and consuming curd at night."
    },
    {
        keywords: ["nose", "bleed", "bleeding", "epistaxis"],
        description: "This is Epistaxis (Nasa rakta pitta), where bleeding usually occurs from the front part of the nasal septum.",
        cause: "Common causes include nose pricking, dry winter air, long-term use of aspirin, or severe hypertension.",
        treatment: "Treatment focuses on stopping the blood (Rakta stambhana). You should eat sweet-dominant foods like bananas and apples and avoid sunlight exposure and spicy garlic."
    },
    // Throat
    {
        keywords: ["hoarse", "voice", "sore", "throat", "laryngitis"],
        description: "This is Acute Laryngitis (Svarabheda), which causes an unnatural change or loss of voice.",
        cause: "It is caused by viral infections like the common cold, excessive straining of the voice, or smoking.",
        treatment: "The most important steps are voice rest and salt water gargling. Avoid cold food and water."
    },
    {
        keywords: ["ulcer", "mouth", "spicy", "sting", "mukha paka"],
        description: "This is an Oral Ulcer (Mukha Paka), which involves pain that worsens with hot or spicy food.",
        cause: "Common triggers include Vitamin B12 deficiency, smoking, stress, and acid peptic disease.",
        treatment: "Focuses on healing and cooling (Pitta samana). Use buttermilk and green leafy vegetables in the diet and avoid coffee and tea."
    },
    {
        keywords: ["tonsils", "tonsilitis", "swallow", "pain"],
        description: "This is Tonsilitis (Tundikeri), causing a sore throat, fever, and difficulty in swallowing (dysphagia).",
        cause: "It is caused by bacterial or viral infections.",
        treatment: "Treatment involves reducing inflammation (Sophaghna) and balancing Vata-Pitta. Use warm water processed with ginger (Sunti) and perform salt water gargling."
    },
    // Eye
    {
        keywords: ["red", "eye", "sticky", "conjunctivitis", "madras eye"],
        description: "This is Conjunctivitis (Netra Abhisyanda), which presents as redness, eye pain, and a sticky, purulent, or watery discharge.",
        cause: "It is typically caused by a viral, bacterial, or fungal infection and can often occur as an epidemic.",
        treatment: "Focuses on balancing Pitta and Kapha. You should wash your eyes frequently, use separate handkerchiefs for wiping, and wear spectacles to protect the eyes."
    },
    {
        keywords: ["sharp", "pain", "foreign", "body", "ulcer", "cornea"],
        description: "This is likely a Corneal Ulcer (Krisna Mandala Vrana), characterized by pain, a foreign body sensation, and increased tearing.",
        cause: "Common causes include an injury to the cornea or a deficiency in Vitamin A and protein.",
        treatment: "Management involves cooling Pitta and using healing (Ropana) drugs. You should protect the eye with a pad or bandage and include ghee and carrots in your diet."
    },
    {
        keywords: ["blurred", "shadowy", "diabetic", "retinopathy"],
        description: "This is Diabetic Retinopathy, which may have no symptoms until it is severe, eventually leading to blurred vision, floaters, and shadows in your sight.",
        cause: "It is a complication of diabetes mellitus that damages the blood vessels of the retina.",
        treatment: "The primary goal is to control your diabetes and blood pressure. Ayurveda uses cooling and blood-stabilizing therapies (Rakta prasadana)."
    },
    // Nervous
    {
        keywords: ["wrist", "drop", "limp", "hand"],
        description: "This is Acute Wrist Drop, where a person cannot extend their wrist, and it hangs flaccidly.",
        cause: "It can be caused by persistent injury to the radial nerve, lead poisoning, alcoholism, or diabetes mellitus.",
        treatment: "Treatment involves Avarana vata and Visvaci therapy. Patients should avoid resting their head on their wrist while sleeping and may require physiotherapy."
    },
    {
        keywords: ["face", "weak", "one side", "bells", "palsy"],
        description: "This is Bell's Palsy (Arditam), which causes weakness of one side of the face, numbness, and sometimes the inability to close an eye (ptosis).",
        cause: "It is often caused by a viral infection creating pressure on the nerves or sudden exposure to cold.",
        treatment: "Focuses on Avarana vata and Kapha vata hara therapies. Helpful exercises include blowing balloons, and the diet should include butter and garlic."
    },
    {
        keywords: ["burning", "feet", "tingling", "diabetic", "neuropathy"],
        description: "This is Diabetic Neuropathy, which often causes deep pain, numbness, tingling, or a burning sensation in the extremities, especially the feet.",
        cause: "It results from chronic and uncontrolled diabetes.",
        treatment: "The primary goal is to control blood sugar through diet and exercise. Patients should always wear footwear and maintain strict foot hygiene."
    },
    {
        keywords: ["migraine", "throbbing", "headache", "one side", "nauseous"],
        description: "This is a Migraine (Surya vartam), characterized by throbbing unilateral pain worsened by sound, smell, or physical activity.",
        cause: "It is considered a neurovascular disease often linked to gastrointestinal disturbances.",
        treatment: "Focuses on balancing Pitta and Vata. It is important to sleep well, eat meals on time, and include ginger in the diet."
    },
    // Respiratory
    {
        keywords: ["shortness", "breath", "asthma", "tightness", "wheezing"],
        description: "This is Asthma (Svasa), characterized by mild to severe shortness of breath, coughing, and wheezing.",
        cause: "It is triggered by inhaling allergens like pollen, dust mites, or cigarette smoke, and can also be caused by viral infections.",
        treatment: "The goal is to clear Kapha and Vata and normalize the movement of air (Anulomana). You should consume warm food, drink luke-warm water, and avoid dust or vigorous exercise."
    },
    {
        keywords: ["cough", "phlegm", "chronic", "bronchitis"],
        description: "This is Chronic Bronchitis (Cirakāri kaphaja kāsa), involving a long-term cough that produces phlegm.",
        cause: "It is most commonly caused by chronic smoking or untreated acute infections.",
        treatment: "Focuses on balancing Vata and Kapha. It is recommended to practice Pranayama, consume warm meals, and have dinner early, between 7 p.m. and 8 p.m."
    },
    {
        keywords: ["snore", "snoring", "sleep", "apnea", "headache"],
        description: "These are symptoms of Sleep Apnoea, which involves snoring, disturbed sleep, and morning headaches.",
        cause: "Often caused by obesity, a narrow upper airway, or reduced muscle tone in the throat.",
        treatment: "The principle is to clear the respiratory channels (Pranavaha śroto sodhanam). Practicing Pranayama and Kapālabhāti is recommended, while sweets and cold baths should be avoided."
    },
    // Psychiatric
    {
        keywords: ["frightened", "anxiety", "racing", "heart", "fear"],
        description: "This is Anxiety (Citta udvega), which can cause a person to feel sick or frightened during short periods.",
        cause: "It is a Vataja disturbance of the mind (Citta dusti) often accompanied by skeletal muscle tension.",
        treatment: "Management focuses on Medhya (brain-tonic) and Vata-Pitta balancing therapies. Beneficial practices include meditation, listening to music, and walking."
    },
    {
        keywords: ["gloomy", "depression", "sad", "hopeless"],
        description: "This is Depression (Visāda roga), where a person feels hopeless and suffers from a loss of self-esteem.",
        cause: "It is characterized by an increase in the Manda (slow) quality of Kapha, which slows down thinking, speech, and movements.",
        treatment: "Treatment involves Kaphahara (Kapha-reducing) and Medhya rasayana (rejuvenative brain tonics) therapies. Engaging the mind in interesting hobbies and practicing prayer or meditation is highly recommended."
    },
    {
        keywords: ["tired", "obesity", "fat", "weight"],
        description: "This is Obesity (Sthoulyam), characterized by fatigue and decreased physical and social activities.",
        cause: "It is caused by a high-calorie diet and physical inactivity, leading to an increase in Kapha and Medo (fat) tissue.",
        treatment: "The goal is to reduce Kapha and 'scrape' away excess fat (Medohara). Taking honey with cold water in the morning and practicing daily exercise is recommended."
    }
];

// 3. AyurGPT Chat / RAG Endpoint
app.post('/api/ayurgpt/chat', (req, res) => {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "Query is required" });

    const q = query.toLowerCase();
    const words = q.split(/\s+/).filter(w => w.length > 3); // simple tokenization

    // Simple Scoring Algorithm
    let bestMatch = null;
    let maxScore = 0;

    knowledgeBase.forEach(entry => {
        let score = 0;
        entry.keywords.forEach(k => {
            if (q.includes(k.toLowerCase())) score += 2; // Exact keyword match in query
        });

        // Also check description for deeper semantic match
        const descWords = entry.description.toLowerCase().split(/\s+/);
        words.forEach(w => {
            if (descWords.includes(w)) score += 0.5;
        });

        if (score > maxScore) {
            maxScore = score;
            bestMatch = entry;
        }
    });

    // Disclaimer
    const disclaimer = "\n\n**(If the symptoms are severe then do visit our clinic and consult Doctor xyz)**";

    if (bestMatch && maxScore >= 2) { // Threshold for match logic
        // Construct Response
        let response = `**Description:** ${bestMatch.description}\n\n`;
        response += `**Cause:** ${bestMatch.cause}\n\n`;
        response += `**Treatment:** ${bestMatch.treatment}`;
        response += disclaimer;

        res.json({ answer: response });
    } else {
        // Fallback
        res.json({
            answer: "I'm sorry, I don't have specific information on that condition in my database. Please consult a professional for further guidance." + disclaimer
        });
    }
});

// 4. Medicine Search for Prescriptions
app.get('/api/medicines/search', (req, res) => {
    const { q } = req.query;
    if (!q) return res.json([]);

    const sql = `
        SELECT * FROM medicines 
        WHERE medicine_name LIKE ? OR form LIKE ?
        LIMIT 10
    `;
    const searchParam = `%${q}%`;
    db.all(sql, [searchParam, searchParam], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});




// Get Intern Anonymized Cases
app.get('/api/intern/cases', (req, res) => {
    const sql = `
    SELECT 
        u.id as patient_id, 
        u.gender, 
        u.dob, 
        u.prakruti,
        u.dosha_scores,
        cr.diagnosis,
        cr.complaints,
        cr.prescription,
        cr.date as diagnosis_date,
        pc.name as therapy_name,
        pc.status as therapy_status,
        pc.start_date as therapy_start_date
    FROM users u
    LEFT JOIN clinical_records cr ON u.id = cr.patient_id
    LEFT JOIN panchakarma_cycles pc ON u.id = pc.patient_id AND pc.status = 'active'
    WHERE u.role = 'patient' AND cr.diagnosis IS NOT NULL
    ORDER BY cr.date DESC
`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error("Error in /api/intern/cases:", err.message);
            return res.status(500).json({ error: err.message });
        }

        const anonymizedCases = rows.map(row => {
            let age = 'N/A';
            if (row.dob) {
                const diff = Date.now() - new Date(row.dob).getTime();
                age = Math.abs(new Date(diff).getUTCFullYear() - 1970);
            }

            return {
                id: `CASE-${1000 + row.patient_id}`, // Masked ID
                age,
                gender: row.gender,
                prakruti: row.prakruti || 'Unknown',
                dosha_scores: row.dosha_scores ? JSON.parse(row.dosha_scores) : null,
                diagnosis: row.diagnosis,
                complaints: row.complaints,
                prescription: row.prescription,
                last_updated: row.diagnosis_date,
                active_therapy: row.therapy_name || 'None',
                therapy_status: row.therapy_status,
                treatment_day: row.therapy_start_date ? Math.floor((Date.now() - new Date(row.therapy_start_date)) / (1000 * 60 * 60 * 24)) : null
            };
        });

        res.json(anonymizedCases);
    });
});

// --- Serve Frontend (Production Only) ---
if (process.env.NODE_ENV === 'production') {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // Serve static files from dist folder
    app.use(express.static(path.join(__dirname, '../dist')));

    // Catch-all handle for SPA
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../dist', 'index.html'));
    });
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`AyurGPT Active`);
});

