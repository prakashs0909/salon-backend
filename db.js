const mongoose = require("mongoose");
require("dotenv").config();
const mongoURI = process.env.MONGO_URL;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectToMongo = async () => {
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    const opts = { bufferCommands: false };
    cached.promise = mongoose.connect(mongoURI, opts).then((mongoose) => {
      console.log("connected to mongo successfully");
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.promise;
};

module.exports = connectToMongo;
