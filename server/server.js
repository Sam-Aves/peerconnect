const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/database");
const User = require("./models/User");

const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const postRoutes = require("./routes/posts");
const userRoutes = require("./routes/users");
const notificationRoutes = require("./routes/notifications");

const app = express();

connectDB();

app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());

// ─── Test Routes ───
app.get("/", (req, res) => res.json({ message: "PeerConnect API" }));
app.get("/api/test", (req, res) => res.json({ message: "Test OK" }));
app.get("/api/health", (req, res) => res.json({ status: "Healthy" }));

// ─── USERS ROUTE with Filters ───
app.get("/api/users", async (req, res) => {
  console.log("📡 /api/users called with query:", req.query);
  
  try {
    const { search, district, university, role } = req.query;
    const filter = { verified: true };
    
    if (search && search.trim()) {
      const s = search.trim();
      filter.$or = [
        { name: { $regex: s, $options: "i" } },
        { email: { $regex: s, $options: "i" } },
        { university: { $regex: s, $options: "i" } },
        { district: { $regex: s, $options: "i" } }
      ];
    }
    
    if (district && district !== "all") filter.district = district;
    if (university && university !== "all") filter.university = university;
    if (role && role !== "all") filter.role = role;

    console.log("🔍 Final Filter:", JSON.stringify(filter, null, 2));

    const users = await User.find(filter).select("-password").sort({ name: 1 });
    console.log(`✅ Found ${users.length} users`);

    const allDistricts = await User.distinct("district", { verified: true });
    const allUniversities = await User.distinct("university", { verified: true });

    res.json({
      users,
      filters: {
        districts: allDistricts,
        universities: allUniversities
      },
      total: users.length
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ 
      error: error.message,
      users: [],
      filters: { districts: [], universities: [] },
      total: 0
    });
  }
});

// ─── Main Routes ───
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);


// ─── 404 Handler ───
app.use((req, res) => {
  console.log(`❌ 404: ${req.method} ${req.url}`);
  res.status(404).json({ message: "Route not found", path: req.url });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📍 http://localhost:${PORT}/api/users`);
});