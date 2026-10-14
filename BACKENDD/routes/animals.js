const express  = require("express");
const router   = express.Router();
const Animal   = require("../models/Animal");
const mongoose = require("mongoose");
const { protect, adminOnly } = require("../middleware/auth");

// GET all animals
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {};
    if (category && category !== "all") filter.category = category;
    const animals = await Animal.find(filter).sort({ createdAt: -1 });
    res.json(animals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single animal
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid animal ID." });
    }

    const animal = await Animal.findById(id);
    if (!animal) return res.status(404).json({ message: "Animal not found." });
    res.json(animal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST add animal (admin)
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const animal = await Animal.create(req.body);
    res.status(201).json(animal);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update animal (admin)
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const animal = await Animal.findByIdAndUpdate(
      req.params.id, req.body, { new: true }
    );
    if (!animal) return res.status(404).json({ message: "Animal not found." });
    res.json(animal);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE animal (admin)
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const animal = await Animal.findByIdAndDelete(req.params.id);
    if (!animal) return res.status(404).json({ message: "Animal not found." });
    res.json({ message: "Animal removed." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
