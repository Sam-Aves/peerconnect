const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// =======================
// REGISTER
// =======================

const registerUser = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILES:", req.files);
    const { name, university, district, role, email, password } = req.body;

    if (!name || !university || !district || !role || !email || !password) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    const existing = await User.findOne({ email });

    if (existing) {
      return res.status(400).json({
        message: "Email already registered"
      });
    }

   // Uploaded files
    const profilePhoto =
      req.files?.profile_photo?.[0]
        ? `uploads/${req.files.profile_photo[0].filename}`
        : "";

    const idCardPhoto =
      req.files?.id_card_photo?.[0]
        ? `uploads/${req.files.id_card_photo[0].filename}`
        : "";

    console.log("Uploaded Files:", req.files);

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      university,
      district,
      role,
      email,
      password: hashedPassword,

      profile_photo: profilePhoto,
      id_card_photo: idCardPhoto,

      verified: false
    });

    res.status(201).json({
      message: "Registration successful. Pending admin verification.",
      user: {
        id: user._id,
        name: user.name,
        university: user.university,
        district: user.district,
        role: user.role,
        email: user.email,
        profile_photo: user.profile_photo,
        id_card_photo: user.id_card_photo,
        verified: user.verified
      }
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};

// =======================
// LOGIN
// =======================

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    if (!user.verified && !user.isAdmin) {
    return res.status(403).json({
      message: "Account pending admin verification"
    });
}

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        isAdmin: user.isAdmin
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAdmin: user.isAdmin,
        profile_photo: user.profile_photo,
        id_card_photo: user.id_card_photo
      }
    });

  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};

module.exports = {
  registerUser,
  loginUser
};