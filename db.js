const mongoose = require('mongoose');
require('dotenv').config()
const mongoURI = process.env.MONGO_URL;

const connectToMongo = ()=>{
    mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => console.log("Connected to MongoDB successfully"))
        .catch((error) => {
            console.error("Error connecting to MongoDB:", error);
            process.exit(1); // Exit the process if the database connection fails
        });
}

module.exports = connectToMongo;