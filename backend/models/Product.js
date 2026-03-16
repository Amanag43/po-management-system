const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  // Product display name
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Product name cannot be empty'
      }
    }
  },

  // Stock Keeping Unit - unique product code
  sku: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: {
      msg: 'SKU already exists'    // custom error message
    },
    validate: {
      notEmpty: {
        msg: 'SKU cannot be empty'
      }
    }
  },

  // Price per single unit
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: {
        args: [0],
        msg: 'Unit price cannot be negative'
      }
    }
  },

  // How many units currently in stock
  stockLevel: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: 'Stock level cannot be negative'
      }
    }
  },

  // Product category (Electronics, Furniture etc.)
  category: {
    type: DataTypes.STRING(100),
    allowNull: true             // optional field
  },

  // Product description (filled by AI or manually)
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }

}, {
  tableName: 'products',
  timestamps: true,
  underscored: true
});

module.exports = Product;