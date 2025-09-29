// Debug script to test backend APIs
const http = require('http');

console.log('🔍 Debugging Backend APIs...\n');

// Test 1: Health check
console.log('1️⃣ Testing Health Check...');
const healthReq = http.request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/health',
    method: 'GET'
}, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        console.log('Health Status:', res.statusCode);
        console.log('Health Response:', data);
        testLogin();
    });
});

healthReq.on('error', (e) => {
    console.log('Health Error:', e.message);
});

healthReq.end();

// Test 2: Login
function testLogin() {
    console.log('\n2️⃣ Testing Login...');
    const loginData = JSON.stringify({
        email: 'demo@example.com',
        password: 'demo123'
    });

    const loginReq = http.request({
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': loginData.length
        }
    }, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            console.log('Login Status:', res.statusCode);
            console.log('Login Response:', data);
            
            try {
                const response = JSON.parse(data);
                if (response.token) {
                    console.log('✅ Login successful!');
                    testIdeas(response.token);
                } else {
                    console.log('❌ Login failed:', response.message);
                }
            } catch (e) {
                console.log('❌ Parse error:', e.message);
            }
        });
    });

    loginReq.on('error', (e) => {
        console.log('Login Error:', e.message);
    });

    loginReq.write(loginData);
    loginReq.end();
}

// Test 3: Get Ideas
function testIdeas(token) {
    console.log('\n3️⃣ Testing Get Ideas...');
    const ideasReq = http.request({
        hostname: 'localhost',
        port: 5000,
        path: '/api/ideas',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    }, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            console.log('Ideas Status:', res.statusCode);
            console.log('Ideas Response:', data);
            
            try {
                const response = JSON.parse(data);
                if (response.ideas) {
                    console.log('✅ Ideas loaded successfully!');
                    console.log('Total ideas:', response.count);
                } else {
                    console.log('❌ Ideas failed:', response.message);
                }
            } catch (e) {
                console.log('❌ Parse error:', e.message);
            }
        });
    });

    ideasReq.on('error', (e) => {
        console.log('Ideas Error:', e.message);
    });

    ideasReq.end();
}
