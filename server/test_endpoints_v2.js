
// ESM syntax for Node 22

async function test() {
    console.log('--- Testing AyurGPT Backend ---');

    try {
        // 1. Medicine Search
        console.log('\nTesting Medicine Search (q=Triph)...');
        const res1 = await fetch('http://localhost:5000/api/medicines/search?q=Triph');
        if (!res1.ok) {
            console.error('Search Failed:', res1.status, res1.statusText);
            const errBody = await res1.text();
            console.error('Body:', errBody);
        } else {
            const data1 = await res1.json();
            console.log('Search Status:', res1.status);
            console.log('Results Found:', data1.length);
            if (data1.length > 0) console.log('First:', data1[0]);
        }

        // 2. AyurGPT Chat
        console.log('\nTesting AyurGPT Chat (q=fever)...');
        const res2 = await fetch('http://localhost:5000/api/ayurgpt/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: 'What is fever?' })
        });

        if (!res2.ok) {
            console.error('Chat Failed:', res2.status);
            const errBody = await res2.text();
            console.error('Body:', errBody);
        } else {
            const data2 = await res2.json();
            console.log('Chat Status:', res2.status);
            console.log('Answer Preview:', data2.answer ? data2.answer.substring(0, 50) + '...' : 'No Answer');
        }

    } catch (err) {
        console.error('Test Script Error:', err);
    }
}

test();
