const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = 'http://localhost:5000/api';

// Test data
const testUser = {
  name: 'Test User',
  email: `test${Date.now()}@example.com`,
  password: 'testpassword123',
  role: 'student'
};

const testIdea = {
  title: 'AI-Powered Learning Platform',
  originalInput: 'An AI platform that helps students learn through personalized content and interactive exercises',
  context: 'startup',
  tone: 'persuasive'
};

const testInterview = {
  title: 'Mock Interview Session',
  mode: 'ai-interviewer',
  configuration: {
    role: 'Software Developer',
    experienceLevel: 'entry',
    duration: 30,
    questionTypes: ['technical', 'behavioral'],
    difficulty: 'medium'
  }
};

class DebugTester {
  constructor() {
    this.authToken = null;
    this.testResults = {
      server: false,
      auth: false,
      pitch: false,
      interview: false
    };
  }

  async runAllTests() {
    console.log('🚀 Starting Comprehensive API Debug Tests...\n');
    
    try {
      // Test 1: Server Health
      await this.testServerHealth();
      
      // Test 2: Authentication (JWT)
      await this.testAuthentication();
      
      // Test 3: Pitch Generator (OpenAI)
      if (this.authToken) {
        await this.testPitchGenerator();
        await this.testMockInterview();
      }
      
      // Display Results
      this.displayResults();
      
    } catch (error) {
      console.error('❌ Test suite failed:', error.message);
    }
  }

  async testServerHealth() {
    console.log('1️⃣ Testing Server Health...');
    try {
      const response = await axios.get(`${API_BASE_URL}/health`);
      console.log('✅ Server is running');
      console.log(`   Status: ${response.data.status}`);
      console.log(`   Message: ${response.data.message}`);
      this.testResults.server = true;
    } catch (error) {
      console.log('❌ Server health check failed');
      console.log(`   Error: ${error.message}`);
      if (error.code === 'ECONNREFUSED') {
        console.log('   💡 Make sure the backend server is running: node server.js');
      }
    }
    console.log('');
  }

  async testAuthentication() {
    console.log('2️⃣ Testing JWT Authentication...');
    
    try {
      // Test Registration
      console.log('   Testing user registration...');
      const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, testUser);
      console.log('✅ User registration successful');
      console.log(`   User ID: ${registerResponse.data.user.id}`);
      console.log(`   Token received: ${registerResponse.data.token ? 'Yes' : 'No'}`);
      
      this.authToken = registerResponse.data.token;
      
      // Test Login
      console.log('   Testing user login...');
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: testUser.email,
        password: testUser.password
      });
      console.log('✅ User login successful');
      console.log(`   Token received: ${loginResponse.data.token ? 'Yes' : 'No'}`);
      
      this.testResults.auth = true;
      
    } catch (error) {
      console.log('❌ Authentication test failed');
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Error: ${error.response.data.message || error.response.data.error}`);
      } else {
        console.log(`   Error: ${error.message}`);
      }
    }
    console.log('');
  }

  async testPitchGenerator() {
    console.log('3️⃣ Testing Pitch Generator (OpenAI API)...');
    
    if (!this.authToken) {
      console.log('❌ No auth token available for pitch generator test');
      return;
    }

    try {
      console.log('   Testing idea creation and refinement...');
      const response = await axios.post(`${API_BASE_URL}/ideas`, testIdea, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Pitch generator test successful');
      console.log(`   Idea ID: ${response.data.idea.id}`);
      console.log(`   Refined Idea: ${response.data.refinedIdea ? 'Yes' : 'No'}`);
      
      if (response.data.refinedIdea) {
        console.log('   Problem Statement:', response.data.refinedIdea.problemStatement?.substring(0, 100) + '...');
        console.log('   Solution:', response.data.refinedIdea.solution?.substring(0, 100) + '...');
      }
      
      this.testResults.pitch = true;
      
    } catch (error) {
      console.log('❌ Pitch generator test failed');
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Error: ${error.response.data.message || error.response.data.error}`);
        
        if (error.response.status === 500) {
          console.log('   💡 This might be an OpenAI API key issue. Check your .env file.');
        }
      } else {
        console.log(`   Error: ${error.message}`);
      }
    }
    console.log('');
  }

  async testMockInterview() {
    console.log('4️⃣ Testing Mock Interview (OpenAI API)...');
    
    if (!this.authToken) {
      console.log('❌ No auth token available for mock interview test');
      return;
    }

    try {
      console.log('   Testing interview creation...');
      const createResponse = await axios.post(`${API_BASE_URL}/interviews`, testInterview, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Interview creation successful');
      console.log(`   Interview ID: ${createResponse.data.data?.interview?.id}`);
      
      // Test starting the interview
      console.log('   Testing interview start...');
      const startResponse = await axios.post(`${API_BASE_URL}/interviews/${createResponse.data.data?.interview?.id}/start`, {}, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Interview start successful');
      console.log(`   Interview Status: ${startResponse.data.data?.interview?.status}`);
      console.log(`   Questions Generated: ${startResponse.data.data?.interview?.questions?.length || 0}`);
      if (startResponse.data.data?.interview?.questions?.length > 0) {
        console.log(`   First Question: ${startResponse.data.data.interview.questions[0].questionText?.substring(0, 100)}...`);
      }
      
      this.testResults.interview = true;
      
    } catch (error) {
      console.log('❌ Mock interview test failed');
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Error: ${error.response.data.message || error.response.data.error}`);
        
        if (error.response.status === 500) {
          console.log('   💡 This might be an OpenAI API key issue. Check your .env file.');
        }
      } else {
        console.log(`   Error: ${error.message}`);
      }
    }
    console.log('');
  }

  displayResults() {
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('========================');
    console.log(`Server Health: ${this.testResults.server ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`JWT Authentication: ${this.testResults.auth ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Pitch Generator (OpenAI): ${this.testResults.pitch ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Mock Interview (OpenAI): ${this.testResults.interview ? '✅ PASS' : '❌ FAIL'}`);
    console.log('');
    
    const allPassed = Object.values(this.testResults).every(result => result === true);
    
    if (allPassed) {
      console.log('🎉 ALL TESTS PASSED! Your API is working perfectly.');
    } else {
      console.log('⚠️  Some tests failed. Check the error messages above.');
      console.log('');
      console.log('🔧 TROUBLESHOOTING TIPS:');
      
      if (!this.testResults.server) {
        console.log('• Start the backend server: cd backend && node server.js');
      }
      
      if (!this.testResults.auth) {
        console.log('• Check JWT_SECRET in .env file');
        console.log('• Verify database connection');
      }
      
      if (!this.testResults.pitch || !this.testResults.interview) {
        console.log('• Get OpenAI API key from: https://platform.openai.com/api-keys');
        console.log('• Update OPENAI_API_KEY in .env file');
        console.log('• Restart the server after updating .env');
      }
    }
  }
}

// Run the tests
const tester = new DebugTester();
tester.runAllTests().catch(console.error);
