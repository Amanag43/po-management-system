const { protect } = require('../middleware/authMiddleware');
const express = require('express');
const router = express.Router();

// Import vendor service - all business logic lives here
const vendorService = require('../services/vendorService');

// ─── GET ALL VENDORS ──────────────────────────────────
// GET /api/vendors
// GET /api/vendors?search=abc  (with search filter)
router.get('/' ,async (req, res) => {
  // Extract optional search query from URL
  // e.g. /api/vendors?search=tech → req.query.search = "tech"
  const { search } = req.query;

  const vendors = await vendorService.getAllVendors(search);

  // Always return consistent response shape
  res.status(200).json({
    success: true,
    count: vendors.length,
    data: vendors
  });
});

// ─── GET SINGLE VENDOR ────────────────────────────────
// GET /api/vendors/1
router.get('/:id', async (req, res) => {
  // req.params.id = the :id from the URL
  const vendor = await vendorService.getVendorById(req.params.id);

  res.status(200).json({
    success: true,
    data: vendor
  });
});

// ─── CREATE VENDOR ────────────────────────────────────
// POST /api/vendors
// Body: { name, contact, rating }
router.post('/', async (req, res) => {
  // req.body contains the JSON sent by the client
  const { name, contact, rating } = req.body;

  // Basic validation - check required fields exist
  if (!name || !contact) {
    return res.status(400).json({
      success: false,
      error: 'Name and contact are required'
    });
  }

  const vendor = await vendorService.createVendor({ name, contact, rating });

  // 201 = Created (more specific than 200)
  res.status(201).json({
    success: true,
    message: 'Vendor created successfully',
    data: vendor
  });
});

// ─── UPDATE VENDOR ────────────────────────────────────
// PUT /api/vendors/1
// Body: { name, contact, rating } (any or all fields)
router.put('/:id', async (req, res) => {
  const vendor = await vendorService.updateVendor(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: 'Vendor updated successfully',
    data: vendor
  });
});

// ─── DELETE VENDOR ────────────────────────────────────
// DELETE /api/vendors/1
router.delete('/:id', async (req, res) => {
  const result = await vendorService.deleteVendor(req.params.id);

  res.status(200).json({
    success: true,
    message: result.message
  });
});

module.exports = router;