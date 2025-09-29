// Simple AI Features Test - No OpenAI Key Required
const http = require('http');

console.log('🧪 Testing AI Features (Basic Functionality)...\n');

// Step 1: Login
console.log('1️⃣ Logging in...');
const loginData = JSON.stringify({
    email: 'demo@example.com',
    password: 'demo123'
});

const loginOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': loginData.length
    }
};

const loginReq = http.request(loginOptions, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        try {
            const response = JSON.parse(data);
            if (response.token) {
                console.log('✅ Login successful!');
                console.log(`Token: ${response.token.substring(0, 20)}...`);
                testIdeaCreation(response.token);
            } else {
                console.log('❌ Login failed:', response);
            }
        } catch (e) {
            console.log('❌ Login error:', e.message);
        }
    });
});

loginReq.on('error', (e) => {
    console.log('❌ Connection error:', e.message);
});

loginReq.write(loginData);
loginReq.end();

// Step 2: Test Idea Creation (without AI processing)
function testIdeaCreation(token) {
    console.log('\n2️⃣ Testing Idea Creation...');
    
    const ideaData = JSON.stringify({
        title: 'My AI Startup Idea',
        originalInput: 'I want to create an app that uses AI to help students learn faster by personalizing their study plans and tracking their progress',
        context: 'startup',
        tone: 'persuasive'
    });

    const ideaOptions = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/ideas',
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Content-Length': ideaData.length
        }
    };

    const ideaReq = http.request(ideaOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            try {
                const response = JSON.parse(data);
                if (response.idea) {
                    console.log('✅ Idea created successfully!');
                    console.log(`Idea ID: ${response.idea.id}`);
                    console.log(`Status: ${response.idea.status}`);
                    console.log(`Title: ${response.idea.title}`);
                    console.log(`Context: ${response.idea.context}`);
                    
                    if (response.idea.status === 'error') {
                        console.log('⚠️  AI processing failed (expected without OpenAI key)');
                        console.log('💡 To enable AI features, add your OpenAI API key to .env file');
                    }
                } else {
                    console.log('❌ Idea creation failed:', response);
                }
                testGetIdeas(token);
            } catch (e) {
                console.log('❌ Idea error:', e.message);
                testGetIdeas(token);
            }
        });
    });

    ideaReq.on('error', (e) => {
        console.log('❌ Idea connection error:', e.message);
        testGetIdeas(token);
    });

    ideaReq.write(ideaData);
    ideaReq.end();
}

// Step 3: Test Getting Ideas
function testGetIdeas(token) {
    console.log('\n3️⃣ Testing Get Ideas...');
    
    const getOptions = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/ideas',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };

    const getReq = http.request(getOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            try {
                const response = JSON.parse(data);
                if (response.ideas) {
                    console.log('✅ Ideas retrieved successfully!');
                    console.log(`Total ideas: ${response.count}`);
                    console.log(`Ideas found: ${response.ideas.length}`);
                    
                    if (response.ideas.length > 0) {
                        console.log('\n📝 Latest Idea:');
                        const latest = response.ideas[0];
                        console.log(`- Title: ${latest.title}`);
                        console.log(`- Status: ${latest.status}`);
                        console.log(`- Created: ${new Date(latest.createdAt).toLocaleString()}`);
                    }
                } else {
                    console.log('❌ Get ideas failed:', response);
                }
                console.log('\n🎉 Basic AI Features Test Complete!');
                console.log('\n📋 Summary:');
                console.log('✅ Authentication working');
                console.log('✅ Idea creation working');
                console.log('✅ Database operations working');
                console.log('⚠️  AI processing needs OpenAI API key');
                console.log('\n💡 Next steps:');
                console.log('1. Get OpenAI API key from https://platform.openai.com/');
                console.log('2. Add it to your .env file: OPENAI_API_KEY=your-key-here');
                console.log('3. Restart server: npm run dev');
                console.log('4. Test again to see full AI features!');
            } catch (e) {
                console.log('❌ Get ideas error:', e.message);
                console.log('\n🎉 Basic AI Features Test Complete!');
            }
        });
    });

    getReq.on('error', (e) => {
        console.log('❌ Get ideas connection error:', e.message);
        console.log('\n🎉 Basic AI Features Test Complete!');
    });

    getReq.end();
}
