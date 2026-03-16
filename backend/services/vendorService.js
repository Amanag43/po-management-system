// Import Vendor model and operators from sequelize
const { Vendor, PurchaseOrder } = require('../models');
const { Op } = require('sequelize');

// ─── GET ALL VENDORS ──────────────────────────────────
// Returns all vendors, optionally filtered by search term
const getAllVendors = async (search = null) => {
  // Build query options object
  const queryOptions = {
    // ORDER BY name alphabetically
    order: [['name', 'ASC']],
    // Include count of purchase orders for each vendor
    attributes: {
      include: []
    }
  };

  // If search term provided, filter by name or contact
  // Op.iLike = case-insensitive LIKE in PostgreSQL
  if (search) {
    queryOptions.where = {
      [Op.or]: [
        { name: { [Op.iLike]: `%${search}%` } },
        { contact: { [Op.iLike]: `%${search}%` } }
      ]
    };
  }

  const vendors = await Vendor.findAll(queryOptions);
  return vendors;
};

// ─── GET SINGLE VENDOR ────────────────────────────────
// Returns one vendor by ID, includes their purchase orders
const getVendorById = async (id) => {
  const vendor = await Vendor.findByPk(id, {
    // Include related purchase orders
    include: [{
      model: PurchaseOrder,
      as: 'purchaseOrders',
      // Only get these columns from purchase_orders
    //   attributes: ['id', 'referenceNo', 'status', 'totalAmount', 'createdAt']
    }]
  });

  // If vendor not found, throw error
  // This gets caught by our global error handler
  if (!vendor) {
    const error = new Error('Vendor not found');
    error.statusCode = 404;
    throw error;
  }

  return vendor;
};

// ─── CREATE VENDOR ────────────────────────────────────
const createVendor = async (vendorData) => {
  // Sequelize's create() builds and runs INSERT query
  // It also runs our model validations first
  const vendor = await Vendor.create({
    name: vendorData.name,
    contact: vendorData.contact,
    rating: vendorData.rating || null
  });

  return vendor;
};

// ─── UPDATE VENDOR ────────────────────────────────────
const updateVendor = async (id, vendorData) => {
  // First find the vendor
  const vendor = await Vendor.findByPk(id);

  if (!vendor) {
    const error = new Error('Vendor not found');
    error.statusCode = 404;
    throw error;
  }

  // Update only provided fields
  // This way partial updates work too
  await vendor.update({
    name: vendorData.name || vendor.name,
    contact: vendorData.contact || vendor.contact,
    rating: vendorData.rating !== undefined ? vendorData.rating : vendor.rating
  });

  return vendor;
};

// ─── DELETE VENDOR ────────────────────────────────────
const deleteVendor = async (id) => {
  const vendor = await Vendor.findByPk(id);

  if (!vendor) {
    const error = new Error('Vendor not found');
    error.statusCode = 404;
    throw error;
  }

  // Check if vendor has purchase orders
  // We should not delete vendors with existing POs
  const poCount = await PurchaseOrder.count({
    where: { vendorId: id }
  });

  if (poCount > 0) {
    const error = new Error(
      `Cannot delete vendor with ${poCount} existing purchase orders`
    );
    error.statusCode = 400;
    throw error;
  }

  await vendor.destroy();
  return { message: 'Vendor deleted successfully' };
};

module.exports = {
  getAllVendors,
  getVendorById,
  createVendor,
  updateVendor,
  deleteVendor
};