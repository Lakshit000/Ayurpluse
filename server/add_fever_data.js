
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, '../data');

const append = (file, line) => {
    fs.appendFileSync(path.join(dataDir, file), '\n' + line.trim());
};

// 1. Add Disease (Jwara/Fever)
append('disease_master.csv', 'D008,Fever,Jwara,Tridosha,Whole Body,Rise in body temperature due to imbalance of doshas affecting Agni');

// 2. Add Symptoms
append('symptoms.csv', 'S030,D008,Vital,High body temperature (Jwara vega)');
append('symptoms.csv', 'S031,D008,General,Loss of appetite (Aruchi)');
append('symptoms.csv', 'S032,D008,General,Body ache (Angamarda)');
append('symptoms.csv', 'S033,D008,General,Excessive Thirst (Trishna)');

// 3. Add Causes
append('causes.csv', 'C020,D008,Indigestion (Ajirna)');
append('causes.csv', 'C021,D008,Seasonal changes (Ritu sandhi)');

// 4. Add Treatment
append('treatment.csv', 'T008,D008,Langhana (Fasting) to handle Ama');
append('treatment.csv', 'T009,D008,Pachana (Digestive herbs)');

// 5. Add Medicines
append('medical_master.csv', 'M006,Sudarshan Churna,1 tsp,three times a day,churna,warm water,Dabur');
append('medical_master.csv', 'M007,Amrutottaram Kashayam,15 ml,morning and evening before food,kashayam,warm water,Kottakkal');

// 6. Link Medicines to Disease
append('disease_medicine_master.csv', 'DM020,D008,M006,Curative,Acute');
append('disease_medicine_master.csv', 'DM021,D008,M007,Curative,Acute');
append('disease_medicine_master.csv', 'DM022,D008,M003,Supportive,Convalescence'); // Triphala for post-fever

console.log('Fever data appended to CSVs.');
