const express  = require("express");
const router   = express.Router();
const Adoption = require("../models/Adoption");
const Animal   = require("../models/Animal");
const User     = require("../models/User");
const { protect, adminOnly } = require("../middleware/auth");

// POST - Submit adoption form
router.post("/", protect, async (req, res) => {
  try {
    const { animalId, adopterName, address, age, city, state,
            phone, email, childrenInHome, childrenAges, otherAnimals, reason } = req.body;

    if (!age || age < 18)
      return res.status(400).json({ message: "Adopter must be at least 18 years old." });

    const animal = await Animal.findById(animalId);
    if (!animal) return res.status(404).json({ message: "Animal not found." });
    if (animal.isAdopted) return res.status(400).json({ message: "This animal is already adopted." });

    const existing = await Adoption.findOne({ animal: animalId, adopter: req.user._id });
    if (existing) return res.status(400).json({ message: "You have already applied for this animal." });

    const adoption = await Adoption.create({
      animal: animalId, adopter: req.user._id,
      adopterName, address, age, city, state,
      phone, email, childrenInHome, childrenAges, otherAnimals, reason,
    });

    // Mark animal as adopted
    await Animal.findByIdAndUpdate(animalId, { isAdopted: true, adoptedBy: req.user._id });
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { adoptedAnimals: animalId } });

    res.status(201).json({ message: "Adoption form submitted successfully!", adoption });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET - My adoptions
router.get("/my", protect, async (req, res) => {
  try {
    const adoptions = await Adoption.find({ adopter: req.user._id })
      .populate("animal", "name breed category age gender vaccinated image")
      .sort({ createdAt: -1 });
    res.json(adoptions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET - All adoptions (admin)
router.get("/all", protect, adminOnly, async (req, res) => {
  try {
    const adoptions = await Adoption.find()
      .populate("animal", "name breed category image")
      .populate("adopter", "name email")
      .sort({ createdAt: -1 });
    res.json(adoptions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
