
import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, 'database.sqlite');
const dataDir = path.resolve(__dirname, '../data');

const db = new sqlite3.Database(dbPath);

const readCsv = (filename) => {
    const filePath = path.join(dataDir, filename);
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        return [];
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim() !== '');
    const headers = lines[0].split(',').map(h => h.trim());

    return lines.slice(1).map(line => {
        // Handle CSV parsing considering potential commas in quotes if needed, 
        // but for now simple split assumes no commas in values
        // A robust regex for CSV split: 
        const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
        // Actually simple split is risky if descriptions have commas. 
        // Let's use a slightly better regex or just simple split if we know data is clean.
        // The provided data seems clean enough but let's be careful.
        // Re-implementing a simple CSV splitter:
        const row = {};
        let currentVal = '';
        let inQuotes = false;
        let colIndex = 0;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                row[headers[colIndex]] = currentVal.trim().replace(/^"|"$/g, '');
                currentVal = '';
                colIndex++;
            } else {
                currentVal += char;
            }
        }
        if (colIndex < headers.length) {
            row[headers[colIndex]] = currentVal.trim().replace(/^"|"$/g, '');
        }

        return row;
    });
};

const seed = () => {
    db.serialize(() => {
        // 1. Diseases
        db.run(`DROP TABLE IF EXISTS diseases`);
        db.run(`CREATE TABLE diseases (
            id TEXT PRIMARY KEY,
            disease_name_english TEXT,
            disease_name_ayurvedic TEXT,
            dosha_involvement TEXT,
            body_system TEXT,
            brief_description TEXT
        )`);

        const diseases = readCsv('disease_master.csv');
        const stmtDisease = db.prepare(`INSERT INTO diseases VALUES (?, ?, ?, ?, ?, ?)`);
        diseases.forEach(d => {
            stmtDisease.run(d.disease_id, d.disease_name_english, d.disease_name_ayurvedic, d.dosha_involvement, d.body_system, d.brief_description);
        });
        stmtDisease.finalize();
        console.log(`Inserted ${diseases.length} diseases.`);

        // 2. Symptoms
        db.run(`DROP TABLE IF EXISTS symptoms`);
        db.run(`CREATE TABLE symptoms (
            id TEXT PRIMARY KEY,
            disease_id TEXT,
            symptom_type TEXT,
            symptom_description TEXT,
            FOREIGN KEY(disease_id) REFERENCES diseases(id)
        )`);
        const symptoms = readCsv('symptoms.csv');
        const stmtSymptom = db.prepare(`INSERT INTO symptoms VALUES (?, ?, ?, ?)`);
        symptoms.forEach(s => {
            stmtSymptom.run(s.symptom_id, s.disease_id, s.symptom_type, s.symptom_description);
        });
        stmtSymptom.finalize();
        console.log(`Inserted ${symptoms.length} symptoms.`);

        // 3. Causes
        db.run(`DROP TABLE IF EXISTS causes`);
        db.run(`CREATE TABLE causes (
            id TEXT PRIMARY KEY,
            disease_id TEXT,
            cause_description TEXT,
            FOREIGN KEY(disease_id) REFERENCES diseases(id)
        )`);
        const causes = readCsv('causes.csv');
        const stmtCause = db.prepare(`INSERT INTO causes VALUES (?, ?, ?)`);
        causes.forEach(c => {
            stmtCause.run(c.cause_id, c.disease_id, c.cause_description);
        });
        stmtCause.finalize();
        console.log(`Inserted ${causes.length} causes.`);

        // 4. Investigations
        db.run(`DROP TABLE IF EXISTS investigations`);
        db.run(`CREATE TABLE investigations (
            id TEXT PRIMARY KEY,
            disease_id TEXT,
            investigation_name TEXT,
            FOREIGN KEY(disease_id) REFERENCES diseases(id)
        )`);
        const investigations = readCsv('investigations.csv');
        const stmtInv = db.prepare(`INSERT INTO investigations VALUES (?, ?, ?)`);
        investigations.forEach(i => {
            stmtInv.run(i.investigation_id, i.disease_id, i.investigation_name);
        });
        stmtInv.finalize();
        console.log(`Inserted ${investigations.length} investigations.`);

        // 5. Treatments
        db.run(`DROP TABLE IF EXISTS treatments`);
        db.run(`CREATE TABLE treatments (
            id TEXT PRIMARY KEY,
            disease_id TEXT,
            treatment_principle TEXT,
            FOREIGN KEY(disease_id) REFERENCES diseases(id)
        )`);
        const treatments = readCsv('treatment.csv');
        const stmtTreat = db.prepare(`INSERT INTO treatments VALUES (?, ?, ?)`);
        treatments.forEach(t => {
            stmtTreat.run(t.treatment_id, t.disease_id, t.treatment_principle);
        });
        stmtTreat.finalize();
        console.log(`Inserted ${treatments.length} treatments.`);

        // 6. Medicines
        db.run(`DROP TABLE IF EXISTS medicines`);
        db.run(`CREATE TABLE medicines (
            id TEXT PRIMARY KEY,
            medicine_name TEXT,
            dosage TEXT,
            timing TEXT,
            form TEXT,
            anupana TEXT,
            manufacturer TEXT
        )`);
        const medicines = readCsv('medical_master.csv');
        const stmtMed = db.prepare(`INSERT INTO medicines VALUES (?, ?, ?, ?, ?, ?, ?)`);
        medicines.forEach(m => {
            stmtMed.run(m.medicine_id, m.medicine_name, m.dosage, m.timing, m.form, m.anupana, m.manufacturer);
        });
        stmtMed.finalize();
        console.log(`Inserted ${medicines.length} medicines.`);

        // 7. Disease Medicines
        db.run(`DROP TABLE IF EXISTS disease_medicines`);
        db.run(`CREATE TABLE disease_medicines (
            id TEXT PRIMARY KEY,
            disease_id TEXT,
            medicine_id TEXT,
            usage_type TEXT,
            stage TEXT,
            FOREIGN KEY(disease_id) REFERENCES diseases(id),
            FOREIGN KEY(medicine_id) REFERENCES medicines(id)
        )`);
        const disMeds = readCsv('disease_medicine_master.csv');
        const stmtDisMed = db.prepare(`INSERT INTO disease_medicines VALUES (?, ?, ?, ?, ?)`);
        disMeds.forEach(dm => {
            stmtDisMed.run(dm.mapping_id, dm.disease_id, dm.medicine_id, dm.usage_type, dm.stage);
        });
        stmtDisMed.finalize();
        console.log(`Inserted ${disMeds.length} disease_medicine mappings.`);

        // 8. Pathyam
        db.run(`DROP TABLE IF EXISTS pathyam`);
        db.run(`CREATE TABLE pathyam (
            id TEXT PRIMARY KEY,
            disease_id TEXT,
            instruction TEXT,
            FOREIGN KEY(disease_id) REFERENCES diseases(id)
        )`);
        const pathyam = readCsv('pathyam.csv');
        const stmtPathyam = db.prepare(`INSERT INTO pathyam VALUES (?, ?, ?)`);
        pathyam.forEach(p => {
            stmtPathyam.run(p.pathyam_id, p.disease_id, p.instruction);
        });
        stmtPathyam.finalize();
        console.log(`Inserted ${pathyam.length} pathyam instructions.`);

        // 9. Apathyam
        db.run(`DROP TABLE IF EXISTS apathyam`);
        db.run(`CREATE TABLE apathyam (
            id TEXT PRIMARY KEY,
            disease_id TEXT,
            instruction TEXT,
            FOREIGN KEY(disease_id) REFERENCES diseases(id)
        )`);
        const apathyam = readCsv('apsthyam.csv'); // Note spelling in file vs variable
        const stmtApathyam = db.prepare(`INSERT INTO apathyam VALUES (?, ?, ?)`);
        apathyam.forEach(a => {
            stmtApathyam.run(a.apathyam_id, a.disease_id, a.instruction);
        });
        stmtApathyam.finalize();
        console.log(`Inserted ${apathyam.length} apathyam instructions.`);
    });
};

seed();
