const { protect } = require('../middleware/authMiddleware');
const express = require('express');
const router = express.Router();
const productService = require('../services/productService');

// ─── GET ALL PRODUCTS ─────────────────────────────────
// GET /api/products
// GET /api/products?search=laptop
// GET /api/products?category=electronics
// GET /api/products?search=laptop&category=electronics
router.get('/', async (req, res) => {
  const { search, category } = req.query;

  const products = await productService.getAllProducts(search, category);

  res.status(200).json({
    success: true,
    count: products.length,
    data: products
  });
});

// ─── GET SINGLE PRODUCT ───────────────────────────────
// GET /api/products/1
router.get('/:id', async (req, res) => {
  const product = await productService.getProductById(req.params.id);

  res.status(200).json({
    success: true,
    data: product
  });
});

// ─── CREATE PRODUCT ───────────────────────────────────
// POST /api/products
// Body: { name, sku, unitPrice, stockLevel, category, description }
router.post('/', async (req, res) => {
  const { name, sku, unitPrice } = req.body;

  // Validate required fields
  if (!name || !sku || !unitPrice) {
    return res.status(400).json({
      success: false,
      error: 'Name, SKU, and unit price are required'
    });
  }

  // Validate price is positive number
  if (isNaN(unitPrice) || unitPrice <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Unit price must be a positive number'
    });
  }

  const product = await productService.createProduct(req.body);

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: product
  });
});

// ─── UPDATE PRODUCT ───────────────────────────────────
// PUT /api/products/1
router.put('/:id', async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: 'Product updated successfully',
    data: product
  });
});

// ─── UPDATE STOCK LEVEL ───────────────────────────────
// PATCH /api/products/1/stock
// Body: { adjustment: 10 } or { adjustment: -5 }
// PATCH = partial update (different from PUT which updates everything)
router.patch('/:id/stock', async (req, res) => {
  const { adjustment } = req.body;

  if (adjustment === undefined || isNaN(adjustment)) {
    return res.status(400).json({
      success: false,
      error: 'Adjustment value is required and must be a number'
    });
  }

  const product = await productService.updateStock(req.params.id, adjustment);

  res.status(200).json({
    success: true,
    message: `Stock updated successfully`,
    data: product
  });
});

// ─── DELETE PRODUCT ───────────────────────────────────
// DELETE /api/products/1
router.delete('/:id', async (req, res) => {
  const result = await productService.deleteProduct(req.params.id);

  res.status(200).json({
    success: true,
    message: result.message
  });
});

module.exports = router;