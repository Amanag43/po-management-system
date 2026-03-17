const { PurchaseOrder, POItem, Vendor, Product } = require('../models');
const { calculatePOTotals, calculateLineTotal, generateReferenceNo } = require('./poCalculator');
const { Op } = require('sequelize');
const fetch = require('node-fetch'); // for calling external APIs if needed
// Detect if running in Docker
const NOTIFICATION_URL = process.env.DOCKER_ENV
  ? 'http://notifications:5001'  // Docker service name
  : 'http://localhost:5001';     // Local development
// ─── GET ALL PURCHASE ORDERS ──────────────────────────
const getAllPOs = async (status = null) => {
  const queryOptions = {
    // Include vendor details with each PO
    include: [{
      model: Vendor,
      as: 'vendor',
      attributes: ['id', 'name', 'contact']
    }],
    order: [['created_at', 'DESC']] // newest first
  };

  // Filter by status if provided
  // e.g. /api/purchase-orders?status=Pending
  if (status) {
    queryOptions.where = { status };
  }

  const pos = await PurchaseOrder.findAll(queryOptions);
  return pos;
};

// ─── GET SINGLE PO WITH ALL ITEMS ─────────────────────
const getPOById = async (id) => {
  const po = await PurchaseOrder.findByPk(id, {
    include: [
      {
        // Include vendor info
        model: Vendor,
        as: 'vendor'
      },
      {
        // Include all line items
        model: POItem,
        as: 'items',
        include: [{
          // Include product details for each item
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'sku', 'category']
        }]
      }
    ]
  });

  if (!po) {
    const error = new Error('Purchase Order not found');
    error.statusCode = 404;
    throw error;
  }

  return po;
};

// ─── CREATE PURCHASE ORDER ────────────────────────────
// This is the most important function
// It creates the PO header AND all line items in one go
const createPO = async (poData) => {
  // poData = {
  //   vendorId: 1,
  //   items: [
  //     { productId: 1, quantity: 2 },
  //     { productId: 2, quantity: 5 }
  //   ],
  //   notes: "Optional notes"
  // }

  // STEP 1: Verify vendor exists
  const vendor = await Vendor.findByPk(poData.vendorId);
  if (!vendor) {
    const error = new Error('Vendor not found');
    error.statusCode = 404;
    throw error;
  }

  // STEP 2: Verify all products exist and get their prices
  // Build items array with current prices from database
  const itemsWithPrices = [];

  for (const item of poData.items) {
    const product = await Product.findByPk(item.productId);

    if (!product) {
      const error = new Error(`Product with id ${item.productId} not found`);
      error.statusCode = 404;
      throw error;
    }

    // Use current product price
    // This price gets locked into the PO item
    itemsWithPrices.push({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: parseFloat(product.unitPrice),
      lineTotal: calculateLineTotal(item.quantity, product.unitPrice)
    });
  }

  // STEP 3: Calculate totals using our calculator service
  const { subtotal, taxAmount, totalAmount } = calculatePOTotals(itemsWithPrices);

  // STEP 4: Generate unique reference number
  const referenceNo = await generateReferenceNo(PurchaseOrder);

  // STEP 5: Create the PO header record
  const po = await PurchaseOrder.create({
    referenceNo,
    vendorId: poData.vendorId,
    status: 'Pending',
    subtotal,
    taxAmount,
    totalAmount,
    notes: poData.notes || null
  });

  // STEP 6: Create all PO items linked to this PO
  for (const item of itemsWithPrices) {
    await POItem.create({
      poId: po.id,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.lineTotal
    });
  }

  // STEP 7: Return complete PO with all details
  return getPOById(po.id);
};

// ─── UPDATE PO STATUS ─────────────────────────────────
// Handles the PO lifecycle:
// Pending → Approved → Ordered → Received
const updatePOStatus = async (id, status) => {
  const po = await PurchaseOrder.findByPk(id,{
    include: [{
      model: Vendor,
      as: 'vendor'
    }]
  });

  if (!po) {
    const error = new Error('Purchase Order not found');
    error.statusCode = 404;
    throw error;
  }

  // Define valid status transitions
  // Can't go from Received back to Pending etc.
  const validTransitions = {
    'Pending': ['Approved', 'Cancelled'],
    'Approved': ['Ordered', 'Cancelled'],
    'Ordered': ['Received', 'Cancelled'],
    'Received': [], // final state - no transitions
    'Cancelled': [] // final state - no transitions
  };

  const allowedNext = validTransitions[po.status];

  if (!allowedNext.includes(status)) {
    const error = new Error(
      `Cannot change status from '${po.status}' to '${status}'. ` +
      `Allowed: ${allowedNext.join(', ') || 'none'}`
    );
    error.statusCode = 400;
    throw error;
  }

  const oldStatus = po.status;

  await po.update({ status });
  try {
    await fetch(`${NOTIFICATION_URL}/notify/po-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        referenceNo: po.referenceNo || po.reference_no,
        oldStatus,
        newStatus: status,
        vendorName: po.vendor ? po.vendor.name : 'Unknown'
      })
    });
  } catch (err) {
    // Don't crash if notification server is down
    // Notifications are non-critical
    console.log('Notification server not available:', err.message);
  }

  return po;
};

// ─── DELETE PO ────────────────────────────────────────
// Only Pending or Cancelled POs can be deleted
const deletePO = async (id) => {
  const po = await PurchaseOrder.findByPk(id);

  if (!po) {
    const error = new Error('Purchase Order not found');
    error.statusCode = 404;
    throw error;
  }

  // Only allow deletion of Pending or Cancelled POs
  if (!['Pending', 'Cancelled'].includes(po.status)) {
    const error = new Error(
      `Cannot delete a PO with status '${po.status}'. ` +
      `Only Pending or Cancelled POs can be deleted.`
    );
    error.statusCode = 400;
    throw error;
  }

  // POItems are deleted automatically via CASCADE
  await po.destroy();
  return { message: 'Purchase Order deleted successfully' };
};

module.exports = {
  getAllPOs,
  getPOById,
  createPO,
  updatePOStatus,
  deletePO
};