- ============================================
-- PO MANAGEMENT SYSTEM - DATABASE SCHEMA
-- ============================================

-- Drop tables if they exist (clean start)
-- ORDER MATTERS: drop child tables first
DROP TABLE IF EXISTS ai_logs;
DROP TABLE IF EXISTS po_items;
DROP TABLE IF EXISTS purchase_orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS vendors;
-- ============================================
-- TABLE 1: VENDORS
-- Stores supplier/vendor information
-- ============================================
CREATE TABLE vendors (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  contact     VARCHAR(255) NOT NULL,
  rating      DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5),
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);
-- ============================================
-- TABLE 2: PRODUCTS
-- Stores product catalog information
-- ============================================
CREATE TABLE products (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  sku         VARCHAR(100) UNIQUE NOT NULL,
  unit_price  DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  stock_level INTEGER DEFAULT 0 CHECK (stock_level >= 0),
  category    VARCHAR(100),
  description TEXT,
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);
-- ============================================
-- TABLE 3: PURCHASE ORDERS
-- Main PO header information
-- ============================================
CREATE TABLE purchase_orders (
  id            SERIAL PRIMARY KEY,
  reference_no  VARCHAR(50) UNIQUE NOT NULL,
  vendor_id     INTEGER NOT NULL REFERENCES vendors(id) ON DELETE RESTRICT,
  status        VARCHAR(50) DEFAULT 'Pending'
                CHECK (status IN ('Pending', 'Approved', 'Ordered', 'Received', 'Cancelled')),
  subtotal      DECIMAL(12,2) DEFAULT 0,
  tax_amount    DECIMAL(12,2) DEFAULT 0,
  total_amount  DECIMAL(12,2) DEFAULT 0,
  notes         TEXT,
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);
-- ============================================
-- TABLE 4: PO ITEMS
-- Individual line items within a PO
-- (Junction table - links POs to Products)
-- ============================================
CREATE TABLE po_items (
  id          SERIAL PRIMARY KEY,
  po_id       INTEGER NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity    INTEGER NOT NULL CHECK (quantity > 0),
  unit_price  DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  line_total  DECIMAL(12,2) NOT NULL,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- TABLE 5: AI LOGS
-- Stores all AI-generated descriptions
-- ============================================
CREATE TABLE ai_logs (
  id                    SERIAL PRIMARY KEY,
  product_name          VARCHAR(255) NOT NULL,
  category              VARCHAR(100),
  generated_description TEXT NOT NULL,
  user_email            VARCHAR(255),
  created_at            TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- INDEXES (for faster queries)
-- ============================================
CREATE INDEX idx_po_vendor_id ON purchase_orders(vendor_id);
CREATE INDEX idx_po_items_po_id ON po_items(po_id);
CREATE INDEX idx_po_items_product_id ON po_items(product_id);
CREATE INDEX idx_po_status ON purchase_orders(status);
CREATE INDEX idx_products_sku ON products(sku);

-- ============================================
-- SEED DATA (sample data for testing)
-- ============================================

-- Sample Vendors
INSERT INTO vendors (name, contact, rating) VALUES
  ('ABC Supplies Ltd', 'abc@supplies.com', 4.5),
  ('XYZ Corporation', 'contact@xyz.com', 3.8),
  ('Global Tech Parts', 'info@globaltech.com', 4.9),
  ('Prime Electronics', 'sales@prime.com', 4.2);

-- Sample Products
INSERT INTO products (name, sku, unit_price, stock_level, category) VALUES
  ('Laptop Pro 15"', 'TECH-001', 899.99, 50, 'Electronics'),
  ('Wireless Mouse', 'TECH-002', 29.99, 200, 'Electronics'),
  ('USB-C Hub', 'TECH-003', 49.99, 150, 'Electronics'),
  ('Office Chair', 'FURN-001', 299.99, 30, 'Furniture'),
  ('Standing Desk', 'FURN-002', 599.99, 15, 'Furniture'),
  ('Printer Paper A4', 'STAT-001', 9.99, 500, 'Stationery'),
  ('Ballpoint Pens Box', 'STAT-002', 14.99, 300, 'Stationery');

-- Sample Purchase Order
INSERT INTO purchase_orders 
  (reference_no, vendor_id, status, subtotal, tax_amount, total_amount) VALUES
  ('PO-2024-001', 1, 'Approved', 1000.00, 50.00, 1050.00),
  ('PO-2024-002', 2, 'Pending', 599.98, 30.00, 629.98);

-- Sample PO Items
INSERT INTO po_items (po_id, product_id, quantity, unit_price, line_total) VALUES
  (1, 1, 1, 899.99, 899.99),
  (1, 2, 5, 29.99, 149.95),
  (2, 4, 2, 299.99, 599.98);