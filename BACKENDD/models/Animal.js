const mongoose = require("mongoose");

const animalSchema = new mongoose.Schema(
  {
    name:           { type: String, required: true, trim: true },
    category:       { type: String, enum: ["cat", "dog", "other"], required: true },
    breed:          { type: String, required: true, trim: true },
    age:            { type: Number, required: true, min: 0 },
    gender:         { type: String, enum: ["male", "female"], required: true },
    vaccinated:     { type: Boolean, default: false },
    isAdopted:      { type: Boolean, default: false },
    image:          { type: String, required: true },
    description:    { type: String, trim: true },
    weight:         { type: String },
    color:          { type: String },
    healthStatus:   { type: String, default: "Healthy" },
    specialNeeds:   { type: String },
    shelterLocation:{ type: String },
    ngoSource:      { type: String },  // backend only - user never sees this
    blockchainTxHash: { type: String },
    adoptedBy:      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    adoptedAt:      { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Animal", animalSchema);
