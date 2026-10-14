const express = require("express");
const jwt     = require("jsonwebtoken");
const router  = express.Router();
const User    = require("../models/User");
const { protect } = require("../middleware/auth");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, city, state } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "Name, email and password are required." });
    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters." });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Email already registered. Please login." });

    const user = await User.create({ name, email, password, phone, city, state });
    res.status(201).json({
      _id: user._id, name: user.name, email: user.email,
      role: user.role, city: user.city, state: user.state,
      phone: user.phone, token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required." });

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: "Invalid email or password." });

    res.json({
      _id: user._id, name: user.name, email: user.email,
      role: user.role, city: user.city, state: user.state,
      phone: user.phone, token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET ME
router.get("/me", protect, async (req, res) => {
  res.json(req.user);
});

// UPDATE WALLET
router.patch("/wallet", protect, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { walletAddress: req.body.walletAddress },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
