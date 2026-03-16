const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Define the Vendor model
const Vendor = sequelize.define('Vendor', {
  // Primary key - auto incrementing
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  // Vendor company name
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,           // NOT NULL
    validate: {
      notEmpty: {
        msg: 'Vendor name cannot be empty'
      },
      len: {
        args: [2, 255],
        msg: 'Name must be between 2 and 255 characters'
      }
    }
  },

  // Contact email or phone
  contact: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Contact cannot be empty'
      }
    }
  },

  // Rating out of 5
  rating: {
    type: DataTypes.DECIMAL(2, 1),
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: 'Rating cannot be less than 0'
      },
      max: {
        args: [5],
        msg: 'Rating cannot be more than 5'
      }
    }
  }

}, {
  // Model options
  tableName: 'vendors',       // exact table name in database
  timestamps: true,           // adds created_at and updated_at automatically
  underscored: true,          // use snake_case for column names
});

module.exports = Vendor;