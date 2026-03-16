const { protect } = require('../middleware/authMiddleware');
const express = require('express');
const router = express.Router();
const poService = require('../services/purchaseOrderService');

// ─── GET ALL POs ──────────────────────────────────────
// GET /api/purchase-orders
// GET /api/purchase-orders?status=Pending
router.get('/', async (req, res) => {
  const { status } = req.query;
  const pos = await poService.getAllPOs(status);

  res.status(200).json({
    success: true,
    count: pos.length,
    data: pos
  });
});

// ─── GET SINGLE PO ────────────────────────────────────
// GET /api/purchase-orders/1
router.get('/:id', async (req, res) => {
  const po = await poService.getPOById(req.params.id);

  res.status(200).json({
    success: true,
    data: po
  });
});

// ─── CREATE PO ────────────────────────────────────────
// POST /api/purchase-orders
// Body: { vendorId, items: [{ productId, quantity }], notes }
router.post('/', async (req, res) => {
  const { vendorId, items, notes } = req.body;

  // Validate required fields
  if (!vendorId) {
    return res.status(400).json({
      success: false,
      error: 'Vendor ID is required'
    });
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'At least one item is required'
    });
  }

  // Validate each item has productId and quantity
  for (const item of items) {
    if (!item.productId || !item.quantity) {
      return res.status(400).json({
        success: false,
        error: 'Each item must have productId and quantity'
      });
    }

    if (item.quantity < 1) {
      return res.status(400).json({
        success: false,
        error: 'Quantity must be at least 1'
      });
    }
  }

  const po = await poService.createPO({ vendorId, items, notes });

  res.status(201).json({
    success: true,
    message: 'Purchase Order created successfully',
    data: po
  });
});

// ─── UPDATE PO STATUS ─────────────────────────────────
// PATCH /api/purchase-orders/1/status
// Body: { status: "Approved" }
router.patch('/:id/status', async (req, res) => {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({
      success: false,
      error: 'Status is required'
    });
  }

  const po = await poService.updatePOStatus(req.params.id, status);

  res.status(200).json({
    success: true,
    message: `PO status updated to ${status}`,
    data: po
  });
});

// ─── DELETE PO ────────────────────────────────────────
// DELETE /api/purchase-orders/1
router.delete('/:id', async (req, res) => {
  const result = await poService.deletePO(req.params.id);

  res.status(200).json({
    success: true,
    message: result.message
  });
});

module.exports = router;
