
const http = require('http');

function makeRequest(path, method = 'GET', body = null) {
    const options = {
        hostname: 'localhost',
        port: 5000,
        path: path,
        method: method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve({ status: res.statusCode, data: json });
                } catch (e) {
                    resolve({ status: res.statusCode, raw: data });
                }
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function runTests() {
    console.log('--- Testing AyurGPT Backend ---');

    try {
        // 1. Check Medicine Search
        console.log('\nTesting Medicine Search (q=Triphalam)...'); // Using a partial match
        const searchRes = await makeRequest('/api/medicines/search?q=Triph');
        console.log('Status:', searchRes.status);
        if (Array.isArray(searchRes.data)) {
            console.log('Results:', searchRes.data.length);
            if (searchRes.data.length > 0) console.log('First match:', searchRes.data[0].medicine_name);
        } else {
            console.log('Error:', searchRes);
        }

        // 2. Check AyurGPT Chat
        console.log('\nTesting AyurGPT Chat...');
        const chatRes = await makeRequest('/api/ayurgpt/chat', 'POST', { query: 'What is fever?' });
        console.log('Status:', chatRes.status);
        if (chatRes.data && chatRes.data.answer) {
            console.log('Answer received (preview):', chatRes.data.answer.substring(0, 50) + '...');
        } else {
            console.log('Error/No Answer:', chatRes);
        }

    } catch (err) {
        console.error('Test Failed:', err.message);
    }
}

runTests();
