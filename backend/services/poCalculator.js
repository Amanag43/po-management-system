// ─── PO CALCULATOR SERVICE ────────────────────────────
// Handles all financial calculations for Purchase Orders
// Assignment requirement: 5% tax on all orders

const TAX_RATE = 0.05; // 5% tax rate

// ─── CALCULATE LINE TOTAL ─────────────────────────────
// Calculates total for a single line item
// e.g. Laptop × 2 units @ $899.99 = $1799.98
const calculateLineTotal = (quantity, unitPrice) => {
  // parseFloat ensures we're working with numbers not strings
  const qty = parseFloat(quantity);
  const price = parseFloat(unitPrice);

  // Round to 2 decimal places to avoid floating point issues
  // e.g. 0.1 + 0.2 = 0.30000000000000004 in JavaScript
  return parseFloat((qty * price).toFixed(2));
};

// ─── CALCULATE PO TOTALS ──────────────────────────────
// Takes array of items and returns subtotal, tax, total
// items = [{ quantity: 2, unitPrice: 899.99 }, ...]
const calculatePOTotals = (items) => {
  // STEP 1: Calculate line total for each item
  // then add them all up to get subtotal
  const subtotal = items.reduce((sum, item) => {
    const lineTotal = calculateLineTotal(item.quantity, item.unitPrice);
    return sum + lineTotal;
  }, 0); // 0 is the starting value

  // STEP 2: Calculate 5% tax
  const taxAmount = parseFloat((subtotal * TAX_RATE).toFixed(2));

  // STEP 3: Calculate final total
  const totalAmount = parseFloat((subtotal + taxAmount).toFixed(2));

  // Return all three values
  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    taxAmount,
    totalAmount
  };
};

// ─── GENERATE REFERENCE NUMBER ────────────────────────
// Auto-generates unique PO reference like "PO-2024-001"
const generateReferenceNo = async (PurchaseOrder) => {
  // Get current year
  const year = new Date().getFullYear();

  // Count existing POs this year to get next number
  const { Op } = require('sequelize');
  const count = await PurchaseOrder.count({
    where: {
      referenceNo: {
        [Op.like]: `PO-${year}-%`
      }
    }
  });

  // Pad number to 3 digits: 1 → 001, 12 → 012
  const nextNumber = String(count + 1).padStart(3, '0');

  return `PO-${year}-${nextNumber}`;
};

module.exports = {
  calculateLineTotal,
  calculatePOTotals,
  generateReferenceNo
};