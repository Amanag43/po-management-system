const mongoose = require('mongoose');

const connectMongo = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Mongo Atlas connected');
    }
    catch (err) {
        console.error('Mongo connection failed', err.message);
    }
};

module.exports =  connectMongo ;
