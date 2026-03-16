const Vendor = require('./Vendor');
const Product = require('./Product');
const PurchaseOrder = require('./PurchaseOrders');
const POItem = require('./POItem');
const AILog = require('./AILog');

// ─── ASSOCIATIONS ─────────────────────────────────────────

// One Vendor → Many PurchaseOrders
// A vendor can have many purchase orders
Vendor.hasMany(PurchaseOrder, {
  foreignKey: 'vendor_id',  // column in purchase_orders table
  as: 'purchaseOrders'      // alias for eager loading
});

// Each PurchaseOrder → belongs to One Vendor
PurchaseOrder.belongsTo(Vendor, {
  foreignKey: 'vendor_id',
  as: 'vendor'
});

// One PurchaseOrder → Many POItems
PurchaseOrder.hasMany(POItem, {
  foreignKey: 'po_id',
  as: 'items',
  onDelete: 'CASCADE'       // delete items when PO is deleted
});

// Each POItem → belongs to One PurchaseOrder
POItem.belongsTo(PurchaseOrder, {
  foreignKey: 'po_id',
  as: 'purchaseOrder'
});

// One Product → Many POItems
Product.hasMany(POItem, {
  foreignKey: 'product_id',
  as: 'poItems'
});

// Each POItem → belongs to One Product
POItem.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product'
});

// Export all models together
module.exports = {
  Vendor,
  Product,
  PurchaseOrder,
  POItem,
  AILog
};