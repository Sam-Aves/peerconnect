const User = require("../models/User");

console.log("✅ userController.js loaded!");  // ← যোগ করুন

// ─── GET ALL USERS ───
const getUsers = async (req, res) => {
  try {
    console.log("📡 GET /api/users called");
    
    const { search, district, university, role } = req.query;
    
    const filter = { verified: true };
    
    if (search && search.trim()) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { university: { $regex: search, $options: "i" } },
        { district: { $regex: search, $options: "i" } }
      ];
    }
    
    if (district && district !== "all") filter.district = district;
    if (university && university !== "all") filter.university = university;
    if (role && role !== "all") filter.role = role;

    const users = await User.find(filter)
      .select("-password")
      .sort({ name: 1 });

    const allDistricts = await User.distinct("district", { verified: true });
    const allUniversities = await User.distinct("university", { verified: true });

    res.json({
      users,
      filters: {
        districts: allDistricts,
        universities: allUniversities
      }
    });
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({ message: error.message, users: [] });
  }
};

// ─── GET SINGLE USER ───
const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId)
      .select("-password")
      .populate("savedPosts", "content type category createdAt");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: error.message || "Failed to fetch user" });
  }
};

module.exports = {
  getUsers,
  getUserById
};