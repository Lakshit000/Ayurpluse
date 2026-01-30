
import sqlite3 from 'sqlite3';
import http from 'http';

const db = new sqlite3.Database('./database.sqlite');
const userId = 17; // Lakshit

db.get("SELECT * FROM users WHERE id = ?", [userId], (err, row) => {
    if (err) {
        console.error("DB Error:", err);
        process.exit(1);
    }
    if (!row) {
        console.error("User not found");
        process.exit(1);
    }

    console.log("Token Type:", typeof row.verification_token);
    console.log("Token Value:", row.verification_token);

    // Force string if buffer
    let token = row.verification_token;
    if (Buffer.isBuffer(token)) {
        console.log("Token is Buffer, converting to string...");
        token = token.toString();
    }

    console.log(`Using Token: ${token}`);

    // Ensure we don't have whitespace
    token = token.trim();

    const url = `http://localhost:5000/api/verify-email?token=${token}`;
    console.log(`Calling: ${url}`);

    http.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            console.log(`Response Status: ${res.statusCode}`);
            console.log(`Response Body: ${data}`);

            // Check DB again
            db.get("SELECT is_verified FROM users WHERE id = ?", [userId], (err, row) => {
                console.log(`Final Status: is_verified = ${row.is_verified}`);
                process.exit(0);
            });
        });
    }).on('error', err => {
        console.error("HTTP Error:", err);
        process.exit(1);
    });
});
