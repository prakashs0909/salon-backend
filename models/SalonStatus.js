const mongoose = require("mongoose");

const SalonSchema = new mongoose.Schema({
  isSalonOpen: {
    type: Boolean,
    required: true,
    default: true,
  },
  closedDates: {
    type: [String], // Array of dates in "YYYY-MM-DD" format
    default: [],
  },
});

module.exports = mongoose.model("SalonStatus", SalonSchema);