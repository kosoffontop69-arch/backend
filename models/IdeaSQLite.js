const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Idea = sequelize.define('Idea', {
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
  originalInput: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  context: {
    type: DataTypes.STRING,
    allowNull: false
  },
  structuredContent: {
    type: DataTypes.TEXT,
    defaultValue: '{}'
  },
  customization: {
    type: DataTypes.TEXT,
    defaultValue: '{}'
  },
  attachments: {
    type: DataTypes.TEXT,
    defaultValue: '[]'
  },
  feedback: {
    type: DataTypes.TEXT,
    defaultValue: '{}'
  },
  outputs: {
    type: DataTypes.TEXT,
    defaultValue: '{}'
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'draft'
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  tags: {
    type: DataTypes.TEXT,
    defaultValue: '[]'
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  likes: {
    type: DataTypes.TEXT,
    defaultValue: '[]'
  },
  aiProcessingTime: {
    type: DataTypes.INTEGER
  }
}, {
  tableName: 'ideas',
  timestamps: true
});

module.exports = Idea;
