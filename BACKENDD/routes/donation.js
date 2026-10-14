const express   = require("express");
const router    = express.Router();
const Razorpay  = require("razorpay");
const crypto    = require("crypto");

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ===== CREATE DONATION ORDER =====
// POST /api/donation/create-order
router.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body; // amount in rupees

    if (!amount || amount < 1) {
      return res.status(400).json({ message: "Minimum donation is ₹1" });
    }

    const order = await razorpay.orders.create({
      amount:   amount * 100, // Razorpay works in paise
      currency: "INR",
      receipt:  `donation_${Date.now()}`,
      notes: {
        purpose: "TailsChain Animal Adoption Platform Donation",
      },
    });

    res.json({
      orderId:  order.id,
      amount:   order.amount,
      currency: order.currency,
      keyId:    process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===== VERIFY PAYMENT =====
// POST /api/donation/verify
router.post("/verify", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Verify signature
    const body      = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      res.json({
        success: true,
        message: "Payment verified! Thank you for your donation 🐾",
        paymentId: razorpay_payment_id,
      });
    } else {
      res.status(400).json({ success: false, message: "Payment verification failed" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
