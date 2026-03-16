const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const POItem = sequelize.define('POItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  poId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'po_id',          // ← explicit mapping
    references: { model: 'purchase_orders', key: 'id' }
  },

  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'product_id',     // ← explicit mapping
    references: { model: 'products', key: 'id' }
  },

  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1 }
  },

  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'unit_price',     // ← explicit mapping
    validate: { min: 0 }
  },

  lineTotal: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    field: 'line_total'      // ← explicit mapping
  }

}, {
  tableName: 'po_items',
  timestamps: true,
  underscored: true,
  updatedAt: false
});

module.exports = POItem;