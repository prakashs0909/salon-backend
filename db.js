const mongoose = require('mongoose');
require('dotenv').config()
const mongoURI = process.env.MONGO_URL;

const connectToMongo = ()=>{
    mongoose.connect(mongoURI)
    console.log("connected");
}

module.exports = connectToMongo;