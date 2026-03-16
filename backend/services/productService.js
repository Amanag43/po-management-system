const { Product, POItem } = require('../models');
const { Op } = require('sequelize');

// ─── GET ALL PRODUCTS ─────────────────────────────────
// Supports search by name, SKU, or category
const getAllProducts = async (search = null, category = null) => {
  const queryOptions = {
    order: [['name', 'ASC']]
  };

  // Build where conditions dynamically
  const whereConditions = {};

  // If search term provided
  if (search) {
    whereConditions[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { sku: { [Op.iLike]: `%${search}%` } }
    ];
  }

  // If category filter provided
  if (category) {
    whereConditions.category = { [Op.iLike]: `%${category}%` };
  }

  // Only add where clause if conditions exist
  if (Object.keys(whereConditions).length > 0) {
    queryOptions.where = whereConditions;
  }

  const products = await Product.findAll(queryOptions);
  return products;
};

// ─── GET SINGLE PRODUCT ───────────────────────────────
const getProductById = async (id) => {
  const product = await Product.findByPk(id);

  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  return product;
};

// ─── CREATE PRODUCT ───────────────────────────────────
const createProduct = async (productData) => {
  // Check if SKU already exists
  // SKU must be unique across all products
  const existingSKU = await Product.findOne({
    where: { sku: productData.sku }
  });

  if (existingSKU) {
    const error = new Error(`SKU '${productData.sku}' already exists`);
    error.statusCode = 400;
    throw error;
  }

  const product = await Product.create({
    name: productData.name,
    sku: productData.sku.toUpperCase(), // always store SKU in uppercase
    unitPrice: productData.unitPrice,
    stockLevel: productData.stockLevel || 0,
    category: productData.category || null,
    description: productData.description || null
  });

  return product;
};

// ─── UPDATE PRODUCT ───────────────────────────────────
const updateProduct = async (id, productData) => {
  const product = await Product.findByPk(id);

  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  // If SKU is being changed, check new SKU doesn't exist
  if (productData.sku && productData.sku !== product.sku) {
    const existingSKU = await Product.findOne({
      where: {
        sku: productData.sku,
        id: { [Op.ne]: id } // exclude current product
      }
    });

    if (existingSKU) {
      const error = new Error(`SKU '${productData.sku}' already exists`);
      error.statusCode = 400;
      throw error;
    }
  }

  await product.update({
    name: productData.name || product.name,
    sku: productData.sku ? productData.sku.toUpperCase() : product.sku,
    unitPrice: productData.unitPrice || product.unitPrice,
    stockLevel: productData.stockLevel !== undefined
      ? productData.stockLevel
      : product.stockLevel,
    category: productData.category || product.category,
    description: productData.description || product.description
  });

  return product;
};

// ─── UPDATE STOCK LEVEL ───────────────────────────────
// Dedicated function for stock adjustments
// adjustment can be positive (add) or negative (remove)
const updateStock = async (id, adjustment) => {
  const product = await Product.findByPk(id);

  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  // Calculate new stock level
  const newStock = parseInt(product.stockLevel) + parseInt(adjustment);

  // Prevent negative stock
  if (newStock < 0) {
    const error = new Error(
      `Insufficient stock. Current: ${product.stockLevel}, Requested adjustment: ${adjustment}`
    );
    error.statusCode = 400;
    throw error;
  }

  await product.update({ stockLevel: newStock });
  return product;
};

// ─── DELETE PRODUCT ───────────────────────────────────
const deleteProduct = async (id) => {
  const product = await Product.findByPk(id);

  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  // Check if product is used in any PO items
  const poItemCount = await POItem.count({
    where: { productId: id }
  });

  if (poItemCount > 0) {
    const error = new Error(
      `Cannot delete product used in ${poItemCount} purchase order(s)`
    );
    error.statusCode = 400;
    throw error;
  }

  await product.destroy();
  return { message: 'Product deleted successfully' };
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  updateStock,
  deleteProduct
};