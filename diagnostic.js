// Test script to verify the AyurPulse setup
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🔍 AyurPulse Diagnostic Test\n');

// Test 1: Check if backend is running
function testBackend() {
    return new Promise((resolve) => {
        console.log('1️⃣  Testing Backend Server (http://localhost:5000)...');

        const req = http.get('http://localhost:5000/api/settings', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log('   ✅ Backend is running');
                    console.log('   Settings:', data.substring(0, 100) + '...');
                } else {
                    console.log(`   ⚠️  Backend returned status: ${res.statusCode}`);
                }
                resolve();
            });
        });

        req.on('error', (err) => {
            console.log('   ❌ Backend is NOT running:', err.message);
            resolve();
        });

        req.setTimeout(2000, () => {
            console.log('   ❌ Backend timeout - no response');
            req.destroy();
            resolve();
        });
    });
}

// Test 2: Check if frontend is running
function testFrontend() {
    return new Promise((resolve) => {
        console.log('\n2️⃣  Testing Frontend Server (http://localhost:5174)...');

        const req = http.get('http://localhost:5174', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log('   ✅ Frontend is running');
                    if (data.includes('AyurPulse')) {
                        console.log('   ✅ HTML contains AyurPulse');
                    }
                    if (data.includes('root')) {
                        console.log('   ✅ Root div found');
                    }
                    if (data.includes('main.jsx')) {
                        console.log('   ✅ React entry point linked');
                    }
                } else {
                    console.log(`   ⚠️  Frontend returned status: ${res.statusCode}`);
                }
                resolve();
            });
        });

        req.on('error', (err) => {
            console.log('   ❌ Frontend is NOT running:', err.message);
            console.log('   💡 Try running: npm run dev');
            resolve();
        });

        req.setTimeout(2000, () => {
            console.log('   ❌ Frontend timeout - no response');
            req.destroy();
            resolve();
        });
    });
}

// Test 3: Check database
function testDatabase() {
    return new Promise((resolve) => {
        console.log('\n3️⃣  Checking Database...');

        const dbPath = path.join(__dirname, 'database.sqlite');

        if (fs.existsSync(dbPath)) {
            const stats = fs.statSync(dbPath);
            console.log(`   ✅ Database file exists (${stats.size} bytes)`);
        } else {
            console.log('   ❌ Database file not found');
        }
        resolve();
    });
}

// Test 4: Test login
function testLogin() {
    return new Promise((resolve) => {
        console.log('\n4️⃣  Testing Doctor Login...');

        const postData = JSON.stringify({
            email: 'arushi@gmail.com',
            password: 'test123'
        });

        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': postData.length
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (res.statusCode === 200) {
                        console.log('   ✅ Login successful!');
                        console.log('   User:', json.user ? json.user.name : 'N/A');
                        console.log('   Role:', json.user ? json.user.role : 'N/A');
                    } else {
                        console.log(`   ❌ Login failed: ${json.message || data}`);
                    }
                } catch (e) {
                    console.log('   ❌ Invalid response:', data.substring(0, 100));
                }
                resolve();
            });
        });

        req.on('error', (err) => {
            console.log('   ❌ Login request failed:', err.message);
            resolve();
        });

        req.write(postData);
        req.end();
    });
}

// Run all tests
async function runTests() {
    await testBackend();
    await testFrontend();
    await testDatabase();
    await testLogin();

    console.log('\n📋 Diagnostic Complete!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Open http://localhost:5174 in your browser');
    console.log('  2. Press F12 to open Developer Tools');
    console.log('   3. Check the Console tab for errors');
    console.log('   4. Look for logs starting with [Main.jsx] and [App.jsx]');
    console.log('\n   If you see a blank page with console logs, the app is loading!');
    console.log('   If NO console logs appear, there is a JavaScript error.');
}

runTests().catch(console.error);
