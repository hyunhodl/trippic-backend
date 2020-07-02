const mongoose = require("mongoose");

const { Schema } = mongoose;

const placeSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    address: { type: String, required: true },
    location: {
        lat: { type: String, required: true },
        lng: { type: String, required: true },
    },
    creator: { type: String, required: true },
});

module.exports = mongoose.model("Place", placeSchema);
