const sequelize = require('../config/database');
const User = require('../models/UserSQLite');
const Idea = require('../models/IdeaSQLite');
const Interview = require('../models/InterviewSQLite');
const bcrypt = require('bcryptjs');

async function initializeDatabase() {
  try {
    console.log('🔄 Initializing SQLite database...');
    
    // Sync all models (create tables)
    await sequelize.sync({ force: true });
    
    console.log('✅ SQLite database initialized successfully!');
    console.log('📊 Created tables: users, ideas, interviews');
    
    // Database initialized - no demo user created
    console.log('👤 Ready for real user registration!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

// Export for use in server.js
module.exports = { initializeDatabase };

// Run if called directly
if (require.main === module) {
  initializeDatabase();
}
