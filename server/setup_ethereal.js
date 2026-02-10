import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

async function createTestAccount() {
    console.log("Generating Ethereal test account...");
    try {
        let testAccount = await nodemailer.createTestAccount();

        console.log("Ethereal Account created!");
        console.log("User: " + testAccount.user);

        const envPath = path.join(process.cwd(), '.env');
        let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

        // Simple replace or append
        const newLines = [
            `EMAIL_USER=${testAccount.user}`,
            `EMAIL_PASS=${testAccount.pass}`
        ];

        // Replace if exists, else append
        if (envContent.includes('EMAIL_USER=')) {
            envContent = envContent.replace(/EMAIL_USER=.*/g, `EMAIL_USER=${testAccount.user}`);
        } else {
            envContent += `\nEMAIL_USER=${testAccount.user}`;
        }

        if (envContent.includes('EMAIL_PASS=')) {
            envContent = envContent.replace(/EMAIL_PASS=.*/g, `EMAIL_PASS=${testAccount.pass}`);
        } else {
            envContent += `\nEMAIL_PASS=${testAccount.pass}`;
        }

        fs.writeFileSync(envPath, envContent);
        console.log(".env updated with test credentials.");

    } catch (err) {
        console.error("Failed to create test account:", err);
    }
}

createTestAccount();
