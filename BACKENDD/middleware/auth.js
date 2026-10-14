const jwt  = require("jsonwebtoken");
const User = require("../models/User");

// Protect route — user must be logged in
const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized. Please login." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user    = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: "Account deactivated." });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token invalid or expired. Please login again." });
  }
};

// Admin only route
const adminOnly = (req, res, next) => {
  if (req.user?.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Admin access required." });
  }
};

module.exports = { protect, adminOnly };
