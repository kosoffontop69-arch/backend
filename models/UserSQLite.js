const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'student'
  },
  profile: {
    type: DataTypes.TEXT,
    defaultValue: '{}'
  },
  preferences: {
    type: DataTypes.TEXT,
    defaultValue: '{}'
  },
  stats: {
    type: DataTypes.TEXT,
    defaultValue: '{"ideasRefined":0,"interviewsCompleted":0,"totalPracticeTime":0,"averageScore":0}'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastLogin: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'users',
  timestamps: true
});

module.exports = User;
