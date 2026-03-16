const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const { protect } = require('../middleware/authMiddleware');

// ─── GENERATE DESCRIPTION ─────────────────────────────
// POST /api/ai/generate-description
// Body: { productName, category }
router.post('/generate-description', protect, async (req, res) => {
  const { productName, category } = req.body;

  // Validate required field
  if (!productName) {
    return res.status(400).json({
      success: false,
      error: 'Product name is required'
    });
  }

  // req.user.email comes from our JWT middleware
  // So we know WHO triggered the AI generation
  const description = await aiService.generateDescription(
    productName,
    category,
    req.user.email
  );

  res.status(200).json({
    success: true,
    data: {
      productName,
      category: category || 'General',
      description
    }
  });
});

// ─── GET AI LOGS ──────────────────────────────────────
// GET /api/ai/logs
// Returns all AI generation history
router.get('/logs', protect, async (req, res) => {
  const logs = await getAILogs();

  res.status(200).json({
    success: true,
    count: logs.length,
    data: logs
  });
});

module.exports = router;
