const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("DB error:", err));

const User = require("./models/User");

app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find({ verified: true }).select("-password");
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(5001, () => {
  console.log("Test server running on port 5001");
});