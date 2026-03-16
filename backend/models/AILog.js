const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AILog = sequelize.define('AILog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  // Product name that was used for generation
  product_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },

  // Category used in the prompt
  category: {
    type: DataTypes.STRING(100),
    allowNull: true
  },

  // The AI generated text
  generated_description: {
    type: DataTypes.TEXT,
    allowNull: false
  },

  // Who triggered the generation
  user_email: {
    type: DataTypes.STRING(255),
    allowNull: true
  }

}, {
  tableName: 'ai_logs',
  timestamps: true,
  underscored: true
});

module.exports = AILog;