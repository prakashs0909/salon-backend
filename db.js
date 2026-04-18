const mongoose = require('mongoose');
require('dotenv').config()
const mongoURI = process.env.MONGO_URL;

const connectToMongo = async () => {
    try {
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
        });
        console.log("Connected to MongoDB successfully");
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error.message);
    }
};

module.exports = connectToMongo;