const express = require("express");
const { protect } = require("../middleware/auth");
const User = require("../models/User");

const router = express.Router();

// ─── GET ALL USERS ───
router.get("/", protect, async (req, res) => {
  try {
    console.log("📡 GET /api/users called");
    
    const { search, district, university, role } = req.query;
    
    // ─── Build filter ───
    const filter = { verified: true };
    
    if (search && search.trim()) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { university: { $regex: search, $options: "i" } },
        { district: { $regex: search, $options: "i" } }
      ];
    }
    
    if (district && district !== "all") {
      filter.district = district;
    }
    
    if (university && university !== "all") {
      filter.university = university;
    }
    
    if (role && role !== "all") {
      filter.role = role;
    }

    // ─── Get users from database ───
    const users = await User.find(filter)
      .select("-password")
      .sort({ name: 1 });

    // ─── Get filter options ───
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
    console.error("❌ Error fetching users:", error);
    res.status(500).json({ 
      message: error.message || "Failed to fetch users",
      users: [],
      total: 0
    });
  }
});

// ─── GET CURRENT USER ───
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── UPDATE USER ───
router.patch("/me", protect, async (req, res) => {
  try {
    const { name, bio, district } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    if (name) user.name = name.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (district) user.district = district.trim();
    
    await user.save();
    
    res.json({
      message: "Profile updated",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        university: user.university,
        district: user.district,
        role: user.role,
        bio: user.bio
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;