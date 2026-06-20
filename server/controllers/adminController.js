const User = require("../models/User");

// Get all unverified users
const getPendingUsers = async (req, res) => {
  try {
    const users = await User.find({
      verified: false
    }).select("-password");

    res.json(users);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Verify user
const verifyUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    user.verified = true;

    await user.save();

    res.json({
      message: "User verified successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  getPendingUsers,
  verifyUser
};