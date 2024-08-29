const mongoose = require("mongoose");
const { Schema } = mongoose;

const ServiceSchema = new Schema({
  user:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    require: true,
  },
  time:{
    type: Number,
    required: true,
  }
});
const Service = mongoose.model("service", ServiceSchema);
module.exports = Service;
