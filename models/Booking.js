const mongoose = require("mongoose");
const { Schema } = mongoose;

const BookingSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  name: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    min: "1987-09-28",
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  service: {
    type: [String],
    required: true,
  },
  status: { 
    type: String,
    default: "pending" 
  },
  canceled: { 
    type: Boolean, 
    default: false
   },
});
const Booking = mongoose.model("booking", BookingSchema);
module.exports = Booking;
