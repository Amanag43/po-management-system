require('express-async-errors');
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const passport = require('passport');
require('./config/passport'); // Import passport configuration
const path = require('path');
// Import routes
const vendorRoutes = require('./routes/vendors');
const productRoutes = require('./routes/products');
const poRoutes = require('./routes/purchaseOrders');
const authRoutes = require('./routes/auth');
const aiRoutes = require('./routes/ai');

// Import database
const { sequelize } = require('./config/database');
const connectMongo = require('./config/mongo');

// ← ADD THIS LINE: imports all models and registers associations
const models = require('./models');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(express.static(path.join(__dirname, '../frontend')));


// Routes
app.use('/api/vendors', vendorRoutes);
app.use('/api/products', productRoutes);
app.use('/api/purchase-orders', poRoutes);
app.use('/auth', authRoutes);
app.use('/api/ai', aiRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'PO Management API is running!' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.status || 500;
  res.status(statusCode).json({
     success: false,
     error: err.message || 'Server Error'});
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);

  try {
    await sequelize.authenticate();
    console.log('PostgreSQL connected!');

    // sync({ alter: true }) checks existing tables
    // and adjusts them to match your models
    // USE ONLY IN DEVELOPMENT - never in production
    await sequelize.sync({ alter: true });
    console.log('Models synchronized!');

  } catch (err) {
    console.error('Database error:', err.message);
  }

  connectMongo();
});