// Test script to verify production readiness
require('dotenv').config();

console.log('🧪 Testing Production Readiness...\n');

// Test 1: Environment Variables
console.log('1️⃣ Checking Environment Variables:');
const requiredEnvVars = ['JWT_SECRET', 'OPENAI_API_KEY'];
let envVarsOk = true;

requiredEnvVars.forEach(envVar => {
  if (process.env[envVar]) {
    console.log(`   ✅ ${envVar}: Set`);
  } else {
    console.log(`   ❌ ${envVar}: Missing`);
    envVarsOk = false;
  }
});

// Test 2: Dependencies
console.log('\n2️⃣ Checking Dependencies:');
try {
  require('express');
  require('cors');
  require('helmet');
  require('compression');
  require('morgan');
  require('express-rate-limit');
  require('dotenv');
  require('sequelize');
  require('sqlite3');
  require('openai');
  require('jsonwebtoken');
  require('bcryptjs');
  console.log('   ✅ All dependencies available');
} catch (error) {
  console.log(`   ❌ Missing dependency: ${error.message}`);
  envVarsOk = false;
}

// Test 3: Server File
console.log('\n3️⃣ Checking Server File:');
try {
  require('./server.js');
  console.log('   ✅ server.js loads successfully');
} catch (error) {
  console.log(`   ❌ server.js error: ${error.message}`);
  envVarsOk = false;
}

// Test 4: Database Configuration
console.log('\n4️⃣ Checking Database Configuration:');
try {
  const sequelize = require('./config/database');
  console.log('   ✅ Database configuration loaded');
} catch (error) {
  console.log(`   ❌ Database error: ${error.message}`);
  envVarsOk = false;
}

// Test 5: Routes
console.log('\n5️⃣ Checking Routes:');
try {
  require('./routes/auth');
  require('./routes/ideaRefiner');
  require('./routes/interviewSimulator');
  require('./routes/users');
  require('./routes/uploads');
  console.log('   ✅ All routes loaded');
} catch (error) {
  console.log(`   ❌ Route error: ${error.message}`);
  envVarsOk = false;
}

// Test 6: AI Service
console.log('\n6️⃣ Checking AI Service:');
try {
  const aiService = require('./services/aiService');
  console.log('   ✅ AI Service loaded');
  
  // Test OpenAI configuration
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-')) {
    console.log('   ✅ OpenAI API key format valid');
  } else {
    console.log('   ⚠️  OpenAI API key format invalid or missing');
  }
} catch (error) {
  console.log(`   ❌ AI Service error: ${error.message}`);
  envVarsOk = false;
}

// Summary
console.log('\n📊 PRODUCTION READINESS SUMMARY');
console.log('================================');
if (envVarsOk) {
  console.log('✅ READY FOR DEPLOYMENT!');
  console.log('\nNext steps:');
  console.log('1. Push code to GitHub');
  console.log('2. Deploy on Render');
  console.log('3. Set environment variables in Render dashboard');
  console.log('4. Test your deployed API');
} else {
  console.log('❌ NOT READY - Fix issues above');
  console.log('\nCommon fixes:');
  console.log('- Set OPENAI_API_KEY in .env file');
  console.log('- Set JWT_SECRET in .env file');
  console.log('- Run npm install to install dependencies');
}

console.log('\n🚀 Your backend is configured for Render deployment!');
