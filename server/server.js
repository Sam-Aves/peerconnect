const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/database");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    status: "Server is running",
    time: new Date()
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});