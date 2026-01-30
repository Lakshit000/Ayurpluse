
import http from 'http';

const uniqueId = Date.now();
const user = {
    name: `Test User ${uniqueId}`,
    email: `test${uniqueId}@example.com`,
    password: 'password123',
    phone: '1234567890',
    address: 'Test Address',
    gender: 'Male',
    dob: '2000-01-01',
    place: 'Test Place',
    qualifications: 'None'
};

function request(path, method, body) {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: method,
            headers: { 'Content-Type': 'application/json' }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function run() {
    try {
        console.log(`1. Registering user ${user.email}...`);
        const regRes = await request('/api/register', 'POST', user);
        console.log(`Registration Response: ${regRes.statusCode} - ${regRes.body}`);

        if (regRes.statusCode !== 201) throw new Error("Registration failed");

        // In a real integration test we'd parse the server logs for the token.
        // For this script, we'll query the DB directly to get the token, ensuring the "Backend" part works.
        // The "Frontend" part (clicking the link) is simulated by calling the verify endpoint.

        const sqlite3 = (await import('sqlite3')).default;
        const db = new sqlite3.Database('./database.sqlite');

        db.get("SELECT verification_token FROM users WHERE email = ?", [user.email], async (err, row) => {
            if (err || !row) {
                console.error("Failed to fetch token from DB");
                process.exit(1);
            }

            const token = row.verification_token;
            console.log(`2. Found token: ${token}`);

            console.log("3. Verifying email...");
            const verifyRes = await request(`/api/verify-email?token=${token}`, 'GET');
            console.log(`Verification Response: ${verifyRes.statusCode}`); // Should be HTML 200

            console.log("4. Attempting Login...");
            const loginRes = await request('/api/login', 'POST', { email: user.email, password: user.password });
            console.log(`Login Response: ${loginRes.statusCode} - ${loginRes.body}`);

            if (loginRes.statusCode === 200) {
                console.log("SUCCESS: Full flow complete.");
                process.exit(0);
            } else {
                console.error("FAILURE: Login failed.");
                process.exit(1);
            }
        });

    } catch (e) {
        console.error("Error:", e);
    }
}

run();
