const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Interview = sequelize.define('Interview', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  mode: {
    type: DataTypes.STRING,
    allowNull: false
  },
  configuration: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  questions: {
    type: DataTypes.TEXT,
    defaultValue: '[]'
  },
  responses: {
    type: DataTypes.TEXT,
    defaultValue: '[]'
  },
  performance: {
    type: DataTypes.TEXT,
    defaultValue: '{}'
  },
  recording: {
    type: DataTypes.TEXT,
    defaultValue: '{}'
  },
  feedback: {
    type: DataTypes.TEXT,
    defaultValue: '{}'
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'scheduled'
  },
  scheduledAt: {
    type: DataTypes.DATE
  },
  startedAt: {
    type: DataTypes.DATE
  },
  completedAt: {
    type: DataTypes.DATE
  },
  duration: {
    type: DataTypes.INTEGER
  },
  tags: {
    type: DataTypes.TEXT,
    defaultValue: '[]'
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  sharingSettings: {
    type: DataTypes.TEXT,
    defaultValue: '{}'
  }
}, {
  tableName: 'interviews',
  timestamps: true
});

module.exports = Interview;
