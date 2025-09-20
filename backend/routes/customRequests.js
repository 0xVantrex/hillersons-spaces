const express = require("express");
const Request = require("../models/request");

const router = express.Router();

router.post("/custom-design", async (req, res) => {
  try {
    const newRequest = new Request(req.body);
    await newRequest.save();
    res.json({ success: true, message: "Request submitted successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
