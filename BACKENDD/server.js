const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const express      = require("express");
const cors         = require("cors");
const dotenv       = require("dotenv");
const path         = require("path");
const connectDB    = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin:      process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth",      require("./routes/auth"));
app.use("/api/animals",   require("./routes/animals"));
app.use("/api/adoptions", require("./routes/adoptions"));
app.use("/api/donation",  require("./routes/donation"));

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "TailsChain Backend is Running 🐾", time: new Date().toISOString() });
});

app.use((req, res) => res.status(404).json({ message: `Route ${req.originalUrl} not found` }));
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 TailsChain Server running on http://localhost:${PORT}`);
  console.log(`📋 Health: http://localhost:${PORT}/api/health\n`);
});
