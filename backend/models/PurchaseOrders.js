const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PurchaseOrder = sequelize.define('PurchaseOrder', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  referenceNo: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    field: 'reference_no'    // ← explicit mapping
  },

  vendorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'vendor_id',      // ← explicit mapping
    references: { model: 'vendors', key: 'id' }
  },

  status: {
    type: DataTypes.ENUM('Pending','Approved','Ordered','Received','Cancelled'),
    defaultValue: 'Pending'
  },

  subtotal: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0
  },

  taxAmount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
    field: 'tax_amount'      // ← explicit mapping
  },

  totalAmount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
    field: 'total_amount'    // ← explicit mapping
  },

  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }

}, {
  tableName: 'purchase_orders',
  timestamps: true,
  underscored: true
});

module.exports = PurchaseOrder;