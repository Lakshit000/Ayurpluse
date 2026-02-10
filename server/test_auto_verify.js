
import http from 'http';

const uniqueId = Date.now();
const user = {
    name: `AutoVerify User ${uniqueId}`,
    email: `autoverify${uniqueId}@example.com`,
    password: 'password123',
    role: 'doctor', // Testing Doctor this time
    qualifications: 'MBBS'
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
        console.log(`1. Registering user ${user.email} (expecting auto-verify)...`);
        const regRes = await request('/api/register', 'POST', user);
        console.log(`Registration Response: ${regRes.statusCode} - ${regRes.body}`);

        if (regRes.statusCode !== 201) {
            console.error("Registration failed");
            process.exit(1);
        }

        console.log("2. Attempting Immediate Login (Testing Auto-Verify)...");
        const loginRes = await request('/api/login', 'POST', { email: user.email, password: user.password });
        console.log(`Login Response: ${loginRes.statusCode} - ${loginRes.body}`);

        if (loginRes.statusCode === 200) {
            console.log("SUCCESS: User logged in immediately without verification step.");
            process.exit(0);
        } else {
            console.error("FAILURE: Login failed. Auto-verify did not work.");
            process.exit(1);
        }

    } catch (e) {
        console.error("Error:", e);
    }
}

run();
