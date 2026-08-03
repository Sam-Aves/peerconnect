const express = require("express");
const { protect } = require("../middleware/auth");
const User = require("../models/User");
const Post = require("../models/Post");

const router = express.Router();

// ─── HELPER: build full user response object ─────────────────────────────
// Centralised so GET /me and PATCH /me always return identical shapes.
const buildUserResponse = async (user) => {
  // Compute real post count from the Post collection so it's always accurate
  const postsCount = await Post.countDocuments({ author: user._id });

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    university: user.university,
    district: user.district,
    role: user.role,
    bio: user.bio || "",
    interests: user.interests || [],
    likes: user.likes || [],
    dislikes: user.dislikes || [],
    verified: user.verified,
    isAdmin: user.isAdmin,
    contribution: user.contribution || 0,
    postsCount,                          // ← computed live
    followers: user.followers || 0,
    following: user.following || 0,
    profile_photo: user.profile_photo || "",
    savedPosts: user.savedPosts || [],
  };
};

// ─── GET ALL USERS ───────────────────────────────────────────────────────
router.get("/", protect, async (req, res) => {
  try {
    console.log("📡 GET /api/users called");

    const { search, district, university, role } = req.query;

    const filter = { verified: true };

    if (search && search.trim()) {
      filter.$or = [
        { name:       { $regex: search, $options: "i" } },
        { email:      { $regex: search, $options: "i" } },
        { university: { $regex: search, $options: "i" } },
        { district:   { $regex: search, $options: "i" } },
      ];
    }

    if (district   && district   !== "all") filter.district   = district;
    if (university && university !== "all") filter.university = university;
    if (role       && role       !== "all") filter.role       = role;

    const users = await User.find(filter).select("-password").sort({ name: 1 });

    const allDistricts    = await User.distinct("district",   { verified: true });
    const allUniversities = await User.distinct("university", { verified: true });

    res.json({
      users,
      filters: { districts: allDistricts, universities: allUniversities },
      total: users.length,
    });
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({ message: error.message || "Failed to fetch users", users: [], total: 0 });
  }
});

// ─── GET CURRENT USER (/me) ───────────────────────────────────────────────
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const userData = await buildUserResponse(user);
    res.json({ user: userData });
  } catch (error) {
    console.error("GET /me error:", error);
    res.status(500).json({ message: error.message });
  }
});

// ─── GET ANY USER BY ID ───────────────────────────────────────────────────
router.get("/:id", protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const userData = await buildUserResponse(user);
    res.json({ user: userData });
  } catch (error) {
    console.error("GET /users/:id error:", error);
    res.status(500).json({ message: error.message });
  }
});

// ─── UPDATE CURRENT USER (PATCH /me) ─────────────────────────────────────
router.patch("/me", protect, async (req, res) => {
  try {
    const { name, bio, district, interests, likes, dislikes } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name     !== undefined) user.name     = name.trim();
    if (bio      !== undefined) user.bio      = bio.trim();
    if (district !== undefined) user.district = district.trim();
    if (interests !== undefined) user.interests = interests;
    if (likes     !== undefined) user.likes    = likes;
    if (dislikes  !== undefined) user.dislikes = dislikes;

    await user.save();

    const userData = await buildUserResponse(user);
    res.json({ message: "Profile updated", user: userData });
  } catch (error) {
    console.error("PATCH /me error:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;