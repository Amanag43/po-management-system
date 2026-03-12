require('express-async-errors');
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const vendorRouter = require('./routers/vendors');
const poRouter = require('./routers/purchaseOrders');
const productRoutes = require('./routers/products');
const authRoutes = require('./routers/auth');
const aiRoutes = require('./routers/ai');

const {sequelize} = require('./config/database');
const connectMongo = require('./config/mongo');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/api/vendors', vendorRouter);
app.use('/api/purchase-orders', poRouter);
app.use('/api/products', productRoutes);
app.use('/auth', authRoutes);
app.use('/api/ai', aiRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'PO Management System API is running' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'An unexpected error occurred' });
});

const PORT = process.env.PORT || 5000;

    app.listen(PORT, async () => {
        console.log(`Server is running on port ${PORT}`);
        try {
            await sequelize.authenticate();
            console.log('PostgreSQL successfully connected!.');
        } catch (error) {
            console.error('Unable to connect to the database:', error.message);
        }   

        connectMongo();
    });

    