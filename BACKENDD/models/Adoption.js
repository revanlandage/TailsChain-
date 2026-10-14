const mongoose = require("mongoose");

const adoptionSchema = new mongoose.Schema(
  {
    animal:   { type: mongoose.Schema.Types.ObjectId, ref: "Animal", required: true },
    adopter:  { type: mongoose.Schema.Types.ObjectId, ref: "User",   required: true },

    // Adoption form fields
    adopterName:    { type: String, required: true },
    address:        { type: String, required: true },
    age:            { type: Number, required: true, min: 18 },
    city:           { type: String, required: true },
    state:          { type: String, required: true },
    phone:          { type: String, required: true },
    email:          { type: String, required: true },
    childrenInHome: { type: String },
    childrenAges:   { type: String },
    otherAnimals:   { type: String, enum: ["yes", "no"], required: true },
    reason:         { type: String, required: true },

    // Status
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },

    // Blockchain info
    blockchainTxHash:  { type: String },
    walletAddress:     { type: String },
    transactionAmount: { type: String },
    blockNumber:       { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Adoption", adoptionSchema);
