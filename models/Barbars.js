const mongoose = require("mongoose");
const { Schema } = mongoose;

const BarbarsSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    name: {
        type: String,
        required: true,
    }
    });
const Barbars = mongoose.model("barbars", BarbarsSchema);
module.exports = Barbars;